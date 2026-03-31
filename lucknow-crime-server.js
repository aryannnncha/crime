require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

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
