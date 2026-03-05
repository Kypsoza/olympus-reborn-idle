# ⚡ OLYMPUS REBORN — ROADMAP COMPLÈTE
*Dernière mise à jour : v64*

---

## 🟢 ÉTAT ACTUEL (v64)

### Ce qui existe
- Carte hexagonale procédurale avec brouillard de guerre
- 27 bâtiments sur 3 ères (Archaïque → Classique → Divine)
- Arbre Drachmes in-run (agriculture, sylviculture, métallurgie, sidérurgie, population, ères, reliques, constellations)
- Arbre Éther permanent (branches : ères, reliques, constellations)
- Système de Prestige (+5% prod par prestige précédent)
- Scouts, routes, tunnels, rivières, vases marécageuses
- Sauvegarde Google Drive + localStorage
- Interface mobile complète (v64)
- Boutons mobiles détection touch (is-touch)
- Bottom sheet burger menu
- Zoom controls mobiles

### Ce qui manque (identifié)
- Ère 2 et Ère 3 peu développées côté bâtiments et mécanique
- Arbre Éther : peu de contenu (seulement ères/reliques/constellations)
- Pas de 6 zones triangulaires
- Pas de Panthéon (arbre Albion)
- Pas de Codex Olympien
- Pas de modes de jeu (A/B/C)

---

## 📋 PHASING

---

### PHASE 5 — Consolidation Ères 2 & 3
*Prérequis : base actuelle v64*

**Objectif** : rendre les Ères 2 et 3 vraiment jouables et intéressantes avant d'ajouter de la complexité.

#### 5.1 — Ère 2 enrichie
- [ ] 3 nouveaux bâtiments Ère 2 (Bibliothèque, Camp Militaire, Fontaine)
- [ ] Événements Ère 2 : Festins (boost pop temporaire), Marchés (drachmes bonus)
- [ ] Ressource Ère 2 : Ambroisie (produite par Verger + Alambic combinés)
- [ ] Mécanique Bonheur : habitants heureux/malheureux selon ratio nourr/pop
- [ ] Affichage bonheur dans le HUD

#### 5.2 — Ère 3 enrichie
- [ ] 2 nouveaux bâtiments Ère 3 (Omphalos, Palais des Titans actif)
- [ ] Ressource Ère 3 : Amrita (craft Ère 3 uniquement)
- [ ] Événements Ère 3 : Prodiges divins (boost éther temporaire)
- [ ] Mécanique Prestige améliorée : Score de Renaissance affiché en temps réel

#### 5.3 — Arbre Éther étendu
- [ ] 3 nouvelles branches Éther : Production, Exploration, Prestige
- [ ] Branche Production (6 nœuds) : multiplicateurs toutes ressources
- [ ] Branche Exploration (6 nœuds) : fouilles moins chères, scouts plus rapides
- [ ] Branche Prestige (6 nœuds) : Éther gagné +%, Score Renaissance +%
- [ ] UI arbre Éther redessinée (style Albion — voir Phase 7)

---

### PHASE 6 — Codex Olympien
*Prérequis : Phase 5 terminée, au moins 1 Prestige possible*

**Objectif** : implémenter la boucle Book of Shadows adaptée.

#### 6.1 — Système Codex
- [ ] Objet Codex : jauge Pages (0→100), niveau (1→∞)
- [ ] Sources de Pages par Prestige :
  - Score Renaissance / 1000 = pages de base
  - +10 pages par zone conquise (Phase 8)
  - +5 pages par type de bâtiment construit
  - +20 pages si Ère 3 atteinte
- [ ] Niveaux Codex → multiplicateur Éther :
  - Niv 1 : ×1.0 | Niv 2 : ×1.5 (100p) | Niv 3 : ×2.5 (300p)
  - Niv 4 : ×4.0 (700p) | Niv 5 : ×6.5 (1500p) | ...exponentiel
- [ ] Affichage Codex dans l'écran de Prestige

#### 6.2 — Nœud Central Éther (investissement Codex)
- [ ] Nœud central dans l'arbre Éther (dépense Éther pour améliorer le Codex)
- [ ] Slots Pages bonus (dépense Éther → +X pages par prestige)
- [ ] Pages Dorées (×2 certaines pages)
- [ ] Déblocage de nouvelles sources de pages

#### 6.3 — Boucle visible
- [ ] Écran Prestige refondu : montre Pages gagnées, niveau Codex, Éther multiplié
- [ ] Indicateur en jeu : "Prochaine page dans X ressources"

---

### PHASE 7 — Panthéon (Arbre Albion)
*Prérequis : Phase 6 + avoir fait 1 Prestige*

**Objectif** : arbre de talents permanent style Albion Online avec branches divines indépendantes.

#### 7.1 — Structure
- [ ] Nœud central (Codex Olympien) : accès à toutes les branches
- [ ] 6 branches divines rayonnantes (une par dieu des zones futures)
- [ ] 2 branches transversales (Cartographie Divine, Territoires)
- [ ] Chaque branche : 15 nœuds × 5 points de talent = 75 points/branche

#### 7.2 — Branches divines
Chaque branche débloquée uniquement après conquête de la zone du dieu (Phase 8).

| Branche | Dieu | Spécialité |
|---------|------|-----------|
| 🌾 Déméter | Zone 1 | Production alimentaire, population |
| 🔨 Héphaïstos | Zone 2 | Forge, métaux, bâtiments |
| 💫 Aphrodite | Zone 3 | Drachmes, bonheur, commerce |
| 💀 Hadès | Zone 4 | Prestige, Éther, Codex |
| 🌙 Artémis | Zone 5 | Exploration, forêts, scouts |
| ⚡ Zeus | Zone 6 | Tout débloquer, fin de jeu |

- [ ] 15 nœuds par branche (3 anneaux de 5)
- [ ] Anneau 1 : effets simples (+prod, -coût)
- [ ] Anneau 2 : effets composés (synergies entre ressources)
- [ ] Anneau 3 : 3 nœuds SANS PLAFOND (investissement infini, +0.5%/500 Éther)

#### 7.3 — Branches transversales
- [ ] Branche Cartographie (15 nœuds) : talents zones/frontières (voir liste Phase 8)
- [ ] Branche Prestige/Codex (15 nœuds) : amplification boucle Codex

#### 7.4 — UI Albion
- [ ] Canvas dédié avec nœud central + branches rayonnantes
- [ ] Chaque nœud : cercle cliquable, couleur par branche, état (vide/partiel/plein)
- [ ] Lignes de connexion entre nœuds
- [ ] Pan/zoom sur le canvas Panthéon
- [ ] Tooltip par nœud (effet, coût, progression)
- [ ] Branches grises/verrouillées jusqu'à conquête zone

---

### PHASE 8 — Zones Triangulaires
*Prérequis : Phase 7 + Score Renaissance possible*

**Objectif** : les 6 triangles divins autour de la zone centrale.

#### 8.1 — Génération carte
- [ ] Zone centrale : hexagones existants (inchangés)
- [ ] 6 triangles générés autour, positionnés aléatoirement à chaque partie
- [ ] Chaque triangle : biome unique, terrain dominant, ressources exclusives
- [ ] Frontières Vivantes : obstacle procédural unique par frontière

| Zone | Biome | Ressource exclusive | Frontière possible |
|------|-------|--------------------|--------------------|
| Déméter 🌾 | Plaines | Nectar | — (gratuit) |
| Héphaïstos 🔨 | Volcanique | Métal Divin | Montagnes (Mines) |
| Aphrodite 💫 | Côtier | Amrita | Rivière divine (Pont) |
| Hadès 💀 | Souterrain | Orichalque | Gouffre (Tunnel) |
| Artémis 🌙 | Forêt dense | Ambroisie | Forêt maudite (Autel) |
| Zeus ⚡ | Montagne | Éther ×3 | Tempête (Pylônes) |

#### 8.2 — Système de déverrouillage (toutes conditions simultanées)
1. **Score Renaissance** ≥ seuil (1k / 5k / 20k / 100k / 500k)
2. **Frontière Vivante** détruite (obstacle spécifique)
3. **Clé Divine** craftée (timer + 3 ressources rares)
4. **Rituel de Dédicace** accompli (condition narrative unique)

- [ ] Interface Craft de Clés (2 slots simultanés, +1 avec talent)
- [ ] Timer Rituel visible
- [ ] Indicateur frontière sur la carte

#### 8.3 — Malédictions Progressives (tant que zone verrouillée)
- [ ] Stade 1 (0-10 min) : Production -5%
- [ ] Stade 2 (10-30 min) : Production -15%
- [ ] Stade 3 (30-60 min) : Production -30% + événement punitif
- [ ] Stade 4 (60+ min) : 1 bâtiment détruit toutes les 5 min
- [ ] Indicateur visuel malédiction dans le HUD

#### 8.4 — Post-déverrouillage
- [ ] Malédiction résiduelle -10% jusqu'à Temple du dieu construit
- [ ] Événements sismiques/météo aléatoires 5 min
- [ ] Concurrence divine : construire dans zone A fâche dieu B (pénalité légère)
- [ ] Biome actif : ressources exclusives accessibles

#### 8.5 — Codex + Zones
- [ ] +10 Pages Codex par zone conquise
- [ ] +1 source de Pages débloquée par zone

---

### PHASE 9 — Modes de Jeu
*Prérequis : Phase 8 complète*

**Objectif** : 3 modes disponibles à la création de partie.

#### Mode A — Panthéon *(défaut, Concept A)*
> City builder idle classique avec toutes les mécaniques

#### Mode B — Théomachie *(Concept B)*
- [ ] Les 6 dieux produisent passivement dans leurs zones
- [ ] Mécanique Hubris : dieu dominant → attaque zone centrale
- [ ] Arbitrage : autels de rivalité, rituels de rééquilibrage
- [ ] Factions : choisir coalition de dieux, effets cumulatifs

#### Mode C — Genèse Divine *(Concept C)*
- [ ] 6 zones = 6 Âges à traverser (Antiquité → Âge Divin)
- [ ] Quêtes narratives par zone
- [ ] Clés Divines = artefacts avec fragment de mythologie
- [ ] Prestige = Nouvelle Ère (histoire différente, même mécanique)

#### 9.1 — Écran de sélection de mode
- [ ] Écran titre refondu avec choix de mode
- [ ] Description + preview de chaque mode
- [ ] Sauvegarde séparée par mode

---

### PHASE 10 — Polish & Endgame
*Prérequis : Phase 9*

#### 10.1 — Fin de jeu
- [ ] Zeus zone 6 conquise → Âge de l'Olympe
- [ ] Pouvoir Divin Zeus : tous les multiplicateurs ×2 permanent
- [ ] Leaderboard (Score de Renaissance cumulé)
- [ ] Achievements

#### 10.2 — Équilibrage global
- [ ] Courbe de progression Codex testée et ajustée
- [ ] Malédictions progressives équilibrées
- [ ] Temps de craft Clés Divines calibrés

#### 10.3 — UX
- [ ] Tutoriel interactif (Phase 1 guidée)
- [ ] Notifications push (offline progress)
- [ ] Animations Prestige améliorées

---

## 📊 RÉSUMÉ TEMPOREL

| Phase | Contenu | Complexité |
|-------|---------|------------|
| 5 | Ères 2/3 + Arbre Éther étendu | Moyenne |
| 6 | Codex Olympien (Book of Shadows) | Moyenne |
| 7 | Panthéon Albion (UI + branches) | Haute |
| 8 | 6 Zones triangulaires | Très haute |
| 9 | 3 Modes de jeu | Haute |
| 10 | Polish & Endgame | Moyenne |

---

## 🔑 PRINCIPES DE DESIGN

1. **La zone centrale reste neutre** — jamais attaquée, jamais maudite
2. **Le Codex est la clé de la progression** — plus tu prestiges vite, plus tu gagnes
3. **Les branches Panthéon sont indépendantes** — chacune déblocable séparément après conquête
4. **Les zones sont aléatoires** — seed différente à chaque partie (mémorisable avec talent)
5. **Mobile first** — tout doit fonctionner sur S24+ et Pixel Fold
