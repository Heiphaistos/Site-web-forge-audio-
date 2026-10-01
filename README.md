# Forge Audio — site

Site statique de [Forge Audio](https://github.com/Heiphaistos/Forge-audio-), en ligne sur https://forgeaudio.heiphaistos.org.
Le lecteur (privé, sur compte) est sur https://connect.forgeaudio.heiphaistos.org.

Pages : accueil, fonctionnalités, télécharger (+ un guide par plateforme : windows, macos, linux, android, ios), nouveautés, FAQ, aide, mentions légales, confidentialité, 404.
Aucun build : chaque page HTML contient l'en-tête et le pied de page communs ; styles dans `assets/site.css`, menu mobile `assets/nav.js`,
liens de bureau et détection du système `assets/site.js`, visualiseur de l'accueil `assets/visualizer.js`, police Inter dans `assets/fonts/`.
Après une modification de CSS/JS, changer le `?v=` des balises qui les chargent.

Déploiement : `git pull` dans `/var/www/forgeaudio-site` sur le VPS (nginx : `error_page 404 /404.html`).
Liens de bureau : le HTML pointe vers les fichiers d'une release réelle (repli), le JS les remplace par la dernière release via l'API GitHub.
À chaque nouvelle release bureau, mettre à jour la version de ces liens de repli dans windows.html, macos.html et linux.html.

## Generation des pages

Les pages HTML sont produites par `python outils/site/gen.py` (en-tete, navigation et pied de page communs autour de chaque corps `outils/site/src/*.html`). Modifier le corps dans `outils/site/src/`, relancer le script, commiter le resultat.
