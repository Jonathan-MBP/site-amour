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

  // Pétales en fond
  const box = document.querySelector(".petals");
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%";
    p.style.setProperty("--s", 9 + Math.random() * 10 + "px");
    p.style.setProperty("--d", 12 + Math.random() * 12 + "s");
    p.style.setProperty("--delay", -Math.random() * 20 + "s");
    p.style.setProperty("--x", (Math.random() * 120 - 60) + "px");
    box.appendChild(p);
  }
})();
