/* ═══════════════════════════════════════════════════════════
   ZoneManager.js — v0.8.0 — Phase 8 : Zones Divines
   6 zones triangulaires autour de la zone centrale.
   Chaque zone a : conditions de déverrouillage, malédictions
   progressives, ressources exclusives, et lien Panthéon.
   ═══════════════════════════════════════════════════════════ */

const ZONE_DEFS = [
  {
    id: 'demeter',
    zoneId: 1,
    god: 'Déméter',
    icon: '🌾',
    color: '#8bc34a',
    biome: 'Plaines Éternelles',
    desc: 'Les champs sacrés de Déméter nourrissent le monde. Sa bénédiction enrichit la terre.',
    resource: 'nectar',
    resourceLabel: 'Nectar',
    borderType: 'libre',
    borderDesc: 'Frontière ouverte — accessible dès les conditions remplies',
    // Conditions de déverrouillage
    scoreThreshold: 1000,
    // Clé Divine : ressources à crafter
    keyIngredients: { nourr: 500, ambroisie: 50, drachmes: 2000 },
    keyCraftTime: 60,   // secondes
    // Rituel narratif
    ritual: 'Offrir 200 Ambroisie sur l\'Autel de Prométhée',
    ritualResource: 'ambroisie',
    ritualAmount: 200,
    // Ressource produite dans la zone
    zoneProduction: { nectar: 5 },  // par seconde quand active
    // Pages Codex au déverrouillage
    codexPages: 10,
    // Malédiction (progressive)
    curseLabel: 'Famine de Déméter',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Légère sécheresse -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Grande famine -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Fléau de la Déesse -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Ruine des Moissons', demolishEvery: 5 },
    ],
  },
  {
    id: 'hephaïstos',
    zoneId: 2,
    god: 'Héphaïstos',
    icon: '🔨',
    color: '#ff7043',
    biome: 'Forges Volcaniques',
    desc: 'Les volcans sacrés d\'Héphaïstos produisent des métaux divins introuvables ailleurs.',
    resource: 'metal_divin',
    resourceLabel: 'Métal Divin',
    borderType: 'montagne',
    borderDesc: 'Frontière de montagnes — construire 3 Mines pour ouvrir un passage',
    borderCondition: { building: 'mine_iron', count: 3 },
    scoreThreshold: 5000,
    keyIngredients: { fer: 300, acier: 100, drachmes: 5000 },
    keyCraftTime: 120,
    ritual: 'Forger 5 bâtiments de Métal au niveau max',
    ritualType: 'maxLevelBuildings',
    ritualBuilding: 'mine_iron,fonderie_celeste,forge_divine',
    ritualAmount: 5,
    zoneProduction: { metal_divin: 2 },
    codexPages: 10,
    curseLabel: 'Colère d\'Héphaïstos',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Fissures volcaniques -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Pluie de cendres -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Éruption divine -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Apocalypse de Feu', demolishEvery: 5 },
    ],
  },
  {
    id: 'aphrodite',
    zoneId: 3,
    god: 'Aphrodite',
    icon: '💫',
    color: '#f48fb1',
    biome: 'Côtes Enchantées',
    desc: 'Les plages dorées d\'Aphrodite attirent marchands et pèlerins. Le commerce y est divin.',
    resource: 'amrita',
    resourceLabel: 'Amrita',
    borderType: 'riviere',
    borderDesc: 'Rivière Divine — construire un Pont (Route × 2 sur des cases Rivière)',
    borderCondition: { terrain: 'river', roads: 2 },
    scoreThreshold: 5000,
    keyIngredients: { drachmes: 8000, ambroisie: 100, nectar: 80 },
    keyCraftTime: 150,
    ritual: 'Atteindre 1000 Drachmes/s de production',
    ritualType: 'resourceRate',
    ritualResource: 'drachmes',
    ritualAmount: 1000,
    zoneProduction: { amrita: 1, drachmes: 50 },
    codexPages: 10,
    curseLabel: 'Jalousie d\'Aphrodite',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Commerce ralenti -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Marché effondré -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Banqueroute divine -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Ruine Économique', demolishEvery: 5 },
    ],
  },
  {
    id: 'hades',
    zoneId: 4,
    god: 'Hadès',
    icon: '💀',
    color: '#7e57c2',
    biome: 'Souterrains du Tartare',
    desc: 'Les profondeurs obscures d\'Hadès recèlent l\'Orichalque, métal des âmes perdues.',
    resource: 'orichalque',
    resourceLabel: 'Orichalque',
    borderType: 'gouffre',
    borderDesc: 'Gouffre abyssal — percer 2 Tunnels dans les montagnes voisines',
    borderCondition: { terrain: 'tunnel', count: 2 },
    scoreThreshold: 20000,
    keyIngredients: { orichalque: 50, fer: 500, ether: 200 },
    keyCraftTime: 200,
    ritual: 'Effectuer 3 Prestiges',
    ritualType: 'prestigeCount',
    ritualAmount: 3,
    zoneProduction: { orichalque: 1 },
    codexPages: 10,
    curseLabel: 'Malédiction d\'Hadès',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Ombre du Tartare -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Malédiction des Âmes -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Jugement de Shéol -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Mort Progressive', demolishEvery: 5 },
    ],
  },
  {
    id: 'artemis',
    zoneId: 5,
    god: 'Artémis',
    icon: '🌙',
    color: '#4fc3f7',
    biome: 'Forêt Maudite de l\'Aube',
    desc: 'Les forêts enchantées d\'Artémis s\'étendent à l\'infini, empoisonnant qui les profane.',
    resource: 'ambroisie',
    resourceLabel: 'Ambroisie',
    borderType: 'foret',
    borderDesc: 'Forêt maudite — construire un Autel dans la forêt pour apaiser la Déesse',
    borderCondition: { building: 'autel_artemis', count: 1 },
    scoreThreshold: 100000,
    keyIngredients: { bois: 2000, ambroisie: 300, metal_divin: 20 },
    keyCraftTime: 300,
    ritual: 'Révéler 80 cases de la carte',
    ritualType: 'revealedCount',
    ritualAmount: 80,
    zoneProduction: { ambroisie: 3, bois: 20 },
    codexPages: 10,
    curseLabel: 'Chasse d\'Artémis',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Vent de Minuit -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Traque Sylvestre -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Malédiction Lunaire -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Forêt Dévorante', demolishEvery: 5 },
    ],
  },
  {
    id: 'zeus',
    zoneId: 6,
    god: 'Zeus',
    icon: '⚡',
    color: '#ffd54f',
    biome: 'Cimes de l\'Olympe',
    desc: 'Le sommet de l\'Olympe. Conquérir la zone de Zeus débloque la fin du jeu.',
    resource: 'foudre',
    resourceLabel: 'Foudre ×3',
    borderType: 'tempete',
    borderDesc: 'Tempête divine — activer 3 Pylônes Sacrés (bâtiments de l\'Ère 3)',
    borderCondition: { building: 'palais_titans,forge_divine,fontaine_eternelle', count: 3 },
    scoreThreshold: 500000,
    keyIngredients: { ether: 1000, orichalque: 200, metal_divin: 100 },
    keyCraftTime: 600,
    ritual: 'Atteindre le Codex niveau 5',
    ritualType: 'codexLevel',
    ritualAmount: 5,
    zoneProduction: { foudre: 5, ether: 2 },
    codexPages: 20,
    curseLabel: 'Colère de Zeus',
    curseStages: [
      { minTime:  0, prodMult: 0.95, label: 'Éclairs lointains -5%' },
      { minTime: 10, prodMult: 0.85, label: 'Tempête divine -15%' },
      { minTime: 30, prodMult: 0.70, label: 'Foudre de l\'Olympe -30%' },
      { minTime: 60, prodMult: 0.70, label: 'Apocalypse Céleste', demolishEvery: 5 },
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
        borderCleared: (z.borderType === 'libre'), // Déméter est libre
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

    const pm = this.pm;
    const cm = this.cm;
    const rm = this.rm;

    // 1. Score Renaissance
    const score     = pm ? pm.getLiveScore() : 0;
    const scoreOk   = score >= def.scoreThreshold;

    // 2. Frontière détruite
    const borderOk  = state.borderCleared;

    // 3. Clé Divine craftée
    const keyOk     = state.craftDone;

    // 4. Rituel accompli
    const ritualOk  = this._checkRitual(def, state);

    const canUnlock = scoreOk && borderOk && keyOk && ritualOk && !state.unlocked;

    return {
      canUnlock,
      conditions: [
        { label: 'Score Renaissance ≥ ' + def.scoreThreshold.toLocaleString(), ok: scoreOk, value: score.toLocaleString() },
        { label: 'Frontière ' + def.borderDesc.split('—')[0].trim(), ok: borderOk },
        { label: 'Clé Divine craftée', ok: keyOk, crafting: state.craftStarted && !state.craftDone, progress: state.craftProgress, total: def.keyCraftTime },
        { label: 'Rituel : ' + def.ritual, ok: ritualOk },
      ],
    };
  }

  _checkRitual(def, state) {
    if (state.ritualDone) return true;
    const pm = this.pm;
    const rm = this.rm;
    const cm = this.cm;

    switch (def.ritualType) {
      case 'resourceRate': {
        const rate = rm ? rm.getRate(def.ritualResource) : 0;
        return (rate || 0) >= def.ritualAmount;
      }
      case 'maxLevelBuildings': {
        // Compter les bâtiments au niveau max parmi les types listés
        const types = def.ritualBuilding.split(',');
        let count = 0;
        this.grid.cells.forEach(cell => {
          if (!cell.isRevealed || !cell.building) return;
          if (!types.includes(cell.building)) return;
          const bdef  = this.bm ? this.bm.getBuildingDef(cell.building) : null;
          const maxLv = bdef ? bdef.maxLevel : 50;
          if ((cell.buildingLevel || 1) >= maxLv) count++;
        });
        return count >= def.ritualAmount;
      }
      case 'prestigeCount':
        return pm ? (pm.prestigeCount >= def.ritualAmount) : false;
      case 'revealedCount': {
        let count = 0;
        this.grid.cells.forEach(c => { if (c.isRevealed) count++; });
        return count >= def.ritualAmount;
      }
      case 'codexLevel':
        return cm ? (cm.codexLevel >= def.ritualAmount) : false;
      default:
        return false; // Déméter : rituel via l'autel (géré séparément)
    }
  }

  // ── Rituel Déméter : offrir de l'Ambroisie ─────────────
  performDemeterRitual() {
    const def   = this.getDef('demeter');
    const state = this.getState('demeter');
    if (state.ritualDone) return { ok: false, reason: 'Rituel déjà accompli.' };
    if (!this.rm.canAfford({ ambroisie: def.ritualAmount })) {
      return { ok: false, reason: def.ritualAmount + ' Ambroisie requise.' };
    }
    this.rm.spend({ ambroisie: def.ritualAmount });
    state.ritualDone = true;
    EventBus.emit('zone:ritual_done', { zoneId: 'demeter' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return { ok: true };
  }

  // ── Démarrer le craft d'une Clé Divine ─────────────────
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
        // Compter les bâtiments du type requis
        const types = cond.building.split(',');
        let count = 0;
        this.grid.cells.forEach(cell => {
          if (!cell.isRevealed || !cell.building) return;
          if (types.includes(cell.building)) count++;
        });
        ok = count >= (cond.count || 1);
      } else if (cond.terrain === 'river' && cond.roads) {
        // Compter les cases Rivière avec route
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
