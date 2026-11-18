/* Générateur de lien personnalisé */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const cleanName = (v) => v.replace(/[<>{}|]/g, "").trim().slice(0, 30);

  $("create-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const pour = cleanName($("pour").value);
    const de = cleanName($("de").value);
    const tel = $("tel").value.replace(/\D/g, "");
    const g = document.querySelector('input[name="g"]:checked').value;

    if (!pour || !de) return; // les champs "required" affichent déjà le message

    const url = new URL("index.html", window.location.href);
    url.searchParams.set("pour", pour);
    url.searchParams.set("de", de);
    url.searchParams.set("g", g);
    if (tel) url.searchParams.set("tel", tel);

    $("link").value = url.toString();
    $("preview").href = url.toString();
    $("result").hidden = false;
    $("copy-feedback").textContent = "";
    $("link").select();
  });

  $("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("link").value);
      $("copy-feedback").textContent = "Lien copié ! Envoie-le 💌";
    } catch {
      $("link").select();
      $("copy-feedback").textContent = "Sélectionné — fais Ctrl+C ou appui long pour copier.";
    }
  });

  // Cœurs en fond
  const box = document.querySelector(".hearts");
  const icons = ["💗", "💕", "💖", "❤️", "💘", "✨"];
  for (let i = 0; i < 14; i++) {
    const h = document.createElement("span");
    h.textContent = icons[i % icons.length];
    h.style.left = Math.random() * 100 + "%";
    h.style.setProperty("--size", 14 + Math.random() * 20 + "px");
    h.style.setProperty("--dur", 10 + Math.random() * 10 + "s");
    h.style.setProperty("--delay", -Math.random() * 18 + "s");
    box.appendChild(h);
  }
})();
