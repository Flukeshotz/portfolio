# CLAUDE.md — Harsh Vardhan Singh Portfolio

This file orients Claude Code on this project. Read it first.

## What this is
A recruiter-facing personal portfolio for **Harsh Vardhan Singh** (recent B.Tech CSE/AI-ML grad, aspiring AI Product Manager). It has two parts:

- `frontend/` — static site (HTML/CSS/JS). Deploys to **Vercel**. Bold, animated, "Electric Dusk" theme.
- `backend/` — FastAPI service powering the **"Ask Harsh"** AI chatbot. Now deployed on **Vercel alongside the site** (it also serves the static files). Uses **Groq** (free tier).

## The chatbot's defining behaviour (do not weaken this)
The chatbot is **context-locked**. Its entire knowledge lives in the `SYSTEM_PROMPT` string in `backend/main.py`. It must:
1. ONLY answer questions about Harsh.
2. REFUSE every off-topic question (general knowledge, coding help, other people, "write me X", etc.) with a short redirect.
3. NEVER invent facts, dates, numbers, or links — if unknown, point to harshvsingh.work@gmail.com.
4. Frame his technical depth as **"product-led and AI-assisted"** — honest, never claiming he's a from-scratch software engineer.

When editing the bot's knowledge, edit `SYSTEM_PROMPT` only. Keep the ABSOLUTE RULES section intact.

## Bot guardrails (added — don't weaken)
- `SYSTEM_PROMPT` rules 7–10 cover anti-injection, never-say-unverified-negatives, **confidentiality about employers**, and gentle-acknowledge-then-pivot for weakness/gap questions. The "HANDLING WEAKNESS / GAP" section holds the approved wording.
- **Rule 9 (CONFIDENTIALITY) is load-bearing — never weaken it.** The bot must never discuss an employer's specific bugs/defects, unreleased roadmap/pricing, internal analytics or absolute user counts, or names of colleagues/managers/reviewers/students. When adding new work experience, only add what is safe to say publicly: describe *Harsh's contributions and skills*, never the employer's internal information. `evals.py` has CONFID cases that test this.
- `INJECTION_RE` in `backend/main.py` is a narrow regex guard that returns a canned redirect for blatant prompt-extraction/jailbreak attempts before they hit the model. Keep it narrow — it must NOT block legit questions like "does Harsh know prompt engineering?".
- `backend/evals.py` is an adversarial test harness: `python evals.py <backend-url>` fires injection/off-topic/negative/normal prompts and flags bad replies. Run it after editing the prompt. Prompt-based guardrails reduce but never fully eliminate jailbreaks on an open model — re-run evals after changes.

## The end user
A **recruiter or hiring manager**. Everything should help them evaluate Harsh fast. The chatbot is the centrepiece feature.

## Local dev
- Frontend: just open `frontend/index.html` in a browser. Works immediately using built-in `fallbackAnswer()` in `script.js` (no backend needed for a demo).
- Backend:
  ```bash
  cd backend
  pip install -r requirements.txt
  export GROQ_API_KEY=your_key   # get free at console.groq.com
  uvicorn main:app --reload
  ```
  Test: `curl -X POST localhost:8000/chat -H "Content-Type: application/json" -d '{"message":"why hire him?"}'`

## Wiring frontend ↔ backend
`BACKEND_URL` in `script.js` is `""` — the chat posts to same-origin `/chat`, which works because the FastAPI app serves the site itself. Only set `BACKEND_URL` if the backend ever moves to a different origin. Any failure falls back to `fallbackAnswer()` automatically.

## Deploy
Push to `main` on **Flukeshotz/portfolio** → Vercel auto-deploys. `GROQ_API_KEY` is set in the Vercel project's environment variables (never in code — the repo is public).

## Verified facts (source of truth — never contradict)
- Name: Harsh Vardhan Singh · Email: harshvsingh.work@gmail.com
- LinkedIn: linkedin.com/in/harshv5111 · GitHub: github.com/Flukeshotz
- B.Tech CSE (AI/ML), SRM IST Kattankulathur, graduated May 2026, CGPA 8.53/10
- **Current role: Founder's Office Intern at Skillcase (started 25 Jun 2026 – present)** — EdTech (language learning & careers). Owns app, GTM, content. Public-safe description only, stated QUALITATIVELY: designed AI generation pipelines running in production (instructional imagery, audio/video lessons, structured assessment material, each expert-reviewed), user interviews, UX-friction triage, wireframes, content/social growth. **Per Harsh's explicit instruction: publish NO numbers, volumes, metrics, growth figures or user counts for Skillcase, and no internal specifics (bugs, unreleased features, colleague names).**
- HighRadius intern Sep 2025–Jan 2026; Next Leap PM Fellow Apr 2026–present; CMPDI Dec 2023
- Key metrics: 27 net-new discovery calls, MCR +15% above floor, 8,000+ reviews/week (PULSE), 50–70% effort cuts

### Project links (all verified, all public)
| Project | Live | Code |
|---|---|---|
| PULSE | ⚠️ hosted dashboard DOWN (was Railway) — link the repo until redeployed | https://github.com/Flukeshotz/PULSE |
| SIF Copilot | https://sif-rag.vercel.app/ | https://github.com/Flukeshotz/SIF_RAG |
| Gourmet AI | https://gourmet-ai-six.vercel.app/ | https://github.com/Flukeshotz/Gourmet-AI |
| Athena | — (internal) | https://github.com/Flukeshotz/Athena |
| AI Resume Screening | — | https://github.com/Flukeshotz/ai-assisted-resume-screening |
| Inpatient Pre-Auth | — | https://github.com/Flukeshotz/preauth-ops-automation-n8n |
| AQUA-SENTINEL | — | https://github.com/Flukeshotz/Aqua-Sentinel |
| Nexus AI | NOT fully built — describe as in-progress | https://github.com/Flukeshotz/nexus-ai |
| GDP Tracker | — | https://github.com/Flukeshotz/Country-wise-GDP-Target-Tracker |

## Deployment (current)
- **Live on Vercel: https://portfolio-tau-ashen-94.vercel.app** — one deployment serves BOTH the static site and the FastAPI `/chat` backend (`GROQ_API_KEY` is set there). `BACKEND_URL` in `script.js` stays `""` so the chat calls same-origin `/chat`; if no backend responds it silently falls back to `fallbackAnswer()`.
- Railway is no longer used. `Dockerfile`/`Procfile` remain for portability.
- Canonical/OG/Twitter/JSON-LD/sitemap/robots all point at the Vercel URL. **If the domain changes, update those in `index.html`, `robots.txt`, `sitemap.xml`.**
- ⚠️ **PULSE's hosted dashboard is down** (died with the Railway project). All three former "live dashboard" links now point at the GitHub repo. Restore the live URL once redeployed.
- `resume.pdf` is the public PM résumé, wired to the hero "Résumé" button. **It is generated from `resume-source.html`** — edit that, then re-render with:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=resume.pdf resume-source.html`
  Keep it to ONE page. It deliberately contains **no Skillcase internal numbers, bug specifics, in-review work, or colleague names** — only HighRadius/own-project metrics, which are public. Re-check that before republishing.
- `voice-strategy-case-study.pdf` ("From Ignored Feature to Growth Engine" Next Leap deck) is in `frontend/`, linked from the Next Leap timeline entry via `.tl-doc`.
- `og-image.png` (1200×630 share card) already exists in `frontend/` — keep it next to index.html.

## SEO / share files (added)
- `og-image.png` — social share preview card (LinkedIn/Slack/WhatsApp/X).
- `robots.txt`, `sitemap.xml` — crawl + indexing hints.
- `index.html <head>` — canonical, Open Graph, Twitter card, JSON-LD Person schema, inline SVG favicon, keyword-rich title/description.

## Story section — exec summary + expandable deep-dive
The `#story` section shows a short exec summary, then a **"Read the full journey"** button (`#storyToggle`) that smoothly expands a 7-chapter career narrative (`#storyFull` → `.journey` / `.jrn`). Toggle logic is in `script.js` (measured-height accordion with a 750ms settle guard); styles are `.story-toggle`/`.story-full`/`.journey` in `style.css`. To edit the narrative, edit the `.jrn` chapters in `index.html`. Keep it honest and curiosity-forward.

## PULSE review volume
PULSE reads **8,000+** reviews/week (not 800). If updating this number, change it in 4 places: `index.html` stat (`data-count`), `index.html` PULSE card, `script.js` fallback answer, and `main.py` SYSTEM_PROMPT.

## Image assets (added) — keep these next to index.html
- `pulse-overview.jpg`, `pulse-themes.jpg`, `pulse-trends.jpg`, `pulse-report.jpg`, `pulse-email.jpg` — live PULSE screenshots shown in the "Inside the flagship — PULSE" showcase (`#pulse` section). Web-optimised (~1600px, <130KB each).
- `voice-kpi-tree.jpg` — Voice Usage Rate KPI tree, shown in the Next Leap timeline entry.
- All are framed in browser-style cards; any `img[data-zoom]` opens a click-to-enlarge lightbox (logic in `script.js`, styles `.shot`/`.lb` in `style.css`). To add more screenshots, copy the `<figure class="shot">` pattern and add `data-zoom` to the `<img>`.

## Good next tasks (if asked to extend)
- Tighten CORS in `backend/main.py` to the real Vercel domain once known.
- Add light/dark toggle (currently dark only).
- Add simple analytics (e.g. Vercel Analytics) to see what recruiters ask.
- Rate-limit `/chat` to prevent abuse of the free Groq quota.

## Style notes
- Palette + type are defined in `:root` of `frontend/style.css` ("Electric Dusk").
- Respect `prefers-reduced-motion` (already handled).
- Keep the chatbot the hero feature — don't bury it.
