# Stylus Debugger Agent

**ArbiLink Hackathon Submission** — AI-powered Arbitrum Stylus smart contract auditor

An AI agent that accepts Arbitrum Stylus Rust contract source code and returns a structured
plain-English security audit report, gas optimization recommendations, and deployment readiness
checklist — all in one command.

---

## What It Does

Stylus is Arbitrum's newest technology (Rust/WASM smart contracts). There are zero AI-native
debugging or auditing tools for Stylus contracts today. This agent fills that gap.

**Three capabilities:**

1. **Full Security Audit** — scans for vulnerabilities, access control issues, panic paths,
   integer overflow, reentrancy, and Stylus-specific SDK anti-patterns
2. **Error Debugger** — paste a cargo-stylus or rustc error, get a plain-English explanation
   and concrete fix
3. **Gas Optimizer** — Stylus/WASM-specific gas pattern analysis with before/after code examples

---

## Quickstart

### 1. Install

```bash
git clone https://github.com/YOUR_USERNAME/stylus-debugger-agent
cd stylus-debugger-agent
npm install
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env — add your AIML_API_KEY at minimum
```

### 3. Run the demo audit

```bash
npm run demo
```

This audits the included `examples/vulnerable-erc20.rs` which has intentional bugs.
The agent should find: missing access control on `mint()`, unchecked arithmetic,
redundant storage reads, and a panic path on `unwrap()`.

---

## CLI Usage

```bash
# Audit a contract file
npm run audit -- ./path/to/your/contract.rs

# Debug a cargo-stylus error
npm run debug -- ./build-error.txt

# Gas optimization review
npm run gas -- ./path/to/your/contract.rs
```

---

## HTTP Server

Run as a live HTTP endpoint (required for the ArbiLink bonus points):

```bash
npm run dev
# Server starts on http://localhost:3000
```

### Endpoints

#### `POST /audit`
Full security audit of a Stylus Rust contract.

```bash
curl -X POST http://localhost:3000/audit \
  -H "Content-Type: application/json" \
  -d '{
    "contractCode": "#[storage]\npub struct MyContract { ... }",
    "filename": "my-contract.rs",
    "context": "This is an ERC-20 token with a minting whitelist"
  }'
```

Response:
```json
{
  "success": true,
  "filename": "my-contract.rs",
  "audit": "## Stylus Contract Audit Report\n...",
  "usage": { "input_tokens": 1200, "output_tokens": 890 }
}
```

#### `POST /debug`
Explain a cargo-stylus or rustc compile error.

```bash
curl -X POST http://localhost:3000/debug \
  -H "Content-Type: application/json" \
  -d '{
    "errorOutput": "error[E0277]: the trait bound ... is not satisfied",
    "contractCode": "..."
  }'
```

#### `POST /gas-review`
Gas optimization analysis.

```bash
curl -X POST http://localhost:3000/gas-review \
  -H "Content-Type: application/json" \
  -d '{ "contractCode": "..." }'
```

#### `GET /health`
Agent health and capability info.

---

## Agent Registration (Step 2 of ArbiLink)

Register your agent on the Arbitrum ERC-8004 identity registry:

```bash
# Step 1: Fund a wallet with Arbitrum Sepolia ETH
# Faucet: https://faucet.quicknode.com/arbitrum/sepolia
# Faucet: https://arbitrum.faucet.dev

# Step 2: Set environment variables
export PRIVATE_KEY=0x_your_wallet_private_key
export NETWORK=sepolia
export AGENT_ENDPOINT=https://your-deployed-url.com

# Step 3: Register
npm run register:sepolia
```

On success, the script prints your **Agent ID** and **transaction hash** — include both in
your ArbiLink submission.

Registry addresses:
- Arbitrum One: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Arbitrum Sepolia: `0x8004A818BFB912233c491871b3d84c89A494BD9e`

---

## What the Audit Covers

| Dimension | Examples |
|-----------|---------|
| Security vulnerabilities | Missing `only_owner`, reentrancy via `call`, unchecked arithmetic |
| Gas optimizations | Redundant SLOADs, unnecessary `Vec` allocs, string ops in hot paths |
| Stylus SDK correctness | Wrong `#[storage]` macro usage, missing `sol_interface!` bindings |
| Rust best practices | `unwrap()` panic paths, `unsafe` blocks, dead code bloating WASM |
| Deployment readiness | `cargo-stylus check` indicators, WASM size guidance, Sepolia checklist |

---

## Project Structure

```
stylus-debugger-agent/
├── SKILL.md                    # Skill definition (ArbiLink format)
├── src/
│   ├── server.ts               # Express HTTP server (live agent endpoint)
│   ├── cli.ts                  # CLI for local use
│   └── register-agent.ts       # On-chain agent registration script
├── examples/
│   └── vulnerable-erc20.rs     # Demo contract with intentional bugs
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Tech Stack

- **Claude claude-opus-4-5** — audit reasoning and report generation
- **stylus-sdk v0.6+** — Stylus Rust SDK knowledge base
- **viem v2** — on-chain agent registration
- **Express** — HTTP server for live agent endpoint
- **agent0 / ERC-8004** — Arbitrum identity registry

---

## Requirements

- Node.js 18+
- `AIML_API_KEY` in `.env`
- Funded wallet for agent registration (Arbitrum Sepolia ETH)

---

## ArbiLink Submission Checklist

- [x] Skill built (Stylus contract auditor)
- [x] SKILL.md written in ArbiLink format
- [x] Agent registration script ready (`npm run register:sepolia`)
- [x] Live HTTP endpoint deployable (`npm run dev`)
- [x] Demo contract with verified findings (`npm run demo`)
- [ ] Register agent and note your Agent ID + tx hash
- [ ] Deploy to a public URL (Railway, Render, Fly.io)
- [ ] Submit before April 3, 19:30 CET
