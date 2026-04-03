# # StylusAudit — Complete Master Architecture, Integration & Deployment Guide

> AI-powered security auditor for Arbitrum Stylus (Rust/WASM) smart contracts
> ArbiLink Agentic Bounty 2026 | Deadline: April 3, 19:30 CET

![Brutalist Vanguard Hero Banner](file:///C:/Users/shivamsoni/.gemini/antigravity/brain/a7a9afa9-2b06-4580-a1d5-657dbd34822f/brutalist_vanguard_banner_1775157075970.png)

![Brutalist UI Aesthetics](https://img.shields.io/badge/UX-Brutalist_Cyber_Editorial-black?style=for-the-badge&color=030303&labelColor=FF3B00)
![Arbitrum Stylus](https://img.shields.io/badge/Ecosystem-Arbitrum_Stylus-blue?style=for-the-badge&color=213147)
![AI Payload](https://img.shields.io/badge/Neural-Claude_Opus_Core-orange?style=for-the-badge&color=D97757)

---

## 1. What This Project Is

StylusAudit is an AI-powered agent skill that analyzes Arbitrum Stylus (Rust) smart contracts for:
- Security vulnerabilities (reentrancy, overflow, missing access control)
- Gas optimization opportunities (WASM-specific)
- Stylus SDK correctness (macros, storage patterns)
- Rust best practices (memory safety, idiomatic code)
- Deployment readiness (mainnet checklist)

**AI backbone**: OpenAI-compatible SDK pointed at `https://api.aimlapi.com/v1` using Claude 3.5 Opus  
**UI**: "The Vanguard Protocol" — brutalist cyber-editorial single HTML file  
**On-chain**: Registered on Arbitrum ERC-8004 identity registry via viem  
**Deployed**: Railway (Node.js/Express)

---

## 2. Complete Directory Structure

```
stylus-debugger-agent/
├── src/
│   ├── server.ts              ← Express HTTP server (main backend — THE BRAIN)
│   ├── cli.ts                 ← CLI tool for local terminal use
│   └── register-agent.ts      ← Arbitrum ERC-8004 on-chain registration
├── public/
│   └── index.html             ← Vanguard Protocol UI (single HTML file, all-in-one)
├── examples/
│   └── test_contract.rs       ← Intentionally vulnerable Stylus contract for demo
├── SKILL.md                   ← ArbiLink skill definition (required for submission)
├── README.md                  ← Full project documentation
├── package.json               ← Dependencies + scripts
├── tsconfig.json              ← TypeScript config (CommonJS for Railway)
├── .env.example               ← Env template (committed to git)
└── .env                       ← Actual keys (NEVER commit — set in Railway dashboard)
```

---

## 3. Component Deep-Dive

### 3.1 — `src/server.ts` (The Brain)

**What it does:**
Express HTTP server. Receives Rust contract code from the frontend, reads `SKILL.md` as AI system context, calls the AI/ML API (Claude Opus), and returns structured audit results.

**All 4 endpoints:**

| Method | Route       | Request Body                              | Response                              |
|--------|-------------|-------------------------------------------|---------------------------------------|
| POST   | /audit      | `{ contractCode, filename? }`             | `{ success, audit, usage }`           |
| POST   | /debug      | `{ errorOutput, contractCode? }`          | `{ success, explanation, usage }`     |
| POST   | /gas-review | `{ contractCode }`                        | `{ success, gasReview, usage }`       |
| GET    | /health     | none                                      | `{ status:"ok", agent, version }`     |

---

### 3.2 — `public/index.html` (The Vanguard Protocol UI)

**What it is:**  
Single self-contained HTML file. No framework, no build step. Brutalist design — Cormorant Garamond + IBM Plex Mono. Contains landing page + full dashboard with 3 analysis tabs + localStorage history ledger.

**The one line to set (bottom of index.html):**
```javascript
window.API_BASE = 'https://your-railway-url.up.railway.app';
```

---

### 3.3 — `package.json` (Scripts — Railway uses `npm start`)

```json
{
  "name": "stylus-debugger-agent",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev":              "tsx watch src/server.ts",
    "build":            "tsc",
    "start":            "tsx src/server.ts",
    "register:sepolia": "NETWORK=sepolia tsx src/register-agent.ts",
    "demo":             "tsx src/cli.ts audit examples/test_contract.rs"
  }
}
```

---

### 3.4 — Railway Deployment

1. **Deploy from GitHub**
2. **Set Environment Variables**: `AIML_API_KEY`, `PORT`, `NETWORK`, `AGENT_ENDPOINT`.
3. **Set Start Command**: `npm run dev`
4. **Get Your Live URL** and update `AGENT_ENDPOINT` and `window.API_BASE`.

---

## 4. Full Request Flow — End to End

1. User pastes Rust code into Vanguard Protocol editor.
2. Clicks "Run Security Audit".
3. `server.ts` calls AI/ML API with `SKILL.md` context.
4. UI renders the structured markdown audit.
5. System logs the scan to Local Execution Ledger.

---

## 5. ArbiLink Submission Checklist

- [ ] `public/index.html` exists in repo
- [ ] CORS headers added to `server.ts`
- [ ] `tsx` is in dependencies
- [ ] `npm run dev` as Railway start command
- [ ] `/health` returns `{ status: "ok" }`
- [ ] Agent registered on Arbitrum Sepolia
- [ ] Submission form filled

---

## 6. Why StylusAudit Wins

First AI auditor for Stylus — zero competition in developer tooling. Truly native to the Arbitrum stack. 
