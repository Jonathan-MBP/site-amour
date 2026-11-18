# 💘 LoveQuiz

Un quiz façon Kahoot pour apprendre à connaître quelqu'un… et lui demander de sortir avec toi.

**🎮 Jouer :** https://jonathan-mbp.github.io/site-amour/
**🔗 Créer ton lien :** https://jonathan-mbp.github.io/site-amour/creer.html

## Le parcours

| Étape | Ce qui se passe |
|---|---|
| Lobby | Écran d'accueil avec un PIN de jeu, le prénom et le nombre de questions |
| Chapitre 1 · Ce que tu aimes | Plat, saison, musique, soirée, date idéal, ce qui fait craquer, ce qui rend heureux·se |
| Chapitre 2 · Ce que tu n'aimes pas | Red flag, ce qui agace, gestion des disputes, ce qu'il ne faut jamais faire |
| Chapitre 3 · Toi & moi | Souvenirs, langage de l'amour, ce qu'elle aime chez moi, ce qui la freine, moi en 3 mots |
| Chapitre 4 · Degré d'amour | Pense à moi, temps de réponse, réaction quand on se voit, nous dans 1 an, degré d'amour en % |
| Verdict | Jauge animée avec le **score d'amour** et un verdict |
| La question | « Tu veux sortir avec moi ? » Le bouton **Non** fuit sur tout l'écran sans jamais toucher le Oui, puis démissionne |
| Rendez-vous | Activité (son date idéal est mis en avant ⭐), date, petit mot |
| Fin | Un ticket récap, puis **toutes ses réponses t'arrivent** sur WhatsApp (ou par partage / SMS) |

Il y a 4 types de questions : **choix unique** (4 cases colorées et un chrono), **choix multiples**, **réponse libre** et **curseur**.

## Personnaliser

- **Les questions** sont toutes dans [`js/questions.js`](js/questions.js). Le fichier est commenté : tu peux changer les textes, les réactions, les images (emoji) et les points d'amour.
- **Ta photo** : ajoute une photo `img/moi.jpg` dans le repo et elle s'affichera sur l'écran d'accueil.

## Paramètres du lien

| Paramètre | Rôle |
|---|---|
| `pour` | Prénom de la personne qui joue (sinon le quiz le lui demande) |
| `de` | Ton prénom |
| `g` | `f` (elle) ou `m` (il), pour les accords |
| `tel` | Ton numéro WhatsApp au format international sans `+` (optionnel) |

## Tech

HTML, CSS et JavaScript pur, sans dépendance ni build. Les images emoji viennent de [Twemoji](https://github.com/jdecked/twemoji) (licence CC-BY 4.0).

```
index.html        → le quiz
creer.html        → générateur de lien
css/style.css     → styles
js/questions.js   → LES QUESTIONS (à modifier)
js/app.js         → moteur : écrans, types de questions, score, bouton qui fuit, envoi
js/creer.js       → génération du lien
```
