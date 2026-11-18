/* =========================================================
   LoveQuiz — moteur du quiz
   Paramètres d'URL (tous optionnels) :
     ?pour=Prénom   → prénom de la personne qui joue
     &de=Prénom     → ton prénom
     &g=f | m       → genre de la personne qui joue (accords), "f" par défaut
     &tel=336...    → ton numéro WhatsApp (international, sans +)
   Les questions sont dans js/questions.js
   ========================================================= */
(function () {
  "use strict";

  /* =======================================================
     1. ÉTAT & OUTILS
     ======================================================= */
  const params = new URLSearchParams(window.location.search);

  function clean(value, max) {
    if (!value) return "";
    return String(value).replace(/[<>{}|]/g, "").trim().slice(0, max);
  }

  const state = {
    to: clean(params.get("pour"), 30),
    from: clean(params.get("de"), 30),
    g: params.get("g") === "m" ? "m" : "f",
    phone: (params.get("tel") || "").replace(/\D/g, "").slice(0, 15),
    answers: [],        // { label, display }
    love: [],           // { value (0-10), weight }
    loveScore: 0,
    noAttempts: 0,
    activity: "",
    date: "",
    message: ""
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /** Remplace {m|f}, {nom}, {moi} dans un texte. */
  function fmt(str) {
    if (!str) return "";
    return String(str)
      .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => (state.g === "m" ? m : f))
      .replace(/\{nom\}/g, state.to || "toi")
      .replace(/\{moi\}/g, state.from || "moi");
  }

  /** Adresse de l'image Twemoji d'un emoji. */
  function emojiUrl(emoji) {
    const cps = Array.from(emoji).map((c) => c.codePointAt(0).toString(16));
    const list = emoji.includes("‍") ? cps : cps.filter((c) => c !== "fe0f");
    return "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/" + list.join("-") + ".svg";
  }

  /** Précharge toutes les images du quiz dès l'accueil (pas d'attente pendant le jeu). */
  const preloaded = [];
  function preloadImages() {
    window.QUIZ.forEach((ch) => {
      [ch.emoji].concat(ch.questions.map((q) => q.img || "💗")).forEach((e) => {
        const img = new Image();
        img.src = emojiUrl(e);
        preloaded.push(img);
      });
    });
  }

  /** Emoji → image (Twemoji). Si l'image ne charge pas, on garde l'emoji en texte. */
  function emojiImg(emoji, alt) {
    const img = document.createElement("img");
    img.alt = alt || "";
    img.src = emojiUrl(emoji);
    img.onerror = () => {
      const span = document.createElement("span");
      span.textContent = emoji;
      img.replaceWith(span);
    };
    return img;
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function shake(node) {
    node.classList.remove("shake");
    void node.offsetWidth;
    node.classList.add("shake");
  }

  /* Formes des cases (triangle, losange, rond, carré, cœur, étoile) */
  const SHAPES = [
    '<path d="M16 3 30 28H2z"/>',
    '<path d="M16 2 30 16 16 30 2 16z"/>',
    '<circle cx="16" cy="16" r="14"/>',
    '<rect x="3" y="3" width="26" height="26" rx="2"/>',
    '<path d="M16 29S3 20.5 3 11.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 13 3.5C29 20.5 16 29 16 29z"/>',
    '<path d="m16 2 4.2 9 9.8 1.1-7.3 6.6 2 9.7L16 23.5 7.3 28.4l2-9.7L2 12.1l9.8-1.1z"/>'
  ];
  function shapeSvg(i) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("class", "shape");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = SHAPES[i % SHAPES.length];
    return svg;
  }

  /* =======================================================
     2. NAVIGATION
     ======================================================= */
  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    const inQuiz = id === "s-question" || id === "s-chapter";
    $("#topbar").hidden = !inQuiz;
    $("#progress").hidden = !inQuiz;
    $("#footer").hidden = id !== "s-intro";
    window.scrollTo(0, 0);
  }

  // Liste à plat : [chapitre, question, question, …, chapitre, …]
  const STEPS = [];
  let totalQuestions = 0;
  window.QUIZ.forEach((ch, ci) => {
    STEPS.push({ kind: "chapter", ch, ci });
    ch.questions.forEach((q) => STEPS.push({ kind: "question", q, ch, n: ++totalQuestions }));
  });
  let stepIndex = -1;

  function nextStep() {
    stepIndex++;
    if (stepIndex >= STEPS.length) return showResult();
    const step = STEPS[stepIndex];
    if (step.kind === "chapter") renderChapter(step);
    else renderQuestion(step);
  }

  /* =======================================================
     3. ACCUEIL
     ======================================================= */
  function renderIntro() {
    if (state.to) {
      $("#intro-lead").textContent = (state.from ? state.from + " a préparé un quiz" : "Un quiz") + " rien que pour toi, " + state.to + " 💌";
      document.title = state.to + ", ce quiz est pour toi 💘";
    } else {
      $("#name-form").hidden = false;
      $("#intro-lead").textContent = (state.from ? state.from + " a préparé un quiz" : "Un quiz") + " rien que pour toi 💌";
    }

    const stats = $("#intro-stats");
    [totalQuestions + " questions", window.QUIZ.length + " chapitres", "≈ 4 minutes", "1 surprise à la fin 🎁"].forEach((t) =>
      stats.appendChild(el("li", null, t))
    );

    // Ta photo (facultatif) : dépose un fichier img/moi.jpg dans le repo
    const photo = $("#my-photo");
    photo.onload = () => (photo.hidden = false);
    photo.onerror = () => photo.remove();
  }

  $("#start").addEventListener("click", () => {
    if (!state.to) {
      const input = $("#name-input");
      const name = clean(input.value, 30);
      if (name.length < 2) {
        shake(input);
        $("#intro-feedback").textContent = name ? "C'est un peu court pour un prénom 🤔" : "Écris ton prénom d'abord 😅";
        input.focus();
        return;
      } else if (/\d/.test(name)) {
        shake(input);
        $("#intro-feedback").textContent = "Un prénom avec des chiffres ? T'es un robot ? 🤖";
        return;
      }
      state.to = name.charAt(0).toUpperCase() + name.slice(1);
    }
    $("#q-player").textContent = "👤 " + state.to;
    nextStep();
  });
  $("#name-form").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#start").click();
  });

  /* =======================================================
     4. CHAPITRES
     ======================================================= */
  function renderChapter(step) {
    $("#ch-num").textContent = "Chapitre " + (step.ci + 1) + " / " + window.QUIZ.length;
    $("#ch-title").textContent = fmt(step.ch.title);
    $("#ch-intro").textContent = fmt(step.ch.intro);
    $("#q-chapter").textContent = fmt(step.ch.title);
    const img = $("#ch-img");
    img.textContent = "";
    img.appendChild(emojiImg(step.ch.emoji));
    $("#ch-go").textContent = step.ci === 0 ? fmt("Je suis prêt{|e} !") : "On continue →";
    updateProgress();
    showScreen("s-chapter");
    $("#ch-go").focus({ preventScroll: true });
  }
  $("#ch-go").addEventListener("click", nextStep);

  function updateProgress() {
    const done = STEPS.slice(0, stepIndex).filter((s) => s.kind === "question").length;
    $("#progress-bar").style.width = (done / totalQuestions) * 100 + "%";
  }

  /* =======================================================
     5. QUESTIONS
     ======================================================= */
  let timerId = null;
  let answered = false;

  function renderQuestion(step) {
    const q = step.q;
    answered = false;
    updateProgress();

    $("#q-count").textContent = step.n + " / " + totalQuestions;
    $("#q-title").textContent = fmt(q.q);
    $("#q-hint").textContent = fmt(q.hint || "");
    const media = $("#q-img");
    media.textContent = "";
    media.appendChild(emojiImg(q.img || "💗"));

    const answers = $("#answers");
    const extra = $("#q-extra");
    answers.textContent = "";
    extra.textContent = "";
    answers.className = "answers";

    if (q.type === "single") buildSingle(q, answers);
    else if (q.type === "multi") buildMulti(q, answers, extra);
    else if (q.type === "text") buildText(q, extra);
    else if (q.type === "scale") buildScale(q, extra);

    startTimer(q);
    showScreen("s-question");
  }

  function makeTile(opt, i) {
    const b = el("button", "tile");
    b.type = "button";
    b.style.setProperty("--c", "var(--c" + (i % 6) + ")");
    b.appendChild(shapeSvg(i));
    b.appendChild(el("span", "t-label", fmt(opt.t)));
    if (opt.e) b.appendChild(el("span", "t-emoji", opt.e));
    return b;
  }

  /* ---- Choix unique (4 cases) ---- */
  function buildSingle(q, box) {
    q.options.forEach((opt, i) => {
      const tile = makeTile(opt, i);
      tile.addEventListener("click", () => {
        if (answered) return;
        $$(".tile").forEach((t) => {
          t.disabled = true;
          t.classList.toggle("dim", t !== tile);
        });
        tile.classList.add("chosen");
        record(q, fmt(opt.t), typeof opt.love === "number" ? opt.love : null);
        react(opt.e || "💗", opt.r || q.r || "Noté ✨");
      });
      box.appendChild(tile);
    });
  }

  /* ---- Choix multiples ---- */
  function buildMulti(q, box, extra) {
    if (q.options.length > 4) box.classList.add("six");
    const picked = new Set();
    const tiles = [];

    const submit = el("button", "btn big full", "Valider");
    submit.type = "button";

    function refresh() {
      tiles.forEach((t, i) => t.setAttribute("aria-pressed", picked.has(i) ? "true" : "false"));
      submit.disabled = picked.size < (q.min || 1);
      submit.textContent = picked.size ? "Valider (" + picked.size + ")" : "Choisis au moins une réponse";
    }

    q.options.forEach((opt, i) => {
      const tile = makeTile(opt, i);
      tile.appendChild(el("span", "check", "✓"));
      tile.addEventListener("click", () => {
        if (answered) return;
        if (picked.has(i)) {
          picked.delete(i);
        } else if (opt.only) {
          // Réponse exclusive : on efface les autres
          picked.clear();
          picked.add(i);
        } else {
          // Choisir une réponse normale enlève les réponses exclusives
          q.options.forEach((o, k) => { if (o.only) picked.delete(k); });
          if (q.max && picked.size >= q.max) {
            shake(tile);
            $("#q-hint").textContent = "Maximum " + q.max + " choix 😉";
            return;
          }
          picked.add(i);
        }
        refresh();
      });
      tiles.push(tile);
      box.appendChild(tile);
    });

    submit.addEventListener("click", () => {
      if (answered || picked.size < (q.min || 1)) return;
      const chosen = [...picked].sort((a, b) => a - b).map((i) => q.options[i]);
      tiles.forEach((t) => (t.disabled = true));

      let loveValue = null;
      if (q.options.some((o) => typeof o.love === "number")) {
        const sum = chosen.reduce((acc, o) => acc + (o.love || 0), 0);
        loveValue = clamp((q.base || 0) + sum, 0, 10);
      }
      record(q, chosen.map((o) => fmt(o.t)).join(", "), loveValue);

      // Réaction : celle de la 1re option choisie qui en a une, sinon celle de la question
      const special = chosen.find((o) => o.r);
      react(special ? special.e : q.img, special ? special.r : q.r || "Noté ✨");
    });

    extra.appendChild(submit);
    refresh();
  }

  /* ---- Réponse libre ---- */
  function buildText(q, extra) {
    const input = el("input");
    input.type = "text";
    input.maxLength = 80;
    input.placeholder = fmt(q.placeholder || "Ta réponse…");
    input.setAttribute("aria-label", fmt(q.q));

    const row = el("div", "row");
    const ok = el("button", "btn big", "Valider");
    ok.type = "button";
    row.appendChild(ok);

    const skip = el("button", "btn skip", "Je préfère ne pas répondre");
    skip.type = "button";

    function submit() {
      if (answered) return;
      const value = clean(input.value, 80);
      if (value.length < 2) {
        shake(input);
        $("#q-hint").textContent = value ? "Un peu plus que ça 😅" : "Écris quelque chose (ou passe 👇)";
        input.focus();
        return;
      }
      record(q, value, null);
      react("✨", fmt(q.r || "Noté ✨").replace(/\{rep\}/g, value));
    }

    ok.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    skip.addEventListener("click", () => {
      if (answered) return;
      record(q, "(pas de réponse)", null);
      react("🤐", "Mystère… j'aime bien les mystères 😏");
    });

    extra.appendChild(input);
    extra.appendChild(row);
    extra.appendChild(skip);
    setTimeout(() => input.focus({ preventScroll: true }), 350);
  }

  /* ---- Curseur ---- */
  function levelFor(q, v) {
    return (q.levels || []).find((l) => v <= l.max) || { e: "💗", t: "" };
  }

  function buildScale(q, extra) {
    const box = el("div", "scale-box");
    const emoji = el("span", "scale-emoji");
    const val = el("div", "scale-val");
    const txt = el("p", "scale-txt");
    const range = el("input");
    range.type = "range";
    range.min = q.min;
    range.max = q.max;
    range.step = q.step || 1;
    range.value = Math.round((q.min + q.max) / 2);
    range.setAttribute("aria-label", fmt(q.q));

    function update() {
      const v = Number(range.value);
      const lv = levelFor(q, v);
      val.textContent = v + (q.unit || "");
      emoji.textContent = lv.e;
      txt.textContent = fmt(lv.t);
    }
    range.addEventListener("input", update);

    const ok = el("button", "btn big full", "C'est ma réponse");
    ok.type = "button";
    ok.addEventListener("click", () => {
      if (answered) return;
      const v = Number(range.value);
      const lv = levelFor(q, v);
      const love = q.love ? ((v - q.min) / (q.max - q.min)) * 10 : null;
      record(q, v + (q.unit || ""), love);
      react(lv.e, fmt(lv.t));
    });

    box.append(emoji, val, txt, range);
    extra.append(box, ok);
    update();
  }

  /* ---- Chrono (questions "single") ---- */
  function startTimer(q) {
    clearInterval(timerId);
    const timer = $("#timer");
    if (!q.time) { timer.hidden = true; return; }

    const ring = $("#t-ring");
    const CIRC = 119.4;
    let left = q.time;
    timer.hidden = false;
    timer.classList.remove("low");
    ring.style.transition = "none";
    ring.style.strokeDashoffset = 0;
    void ring.offsetWidth;
    ring.style.transition = "";
    $("#t-num").textContent = left;

    timerId = setInterval(() => {
      if (answered) return clearInterval(timerId);
      left--;
      $("#t-num").textContent = left;
      ring.style.strokeDashoffset = CIRC * (1 - left / q.time);
      timer.classList.toggle("low", left <= 5);
      if (left <= 0) {
        clearInterval(timerId);
        $$(".tile").forEach((t) => { t.disabled = true; t.classList.add("dim"); });
        record(q, "(temps écoulé)", null);
        react("🐢", fmt("Trop lent{|e} ! Je note « mystère » 😏"));
      }
    }, 1000);
  }

  /* ---- Enregistrement d'une réponse ---- */
  function record(q, display, loveValue) {
    answered = true;
    clearInterval(timerId);
    state.answers.push({ label: fmt(q.label || q.q), display: display });
    if (loveValue != null) state.love.push({ value: loveValue, weight: q.weight || 1 });
  }

  /* ---- Bandeau de réaction (puis question suivante) ---- */
  let reactToken = 0;
  function react(emoji, text) {
    const box = $("#reaction");
    const bar = $("#r-bar");
    const token = ++reactToken;
    const duration = clamp(1800 + text.length * 35, 2400, 4500);

    $("#r-emoji").textContent = emoji || "💗";
    $("#r-text").textContent = text;
    box.hidden = false;
    bar.classList.remove("run");
    bar.style.setProperty("--d", duration + "ms");
    void bar.offsetWidth;
    bar.classList.add("run");

    const go = () => {
      if (token !== reactToken) return;
      reactToken++;
      box.hidden = true;
      nextStep();
    };
    $("#r-next").onclick = go;
    $("#r-next").focus({ preventScroll: true });
    setTimeout(go, duration);
  }

  /* =======================================================
     6. RÉSULTAT : score d'amour
     ======================================================= */
  function computeLove() {
    const totalW = state.love.reduce((a, l) => a + l.weight, 0);
    if (!totalW) return 50;
    const sum = state.love.reduce((a, l) => a + l.value * l.weight, 0);
    return Math.round((sum / totalW) * 10);
  }

  function showResult() {
    $("#progress-bar").style.width = "100%";
    state.loveScore = computeLove();
    const score = state.loveScore;
    const v = window.VERDICTS.find((x) => score >= x.min) || window.VERDICTS[window.VERDICTS.length - 1];

    $("#v-emoji").textContent = v.e;
    $("#v-title").textContent = fmt(v.title);
    $("#v-text").textContent = fmt(v.t);

    // Quelques réponses mises en avant
    const hl = $("#highlights");
    hl.textContent = "";
    ["Ce que j'aime chez toi", "Toi en 3 mots", "Ce qui me freine"].forEach((label) => {
      const a = state.answers.find((x) => x.label === label);
      if (!a || a.display.startsWith("(")) return;
      const li = el("li");
      li.appendChild(el("b", null, label + " : "));
      li.appendChild(document.createTextNode(a.display));
      hl.appendChild(li);
    });

    showScreen("s-result");

    // Animation de la jauge + compteur
    const fill = $("#m-fill");
    const num = $("#m-num");
    const CIRC = 326.7;
    requestAnimationFrame(() => (fill.style.strokeDashoffset = CIRC * (1 - score / 100)));
    const t0 = performance.now();
    (function count(now) {
      const p = Math.min(1, (now - t0) / 2200);
      num.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(count);
      else {
        $(".verdict").classList.add("show");
        if (score >= 65) confetti();
      }
    })(t0);
  }

  $("#to-ask").addEventListener("click", () => {
    const title = $("#ask-title");
    title.textContent = (state.to ? state.to + ", t" : "T") + "u veux sortir avec moi ?";
    if (state.loveScore < 45) $("#ask-feedback").textContent = "Le score est pas fou… mais je tente quand même 🙏";
    showScreen("s-ask");
  });

  /* =======================================================
     7. OUI / NON — le Non fuit sur tout l'écran
        sans jamais chevaucher le bouton Oui
     ======================================================= */
  const yesBtn = $("#yes");
  const noBtn = $("#no");
  const NO_TEXTS = [
    "Non", "T'es sûr{|e} ?", "Vraiment ?", "Réfléchis bien…", "Regarde le score !",
    "Dernière chance", "Tu me brises le cœur 💔", "Allez stp 🥺", "Je vais pleurer…",
    "Même pas en rêve", "Bon ok, clique Oui"
  ];
  const ASK_EMOJIS = ["🥺", "😳", "😟", "🤨", "😥", "😭", "💔", "🥹", "😿", "😤", "🙏"];
  const MAX_ATTEMPTS = NO_TEXTS.length + 1;
  const YES_MAX_SCALE = 1.6;
  let lastDodge = 0;

  function yesScale(n) {
    return Math.min(1 + n * 0.07, YES_MAX_SCALE);
  }

  /** Zone interdite = bouton Oui à sa taille FINALE (après grossissement) + marge. */
  function forbiddenRect(scale) {
    const r = yesBtn.getBoundingClientRect();     // le centre ne bouge pas avec scale()
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const w = yesBtn.offsetWidth * scale;
    const h = yesBtn.offsetHeight * scale;
    const pad = 28;
    return { l: cx - w / 2 - pad, r: cx + w / 2 + pad, t: cy - h / 2 - pad, b: cy + h / 2 + pad };
  }

  function overlaps(x, y, w, h, z) {
    return x < z.r && x + w > z.l && y < z.b && y + h > z.t;
  }

  function placeNo(scale) {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const m = 16;
    const w = noBtn.offsetWidth;
    const h = noBtn.offsetHeight;
    const zone = forbiddenRect(scale);
    const cur = noBtn.getBoundingClientRect();
    const maxX = Math.max(m, vw - w - m);
    const maxY = Math.max(m, vh - h - m);

    let spot = null;
    for (let i = 0; i < 80 && !spot; i++) {
      const x = m + Math.random() * (maxX - m);
      const y = m + Math.random() * (maxY - m);
      if (overlaps(x, y, w, h, zone)) continue;
      // On veut qu'il parte vraiment loin de là où il était
      if (i < 60 && Math.hypot(x - cur.left, y - cur.top) < Math.min(vw, vh) * 0.3) continue;
      spot = { x, y };
    }
    // Secours : le coin le plus éloigné du Oui
    if (!spot) {
      const corners = [[m, m], [maxX, m], [m, maxY], [maxX, maxY]];
      const zc = { x: (zone.l + zone.r) / 2, y: (zone.t + zone.b) / 2 };
      corners.sort((a, b) => Math.hypot(b[0] - zc.x, b[1] - zc.y) - Math.hypot(a[0] - zc.x, a[1] - zc.y));
      spot = { x: corners[0][0], y: corners[0][1] };
    }
    noBtn.style.left = spot.x + "px";
    noBtn.style.top = spot.y + "px";
  }

  function dodge() {
    const now = Date.now();
    if (now - lastDodge < 450) return; // évite le double déclenchement (toucher + clic)
    lastDodge = now;

    state.noAttempts++;
    const n = state.noAttempts;
    const scale = yesScale(n);

    $("#ask-emoji").textContent = ASK_EMOJIS[Math.min(n, ASK_EMOJIS.length - 1)];
    yesBtn.style.transform = "scale(" + scale + ")";

    // Trop de tentatives : le bouton Non démissionne
    if (n >= MAX_ATTEMPTS) {
      noBtn.remove();
      $("#ask-feedback").textContent = "Le bouton Non a démissionné. Il ne reste que Oui 😏";
      return;
    }

    noBtn.textContent = fmt(NO_TEXTS[Math.min(n, NO_TEXTS.length - 1)]);

    // 1re fuite : on sort le bouton de la carte pour qu'il puisse aller partout
    if (!noBtn.classList.contains("runaway")) {
      const r = noBtn.getBoundingClientRect();
      document.body.appendChild(noBtn);
      noBtn.classList.add("runaway");
      noBtn.style.left = r.left + "px";
      noBtn.style.top = r.top + "px";
      void noBtn.offsetWidth;
    }
    placeNo(scale);

    if (n === 3) $("#ask-feedback").textContent = "Il est rapide hein 😏";
    else if (n === 6) $("#ask-feedback").textContent = "Tu sais que tu peux juste cliquer sur Oui ?";
  }

  // Souris : il fuit au survol. Tactile : il fuit dès qu'on le touche.
  noBtn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") dodge(); });
  noBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); dodge(); });
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.detail === 0) dodge(); // detail = 0 → clic au clavier (Entrée / Espace)
  });

  // Si l'écran tourne / change de taille, on le remet dans l'écran
  window.addEventListener("resize", () => {
    if (noBtn.classList.contains("runaway") && noBtn.isConnected) placeNo(yesScale(state.noAttempts));
  });

  yesBtn.addEventListener("click", () => {
    noBtn.remove();
    confetti();
    setTimeout(() => {
      showScreen("s-date");
      buildActivities();
    }, 700);
  });

  /* =======================================================
     8. RENDEZ-VOUS
     ======================================================= */
  // Activité proposée selon sa réponse "Date idéal"
  const ACTIVITIES = [
    { v: "un resto", t: "🍝 Resto" },
    { v: "un ciné", t: "🎬 Ciné" },
    { v: "une balade de nuit", t: "🌙 Balade" },
    { v: "une activité fun", t: "🎳 Activité fun" },
    { v: "une soirée film à la maison", t: "🍿 Film à la maison" },
    { v: "un café / brunch", t: "☕ Café / brunch" }
  ];
  const DATE_TO_ACTIVITY = { "Resto chic": 0, "Ciné + popcorn": 1, "Balade de nuit": 2, "Activité fun": 3 };

  function buildActivities() {
    const box = $("#activities");
    if (box.childElementCount) return;
    const pref = state.answers.find((a) => a.label === "Date idéal");
    const prefIndex = pref ? DATE_TO_ACTIVITY[pref.display] : undefined;

    ACTIVITIES.forEach((a, i) => {
      const chip = el("button", "chip", a.t + (i === prefIndex ? " ⭐" : ""));
      chip.type = "button";
      chip.setAttribute("role", "radio");
      chip.setAttribute("aria-checked", "false");
      chip.addEventListener("click", () => {
        $$(".chip").forEach((c) => c.setAttribute("aria-checked", "false"));
        chip.setAttribute("aria-checked", "true");
        state.activity = a.v;
        $("#date-feedback").textContent = "";
      });
      box.appendChild(chip);
    });
    if (prefIndex !== undefined) $("#date-feedback").textContent = "⭐ = ton date idéal d'après le quiz";
  }

  const dateInput = $("#date-input");
  const todayISO = toISODate(new Date());
  dateInput.min = todayISO;

  function toISODate(d) {
    const p = (x) => String(x).padStart(2, "0");
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  function formatDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  }

  $("#date-next").addEventListener("click", () => {
    const date = dateInput.value;
    state.message = clean($("#msg-input").value, 200);

    if (!state.activity) {
      $("#date-feedback").textContent = "Choisis une activité d'abord 👆";
      shake($("#activities"));
    } else if (!date) {
      $("#date-feedback").textContent = "Il manque le jour 📅";
      shake(dateInput);
    } else if (date < todayISO) {
      $("#date-feedback").textContent = "On ne peut pas remonter le temps 😅";
      shake(dateInput);
    } else {
      state.date = date;
      renderDone();
      showScreen("s-done");
      confetti();
    }
  });

  /* =======================================================
     9. FIN : ticket + envoi des réponses
     ======================================================= */
  function buildMessage() {
    const lines = [];
    lines.push("💘 LoveQuiz de " + (state.to || "?") + (state.from ? " pour " + state.from : ""));
    lines.push("Score d'amour : " + state.loveScore + " %");
    lines.push("✅ C'est OUI !" + (state.noAttempts ? " (après " + state.noAttempts + " tentative" + (state.noAttempts > 1 ? "s" : "") + " sur Non 🙈)" : ""));
    lines.push("📅 RDV : " + state.activity + " le " + formatDate(state.date));
    if (state.message) lines.push("💬 « " + state.message + " »");
    lines.push("");
    lines.push("— Mes réponses —");
    state.answers.forEach((a) => lines.push("• " + a.label + " : " + a.display));
    return lines.join("\n");
  }

  function renderDone() {
    const ticket = $("#ticket");
    ticket.textContent = "";
    [
      ["Avec", state.from || "ton crush"],
      ["Quoi", state.activity],
      ["Quand", formatDate(state.date)],
      ["Score d'amour", state.loveScore + " %"]
    ].forEach(([k, v]) => {
      const row = el("div");
      row.appendChild(el("strong", null, k + " : "));
      row.appendChild(document.createTextNode(v));
      ticket.appendChild(row);
    });
    if (state.message) ticket.appendChild(el("div", "note", "« " + state.message + " »"));

    const list = $("#recap-list");
    list.textContent = "";
    state.answers.forEach((a) => {
      const li = el("li");
      li.appendChild(el("b", null, a.label + " : "));
      li.appendChild(document.createTextNode(a.display));
      list.appendChild(li);
    });

    const text = buildMessage();
    const send = $("#send");
    const who = state.from ? " à " + state.from : "";
    if (state.phone) {
      send.href = "https://wa.me/" + state.phone + "?text=" + encodeURIComponent(text);
      send.textContent = "Envoyer mes réponses" + who + " sur WhatsApp 📲";
    } else if (navigator.share) {
      send.href = "#";
      send.textContent = "Envoyer mes réponses" + who + " 📲";
      send.onclick = (e) => {
        e.preventDefault();
        navigator.share({ text }).catch(() => {});
      };
    } else {
      send.href = "sms:?&body=" + encodeURIComponent(text);
      send.textContent = "Envoyer mes réponses par SMS 📲";
    }
  }

  $("#restart").addEventListener("click", () => window.location.reload());

  /* =======================================================
     10. DÉCOR : cœurs flottants + confettis
     ======================================================= */
  function spawnHearts() {
    const box = $(".hearts");
    const icons = ["💗", "💕", "💖", "❤️", "💘", "✨"];
    for (let i = 0; i < 16; i++) {
      const h = el("span", null, icons[i % icons.length]);
      h.style.left = Math.random() * 100 + "%";
      h.style.setProperty("--size", 14 + Math.random() * 20 + "px");
      h.style.setProperty("--dur", 10 + Math.random() * 10 + "s");
      h.style.setProperty("--delay", -Math.random() * 18 + "s");
      box.appendChild(h);
    }
  }

  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = $("#confetti");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = innerWidth, H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const colors = ["#e21b3c", "#1368ce", "#d89e00", "#26890c", "#ffffff", "#e6336b"];
    const pieces = Array.from({ length: 160 }, () => ({
      x: W / 2, y: H * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -16 - 4,
      s: 6 + Math.random() * 7,
      c: colors[(Math.random() * colors.length) | 0],
      r: Math.random() * Math.PI,
      heart: Math.random() < 0.3
    }));

    let frame = 0;
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      pieces.forEach((p) => {
        p.vy += 0.38; p.vx *= 0.99;
        p.x += p.vx; p.y += p.vy; p.r += 0.12;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        if (p.heart) {
          ctx.font = p.s * 2 + "px serif";
          ctx.fillText("💖", 0, 0);
        } else {
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        }
        ctx.restore();
      });
      if (++frame < 190) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    })();
  }

  /* =======================================================
     DÉMARRAGE
     ======================================================= */
  renderIntro();
  preloadImages();
  spawnHearts();
})();
