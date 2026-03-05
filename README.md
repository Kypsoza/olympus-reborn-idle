# ⚡ Olympus Reborn Idle

Jeu idle de construction de cité grecque antique avec génération procédurale de carte.

## Jouer

🎮 **[Jouer en ligne](https://kypsoza.github.io/olympus-reborn-idle/)**

## Fonctionnalités

- Carte hexagonale générée procéduralement
- 27 bâtiments sur 3 ères (Archaïque, Classique, Hellénistique)
- Arbres de talents Drachmes (in-run) et Éther (permanent)
- Système de prestige
- Sauvegarde sur Google Drive (connexion Google requise)
- Sauvegarde locale (localStorage) en fallback

## Déploiement local

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

> ⚠️ Ouvrir `index.html` directement en `file://` désactive la synchronisation Google Drive.
