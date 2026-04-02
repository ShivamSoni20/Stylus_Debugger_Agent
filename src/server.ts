import "dotenv/config";
import OpenAI from "openai";
import express from "express";
import { readFileSync } from "fs";
import { resolve } from "path";

const app = express();
app.use(express.json({ limit: "500kb" }));
app.use(express.static(resolve("public")));

const client = new OpenAI({
  baseURL: "https://api.aimlapi.com/v1",
  apiKey: process.env.AIML_API_KEY,
});

// Load skill context from SKILL.md at startup
const skillContext = readFileSync(resolve("SKILL.md"), "utf-8");

const SYSTEM_PROMPT = `
You are the Stylus Debugger Agent — an expert AI auditor for Arbitrum Stylus smart contracts 
written in Rust. You have deep knowledge of:
- stylus-sdk v0.6+ macros, storage patterns, and ABI exports
- cargo-stylus toolchain (check, deploy, export-abi)
- Common Rust smart contract vulnerabilities (reentrancy, integer overflow, panic paths)
- Arbitrum Stylus WASM execution model and gas cost patterns
- ERC-20/ERC-721/ERC-1155 Stylus implementations
- Cross-contract call patterns in Stylus

${skillContext}

Always respond with a structured audit report following the exact format defined in the skill.
Be specific — reference actual function names, line patterns, and macro usages from the submitted code.
Never invent findings that are not present in the submitted code.
If the contract is clean, say so clearly and explain why it passes review.
`.trim();

// ── Audit endpoint ──────────────────────────────────────────────────────────

app.post("/audit", async (req, res) => {
  const { contractCode, filename = "contract.rs", context = "" } = req.body;

  if (!contractCode || typeof contractCode !== "string") {
    return res
      .status(400)
      .json({ error: "Missing contractCode (string) in request body" });
  }

  if (contractCode.length > 200_000) {
    return res
      .status(400)
      .json({ error: "Contract too large — max 200KB" });
  }

  const userPrompt = `
Please audit the following Arbitrum Stylus Rust smart contract.

**Filename:** ${filename}
${context ? `**Additional context from developer:** ${context}` : ""}

\`\`\`rust
${contractCode}
\`\`\`

Provide a full audit report covering:
1. Security vulnerabilities (with severity)
2. Gas optimization opportunities  
3. Stylus SDK correctness issues
4. Rust best practices in contract context
5. Deployment readiness checklist

Be specific — reference actual line patterns, function names, and macro usage from the code above.
`.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are an elite Arbitrum Stylus Auditor. Your core skill is translating complex Rust/WASM execution paradigms for EVM-native developers.
1. FOCUS ON STYLUS SPECIFICS: Address WASM compilation steps, memory cost differences relative to standard EVM operations, and cross-VM interoperability constraints.
2. MAKE IT UNDERSTANDABLE: Break down logic simply, but DO NOT over-explain.
3. FORMAT: Output brutalist summary blocks (ALL CAPS LABELS). 
4. STRICT LENGTH LIMIT: Keep the entire response extremely concise (under 250 words). Do not write extensive checklists or long-winded best practices. ONLY list the Top 2 most critical vulnerabilities. Be brutally direct.`
        },
        { role: "user", content: userPrompt },
      ],
    });

    const auditText = completion.choices[0]?.message?.content || "";

    return res.json({
      success: true,
      filename,
      audit: auditText,
      usage: completion.usage,
      model: completion.model,
    });
  } catch (err) {
    console.error("Audit error:", err);
    return res.status(500).json({ error: "Audit failed", details: String(err) });
  }
});

// ── Debug endpoint — explain cargo-stylus errors ─────────────────────────────

app.post("/debug", async (req, res) => {
  const { errorOutput, contractCode = "", filename = "contract.rs" } = req.body;

  if (!errorOutput || typeof errorOutput !== "string") {
    return res
      .status(400)
      .json({ error: "Missing errorOutput (string) in request body" });
  }

  const userPrompt = `
A developer is getting the following error from cargo-stylus or the Rust compiler 
when building their Arbitrum Stylus contract:

\`\`\`
${errorOutput}
\`\`\`

${contractCode ? `\nHere is the relevant contract code:\n\`\`\`rust\n${contractCode}\n\`\`\`` : ""}

Please:
1. Explain in plain English what caused this error
2. Identify the exact location in the code (if provided)
3. Provide the corrected code snippet
4. Explain why the fix works in the context of Stylus SDK
`.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are a specialized Error Decoder for Arbitrum Stylus (cargo-stylus).
Your objective: Demystify Rust build errors and WASM target execution faults.
1. Explain WHY the compiler failed in simple terms (e.g., Borrow checker violation, unsupported standard library feature, crate incompatibility with WASM).
2. Detail the specific structural fix.
FORMAT: Give a direct, step-by-step diagnostic output in brief, stark statements.`
        },
        { role: "user", content: userPrompt },
      ],
    });

    const explanation = completion.choices[0]?.message?.content || "";

    return res.json({
      success: true,
      filename,
      explanation,
      usage: completion.usage,
    });
  } catch (err) {
    console.error("Debug error:", err);
    return res.status(500).json({ error: "Debug failed", details: String(err) });
  }
});

// ── Gas estimate endpoint ─────────────────────────────────────────────────────

app.post("/gas-review", async (req, res) => {
  const { contractCode, filename = "contract.rs" } = req.body;

  if (!contractCode) {
    return res.status(400).json({ error: "Missing contractCode" });
  }

  const userPrompt = `
Review this Arbitrum Stylus Rust contract strictly for WASM/Gas vectors:
\`\`\`rust
${contractCode}
\`\`\`
`.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [
        { 
          role: "system", 
          content: "You are an elite Arbitrum Stylus Gas Architect. Output MUST strictly be under 100 words. Focus exclusively on the ONE or TWO biggest WASM-specific optimization vectors. Format strictly as stark metric blocks. Absolutely no conversational filler or long explanations." 
        },
        { role: "user", content: userPrompt },
      ],
    });

    const review = completion.choices[0]?.message?.content || "";

    return res.json({ success: true, filename, gasReview: review, usage: completion.usage });
  } catch (err) {
    console.error("Gas review error:", err);
    return res.status(500).json({ error: "Gas review failed", details: String(err) });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    agent: "stylus-debugger-agent",
    version: "1.0.0",
    endpoints: ["/audit", "/debug", "/gas-review"],
    description:
      "AI-powered Arbitrum Stylus smart contract auditor and debugger",
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Stylus Debugger Agent running on http://localhost:${PORT}`);
  console.log(`  POST /audit       — Full security audit`);
  console.log(`  POST /debug       — Explain cargo-stylus errors`);
  console.log(`  POST /gas-review  — Gas optimization review`);
  console.log(`  GET  /health      — Agent health check`);
});

export default app;
