# BOTEC — System Design Calculator

[![CI/CD](https://github.com/douglasmiguel/system-design/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/douglasmiguel/system-design/actions/workflows/deploy-production.yml)

BOTEC is a browser-based, back-of-the-envelope calculator for early system
design estimates. It turns a small set of traffic and capacity assumptions into
an inspectable snapshot of request load, peak throughput, server requirements,
network transfer, bandwidth, and optional storage growth.

Use the live calculator at
[system-design.douglasmiguel.com.br](https://system-design.douglasmiguel.com.br/).

## Features

- Estimate daily requests, average RPS, and peak RPS.
- Calculate server requirements from capacity and target utilization.
- Estimate daily transfer and peak bandwidth from request/response payloads.
- Model retained storage, replication, and monthly growth.
- Review useful orders of magnitude and interview guidance.
- Download a system-design cheat sheet and reusable Excalidraw component library.
- Inspect every calculation directly in the browser; no data is sent to a backend.

## Technology

- Semantic HTML
- Vanilla JavaScript
- Tailwind CSS 4
- GitHub Actions for CI/CD

## Run locally

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or newer
- npm
- Python 3, or another static HTTP server

Clone the repository and install the locked dependencies:

```bash
git clone https://github.com/douglasmiguel/system-design.git
cd system-design
npm ci
```

Build the minified Tailwind stylesheet:

```bash
npm run build:css
```

Start a local static server:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser. Stop the
server with `Ctrl+C`.

When changing Tailwind classes in `index.html` or `app.js`, rebuild the CSS. To
keep Tailwind running while you work, use a second terminal:

```bash
npm run build:css -- --watch
```

## Project structure

```text
.
├── index.html                  # Page structure and content
├── app.js                      # Calculations and UI interactions
├── tailwind.css                # Tailwind source and theme configuration
├── styles.css                  # Generated production stylesheet
├── downloads/                  # Excalidraw assets
└── .github/workflows/          # CI/CD workflow
```

`styles.css` is generated but intentionally committed so the repository works
as a self-contained static site. CI rebuilds it and fails if it differs from
the committed version.
