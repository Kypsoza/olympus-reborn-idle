/* ═══════════════════════════════════════════════════════════
   CodexManager.js — v0.6.0 — Phase 6 : Codex Olympien
   Mécanique Book of Shadows adaptée.
   Le Codex accumule des Pages à chaque Prestige.
   Les Pages montent le niveau du Codex qui multiplie l'Éther.
   ═══════════════════════════════════════════════════════════ */

class CodexManager {
  constructor(grid, resources, buildingManager) {
    this.grid = grid;
    this.rm   = resources;
    this.bm   = buildingManager;
    this.talentManager = null; // injecté par GameLoop

    // ── État persistant ──────────────────────────────────
    this.pages          = 0;     // Pages accumulées (permanentes)
    this.codexLevel     = 1;     // Niveau actuel du Codex
    this.totalPagesEver = 0;     // Total historique (pour stats)

    // ── Investissements Éther dans le Codex ─────────────
    // Slots bonus Pages : nb de slots achetés (max 5)
    this.bonusPageSlots   = 0;
    // Pages Dorées actives (x2 sur les pages gagnées) : niveau (max 3)
    this.goldenPagesLevel = 0;
    // Source bonus : bâtiments supplémentaires découverts (max 1 achat)
    this.buildingSourceUnlocked = false;
    // Source bonus : Ère 3 atteinte compte double (max 1 achat)
    this.eraSourceUpgraded = false;

    // ── Seuils de niveau Codex ───────────────────────────
    // pages[i] = pages totales nécessaires pour passer au niveau i+2
    this.LEVEL_THRESHOLDS = [100, 300, 700, 1500, 3000, 6000, 12000, 25000, 50000];
    // Multiplicateurs Éther par niveau
    this.LEVEL_ETHER_MULT = [1.0, 1.5, 2.5, 4.0, 6.5, 10.0, 16.0, 25.0, 40.0, 65.0];

    // ── Coûts investissements Éther ──────────────────────
    this.SLOT_COST        = [50, 120, 300, 750, 2000];   // coût de chaque slot (0→1, 1→2...)
    this.GOLDEN_COST      = [80, 250, 800];               // coût pages dorées niv1/2/3
    this.BUILDING_COST    = 150;
    this.ERA_COST         = 200;

    this._bindEvents();
  }

  // ── Calcul Pages gagnées au Prestige ────────────────────
  computePagesGained(prestigeData) {
    var score        = prestigeData.score || 0;
    var buildingTypes= prestigeData.buildingTypes || 0;
    var era3Reached  = prestigeData.era3Reached || false;
    var zonesOwned   = prestigeData.zonesOwned   || 0;   // Phase 8

    // Base : score / 1000
    var base = Math.max(1, Math.floor(score / 1000));

    // +5 pages par type de bâtiment construit (si source débloquée)
    var buildingBonus = this.buildingSourceUnlocked ? buildingTypes * 5 : 0;

    // +20 pages si Ère 3 atteinte
    var eraBonus = era3Reached ? (this.eraSourceUpgraded ? 40 : 20) : 0;

    // +10 pages par zone conquise (Phase 8)
    var zoneBonus = zonesOwned * 10;

    // Bonus slots : +15 pages par slot acheté
    var slotBonus = this.bonusPageSlots * 15;

    // Bonus Panthéon (nœuds her_r1_1, her_r2_1, etc.)
    var pantheonFlatBonus = 0;
    var pantheonPctBonus  = 0;
    if (typeof window !== 'undefined' && window.game && window.game.pantheonManager) {
      pantheonFlatBonus = window.game.pantheonManager.getCodexPagesBonus();
      pantheonPctBonus  = window.game.pantheonManager.getCodexPagesPctBonus();
    }

    var total = base + buildingBonus + eraBonus + zoneBonus + slotBonus + pantheonFlatBonus;

    // Pages Dorées : x multiplicateur
    var goldenMult = [1, 1.5, 2.25, 3.0][this.goldenPagesLevel] || 1;
    var finalMult = goldenMult * (1 + pantheonPctBonus / 100);
    return Math.floor(total * finalMult);
  }

  // ── Ajouter des pages (appelé lors du prestige) ──────────
  addPages(amount) {
    this.pages          += amount;
    this.totalPagesEver += amount;
    this._recalculateLevel();
    EventBus.emit('codex:pages_gained', { amount, total: this.pages, level: this.codexLevel });
  }

  // ── Recalculer le niveau selon les pages totales ────────
  _recalculateLevel() {
    var newLevel = 1;
    for (var i = 0; i < this.LEVEL_THRESHOLDS.length; i++) {
      if (this.pages >= this.LEVEL_THRESHOLDS[i]) newLevel = i + 2;
      else break;
    }
    var didLevelUp = newLevel > this.codexLevel;
    this.codexLevel = newLevel;
    if (didLevelUp) {
      EventBus.emit('codex:level_up', { level: this.codexLevel });
    }
  }

  // ── Multiplicateur Éther actuel ─────────────────────────
  getEtherMultiplier() {
    var idx = Math.min(this.codexLevel - 1, this.LEVEL_ETHER_MULT.length - 1);
    return this.LEVEL_ETHER_MULT[idx];
  }

  // ── Pages pour passer au prochain niveau ────────────────
  getPagesForNextLevel() {
    var idx = this.codexLevel - 1; // seuil = LEVEL_THRESHOLDS[idx]
    if (idx >= this.LEVEL_THRESHOLDS.length) return Infinity; // niveau max
    return this.LEVEL_THRESHOLDS[idx];
  }

  getProgressToNextLevel() {
    var threshold = this.getPagesForNextLevel();
    if (threshold === Infinity) return 1;
    var prevThreshold = this.codexLevel >= 2 ? this.LEVEL_THRESHOLDS[this.codexLevel - 2] : 0;
    return (this.pages - prevThreshold) / (threshold - prevThreshold);
  }

  // ── Investissements Éther ────────────────────────────────

  canBuySlot() {
    if (this.bonusPageSlots >= 5) return { ok: false, reason: 'Maximum atteint (5 slots).' };
    var cost = this.SLOT_COST[this.bonusPageSlots];
    if (this.rm.get('ether') < cost) return { ok: false, reason: 'Éther insuffisant (' + cost + ' requis).' };
    return { ok: true, cost };
  }
  buySlot() {
    var check = this.canBuySlot();
    if (!check.ok) return false;
    this.rm.spend({ ether: check.cost });
    this.bonusPageSlots++;
    EventBus.emit('codex:upgraded', { type: 'slot', level: this.bonusPageSlots });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  canBuyGoldenPages() {
    if (this.goldenPagesLevel >= 3) return { ok: false, reason: 'Maximum atteint (Pages Dorées III).' };
    var cost = this.GOLDEN_COST[this.goldenPagesLevel];
    if (this.rm.get('ether') < cost) return { ok: false, reason: 'Éther insuffisant (' + cost + ' requis).' };
    return { ok: true, cost };
  }
  buyGoldenPages() {
    var check = this.canBuyGoldenPages();
    if (!check.ok) return false;
    this.rm.spend({ ether: check.cost });
    this.goldenPagesLevel++;
    EventBus.emit('codex:upgraded', { type: 'golden', level: this.goldenPagesLevel });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  canBuyBuildingSource() {
    if (this.buildingSourceUnlocked) return { ok: false, reason: 'Déjà débloqué.' };
    if (this.rm.get('ether') < this.BUILDING_COST) return { ok: false, reason: 'Éther insuffisant (' + this.BUILDING_COST + ' requis).' };
    return { ok: true, cost: this.BUILDING_COST };
  }
  buyBuildingSource() {
    var check = this.canBuyBuildingSource();
    if (!check.ok) return false;
    this.rm.spend({ ether: check.cost });
    this.buildingSourceUnlocked = true;
    EventBus.emit('codex:upgraded', { type: 'building_source' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  canBuyEraSource() {
    if (this.eraSourceUpgraded) return { ok: false, reason: 'Déjà débloqué.' };
    if (this.rm.get('ether') < this.ERA_COST) return { ok: false, reason: 'Éther insuffisant (' + this.ERA_COST + ' requis).' };
    return { ok: true, cost: this.ERA_COST };
  }
  buyEraSource() {
    var check = this.canBuyEraSource();
    if (!check.ok) return false;
    this.rm.spend({ ether: check.cost });
    this.eraSourceUpgraded = true;
    EventBus.emit('codex:upgraded', { type: 'era_source' });
    EventBus.emit('resources:updated', this.rm.getSnapshot());
    return true;
  }

  // ── Preview des pages que donnera le prochain prestige ───
  previewNextPages(score, buildingTypes, era3Reached) {
    return this.computePagesGained({ score, buildingTypes, era3Reached });
  }

  // ── Compter les types de bâtiments distincts en jeu ──────
  countBuildingTypes() {
    var types = new Set();
    this.grid.cells.forEach(function(cell) {
      if (cell.isRevealed && cell.building) types.add(cell.building);
    });
    return types.size;
  }

  // ── Vérifier si l'Ère 3 est atteinte ────────────────────
  isEra3Reached() {
    return this.talentManager ? (this.talentManager.getUnlockedEra() >= 3) : false;
  }

  // ── Events ───────────────────────────────────────────────
  _bindEvents() {
    // Les pages sont ajoutées lors du prestige — géré par PrestigeManager
    var self = this;
    EventBus.on('codex:level_up', function(d) {
      self._showLevelUpToast(d.level);
    });
  }

  _showLevelUpToast(level) {
    var prev = document.getElementById('codex-levelup-toast');
    if (prev) prev.remove();
    var toast = document.createElement('div');
    toast.id = 'codex-levelup-toast';
    var mult = this.LEVEL_ETHER_MULT[Math.min(level - 1, this.LEVEL_ETHER_MULT.length - 1)];
    toast.innerHTML =
      '<div class="clt-icon">📖</div>' +
      '<div class="clt-text">' +
        '<div class="clt-title">Codex — Niveau ' + level + ' !</div>' +
        '<div class="clt-sub">Multiplicateur Éther : <b>×' + mult.toFixed(1) + '</b></div>' +
      '</div>';
    document.body.appendChild(toast);
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 4500);
  }

  // ── Sauvegarde ────────────────────────────────────────────
  serialize() {
    return {
      pages:                  this.pages,
      codexLevel:             this.codexLevel,
      totalPagesEver:         this.totalPagesEver,
      bonusPageSlots:         this.bonusPageSlots,
      goldenPagesLevel:       this.goldenPagesLevel,
      buildingSourceUnlocked: this.buildingSourceUnlocked,
      eraSourceUpgraded:      this.eraSourceUpgraded,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.pages                  = data.pages                  ?? 0;
    this.codexLevel             = data.codexLevel             ?? 1;
    this.totalPagesEver         = data.totalPagesEver         ?? 0;
    this.bonusPageSlots         = data.bonusPageSlots         ?? 0;
    this.goldenPagesLevel       = data.goldenPagesLevel       ?? 0;
    this.buildingSourceUnlocked = data.buildingSourceUnlocked ?? false;
    this.eraSourceUpgraded      = data.eraSourceUpgraded      ?? false;
    // Recalc niveau au chargement
    this._recalculateLevel();
  }
}
