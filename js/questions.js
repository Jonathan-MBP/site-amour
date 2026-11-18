/* =========================================================
   LES QUESTIONS DU QUIZ — modifie-les librement !

   Petits codes utilisables dans les textes :
     {nom}     → prénom de la personne qui joue
     {moi}     → ton prénom
     {rep}     → (questions "text" uniquement) sa réponse
     {m|f}     → accord selon le genre : "prêt{|e}" donne "prêt" ou "prête"

   Types de questions :
     single → 4 cases façon Kahoot, une seule réponse (option "time" = chrono)
     multi  → plusieurs réponses possibles (min / max), "only" = réponse exclusive
     text   → réponse libre
     scale  → curseur (min / max / unit) avec des paliers de réactions

   Score d'amour :
     "love" (0 à 10) sur une option = combien cette réponse compte pour l'amour.
     Pour multi : base + somme des "love" choisis (bornée entre 0 et 10).
     Pour scale : mettre "love: true" → la valeur est convertie sur 10.
     "weight" = importance de la question dans le score final (1 par défaut).
     Une question sans "love" ne compte pas dans le score.

   "label" = titre court utilisé dans le récap qu'on t'envoie.
   "img"   = un emoji affiché en grand (converti en image).
   ========================================================= */
window.QUIZ = [
  /* ---------------- Chapitre 1 ---------------- */
  {
    title: "Ce que tu aimes",
    emoji: "💗",
    intro: "On commence doucement. Je veux tout savoir de tes goûts.",
    questions: [
      {
        id: "plat", type: "single", time: 25, label: "Plat réconfort",
        img: "🍽️", q: "Ton plat réconfort, c'est…",
        options: [
          { t: "Pizza", e: "🍕", r: "Pizza à deux un soir, c'est noté 🍕" },
          { t: "Sushi", e: "🍣", r: "Sushi date débloqué 🍣" },
          { t: "Pâtes", e: "🍝", r: "Scène de La Belle et le Clochard incoming 🍝" },
          { t: "Plat de chez nous", e: "🍲", r: "Les vraies savent 😌 Je note." }
        ]
      },
      {
        id: "saison", type: "single", time: 25, label: "Saison préférée",
        img: "🌦️", q: "Ta saison préférée ?",
        options: [
          { t: "Printemps", e: "🌸", r: "Les fleurs, les terrasses… joli choix 🌸" },
          { t: "Été", e: "☀️", r: "Soleil, plage, glaces. Validé ☀️" },
          { t: "Automne", e: "🍂", r: "Pull oversize et chocolat chaud 🍂" },
          { t: "Hiver", e: "❄️", r: "Plaid + câlins = hiver parfait ❄️" }
        ]
      },
      {
        id: "musique", type: "single", time: 25, label: "Musique",
        img: "🎧", q: "Dans tes écouteurs en ce moment ?",
        options: [
          { t: "Rap / Drill", e: "🎤", r: "Ok, on va s'entendre 🎤" },
          { t: "R&B / Soul", e: "🎷", r: "Une âme romantique, je le savais 🎷" },
          { t: "Afro / Amapiano", e: "🥁", r: "On va danser alors 💃" },
          { t: "Pop / Variété", e: "🎶", r: "Karaoké en duo prévu 🎶" }
        ]
      },
      {
        id: "soir", type: "single", time: 25, label: "Le soir",
        img: "🌙", q: "Un vendredi soir, tu es plutôt…",
        options: [
          { t: "Série sous la couette", e: "📺", r: "Tu me prêtes ton compte Netflix ? 😏" },
          { t: "Sortie entre potes", e: "🎉", r: "Un{|e} vrai{|e} ambianceu{r|se}, j'adore 🎉" },
          { t: "Jeux vidéo", e: "🎮", r: "1v1 quand tu veux 🎮" },
          { t: "Dodo à 22h", e: "😴", r: "Le sommeil c'est sacré, je respecte 😴" }
        ]
      },
      {
        id: "date", type: "single", time: 25, label: "Date idéal",
        img: "💑", q: "Ton date idéal ?",
        options: [
          { t: "Resto chic", e: "🥂", r: "Je sors la chemise 🥂" },
          { t: "Ciné + popcorn", e: "🍿", r: "Je te laisse choisir le film. Promis 🍿" },
          { t: "Balade de nuit", e: "🌃", r: "Main dans la main sous les lumières 🌃" },
          { t: "Activité fun", e: "🎳", r: "Bowling, karting… prépare-toi à perdre 😎" }
        ]
      },
      {
        id: "craque", type: "multi", min: 1, max: 3, label: "Ce qui me fait craquer",
        img: "😍", q: "Ce qui te fait craquer chez quelqu'un ?", hint: "Jusqu'à 3 choix",
        options: [
          { t: "L'humour", e: "😂", r: "L'humour hein… j'ai mes chances 😂" },
          { t: "La gentillesse", e: "🤍" },
          { t: "L'ambition", e: "🚀" },
          { t: "Le style", e: "👟" },
          { t: "Le regard", e: "👀" },
          { t: "Le parfum", e: "🌹" }
        ],
        r: "Noté. Je prends des notes, sérieusement 📝"
      },
      {
        id: "bonheur", type: "text", label: "Ce qui me rend heureu{x|se}",
        img: "🌈", q: "Un petit truc qui te rend heureu{x|se} instantanément ?",
        placeholder: "Ex : un message le matin…",
        r: "« {rep} »… je retiens ça précieusement ✨"
      }
    ]
  },

  /* ---------------- Chapitre 2 ---------------- */
  {
    title: "Ce que tu n'aimes pas",
    emoji: "🙅",
    intro: "Pour ne jamais faire de bêtises, il faut connaître tes limites.",
    questions: [
      {
        id: "redflag", type: "single", time: 25, label: "Plus gros red flag",
        img: "🚩", q: "Ton plus gros red flag ?",
        options: [
          { t: "Le mensonge", e: "🤥", r: "Avec moi ce sera toujours la vérité 🤝" },
          { t: "La jalousie maladive", e: "😤", r: "Confiance avant tout, compris." },
          { t: "Le manque d'attention", e: "📵", r: "Je serai attentif, promis 👀" },
          { t: "La radinerie", e: "💸", r: "L'addition est pour moi 😌" }
        ]
      },
      {
        id: "agace", type: "multi", min: 1, max: 6, label: "Ce qui m'agace",
        img: "😒", q: "Ce qui t'agace le plus ?", hint: "Plusieurs choix possibles",
        options: [
          { t: "Être laissé{|e} en vu", e: "👻", r: "Je réponds vite, c'est promis 👻" },
          { t: "Les retards", e: "⏰" },
          { t: "Les plans annulés", e: "🙄" },
          { t: "Les gens arrogants", e: "🦚" },
          { t: "Mâcher la bouche ouverte", e: "🤢" },
          { t: "Le silence en dispute", e: "🤐" }
        ],
        r: "Liste des interdits enregistrée ✅"
      },
      {
        id: "dispute", type: "single", time: 25, label: "En cas de dispute",
        img: "🌩️", q: "Après une dispute, tu préfères…",
        options: [
          { t: "Qu'on en parle direct", e: "🗣️", r: "Communication, j'adore. On parlera 🗣️" },
          { t: "Un peu de temps seul{|e}", e: "🕊️", r: "Je saurai te laisser respirer 🕊️" },
          { t: "Un câlin et c'est réglé", e: "🫂", r: "Les câlins règlent tout 🫂" },
          { t: "Bouder un peu 😤", e: "😾", r: "Je viendrai avec du chocolat alors 🍫" }
        ]
      },
      {
        id: "jamais", type: "text", label: "À ne jamais faire",
        img: "⛔", q: "Un truc que je ne dois JAMAIS faire avec toi ?",
        placeholder: "Sois honnête…",
        r: "« {rep} ». Message reçu, ça n'arrivera pas 🫡"
      }
    ]
  },

  /* ---------------- Chapitre 3 ---------------- */
  {
    title: "Toi & moi",
    emoji: "👫",
    intro: "Maintenant on parle de nous deux. Réponds avec ton cœur.",
    questions: [
      {
        id: "premiere", type: "single", time: 25, label: "Notre 1re conversation",
        img: "💬", q: "Tu te souviens de notre première vraie conversation ?",
        options: [
          { t: "Évidemment", e: "🥹", love: 10, r: "Moi aussi je m'en souviens 🥹" },
          { t: "Vaguement", e: "🤔", love: 6, r: "Je te rafraîchirai la mémoire 😏" },
          { t: "Pas du tout", e: "😶", love: 2, r: "Aïe… on va en créer de nouvelles alors." },
          { t: "On en a eu une ?", e: "😂", love: 3, r: "Très drôle 😂 (ça m'a quand même blessé)" }
        ]
      },
      {
        id: "langage", type: "single", time: 25, label: "Langage de l'amour",
        img: "💞", q: "Ton langage de l'amour ?",
        options: [
          { t: "Les mots doux", e: "💌", r: "Je vais écrire des messages alors 💌" },
          { t: "Le temps ensemble", e: "⏳", r: "Je bloquerai du temps rien que pour toi ⏳" },
          { t: "Les petites attentions", e: "🎁", r: "Surprises en préparation 🎁" },
          { t: "Le contact", e: "🤗", r: "Câlins illimités, c'est noté 🤗" }
        ]
      },
      {
        id: "aime", type: "multi", min: 1, max: 6, base: 3, label: "Ce que j'aime chez toi",
        img: "🥰", q: "Qu'est-ce que tu aimes chez moi ?", hint: "Plusieurs choix possibles",
        options: [
          { t: "Mon humour", e: "😄", love: 2 },
          { t: "Mon sourire", e: "😁", love: 2 },
          { t: "Ma gentillesse", e: "🤍", love: 2 },
          { t: "Ma façon de parler", e: "🗨️", love: 2 },
          { t: "Mon style", e: "🧥", love: 1 },
          { t: "Je sais pas encore 😅", e: "🤷", love: -2, only: true, r: "Pas grave, je vais te montrer 😌" }
        ],
        r: "Arrête, je vais rougir 😳"
      },
      {
        id: "frein", type: "multi", min: 1, max: 6, base: 10, label: "Ce qui me freine",
        img: "🚧", q: "Qu'est-ce qui pourrait te freiner avec moi ?", hint: "Sois honnête, je ne vais pas pleurer (enfin si)",
        options: [
          { t: "Rien du tout", e: "✅", love: 0, only: true, r: "RIEN ?! Mon cœur 💓" },
          { t: "On se connaît pas assez", e: "🫣", love: -3 },
          { t: "Le timing", e: "⌛", love: -3 },
          { t: "La distance", e: "🗺️", love: -3 },
          { t: "Mon caractère", e: "🙃", love: -4 },
          { t: "J'ai peur de m'attacher", e: "🥺", love: -2 }
        ],
        r: "Merci pour ta franchise. Je prends ça comme un défi 💪"
      },
      {
        id: "mots", type: "text", label: "Toi en 3 mots",
        img: "✍️", q: "Décris-moi en 3 mots.",
        placeholder: "Ex : drôle, gentil, têtu",
        r: "« {rep} »… je vais encadrer ça 🖼️"
      }
    ]
  },

  /* ---------------- Chapitre 4 ---------------- */
  {
    title: "Ton degré d'amour",
    emoji: "🌡️",
    intro: "Dernière ligne droite. Pas de mensonge, le site le saura 😏",
    questions: [
      {
        id: "pense", type: "scale", min: 0, max: 10, unit: "", love: true, label: "Je pense à toi (sur 10)",
        img: "💭", q: "Tu penses à moi souvent ?", hint: "0 = jamais · 10 = tout le temps",
        levels: [
          { max: 2, e: "🧊", t: "Glacial…" },
          { max: 5, e: "🙂", t: "De temps en temps, ok." },
          { max: 8, e: "😊", t: "Ah, ça me plaît ça." },
          { max: 10, e: "🥰", t: "Moi aussi je pense à toi tout le temps." }
        ]
      },
      {
        id: "message", type: "single", time: 25, label: "Si tu m'écris",
        img: "📱", q: "Je t'envoie un message là, maintenant. Tu réponds…",
        options: [
          { t: "Dans la seconde", e: "⚡", love: 10, r: "Je le savais ⚡" },
          { t: "Dans l'heure", e: "🕐", love: 7, r: "Raisonnable 😌" },
          { t: "Quand j'ai le temps", e: "🐌", love: 3, r: "Hmm… je vais devenir plus intéressant." },
          { t: "Je laisse en vu", e: "👻", love: 0, r: "Même pas peur 👻 (si, un peu)" }
        ]
      },
      {
        id: "voir", type: "single", time: 25, label: "Quand je te vois",
        img: "👀", q: "Quand tu me vois, tu…",
        options: [
          { t: "Souris sans faire exprès", e: "😊", love: 10, r: "Moi aussi 😊" },
          { t: "Te sens bien", e: "☺️", love: 8, r: "C'est tout ce que je veux 🤍" },
          { t: "Rien de spécial", e: "😐", love: 3, r: "Pour l'instant 😏" },
          { t: "Évites mon regard", e: "🙈", love: 7, r: "Timide hein… je vois tout 🙈" }
        ]
      },
      {
        id: "futur", type: "single", time: 25, label: "Nous dans 1 an",
        img: "🔮", q: "Nous deux dans un an, tu nous vois…",
        options: [
          { t: "Ensemble, évidemment", e: "💍", love: 10, r: "J'ai des frissons 💍" },
          { t: "Très proches", e: "🤞", love: 7, r: "On y travaille 🤞" },
          { t: "Aucune idée", e: "🌫️", love: 4, r: "Le futur s'écrit ensemble ✍️" },
          { t: "Juste amis", e: "🤝", love: 1, r: "On verra bien 😌" }
        ]
      },
      {
        id: "degre", type: "scale", min: 0, max: 100, unit: " %", love: true, weight: 3, label: "Degré d'amour",
        img: "❤️‍🔥", q: "Ton degré d'amour pour moi ?", hint: "Fais glisser. Honnêtement.",
        levels: [
          { max: 20, e: "🥶", t: "Ouch… ça pique." },
          { max: 49, e: "🌱", t: "C'est un début, ça peut pousser." },
          { max: 74, e: "🔥", t: "Ça chauffe !" },
          { max: 94, e: "😍", t: "Wow… je fonds." },
          { max: 100, e: "💘", t: "100 % ?! Je suis l'homme le plus heureux." }
        ]
      }
    ]
  }
];

/* Paliers du verdict final (score d'amour en %) */
window.VERDICTS = [
  { min: 85, e: "💘", title: "Coup de foudre confirmé", t: "Les chiffres ne mentent pas : tu es {fou|folle} de {moi}." },
  { min: 65, e: "😍", title: "Il y a clairement quelque chose", t: "Ton cœur a déjà fait son choix, avoue." },
  { min: 45, e: "🔥", title: "Ça frémit…", t: "Une étincelle est là. Il suffit de souffler un peu dessus." },
  { min: 0, e: "🌱", title: "Tout reste à écrire", t: "{moi} va devoir faire ses preuves. Challenge accepté." }
];
