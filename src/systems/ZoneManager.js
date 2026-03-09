/* ═══════════════════════════════════════════════════════════
   ZoneManager.js — v1.1.0 — Phase 8 : Zones Divines
   6 zones : Zeus, Poséidon, Hadès, Athéna, Apollon, Arès.
   Chaque zone a : conditions de déverrouillage, malédictions
   progressives, ressources exclusives, et lien Panthéon.
   ═══════════════════════════════════════════════════════════ */

const ZONE_DEFS = [

  // ══════════════════════════════════════════════════════════════
  // Zone 1 — POSÉIDON 🌊 (5 conditions)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'poseidon', zoneId: 1,
    god: 'Poséidon', icon: '🌊', color: '#29b6f6',
    biome: 'Abysses Océaniques',
    desc: 'Les profondeurs de l\'océan recèlent des trésors et des mystères engloutis.',
    resource: 'nectar', resourceLabel: 'Nectar des Mers',

    // ── Condition 1 : Score ───────────────────────────────────
    scoreThreshold: 2000,

    // ── Condition 2 : Frontière ───────────────────────────────
    borderType: 'riviere',
    borderDesc: 'Rivière Divine — poser 2 Routes sur des cases Rivière',
    borderCondition: { terrain: 'river', roads: 2 },

    // ── Condition 3 : Clé Divine ──────────────────────────────
    keyIngredients: { nourr: 1200, bois: 400, drachmes: 3000 },
    keyCraftTime: 90,

    // ── Condition 4 : Rituel ──────────────────────────────────
    ritual: 'Révéler 40 cases de la carte',
    ritualType: 'revealedCount',
    ritualAmount: 40,

    // ── Condition 5 : Prestiges ───────────────────────────────
    prestigeRequired: 1,

    // Pas de dieu précédent requis (Zone 1)
    requiredZone: null,

    // Production & récompenses
    zoneProduction: { nectar: 4, nourr: 10 },
    codexPages: 10,
    curseLabel: 'Fureur de Poséidon',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Vagues agitées -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Tempête marine -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Tsunami divin -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Déluge de l\'Olympe', demolishEvery: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // Zone 2 — APOLLON ☀️ (6 conditions)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'apollon', zoneId: 2,
    god: 'Apollon', icon: '☀️', color: '#ffb300',
    biome: 'Plaines Ensoleillées de Delphes',
    desc: 'Les terres baignées de lumière où les récoltes sont divines et les arts florissants.',
    resource: 'ambroisie', resourceLabel: 'Ambroisie',

    // ── Condition 1 : Score ───────────────────────────────────
    scoreThreshold: 8000,

    // ── Condition 2 : Frontière ───────────────────────────────
    borderType: 'foret',
    borderDesc: 'Forêt Sacrée — 8 bâtiments de Nature connectés (Ferme, Verger, Jardins, Bosquet)',
    borderCondition: { building: 'farm,verger,jardins,bosquet', count: 8, connected: true },

    // ── Condition 3 : Clé Divine ──────────────────────────────
    keyIngredients: { bois: 3000, ambroisie: 500, drachmes: 10000 },
    keyCraftTime: 180,

    // ── Condition 4 : Rituel ──────────────────────────────────
    ritual: 'Atteindre 500 Nourriture/s',
    ritualType: 'resourceRate',
    ritualResource: 'nourr',
    ritualAmount: 500,

    // ── Condition 5 : Prestiges ───────────────────────────────
    prestigeRequired: 2,

    // ── Condition 6 : Dieu précédent ──────────────────────────
    requiredZone: 'poseidon',
    requiredZoneLabel: 'Poséidon conquis',

    zoneProduction: { ambroisie: 3, nourr: 20 },
    codexPages: 10,
    curseLabel: 'Éclipse d\'Apollon',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Nuages sombres -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Pluie acide -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Nuit Perpétuelle -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Famine Solaire', demolishEvery: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // Zone 3 — ATHÉNA 🦉 (7 conditions)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'athena', zoneId: 3,
    god: 'Athéna', icon: '🦉', color: '#80cbc4',
    biome: 'Bibliothèque Céleste d\'Athènes',
    desc: 'La cité sacrée où la sagesse et la stratégie règnent en maîtres absolus.',
    resource: 'metal_divin', resourceLabel: 'Métal Divin',

    // ── Condition 1 : Score ───────────────────────────────────
    scoreThreshold: 25000,

    // ── Condition 2 : Frontière ───────────────────────────────
    borderType: 'montagne',
    borderDesc: 'Cité fortifiée — Bibliothèque ET Agora, toutes deux connectées',
    borderCondition: { building: 'bibliotheque,agora', count: 2, allTypes: true, connected: true },

    // ── Condition 3 : Clé Divine ──────────────────────────────
    keyIngredients: { drachmes: 15000, ambroisie: 200, fer: 500 },
    keyCraftTime: 240,

    // ── Condition 4 : Rituel ──────────────────────────────────
    ritual: 'Atteindre 3 000 Drachmes/s',
    ritualType: 'resourceRate',
    ritualResource: 'drachmes',
    ritualAmount: 3000,

    // ── Condition 5 : Prestiges ───────────────────────────────
    prestigeRequired: 4,

    // ── Condition 6 : Dieu précédent ──────────────────────────
    requiredZone: 'apollon',
    requiredZoneLabel: 'Apollon conquis',

    // ── Condition 7 : Extra ───────────────────────────────────
    extraConditions: [
      { type: 'revealedCount', amount: 80, label: 'Révéler 80 cases' },
    ],

    zoneProduction: { metal_divin: 2, ether: 1 },
    codexPages: 15,
    curseLabel: 'Jugement d\'Athéna',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Décret sévère -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Sanction divine -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Malédiction de la Chouette -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Égide Destructrice', demolishEvery: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // Zone 4 — ZEUS ⚡ (8 conditions)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'zeus', zoneId: 4,
    god: 'Zeus', icon: '⚡', color: '#ffd54f',
    biome: 'Cimes de l\'Olympe',
    desc: 'Le sommet de l\'Olympe. Zeus règne sur tous les dieux depuis ces hauteurs électrisées.',
    resource: 'foudre', resourceLabel: 'Foudre Olympienne',

    // ── Condition 1 : Score ───────────────────────────────────
    scoreThreshold: 75000,

    // ── Condition 2 : Frontière ───────────────────────────────
    borderType: 'libre',
    borderDesc: 'Frontière ouverte — Zeus accepte les héros qui ont prouvé leur valeur',

    // ── Condition 3 : Clé Divine ──────────────────────────────
    keyIngredients: { nourr: 1500, drachmes: 8000, ether: 100 },
    keyCraftTime: 120,

    // ── Condition 4 : Rituel ──────────────────────────────────
    ritual: '3 Pylônes connectés et actifs',
    ritualType: 'buildingCount',
    ritualBuilding: 'pylone',
    ritualAmount: 3,
    ritualConnected: true,

    // ── Condition 5 : Prestiges ───────────────────────────────
    prestigeRequired: 6,

    // ── Condition 6 : Dieu précédent ──────────────────────────
    requiredZone: 'athena',
    requiredZoneLabel: 'Athéna conquise',

    // ── Conditions 7-8 : Extra ────────────────────────────────
    extraConditions: [
      { type: 'codexLevel',    amount: 3,    label: 'Codex niveau 3 atteint' },
      { type: 'resourceStock', resource: 'foudre', amount: 200, label: 'Stocker 200 Foudre' },
    ],

    zoneProduction: { foudre: 8, ether: 3 },
    codexPages: 20,
    curseLabel: 'Colère de Zeus',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Éclairs lointains -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Tempête divine -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Foudre de l\'Olympe -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Apocalypse Céleste', demolishEvery: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // Zone 5 — HADÈS 💀 (9 conditions)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'hades', zoneId: 5,
    god: 'Hadès', icon: '💀', color: '#7e57c2',
    biome: 'Souterrains du Tartare',
    desc: 'Les profondeurs obscures recèlent l\'Orichalque, métal des âmes perdues.',
    resource: 'orichalque', resourceLabel: 'Orichalque',

    // ── Condition 1 : Score ───────────────────────────────────
    scoreThreshold: 200000,

    // ── Condition 2 : Frontière ───────────────────────────────
    borderType: 'gouffre',
    borderDesc: 'Gouffre abyssal — construire 5 Mines de Fer connectées',
    borderCondition: { building: 'mine_iron', count: 5, connected: true },

    // ── Condition 3 : Clé Divine ──────────────────────────────
    keyIngredients: { fer: 1000, acier: 300, ether: 500 },
    keyCraftTime: 300,

    // ── Condition 4 : Rituel ──────────────────────────────────
    ritual: 'Effectuer 8 Prestiges',
    ritualType: 'prestigeCount',
    ritualAmount: 8,

    // ── Condition 5 : Prestiges ───────────────────────────────
    prestigeRequired: 8,

    // ── Condition 6 : Dieu précédent ──────────────────────────
    requiredZone: 'zeus',
    requiredZoneLabel: 'Zeus conquis',

    // ── Conditions 7-9 : Extra ────────────────────────────────
    extraConditions: [
      { type: 'codexLevel',    amount: 5,    label: 'Codex niveau 5 atteint' },
      { type: 'revealedCount', amount: 120,  label: 'Révéler 120 cases' },
      { type: 'resourceStock', resource: 'foudre', amount: 500, label: 'Stocker 500 Foudre' },
    ],

    zoneProduction: { orichalque: 1, ether: 2 },
    codexPages: 20,
    curseLabel: 'Malédiction d\'Hadès',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Ombre du Tartare -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Malédiction des Âmes -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Jugement de Shéol -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Mort Progressive', demolishEvery: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // Zone 6 — ARÈS ⚔️ (10 conditions — endgame absolu)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'ares', zoneId: 6,
    god: 'Arès', icon: '⚔️', color: '#ef5350',
    biome: 'Champs de Bataille Éternels',
    desc: 'Les champs de guerre où la violence est perpétuelle et la victoire absolue.',
    resource: 'amrita', resourceLabel: 'Amrita de Guerre',

    // ── Condition 1 : Score ───────────────────────────────────
    scoreThreshold: 750000,

    // ── Condition 2 : Frontière ───────────────────────────────
    borderType: 'tempete',
    borderDesc: 'Forteresse assiégée — Forteresse ET Sénat connectés',
    borderCondition: { building: 'forteresse,senat', count: 2, allTypes: true, connected: true },

    // ── Condition 3 : Clé Divine ──────────────────────────────
    keyIngredients: { ether: 2000, orichalque: 400, metal_divin: 200 },
    keyCraftTime: 600,

    // ── Condition 4 : Rituel ──────────────────────────────────
    ritual: 'Atteindre 3 000 Drachmes/s ET posséder 1 000 Éther',
    ritualType: 'resourceRateAndStock',
    ritualResource: 'drachmes',
    ritualAmount: 3000,
    ritualStockResource: 'ether',
    ritualStockAmount: 1000,

    // ── Condition 5 : Prestiges ───────────────────────────────
    prestigeRequired: 12,

    // ── Condition 6 : Dieu précédent ──────────────────────────
    requiredZone: 'hades',
    requiredZoneLabel: 'Hadès conquis',

    // ── Conditions 7-10 : Extra ───────────────────────────────
    extraConditions: [
      { type: 'codexLevel',      amount: 7,   label: 'Codex niveau 7 atteint' },
      { type: 'resourceStock',   resource: 'ether', amount: 1000, label: 'Posséder 1 000 Éther' },
      { type: 'buildingCountEra3', amount: 10, label: '10 bâtiments Ère 3 construits et connectés' },
      { type: 'maxLevelBuildings', building: 'forteresse,senat,palais', amount: 3, label: '3 bâtiments militaires au niveau max' },
    ],

    zoneProduction: { amrita: 2, foudre: 3 },
    codexPages: 30,
    curseLabel: 'Rage d\'Arès',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Escarmouches -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Bataille rangée -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Guerre Totale -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Apocalypse Martiale', demolishEvery: 5 },
    ],
  },
];

// ── ZoneManager ─────────────────────────────────────────────
class ZoneManager {
  constructor(grid, resources, buildingManager, prestigeManager, codexManager) {
    this.grid    = grid;
    this.rm      = resources;
    this.bm      = buildingManager;
    this.pm      = prestigeManager;
    this.cm      = codexManager;

    this.pantheonManager = null; // injecté par GameLoop

    // État par zone
    // zoneState[id] = { unlocked, craftStarted, craftProgress, craftDone,
    //                   ritualDone, borderCleared, curseStart, curseMinutes,
    //                   residualCurse, templeBuilt }
    this.zoneState = {};
    ZONE_DEFS.forEach(z => {
      this.zoneState[z.id] = {
        unlocked:      false,
        craftStarted:  false,
        craftProgress: 0,    // secondes écoulées
        craftDone:     false,
        ritualDone:    false,
        borderCleared: (z.borderType === 'libre'), // Zeus est libre — pas de frontière physique
        curseStart:    null, // timestamp ms quand la zone a été révélée (non conquise)
        curseMinutes:  0,    // minutes depuis que la zone est active
        residualCurse: false,
        templeBuilt:   false,
        lastDemolish:  0,    // timestamp dernière démolition par malédiction
      };
    });

    // Slots de craft actifs (max 2, +1 avec talent)
    this.craftSlots    = 2;
    this.activeSlots   = [null, null]; // [zoneId | null, ...]

    // Zones révélées (malédictions commencent)
    this._cursedSince  = {}; // zoneId → Date.now() au début

    // Timer de démolition (stade 4)
    this._lastDemolish = {};

    this._bindEvents();
  }

  // ── Accesseurs ──────────────────────────────────────────
  getDef(zoneId)   { return ZONE_DEFS.find(z => z.id === zoneId); }
  getState(zoneId) { return this.zoneState[zoneId]; }
  isUnlocked(zoneId) { return this.zoneState[zoneId] && this.zoneState[zoneId].unlocked; }

  getAllZones() { return ZONE_DEFS; }

  // ── Vérifier si toutes les conditions sont remplies ─────
  checkConditions(zoneId) {
    const def   = this.getDef(zoneId);
    const state = this.getState(zoneId);
    if (!def || !state) return { canUnlock: false, conditions: [] };

    const pm = this.pm, cm = this.cm, rm = this.rm;
    const conds = [];

    // ── C1 : Score Renaissance ──
    const score   = pm ? pm.getLiveScore() : 0;
    const scoreOk = score >= def.scoreThreshold;
    conds.push({ label: 'Score ≥ ' + def.scoreThreshold.toLocaleString(), ok: scoreOk, value: score.toLocaleString() });

    // ── C2 : Frontière ──
    const borderOk = state.borderCleared;
    conds.push({ label: 'Frontière : ' + def.borderDesc.split('—')[0].trim(), ok: borderOk });

    // ── C3 : Clé Divine ──
    const keyOk = state.craftDone;
    conds.push({ label: 'Clé Divine craftée', ok: keyOk, crafting: state.craftStarted && !state.craftDone, progress: state.craftProgress, total: def.keyCraftTime });

    // ── C4 : Rituel ──
    const ritualOk = this._checkRitual(def, state);
    conds.push({ label: 'Rituel : ' + def.ritual, ok: ritualOk });

    // ── C5 : Prestiges requis ──
    const prestigeCount = pm ? (pm.prestigeCount || 0) : 0;
    const prestigeOk    = def.prestigeRequired ? (prestigeCount >= def.prestigeRequired) : true;
    if (def.prestigeRequired) {
      conds.push({ label: 'Prestiges ≥ ' + def.prestigeRequired + '  (actuel : ' + prestigeCount + ')', ok: prestigeOk });
    }

    // ── C6 : Zone précédente conquise ──
    let prevZoneOk = true;
    if (def.requiredZone) {
      prevZoneOk = this.isUnlocked(def.requiredZone);
      const prevDef = this.getDef(def.requiredZone);
      conds.push({ label: def.requiredZoneLabel || (prevDef ? prevDef.icon + ' ' + prevDef.god + ' conquis' : def.requiredZone), ok: prevZoneOk });
    }

    // ── C7+ : Conditions extra ──
    const extraOks = [];
    if (def.extraConditions) {
      def.extraConditions.forEach(ec => {
        const ok = this._checkExtraCondition(ec);
        extraOks.push(ok);
        conds.push({ label: ec.label, ok });
      });
    }

    const allOk    = scoreOk && borderOk && keyOk && ritualOk && prestigeOk && prevZoneOk && extraOks.every(Boolean);
    const canUnlock = allOk && !state.unlocked;
    return { canUnlock, conditions: conds };
  }

  // ── Vérifier une condition extra ──────────────────────────
  _checkExtraCondition(ec) {
    const rm = this.rm, cm = this.cm, pm = this.pm;
    switch (ec.type) {
      case 'codexLevel':
        return cm ? (cm.codexLevel >= ec.amount) : false;
      case 'revealedCount': {
        let cnt = 0;
        this.grid.cells.forEach(c => { if (c.isRevealed) cnt++; });
        return cnt >= ec.amount;
      }
      case 'resourceStock':
        return rm ? (rm.get(ec.resource) >= ec.amount) : false;
      case 'buildingCountEra3': {
        const ERA3 = ['jardins','bosquet','tresor','forge_divine','palais','senat','noeud_olympien','autel_fusion','distillerie','fontaine'];
        let cnt = 0;
        this.grid.cells.forEach(cell => {
          if (!cell.isRevealed || !cell.building || !cell.isConnected) return;
          if (ERA3.includes(cell.building)) cnt++;
        });
        return cnt >= ec.amount;
      }
      case 'maxLevelBuildings': {
        const types = ec.building ? ec.building.split(',') : [];
        let cnt = 0;
        this.grid.cells.forEach(cell => {
          if (!cell.isRevealed || !cell.building || !cell.isConnected) return;
          if (types.length && !types.includes(cell.building)) return;
          const bdef  = this.bm ? this.bm.getBuildingDef(cell.building) : null;
          const maxLv = bdef ? bdef.maxLevel : 50;
          if ((cell.buildingLevel || 1) >= maxLv) cnt++;
        });
        return cnt >= ec.amount;
      }
      case 'prestigeCount':
        return pm ? ((pm.prestigeCount || 0) >= ec.amount) : false;
      default:
        return false;
    }
  }

  _checkRitual(def, state) {
    if (state.ritualDone) return true;
    const pm = this.pm, rm = this.rm, cm = this.cm;

    switch (def.ritualType) {
      case 'resourceRate': {
        const rate = rm ? rm.getRate(def.ritualResource) : 0;
        return (rate || 0) >= def.ritualAmount;
      }
      case 'resourceRateAndStock': {
        const rate  = rm ? (rm.getRate(def.ritualResource) || 0) : 0;
        const stock = rm ? (rm.get(def.ritualStockResource) || 0) : 0;
        return rate >= def.ritualAmount && stock >= def.ritualStockAmount;
      }
      case 'buildingCount': {
        const types = def.ritualBuilding.split(',');
        let count = 0;
        this.grid.cells.forEach(cell => {
          if (!cell.isRevealed || !cell.building) return;
          if (def.ritualConnected && !cell.isConnected) return;
          if (types.includes(cell.building)) count++;
        });
        return count >= def.ritualAmount;
      }
      case 'maxLevelBuildings': {
        const types = def.ritualBuilding.split(',');
        let count = 0;
        this.grid.cells.forEach(cell => {
          if (!cell.isRevealed || !cell.building || !cell.isConnected) return;
          if (!types.includes(cell.building)) return;
          const bdef  = this.bm ? this.bm.getBuildingDef(cell.building) : null;
          const maxLv = bdef ? bdef.maxLevel : 50;
          if ((cell.buildingLevel || 1) >= maxLv) count++;
        });
        return count >= def.ritualAmount;
      }
      case 'prestigeCount':
        return pm ? ((pm.prestigeCount || 0) >= def.ritualAmount) : false;
      case 'revealedCount': {
        let count = 0;
        this.grid.cells.forEach(c => { if (c.isRevealed) count++; });
        return count >= def.ritualAmount;
      }
      case 'codexLevel':
        return cm ? (cm.codexLevel >= def.ritualAmount) : false;

      default:
        return false;
    }
  }

  // ── Démarrer le craft────────
  startCraft(zoneId, slotIndex) {
    const def   = this.getDef(zoneId);
    const state = this.getState(zoneId);
    if (!def || !state) return { ok: false, reason: 'Zone inconnue.' };
    if (state.craftDone)    return { ok: false, reason: 'Clé déjà craftée.' };
    if (state.craftStarted) return { ok: false, reason: 'Craft déjà en cours.' };

    // Vérifier slot disponible
    const slot = slotIndex !== undefined ? slotIndex : this.activeSlots.findIndex(s => !s);
    if (slot < 0 || slot >= this.craftSlots) return { ok: false, reason: 'Aucun slot de craft disponible.' };
    if (this.activeSlots[slot]) return { ok: false, reason: 'Slot occupé.' };

    // Vérifier ressources
    if (!this.rm.canAfford(def.keyIngredients)) {
      const missing = Object.entries(def.keyIngredients)
        .filter(([k, v]) => this.rm.get(k) < v)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ');
      return { ok: false, reason: 'Ressources manquantes : ' + missing };
    }

    this.rm.spend(def.keyIngredients);
    state.craftStarted  = true;
    state.craftProgress = 0;
    this.activeSlots[slot] = zoneId;

    EventBus.emit('zone:craft_started', { zoneId, slot });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return { ok: true, slot };
  }

  // ── Mettre à jour le craft (appelé par GameLoop chaque tick) ─
  update(dt) {
    const now = Date.now();

    // Avancer les crafts en cours
    this.activeSlots.forEach((zoneId, slotIdx) => {
      if (!zoneId) return;
      const def   = this.getDef(zoneId);
      const state = this.getState(zoneId);
      if (!def || !state || state.craftDone) { this.activeSlots[slotIdx] = null; return; }

      state.craftProgress += dt;
      if (state.craftProgress >= def.keyCraftTime) {
        state.craftProgress = def.keyCraftTime;
        state.craftDone     = true;
        this.activeSlots[slotIdx] = null;
        EventBus.emit('zone:key_crafted', { zoneId });
        EventBus.emit('ui:feedback', {
          text: def.icon + ' Clé Divine de ' + def.god + ' prête !',
          x: window.innerWidth / 2, y: window.innerHeight / 2,
          color: def.color,
        });
      }
    });

    // Mettre à jour les malédictions
    ZONE_DEFS.forEach(def => {
      const state = this.zoneState[def.id];
      if (state.unlocked) return; // pas de malédiction si déjà conquise

      // La malédiction commence dès qu'on a révélé ≥ 25 cases
      // (représente que le jeu est bien commencé)
      if (!this._cursedSince[def.id]) {
        let revealed = 0;
        this.grid.cells.forEach(c => { if (c.isRevealed) revealed++; });
        if (revealed >= 25) {
          this._cursedSince[def.id] = now;
          state.curseStart = now;
        }
      }

      if (!state.curseStart) return;
      state.curseMinutes = (now - state.curseStart) / 60000;

      // Stade 4 : démolir un bâtiment toutes les 5 min
      const stage = this._getCurseStage(def.id);
      if (stage && stage.demolishEvery) {
        const lastD = this._lastDemolish[def.id] || 0;
        if (now - lastD >= stage.demolishEvery * 60000) {
          this._demolishRandom();
          this._lastDemolish[def.id] = now;
        }
      }

      // Production de la zone (si conquise)
      if (state.unlocked && def.zoneProduction) {
        Object.entries(def.zoneProduction).forEach(([res, rate]) => {
          this.rm.add(res, rate * dt);
        });
      }
    });

    // Malédiction résiduelle : actif jusqu'à Temple construit
    // (le BuildingManager applique le mult via getCurseMult())
  }

  // ── Obtenir le multiplicateur de malédiction global ─────
  // Retourne le multiplicateur de production le plus sévère parmi toutes les zones actives
  getCurseMult() {
    let mult = 1.0;
    ZONE_DEFS.forEach(def => {
      const state = this.zoneState[def.id];
      if (state.unlocked) return;
      if (!state.curseStart) return;
      const stage = this._getCurseStage(def.id);
      if (stage) mult = Math.min(mult, stage.prodMult);
      // Malédiction résiduelle post-conquête
      if (state.residualCurse && !state.templeBuilt) {
        mult = Math.min(mult, 0.90);
      }
    });
    return mult;
  }

  _getCurseStage(zoneId) {
    const def   = this.getDef(zoneId);
    const state = this.getState(zoneId);
    if (!def || !state || !state.curseStart) return null;
    const minutes = state.curseMinutes || 0;
    let stage = null;
    for (const s of def.curseStages) {
      if (minutes >= s.minTime) stage = s;
    }
    return stage;
  }

  getActiveCurses() {
    const curses = [];
    ZONE_DEFS.forEach(def => {
      const state = this.zoneState[def.id];
      if (state.unlocked) return;
      if (!state.curseStart) return;
      const stage = this._getCurseStage(def.id);
      if (stage) curses.push({ zoneId: def.id, def, state, stage });
    });
    return curses;
  }

  _demolishRandom() {
    // Sélectionner un bâtiment aléatoire non-vital
    const candidates = [];
    this.grid.cells.forEach(cell => {
      if (!cell.isRevealed || !cell.building) return;
      if (cell.type === CELL_TYPE.BASE_MAIN) return;
      candidates.push(cell);
    });
    if (candidates.length === 0) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const bname  = target.building;
    this.bm.demolish(target, window.innerWidth/2, 80);
    EventBus.emit('ui:feedback', {
      text: '💀 Malédiction : ' + bname + ' détruit !',
      x: window.innerWidth/2, y: 80,
      color: '#e05050',
    });
  }

  // ── Déverrouiller une zone ──────────────────────────────
  unlock(zoneId) {
    const def   = this.getDef(zoneId);
    const state = this.getState(zoneId);
    if (!def || !state || state.unlocked) return false;

    const check = this.checkConditions(zoneId);
    if (!check.canUnlock) return false;

    state.unlocked     = true;
    state.residualCurse = true; // -10% jusqu'à Temple construit

    // Bonus Codex
    if (this.cm) {
      this.cm.addPages(def.codexPages);
    }

    // Déverrouiller branche Panthéon
    if (this.pantheonManager) {
      this.pantheonManager.unlockBranch(def.id);
    }

    // Ajouter production de zone au ResourceManager
    // (géré dans update())

    EventBus.emit('zone:unlocked', { zoneId, def });
    EventBus.emit('ui:feedback', {
      text: '🎉 Zone ' + def.god + ' conquise !',
      x: window.innerWidth/2, y: window.innerHeight/3,
      color: def.color,
    });

    // Feu d'artifice visuel
    EventBus.emit('zone:fireworks', { color: def.color });

    // Fin de jeu si Zeus
    if (zoneId === 'zeus') {
      setTimeout(() => EventBus.emit('game:victory', {}), 2000);
    }

    return true;
  }

  // ── Déverrouiller la frontière d'une zone ──────────────
  clearBorder(zoneId) {
    const state = this.getState(zoneId);
    if (state) {
      state.borderCleared = true;
      EventBus.emit('zone:border_cleared', { zoneId });
    }
  }

  // ── Vérifier les frontières automatiquement ─────────────
  checkBorders() {
    ZONE_DEFS.forEach(def => {
      if (!def.borderCondition) return;
      const state = this.getState(def.id);
      if (state.borderCleared) return;

      const cond = def.borderCondition;
      let ok = false;

      if (cond.building) {
        const types = cond.building.split(',');

        if (cond.allTypes) {
          // Chaque type distinct doit être présent ET connecté
          const found = new Set();
          this.grid.cells.forEach(cell => {
            if (!cell.isRevealed || !cell.building) return;
            if (cond.connected && !cell.isConnected) return;
            if (types.includes(cell.building)) found.add(cell.building);
          });
          ok = found.size >= types.length;
        } else {
          // Compter les bâtiments du type requis (optionnellement connectés)
          let count = 0;
          this.grid.cells.forEach(cell => {
            if (!cell.isRevealed || !cell.building) return;
            if (cond.connected && !cell.isConnected) return;
            if (types.includes(cell.building)) count++;
          });
          ok = count >= (cond.count || 1);
        }

      } else if (cond.terrain === 'river' && cond.roads) {
        let count = 0;
        this.grid.cells.forEach(cell => {
          if (!cell.isRevealed) return;
          if (cell.type === CELL_TYPE.RIVER && cell.hasRoad) count++;
        });
        ok = count >= cond.roads;
      } else if (cond.terrain === 'tunnel') {
        let count = 0;
        this.grid.cells.forEach(cell => {
          if (cell.isRevealed && cell.type === CELL_TYPE.TUNNEL) count++;
        });
        ok = count >= (cond.count || 1);
      }

      if (ok) this.clearBorder(def.id);
    });
  }

  // ── Marquer le Temple comme construit ──────────────────
  markTempleBuilt(zoneId) {
    const state = this.getState(zoneId);
    if (state) {
      state.templeBuilt   = true;
      state.residualCurse = false;
    }
  }

  // ── Données pour l'UI ───────────────────────────────────
  getZoneUIData() {
    return ZONE_DEFS.map(def => {
      const state = this.getState(def.id);
      const conds = this.checkConditions(def.id);
      const stage = this._getCurseStage(def.id);
      return {
        def, state, conditions: conds.conditions,
        canUnlock: conds.canUnlock,
        stage,
        craftSlotsUsed: this.activeSlots.filter(Boolean).length,
        maxCraftSlots: this.craftSlots,
      };
    });
  }

  // ── Events ──────────────────────────────────────────────
  _bindEvents() {
    // Vérifier les frontières à chaque changement de bâtiment / terrain
    EventBus.on('building:placed',    () => this.checkBorders());
    EventBus.on('building:demolished',() => this.checkBorders());
    EventBus.on('road:placed',        () => this.checkBorders());
    EventBus.on('terrain:changed',    () => this.checkBorders());
    EventBus.on('prestige:complete',  () => this.checkBorders());

    // Reset des crafts au Prestige (les Clés Divines sont permanentes)
    // Les zones conquises restent conquises après prestige (héritage)
  }

  // ── Sauvegardes ─────────────────────────────────────────
  serialize() {
    return {
      zoneState:     this.zoneState,
      activeSlots:   this.activeSlots,
      cursedSince:   this._cursedSince,
      lastDemolish:  this._lastDemolish,
    };
  }

  deserialize(data) {
    if (!data) return;
    if (data.zoneState) {
      Object.entries(data.zoneState).forEach(([id, s]) => {
        if (this.zoneState[id]) Object.assign(this.zoneState[id], s);
      });
    }
    this.activeSlots    = data.activeSlots   || [null, null];
    this._cursedSince   = data.cursedSince   || {};
    this._lastDemolish  = data.lastDemolish  || {};
  }
}
