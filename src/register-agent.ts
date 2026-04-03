/**
 * register-agent.ts
 *
 * Registers the Stylus Debugger Agent on the Arbitrum ERC-8004 identity registry.
 * Supports both Arbitrum One (mainnet) and Arbitrum Sepolia (testnet).
 *
 * Usage:
 *   PRIVATE_KEY=0x... NETWORK=sepolia npx tsx register-agent.ts
 *   PRIVATE_KEY=0x... NETWORK=mainnet npx tsx register-agent.ts
 */

import "dotenv/config";

import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum, arbitrumSepolia } from "viem/chains";

// ── Registry contract addresses (ERC-8004) ────────────────────────────────────
const REGISTRY = {
  mainnet: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const,
  sepolia: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const,
};

// ── Minimal ABI for IdentityRegistry ─────────────────────────────────────────
// ERC-8004: registerAgent(name, description, endpoint, metadataURI)
const REGISTRY_ABI = parseAbi([
  "function registerAgent(string name, string description, string endpoint, string metadataURI) external returns (uint256 agentId)",
  "function getAgent(uint256 agentId) external view returns (string name, string description, string endpoint, string metadataURI, address owner)",
  "event AgentRegistered(uint256 indexed agentId, address indexed owner, string name)",
]);

// ── Agent metadata ─────────────────────────────────────────────────────────────
const AGENT_METADATA = {
  name: "StylusAudit",
  description:
    "AI-powered security auditor for Arbitrum Stylus Rust smart contracts. " +
    "Detects vulnerabilities, gas inefficiencies, and Stylus SDK anti-patterns. " +
    "Returns structured audit reports with severity ratings and concrete code fixes. " +
    "ArbiLink Hackathon 2026.",
  endpoint: process.env.AGENT_ENDPOINT || "https://your-deployed-url.com",
  metadataURI: (process.env.AGENT_ENDPOINT || "https://your-deployed-url.com") + "/health",
};

// ── Main registration function ────────────────────────────────────────────────
async function registerAgent() {
  let rawKey = process.env.PRIVATE_KEY;
  if (!rawKey) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }
  
  // Format to standard Hex structure if 0x prefix was omitted
  const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as Hex;

  const network = (process.env.NETWORK || "sepolia").toLowerCase();
  const isMainnet = network === "mainnet" || network === "arbitrum";

  const chain = isMainnet ? arbitrum : arbitrumSepolia;
  const registryAddress = isMainnet ? REGISTRY.mainnet : REGISTRY.sepolia;
  const rpcUrl =
    process.env.RPC_URL ||
    (isMainnet
      ? "https://arb1.arbitrum.io/rpc"
      : "https://sepolia-rollup.arbitrum.io/rpc");

  console.log(`\n🤖 Stylus Debugger Agent — Registration`);
  console.log(`   Network:  ${isMainnet ? "Arbitrum One (mainnet)" : "Arbitrum Sepolia (testnet)"}`);
  console.log(`   Registry: ${registryAddress}`);
  console.log(`   RPC:      ${rpcUrl}\n`);

  const account = privateKeyToAccount(privateKey);
  console.log(`   Wallet:   ${account.address}`);

  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  // Check wallet balance
  const balance = await publicClient.getBalance({ address: account.address });
  const balanceEth = Number(balance) / 1e18;
  console.log(`   Balance:  ${balanceEth.toFixed(6)} ETH`);

  if (balance === 0n) {
    console.error("\n❌ Wallet has 0 ETH. Fund it first:");
    if (!isMainnet) {
      console.error("   Faucet: https://faucet.quicknode.com/arbitrum/sepolia");
      console.error("   Faucet: https://arbitrum.faucet.dev");
    }
    process.exit(1);
  }

  // Simulate the transaction first
  console.log("\n📋 Agent details to register:");
  console.log(`   Name:        ${AGENT_METADATA.name}`);
  console.log(`   Endpoint:    ${AGENT_METADATA.endpoint}`);
  console.log(`   MetadataURI: ${AGENT_METADATA.metadataURI}`);
  console.log(`   Description: ${AGENT_METADATA.description.slice(0, 80)}...`);

  try {
    // Simulate first to catch reverts before spending gas
    await publicClient.simulateContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: "registerAgent",
      args: [
        AGENT_METADATA.name,
        AGENT_METADATA.description,
        AGENT_METADATA.endpoint,
        AGENT_METADATA.metadataURI,
      ],
      account: account.address,
    });

    console.log("\n✅ Simulation passed. Sending registration transaction...");

    // Send the real transaction
    const txHash = await walletClient.writeContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: "registerAgent",
      args: [
        AGENT_METADATA.name,
        AGENT_METADATA.description,
        AGENT_METADATA.endpoint,
        AGENT_METADATA.metadataURI,
      ],
    });

    console.log(`\n📡 Transaction sent: ${txHash}`);
    console.log(`   Explorer: ${isMainnet
      ? `https://arbiscan.io/tx/${txHash}`
      : `https://sepolia.arbiscan.io/tx/${txHash}`
    }`);

    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status === "success") {
      // Parse AgentRegistered event to get agentId
      const registeredEvent = receipt.logs.find(
        (log) =>
          log.address.toLowerCase() === registryAddress.toLowerCase()
      );

      console.log("\n🎉 Agent registered successfully!");
      console.log(`   Transaction: ${txHash}`);
      console.log(`   Block:       ${receipt.blockNumber}`);
      console.log(`   Gas used:    ${receipt.gasUsed.toString()}`);

      if (registeredEvent) {
        // The first indexed topic after the event sig is the agentId
        const agentId = registeredEvent.topics[1]
          ? BigInt(registeredEvent.topics[1]).toString()
          : "check explorer";
        console.log(`   Agent ID:    ${agentId}`);
      }

      console.log(`\n✅ Your agent is now live on the Arbitrum identity registry.`);
      console.log(`   Submit this transaction hash in your ArbiLink bounty submission.`);
    } else {
      console.error("\n❌ Transaction reverted. Check the explorer for details.");
      console.error(`   ${isMainnet
        ? `https://arbiscan.io/tx/${txHash}`
        : `https://sepolia.arbiscan.io/tx/${txHash}`
      }`);
      process.exit(1);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("already registered") || message.includes("AlreadyRegistered")) {
      console.log("\n⚠️  This address already has a registered agent.");
      console.log("   Use the update function instead, or use a different wallet.");
    } else {
      console.error("\n❌ Registration failed:", message);
      process.exit(1);
    }
  }
}

registerAgent().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
