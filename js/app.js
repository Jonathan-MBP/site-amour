/* =========================================================
   Une parenthèse pour toi — moteur du site
   Paramètres d'URL (tous optionnels) :
     ?pour=Prénom   → prénom de la personne
     &de=Prénom     → ton prénom
     &g=f | m       → accords (elle / il), "f" par défaut
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
    answers: [],   // { label, display }
    love: [],      // { value 0–10, weight }
    loveScore: 0,
    noAttempts: 0,
    activity: "",
    date: "",
    message: ""
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /** Remplace {m|f}, {nom}, {moi}. */
  function fmt(str) {
    if (!str) return "";
    return String(str)
      .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => (state.g === "m" ? m : f))
      .replace(/\{nom\}/g, state.to || "toi")
      .replace(/\{moi\}/g, state.from || "moi");
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function shake(node) {
    node.classList.remove("shake");
    void node.offsetWidth;
    node.classList.add("shake");
  }

  /* =======================================================
     2. FOND PHOTO (fondu enchaîné entre deux calques)
     ======================================================= */
  const layers = [$("#bgA"), $("#bgB")];
  let front = 0;
  let currentBg = "";
  const cache = {};

  function preload(url) {
    if (!url || cache[url]) return cache[url];
    cache[url] = new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => resolve(url);
      img.src = url;
    });
    return cache[url];
  }

  function setBg(url) {
    if (!url || url === currentBg) return;
    currentBg = url;
    preload(url).then(() => {
      if (currentBg !== url) return; // un autre fond a été demandé entre-temps
      const next = layers[1 - front];
      next.style.backgroundImage = 'url("' + url + '")';
      next.classList.add("show");
      layers[front].classList.remove("show");
      front = 1 - front;
    });
  }

  /* =======================================================
     3. NAVIGATION
     ======================================================= */
  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    const inQuiz = id === "s-question" || id === "s-chapter";
    $("#top").hidden = !inQuiz;
    $("#footer").hidden = id !== "s-intro";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
  const STEPS = [];
  let total = 0;
  window.QUIZ.forEach((ch, ci) => {
    STEPS.push({ kind: "chapter", ch, ci });
    ch.questions.forEach((q) => STEPS.push({ kind: "question", q, ch, n: ++total }));
  });
  let stepIndex = -1;

  /** Précharge les photos des 2 prochaines étapes. */
  function preloadAhead() {
    for (let k = 1; k <= 2; k++) {
      const s = STEPS[stepIndex + k];
      if (!s) break;
      if (s.kind === "chapter") preload(s.ch.bg);
      else {
        preload(s.q.bg);
        (s.q.options || []).forEach((o) => o.img && preload(o.img));
      }
    }
  }

  function nextStep() {
    stepIndex++;
    if (stepIndex >= STEPS.length) return showResult();
    const s = STEPS[stepIndex];
    if (s.kind === "chapter") renderChapter(s);
    else renderQuestion(s);
    preloadAhead();
  }

  function updateThread() {
    const done = STEPS.slice(0, stepIndex).filter((s) => s.kind === "question").length;
    $("#thread-fill").style.width = (done / total) * 100 + "%";
  }

  /* =======================================================
     4. ACCUEIL
     ======================================================= */
  function renderIntro() {
    setBg("img/bg-intro.jpg");
    if (state.to) {
      $("#intro-eyebrow").textContent = "Pour " + state.to;
      document.title = state.to + ", quelques mots pour toi 🌹";
    } else {
      $("#name-form").hidden = false;
    }
    if (state.from) {
      $("#intro-title").textContent = state.from + " a écrit quelque chose rien que pour toi";
    }
    $(".tiny").textContent = "Environ 5 minutes · " + total + " petites questions · une surprise à la fin";

    const photo = $("#my-photo");
    photo.onload = () => (photo.hidden = false);
    photo.onerror = () => photo.remove();

    // On prépare déjà le premier chapitre
    preload(window.QUIZ[0].bg);
    preload(window.QUIZ[0].questions[0].bg);
  }

  $("#start").addEventListener("click", () => {
    if (!state.to) {
      const input = $("#name-input");
      const name = clean(input.value, 30);
      if (name.length < 2) {
        shake(input);
        $("#intro-feedback").textContent = name ? "C'est un peu court pour un prénom…" : "Dis-moi d'abord ton prénom ♡";
        input.focus();
        return;
      } else if (/\d/.test(name)) {
        shake(input);
        $("#intro-feedback").textContent = "Un prénom avec des chiffres ? 🙂";
        return;
      }
      state.to = name.charAt(0).toUpperCase() + name.slice(1);
    }
    nextStep();
  });
  $("#name-form").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#start").click();
  });

  /* =======================================================
     5. CHAPITRES
     ======================================================= */
  function renderChapter(s) {
    setBg(s.ch.bg);
    $("#ch-num").textContent = ROMAN[s.ci] || String(s.ci + 1);
    $("#ch-title").textContent = fmt(s.ch.title);
    $("#ch-quote").textContent = fmt(s.ch.quote);
    $("#top-chapter").textContent = fmt(s.ch.title);
    $("#ch-go").textContent = s.ci === 0 ? fmt("Je suis prêt{|e}") : "Continuer";
    updateThread();
    showScreen("s-chapter");
  }
  $("#ch-go").addEventListener("click", nextStep);

  /* =======================================================
     6. QUESTIONS
     ======================================================= */
  let answered = false;

  function renderQuestion(s) {
    const q = s.q;
    answered = false;
    setBg(q.bg || s.ch.bg);
    updateThread();

    $("#whisper").hidden = true;
    $("#q-body").classList.remove("away");
    $("#q-num").textContent = "Question " + s.n + " sur " + total;
    $("#q-title").textContent = fmt(q.q);
    $("#q-hint").textContent = fmt(q.hint || "");

    const answers = $("#answers");
    const extra = $("#extra");
    answers.textContent = "";
    extra.textContent = "";
    answers.className = "answers";

    if (q.type === "single") buildSingle(q, answers);
    else if (q.type === "multi") buildMulti(q, answers, extra);
    else if (q.type === "text") buildText(q, extra);
    else if (q.type === "scale") buildScale(q, extra);

    showScreen("s-question");
  }

  /** Crée une option : carte photo si "img", sinon bulle. */
  function makeOption(opt) {
    let b;
    if (opt.img) {
      b = el("button", "photo");
      b.style.backgroundImage = 'url("' + opt.img + '")';
      b.appendChild(el("span", null, fmt(opt.t)));
    } else {
      b = el("button", "opt");
      if (opt.e) b.appendChild(el("span", "e", opt.e));
      b.appendChild(el("span", null, fmt(opt.t)));
    }
    b.type = "button";
    return b;
  }

  /* ---- Choix unique ---- */
  function buildSingle(q, box) {
    const hasPhotos = q.options.some((o) => o.img);
    box.classList.add(hasPhotos ? "photos" : "pills");

    q.options.forEach((opt) => {
      const b = makeOption(opt);
      b.addEventListener("click", () => {
        if (answered) return;
        Array.from(box.children).forEach((c) => {
          c.disabled = true;
          c.classList.toggle("faded", c !== b);
        });
        b.classList.add("chosen");
        record(q, fmt(opt.t), typeof opt.love === "number" ? opt.love : null);
        whisper(opt.r || q.r || "C'est noté ♡", 700);
      });
      box.appendChild(b);
    });
  }

  /* ---- Choix multiples ---- */
  function buildMulti(q, box, extra) {
    box.classList.add("pills", "wrap");
    const picked = new Set();
    const buttons = [];
    const submit = el("button", "btn primary full");
    submit.type = "button";

    function refresh() {
      buttons.forEach((b, i) => b.setAttribute("aria-pressed", picked.has(i) ? "true" : "false"));
      submit.disabled = picked.size < (q.min || 1);
      submit.textContent = picked.size ? "Valider" : "Choisis au moins une réponse";
    }

    q.options.forEach((opt, i) => {
      const b = makeOption(opt);
      b.addEventListener("click", () => {
        if (answered) return;
        if (picked.has(i)) picked.delete(i);
        else if (opt.only) { picked.clear(); picked.add(i); }
        else {
          q.options.forEach((o, k) => { if (o.only) picked.delete(k); });
          if (q.max && picked.size >= q.max) {
            shake(b);
            $("#q-hint").textContent = "Pas plus de " + q.max + ", choisis tes préférés ♡";
            return;
          }
          picked.add(i);
        }
        refresh();
      });
      buttons.push(b);
      box.appendChild(b);
    });

    submit.addEventListener("click", () => {
      if (answered || picked.size < (q.min || 1)) return;
      const chosen = [...picked].sort((a, b) => a - b).map((i) => q.options[i]);
      buttons.forEach((b) => (b.disabled = true));

      let loveValue = null;
      if (q.options.some((o) => typeof o.love === "number")) {
        const sum = chosen.reduce((acc, o) => acc + (o.love || 0), 0);
        loveValue = clamp((q.base || 0) + sum, 0, 10);
      }
      record(q, chosen.map((o) => fmt(o.t)).join(", "), loveValue);
      const special = chosen.find((o) => o.r);
      whisper(special ? special.r : q.r || "C'est noté ♡", 250);
    });

    extra.appendChild(submit);
    refresh();
  }

  /* ---- Réponse libre ---- */
  function buildText(q, extra) {
    const input = el("textarea", "field");
    input.rows = 2;
    input.maxLength = 120;
    input.placeholder = fmt(q.placeholder || "Écris ici…");
    input.setAttribute("aria-label", fmt(q.q));

    const ok = el("button", "btn primary full", "Valider");
    ok.type = "button";
    const skip = el("button", "btn link", "Je préfère garder ça pour moi");
    skip.type = "button";

    function submit() {
      if (answered) return;
      const value = clean(input.value, 120);
      if (value.length < 2) {
        shake(input);
        $("#q-hint").textContent = value ? "Un tout petit peu plus ?" : "Écris quelque chose, ou passe ↓";
        input.focus();
        return;
      }
      record(q, value, null);
      whisper(fmt(q.r || "C'est noté ♡").replace(/\{rep\}/g, value), 150);
    }

    ok.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    });
    skip.addEventListener("click", () => {
      if (answered) return;
      record(q, "(gardé secret)", null);
      whisper("Un petit mystère… j'aime bien ça.", 100);
    });

    extra.append(input, ok, skip);
  }

  /* ---- Curseur ---- */
  function levelFor(q, v) {
    return (q.levels || []).find((l) => v <= l.max) || { e: "♡", t: "" };
  }

  function buildScale(q, extra) {
    const wrap = el("div", "scale");
    const emoji = el("span", "scale-e");
    const val = el("div", "scale-v");
    const txt = el("p", "scale-t");
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
      range.style.setProperty("--p", ((v - q.min) / (q.max - q.min)) * 100 + "%");
    }
    range.addEventListener("input", update);

    const ok = el("button", "btn primary full", "C'est ma réponse");
    ok.type = "button";
    ok.addEventListener("click", () => {
      if (answered) return;
      const v = Number(range.value);
      record(q, v + (q.unit || ""), q.love ? ((v - q.min) / (q.max - q.min)) * 10 : null);
      whisper(fmt(levelFor(q, v).t) || "C'est noté ♡", 150);
    });

    wrap.append(emoji, val, txt, range);
    extra.append(wrap, ok);
    update();
  }

  /* ---- Enregistrement ---- */
  function record(q, display, loveValue) {
    answered = true;
    state.answers.push({ label: fmt(q.label || q.q), display });
    if (loveValue != null) state.love.push({ value: loveValue, weight: q.weight || 1 });
  }

  /* ---- Petit mot doux après chaque réponse ---- */
  function whisper(text, delay) {
    setTimeout(() => {
      $("#q-body").classList.add("away");
      $("#w-text").textContent = text;
      $("#whisper").hidden = false;
      $("#w-next").focus({ preventScroll: true });
    }, delay || 0);
  }
  $("#w-next").addEventListener("click", () => {
    if ($("#whisper").hidden) return;
    $("#whisper").hidden = true;
    nextStep();
  });

  /* =======================================================
     7. VERDICT
     ======================================================= */
  function computeLove() {
    const w = state.love.reduce((a, l) => a + l.weight, 0);
    if (!w) return 50;
    return Math.round((state.love.reduce((a, l) => a + l.value * l.weight, 0) / w) * 10);
  }

  function showResult() {
    $("#thread-fill").style.width = "100%";
    setBg("img/bg-hug.jpg");
    state.loveScore = computeLove();
    const score = state.loveScore;
    const v = window.VERDICTS.find((x) => score >= x.min) || window.VERDICTS[window.VERDICTS.length - 1];

    const title = $("#v-title");
    const text = $("#v-text");
    title.textContent = fmt(v.title);
    text.textContent = fmt(v.t);
    [title, text].forEach((n) => { n.classList.add("verdict-hide"); n.classList.remove("verdict-show"); });

    const list = $("#memories");
    list.textContent = "";
    ["Ce que j'aime chez toi", "Toi en 3 mots", "Voyage rêvé à deux"].forEach((label) => {
      const a = state.answers.find((x) => x.label === label);
      if (!a || a.display.startsWith("(")) return;
      const li = el("li");
      li.appendChild(el("b", null, label));
      li.appendChild(document.createTextNode(a.display));
      list.appendChild(li);
    });

    showScreen("s-result");

    // Le cœur se remplit doucement
    const fill = $("#h-fill");
    fill.style.transform = "translateY(110px)";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transform = "translateY(" + 110 * (1 - score / 100) + "px)";
    }));
    const num = $("#m-num");
    const t0 = performance.now();
    (function count(now) {
      const p = Math.min(1, (now - t0) / 2600);
      num.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(count);
      else {
        [title, text].forEach((n) => n.classList.add("verdict-show"));
        if (score >= 65) confetti();
      }
    })(t0);
  }

  $("#to-ask").addEventListener("click", () => {
    setBg("img/bg-sunset.jpg");
    $("#ask-title").textContent = (state.to ? state.to + ", t" : "T") + "u veux sortir avec moi ?";
    if (state.loveScore < 45) $("#ask-feedback").textContent = "Même si le cœur hésite encore… je tente ma chance.";
    showScreen("s-ask");
  });

  /* =======================================================
     8. OUI / NON — le Non s'enfuit partout sur l'écran,
        sans jamais se poser sur le Oui
     ======================================================= */
  const yesBtn = $("#yes");
  const noBtn = $("#no");
  const NO_TEXTS = [
    "Non", "Tu es sûr{|e} ?", "Vraiment ?", "Réfléchis encore…", "Regarde ton score",
    "Dernière chance", "Tu me brises le cœur", "S'il te plaît…", "Je vais pleurer",
    "Même pas en rêve", "Bon… clique sur Oui"
  ];
  const MAX_ATTEMPTS = NO_TEXTS.length + 1;
  let lastDodge = 0;

  const yesScale = (n) => Math.min(1 + n * 0.07, 1.6);

  /** Zone interdite = bouton Oui à sa taille finale + marge. */
  function forbiddenRect(scale) {
    const r = yesBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const w = yesBtn.offsetWidth * scale;
    const h = yesBtn.offsetHeight * scale;
    const pad = 28;
    return { l: cx - w / 2 - pad, r: cx + w / 2 + pad, t: cy - h / 2 - pad, b: cy + h / 2 + pad };
  }
  const overlaps = (x, y, w, h, z) => x < z.r && x + w > z.l && y < z.b && y + h > z.t;

  /** Zones à éviter en bonus (le titre et le petit texte), pour garder la question lisible. */
  function softZones() {
    return ["#ask-title", "#ask-feedback"].map((sel) => {
      const r = $(sel).getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top - 6, b: r.bottom + 6 };
    });
  }

  function placeNo(scale) {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const m = 16;
    const w = noBtn.offsetWidth;
    const h = noBtn.offsetHeight;
    const zone = forbiddenRect(scale);
    const soft = softZones();
    const cur = noBtn.getBoundingClientRect();
    const maxX = Math.max(m, vw - w - m);
    const maxY = Math.max(m, vh - h - m);

    let spot = null;
    for (let i = 0; i < 80 && !spot; i++) {
      const x = m + Math.random() * (maxX - m);
      const y = m + Math.random() * (maxY - m);
      if (overlaps(x, y, w, h, zone)) continue;
      if (i < 70 && soft.some((z) => overlaps(x, y, w, h, z))) continue;
      if (i < 60 && Math.hypot(x - cur.left, y - cur.top) < Math.min(vw, vh) * 0.3) continue;
      spot = { x, y };
    }
    if (!spot) {
      const zc = { x: (zone.l + zone.r) / 2, y: (zone.t + zone.b) / 2 };
      const corners = [[m, m], [maxX, m], [m, maxY], [maxX, maxY]]
        .sort((a, b) => Math.hypot(b[0] - zc.x, b[1] - zc.y) - Math.hypot(a[0] - zc.x, a[1] - zc.y));
      spot = { x: corners[0][0], y: corners[0][1] };
    }
    noBtn.style.left = spot.x + "px";
    noBtn.style.top = spot.y + "px";
  }

  function dodge() {
    const now = Date.now();
    if (now - lastDodge < 450) return; // évite le double déclenchement toucher + clic
    lastDodge = now;

    state.noAttempts++;
    const n = state.noAttempts;
    const scale = yesScale(n);
    yesBtn.style.transform = "scale(" + scale + ")";

    if (n >= MAX_ATTEMPTS) {
      noBtn.remove();
      $("#ask-feedback").textContent = "Le bouton Non est parti… il ne reste que Oui ♥";
      return;
    }
    noBtn.textContent = fmt(NO_TEXTS[Math.min(n, NO_TEXTS.length - 1)]);

    if (!noBtn.classList.contains("runaway")) {
      const r = noBtn.getBoundingClientRect();
      document.body.appendChild(noBtn);
      noBtn.classList.add("runaway");
      noBtn.style.left = r.left + "px";
      noBtn.style.top = r.top + "px";
      void noBtn.offsetWidth;
    }
    placeNo(scale);

    if (n === 3) $("#ask-feedback").textContent = "Il est timide, ce bouton…";
    else if (n === 6) $("#ask-feedback").textContent = "Tu sais que l'autre bouton est juste là ?";
  }

  noBtn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") dodge(); });
  noBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); dodge(); });
  noBtn.addEventListener("click", (e) => { e.preventDefault(); if (e.detail === 0) dodge(); });
  window.addEventListener("resize", () => {
    if (noBtn.classList.contains("runaway") && noBtn.isConnected) placeNo(yesScale(state.noAttempts));
  });

  yesBtn.addEventListener("click", () => {
    noBtn.remove();
    confetti();
    setTimeout(() => {
      setBg("img/bg-paris.jpg");
      buildActivities();
      showScreen("s-date");
    }, 900);
  });

  /* =======================================================
     9. RENDEZ-VOUS
     ======================================================= */
  const ACTIVITIES = [
    { v: "un dîner aux chandelles", t: "Dîner aux chandelles", img: "img/o-restaurant.jpg" },
    { v: "un ciné", t: "Ciné & pop-corn", img: "img/o-cinema.jpg" },
    { v: "une balade au coucher du soleil", t: "Balade au coucher du soleil", img: "img/bg-paris.jpg" },
    { v: "la fête foraine", t: "Fête foraine", img: "img/o-ferris.jpg" }
  ];

  function buildActivities() {
    const box = $("#activities");
    if (box.childElementCount) return;
    const pref = state.answers.find((a) => a.label === "Date idéal");

    ACTIVITIES.forEach((a) => {
      const b = makeOption(a);
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.addEventListener("click", () => {
        Array.from(box.children).forEach((c) => { c.classList.remove("chosen"); c.setAttribute("aria-checked", "false"); });
        b.classList.add("chosen");
        b.setAttribute("aria-checked", "true");
        state.activity = a.v;
        $("#date-feedback").textContent = "";
      });
      box.appendChild(b);
      if (pref && pref.display === a.t) b.click(); // on présélectionne son date idéal
    });
    if (pref) $("#date-feedback").textContent = "J'ai déjà choisi ton date idéal ♡ (tu peux changer)";
  }

  const dateInput = $("#date-input");
  const toISO = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const todayISO = toISO(new Date());
  dateInput.min = todayISO;

  function formatDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  }

  $("#date-next").addEventListener("click", () => {
    const date = dateInput.value;
    state.message = clean($("#msg-input").value, 200);
    if (!state.activity) {
      $("#date-feedback").textContent = "Choisis ce qu'on fait d'abord ♡";
      shake($("#activities"));
    } else if (!date) {
      $("#date-feedback").textContent = "Il manque le jour…";
      shake(dateInput);
    } else if (date < todayISO) {
      $("#date-feedback").textContent = "On ne peut pas remonter le temps 🙂";
      shake(dateInput);
    } else {
      state.date = date;
      renderDone();
      setBg("img/bg-roses.jpg");
      showScreen("s-done");
      confetti();
    }
  });

  /* =======================================================
     10. FIN : invitation + envoi des réponses
     ======================================================= */
  function buildMessage() {
    const L = [];
    L.push("🌹 " + (state.to || "Quelqu'un") + " a répondu" + (state.from ? ", " + state.from : "") + " !");
    L.push("💗 Score d'amour : " + state.loveScore + " %");
    L.push("✅ C'est OUI" + (state.noAttempts ? " (après " + state.noAttempts + " essai" + (state.noAttempts > 1 ? "s" : "") + " sur Non 🙈)" : "") + " !");
    L.push("📅 Rendez-vous : " + state.activity + ", " + formatDate(state.date));
    if (state.message) L.push("💌 « " + state.message + " »");
    L.push("");
    L.push("— Mes réponses —");
    state.answers.forEach((a) => L.push("• " + a.label + " : " + a.display));
    return L.join("\n");
  }

  function renderDone() {
    const inv = $("#invite");
    inv.textContent = "";
    [["Avec", state.from || "moi"], ["Pour", state.activity], ["Le", formatDate(state.date)]].forEach(([k, v]) => {
      inv.appendChild(el("div", "i-k", k));
      inv.appendChild(el("div", "i-v", v));
    });
    if (state.message) inv.appendChild(el("div", "i-note", "« " + state.message + " »"));

    const list = $("#recap-list");
    list.textContent = "";
    state.answers.forEach((a) => {
      const li = el("li");
      li.appendChild(el("b", null, a.label));
      li.appendChild(document.createTextNode(a.display));
      list.appendChild(li);
    });

    const text = buildMessage();
    const send = $("#send");
    const who = state.from ? " à " + state.from : "";
    if (state.phone) {
      send.href = "https://wa.me/" + state.phone + "?text=" + encodeURIComponent(text);
      send.textContent = "Envoyer mes réponses" + who + " sur WhatsApp";
    } else if (navigator.share) {
      send.href = "#";
      send.textContent = "Envoyer mes réponses" + who;
      send.onclick = (e) => { e.preventDefault(); navigator.share({ text }).catch(() => {}); };
    } else {
      send.href = "sms:?&body=" + encodeURIComponent(text);
      send.textContent = "Envoyer mes réponses par SMS";
    }
  }

  $("#restart").addEventListener("click", () => window.location.reload());

  /* =======================================================
     11. DÉCOR : pétales + pluie de cœurs
     ======================================================= */
  function spawnPetals() {
    const box = $(".petals");
    const count = window.innerWidth < 600 ? 12 : 20;
    for (let i = 0; i < count; i++) {
      const p = el("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.setProperty("--s", 9 + Math.random() * 10 + "px");
      p.style.setProperty("--d", 12 + Math.random() * 12 + "s");
      p.style.setProperty("--delay", -Math.random() * 20 + "s");
      p.style.setProperty("--x", (Math.random() * 120 - 60) + "px");
      box.appendChild(p);
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

    const colors = ["#ffd6e0", "#f7a1b8", "#e0527f", "#fff8f3", "#f3d9a4"];
    const pieces = Array.from({ length: 110 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.5,
      vx: (Math.random() - 0.5) * 1.6,
      vy: 1.5 + Math.random() * 2.5,
      s: 8 + Math.random() * 10,
      c: colors[(Math.random() * colors.length) | 0],
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.06,
      sway: Math.random() * Math.PI * 2
    }));

    function heart(x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.3);
      ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
      ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
      ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
      ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
      ctx.fill();
    }

    let frame = 0;
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      pieces.forEach((p) => {
        p.sway += 0.03;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.9;
        heart(0, -p.s / 2, p.s);
        ctx.restore();
      });
      if (++frame < 420) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    })();
  }

  /* =======================================================
     DÉMARRAGE
     ======================================================= */
  renderIntro();
  spawnPetals();
})();
