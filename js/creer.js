/* Générateur de lien personnalisé */
(function () {
  "use strict";

  const form = document.getElementById("create-form");
  const result = document.getElementById("result");
  const linkInput = document.getElementById("link");
  const feedback = document.getElementById("copy-feedback");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pour = document.getElementById("pour").value.trim();
    const de = document.getElementById("de").value.trim();
    const tel = document.getElementById("tel").value.replace(/\D/g, "");

    if (!pour || !de) return; // les champs "required" gèrent le message

    // URL de index.html dans le même dossier que cette page
    const base = new URL("index.html", window.location.href);
    base.searchParams.set("pour", pour);
    base.searchParams.set("de", de);
    if (tel) base.searchParams.set("tel", tel);

    linkInput.value = base.toString();
    document.getElementById("preview").href = base.toString();
    result.hidden = false;
    feedback.textContent = "";
    linkInput.select();
  });

  document.getElementById("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(linkInput.value);
      feedback.textContent = "Lien copié ! Envoie-le 💌";
    } catch {
      linkInput.select();
      feedback.textContent = "Sélectionné — fais Ctrl+C / appui long pour copier.";
    }
  });

  // Cœurs en fond (même effet que la page principale)
  const box = document.querySelector(".hearts");
  ["💗", "💕", "💖", "❤️", "💘"].forEach((icon, i) => {
    for (let k = 0; k < 3; k++) {
      const h = document.createElement("span");
      h.textContent = icon;
      h.style.left = Math.random() * 100 + "%";
      h.style.setProperty("--size", 14 + Math.random() * 22 + "px");
      h.style.setProperty("--dur", 9 + Math.random() * 10 + "s");
      h.style.setProperty("--delay", -Math.random() * 15 + "s");
      box.appendChild(h);
    }
  });
})();
