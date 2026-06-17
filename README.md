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
└── backend/           → deploy to Railway (powers the chatbot)
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
1. **Backend → Railway:** push `backend/` to GitHub → deploy → set `GROQ_API_KEY` (free at console.groq.com). Copy the Railway URL.
2. **Connect:** set `BACKEND_URL` at the top of `frontend/script.js` to that URL.
3. **Frontend → Vercel:** push `frontend/` to GitHub → import → root dir `frontend` → deploy.

Full details in `CLAUDE.md`.

## Updating the bot's knowledge
Edit `SYSTEM_PROMPT` in `backend/main.py`. Keep the "ABSOLUTE RULES" intact so it stays context-locked.
