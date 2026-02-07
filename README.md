# MigrantAI — Heerlen Hackathon

🌍 Voice-first AI assistant helping immigrants in the Netherlands navigate bureaucracy.

**Live Demo:** [Coming Soon]

## Features
- 🗣️ **Speak any language** — agent responds in yours (Arabic, Turkish, Polish, Ukrainian, etc.)
- 🔍 **Real-time search** of Dutch government sources
- 📝 **Auto-fill forms** via Chrome extension
- 🔒 **Privacy-first**: personal data never leaves your browser

## Quick Start

### 1. Web App
```bash
cd web
cp .env.example .env.local
# Add your NEXT_PUBLIC_ELEVENLABS_AGENT_ID
npm install
npm run dev
```

### 2. Chrome Extension
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `/extension` folder
5. Pin the extension to toolbar

### 3. ElevenLabs Agent
See [docs/AGENT_SETUP.md](docs/AGENT_SETUP.md) for full setup instructions.

## Project Structure
```
├── web/                    # Next.js frontend
│   ├── src/app/           # Pages
│   │   ├── page.tsx       # Main conversation UI
│   │   └── demo-form/     # Test gemeente form
│   ├── src/components/    # React components
│   ├── src/hooks/         # Custom hooks
│   └── src/lib/           # Utils & config
├── extension/             # Chrome Manifest V3 extension
│   ├── manifest.json
│   ├── background.js      # Service worker
│   ├── content.js         # Form extraction & filling
│   └── popup.*            # Extension popup UI
└── docs/                  # Documentation
    ├── SPEC.md            # Full technical spec
    └── AGENT_SETUP.md     # ElevenLabs setup guide
```

## Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind
- **Voice/AI:** ElevenLabs Conversational AI
- **Extension:** Chrome Manifest V3
- **Hosting:** Vercel

## Privacy Architecture
```
SENT TO SERVER:              STAYS LOCAL:
├─ Voice audio (Q&A only)    ├─ All PII values
├─ Form schema (labels)      ├─ Filled form data
└─ Placeholder tokens        └─ Local storage
```

The AI only sees placeholder tokens like `[FIRST_NAME]`. Real values are swapped in client-side.

## Demo Flow
1. User speaks in their language (e.g., Arabic)
2. Agent explains Dutch bureaucracy process
3. User fills secure local PII form
4. Navigate to gemeente form, click "Capture Form"
5. Agent maps fields to placeholders
6. Extension auto-fills form with real values locally
7. User reviews and submits manually

## Team
Built by **Zen & Magdy** at Heerlen Hackathon 2026
