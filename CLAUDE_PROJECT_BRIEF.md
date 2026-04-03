# Lucknow Crime Intelligence Map: Aim and Technical Brief

## 1. Project Aim

The aim of this project is to build a city-level crime awareness and personal safety web application focused primarily on Lucknow, with support for other Uttar Pradesh cities such as Kanpur, Varanasi, and Prayagraj.

This is not a police investigation system and not a real-time FIR tracking platform. Its purpose is:

- to visually communicate crime-prone zones in an understandable map interface
- to help users explore crime patterns by area, crime category, and time of day
- to provide a personal safety mode that reacts when a user moves near high-risk zones
- to combine official macro-level crime statistics with illustrative local map visualization
- to serve as a prototype for public awareness, academic demonstration, hackathon presentation, or future smart-city safety tooling

In simple terms, the product tries to answer:

"How can a user quickly understand which parts of a city appear more risky, what type of crime is common there, and get a basic safety alert if they enter a dangerous zone?"

## 2. Core Problem Being Solved

People usually do not consume crime data in a practical visual format. Official reports are large, static, and difficult for ordinary users to interpret spatially. This project converts crime information into an interactive map-based experience so that users can:

- see density-based crime hotspots
- inspect incident categories
- compare risk between different areas
- filter by day or night
- use a safety workflow based on location tracking and geofence alerts

The larger goal is awareness and prevention, not surveillance or law-enforcement decision automation.

## 3. Important Clarification About the Data

This project mixes two different data layers:

### A. Official statistical layer
The file `crime-data.json` stores NCRB 2023 metropolitan crime statistics and source metadata. These are city-level headline figures, not exact incident coordinates.

Examples include:

- murder cases
- rape cases
- kidnapping and abduction cases
- acid attack cases
- death by negligence cases

These values are used for credibility, context, and top-level statistical grounding.

### B. Illustrative map layer
The actual points rendered on the map in `lucknow-crime-map.html` are hardcoded demo/illustrative cluster points. These are not real FIR latitude-longitude records and should not be presented as exact police evidence.

This is a critical design principle:

- official data gives legitimacy and macro context
- illustrative coordinates give a usable spatial demo experience

So the app is a crime-awareness visualization prototype, not a forensic truth system.

## 4. Current Product Scope

The current implementation is a single-page front-end map application with a lightweight Node/Express backend.

### Frontend responsibilities

- render the interactive Leaflet map
- draw crime markers and a heat layer
- filter by crime type and time of day
- switch between supported cities
- show incident popups and risk labels
- load NCRB statistics from JSON
- track the user’s location
- run Safe Mode geofence logic
- trigger countdown and emergency actions
- support responsive mobile behavior

### Backend responsibilities

- serve static project files
- expose a health endpoint
- provide a chat proxy endpoint at `/api/chat`
- forward chat requests to Gemini or Claude depending on available API keys

## 5. Technical Stack

### Frontend

- HTML
- CSS
- Vanilla JavaScript
- Leaflet.js for map rendering
- `leaflet-heat` for heatmap overlays
- browser geolocation API
- `fetch()` for JSON loading and reverse geocoding
- `localStorage` for Safe Mode contacts persistence

### Backend

- Node.js
- Express
- CORS
- dotenv

### External services used

- OpenStreetMap tiles through Leaflet
- Nominatim reverse geocoding API for converting coordinates to readable location text
- Anthropic Messages API for Claude chat
- Google Gemini API for Gemini chat fallback or primary provider

## 6. Main Files and Their Roles

### `lucknow-crime-map.html`

This is the main application file. It contains:

- page structure
- complete styling
- hardcoded crime point data
- map initialization
- filters
- city switching logic
- heatmap creation
- marker creation
- risk-zone definitions
- geolocation features
- Safe Mode workflow
- mobile sidebar behavior

This file currently holds almost all front-end logic in one place.

### `crime-data.json`

Stores:

- NCRB 2023 city statistics
- source references
- map center and zoom settings for supported cities

### `lucknow-crime-server.js`

Responsible for:

- static file serving
- `/api/health`
- `/api/chat`
- model provider selection between Gemini and Claude
- automatic port fallback if the default port is busy

### `package.json`

Contains the Node project metadata and the `npm start` command.

## 7. Frontend Functional Design

### 7.1 Map initialization

The map is initialized with Leaflet and centered on Lucknow by default.

Current default:

- center: `26.8467, 80.9462`
- zoom: `13`

The app can later re-center based on selected city.

### 7.2 Crime incident dataset

The frontend contains a hardcoded array named `crimes`. Each item represents an illustrative incident/cluster entry with fields like:

- `city`
- `lat`
- `lng`
- `area`
- `type`
- `sev`
- `hour`
- `tags`

Interpretation:

- `type` is crime category such as theft, robbery, assault, fraud
- `sev` is a severity/risk weight between low and high
- `hour` helps determine whether the event belongs to day or night filter logic
- `tags` provide descriptive labels for popup display

### 7.3 Filtering system

The app has two main filter dimensions:

- crime type filter
- time filter

Crime type filter options currently include:

- all
- theft
- robbery
- assault

Time filter options:

- all
- day
- night

The filtered set is produced by checking:

- current city
- active crime type
- whether the incident hour belongs to the selected time window

### 7.4 Heatmap layer

The heatmap is generated from filtered crime data using:

- latitude
- longitude
- severity value

This produces density-style awareness zones rather than exact legal reporting locations.

### 7.5 Marker layer

Each filtered crime point is also displayed as a styled marker with:

- type-based color
- size tied to severity
- glow effect
- popup card with area, crime type, and risk label

Risk labels are computed from severity bands:

- low
- moderate
- high
- critical

### 7.6 City switching

The app supports multiple cities and switches:

- map center
- map zoom
- city-specific risk zones
- city-specific statistics from JSON
- visible crime points by `city`

Currently supported in data/config:

- Lucknow
- Kanpur
- Varanasi
- Prayagraj

## 8. Risk Zone System

The project defines separate high-level risk zones for each supported city. These are not dynamically generated from live official GIS data. They are manually defined reference zones used for awareness and Safe Mode logic.

Each risk zone contains data such as:

- area name
- latitude
- longitude
- risk band

Risk bands include:

- `lo`
- `mo`
- `hi`
- `cr`

These are mapped to visible labels:

- LOW
- MODERATE
- HIGH
- CRITICAL

These zones are central to the personal safety workflow because Safe Mode checks whether the user has entered a dangerous zone.

## 9. Safe Mode: Functional Aim

Safe Mode is the most important user-safety feature in the current prototype.

Its purpose is:

- to monitor the user’s live location
- to detect when the user moves into a high-risk or critical zone
- to warn the user before escalation
- to support emergency outreach through stored contacts

This makes the project more than a passive visualization dashboard. It adds a preventive, user-centered safety workflow.

## 10. Safe Mode: Technical Workflow

### 10.1 Contact storage

Emergency contacts are stored in browser `localStorage` under:

- `safemode_contacts`

Users can add contact names and phone numbers from the UI.

### 10.2 Safe Mode state machine

The Safe Mode logic uses a state progression:

- `off`
- `watching`
- `countdown`
- `alert`

Meaning:

- `off`: Safe Mode disabled
- `watching`: location tracking active and waiting for danger entry
- `countdown`: user entered a dangerous area and is given a short time window
- `alert`: emergency action stage after countdown finishes

### 10.3 Live geolocation

The browser geolocation API is used to:

- fetch current position once
- optionally watch location continuously
- track accuracy
- update a live marker on the map

### 10.4 Reverse geocoding

The app calls OpenStreetMap Nominatim reverse geocoding to turn latitude and longitude into a readable address label for display.

### 10.5 Geofence detection

When Safe Mode is in `watching` state, the function checks nearby high-risk zones:

- only `hi` and `cr` zones are considered dangerous
- the distance threshold is about `300 meters`

Distance is calculated with a geographic distance formula using latitude and longitude.

If the user enters the radius of a dangerous zone:

- the countdown is triggered
- UI changes to warning mode
- the danger zone name is shown

### 10.6 Countdown and escalation

If the user does not cancel the alert during countdown:

- Safe Mode escalates to the alert state
- an emergency message is prepared
- the message includes a Google Maps location link using the latest coordinates

### 10.7 Emergency communication behavior

The current prototype supports:

- constructing an emergency help message
- opening a WhatsApp deep link for the first stored contact

This means the app does not yet directly send SMS or use a backend emergency dispatch service. It relies on user-side communication flow.

## 11. Chat/AI Backend Aim

The backend includes a chat endpoint that can connect the application to an LLM assistant.

Purpose:

- answer user questions inside the app
- explain crime awareness insights
- support future guided safety or educational interactions

### Current implementation details

Endpoint:

- `POST /api/chat`

Provider logic:

- prefers Gemini if `CHAT_PROVIDER=gemini` or Gemini key exists
- otherwise uses Claude
- falls back to the alternate provider if the first fails

Environment variables:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `ANTHROPIC_API_KEY`
- `CHAT_PROVIDER`
- `PORT`

### Important architectural point

The frontend map itself is not generated by AI. AI is an auxiliary assistant layer, while the map, filters, Safe Mode, and crime visualization logic are deterministic front-end code.

## 12. Intended User Experience

The intended user flow is:

1. Open the map and inspect the city overview.
2. View hotspot intensity through the heatmap.
3. Filter by theft, robbery, assault, day, or night.
4. Tap markers to inspect local risk details.
5. Switch between supported cities.
6. Enable live location.
7. Activate Safe Mode.
8. Receive warning when entering a high-risk zone.
9. Cancel if safe, or escalate to emergency outreach.

The design goal is fast comprehension, low friction, and mobile usability.

## 13. Current Limitations

Claude should understand these limitations clearly:

- map coordinates are illustrative, not official FIR-level geospatial records
- there is no authenticated user system
- there is no database
- there is no admin panel
- there is no live police API integration
- there is no direct SMS gateway or emergency services integration
- Safe Mode is client-side only
- most front-end logic is concentrated in a single HTML file
- risk zones are manually defined, not machine-learned
- city support is limited and not yet generalized

## 14. Technical Improvement Opportunities

If Claude is asked to improve the project, these are the most valuable directions:

### Architecture improvements

- split the monolithic HTML file into separate HTML, CSS, and JavaScript modules
- move hardcoded crime points and risk zones into structured JSON files
- create reusable functions or modules for map layers, filters, Safe Mode, and geolocation
- introduce a cleaner state-management pattern

### Data improvements

- support external datasets
- normalize city, crime type, and severity schemas
- add timestamps, source types, and confidence fields
- separate official stats from demo visualization data more explicitly

### Safety improvements

- integrate SMS or emergency APIs
- support multiple alert channels
- add trusted contact confirmation flow
- improve geofence logic and user consent UX

### UI/UX improvements

- improve accessibility
- add legends, onboarding, and clearer disclaimers
- optimize mobile layout further
- allow toggling heatmap, markers, and Safe Mode overlays independently

### Analytics improvements

- add trend summaries
- compare day versus night distribution
- show city-level stat cards more clearly
- support timeline or temporal playback

## 15. What Claude Should Assume About This Project

Claude should assume:

- this is a prototype or MVP
- the project is focused on awareness, safety assistance, and visualization
- the system must not misrepresent demo points as exact police evidence
- the app should remain understandable to normal users, not only technical users
- privacy and safety messaging matter
- future work should preserve the core purpose: public-facing crime awareness plus personal safety support

## 16. Short One-Paragraph Summary for Claude

This project is a web-based crime awareness and personal safety prototype centered on Lucknow and a few other UP cities. It uses a Leaflet map with illustrative crime cluster points, heatmaps, city switching, type/time filters, manually defined risk zones, and a Safe Mode that watches the user’s geolocation and triggers a countdown alert when entering high-risk areas. Official NCRB 2023 city-level statistics are included for context, but the map coordinates are not exact FIR locations. The backend is a lightweight Express server that serves static files and exposes a chat endpoint capable of using Gemini or Claude. The main technical goal is to evolve this MVP into a cleaner, more modular, more credible, and more useful crime-visualization and safety-assistance application.

## 17. Direct Prompt You Can Give to Claude

Use this prompt if you want Claude to help continue the project:

```text
I am building a web application called "Lucknow Crime Intelligence Map". Its purpose is to create a crime-awareness and personal-safety platform for Lucknow and other UP cities. The frontend is currently a single HTML file using Leaflet, leaflet-heat, vanilla JavaScript, browser geolocation, localStorage, and fetch-based JSON loading. The backend is a Node.js + Express server that serves static files and exposes /api/chat for Gemini/Claude integration.

Important: the map points are illustrative demo crime clusters, not exact FIR coordinates. Official NCRB 2023 city-level statistics are included through crime-data.json only for macro-level context and credibility.

The app currently supports:
- heatmap and marker visualization
- crime type and day/night filtering
- multi-city support
- risk zones with LOW/MODERATE/HIGH/CRITICAL bands
- Safe Mode that tracks user location, checks whether the user enters a high-risk zone within about 300m, starts a countdown, and then prepares emergency outreach through a WhatsApp link to saved contacts

I want you to understand the project as an MVP focused on public awareness, map-based risk visualization, and personal safety support. Please help me improve the project in a technically sound way without changing its core purpose. When suggesting changes, keep in mind:
- do not treat demo points as real police coordinates
- keep the app understandable for normal users
- improve code structure, reliability, and UX
- prefer modularization, data separation, and clear safety/privacy messaging

First, analyze the likely weaknesses in the current architecture and propose the best next-step improvements in priority order.
```
