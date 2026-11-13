# Marolaka Eiffel — Majunga · Version 1

Le site d'une page de l'hôtel, reproduit à l'identique de la maquette CSSPicker « Hotel Booking Page UI Recreation ».
Il est fait en HTML, CSS et JavaScript, sans framework et sans étape de compilation.

## Arborescence

```
marolaka-eiffel/
├── index.html              Page unique
├── css/style.css           CSS d'origine de la maquette. Les ajouts techniques sont marqués « [ajout] »
├── js/config.js            Coordonnées, mode de réservation, liste des chambres
├── js/booking.js           Couche réservation (point de branchement du futur moteur)
├── js/main.js              Menu, formulaire, fenêtre, carrousel, images
├── assets/images/          Emplacements photo provisoires (placeholder-*.svg)
├── assets/icons/           icons.svg (pictogrammes) et favicon.svg
└── assets/fonts/           Réservé à la police auto-hébergée (voir plus bas)
```

## Lancer le site en local

Le plus simple est d'ouvrir `index.html` par un double-clic : le site fonctionne directement.

Pour un rendu identique à un vrai hébergement, lancez un petit serveur depuis le dossier du projet :

```bash
cd marolaka-eiffel
python -m http.server 8000      # ou : python3 -m http.server 8000
```

Ouvrez ensuite <http://localhost:8000>.

Autres solutions : l'extension « Live Server » de VS Code (clic droit sur `index.html`, puis « Open with Live Server »),
ou la commande `npx serve .` si Node.js est installé.

## Voir le site sur votre téléphone

1. Branchez l'ordinateur et le téléphone sur **le même réseau Wi-Fi**.
2. Lancez le serveur ainsi : `python -m http.server 8000 --bind 0.0.0.0`
3. Trouvez l'adresse IP locale de l'ordinateur :
   - Windows : `ipconfig`, ligne « Adresse IPv4 » (par exemple 192.168.1.24)
   - Mac : `ipconfig getifaddr en0`
   - Linux : `hostname -I`
4. Sur le téléphone, ouvrez `http://192.168.1.24:8000`, en remplaçant par votre adresse IP.
5. Sous Windows, si le pare-feu le demande, autorisez Python sur les **réseaux privés**.

Pour obtenir un lien à partager avec le client sans rien installer, glissez le dossier du projet sur <https://app.netlify.com/drop>.

## Photos de l'hôtel

Toutes les photos sont des photos de l'établissement. Elles sont stockées dans `assets/images/`, sans aucun lien externe.
Elles ont seulement été redimensionnées et compressées (JPEG progressif, qualité 82, métadonnées retirées), sans aucune retouche.
Le passage de 3,5 Mo à 1,1 Mo au total accélère le chargement sur téléphone.

| Emplacement | Fichier | Photo d'origine |
|---|---|---|
| Bannière (diaporama) — photo 1 | hero-1-piscine.jpg / hero-1-piscine-mobile.jpg | IMG_0907 |
| Bannière — photo 2 | hero-2-facade.jpg / hero-2-facade-mobile.jpg | IMG_0909 |
| Bannière — photo 3 | hero-3-jardin.jpg / hero-3-jardin-mobile.jpg | IMG_0924 |
| Galerie « Histoire » — façade | histoire-facade.jpg | IMG_0909 |
| Galerie — balcon | histoire-balcon.jpg | IMG_0912 |
| Galerie — salle de bain | histoire-salle-de-bain.jpg | IMG_0915 |
| Galerie — piscine de nuit | histoire-piscine-nuit.jpg | IMG_0914 |
| Chambre Standard | chambre-standard.jpg | IMG_0911 |
| Chambre Supérieure | chambre-superieure.jpg | IMG_0908 |
| Suite Familiale | suite-familiale.jpg | IMG_0910 |
| Fond « Prêt pour l'évasion ? » | evasion-palmiers.jpg | IMG_0907 |

Le cadrage de chaque photo se règle dans `css/style.css`, bloc « Cadrage des photos de l'hôtel », avec `object-position`.
Les photos ne sont jamais déformées.
Pour changer une photo, remplacez le fichier par un autre portant le même nom.
Les fichiers `placeholder-*.svg` servent uniquement de secours, si une photo manque.

## Diaporama de la bannière

Les trois photos défilent en boucle derrière le texte, qui reste fixe.
- **Durées** : chaque photo reste affichée 5 s, puis le fondu enchaîné dure 1,5 s, avec un léger zoom progressif. Ces durées se règlent dans `js/main.js` (`DISPLAY` et `FADE`), et le zoom dans `css/style.css` (`hero-ken-burns`).
- **Formats** : chaque photo existe en deux versions. La version paysage sert à l'ordinateur et à la tablette, la version portrait (`-mobile`) aux écrans de 560 px ou moins.
- **Chargement** : seule la première photo est préchargée. Les deux autres se chargent après l'affichage de la page.
- **Pauses** : le diaporama s'arrête quand la bannière n'est plus à l'écran ou que l'onglet est caché.
- **Animations réduites** : si le visiteur a activé cette préférence sur son appareil, la première photo reste fixe.

## Logo et favicon

- **Logo** : `assets/images/logo-marolaka-eiffel@2x.png` et `@3x.png`. C'est le logo officiel, avec un fond rendu transparent et les marges blanches retirées. Ses couleurs et ses proportions sont inchangées.
- **Favicon** : `assets/icons/favicon-32.png`, `favicon-192.png` et `apple-touch-icon.png`, créés à partir de la tour Eiffel du logo.

## Police de « Majunga »

La police de « Majunga » est Yellowtail (Google Fonts), choisie parce qu'elle est proche de la Brush Script MT de la maquette et qu'elle s'affiche de la même façon sur tous les appareils.
Pour ne plus dépendre de Google, vous pouvez l'héberger avec le site :
1. Téléchargez le fichier `.woff2` dans `assets/fonts/`.
2. Supprimez les 3 balises `fonts.googleapis.com` et `fonts.gstatic.com` dans `index.html`.
3. Ajoutez ceci en haut de `css/style.css` : `@font-face { font-family: 'Yellowtail'; src: url('../assets/fonts/yellowtail.woff2') format('woff2'); font-display: swap; }`

## Réservation

**Aujourd'hui** (`provider: 'email'` dans `js/config.js`), le formulaire :
- vérifie les dates (pas de date passée, départ après l'arrivée) ;
- affiche un récapitulatif dans la fenêtre « Une évasion vous attend » ;
- prépare un e-mail de demande à `contact@marolakaeiffel.com`.

Rien n'est enregistré et aucune disponibilité n'est vérifiée : c'est l'équipe de l'hôtel qui confirme.

**Pour plus tard**, un vrai moteur de réservation (calendrier, disponibilités, choix de chambre, gestion des réservations) se branchera sans toucher au design :
- Le formulaire passe déjà par `window.BookingService` (dans `js/booking.js`). Pour ajouter un moteur, on écrit un fournisseur avec `BookingService.registerProvider('moteur', { submit(request) { … } })`, puis on indique `provider: 'moteur'` dans `js/config.js`.
- Un fournisseur peut renvoyer `{ type: 'contact', … }`, qui ouvre la fenêtre actuelle, ou `{ type: 'redirect', url }`, qui redirige le visiteur vers la page de paiement ou de confirmation du moteur.
- Les cartes de chambres portent déjà des identifiants (`data-room-id`, `data-room-capacity`, `data-room-price`), repris dans `SITE_CONFIG.rooms`.

Il y a deux façons de réaliser ce système :
1. **Un moteur hôtelier existant** (Cloudbeds, SiteMinder, Beds24…). Il gère les disponibilités, les paiements et la synchronisation avec Booking.com et Airbnb. C'est l'option la plus rapide et la plus fiable.
2. **Un développement sur mesure**. Il faut une base de données (chambres, tarifs, réservations), une API, un espace d'administration pour l'hôtel, l'envoi d'e-mails de confirmation et, si besoin, un paiement en ligne (par exemple Stripe ou un service local comme MVola).

## À vérifier avant la mise en ligne

- Les coordonnées : téléphone, e-mail, adresse (dans `index.html` et `js/config.js`).
- Les liens Facebook et Instagram : ils ouvrent pour l'instant la page d'accueil de ces sites.
- Le lien « Blog » : il mène pour l'instant à la section « Histoire », en attendant la page Blog.

## Pictogrammes

Les icônes viennent de [Lucide](https://lucide.dev), sous licence ISC. Elles sont intégrées en SVG dans la page, donc sans dépendance externe. Une copie se trouve dans `assets/icons/icons.svg`.
