# ⚡ Olympus Reborn Idle

> City-builder idle sur le thème de la Grèce antique avec génération procédurale, progression multi-couches et 9 phases de contenu.

🎮 **[Jouer en ligne](https://kypsoza.github.io/olympus-reborn-idle/)**

---

## 🎯 Résumé

Olympus Reborn est un jeu idle de construction de cité dans lequel vous reconstruisez une civilisation grecque de l'Antiquité à l'Âge Divin. Chaque cycle (Prestige) réinitialise votre monde tout en vous laissant des récompenses permanentes — Éther, Codex, Panthéon — qui renforcent exponentiellement vos runs suivants.

---

## 🚀 Jouer en local

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

> ⚠️ Ouvrir `index.html` en `file://` désactive la synchronisation Google Drive.

---

## ✨ Fonctionnalités

### Phase 1 — Carte hexagonale procédurale
- ~100 cases générées par seed, 5 types de terrain
- Cases spéciales : Ruines Antiques, Autel de Prométhée
- Fouille (5 Drachmes/case), routes obligatoires, caméra pan/zoom

### Phase 2 — 9 Bâtiments Ère 1 (Antiquité)
- Ferme · Bûcherons · Mine Cuivre · Mine Fer · Tour de Guet · Huttes · Sanctuaire · Moulin · Pylône
- Champs/Bosquets auto-créés, travailleurs, connexion route

### Phase 3 — 9 Bâtiments Ère 2 + Talents Drachmes
- Verger · Halle · Forgeron · Fonderie · Maison · Alambic · Agora · Temple Hermès · Forteresse
- Ressources Ère 2 : Nectar, Bronze, Acier
- Arbre Talents Drachmes : 7 branches (Agriculture / Sylviculture / Métallurgie / Sidérurgie / Population / Ingénierie / Énergie)

### Phase 4 — Prestige & Ruines
- Conditions : 50 cases révélées + 3 Ruines Niveau 5
- Ruines améliorables ×4 (+5%/+12%/+22%/+35% prod. globale)
- Autel de Prométhée — aperçu Éther avant confirmation
- Spectres d'Héritage (fantômes des Ruines Niv.≥2)

### Phase 5 — Ère 3 + Arbre Éther étendu
- 8 bâtiments divins (10 000 Éther) : Jardins · Bosquet · Trésor · Forge Divine · Palais · Sénat · Nœud · Autel de Fusion
- Ressources Ère 3 : Foudre, Orichalque, Métal Divin, Amrita
- Arbre Éther permanent : Ères (100/10 000✨) · Reliques (×6) · Constellations (×5)

### Phase 6 — Codex Olympien
- Pages Codex cumulées à chaque Prestige → multiplicateur Éther permanent (×1 → ×65)
- 10 niveaux, 4 investissements Éther (slots bonus, Pages Dorées, sources)
- Badge 📖 Niv.X ×Y dans le HUD

### Phase 7 — Panthéon (style Albion Online)
- **120 talents permanents** — canvas radial pan/zoom, 8 branches × 15 nœuds
- 2 branches transversales dès Phase 7 : Cartographie 🗺️ + Héritage 📜
- 6 branches divines débloquées par Zone : Déméter/Héphaïstos/Aphrodite/Hadès/Artémis/Zeus
- Nœuds sans plafond (♾️) — investissement Éther infini

### Phase 8 — Zones Divines
- 6 zones avec biomes, ressources exclusives, 4 conditions simultanées de conquête
- Clés Divines à crafter (timer + ressources), Rituels narratifs, Frontières Vivantes
- Malédictions Progressives 4 stades (-5%/-15%/-30%/démolition)
- Indicateur 💀 HUD, modal victoire Zeus

### Phase 9 — Modes de Jeu + Wiki
- Écran de sélection : Mode Panthéon (disponible) · Théomachie *(à venir)* · Genèse Divine *(à venir)*
- Wiki intégré (50+ articles, recherche globale, navigation cliquable)

---

## 🗂️ Architecture

```
src/
├── engine/GameLoop.js          # Boucle principale, tick, save/load
├── map/HexGrid.js              # Génération procédurale + score
├── map/HexCell.js              # Cellule (type, bâtiment, niveau)
├── map/MapRenderer.js          # Rendu canvas + sélection
├── map/Camera.js               # Pan/zoom avec inertie
├── systems/ResourceManager.js  # Ressources, taux
├── systems/BuildingManager.js  # Construction, production
├── systems/TalentManager.js    # Talents Drachmes + Éther
├── systems/PrestigeManager.js  # Score, Éther, spectres
├── systems/CodexManager.js     # Codex Olympien (Phase 6)
├── systems/PantheonManager.js  # 120 talents permanents (Phase 7)
├── systems/ZoneManager.js      # Zones divines, malédictions (Phase 8)
├── systems/ScoutManager.js     # Scouts automatiques
└── ui/
    ├── HUD.js                  # Ressources, badges, malédictions
    ├── BuildingPanel.js        # Panneau + onglets Talents/Codex/Panthéon/Zones
    ├── HelpPanel.js            # Wiki intégré (Phase 9)
    └── OfflineModal.js         # Progression hors-ligne
```

---

## 💾 Sauvegarde

- **Locale** : `localStorage`, auto toutes les 30s
- **Google Drive** : synchronisation OAuth optionnelle

```js
// Réinitialiser (console navigateur)
localStorage.clear(); location.reload();
```

---

## 📊 Boucle de jeu

```
Run → Révéler → Construire → Améliorer Ruines → Prestige
         ↓
     Éther (√Score × 15 × Codex × Panthéon)
     Pages Codex → multiplicateur permanent
         ↓
     Arbre Éther → Ères/Reliques/Constellations
     Panthéon → 120 talents permanents
     Zones → 6 conquêtes → branches divines
```

---

## 🗺️ Roadmap

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1–4 | Carte + Bâtiments + Prestige | ✅ |
| 5 | Ère 3 + Arbre Éther | ✅ |
| 6 | Codex Olympien | ✅ |
| 7 | Panthéon Albion | ✅ |
| 8 | Zones Divines | ✅ |
| 9 | Modes de Jeu + Wiki | 🔜 |
| 10 | Polish + Leaderboard + Achievements | 🔜 |

---

## 🛠️ Technologies

Vanilla JS · Canvas 2D · CSS Grid/Flexbox · localStorage · Google Drive API v3 · EventBus

## 📱 Compatibilité

Desktop Chrome/Firefox/Safari ✅ · Mobile Android/iOS ✅ · Minimum 360×600px

---

*Construit avec passion pour la mythologie grecque et les idle games.* ⚡
