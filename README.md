# Harsh Vardhan Singh — Portfolio + "Ask Harsh" AI

A bold, animated portfolio with a recruiter-facing AI chatbot that knows everything about Harsh — and nothing else.

```
portfolio/
├── CLAUDE.md          → orientation for Claude Code (read first)
├── frontend/          → deploy to Vercel (static site)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── vercel.json
└── backend/           → FastAPI app (powers the chatbot; also serves the site)
    ├── main.py
    ├── requirements.txt
    ├── Procfile
    ├── railway.json
    └── .env.example
```

## The chatbot
"Ask Harsh" is built for recruiters. It answers only questions about Harsh — projects, experience, skills, fit — and politely refuses everything else. Its entire brain is the `SYSTEM_PROMPT` in `backend/main.py`. Runs on Groq's free tier, so it costs **$0**.

## Run locally (instant demo)
Open `frontend/index.html` in a browser. It works right away using built-in fallback answers — no backend required to show it off.

## Deploy (all free)
Live at **https://portfolio-tau-ashen-94.vercel.app** — a single Vercel deployment serves both the static site and the `/chat` API.

1. Push to `main` → Vercel auto-deploys.
2. Set `GROQ_API_KEY` in the Vercel project's environment variables (free at console.groq.com). Never commit it — this repo is public.
3. Leave `BACKEND_URL` in `script.js` empty; the chat posts to same-origin `/chat` and falls back to built-in answers if that's unavailable.

Full details in `CLAUDE.md`.

## Updating the bot's knowledge
Edit `SYSTEM_PROMPT` in `backend/main.py`. Keep the "ABSOLUTE RULES" intact so it stays context-locked.
