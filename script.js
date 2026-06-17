/* ============================================================
   HARSH VARDHAN SINGH — PORTFOLIO SCRIPT
   ============================================================ */

// ====== CONFIG ======
// Set this ONLY if the backend is on a DIFFERENT origin than this page
// (e.g. frontend on Vercel, backend on Railway): paste the Railway URL.
// Leave "" when the FastAPI backend serves this page itself (same Railway
// service) — the chat calls "/chat" directly. If no backend responds, the
// built-in fallbackAnswer() is used automatically.
const BACKEND_URL = "";

// ====== CUSTOM CURSOR ======
(function () {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring || window.matchMedia('(hover:none)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });
  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  const hoverables = 'a,button,.chip,[data-magnetic],[data-tilt],input';
  document.querySelectorAll(hoverables).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();

// ====== NAV REF (scroll handling unified below) ======
const nav = document.getElementById('nav');

// ====== REVEAL ON SCROLL ======
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal,[data-reveal]').forEach((el, i) => {
  el.style.transitionDelay = (el.classList.contains('line') ? i * 0.08 : 0) + 's';
  io.observe(el);
});

// ====== COUNT-UP STATS ======
const countEls = document.querySelectorAll('[data-count]');
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
countEls.forEach(el => countIO.observe(el));

// ====== MAGNETIC BUTTONS ======
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.25}px,${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

// ====== PROJECT CARD TILT + GLOW ======
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -6;
    const ry = (px - 0.5) * 8;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    card.style.setProperty('--mx', px * 100 + '%');
    card.style.setProperty('--my', py * 100 + '%');
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

// ====== UNIFIED SCROLL HANDLER (rAF-throttled, passive) ======
// One handler does the nav state + hero parallax, batched into a single
// frame so scrolling stays smooth. Parallax moves blurred layers, which is
// expensive — so we skip it on touch devices and when motion is reduced.
const blobs = document.querySelectorAll('.hero-blob');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const doParallax = !reduceMotion && !coarsePointer && blobs.length > 0;

let lastScrollY = window.scrollY;
let scrollTicking = false;

function onScrollFrame() {
  nav.classList.toggle('scrolled', lastScrollY > 40);
  if (doParallax) {
    for (let i = 0; i < blobs.length; i++) {
      blobs[i].style.transform = `translate3d(0, ${lastScrollY * (0.06 + i * 0.03)}px, 0)`;
    }
  }
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(onScrollFrame);
  }
}, { passive: true });
onScrollFrame(); // set initial state

/* ============================================================
   CHATBOT
   ============================================================ */
const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const chatText = document.getElementById('chatText');
const chatSend = document.getElementById('chatSend');
const suggestions = document.getElementById('chatSuggestions');

let history = [];

function addMessage(text, who) {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${who}`;
  const avatar = who === 'bot' ? 'H' : 'You';
  msg.innerHTML = `
    <div class="chat-avatar">${who === 'bot' ? 'H' : ''}</div>
    <div class="chat-bubble"></div>`;
  msg.querySelector('.chat-bubble').textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg;
}

function showTyping() {
  const msg = document.createElement('div');
  msg.className = 'chat-msg bot';
  msg.innerHTML = `
    <div class="chat-avatar">H</div>
    <div class="chat-bubble typing"><span></span><span></span><span></span></div>`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg;
}

async function sendQuestion(question) {
  if (!question.trim()) return;
  addMessage(question, 'user');
  chatText.value = '';
  chatSend.disabled = true;
  if (suggestions) suggestions.style.display = 'none';

  const typing = showTyping();

  try {
    let answer;
    const endpoint = (BACKEND_URL ? BACKEND_URL.replace(/\/+$/, '') : '') + '/chat';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history })
      });
      if (!res.ok) throw new Error('status ' + res.status);
      const data = await res.json();
      answer = data.reply || fallbackAnswer(question);
    } catch (_) {
      // no backend reachable (opened as a file, or static-only host) → use fallback
      answer = fallbackAnswer(question);
      await new Promise(r => setTimeout(r, 500));
    }
    typing.remove();
    const botMsg = addMessage('', 'bot');
    await typeOut(botMsg.querySelector('.chat-bubble'), answer);
    history.push({ role: 'user', content: question });
    history.push({ role: 'assistant', content: answer });
    if (history.length > 12) history = history.slice(-12);
  } catch (err) {
    typing.remove();
    addMessage("My AI backend isn't connected yet — but Harsh would love to hear from you directly at harshvsingh.work@gmail.com", 'bot');
  } finally {
    chatSend.disabled = false;
    chatText.focus();
  }
}

// Typewriter effect for bot replies
function typeOut(el, text) {
  return new Promise(resolve => {
    let i = 0;
    const speed = 12;
    function tick() {
      el.textContent = text.slice(0, i);
      chatWindow.scrollTop = chatWindow.scrollHeight;
      i++;
      if (i <= text.length) setTimeout(tick, speed);
      else resolve();
    }
    tick();
  });
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  sendQuestion(chatText.value);
});

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => sendQuestion(chip.dataset.q));
});

/* ============================================================
   FALLBACK ANSWERS (used only when backend not connected)
   Mirrors the strict, recruiter-only behaviour of the live AI.
   ============================================================ */
function fallbackAnswer(q) {
  const s = q.toLowerCase();

  // crude off-topic guard for the fallback (the real AI does this far better)
  const onTopic = /harsh|he|him|his|you|your|project|pulse|sif|gourmet|athena|pawpal|dog|case ?study|nexus|aqua|resume|preauth|pre-auth|gdp|highradius|next ?leap|cmpdi|hire|fit|skill|tech|code|coding|experience|intern|education|degree|college|contact|email|reach|linkedin|github|role|pm|product|available|availability|strength|weakness|build|ship|work|story|background|cgpa|srm/i;
  if (!onTopic.test(s)) {
    return "I'm only here to talk about Harsh Vardhan Singh — his work, projects, experience, and how he thinks about product. Ask me anything about that!";
  }

  if (s.includes('pulse'))
    return "PULSE is Harsh's strongest project — a live, autonomous product-intelligence pipeline. It scrapes 8,000+ fintech app reviews weekly (Groww, INDmoney, Zerodha), clusters them with UMAP + HDBSCAN, and runs a 5-stage anti-hallucination layer that proves every quote exists verbatim in the source before it ships. Runs itself via GitHub Actions every Monday, costs $0. Live: pulse-production-b034.up.railway.app · Code: github.com/Flukeshotz/PULSE";
  if (s.includes('highradius') || (s.includes('intern') && !s.includes('cmpdi')))
    return "At HighRadius (enterprise FinTech SaaS), Harsh interned 6 months and didn't wait to be assigned product work. He found two gaps himself: manual call auditing covering <15% of calls (built Athena, an AI scoring system) and SDRs juggling 4–5 tabs on live calls (built a unified workspace). The workspace drove 27 net-new discovery calls and lifted MCR 15% above team floor.";
  if (s.includes('hire') || s.includes('why') || s.includes('fit') || s.includes('strength'))
    return "Four reasons: (1) He ships — PULSE, SIF Copilot, and Gourmet AI are all LIVE, not slideware. (2) He finds the real problem before building — at HighRadius he observed SDRs instead of assuming. (3) He designs trust into AI systems — human-in-the-loop and anti-hallucination by default. (4) Real validated outcomes: 27 discovery calls, MCR +15%, 50–70% effort cuts. A builder who thinks like a PM — rare at entry level.";
  if (s.includes('strongest') || s.includes('best project'))
    return "PULSE — live, autonomous, and it solves a real PM pain point: it replaces hours of manually reading app reviews with a mathematically-grounded weekly fix-list. The 5-stage anti-hallucination layer (proving every quote is real) is what sets it apart from a generic ChatGPT summary. Live: pulse-production-b034.up.railway.app";
  if (s.includes('sif'))
    return "SIF Copilot is a live, source-grounded RAG platform for India's Specialised Investment Funds — 30+ strategies across 10+ AMCs, thousands of SEBI/AMFI pages indexed. Core principle: in finance, confidently-wrong data is worse than missing data, so it cites every source. Live: sif-rag.vercel.app · Code: github.com/Flukeshotz/SIF_RAG";
  if (s.includes('gourmet'))
    return "Gourmet AI is a live 3-agent system (Ranker → Critic → Synthesizer) on Llama-3. The Critic validates every output against a real candidate list using fuzzy matching, so zero hallucinated results reach the user. Cost-aware routing cut token spend ~70%. Live: gourmet-ai-six.vercel.app · Code: github.com/Flukeshotz/Gourmet-AI";
  if (s.includes('pawpal') || s.includes('dog') || s.includes('case study'))
    return "PawPal is Harsh's consumer product-strategy case study — a dog-walking app teardown that shows his pure product chops outside of AI builds. The reframe: owners aren't hiring a dog walker, they're hiring peace of mind, and the real barrier is trust, not walking. It covers Jobs-to-be-Done, 4 user segments, trust-first feature prioritisation, a North Star metric, and a subscription model with a real defensibility moat. The deck is downloadable on this site.";
  if (s.includes('athena'))
    return "Athena is an AI call-quality system Harsh built at HighRadius. Auditing was 100% manual, covering <15% of calls. He designed a deterministic 10-point scoring framework with human-in-the-loop routing so the AI never auto-decides on high-stakes calls. Stack: Gemini, Next.js, WebSockets, Python. Code: github.com/Flukeshotz/Athena";
  if (s.includes('code') || s.includes('technical') || s.includes('coding'))
    return "Harsh is product-led and AI-assisted. He owns the problem framing, system design, and the real decisions — why RAG over fine-tuning, why fuzzy-matching for quote validation, why a $0 architecture, why human-in-the-loop. He uses AI tooling to implement and ship fast. That's how live products like PULSE get built. His strength is product judgment and shipping, not writing code from scratch.";
  if (s.includes('education') || s.includes('study') || s.includes('college') || s.includes('degree') || s.includes('cgpa') || s.includes('srm'))
    return "B.Tech in Computer Science Engineering (AI/ML specialisation) from SRM Institute of Science & Technology, Kattankulathur — graduated May 2026, CGPA 8.53/10. Currently a Next Leap PM Fellow.";
  if (s.includes('contact') || s.includes('email') || s.includes('reach') || s.includes('linkedin') || s.includes('github'))
    return "Reach Harsh at harshvsingh.work@gmail.com, LinkedIn (linkedin.com/in/harshv5111), or GitHub (github.com/Flukeshotz). He's open to PM, AI PM, and Product Analyst roles across India and remote — happy to discuss timelines directly.";
  if (s.includes('role') || s.includes('looking') || s.includes('available') || s.includes('start'))
    return "Harsh is looking for Product Manager, AI PM, or Product Analyst roles — based in Chennai, open to relocation (Bengaluru, Gurgaon, PAN India) and remote. He's open to opportunities and happy to discuss timelines directly at harshvsingh.work@gmail.com.";
  if (s.includes('skill') || s.includes('tech') || s.includes('stack'))
    return "Product: PRDs, user research, KPI trees, prioritisation. AI: LLM integration, RAG, prompt engineering, human-in-the-loop design, agentic pipelines. Data: SQL, Python, Power BI, EDA. He builds with FastAPI, Qdrant, n8n, Groq, React. He's product-led and AI-assisted — strongest on product and architecture decisions.";
  if (s.includes('next leap') || s.includes('voice') || s.includes('research'))
    return "At the Next Leap PM Fellowship, Harsh ran 30+ surveys and 5 interviews on why Indians don't use ChatGPT voice. Key finding: 65–70% cited losing control of their input — not accuracy — as the blocker. He reframed it from a tech problem to an interaction-design problem and built a roadmap targeting 2% → 6% adoption.";
  if (s.includes('weakness') || s.includes('gap') || s.includes('shortcoming') || s.includes('red flag') || s.includes('why not') || s.includes('downside') || s.includes('concern'))
    return "Fair question — the honest bit is that his full-time experience is still early (6 months at HighRadius plus self-built projects), and he's product-led and AI-assisted rather than a from-scratch engineer. But that's exactly where the story gets good: he independently ships live products (PULSE, SIF Copilot, Gourmet AI), finds and frames real problems without being asked, and backs it with real outcomes — 27 discovery calls, MCR +15%, 8,000+ reviews/week. He learns fast and lives right at the product + AI intersection.";
  return "I can tell you about Harsh's live products (PULSE, SIF Copilot, Gourmet AI), his HighRadius impact, his Next Leap research, his skills, or how he thinks about product. What would you like to know? Or reach him directly at harshvsingh.work@gmail.com.";
}

/* ============================================================
   IMAGE LIGHTBOX (PULSE screenshots + KPI tree)
   ============================================================ */
(function () {
  const zoomables = document.querySelectorAll('img[data-zoom]');
  if (!zoomables.length) return;

  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = `
    <button class="lb-close" aria-label="Close">&times;</button>
    <img alt="" />
    <div class="lb-cap"></div>`;
  document.body.appendChild(lb);
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('.lb-cap');

  function open(src, cap) {
    lbImg.src = src;
    lbImg.alt = cap || '';
    lbCap.textContent = cap || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  zoomables.forEach(img => {
    img.addEventListener('click', () => {
      const fig = img.closest('figure');
      const cap = fig && fig.querySelector('figcaption')
        ? fig.querySelector('figcaption').textContent.trim()
        : img.alt;
      open(img.currentSrc || img.src, cap);
    });
  });

  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.classList.contains('lb-close')) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('open')) close();
  });
})();

/* ============================================================
   STORY — expandable full journey
   ============================================================ */
(function () {
  const toggle = document.getElementById('storyToggle');
  const full = document.getElementById('storyFull');
  if (!toggle || !full) return;
  const label = toggle.querySelector('.st-label');

  let endTimer;
  function onEnd(cb) {
    let done = false;
    const run = () => { if (done) return; done = true; full.removeEventListener('transitionend', te); cb(); };
    function te(e) { if (e.propertyName === 'height') run(); }
    full.addEventListener('transitionend', te);
    clearTimeout(endTimer);
    endTimer = setTimeout(run, 750); // guard: ensure we always settle to natural height
  }

  toggle.addEventListener('click', () => {
    clearTimeout(endTimer);
    const open = !full.classList.contains('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) label.textContent = open ? 'Collapse the story' : 'Read the full journey';

    if (open) {
      // chapters live inside a collapsed container, so the scroll-reveal
      // observer may never fire — reveal them explicitly before measuring.
      full.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in'));
      full.classList.add('open');
      full.style.height = 'auto';
      const target = full.offsetHeight;     // natural height with content shown
      full.style.height = '0px';
      void full.offsetHeight;               // commit the 0 state so the next change animates
      full.style.height = target + 'px';
      onEnd(() => { full.style.height = 'auto'; }); // grow naturally once open
    } else {
      full.style.height = full.offsetHeight + 'px'; // pin current height
      void full.offsetHeight;
      full.classList.remove('open');
      full.style.height = '0px';
    }
  });
})();
