/* =========================================================
   LES QUESTIONS — modifie-les librement !

   Codes utilisables dans les textes :
     {nom}  → son prénom        {moi} → ton prénom
     {rep}  → sa réponse (questions "text")
     {m|f}  → accord selon le genre : "prêt{|e}" → "prêt" / "prête"

   Types :
     single → une seule réponse. Si les options ont une "img",
              elles s'affichent en cartes photo, sinon en bulles.
     multi  → plusieurs réponses (min / max). "only" = réponse exclusive.
     text   → réponse libre
     scale  → curseur (min / max / unit) avec des paliers "levels"

   Score d'amour :
     "love" (0 à 10) sur une option = son poids dans le score.
     multi : base + somme des "love" choisis (borné 0–10)
     scale : "love: true" → valeur ramenée sur 10
     "weight" = importance de la question (1 par défaut)

   "bg"    = photo de fond de la question (dossier img/)
   "label" = titre court dans le récap qu'on t'envoie
   ========================================================= */
window.QUIZ = [
  /* ------------------------------------------------ I */
  {
    title: "Ce que tu aimes",
    bg: "img/bg-roses.jpg",
    quote: "Je veux connaître chaque petite chose qui te fait sourire.",
    questions: [
      {
        id: "plat", type: "single", label: "Plat réconfort", bg: "img/bg-candles.jpg",
        q: "Ton plat réconfort, celui qui répare tout ?",
        options: [
          { t: "Pizza", img: "img/o-pizza.jpg", r: "Une pizza à deux un soir de pluie… noté." },
          { t: "Sushi", img: "img/o-sushi.jpg", r: "Un dîner sushi, je retiens." },
          { t: "Pâtes", img: "img/o-pasta.jpg", r: "On rejouera la scène de La Belle et le Clochard." },
          { t: "Un plat de chez nous", img: "img/o-local.jpg", r: "Les meilleurs, ceux qui ont le goût de la maison." }
        ]
      },
      {
        id: "saison", type: "single", label: "Saison préférée", bg: "img/bg-lavender.jpg",
        q: "La saison où tu te sens le plus toi-même ?",
        options: [
          { t: "Printemps", img: "img/o-spring.jpg", r: "Les fleurs qui reviennent… comme toi dans mes pensées." },
          { t: "Été", img: "img/o-summer.jpg", r: "Soleil, mer, glaces au bord de l'eau." },
          { t: "Automne", img: "img/o-autumn.jpg", r: "Pulls doux, balades dans les feuilles, chocolat chaud." },
          { t: "Hiver", img: "img/o-winter.jpg", r: "Un plaid, un film, et toi à côté. Parfait." }
        ]
      },
      {
        id: "fleurs", type: "single", label: "Fleurs préférées", bg: "img/bg-peonies.jpg",
        q: "Si je t'offrais des fleurs, tu voudrais…",
        options: [
          { t: "Des roses", img: "img/bg-roses.jpg", r: "Classique et éternel. Comme ce que je ressens." },
          { t: "Des pivoines", img: "img/bg-peonies.jpg", r: "Douces et délicates… ça te ressemble." },
          { t: "Des tournesols", img: "img/bg-sunflower.jpg", r: "Lumineux, comme ton sourire." },
          { t: "De la lavande", img: "img/bg-lavender.jpg", r: "Un parfum de Provence, j'adore." }
        ]
      },
      {
        id: "soir", type: "single", label: "Le soir", bg: "img/bg-stars.jpg",
        q: "Un vendredi soir idéal, c'est plutôt…",
        options: [
          { t: "Film sous la couette", img: "img/o-couch.jpg", r: "Tu choisis le film, je m'occupe du pop-corn." },
          { t: "Sortie entre amis", img: "img/o-party.jpg", r: "Un{|e} vrai{|e} ambianceu{r|se}… j'aime ton énergie." },
          { t: "Jeux vidéo", img: "img/o-gaming.jpg", r: "Une partie à deux ? Je te laisse gagner. Peut-être." },
          { t: "Dormir tôt", img: "img/o-sleep.jpg", r: "Le sommeil c'est sacré, je respecte." }
        ]
      },
      {
        id: "date", type: "single", label: "Date idéal", bg: "img/bg-paris.jpg",
        q: "Notre premier rendez-vous, tu le rêves comment ?",
        options: [
          { t: "Dîner aux chandelles", img: "img/o-restaurant.jpg", r: "Lumière douce, belle table… je m'en occupe." },
          { t: "Ciné & pop-corn", img: "img/o-cinema.jpg", r: "Je te laisserai l'accoudoir. Promis." },
          { t: "Balade au coucher du soleil", img: "img/bg-paris.jpg", r: "Main dans la main sous un ciel rose." },
          { t: "Fête foraine", img: "img/o-ferris.jpg", r: "La grande roue tout en haut… j'ai déjà hâte." }
        ]
      },
      {
        id: "voyage", type: "single", label: "Voyage rêvé à deux", bg: "img/bg-balloons.jpg",
        q: "Si on partait demain, toi et moi… on irait où ?",
        options: [
          { t: "Paris", img: "img/bg-paris.jpg", r: "La ville de l'amour, évidemment." },
          { t: "Montgolfières en Cappadoce", img: "img/bg-balloons.jpg", r: "Voler au-dessus des nuages avec toi…" },
          { t: "Une île paradisiaque", img: "img/o-summer.jpg", r: "Sable blanc, eau turquoise, et nous." },
          { t: "Un chalet sous la neige", img: "img/o-winter.jpg", r: "Feu de cheminée et câlins. Validé." }
        ]
      },
      {
        id: "craque", type: "multi", min: 1, max: 3, label: "Ce qui me fait craquer", bg: "img/bg-hug.jpg",
        q: "Ce qui te fait craquer chez quelqu'un ?", hint: "Jusqu'à trois choix",
        options: [
          { t: "L'humour", e: "😄", r: "L'humour… j'ai peut-être mes chances." },
          { t: "La gentillesse", e: "🤍" },
          { t: "L'ambition", e: "✨" },
          { t: "Le style", e: "👟" },
          { t: "Le regard", e: "👀" },
          { t: "Le parfum", e: "🌹" }
        ],
        r: "Je prends des notes. Sérieusement."
      },
      {
        id: "bonheur", type: "text", label: "Ce qui me rend heureu{x|se}", bg: "img/bg-sunflower.jpg",
        q: "Une petite chose qui te rend heureu{x|se} instantanément ?",
        placeholder: "Un message le matin, un café chaud…",
        r: "« {rep} »… je garde ça précieusement."
      }
    ]
  },

  /* ------------------------------------------------ II */
  {
    title: "Ce que tu n'aimes pas",
    bg: "img/bg-rose.jpg",
    quote: "Pour prendre soin de toi, je dois aussi savoir ce qui te blesse.",
    questions: [
      {
        id: "redflag", type: "single", label: "Ce que je ne pardonne pas", bg: "img/bg-lavender2.jpg",
        q: "Ce que tu ne pardonnes pas facilement ?",
        options: [
          { t: "Le mensonge", e: "🤥", r: "Avec moi, ce sera toujours la vérité." },
          { t: "La jalousie excessive", e: "😤", r: "La confiance avant tout. Compris." },
          { t: "Le manque d'attention", e: "📵", r: "Je serai là, attentif à toi." },
          { t: "Les promesses non tenues", e: "💔", r: "Je ne promettrai que ce que je peux tenir." }
        ]
      },
      {
        id: "agace", type: "multi", min: 1, max: 6, label: "Ce qui m'agace", bg: "img/bg-peonies2.jpg",
        q: "Les petites choses qui t'agacent ?", hint: "Plusieurs choix possibles",
        options: [
          { t: "Être laissé{|e} en vu", e: "👻", r: "Je répondrai toujours. C'est promis." },
          { t: "Les retards", e: "⏰" },
          { t: "Les plans annulés", e: "🙄" },
          { t: "Les gens arrogants", e: "🦚" },
          { t: "Le silence après une dispute", e: "🤐" },
          { t: "Qu'on ne m'écoute pas", e: "👂" }
        ],
        r: "C'est noté, je ferai attention à tout ça."
      },
      {
        id: "dispute", type: "single", label: "Après une dispute", bg: "img/bg-hands.jpg",
        q: "Après une dispute, ce qui t'apaise le plus ?",
        options: [
          { t: "Qu'on en parle tout de suite", e: "🗣️", r: "On parlera. Toujours." },
          { t: "Un peu de temps seul{|e}", e: "🕊️", r: "Je saurai te laisser respirer." },
          { t: "Un long câlin", e: "🫂", r: "Les câlins réparent presque tout." },
          { t: "Un petit geste doux", e: "🍫", r: "Je viendrai avec du chocolat alors." }
        ]
      },
      {
        id: "jamais", type: "text", label: "À ne jamais faire", bg: "img/bg-letter.jpg",
        q: "Une chose que je ne dois jamais faire avec toi ?",
        placeholder: "Sois honnête, je t'écoute…",
        r: "« {rep} ». Message reçu, ça n'arrivera pas."
      }
    ]
  },

  /* ------------------------------------------------ III */
  {
    title: "Toi & moi",
    bg: "img/bg-intro.jpg",
    quote: "Maintenant, parlons un peu de nous deux.",
    questions: [
      {
        id: "premiere", type: "single", label: "Notre 1re conversation", bg: "img/bg-beach-couple.jpg",
        q: "Tu te souviens de notre première vraie conversation ?",
        options: [
          { t: "Évidemment", e: "🥹", love: 10, r: "Moi aussi, je m'en souviens très bien." },
          { t: "Un peu", e: "🤔", love: 6, r: "Je te rafraîchirai la mémoire." },
          { t: "Pas vraiment", e: "😶", love: 3, r: "Alors on va en créer de nouvelles, des inoubliables." },
          { t: "On en a eu une ?", e: "😂", love: 3, r: "Très drôle… (ça m'a un peu blessé quand même)." }
        ]
      },
      {
        id: "langage", type: "single", label: "Langage de l'amour", bg: "img/bg-letter2.jpg",
        q: "Comment tu te sens le plus aimé{|e} ?",
        options: [
          { t: "Les mots doux", img: "img/o-words.jpg", r: "Je t'écrirai alors. Souvent." },
          { t: "Le temps passé ensemble", img: "img/o-time.jpg", r: "Je garderai toujours du temps pour toi." },
          { t: "Les petites attentions", img: "img/o-gift.jpg", r: "Les surprises, j'adore en faire." },
          { t: "La tendresse", img: "img/o-cuddle.jpg", r: "Câlins illimités. C'est noté." }
        ]
      },
      {
        id: "aime", type: "multi", min: 1, max: 6, base: 3, label: "Ce que j'aime chez toi", bg: "img/bg-hug-beach.jpg",
        q: "Qu'est-ce que tu aimes chez moi ?", hint: "Plusieurs choix possibles",
        options: [
          { t: "Mon humour", e: "😄", love: 2 },
          { t: "Mon sourire", e: "😊", love: 2 },
          { t: "Ma gentillesse", e: "🤍", love: 2 },
          { t: "Ma façon de parler", e: "💬", love: 2 },
          { t: "Mon style", e: "🧥", love: 1 },
          { t: "Je ne sais pas encore", e: "🤷", love: -2, only: true, r: "Pas grave, je vais te montrer." }
        ],
        r: "Arrête… je rougis."
      },
      {
        id: "frein", type: "multi", min: 1, max: 6, base: 10, label: "Ce qui me freine", bg: "img/bg-rose.jpg",
        q: "Qu'est-ce qui pourrait te faire hésiter ?", hint: "Sois honnête, ça m'aide",
        options: [
          { t: "Rien du tout", e: "💗", love: 0, only: true, r: "Rien ? Mon cœur…" },
          { t: "On ne se connaît pas assez", e: "🫣", love: -3 },
          { t: "Le timing", e: "⏳", love: -3 },
          { t: "La distance", e: "🗺️", love: -3 },
          { t: "Mon caractère", e: "🙃", love: -4 },
          { t: "La peur de m'attacher", e: "🥺", love: -2 }
        ],
        r: "Merci pour ta sincérité. Je prends ça comme une promesse à tenir."
      },
      {
        id: "mots", type: "text", label: "Toi en 3 mots", bg: "img/bg-letter.jpg",
        q: "Décris-moi en trois mots.",
        placeholder: "drôle, doux, têtu…",
        r: "« {rep} »… je vais m'en souvenir longtemps."
      }
    ]
  },

  /* ------------------------------------------------ IV */
  {
    title: "Ton cœur",
    bg: "img/bg-sunset.jpg",
    quote: "Dernières questions. Réponds avec le cœur, pas avec la tête.",
    questions: [
      {
        id: "pense", type: "scale", min: 0, max: 10, unit: "", love: true, label: "Je pense à toi (sur 10)", bg: "img/bg-stars.jpg",
        q: "Tu penses à moi… souvent ?", hint: "0 : jamais · 10 : tout le temps",
        levels: [
          { max: 2, e: "🌑", t: "Un ciel sans étoiles…" },
          { max: 5, e: "🌙", t: "De temps en temps, c'est déjà ça." },
          { max: 8, e: "✨", t: "Ça me fait sourire, tu sais." },
          { max: 10, e: "💫", t: "Moi aussi, je pense à toi tout le temps." }
        ]
      },
      {
        id: "message", type: "single", label: "Si tu m'écris", bg: "img/bg-hands.jpg",
        q: "Si je t'écris là, maintenant, tu réponds…",
        options: [
          { t: "Dans la seconde", e: "⚡", love: 10, r: "Je le savais." },
          { t: "Dans l'heure", e: "🕐", love: 7, r: "C'est parfait." },
          { t: "Quand j'ai le temps", e: "🐌", love: 3, r: "Je vais devoir être plus intéressant alors." },
          { t: "Je laisse en vu", e: "👻", love: 0, r: "Même pas peur… (si, un peu)." }
        ]
      },
      {
        id: "voir", type: "single", label: "Quand je te vois", bg: "img/bg-beach-couple.jpg",
        q: "Quand tu me vois arriver, tu…",
        options: [
          { t: "Souris sans le vouloir", e: "😊", love: 10, r: "Moi aussi, à chaque fois." },
          { t: "Te sens bien", e: "☺️", love: 8, r: "C'est tout ce que je veux." },
          { t: "Rien de spécial", e: "😐", love: 3, r: "Pour l'instant…" },
          { t: "Évites mon regard", e: "🙈", love: 7, r: "Timide… je trouve ça mignon." }
        ]
      },
      {
        id: "futur", type: "single", label: "Nous dans un an", bg: "img/bg-balloons.jpg",
        q: "Nous deux dans un an, tu nous vois…",
        options: [
          { t: "Ensemble, évidemment", e: "💞", love: 10, r: "J'ai des frissons." },
          { t: "Très proches", e: "🤞", love: 7, r: "On y travaille, tous les deux." },
          { t: "Je ne sais pas encore", e: "🌫️", love: 4, r: "L'avenir, on l'écrira ensemble." },
          { t: "Juste amis", e: "🤝", love: 1, r: "On verra bien ce que la vie décide." }
        ]
      },
      {
        id: "degre", type: "scale", min: 0, max: 100, unit: " %", love: true, weight: 3, label: "Degré d'amour", bg: "img/bg-sunset.jpg",
        q: "Et ton cœur, il en est où pour moi ?", hint: "Fais glisser, en toute honnêteté",
        levels: [
          { max: 20, e: "🌱", t: "Une petite graine… elle peut pousser." },
          { max: 49, e: "🌷", t: "Quelque chose commence à éclore." },
          { max: 74, e: "🌹", t: "Ça fleurit doucement…" },
          { max: 94, e: "💐", t: "Un vrai bouquet. Je fonds." },
          { max: 100, e: "💘", t: "100 %… je n'ai pas de mots." }
        ]
      }
    ]
  }
];

/* Paliers du verdict (score d'amour en %) */
window.VERDICTS = [
  { min: 85, title: "Un amour qui ne ment pas", t: "Tes réponses parlent pour toi : ton cœur bat déjà pour {moi}." },
  { min: 65, title: "Il y a clairement quelque chose", t: "Une belle histoire est en train de s'écrire." },
  { min: 45, title: "Une étincelle", t: "Elle est là, fragile et jolie. Il suffit de souffler doucement dessus." },
  { min: 0, title: "Tout reste à écrire", t: "Et c'est peut-être ça, le plus beau. {moi} a envie d'essayer." }
];
