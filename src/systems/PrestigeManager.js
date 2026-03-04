/* ═══════════════════════════════════════════════════════════
   PrestigeManager.js — Phase 4 : Prestige & Autel
   Conditions : 50 cases revelees + 3 bases niveau 5
   Autel : activation quand conditions remplies, barre 2000 HP
   Prestige : calcul Ether, reset monde, conservation heritage
════════════════════════════════════════════════════════════ */

class PrestigeManager {
  constructor(grid, resources, buildingManager) {
    this.grid = grid;
    this.rm   = resources;
    this.bm   = buildingManager;
    this.talentManager = null; // set by GameLoop after init

    // Conditions requises
    this.REQUIRED_REVEALED = 50;
    this.REQUIRED_BASE_LVL5 = 3;
    this.ALTAR_HP_MAX = 2000;

    // Etat
    this.prestigeCount = 0;     // nombre de prestiges effectues
    this.heritage = [];         // [{q,r,level}] spectres conserves

    this._bindEvents();
  }

  // ── Conditions ──────────────────────────────────────────
  getConditions() {
    var revealed = 0;
    var basesLvl5 = 0;
    this.grid.cells.forEach(function(cell) {
      if (cell.isRevealed) revealed++;
      if (cell.type === CELL_TYPE.BASE && cell.isRevealed && cell.baseLevel >= 5) basesLvl5++;
    });
    return {
      revealed:      revealed,
      revealedOk:    revealed >= this.REQUIRED_REVEALED,
      basesLvl5:     basesLvl5,
      basesLvl5Ok:   basesLvl5 >= this.REQUIRED_BASE_LVL5,
      allMet:        revealed >= this.REQUIRED_REVEALED && basesLvl5 >= this.REQUIRED_BASE_LVL5,
    };
  }

  // ── Amelioration Base Cachee ─────────────────────────────
  getBaseUpgradeCost(level) {
    var costs = [
      null,                                          // niveau 0 inexistant
      { drachmes: 500,  bois: 200 },                 // 1->2
      { drachmes: 1200, bois: 500,  fer: 50 },       // 2->3
      { drachmes: 2500, bois: 1000, fer: 150 },      // 3->4
      { drachmes: 5000, bois: 2000, fer: 400, nourr: 200 }, // 4->5
    ];
    return costs[level] || null;
  }

  getBaseBonus(level) {
    // Bonus de production global par base amelioree
    var bonuses = [0, 0, 5, 12, 22, 35]; // % bonus production
    return bonuses[level] || 0;
  }

  canUpgradeBase(cell) {
    if (!cell.isRevealed || cell.type !== CELL_TYPE.BASE) return { ok: false, reason: 'Pas une base.' };
    var lvl = cell.baseLevel || 1;
    if (lvl >= 5) return { ok: false, reason: 'Niveau maximum atteint.' };
    var cost = this.getBaseUpgradeCost(lvl);
    if (!cost) return { ok: false, reason: 'Erreur de cout.' };
    if (!this.rm.canAfford(cost)) return { ok: false, reason: 'Ressources insuffisantes.' };
    return { ok: true, cost: cost, nextLevel: lvl + 1 };
  }

  upgradeBase(cell) {
    var check = this.canUpgradeBase(cell);
    if (!check.ok) return false;
    this.rm.spend(check.cost);
    cell.baseLevel = (cell.baseLevel || 1) + 1;
    EventBus.emit('base:upgraded', { cell: cell });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    // Recalcule le bonus de production global
    this._recalculateBaseBonus();
    return true;
  }

  _recalculateBaseBonus() {
    var totalBonus = 0;
    this.grid.cells.forEach(function(cell) {
      if (cell.type === CELL_TYPE.BASE && cell.isRevealed && cell.baseLevel > 1) {
        var bonuses = [0, 0, 5, 12, 22, 35];
        totalBonus += bonuses[cell.baseLevel] || 0;
      }
    });
    // Stocke le bonus pour que BuildingManager puisse l appliquer
    this.baseBonusPct = totalBonus;
    EventBus.emit('prestige:bonus_updated', { bonusPct: totalBonus });
  }

  // ── Activation de l Autel ────────────────────────────────
  canActivateAltar(cell) {
    if (!cell.isRevealed || cell.type !== CELL_TYPE.ALTAR) return { ok: false, reason: 'Pas un autel.' };
    var cond = this.getConditions();
    if (!cond.allMet) return { ok: false, conditions: cond };
    return { ok: true };
  }

  // Fouille de l autel une fois conditions remplies (appele par digCell)
  isAltarUnlocked(cell) {
    if (cell.type !== CELL_TYPE.ALTAR) return false;
    return this.getConditions().allMet;
  }

  // ── Calcul Ether ─────────────────────────────────────────
  computeEther() {
    var score = this.grid.computeRenaissanceScore();
    // Formule exponentielle : sqrt(score) * 15 → valeurs satisfaisantes
    // score=1000 → ~474 Ether, score=10000 → ~1500, score=100000 → ~4743
    var base = Math.floor(Math.sqrt(score) * 15);
    // Bonus prestige : +5% par prestige precedent
    var prestigeMult = 1 + this.prestigeCount * 0.05;
    var etherMult = this.talentManager ? this.talentManager.getEtherGainMult() : 1;
    return Math.max(10, Math.floor(base * prestigeMult * etherMult));
  }

  // ── Sequence de Prestige ─────────────────────────────────
  triggerPrestige() {
    var self = this;

    // 1. Sauvegarde avant prestige
    EventBus.emit('save:request');

    // 2. Calcul Ether
    var etherGained = self.computeEther();

    // 3. Conservation heritage : toutes les bases revelees niv >= 2
    self.heritage = [];
    self.grid.cells.forEach(function(cell) {
      if (cell.type === CELL_TYPE.BASE && cell.isRevealed && (cell.baseLevel || 1) >= 2) {
        self.heritage.push({ q: cell.q, r: cell.r, level: cell.baseLevel });
      }
    });

    // 4. Sequence visuelle : fondu lumineux
    EventBus.emit('prestige:sequence_start', { etherGained: etherGained });

    // 5. Reset (apres animation)
    setTimeout(function() {
      self._doReset(etherGained);
    }, 2500);
  }

  _doReset(etherGained) {
    var self = this;

    // Ajouter l ether acquis
    var previousEther = self.rm.get('ether');
    self.rm.add('ether', etherGained);

    // Incrementer compteur
    self.prestigeCount++;

    // Reset talents in-run (les talents Ether sont conserves)
    if (self.talentManager) self.talentManager.resetInRunTalents();

    // Reset ressources (sauf ether)
    var keepKeys = ['ether'];
    Object.entries(self.rm.resources).forEach(function([k, r]) {
      if (keepKeys.includes(k)) return;
      r.rate = 0;
    });
    // Valeurs de depart selon reliques
    var hasReliqueCarte = self.talentManager && self.talentManager.hasRelique('carte');
    self.rm.resources.drachmes.value = 500;
    self.rm.resources.bois.value     = 200;
    self.rm.resources.nourr.value    = 100;
    self.rm.resources.fer.value      = 50;
    self.rm.resources.habitants.value = 0;
    self.rm.resources.nectar.value   = 0;
    self.rm.resources.bronze.value   = 0;
    self.rm.resources.acier.value    = 0;
    self.rm.resources.farine.value   = 0;
    self.rm.resources.foudre.value   = 0;
    self.rm.resources.orichalque.value= 0;
    self.rm.resources.metal_divin.value=0;
    self.rm.resources.amrita.value   = 0;

    // Reset grille (nouvelle graine)
    self.grid._reset(self.heritage);
    // Relique Carte des Titans : revele anneau 2 supplementaire
    if (self.talentManager && self.talentManager.hasRelique('carte')) {
      var HexU = typeof HexUtils !== 'undefined' ? HexUtils : null;
      if (HexU) {
        HexU.hexRing(0, 0, 2).forEach(function(pos) {
          var c = self.grid.getCell(pos.q, pos.r);
          if (c && c.isHidden) { c.state = CELL_STATE.REVEALED; c.currentHP = 0; }
        });
      }
    }

    // Notify
    EventBus.emit('prestige:complete', {
      etherGained: etherGained,
      totalEther:  self.rm.get('ether'),
      prestigeCount: self.prestigeCount,
      heritage: self.heritage,
    });
    EventBus.emit('resources:updated', self.rm.getSnapshot());

    // Sauvegarde post-prestige
    setTimeout(function() { EventBus.emit('save:request'); }, 500);
  }

  // ── Heritage visuel ──────────────────────────────────────
  isHeritage(q, r) {
    return this.heritage.some(function(h) { return h.q === q && h.r === r; });
  }
  getHeritagLevel(q, r) {
    var h = this.heritage.find(function(h) { return h.q === q && h.r === r; });
    return h ? h.level : 0;
  }

  _bindEvents() {
    var self = this;
    EventBus.on('cell:revealed', function(d) {
      if (d.cell.type === CELL_TYPE.BASE) {
        if (!d.cell.baseLevel) d.cell.baseLevel = 1;
      }
    });
  }

  // ── Serialisation ────────────────────────────────────────
  serialize() {
    return {
      prestigeCount: this.prestigeCount,
      heritage:      this.heritage,
      baseBonusPct:  this.baseBonusPct || 0,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.prestigeCount = data.prestigeCount || 0;
    this.heritage      = data.heritage      || [];
    this.baseBonusPct  = data.baseBonusPct  || 0;
  }
}
