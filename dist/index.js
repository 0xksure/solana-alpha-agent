"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const bs58_1 = __importDefault(require("bs58"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Initialize Solana connection
const connection = new web3_js_1.Connection(process.env.RPC_URL || "https://api.devnet.solana.com", "confirmed");
// Load or generate wallet
let wallet;
try {
    wallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(process.env.SOLANA_PRIVATE_KEY || ""));
}
catch {
    wallet = web3_js_1.Keypair.generate();
    console.log("⚠️ Generated temporary wallet (set SOLANA_PRIVATE_KEY in .env)");
}
// Narrative-to-token mapping (Solana ecosystem)
const NARRATIVE_TOKENS = {
    defi: ["JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"],
    "ai agents": ["FoqP7aTaibT5npFKYpYYADYY4Dc1GYVqJBJhV88PBvMV"],
    trading: ["JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"],
    infrastructure: ["So11111111111111111111111111111111111111112"],
    staking: ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"],
    rwa: [],
    memecoins: ["DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"],
};
// Fetch narratives from our Narrative Radar
async function fetchNarratives() {
    const radarUrl = process.env.NARRATIVE_RADAR_URL || "https://solana-narrative-radar-8vsib.ondigitalocean.app";
    try {
        const resp = await fetch(`${radarUrl}/api/narratives`);
        const data = await resp.json();
        return data.narratives || [];
    }
    catch (e) {
        console.error("Failed to fetch narratives:", e);
        return [];
    }
}
// Get token prices from Jupiter
async function getTokenPrices(mints) {
    const prices = new Map();
    if (mints.length === 0)
        return prices;
    try {
        const resp = await fetch(`https://api.jup.ag/price/v2?ids=${mints.join(",")}`);
        const data = await resp.json();
        for (const [mint, info] of Object.entries(data.data || {})) {
            prices.set(mint, info.price || 0);
        }
    }
    catch { }
    return prices;
}
// Analyze narratives and find alpha
async function findAlpha(narratives) {
    const opportunities = [];
    for (const narrative of narratives) {
        const key = narrative.name.toLowerCase();
        const tokens = NARRATIVE_TOKENS[key] || [];
        if (narrative.confidence === "HIGH" && narrative.direction === "ACCELERATING") {
            opportunities.push({
                narrative: narrative.name,
                action: "ACCUMULATE",
                tokens,
                reasoning: `${narrative.name} is a high-confidence accelerating narrative with ${narrative.supporting_signals?.length || 0} supporting signals. ${narrative.explanation}`,
                confidence: 0.85,
                risk: "MEDIUM",
                suggested_allocation: "5-10% of portfolio",
            });
        }
        else if (narrative.confidence === "MEDIUM") {
            opportunities.push({
                narrative: narrative.name,
                action: narrative.direction === "ACCELERATING" ? "DCA" : "WATCHLIST",
                tokens,
                reasoning: `${narrative.name} showing ${narrative.direction.toLowerCase()} trend. ${narrative.explanation}`,
                confidence: narrative.direction === "ACCELERATING" ? 0.6 : 0.4,
                risk: "LOW",
                suggested_allocation: narrative.direction === "ACCELERATING" ? "2-5% of portfolio" : "Watch only",
            });
        }
    }
    return opportunities.sort((a, b) => b.confidence - a.confidence);
}
// Get on-chain stats for the agent wallet
async function getWalletStats() {
    try {
        const balance = await connection.getBalance(wallet.publicKey);
        const recentTxs = await connection.getConfirmedSignaturesForAddress2(wallet.publicKey, { limit: 5 });
        return {
            address: wallet.publicKey.toBase58(),
            balance_sol: balance / web3_js_1.LAMPORTS_PER_SOL,
            recent_transactions: recentTxs.length,
            network: (process.env.RPC_URL || "").includes("devnet") ? "devnet" : "mainnet",
        };
    }
    catch (e) {
        return {
            address: wallet.publicKey.toBase58(),
            balance_sol: 0,
            error: e.message,
        };
    }
}
// === API Routes ===
app.get("/", (_req, res) => {
    res.json({
        name: "Solana Alpha Agent",
        version: "0.1.0",
        description: "AI agent that detects Solana narratives and finds alpha opportunities using on-chain and off-chain data",
        architecture: {
            "data_layer": "Solana Narrative Radar (GitHub, DeFiLlama, Social signals)",
            "analysis_layer": "Confidence-weighted opportunity scoring",
            "execution_layer": "Solana Web3.js + Jupiter for token operations",
        },
        endpoints: {
            "GET /health": "Health check",
            "GET /narratives": "Current narratives from Narrative Radar",
            "GET /alpha": "Alpha opportunities with token suggestions",
            "GET /wallet": "Agent wallet info + on-chain stats",
            "GET /prices": "Token prices for narrative-related tokens",
            "POST /analyze": "Full analysis pipeline",
        },
    });
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok", agent: "solana-alpha-agent", wallet: wallet.publicKey.toBase58() });
});
app.get("/narratives", async (_req, res) => {
    const narratives = await fetchNarratives();
    res.json({ narratives, count: narratives.length });
});
app.get("/alpha", async (_req, res) => {
    const narratives = await fetchNarratives();
    const opportunities = await findAlpha(narratives);
    // Enrich with prices
    const allTokens = [...new Set(opportunities.flatMap((o) => o.tokens))];
    const prices = await getTokenPrices(allTokens);
    res.json({
        opportunities: opportunities.map((o) => ({
            ...o,
            token_prices: Object.fromEntries(o.tokens.map((t) => [t, prices.get(t) || null])),
        })),
        count: opportunities.length,
        analyzed_narratives: narratives.length,
        timestamp: new Date().toISOString(),
    });
});
app.get("/wallet", async (_req, res) => {
    res.json(await getWalletStats());
});
app.get("/prices", async (_req, res) => {
    const allTokens = [...new Set(Object.values(NARRATIVE_TOKENS).flat())];
    const prices = await getTokenPrices(allTokens);
    res.json({
        prices: Object.fromEntries(prices),
        count: prices.size,
    });
});
app.post("/analyze", async (_req, res) => {
    console.log("🔍 Running full analysis pipeline...");
    const narratives = await fetchNarratives();
    const opportunities = await findAlpha(narratives);
    const walletStats = await getWalletStats();
    const allTokens = [...new Set(opportunities.flatMap((o) => o.tokens))];
    const prices = await getTokenPrices(allTokens);
    const report = {
        timestamp: new Date().toISOString(),
        agent: {
            wallet: walletStats.address,
            balance: walletStats.balance_sol,
            network: walletStats.network,
        },
        analysis: {
            narratives_analyzed: narratives.length,
            opportunities_found: opportunities.length,
            top_narratives: narratives.slice(0, 3).map((n) => `${n.name} [${n.confidence}]`),
        },
        opportunities: opportunities.map((o) => ({
            ...o,
            token_prices: Object.fromEntries(o.tokens.map((t) => [t, prices.get(t) || null])),
        })),
        summary: opportunities.length > 0
            ? `Top alpha: ${opportunities[0].narrative} → ${opportunities[0].action} (${(opportunities[0].confidence * 100).toFixed(0)}% confidence)`
            : "No high-confidence opportunities detected. Market in consolidation.",
    };
    console.log(`📊 Analysis complete: ${opportunities.length} opportunities from ${narratives.length} narratives`);
    res.json(report);
});
// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🤖 Solana Alpha Agent running on port ${PORT}`);
    console.log(`📡 Narrative Radar: ${process.env.NARRATIVE_RADAR_URL || "https://solana-narrative-radar-8vsib.ondigitalocean.app"}`);
    console.log(`💰 Wallet: ${wallet.publicKey.toBase58()}`);
});
