/* =========================================================
   Site d'amour — logique principale
   Paramètres d'URL (tous optionnels) :
     ?pour=Prénom   → prénom de la personne qui reçoit le lien
     &de=Prénom     → ton prénom
     &tel=336...    → ton numéro WhatsApp (format international sans +)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Lecture & nettoyage des paramètres ---------- */
  const params = new URLSearchParams(window.location.search);

  function clean(value, max) {
    if (!value) return "";
    return value.replace(/[<>]/g, "").trim().slice(0, max);
  }

  const state = {
    to: clean(params.get("pour"), 30),
    from: clean(params.get("de"), 30),
    phone: (params.get("tel") || "").replace(/\D/g, "").slice(0, 15),
    quizAnswers: [],
    score: 5,
    noAttempts: 0,
    activity: "",
    date: "",
    message: ""
  };

  /* ---------- Raccourcis DOM ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------- Navigation entre les étapes ---------- */
  const ORDER = ["intro", "name", "quiz", "scale", "ask", "date", "done"];
  let current = "intro";

  function show(step) {
    $$(".step").forEach((s) => s.classList.toggle("active", s.dataset.step === step));
    current = step;
    const pct = (ORDER.indexOf(step) / (ORDER.length - 1)) * 100;
    $("#progress-bar").style.width = pct + "%";

    // Focus sur le premier élément utile pour le clavier / lecteurs d'écran
    const target = document.querySelector('.step.active input, .step.active button');
    if (target && step !== "intro") target.focus({ preventScroll: true });
  }

  function next() {
    let i = ORDER.indexOf(current) + 1;
    // Si le prénom est déjà connu via l'URL, on saute l'étape "name"
    if (ORDER[i] === "name" && state.to) i++;
    show(ORDER[i]);
  }

  function setFeedback(id, text) {
    $(id).textContent = text;
  }

  function shake(el) {
    el.classList.remove("shake");
    void el.offsetWidth; // relance l'animation
    el.classList.add("shake");
  }

  function fillNames() {
    $$(".name-slot").forEach((el) => {
      if (state.to) el.textContent = state.to;
    });
    $$(".from-slot").forEach((el) => {
      if (state.from) el.textContent = state.from;
    });
    if (state.to) document.title = state.to + ", j'ai une question pour toi 💌";
  }

  /* ---------- Étape 0 : intro ---------- */
  $('[data-step="intro"] [data-next]').addEventListener("click", next);

  /* ---------- Étape 1 : prénom ---------- */
  $("#name-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#name-input");
    const name = clean(input.value, 30);

    if (name === "") {
      shake(input);
      setFeedback("#name-feedback", "Allez, écris ton prénom 😅");
      return;
    }
    if (name.length < 2) {
      shake(input);
      setFeedback("#name-feedback", "C'est un peu court pour un prénom… 🤔");
      return;
    }
    if (/\d/.test(name)) {
      shake(input);
      setFeedback("#name-feedback", "Un prénom avec des chiffres ? T'es un robot ? 🤖");
      return;
    }

    state.to = name.charAt(0).toUpperCase() + name.slice(1);
    fillNames();

    if (state.from && state.to.toLowerCase() === state.from.toLowerCase()) {
      setFeedback("#name-feedback", "Attends… c'est toi qui as créé le lien 😂 Bon, on continue.");
      setTimeout(next, 1400);
    } else {
      setFeedback("#name-feedback", "Joli prénom ✨");
      setTimeout(next, 700);
    }
  });

  /* ---------- Étape 2 : quiz gauche / droite ---------- */
  const QUIZ = [
    {
      q: "Pour un premier date, tu préfères…",
      a: [["🍕", "Pizza"], ["🍣", "Sushi"]],
      r: ["Bon goût. Je note.", "Classe. Je note aussi."]
    },
    {
      q: "Un dimanche parfait, c'est…",
      a: [["🛋️", "Canapé & série"], ["🌳", "Balade dehors"]],
      r: ["Plaid obligatoire alors 🧸", "On marchera main dans la main 🌸"]
    },
    {
      q: "Plutôt…",
      a: [["🐱", "Chat"], ["🐶", "Chien"]],
      r: ["Mystérieux·se comme un chat 😼", "Fidèle comme un chien 🐾"]
    }
  ];
  let quizIndex = 0;

  function renderQuiz() {
    const item = QUIZ[quizIndex];
    $("#quiz-count").textContent = "Question " + (quizIndex + 1) + "/" + QUIZ.length;
    $("#quiz-question").textContent = item.q;
    [0, 1].forEach((i) => {
      $("#quiz-e" + i).textContent = item.a[i][0];
      $("#quiz-a" + i).textContent = item.a[i][1];
    });
    $$(".choice").forEach((b) => {
      b.classList.remove("picked");
      b.disabled = false;
    });
    setFeedback("#quiz-feedback", "");
  }

  $$(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const side = Number(btn.dataset.side);
      const item = QUIZ[quizIndex];

      state.quizAnswers.push(item.a[side][1]);
      btn.classList.add("picked");
      $$(".choice").forEach((b) => (b.disabled = true));
      setFeedback("#quiz-feedback", item.r[side]);

      setTimeout(() => {
        quizIndex++;
        if (quizIndex < QUIZ.length) {
          renderQuiz();
        } else {
          next();
        }
      }, 1100);
    });
  });

  /* ---------- Étape 3 : jauge sur 10 ---------- */
  const scale = $("#scale");

  function scaleReaction(v) {
    if (v <= 2) return ["💔", "Aïe… ça pique."];
    else if (v <= 4) return ["😢", "Je vais faire semblant de pas avoir vu."];
    else if (v <= 6) return ["🙂", "Mouais, on peut faire mieux."];
    else if (v <= 8) return ["😊", "Ah, là on parle !"];
    else if (v === 9) return ["😍", "Ok je rougis."];
    else return ["🥰", "Je le savais 😌"];
  }

  function updateScale() {
    const v = Number(scale.value);
    state.score = v;
    const [emoji, text] = scaleReaction(v);
    $("#scale-value").textContent = v;
    $("#scale-emoji").textContent = emoji;
    setFeedback("#scale-feedback", text);
  }

  scale.addEventListener("input", updateScale);

  $("#scale-next").addEventListener("click", () => {
    if (state.score < 5) {
      // Mauvaise réponse : on corrige gentiment
      scale.value = 10;
      updateScale();
      setFeedback("#scale-feedback", "Mytho 😤 Je l'ai remis à 10 pour toi.");
      shake($("#card"));
      return;
    }
    next();
  });

  /* ---------- Étape 4 : Oui / Non (le Non s'enfuit) ---------- */
  const yesBtn = $("#yes");
  const noBtn = $("#no");
  const zone = $("#ask-zone");

  const NO_TEXTS = [
    "Non", "T'es sûr·e ?", "Vraiment ?", "Réfléchis bien…", "Dernière chance !",
    "Tu me brises le cœur 💔", "Allez stp 🥺", "Je vais pleurer…", "Bon ok, clique Oui"
  ];
  const ASK_EMOJIS = ["🥺", "😳", "😟", "😥", "😭", "💔", "🥹", "😿", "🙏"];

  function dodge() {
    state.noAttempts++;
    const n = state.noAttempts;

    // 1) Le texte du bouton Non change à chaque tentative
    noBtn.textContent = NO_TEXTS[Math.min(n, NO_TEXTS.length - 1)];
    $("#ask-emoji").textContent = ASK_EMOJIS[Math.min(n, ASK_EMOJIS.length - 1)];

    // 2) Le bouton Oui grossit
    yesBtn.style.transform = "scale(" + Math.min(1 + n * 0.12, 2) + ")";

    // 3) Après trop de tentatives, le Non devient un Oui
    if (n >= NO_TEXTS.length + 2) {
      noBtn.textContent = "Oui 💖";
      noBtn.classList.remove("ghost", "runaway");
      noBtn.classList.add("primary");
      noBtn.style.left = noBtn.style.top = "";
      noBtn.onclick = sayYes;
      setFeedback("#ask-feedback", "Tu vois, même le bouton Non est d'accord 😏");
      return;
    }

    // 4) Le bouton Non s'enfuit à une position aléatoire dans la zone
    noBtn.classList.add("runaway");
    const maxX = zone.clientWidth - noBtn.offsetWidth;
    const maxY = zone.clientHeight - noBtn.offsetHeight;
    noBtn.style.left = Math.max(0, Math.random() * maxX) + "px";
    noBtn.style.top = Math.max(0, Math.random() * maxY) + "px";

    if (n === 3) setFeedback("#ask-feedback", "Il est rapide hein 😏");
    else if (n === 6) setFeedback("#ask-feedback", "Tu sais que tu peux juste cliquer sur Oui ?");
  }

  // Souris : il fuit dès qu'on le survole. Tactile : il fuit au toucher.
  noBtn.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse" && noBtn.classList.contains("ghost")) dodge();
  });
  noBtn.addEventListener("click", (e) => {
    if (noBtn.classList.contains("ghost")) {
      e.preventDefault();
      dodge();
    }
  });

  function sayYes() {
    confetti();
    setFeedback("#ask-feedback", "");
    setTimeout(next, 900);
  }
  yesBtn.addEventListener("click", sayYes);

  /* ---------- Étape 5 : choix du rendez-vous ---------- */
  const dateInput = $("#date-input");
  const today = new Date();
  dateInput.min = toISODate(today);

  function toISODate(d) {
    const pad = (x) => String(x).padStart(2, "0");
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long"
    });
  }

  $$(".chip").forEach((chip) => {
    chip.setAttribute("role", "radio");
    chip.setAttribute("aria-checked", "false");
    chip.addEventListener("click", () => {
      $$(".chip").forEach((c) => c.setAttribute("aria-checked", "false"));
      chip.setAttribute("aria-checked", "true");
      state.activity = chip.dataset.value;
      setFeedback("#date-feedback", "");
    });
  });

  $("#date-next").addEventListener("click", () => {
    const date = dateInput.value;
    state.message = clean($("#msg-input").value, 200);

    if (!state.activity) {
      setFeedback("#date-feedback", "Choisis une activité d'abord 👆");
      shake($("#activities"));
      return;
    }
    if (!date) {
      setFeedback("#date-feedback", "Il manque le jour 📅");
      shake(dateInput);
      return;
    }
    if (date < toISODate(today)) {
      setFeedback("#date-feedback", "On ne peut pas remonter le temps 😅");
      shake(dateInput);
      return;
    }

    state.date = date;
    renderTicket();
    next();
    confetti();
  });

  /* ---------- Étape 6 : récap + envoi ---------- */
  function buildMessage() {
    let text = "💖 " + (state.from ? state.from + ", c" : "C") + "'est OUI ! 💖\n";
    text += "Rendez-vous : " + state.activity + " le " + formatDate(state.date) + ".\n";
    text += "Note donnée : " + state.score + "/10.";
    if (state.noAttempts > 0) text += " (J'ai essayé de cliquer sur Non " + state.noAttempts + " fois 🙈)";
    if (state.message) text += "\nPetit mot : « " + state.message + " »";
    text += "\n— " + (state.to || "Moi");
    return text;
  }

  function renderTicket() {
    const ticket = $("#ticket");
    ticket.textContent = "";

    const lines = [
      ["Avec", state.from || "ton crush"],
      ["Quoi", state.activity],
      ["Quand", formatDate(state.date)],
      ["Note", state.score + "/10"]
    ];
    lines.forEach(([label, value]) => {
      const p = document.createElement("div");
      const s = document.createElement("strong");
      s.textContent = label + " : ";
      p.appendChild(s);
      p.appendChild(document.createTextNode(value));
      ticket.appendChild(p);
    });
    if (state.message) {
      const note = document.createElement("div");
      note.className = "note";
      note.textContent = "« " + state.message + " »";
      ticket.appendChild(note);
    }

    // Choix du canal d'envoi
    const text = buildMessage();
    const send = $("#send");
    if (state.phone) {
      send.href = "https://wa.me/" + state.phone + "?text=" + encodeURIComponent(text);
      send.textContent = "Envoyer sur WhatsApp 📲";
    } else if (navigator.share) {
      send.href = "#";
      send.textContent = "Partager ma réponse 📲";
      send.onclick = (e) => {
        e.preventDefault();
        navigator.share({ text: text }).catch(() => {});
      };
    } else {
      send.href = "sms:?&body=" + encodeURIComponent(text);
      send.textContent = "Envoyer par SMS 📲";
    }
  }

  $("#restart").addEventListener("click", () => window.location.reload());

  /* ---------- Cœurs flottants en fond ---------- */
  function spawnHearts() {
    const box = $(".hearts");
    const icons = ["💗", "💕", "💖", "❤️", "💘"];
    for (let i = 0; i < 18; i++) {
      const h = document.createElement("span");
      h.textContent = icons[i % icons.length];
      h.style.left = Math.random() * 100 + "%";
      h.style.setProperty("--size", 14 + Math.random() * 22 + "px");
      h.style.setProperty("--dur", 9 + Math.random() * 10 + "s");
      h.style.setProperty("--delay", -Math.random() * 15 + "s");
      box.appendChild(h);
    }
  }

  /* ---------- Confettis (canvas, sans librairie) ---------- */
  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = $("#confetti");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ["#e6336b", "#ff8fb1", "#ffd166", "#ffffff", "#b81f50"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2,
      y: innerHeight / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -14 - 4,
      size: 5 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      heart: Math.random() < 0.35
    }));

    let frame = 0;
    (function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      pieces.forEach((p) => {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += 0.1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.heart) {
          ctx.font = p.size * 2 + "px serif";
          ctx.fillText("💖", 0, 0);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
      });
      if (++frame < 180) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })();
  }

  /* ---------- Démarrage ---------- */
  fillNames();
  renderQuiz();
  updateScale();
  spawnHearts();
  show("intro");
})();
