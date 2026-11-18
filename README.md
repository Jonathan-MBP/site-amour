# 💌 Site d'amour

Un petit site interactif pour demander à quelqu'un de sortir avec toi.

**Le parcours :**
1. Une lettre à ouvrir
2. Son prénom (avec des réactions selon ce qu'elle ou il écrit)
3. Un mini-quiz « tu préfères… » (gauche ou droite)
4. Une note sur 10 (en dessous de 5, le site remet à 10 😤)
5. **La grande question** : le bouton « Non » s'enfuit, change de texte, et finit par devenir un « Oui »
6. Le choix du rendez-vous (activité + date + petit mot)
7. Un ticket récap et un bouton pour t'envoyer la réponse (WhatsApp, partage ou SMS)

## Utilisation

Va sur la page **`creer.html`**, remplis les prénoms (et ton numéro WhatsApp si tu veux), copie le lien et envoie-le.

Le lien ressemble à ça :

```
https://<ton-pseudo>.github.io/site-amour/?pour=Inès&de=Jonathan&tel=33612345678
```

| Paramètre | Rôle |
|-----------|------|
| `pour` | Prénom de la personne qui reçoit le lien (sinon le site le lui demande) |
| `de`   | Ton prénom |
| `tel`  | Ton numéro WhatsApp au format international sans `+` (optionnel) |

## Tech

HTML, CSS et JavaScript pur — aucune dépendance, aucun build. Hébergé gratuitement sur GitHub Pages.

```
index.html     → le parcours
creer.html     → générateur de lien
css/style.css  → styles (mode clair + sombre)
js/app.js      → logique des étapes (if / else, validation, bouton qui fuit, confettis)
js/creer.js    → génération du lien
```

Pour tester en local : ouvre simplement `index.html` dans ton navigateur.
