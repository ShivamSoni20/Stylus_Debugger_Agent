# The Vanguard Protocol: Arbitrum Stylus Debugger MVP
*The Brutalist Cyber-Editorial Interface for Arbitrum WASM Execution Auditing*

![Brutalist Vanguard Hero Banner](file:///C:/Users/shivamsoni/.gemini/antigravity/brain/a7a9afa9-2b06-4580-a1d5-657dbd34822f/brutalist_vanguard_banner_1775157075970.png)

![Brutalist UI Aesthetics](https://img.shields.io/badge/UX-Brutalist_Cyber_Editorial-black?style=for-the-badge&color=030303&labelColor=FF3B00)
![Arbitrum Stylus](https://img.shields.io/badge/Ecosystem-Arbitrum_Stylus-blue?style=for-the-badge&color=213147)
![AI Payload](https://img.shields.io/badge/Neural-Claude_Opus_Core-orange?style=for-the-badge&color=D97757)

This repository holds the MVP for a highly specialized, brutally direct, and aesthetically uncompromising AI Smart Contract Auditor designed natively for the **Arbitrum Stylus (Rust/WASM)** execution domain. 

The web interface radically rejects predictable "AI-slop" design tropes (generic gradients, rounded glassmorphism, boring typography). It instead utilizes heavy topological grids, structural serif/mono typographic tension (`Cormorant Garamond` + `IBM Plex Mono`), stark hover-mechanics, and aggressively constrained AI payloads to deliver professional-grade analysis without the noise.

---

## ⚙️ Core Operational Subsystems

The dashboard is split into strictly isolated environments, relying entirely on CSS class toggling and fluid grid/flex layouts for instantaneous transitions. 

### 1. Security Audit Matrix (`/audit`)
A vertically split execution pane. You inject pure Arbitrum Stylus Rust code into the left editor. The backend transmits the payload to a customized instance of `claude-opus`, heavily instructed to act as an elite Stylus architect. 
- **The Result**: Instead of wordy explanations, the AI outputs raw, actionable vulnerability diagnostics regarding WASM/EVM interoperability, CEI patterns, and `sol_storage!` macro exploits. 

### 2. Gas Telemetry Grid (`/gas-review`)
A horizontally split metric-dashboard tailored for compute/storage analysis.
- **The Function**: Because WASM execution is vastly cheaper than EVM bytecode execution (but storage limits remain strict), this model ignores generic EVM cost constraints and explicitly highlights Arbitrum Stylus data allocation vectors.
- **The Delivery**: Responses are forcefully limited. No paragraphs. Just hyper-dense metrics automatically laid out into stark HTML calculation blocks. You drag a responsive horizontal resizer to dynamically scale your view logic.

### 3. Local Execution Ledger (History)
To preserve operational momentum, every successful request is instantly tracked permanently on device using `localStorage`. 
- Discarding generic database overhead, the system caches snippets of the actual payload, maintaining the structural timeline vertically. 
- You can instantly retrieve any previous audit payload by hitting **[ Load => ]**, immediately repopulating the corresponding workspace for a secondary execution.

---

## 📂 Internal File Architecture

#### Backend Infrastructure (`/src`)
- **`server.ts`**: The nerve center of the application. An Express.js node bridging browser payloads to an underlying LLM interface. It controls the specialized neural-prompt injections that constrain AI behavior to output exclusively in Brutalist summary logic. Provides `/audit`, `/debug`, `/gas-review`, and `.get(/health)` states.
- **`cli.ts`**: A headless CLI utility integration for advanced users operating directly in bash environments.

#### Frontend Interface (`/public`)
- **`index.html`**: A single-page application built entirely from scratch. Contains dense vanilla `<style>` topologies implementing zero-`border-radius` brutalism, distinct responsive grid-systems, staggered `clip-path` CSS animation revelations, and zero-latency `transition: 0s` interactive elements. Includes the `switchTab` navigation mechanics, the interactive draggable viewport algorithms, and localized HTML injection loops.

#### Collateral & Testing (`/examples`)
- Includes raw `.rs` Rust payloads like `test_contract.rs` engineered specifically with severe architectural flaws (e.g., initialization hijacking, mapping underflows, lacking execution checks). Users can paste these directly into the web interface to verify system accuracy.

---

## 🚀 Execution & Setup

If deploying this repository locally, you require absolute authority over the Node environment.

```bash
# 1. Inject Dependencies
npm install

# 2. Establish Keys
# Rename .env.example to .env and provide your API configuration constraints
cp .env.example .env
export AIML_API_KEY="your-key"

# 3. Ignite Server Protocol
npm run dev
```

Point an Chromium/Webkit browser to **`http://localhost:3000`**. The agent relies on a live internet connection exclusively for the Neural LLM verification. All UI layouts, state retention engines, and execution grids operate purely locally on the client. 
