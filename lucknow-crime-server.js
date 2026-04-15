require("dotenv").config();

const path = require("path");
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cron = require("node-cron");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function readJson(file, fallback) {
  try {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  const p = path.join(DATA_DIR, file);
  const tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, p);
}

function appendLog(line) {
  const p = path.join(DATA_DIR, "sync.log");
  const stamp = new Date().toISOString();
  fs.appendFileSync(p, `[${stamp}] ${line}\n`, "utf8");
}

function getEncKey() {
  const raw = process.env.REPORT_ENC_KEY || "";
  if (!raw) return null;
  // Accept base64 (preferred) or any string (hashed to 32 bytes).
  try {
    const b = Buffer.from(raw, "base64");
    if (b.length === 32) return b;
  } catch {}
  return crypto.createHash("sha256").update(raw).digest();
}

function encryptIfPossible(obj) {
  const key = getEncKey();
  if (!key) return { enc: false, data: obj };
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    enc: true,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: ciphertext.toString("base64"),
  };
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const safe = String(file.originalname || "file").replace(/[^a-z0-9._-]/gi, "_");
      cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}_${safe}`);
    },
  }),
  limits: {
    files: 5,
    fileSize: 15 * 1024 * 1024, // 15MB each
  },
});

/** Claude Messages API -> Gemini generateContent contents */
function toGeminiContents(system, messages) {
  const contents = [];
  for (const m of messages || []) {
    const text = typeof m.content === "string" ? m.content : "";
    const role = m.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text }] });
  }
  return {
    systemInstruction: system
      ? { parts: [{ text: String(system) }] }
      : undefined,
    contents,
  };
}

async function chatGemini(system, messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 500, reply: "Server missing GEMINI_API_KEY." };
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro";
  const { systemInstruction, contents } = toGeminiContents(system, messages);
  const body = {
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await upstream.json();
  if (!upstream.ok) {
    const msg =
      data?.error?.message ||
      data?.error?.status ||
      "Gemini request failed.";
    return { ok: false, status: upstream.status, reply: msg };
  }
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  const reply = text.trim() || "No response.";
  return { ok: true, reply };
}

async function chatAnthropic(system, messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 500, reply: "Server missing ANTHROPIC_API_KEY." };
  }
  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 700,
      system,
      messages,
    }),
  });
  const data = await upstream.json();
  if (!upstream.ok) {
    return {
      ok: false,
      status: upstream.status,
      reply: data?.error?.message || "Claude request failed.",
    };
  }
  const reply = data?.content?.[0]?.text || "No response.";
  return { ok: true, reply };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ---------- User Reports (public submissions) ----------
app.get("/api/reports", (_req, res) => {
  const db = readJson("reports.json", { reports: [] });
  res.json({ ok: true, reports: db.reports || [] });
});

app.post("/api/reports", upload.array("evidence", 5), (req, res) => {
  try {
    const now = new Date().toISOString();
    const {
      category,
      subcategory,
      severity,
      description,
      anonymous,
      city,
      area,
      lat,
      lng,
      occurredAt,
      reporterContact,
    } = req.body || {};

    if (!category || !subcategory || !severity) {
      return res.status(400).json({ ok: false, error: "Missing category/subcategory/severity." });
    }

    const files = (req.files || []).map((f) => ({
      originalName: f.originalname,
      mime: f.mimetype,
      size: f.size,
      path: `/uploads/${path.basename(f.path)}`,
    }));

    const report = {
      id: "r_" + Date.now().toString(36) + "_" + Math.random().toString(16).slice(2),
      createdAt: now,
      category: String(category),
      subcategory: String(subcategory),
      severity: String(severity),
      description: String(description || ""),
      anonymous: String(anonymous) === "true" || anonymous === true,
      occurredAt: occurredAt ? String(occurredAt) : now,
      location: {
        city: city ? String(city) : null,
        area: area ? String(area) : null,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
      },
      evidence: files,
      reporter: null,
      status: "received",
    };

    if (!report.anonymous && reporterContact) {
      report.reporter = encryptIfPossible({ contact: String(reporterContact) });
    }

    const db = readJson("reports.json", { reports: [] });
    db.reports = Array.isArray(db.reports) ? db.reports : [];
    db.reports.unshift(report);
    writeJson("reports.json", db);

    res.json({ ok: true, reportId: report.id });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to store report." });
  }
});

// ---------- Basic Analytics ----------
app.get("/api/analytics/summary", (_req, res) => {
  const db = readJson("reports.json", { reports: [] });
  const reports = Array.isArray(db.reports) ? db.reports : [];
  const byCategory = {};
  const bySeverity = {};
  for (const r of reports) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
  }
  res.json({ ok: true, totalReports: reports.length, byCategory, bySeverity });
});

// ---------- UP Police (official) sync ----------
async function fetchHtml(url) {
  const r = await fetch(url, {
    headers: {
      "user-agent": "PublicSafetySyncBot/1.0 (+local dev)",
      "accept": "text/html,application/xhtml+xml",
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return await r.text();
}

function extractNoticesFromHtml(html, baseUrl) {
  const $ = cheerio.load(html);
  const items = [];
  $("a").each((_, a) => {
    const text = $(a).text().trim().replace(/\s+/g, " ");
    const href = $(a).attr("href");
    if (!href) return;
    if (!text) return;
    const lower = text.toLowerCase();
    const looksLikeNotice =
      lower.includes("notice") ||
      lower.includes("alert") ||
      lower.includes("advis") ||
      lower.includes("press") ||
      lower.includes("public") ||
      lower.includes("circular");
    if (!looksLikeNotice) return;
    let url;
    try {
      url = new URL(href, baseUrl).toString();
    } catch {
      return;
    }
    items.push({ title: text.slice(0, 140), url });
  });
  // de-dupe
  const seen = new Set();
  return items.filter((i) => {
    const k = i.url;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 50);
}

async function syncUpPolice() {
  const targets = [
    "https://uppolice.gov.in/",
    "https://uppolice.gov.in/article/en/alerts",
    "https://uppolice.gov.in/article/en/press-release",
  ];

  const startedAt = new Date().toISOString();
  appendLog(`UP Police sync start`);

  const allItems = [];
  const errors = [];

  for (const url of targets) {
    try {
      const html = await fetchHtml(url);
      const items = extractNoticesFromHtml(html, url);
      allItems.push(...items.map((i) => ({ ...i, source: url })));
    } catch (e) {
      errors.push({ url, error: e?.message || String(e) });
    }
  }

  const seen = new Set();
  const merged = [];
  for (const it of allItems) {
    const k = it.url;
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(it);
  }

  const payload = {
    ok: errors.length === 0,
    lastSyncAt: startedAt,
    sources: targets,
    errors,
    notices: merged.slice(0, 50),
  };

  writeJson("up-police.json", payload);
  appendLog(`UP Police sync done: notices=${payload.notices.length} errors=${errors.length}`);
  return payload;
}

app.get("/api/official/up-police", (_req, res) => {
  const data = readJson("up-police.json", { ok: false, lastSyncAt: null, notices: [], errors: [], sources: [] });
  res.json({ ok: true, data });
});

app.post("/api/admin/sync-up-police", async (_req, res) => {
  try {
    const out = await syncUpPolice();
    res.json({ ok: true, data: out });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Sync failed." });
  }
});

function scheduleUpPoliceSync() {
  // Every day at 03:30, but only runs if last sync is older than 15 days.
  cron.schedule("30 3 * * *", async () => {
    try {
      const data = readJson("up-police.json", { lastSyncAt: null });
      const last = data.lastSyncAt ? new Date(data.lastSyncAt).getTime() : 0;
      const ageMs = Date.now() - last;
      const fifteenDays = 15 * 24 * 60 * 60 * 1000;
      if (ageMs < fifteenDays) return;
      await syncUpPolice();
    } catch (e) {
      appendLog(`UP Police scheduled sync error: ${e?.message || String(e)}`);
    }
  });
}

// Serve uploads
app.use("/uploads", express.static(UPLOADS_DIR));

app.post("/api/chat", async (req, res) => {
  try {
    const { system, messages } = req.body || {};
    const prefer =
      process.env.CHAT_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "anthropic");

    let result;
    if (prefer === "gemini") {
      result = await chatGemini(system, messages);
      if (!result.ok && process.env.ANTHROPIC_API_KEY) {
        result = await chatAnthropic(system, messages);
      }
    } else {
      result = await chatAnthropic(system, messages);
      if (!result.ok && process.env.GEMINI_API_KEY) {
        result = await chatGemini(system, messages);
      }
    }

    if (!result.ok) {
      return res.status(result.status || 500).json({ reply: result.reply });
    }
    res.json({ reply: result.reply });
  } catch (err) {
    res.status(500).json({ reply: "Server error." });
  }
});

const startPort = Number(process.env.PORT) || 3000;
const maxPort = startPort + 15;

const server = http.createServer(app);
let listenPort = startPort;

function onListening() {
  console.log(`Lucknow map server: http://localhost:${listenPort}/lucknow-crime-map.html`);
  console.log(`Health check: http://localhost:${listenPort}/api/health`);
  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.warn(
      "Set GEMINI_API_KEY (or ANTHROPIC_API_KEY) before npm start so chat replies work."
    );
  }
}

function attemptListen(port) {
  listenPort = port;
  server.removeAllListeners("listening");
  server.removeAllListeners("error");
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && port < maxPort) {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      attemptListen(port + 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
  server.once("listening", onListening);
  server.listen(port);
}

attemptListen(startPort);

scheduleUpPoliceSync();
