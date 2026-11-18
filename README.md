# 🌹 Quelques mots pour toi

Un petit site romantique pour mieux connaître quelqu'un… et lui demander de sortir avec toi.

**Le site :** https://jonathan-mbp.github.io/site-amour/
**Créer ton lien :** https://jonathan-mbp.github.io/site-amour/creer.html

## L'expérience

Chaque question s'affiche sur sa propre photo en plein écran (fleurs, couples, coucher de soleil, Paris, montgolfières, ciel étoilé…). On passe d'une photo à l'autre en fondu, avec des pétales qui tombent doucement. Il n'y a ni chrono ni score à battre : la personne prend son temps.

1. **Accueil** : « Jonathan a écrit quelque chose rien que pour toi »
2. **I · Ce que tu aimes** : plat, saison, fleurs, soirée idéale, premier rendez-vous rêvé, voyage à deux, ce qui la fait craquer, ce qui la rend heureuse
3. **II · Ce que tu n'aimes pas** : ce qu'elle ne pardonne pas, ce qui l'agace, comment elle s'apaise après une dispute, ce qu'il ne faut jamais faire
4. **III · Toi & moi** : votre première conversation, comment elle se sent aimée, ce qu'elle aime chez toi, ce qui la fait hésiter, toi en trois mots
5. **IV · Ton cœur** : elle pense à toi combien, en combien de temps elle te répond, sa réaction quand elle te voit, vous dans un an, où en est son cœur
6. **Le verdict** : un cœur qui se remplit avec son score d'amour, et quelques-unes de ses réponses
7. **La question** : « Tu veux sortir avec moi ? » Le bouton Non s'enfuit partout sur l'écran sans jamais toucher le Oui, puis finit par disparaître
8. **Le rendez-vous** : l'activité (son rendez-vous rêvé est déjà présélectionné), le jour et un petit mot
9. **L'invitation** : une jolie carte récap, puis toutes ses réponses t'arrivent sur WhatsApp (ou par partage / SMS)

Après chaque réponse, un petit mot doux s'affiche avant la question suivante.

## Personnaliser

- **Questions, réponses, photos, petits mots** : tout est dans [`js/questions.js`](js/questions.js), avec des commentaires.
- **Ta photo** : ajoute `img/moi.jpg` et elle s'affichera en rond sur l'accueil.
- **Changer une photo** : remplace le fichier dans `img/` en gardant le même nom.

## Paramètres du lien

| Paramètre | Rôle |
|---|---|
| `pour` | Son prénom (sinon le site le lui demande) |
| `de` | Ton prénom |
| `g` | `f` (elle) ou `m` (il), pour les accords |
| `tel` | Ton numéro WhatsApp au format international sans `+` (optionnel) |

## Crédits

Toutes les photos viennent de [Pexels](https://www.pexels.com) et sont utilisées selon la [licence Pexels](https://www.pexels.com/license/) : gratuites, sans attribution obligatoire. Merci aux photographes.
Polices : Cormorant Garamond et Jost (Google Fonts).

## Tech

HTML, CSS et JavaScript pur, sans dépendance ni build.

```
index.html        → le parcours
creer.html        → générateur de lien
css/style.css     → le style
js/questions.js   → les questions (à modifier)
js/app.js         → le moteur : écrans, fondus, score, bouton qui fuit, envoi
js/creer.js       → génération du lien
img/              → photos (bg-* = fonds, o-* = réponses)
```
