/* ScoutManager.js - Phase 3 v2
   La Tour Eclaireur simule exactement des clics joueur sur les cases.
   - Appelle bm.digCell() : cout 5 Dr, retire 5 HP, revele si HP <= 0
   - Niveau 1  : 1 clic toutes les 10s, rayon 2
   - Niveau 10 : 1 clic par seconde,    rayon 6.5
   - Intervalle : lerp lineaire 10s -> 1s sur les 10 niveaux
   - Rayon      : 2 + (level-1) * 0.5
   - 1 seule case ciblee par cycle (la plus proche et accessible)
   - Necessite une route pour fonctionner
*/

class ScoutManager {
  constructor(grid, buildingManager) {
    this.grid = grid;
    this.bm   = buildingManager;
    this._timers = {}; // cellKey -> secondes accumulees
    this._bindEvents();
  }

  // dt en secondes
  tick(dt) {
    var self = this;
    self.grid.cells.forEach(function(cell) {
      if (!cell.isRevealed || cell.building !== 'scout') return;
      if (!cell.isConnected) return;

      var key = cell.key;
      if (!self._timers[key]) self._timers[key] = 0;
      self._timers[key] += dt;

      var stats = ScoutManager.getStats(cell.buildingLevel);
      if (self._timers[key] >= stats.interval) {
        self._timers[key] -= stats.interval;
        self._doClick(cell, stats);
      }
    });
  }

  _doClick(scoutCell, stats) {
    var self = this;
    // Cherche les cases cachees dans le rayon, accessibles (voisin revele)
    var targets = [];
    self.grid.cells.forEach(function(cell) {
      if (!cell.isHidden) return;
      var dist = HexUtils.hexDistance(scoutCell.q, scoutCell.r, cell.q, cell.r);
      if (dist > stats.radius) return;
      // Verifie qu un voisin est revele (accessible)
      var accessible = self.grid.getNeighbors(cell.q, cell.r)
        .some(function(n) { return n.isRevealed; });
      if (accessible) targets.push({ cell: cell, dist: dist });
    });
    if (targets.length === 0) return;

    // Priorise la plus proche, a egalite la plus entamee (currentHP le plus bas)
    targets.sort(function(a, b) {
      if (a.dist !== b.dist) return a.dist - b.dist;
      return a.cell.currentHP - b.cell.currentHP;
    });

    var target = targets[0].cell;
    // Simule un clic joueur : cout 5 Dr, retire 5 HP
    // Calcule la position ecran du clic scout pour l effet visuel
    var camera = window.game && window.game.renderer && window.game.renderer.camera;
    var hexSize = window.game && window.game.renderer && window.game.renderer.hexSize || 32;
    var sx = 0, sy = 0;
    if (camera && typeof HexUtils !== 'undefined') {
      var wp = HexUtils.hexToPixel(target.q, target.r, hexSize);
      var sp = camera.worldToScreen(wp.x, wp.y);
      sx = sp.x; sy = sp.y;
    }
    self.bm.digCell(target, sx, sy);
  }

  // Stats selon le niveau
  // Niveau 1 -> interval 10s  |  Niveau 10 -> interval 1s  (lineaire)
  static getStats(level) {
    var n    = Math.max(0, Math.min(9, level - 1)); // 0..9
    var interval = 10 - n * (9 / 9); // 10s -> 1s
    var radius   = 2 + n * 0.5;      // 2 -> 6.5
    return {
      interval : Math.round(interval * 10) / 10,
      radius   : radius,
    };
  }

  _bindEvents() {
    var self = this;
    EventBus.on('building:demolished', function(d) {
      if (d && d.cell) delete self._timers[d.cell.key];
    });
  }

  // Cases dans la zone (pour visualisation)
  static getInfluenceZone(grid, scoutCell) {
    var stats = ScoutManager.getStats(scoutCell.buildingLevel);
    var zone  = [];
    grid.cells.forEach(function(cell) {
      var dist = HexUtils.hexDistance(scoutCell.q, scoutCell.r, cell.q, cell.r);
      if (dist <= stats.radius && dist > 0) zone.push(cell);
    });
    return zone;
  }
}
