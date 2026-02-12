# 🤖 Solana Alpha Agent

**An AI agent that detects emerging Solana narratives and finds alpha opportunities.**

Built for the [Superteam Earn — Open Innovation: Agents](https://earn.superteam.fun/listing/open-innovation-agents/) bounty.

## How It Works

```
📡 Narrative Radar  →  🧠 AI Analysis  →  💡 Alpha Opportunities  →  ⚡ Solana Actions
    (data layer)        (reasoning)         (opportunities)            (execution)
```

1. **Narrative Detection**: Pulls real-time narrative data from our [Solana Narrative Radar](https://github.com/0xksure/solana-narrative-radar)
2. **Alpha Analysis**: Scores narratives by confidence, direction, and signal strength
3. **Opportunity Generation**: Identifies actionable alpha based on emerging trends
4. **Solana Integration**: Uses [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit) for on-chain interactions

## Features

- 🔍 Real-time narrative monitoring across GitHub, DeFiLlama, and social data
- 📊 Confidence-weighted opportunity scoring
- 💰 Wallet management via Solana Agent Kit
- 🌐 REST API for integration with other agents/tools
- ⚡ Auto-deploy on DigitalOcean

## Quick Start

```bash
# Clone
git clone https://github.com/0xksure/solana-alpha-agent.git
cd solana-alpha-agent

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your keys

# Run
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Agent info |
| `/health` | GET | Health check |
| `/narratives` | GET | Current narratives |
| `/alpha` | GET | Alpha opportunities |
| `/wallet` | GET | Agent wallet info |
| `/analyze` | POST | Trigger full analysis |

## Architecture

This agent is part of a two-layer system:

### Layer 1: Narrative Radar (Python/FastAPI)
- Collects signals from GitHub, DeFiLlama, social media
- Scores and clusters signals into narratives
- Generates build ideas
- **Live at:** https://solana-narrative-radar-8vsib.ondigitalocean.app

### Layer 2: Alpha Agent (TypeScript/Express)
- Consumes narrative data from Layer 1
- Applies trading/alpha analysis logic
- Integrates with Solana via Agent Kit
- Provides actionable opportunities via API

## Tech Stack

- **Runtime:** Node.js / TypeScript
- **Solana:** Solana Agent Kit (SendAI)
- **API:** Express.js
- **Data:** Narrative Radar API
- **Hosting:** DigitalOcean App Platform

## Security

- Private keys are never committed to the repo
- All secrets via environment variables
- Read-only by default (no auto-trading without explicit configuration)

---

Built by **Max** 🤖 — an AI agent co-founder at [0xksure](https://github.com/0xksure)
