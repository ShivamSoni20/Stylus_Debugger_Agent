#!/usr/bin/env node
/**
 * stylus-audit CLI
 *
 * Audit a Stylus Rust contract directly from the terminal.
 *
 * Usage:
 *   npx tsx src/cli.ts audit ./my-contract/src/lib.rs
 *   npx tsx src/cli.ts debug ./error-output.txt
 *   npx tsx src/cli.ts gas ./my-contract/src/lib.rs
 *
 * Or via server:
 *   AUDIT_SERVER=http://localhost:3000 npx tsx src/cli.ts audit ./lib.rs
 */

import { readFileSync, existsSync } from "fs";
import { resolve, basename } from "path";
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.aimlapi.com/v1",
  apiKey: process.env.AIML_API_KEY,
});

const SYSTEM_PROMPT = `
You are the Stylus Debugger Agent — an expert AI auditor for Arbitrum Stylus smart contracts 
written in Rust. You have deep knowledge of stylus-sdk v0.6+, cargo-stylus, Arbitrum Stylus VM 
execution model, and Rust smart contract security patterns.

Always produce structured audit reports with:
- Severity levels: CRITICAL / HIGH / MEDIUM / LOW / INFO
- Specific code references (function names, macro usages)
- Concrete code fixes for every finding
- A final DEPLOY SAFELY / DEPLOY WITH FIXES / DO NOT DEPLOY recommendation
`.trim();

async function auditContract(filePath: string) {
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const code = readFileSync(absPath, "utf-8");
  const filename = basename(absPath);

  console.log(`\n🔍 Auditing: ${filename} (${code.length} chars)\n`);
  console.log("⏳ Running AI audit...\n");

  const completion = await client.chat.completions.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Please audit this Arbitrum Stylus Rust smart contract:\n\n**Filename:** ${filename}\n\n\`\`\`rust\n${code}\n\`\`\`\n\nProvide a full security audit covering vulnerabilities, gas optimizations, Stylus SDK correctness, and deployment readiness.`,
      },
    ],
  });

  const result = completion.choices[0]?.message?.content || "";

  console.log(result);
  if (completion.usage) {
    console.log(`\n📊 Tokens used: ${completion.usage.prompt_tokens} in / ${completion.usage.completion_tokens} out`);
  }
}

async function debugError(filePath: string) {
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const errorOutput = readFileSync(absPath, "utf-8");
  console.log(`\n🐛 Debugging error output from: ${basename(absPath)}\n`);
  console.log("⏳ Analyzing error...\n");

  const completion = await client.chat.completions.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `A developer is getting this error when building their Arbitrum Stylus contract:\n\n\`\`\`\n${errorOutput}\n\`\`\`\n\nExplain the error in plain English, identify the root cause, and provide a concrete fix.`,
      },
    ],
  });

  const result = completion.choices[0]?.message?.content || "";

  console.log(result);
}

async function gasReview(filePath: string) {
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const code = readFileSync(absPath, "utf-8");
  const filename = basename(absPath);

  console.log(`\n⛽ Gas review: ${filename}\n`);
  console.log("⏳ Analyzing gas patterns...\n");

  const completion = await client.chat.completions.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Review this Arbitrum Stylus Rust contract for gas optimization opportunities. Focus on Stylus/WASM-specific patterns.\n\n\`\`\`rust\n${code}\n\`\`\``,
      },
    ],
  });

  const result = completion.choices[0]?.message?.content || "";

  console.log(result);
}

// ── Entry point ───────────────────────────────────────────────────────────────

const [, , command, filePath] = process.argv;

if (!command || !filePath) {
  console.log(`
Stylus Debugger Agent CLI

Commands:
  audit <file.rs>    Full security audit of a Stylus contract
  debug <error.txt>  Explain a cargo-stylus / rustc error
  gas   <file.rs>    Gas optimization review

Examples:
  npx tsx src/cli.ts audit ./contracts/src/lib.rs
  npx tsx src/cli.ts debug ./build-error.txt
  npx tsx src/cli.ts gas ./contracts/src/lib.rs
`);
  process.exit(0);
}

(async () => {
  try {
    switch (command) {
      case "audit":
        await auditContract(filePath);
        break;
      case "debug":
        await debugError(filePath);
        break;
      case "gas":
        await gasReview(filePath);
        break;
      default:
        console.error(`Unknown command: ${command}. Use audit, debug, or gas.`);
        process.exit(1);
    }
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
