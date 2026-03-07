/* ═══════════════════════════════════════════════════════════
   PantheonManager.js — v0.7.0 — Phase 7 : Panthéon
   Arbre de talents permanent style Albion Online.
   8 branches × 15 nœuds = 120 nœuds total.
   Payés en Éther. Certains nœuds sont sans plafond.
   Les 6 branches divines sont débloquées en Phase 8.
   Les 2 branches transversales sont disponibles dès le 1er Prestige.
   ═══════════════════════════════════════════════════════════ */

// ── Définition des branches ──────────────────────────────────
const PANTHEON_BRANCHES = [
  // ── Branches transversales (disponibles Phase 7) ──────────
  {
    id: 'cartographie', label: 'Cartographie', icon: '🗺️', color: '#60c8a0',
    angle: -Math.PI * 0.5,  // haut
    unlocked: true,          // disponible dès Phase 7
    desc: 'Maîtrise de la carte et de l\'exploration'
  },
  {
    id: 'prestige_codex', label: 'Héritage', icon: '📜', color: '#c080f0',
    angle: Math.PI * 0.5,   // bas
    unlocked: true,
    desc: 'Amplification du Codex et du Prestige'
  },
  // ── 6 Branches divines (verrouillées jusqu'à Phase 8) ─────
  {
    id: 'demeter',    label: 'Déméter',    icon: '🌾', color: '#8bc34a',
    angle: -Math.PI * (1/6),  // haut-droite
    unlocked: false, zoneId: 1,
    desc: 'Production alimentaire et population'
  },
  {
    id: 'hephaïstos', label: 'Héphaïstos', icon: '🔨', color: '#ff7043',
    angle:  Math.PI * (1/6),  // bas-droite
    unlocked: false, zoneId: 2,
    desc: 'Forge, métaux et bâtiments'
  },
  {
    id: 'aphrodite',  label: 'Aphrodite',  icon: '💫', color: '#f48fb1',
    angle: -Math.PI * (5/6),  // haut-gauche
    unlocked: false, zoneId: 3,
    desc: 'Drachmes, bonheur et commerce'
  },
  {
    id: 'hades',      label: 'Hadès',      icon: '💀', color: '#7e57c2',
    angle:  Math.PI * (5/6),  // bas-gauche
    unlocked: false, zoneId: 4,
    desc: 'Prestige, Éther et Codex'
  },
  {
    id: 'artemis',    label: 'Artémis',    icon: '🌙', color: '#4fc3f7',
    angle:  Math.PI,          // gauche
    unlocked: false, zoneId: 5,
    desc: 'Exploration, forêts et scouts'
  },
  {
    id: 'zeus',       label: 'Zeus',       icon: '⚡', color: '#ffd54f',
    angle:  0,                // droite
    unlocked: false, zoneId: 6,
    desc: 'Pouvoir absolu — Fin de jeu'
  },
];

// ── Définition des 120 nœuds (15 par branche) ───────────────
// Format : id, branch, ring (1-3), slot (0-4), name, desc, icon, cost, effect, requires
// ring 1 (dist 130) : effets simples, ring 2 (dist 260) : synergies, ring 3 (dist 390) : sans plafond

const PANTHEON_NODES = {
  // ════════════════════════════════════════════════════════
  //  CARTOGRAPHIE (transversale, disponible Phase 7)
  // ════════════════════════════════════════════════════════
  cart_r1_0: { branch:'cartographie', ring:1, slot:0, name:'Premiers Pas',      icon:'👣', cost:30,
    desc:'+10% vitesse de révélation des cases',
    effect:{ type:'revealSpeed', value:10 }, requires:[] },
  cart_r1_1: { branch:'cartographie', ring:1, slot:1, name:'Œil de Lynx',       icon:'👁️', cost:30,
    desc:'Halos visibles à +2 cases de distance (total 7)',
    effect:{ type:'haloRange', value:2 }, requires:[] },
  cart_r1_2: { branch:'cartographie', ring:1, slot:2, name:'Terrains Familiers', icon:'🏔️', cost:30,
    desc:'Fouille -10% plus chère',
    effect:{ type:'digCostPct', value:-10 }, requires:[] },
  cart_r1_3: { branch:'cartographie', ring:1, slot:3, name:'Cartographe',        icon:'📐', cost:30,
    desc:'+2 cases révélées en anneau 1 au début',
    effect:{ type:'startReveal', value:2 }, requires:[] },
  cart_r1_4: { branch:'cartographie', ring:1, slot:4, name:'Scout Rapide',       icon:'🏃', cost:30,
    desc:'Scouts 20% plus rapides',
    effect:{ type:'scoutSpeedPct', value:20 }, requires:[] },

  cart_r2_0: { branch:'cartographie', ring:2, slot:0, name:'Géographie Sacrée',  icon:'🗾', cost:80,
    desc:'Fouille -25% plus chère',
    effect:{ type:'digCostPct', value:-25 }, requires:['cart_r1_2'] },
  cart_r2_1: { branch:'cartographie', ring:2, slot:1, name:'Vision Céleste',      icon:'🔭', cost:80,
    desc:'Halos visibles à +4 cases de distance (total 9)',
    effect:{ type:'haloRange', value:4 }, requires:['cart_r1_1'] },
  cart_r2_2: { branch:'cartographie', ring:2, slot:2, name:'Mémorisation',        icon:'🧠', cost:80,
    desc:'+5% production par case révélée (max +25%)',
    effect:{ type:'prodPerReveal', value:5, cap:25 }, requires:['cart_r1_0'] },
  cart_r2_3: { branch:'cartographie', ring:2, slot:3, name:'Éclaireur d\'Élite',  icon:'⚔️', cost:80,
    desc:'Scouts révèlent +1 case voisine supplémentaire',
    effect:{ type:'scoutExtraReveal', value:1 }, requires:['cart_r1_4'] },
  cart_r2_4: { branch:'cartographie', ring:2, slot:4, name:'Avant-Poste',         icon:'🏕️', cost:80,
    desc:'+20% production dans les cases à portée de Scout',
    effect:{ type:'scoutAuraProd', value:20 }, requires:['cart_r1_4'] },

  cart_r3_0: { branch:'cartographie', ring:3, slot:0, name:'Maître Cartographe',  icon:'🌍', cost:200, uncapped:true,
    desc:'+0.5% toute production par 200 Éther investi (sans plafond)',
    effect:{ type:'uncappedProdPer', ethPerPoint:200, valuePerPoint:0.5 }, requires:['cart_r2_2'] },
  cart_r3_1: { branch:'cartographie', ring:3, slot:1, name:'Terrain Conquis',     icon:'🏹', cost:200, uncapped:true,
    desc:'-0.5% coût fouille par 200 Éther investi (sans plafond)',
    effect:{ type:'uncappedDigCostPer', ethPerPoint:200, valuePerPoint:0.5 }, requires:['cart_r2_0','cart_r2_1'] },
  cart_r3_2: { branch:'cartographie', ring:3, slot:2, name:'Oracle',              icon:'🔮', cost:200,
    desc:'Révèle l\'emplacement de toutes les Bases Cachées au début',
    effect:{ type:'revealBasesOnStart', value:true }, requires:['cart_r2_1'] },
  cart_r3_3: { branch:'cartographie', ring:3, slot:3, name:'Légion de Scouts',    icon:'⚔️', cost:200,
    desc:'+2 scouts simultanés (total 3)',
    effect:{ type:'scoutSlots', value:2 }, requires:['cart_r2_3','cart_r2_4'] },
  cart_r3_4: { branch:'cartographie', ring:3, slot:4, name:'Domination Totale',   icon:'👑', cost:300,
    desc:'Fouille révèle aussi les voisins directs (-50% HP)',
    effect:{ type:'chainReveal', value:0.5 }, requires:['cart_r3_0','cart_r3_1'] },

  // ════════════════════════════════════════════════════════
  //  HÉRITAGE / PRESTIGE-CODEX (transversale, Phase 7)
  // ════════════════════════════════════════════════════════
  her_r1_0: { branch:'prestige_codex', ring:1, slot:0, name:'Mémoire Ancienne',  icon:'📖', cost:30,
    desc:'+10% Éther gagné à chaque Prestige',
    effect:{ type:'etherGainPct', value:10 }, requires:[] },
  her_r1_1: { branch:'prestige_codex', ring:1, slot:1, name:'Encrier Doré',      icon:'✍️', cost:30,
    desc:'+15 Pages Codex à chaque Prestige',
    effect:{ type:'bonusPages', value:15 }, requires:[] },
  her_r1_2: { branch:'prestige_codex', ring:1, slot:2, name:'Héritage',          icon:'🏛️', cost:30,
    desc:'Les Bases conservées au Prestige gardent +1 niveau bonus',
    effect:{ type:'heritageBonus', value:1 }, requires:[] },
  her_r1_3: { branch:'prestige_codex', ring:1, slot:3, name:'Renaissance Vive',  icon:'🌅', cost:30,
    desc:'+10% Score de Renaissance',
    effect:{ type:'scoreMultPct', value:10 }, requires:[] },
  her_r1_4: { branch:'prestige_codex', ring:1, slot:4, name:'Ressources Initiales', icon:'💰', cost:30,
    desc:'+200 de chaque ressource de base au départ',
    effect:{ type:'startBonus', value:200 }, requires:[] },

  her_r2_0: { branch:'prestige_codex', ring:2, slot:0, name:'Amplificateur',     icon:'⚡', cost:80,
    desc:'+25% Éther gagné à chaque Prestige',
    effect:{ type:'etherGainPct', value:25 }, requires:['her_r1_0'] },
  her_r2_1: { branch:'prestige_codex', ring:2, slot:1, name:'Codex Vivant',      icon:'📚', cost:80,
    desc:'Pages Codex ×1.5 à chaque Prestige',
    effect:{ type:'codexPagesMult', value:50 }, requires:['her_r1_1'] },
  her_r2_2: { branch:'prestige_codex', ring:2, slot:2, name:'Mémoire du Titan',  icon:'🗿', cost:80,
    desc:'Les talents Drachmes se réinitialisent à 50% de leur coût (au lieu de 100%)',
    effect:{ type:'talentCostOnReset', value:50 }, requires:['her_r1_2'] },
  her_r2_3: { branch:'prestige_codex', ring:2, slot:3, name:'Gloire Éternelle',  icon:'🌟', cost:80,
    desc:'+25% Score de Renaissance',
    effect:{ type:'scoreMultPct', value:25 }, requires:['her_r1_3'] },
  her_r2_4: { branch:'prestige_codex', ring:2, slot:4, name:'Trésor des Âges',   icon:'💎', cost:80,
    desc:'+500 de toutes les ressources de base au départ',
    effect:{ type:'startBonus', value:500 }, requires:['her_r1_4'] },

  her_r3_0: { branch:'prestige_codex', ring:3, slot:0, name:'Ascension',          icon:'🌌', cost:200, uncapped:true,
    desc:'+1% Éther par 100 Éther investi (sans plafond)',
    effect:{ type:'uncappedEtherGainPer', ethPerPoint:100, valuePerPoint:1 }, requires:['her_r2_0'] },
  her_r3_1: { branch:'prestige_codex', ring:3, slot:1, name:'Codex Olympien',     icon:'📖', cost:200, uncapped:true,
    desc:'+0.5% Pages Codex par 100 Éther investi (sans plafond)',
    effect:{ type:'uncappedPagesMult', ethPerPoint:100, valuePerPoint:0.5 }, requires:['her_r2_1'] },
  her_r3_2: { branch:'prestige_codex', ring:3, slot:2, name:'Legs Divin',         icon:'⚜️', cost:200,
    desc:'Commence chaque run avec les 5 premiers talents Drachmes déjà appris',
    effect:{ type:'startWithTalents', value:5 }, requires:['her_r2_2','her_r2_3'] },
  her_r3_3: { branch:'prestige_codex', ring:3, slot:3, name:'Mémoire Olympique',  icon:'🏆', cost:200,
    desc:'+50% Score de Renaissance + Éther gagné',
    effect:{ type:'grandMult', value:50 }, requires:['her_r2_3','her_r2_0'] },
  her_r3_4: { branch:'prestige_codex', ring:3, slot:4, name:'Éternité',           icon:'♾️', cost:300,
    desc:'Aucune réinitialisation des ressources au Prestige (conserve 25% de tout)',
    effect:{ type:'keepResourcesPct', value:25 }, requires:['her_r3_2','her_r3_3'] },

  // ════════════════════════════════════════════════════════
  //  DÉMÉTER 🌾 (Zone 1 — Production alimentaire)
  // ════════════════════════════════════════════════════════
  dem_r1_0: { branch:'demeter', ring:1, slot:0, name:'Bénédiction des Champs', icon:'🌾', cost:50,
    desc:'+30% production Fermes et Vergers',
    effect:{ type:'prodBonus', building:'farm,verger,jardins', value:30 }, requires:[] },
  dem_r1_1: { branch:'demeter', ring:1, slot:1, name:'Terre Fertile',          icon:'🌱', cost:50,
    desc:'+2 niveaux max Fermes et Vergers',
    effect:{ type:'maxLevelBonus', building:'farm,verger,jardins', value:2 }, requires:[] },
  dem_r1_2: { branch:'demeter', ring:1, slot:2, name:'Abondance',             icon:'🍇', cost:50,
    desc:'Nourr produite compte 2× pour les conditions de population',
    effect:{ type:'nourEfficiency', value:2 }, requires:[] },
  dem_r1_3: { branch:'demeter', ring:1, slot:3, name:'Moisson Perpétuelle',   icon:'🌻', cost:50,
    desc:'+20% production tout bâtiment adjacent à une Ferme',
    effect:{ type:'farmAdjacencyBonus', value:20 }, requires:[] },
  dem_r1_4: { branch:'demeter', ring:1, slot:4, name:'Gardiens des Récoltes', icon:'🧺', cost:50,
    desc:'+15% population max (Maisons et Grandes Demeures)',
    effect:{ type:'popCapPct', value:15 }, requires:[] },

  dem_r2_0: { branch:'demeter', ring:2, slot:0, name:'Grâce de Déméter',      icon:'🌸', cost:120,
    desc:'+70% production Fermes et Vergers',
    effect:{ type:'prodBonus', building:'farm,verger,jardins', value:70 }, requires:['dem_r1_0','dem_r1_1'] },
  dem_r2_1: { branch:'demeter', ring:2, slot:1, name:'Synergie Nourricière',   icon:'🌿', cost:120,
    desc:'Nourr produite augmente la production de toutes les ressources +1%/100 Nourr',
    effect:{ type:'nourProdSynergy', value:1, per:100 }, requires:['dem_r1_2'] },
  dem_r2_2: { branch:'demeter', ring:2, slot:2, name:'Champs Sacrés',         icon:'🏕️', cost:120,
    desc:'Cases adjacentes à une Ferme produisent +5 Drachmes/s',
    effect:{ type:'farmAdjDrachmes', value:5 }, requires:['dem_r1_3'] },
  dem_r2_3: { branch:'demeter', ring:2, slot:3, name:'Cité Nourricière',       icon:'🏘️', cost:120,
    desc:'+30% population max',
    effect:{ type:'popCapPct', value:30 }, requires:['dem_r1_4','dem_r1_2'] },
  dem_r2_4: { branch:'demeter', ring:2, slot:4, name:'Semences Divines',       icon:'🌰', cost:120,
    desc:'Fermes niveau max produisent +100% bonus',
    effect:{ type:'maxLevelProdBonus', building:'farm,verger', value:100 }, requires:['dem_r2_0'] },

  dem_r3_0: { branch:'demeter', ring:3, slot:0, name:'Cornucopia',            icon:'🎑', cost:250, uncapped:true,
    desc:'+1% prod Fermes/Vergers par 200 Éther (sans plafond)',
    effect:{ type:'uncappedProdBonusPer', building:'farm,verger,jardins', ethPerPoint:200, valuePerPoint:1 }, requires:['dem_r2_0','dem_r2_4'] },
  dem_r3_1: { branch:'demeter', ring:3, slot:1, name:'Déesse Mère',           icon:'👑', cost:250,
    desc:'Toute la production ×1.5 si Pop ≥ 80% de la capacité',
    effect:{ type:'highPopProdMult', threshold:80, value:1.5 }, requires:['dem_r2_3'] },
  dem_r3_2: { branch:'demeter', ring:3, slot:2, name:'Cycle Éternel',         icon:'♻️', cost:250,
    desc:'Nourr non consommée est convertie en Drachmes (10%)',
    effect:{ type:'nourToDrachmes', value:10 }, requires:['dem_r2_1','dem_r2_2'] },
  dem_r3_3: { branch:'demeter', ring:3, slot:3, name:'Bénédiction Divine',    icon:'✨', cost:250, uncapped:true,
    desc:'+0.5% toute production par 150 Éther (sans plafond)',
    effect:{ type:'uncappedProdPer', ethPerPoint:150, valuePerPoint:0.5 }, requires:['dem_r3_0','dem_r3_1'] },
  dem_r3_4: { branch:'demeter', ring:3, slot:4, name:'Âge d\'Or',             icon:'🌞', cost:350,
    desc:'Population génère +5 Éther par prestige par tranche de 50 habitants',
    effect:{ type:'popEtherBonus', value:5, per:50 }, requires:['dem_r3_1','dem_r3_2'] },

  // ════════════════════════════════════════════════════════
  //  HÉPHAÏSTOS 🔨 (Zone 2 — Forge et bâtiments)
  // ════════════════════════════════════════════════════════
  hep_r1_0: { branch:'hephaïstos', ring:1, slot:0, name:'Forgeron Apprenti',   icon:'⚒️', cost:50,
    desc:'+30% production Mines de Fer et Fonderies',
    effect:{ type:'prodBonus', building:'mine_iron,fonderie_celeste,forge_divine', value:30 }, requires:[] },
  hep_r1_1: { branch:'hephaïstos', ring:1, slot:1, name:'Outils Améliorés',   icon:'🔧', cost:50,
    desc:'-20% coût construction tous bâtiments',
    effect:{ type:'buildCostPct', value:-20 }, requires:[] },
  hep_r1_2: { branch:'hephaïstos', ring:1, slot:2, name:'Métal Précieux',      icon:'⚙️', cost:50,
    desc:'Fer produit compte 2× pour les coûts d\'amélioration',
    effect:{ type:'ferEfficiency', value:2 }, requires:[] },
  hep_r1_3: { branch:'hephaïstos', ring:1, slot:3, name:'Architecte',          icon:'📐', cost:50,
    desc:'+2 niveaux max tous bâtiments',
    effect:{ type:'maxLevelBonusAll', value:2 }, requires:[] },
  hep_r1_4: { branch:'hephaïstos', ring:1, slot:4, name:'Efficacité',          icon:'⚡', cost:50,
    desc:'+20% production Mines de Cuivre et Ateliers',
    effect:{ type:'prodBonus', building:'mine_copper,atelier_forgeron,tresor', value:20 }, requires:[] },

  hep_r2_0: { branch:'hephaïstos', ring:2, slot:0, name:'Grand Forgeron',      icon:'🔨', cost:120,
    desc:'+70% production Mines de Fer et Fonderies',
    effect:{ type:'prodBonus', building:'mine_iron,fonderie_celeste,forge_divine', value:70 }, requires:['hep_r1_0','hep_r1_2'] },
  hep_r2_1: { branch:'hephaïstos', ring:2, slot:1, name:'Bâtisseur Divin',     icon:'🏗️', cost:120,
    desc:'-35% coût construction + -20% coût amélioration',
    effect:{ type:'buildAndUpgradeCostPct', value:-35 }, requires:['hep_r1_1','hep_r1_3'] },
  hep_r2_2: { branch:'hephaïstos', ring:2, slot:2, name:'Alliage Sacré',       icon:'🌡️', cost:120,
    desc:'Les bâtiments adjacents à une Forge gagnent +15% production',
    effect:{ type:'forgeAdjacencyBonus', value:15 }, requires:['hep_r1_4','hep_r1_0'] },
  hep_r2_3: { branch:'hephaïstos', ring:2, slot:3, name:'Métal Divin',         icon:'✨', cost:120,
    desc:'+50% production Mines de Cuivre et Ateliers',
    effect:{ type:'prodBonus', building:'mine_copper,atelier_forgeron,tresor', value:50 }, requires:['hep_r1_4'] },
  hep_r2_4: { branch:'hephaïstos', ring:2, slot:4, name:'Titan de l\'Industrie', icon:'🏭', cost:120,
    desc:'Bâtiments niveau max coûtent -50% à améliorer',
    effect:{ type:'maxLevelUpgradeCost', value:-50 }, requires:['hep_r2_1'] },

  hep_r3_0: { branch:'hephaïstos', ring:3, slot:0, name:'Enclume Céleste',     icon:'⚜️', cost:250, uncapped:true,
    desc:'+1% prod Forges/Mines par 200 Éther (sans plafond)',
    effect:{ type:'uncappedProdBonusPer', building:'mine_iron,fonderie_celeste,mine_copper', ethPerPoint:200, valuePerPoint:1 }, requires:['hep_r2_0','hep_r2_2'] },
  hep_r3_1: { branch:'hephaïstos', ring:3, slot:1, name:'Monument Éternel',    icon:'🏛️', cost:250,
    desc:'Démolition d\'un bâtiment rembourse 80% des ressources',
    effect:{ type:'demolishRefund', value:80 }, requires:['hep_r2_1','hep_r2_4'] },
  hep_r3_2: { branch:'hephaïstos', ring:3, slot:2, name:'Réseau Industriel',   icon:'🕸️', cost:250,
    desc:'Chaque bâtiment connecté ajoute +0.5% à la production globale',
    effect:{ type:'connectedBuildingBonus', value:0.5 }, requires:['hep_r2_3','hep_r2_2'] },
  hep_r3_3: { branch:'hephaïstos', ring:3, slot:3, name:'Dieu de la Forge',    icon:'🔥', cost:250, uncapped:true,
    desc:'+0.5% prod toute ressource métallique par 150 Éther (sans plafond)',
    effect:{ type:'uncappedProdPer', ethPerPoint:150, valuePerPoint:0.5 }, requires:['hep_r3_0','hep_r3_2'] },
  hep_r3_4: { branch:'hephaïstos', ring:3, slot:4, name:'Volcan Sacré',        icon:'🌋', cost:350,
    desc:'Bâtiments de type Métal génèrent +10 Éther par Prestige',
    effect:{ type:'metalBuildingEther', value:10 }, requires:['hep_r3_1','hep_r3_2'] },

  // ════════════════════════════════════════════════════════
  //  APHRODITE 💫 (Zone 3 — Commerce)
  // ════════════════════════════════════════════════════════
  aph_r1_0: { branch:'aphrodite', ring:1, slot:0, name:'Charme Commercial',    icon:'💰', cost:50,
    desc:'+20% production de Drachmes',
    effect:{ type:'prodBonus', building:'drachmes', value:20 }, requires:[] },
  aph_r1_1: { branch:'aphrodite', ring:1, slot:1, name:'Sourire Divin',         icon:'😊', cost:50,
    desc:'+5% bonheur permanent',
    effect:{ type:'happinessBonus', value:5 }, requires:[] },
  aph_r1_2: { branch:'aphrodite', ring:1, slot:2, name:'Commerce Florissant',  icon:'🏪', cost:50,
    desc:'Trésor et bâtiments commerciaux +30% production',
    effect:{ type:'prodBonus', building:'tresor,marche', value:30 }, requires:[] },
  aph_r1_3: { branch:'aphrodite', ring:1, slot:3, name:'Popularité',           icon:'⭐', cost:50,
    desc:'Bonheur élevé (>80%) donne +10% toute production',
    effect:{ type:'happinessThreshProd', threshold:80, value:10 }, requires:['aph_r1_1'] },
  aph_r1_4: { branch:'aphrodite', ring:1, slot:4, name:'Diplomatie',           icon:'🤝', cost:50,
    desc:'+500 Drachmes de départ à chaque nouveau run',
    effect:{ type:'startBonusDrachmes', value:500 }, requires:[] },

  aph_r2_0: { branch:'aphrodite', ring:2, slot:0, name:'Beauté Divine',        icon:'💎', cost:120,
    desc:'+50% production de Drachmes',
    effect:{ type:'prodBonus', building:'drachmes', value:50 }, requires:['aph_r1_0','aph_r1_2'] },
  aph_r2_1: { branch:'aphrodite', ring:2, slot:1, name:'Festivité',            icon:'🎉', cost:120,
    desc:'Bonheur >60% : +20% production toutes ressources',
    effect:{ type:'happinessThreshProd', threshold:60, value:20 }, requires:['aph_r1_1','aph_r1_3'] },
  aph_r2_2: { branch:'aphrodite', ring:2, slot:2, name:'Marché des Dieux',     icon:'🏛️', cost:120,
    desc:'Drachmes en excès se convertissent en Score Renaissance (+1/1000 Dr)',
    effect:{ type:'drToScore', value:1, per:1000 }, requires:['aph_r2_0'] },
  aph_r2_3: { branch:'aphrodite', ring:2, slot:3, name:'Séduction Économique', icon:'💸', cost:120,
    desc:'+1000 Drachmes de départ + les Bases Niv.2+ donnent +20 Dr/s bonus',
    effect:{ type:'baseGoldBonus', value:20 }, requires:['aph_r1_4','aph_r1_0'] },
  aph_r2_4: { branch:'aphrodite', ring:2, slot:4, name:'Ambroisie Commerciale', icon:'🍯', cost:120,
    desc:'Ambroisie produite accélère la production de Drachmes (+10% par unité/s)',
    effect:{ type:'ambroisieToGold', value:10 }, requires:['aph_r1_2'] },

  aph_r3_0: { branch:'aphrodite', ring:3, slot:0, name:'Déesse des Richesses', icon:'👸', cost:250, uncapped:true,
    desc:'+1% Drachmes par 100 Éther investi (sans plafond)',
    effect:{ type:'uncappedDrachmesPer', ethPerPoint:100, valuePerPoint:1 }, requires:['aph_r2_0','aph_r2_2'] },
  aph_r3_1: { branch:'aphrodite', ring:3, slot:1, name:'Extase Collective',    icon:'🌈', cost:250,
    desc:'Bonheur ne peut descendre en dessous de 50%',
    effect:{ type:'happinessFloor', value:50 }, requires:['aph_r2_1'] },
  aph_r3_2: { branch:'aphrodite', ring:3, slot:2, name:'Empire Commercial',    icon:'🌐', cost:250,
    desc:'Chaque 1000 Drachmes en caisse = +1% toute production (max +50%)',
    effect:{ type:'drToGlobalProd', per:1000, value:1, cap:50 }, requires:['aph_r2_2','aph_r2_3'] },
  aph_r3_3: { branch:'aphrodite', ring:3, slot:3, name:'Charme Olympien',      icon:'💫', cost:250, uncapped:true,
    desc:'+0.5% prod globale par 200 Éther, si bonheur > 70%',
    effect:{ type:'uncappedHappyProdPer', ethPerPoint:200, valuePerPoint:0.5, minHappy:70 }, requires:['aph_r3_0','aph_r3_1'] },
  aph_r3_4: { branch:'aphrodite', ring:3, slot:4, name:'Âge de l\'Amour',      icon:'❤️', cost:350,
    desc:'Toutes les ressources +20% si bonheur ≥ 90%',
    effect:{ type:'happinessThreshProd', threshold:90, value:20 }, requires:['aph_r3_1','aph_r3_2'] },

  // ════════════════════════════════════════════════════════
  //  HADÈS 💀 (Zone 4 — Prestige et Éther)
  // ════════════════════════════════════════════════════════
  had_r1_0: { branch:'hades', ring:1, slot:0, name:'Ombre du Shéol',          icon:'🌑', cost:50,
    desc:'+20% Éther gagné au Prestige',
    effect:{ type:'etherGainPct', value:20 }, requires:[] },
  had_r1_1: { branch:'hades', ring:1, slot:1, name:'Âme Persistante',          icon:'👻', cost:50,
    desc:'Les Spectres d\'Héritage ont +5% de production bonus',
    effect:{ type:'heritageSpectreProd', value:5 }, requires:[] },
  had_r1_2: { branch:'hades', ring:1, slot:2, name:'Pacte de l\'Ombre',        icon:'🤝', cost:50,
    desc:'+20 Pages Codex au Prestige',
    effect:{ type:'bonusPages', value:20 }, requires:[] },
  had_r1_3: { branch:'hades', ring:1, slot:3, name:'Boucle Infernale',         icon:'🔄', cost:50,
    desc:'Chaque Prestige effectué augmente le multiplicateur Codex de +2%',
    effect:{ type:'prestigeCodexMult', value:2 }, requires:[] },
  had_r1_4: { branch:'hades', ring:1, slot:4, name:'Rivière du Styx',          icon:'🌊', cost:50,
    desc:'-30% temps de réinitialisation entre prestiges (si applicables timers futurs)',
    effect:{ type:'resetTimerPct', value:-30 }, requires:[] },

  had_r2_0: { branch:'hades', ring:2, slot:0, name:'Maître des Âmes',          icon:'💀', cost:120,
    desc:'+50% Éther gagné au Prestige',
    effect:{ type:'etherGainPct', value:50 }, requires:['had_r1_0','had_r1_1'] },
  had_r2_1: { branch:'hades', ring:2, slot:1, name:'Royaume des Morts',        icon:'🏰', cost:120,
    desc:'Les Spectres d\'Héritage produisent comme des bâtiments normaux (×0.5)',
    effect:{ type:'heritageSpectreHalfProd', value:0.5 }, requires:['had_r1_1','had_r1_2'] },
  had_r2_2: { branch:'hades', ring:2, slot:2, name:'Pacte Éternel',            icon:'📜', cost:120,
    desc:'Pages Codex ×2 au Prestige si Score > 5000',
    effect:{ type:'codexPagesMult2Threshold', value:2, threshold:5000 }, requires:['had_r1_2','had_r1_3'] },
  had_r2_3: { branch:'hades', ring:2, slot:3, name:'Obole de Charon',          icon:'🪙', cost:120,
    desc:'Éther en caisse génère +0.1% production (max +20%)',
    effect:{ type:'etherToProd', value:0.1, cap:20 }, requires:['had_r2_0'] },
  had_r2_4: { branch:'hades', ring:2, slot:4, name:'Jugement des Âmes',        icon:'⚖️', cost:120,
    desc:'Score Renaissance ×1.3 si Ère 3 atteinte',
    effect:{ type:'era3ScoreMult', value:1.3 }, requires:['had_r1_3','had_r1_4'] },

  had_r3_0: { branch:'hades', ring:3, slot:0, name:'Dieu de la Mort',          icon:'🌘', cost:250, uncapped:true,
    desc:'+1% Éther gagné par 100 Éther investi (sans plafond)',
    effect:{ type:'uncappedEtherGainPer', ethPerPoint:100, valuePerPoint:1 }, requires:['had_r2_0','had_r2_3'] },
  had_r3_1: { branch:'hades', ring:3, slot:1, name:'Armée des Ombres',         icon:'⚔️', cost:250,
    desc:'Jusqu\'à 6 Spectres d\'Héritage conservés (au lieu de 3)',
    effect:{ type:'heritageSpecterSlots', value:6 }, requires:['had_r2_1'] },
  had_r3_2: { branch:'hades', ring:3, slot:2, name:'Nécropole',                icon:'🏚️', cost:250,
    desc:'Les Bases Niv.5 survivent à 2 Prestiges consécutifs',
    effect:{ type:'base5Persistence', value:2 }, requires:['had_r2_2','had_r2_4'] },
  had_r3_3: { branch:'hades', ring:3, slot:3, name:'Boucle Perpétuelle',       icon:'♾️', cost:250, uncapped:true,
    desc:'+0.5% Éther et Pages Codex par 150 Éther (sans plafond)',
    effect:{ type:'uncappedEtherAndPagesPer', ethPerPoint:150, valuePerPoint:0.5 }, requires:['had_r3_0','had_r2_3'] },
  had_r3_4: { branch:'hades', ring:3, slot:4, name:'Maître de l\'Éternité',    icon:'👁️', cost:350,
    desc:'L\'Éther n\'est jamais perdu entre les prestiges, il s\'accumule',
    effect:{ type:'etherAccumulate', value:true }, requires:['had_r3_1','had_r3_2'] },

  // ════════════════════════════════════════════════════════
  //  ARTÉMIS 🌙 (Zone 5 — Exploration)
  // ════════════════════════════════════════════════════════
  art_r1_0: { branch:'artemis', ring:1, slot:0, name:'Chasseresse',            icon:'🏹', cost:50,
    desc:'Scouts 30% plus rapides',
    effect:{ type:'scoutSpeedPct', value:30 }, requires:[] },
  art_r1_1: { branch:'artemis', ring:1, slot:1, name:'Forêt Primordiale',      icon:'🌲', cost:50,
    desc:'+30% production Bûcherons et Halles Forestières',
    effect:{ type:'prodBonus', building:'lumber,halle,bosquet', value:30 }, requires:[] },
  art_r1_2: { branch:'artemis', ring:1, slot:2, name:'Nuit de Lune',           icon:'🌕', cost:50,
    desc:'Fouille coûte -15% (réduit coût en Drachmes)',
    effect:{ type:'digCostPct', value:-15 }, requires:[] },
  art_r1_3: { branch:'artemis', ring:1, slot:3, name:'Piste Forestière',       icon:'🍃', cost:50,
    desc:'Routes construites en forêt coûtent -50%',
    effect:{ type:'forestRoadCostPct', value:-50 }, requires:[] },
  art_r1_4: { branch:'artemis', ring:1, slot:4, name:'Sens Animal',            icon:'🦅', cost:50,
    desc:'Cases Marécage et Ruines révèlent leurs voisins directs',
    effect:{ type:'specialRevealNeighbors', value:true }, requires:[] },

  art_r2_0: { branch:'artemis', ring:2, slot:0, name:'Meute de Loups',         icon:'🐺', cost:120,
    desc:'Scouts 60% plus rapides + révèlent +1 case voisine',
    effect:{ type:'scoutSpeedAndReveal', speed:60, reveal:1 }, requires:['art_r1_0','art_r1_2'] },
  art_r2_1: { branch:'artemis', ring:2, slot:1, name:'Sylvestre Sacrée',       icon:'🌳', cost:120,
    desc:'+70% production Bûcherons, Halles et Bosquets',
    effect:{ type:'prodBonus', building:'lumber,halle,bosquet', value:70 }, requires:['art_r1_1','art_r1_3'] },
  art_r2_2: { branch:'artemis', ring:2, slot:2, name:'Guet-Apens',             icon:'🎯', cost:120,
    desc:'Chaque case révélée donne +2 Drachmes/s permanent (max +40)',
    effect:{ type:'revealDrachmePerm', value:2, cap:40 }, requires:['art_r1_4','art_r1_2'] },
  art_r2_3: { branch:'artemis', ring:2, slot:3, name:'Refuge Naturel',         icon:'🏔️', cost:120,
    desc:'Bâtiments construits sur Terrain naturel (Forêt, Montagne) +20% prod',
    effect:{ type:'naturalTerrainBonus', value:20 }, requires:['art_r1_1'] },
  art_r2_4: { branch:'artemis', ring:2, slot:4, name:'Traque Divine',          icon:'🌀', cost:120,
    desc:'La fouille ne coûte aucune Drachme si la case est adjacente à un Scout',
    effect:{ type:'freeDigNearScout', value:true }, requires:['art_r2_0'] },

  art_r3_0: { branch:'artemis', ring:3, slot:0, name:'Déesse de la Chasse',    icon:'🌙', cost:250, uncapped:true,
    desc:'+1% prod Forêt/Exploration par 150 Éther (sans plafond)',
    effect:{ type:'uncappedProdBonusPer', building:'lumber,halle,bosquet', ethPerPoint:150, valuePerPoint:1 }, requires:['art_r2_1','art_r2_3'] },
  art_r3_1: { branch:'artemis', ring:3, slot:1, name:'Armée de la Nuit',       icon:'🌑', cost:250,
    desc:'Jusqu\'à 3 Scouts simultanés',
    effect:{ type:'scoutSlots', value:3 }, requires:['art_r2_0','art_r2_4'] },
  art_r3_2: { branch:'artemis', ring:3, slot:2, name:'Forêt Enchantée',        icon:'🧝', cost:250,
    desc:'Bûcherons/Bosquets produisent aussi +10 Éther par prestige chacun',
    effect:{ type:'lumberEtherBonus', value:10 }, requires:['art_r2_1','art_r2_2'] },
  art_r3_3: { branch:'artemis', ring:3, slot:3, name:'Maîtresse de l\'Aube',   icon:'🌅', cost:250, uncapped:true,
    desc:'+0.5% prod globale par 200 Éther si ≥ 60 cases révélées',
    effect:{ type:'uncappedRevealProdPer', ethPerPoint:200, valuePerPoint:0.5, minReveal:60 }, requires:['art_r3_0','art_r2_2'] },
  art_r3_4: { branch:'artemis', ring:3, slot:4, name:'Traque Éternelle',        icon:'🏹', cost:350,
    desc:'Chaque run commence avec 3 Scouts actifs et 10 cases pré-révélées',
    effect:{ type:'startWithScoutsAndReveal', scouts:3, reveal:10 }, requires:['art_r3_1','art_r3_2'] },

  // ════════════════════════════════════════════════════════
  //  ZEUS ⚡ (Zone 6 — Fin de jeu)
  // ════════════════════════════════════════════════════════
  zeus_r1_0: { branch:'zeus', ring:1, slot:0, name:'Tonnerre',                 icon:'⚡', cost:100,
    desc:'+15% toute production globale',
    effect:{ type:'prodBonusAll', value:15 }, requires:[] },
  zeus_r1_1: { branch:'zeus', ring:1, slot:1, name:'Foudre Dorée',             icon:'💛', cost:100,
    desc:'+30% Éther gagné au Prestige',
    effect:{ type:'etherGainPct', value:30 }, requires:[] },
  zeus_r1_2: { branch:'zeus', ring:1, slot:2, name:'Olympe Naissant',          icon:'🏔️', cost:100,
    desc:'+30 Pages Codex au Prestige',
    effect:{ type:'bonusPages', value:30 }, requires:[] },
  zeus_r1_3: { branch:'zeus', ring:1, slot:3, name:'Égide',                    icon:'🛡️', cost:100,
    desc:'-20% coût tous talents Drachmes',
    effect:{ type:'drachmeTalentCostPct', value:-20 }, requires:[] },
  zeus_r1_4: { branch:'zeus', ring:1, slot:4, name:'Maître de l\'Olympe',      icon:'👑', cost:100,
    desc:'Score Renaissance ×1.5',
    effect:{ type:'scoreMultPct', value:50 }, requires:[] },

  zeus_r2_0: { branch:'zeus', ring:2, slot:0, name:'Tempête Divine',           icon:'🌩️', cost:250,
    desc:'+35% toute production globale',
    effect:{ type:'prodBonusAll', value:35 }, requires:['zeus_r1_0','zeus_r1_1'] },
  zeus_r2_1: { branch:'zeus', ring:2, slot:1, name:'Décret Olympien',          icon:'📜', cost:250,
    desc:'Débloque la 3ème Ère sans condition (automatiquement)',
    effect:{ type:'autoUnlockEra3', value:true }, requires:['zeus_r1_1','zeus_r1_2'] },
  zeus_r2_2: { branch:'zeus', ring:2, slot:2, name:'Jugement de Zeus',         icon:'⚖️', cost:250,
    desc:'Score Renaissance ×2.0',
    effect:{ type:'scoreMultPct', value:100 }, requires:['zeus_r1_3','zeus_r1_4'] },
  zeus_r2_3: { branch:'zeus', ring:2, slot:3, name:'Éclat Céleste',            icon:'🌟', cost:250,
    desc:'Toutes les branches du Panthéon débloquées ont +20% d\'efficacité',
    effect:{ type:'pantheonBranchBonus', value:20 }, requires:['zeus_r2_0'] },
  zeus_r2_4: { branch:'zeus', ring:2, slot:4, name:'Pouvoir Absolu',           icon:'🌌', cost:250,
    desc:'Multiplicateur Codex ×2',
    effect:{ type:'codexMultBonus', value:2 }, requires:['zeus_r1_2','zeus_r1_4'] },

  zeus_r3_0: { branch:'zeus', ring:3, slot:0, name:'Dieu des Dieux',           icon:'⚡', cost:500, uncapped:true,
    desc:'+1% toute production par 100 Éther investi (sans plafond)',
    effect:{ type:'uncappedProdPer', ethPerPoint:100, valuePerPoint:1 }, requires:['zeus_r2_0','zeus_r2_3'] },
  zeus_r3_1: { branch:'zeus', ring:3, slot:1, name:'Âge de l\'Olympe',         icon:'🌅', cost:500,
    desc:'Toute production ×3 (une seule fois, condition fin de jeu)',
    effect:{ type:'finalMult', value:3 }, requires:['zeus_r2_1','zeus_r2_2'] },
  zeus_r3_2: { branch:'zeus', ring:3, slot:2, name:'Maître du Destin',         icon:'🔮', cost:500,
    desc:'Conditions de Prestige réduites à 40 cases et 2 Bases Niv.5',
    effect:{ type:'prestigeCondReduce', revealed:40, bases:2 }, requires:['zeus_r2_2','zeus_r2_4'] },
  zeus_r3_3: { branch:'zeus', ring:3, slot:3, name:'Volonté Olympienne',       icon:'💎', cost:500, uncapped:true,
    desc:'+2% tout multiplicateur par 200 Éther investi (sans plafond)',
    effect:{ type:'uncappedAllMultPer', ethPerPoint:200, valuePerPoint:2 }, requires:['zeus_r3_0','zeus_r3_1'] },
  zeus_r3_4: { branch:'zeus', ring:3, slot:4, name:'Éternité Olympique',       icon:'♾️', cost:1000,
    desc:'FIN DE JEU : Tous les multiplicateurs ×2 permanent. Déblocage Leaderboard.',
    effect:{ type:'gameEnd', value:2 }, requires:['zeus_r3_1','zeus_r3_2','zeus_r3_3'] },
};

// ── Expose globals for cross-script access ──────────────
if (typeof window !== 'undefined') {
  window.PANTHEON_NODES    = PANTHEON_NODES;
  window.PANTHEON_BRANCHES = PANTHEON_BRANCHES;
}

// ── PantheonManager ─────────────────────────────────────────
class PantheonManager {
  constructor(resources, codexManager) {
    this.rm    = resources;
    this.cm    = codexManager;

    // Points de talent investis par nœud (0 = non appris, N = points investis)
    // Les nœuds sans plafond (uncapped) acceptent N > 1
    this.invested  = {};   // { nodeId: points }

    // Branches déverrouillées (hors transversales toujours dispo)
    this.unlockedBranches = new Set(['cartographie', 'prestige_codex']);

    // Éther cumulé investi dans les nœuds sans plafond (pour calcul bonus)
    this._etherInUncapped = {}; // { nodeId: etherSpent }

    this._bindEvents();
  }

  // ── Débloquer une branche divine (Phase 8) ──────────────
  unlockBranch(branchId) {
    this.unlockedBranches.add(branchId);
    EventBus.emit('pantheon:branch_unlocked', { branchId });
  }

  isBranchUnlocked(branchId) {
    return this.unlockedBranches.has(branchId);
  }

  // ── Vérifier si un nœud peut être appris ────────────────
  canLearn(nodeId) {
    const def = PANTHEON_NODES[nodeId];
    if (!def) return { ok: false, reason: 'Nœud inconnu.' };

    // Branche déverrouillée ?
    if (!this.isBranchUnlocked(def.branch)) {
      const branch = PANTHEON_BRANCHES.find(b => b.id === def.branch);
      return { ok: false, reason: (branch ? branch.label : def.branch) + ' non débloquée (Phase 8).' };
    }

    // Déjà maxé (non-uncapped) ?
    const current = this.invested[nodeId] || 0;
    if (!def.uncapped && current >= 1) return { ok: false, reason: 'Déjà acquis.' };

    // Prérequis
    for (const req of (def.requires || [])) {
      if (!this.invested[req] || this.invested[req] < 1) {
        const r = PANTHEON_NODES[req];
        return { ok: false, reason: 'Prérequis : ' + (r ? r.name : req) };
      }
    }

    // Éther suffisant ?
    if (this.rm.get('ether') < def.cost) {
      return { ok: false, reason: 'Éther insuffisant (' + def.cost + ' requis).' };
    }

    return { ok: true };
  }

  // ── Apprendre / investir dans un nœud ──────────────────
  learn(nodeId, sx, sy) {
    const check = this.canLearn(nodeId);
    if (!check.ok) {
      EventBus.emit('ui:feedback', { text: check.reason, x: sx||0, y: sy||0, color: '#e05050' });
      return false;
    }
    const def = PANTHEON_NODES[nodeId];
    this.rm.spend({ ether: def.cost });
    this.invested[nodeId] = (this.invested[nodeId] || 0) + 1;
    if (def.uncapped) {
      this._etherInUncapped[nodeId] = (this._etherInUncapped[nodeId] || 0) + def.cost;
    }
    EventBus.emit('pantheon:node_learned', { nodeId, def });
    EventBus.emit('talent:applied', { id: nodeId }); // recalcule production
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    EventBus.emit('ui:feedback', {
      text: def.icon + ' ' + def.name + ' !', x: sx||0, y: sy||0, color: '#ffd54f'
    });
    return true;
  }

  // ── Récupérer les bonus calculés ────────────────────────
  // Production globale (%)
  getGlobalProdBonus() {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'prodBonusAll') total += eff.value * pts;
      if (eff.type === 'uncappedProdPer') {
        const eth = this._etherInUncapped[id] || 0;
        total += Math.floor(eth / eff.ethPerPoint) * eff.valuePerPoint;
      }
    });
    return total;
  }

  // Bonus prod par bâtiment (%)
  getBuildingProdBonus(buildingId) {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'prodBonus' && eff.building) {
        if (eff.building.split(',').includes(buildingId)) total += eff.value * pts;
      }
      if (eff.type === 'uncappedProdBonusPer' && eff.building) {
        if (eff.building.split(',').includes(buildingId)) {
          const eth = this._etherInUncapped[id] || 0;
          total += Math.floor(eth / eff.ethPerPoint) * eff.valuePerPoint;
        }
      }
    });
    return total;
  }

  // Bonus max level bâtiment
  getMaxLevelBonus(buildingId) {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'maxLevelBonus' && eff.building) {
        if (eff.building.split(',').includes(buildingId)) total += eff.value * pts;
      }
      if (eff.type === 'maxLevelBonusAll') total += eff.value * pts;
    });
    return total;
  }

  // Bonus Éther gagné (%)
  getEtherGainBonus() {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'etherGainPct') total += eff.value * pts;
      if (eff.type === 'uncappedEtherGainPer') {
        const eth = this._etherInUncapped[id] || 0;
        total += Math.floor(eth / eff.ethPerPoint) * eff.valuePerPoint;
      }
      if (eff.type === 'grandMult') total += eff.value * pts;
    });
    return total;
  }

  // Bonus Pages Codex (+flat)
  getCodexPagesBonus() {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'bonusPages') total += eff.value * pts;
    });
    return total;
  }

  // Bonus pages Codex (%)
  getCodexPagesPctBonus() {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'codexPagesMult') total += eff.value * pts;
      if (eff.type === 'uncappedPagesMult') {
        const eth = this._etherInUncapped[id] || 0;
        total += Math.floor(eth / eff.ethPerPoint) * eff.valuePerPoint;
      }
    });
    return total;
  }

  // Coût fouille bonus (%)
  getDigCostBonus() {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'digCostPct') total += eff.value * pts;
      if (eff.type === 'uncappedDigCostPer') {
        const eth = this._etherInUncapped[id] || 0;
        total += Math.floor(eth / eff.ethPerPoint) * (-eff.valuePerPoint);
      }
    });
    return total; // négatif = réduction
  }

  // Score de Renaissance bonus (%)
  getScoreBonus() {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'scoreMultPct') total += eff.value * pts;
      if (eff.type === 'grandMult') total += eff.value * pts;
    });
    return total;
  }

  // Scout slots bonus
  getScoutSlotsBonus() {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'scoutSlots') total += eff.value * pts;
    });
    return total;
  }

  // Scout speed bonus (%)
  getScoutSpeedBonus() {
    let total = 0;
    Object.entries(this.invested).forEach(([id, pts]) => {
      if (!pts) return;
      const eff = PANTHEON_NODES[id] && PANTHEON_NODES[id].effect;
      if (!eff) return;
      if (eff.type === 'scoutSpeedPct') total += eff.value * pts;
    });
    return total;
  }

  // ── Helpers ─────────────────────────────────────────────
  getAllNodes() { return PANTHEON_NODES; }
  getAllBranches() { return PANTHEON_BRANCHES; }
  getNodeState(nodeId) {
    const pts = this.invested[nodeId] || 0;
    if (pts === 0) {
      const check = this.canLearn(nodeId);
      return check.ok ? 'available' : 'locked';
    }
    const def = PANTHEON_NODES[nodeId];
    if (def && def.uncapped) return 'learned'; // uncapped toujours "learned" + re-achetable
    return 'learned';
  }

  _bindEvents() {
    // En Phase 8, les zones débloquent les branches
    EventBus.on('zone:unlocked', (d) => {
      const branch = PANTHEON_BRANCHES.find(b => b.zoneId === d.zoneId);
      if (branch) this.unlockBranch(branch.id);
    });
  }

  // ── Sauvegarde ──────────────────────────────────────────
  serialize() {
    return {
      invested:         this.invested,
      etherInUncapped:  this._etherInUncapped,
      unlockedBranches: Array.from(this.unlockedBranches),
    };
  }

  deserialize(data) {
    if (!data) return;
    this.invested         = data.invested         || {};
    this._etherInUncapped = data.etherInUncapped  || {};
    if (data.unlockedBranches) {
      this.unlockedBranches = new Set(data.unlockedBranches);
    }
  }
}
