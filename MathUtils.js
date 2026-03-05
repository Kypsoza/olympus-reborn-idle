/* ═══════════════════════════════════════════════════════════
   HexGrid.js — Grille hexagonale et génération procédurale
════════════════════════════════════════════════════════════ */

class HexGrid {
  constructor(seed = Date.now()) {
    this.cells = new Map();  // key → HexCell
    this.seed = seed;
    this.rng = MathUtils.seededRandom(seed);
    this._generate();
  }

  // ── Génération procédurale ──────────────────────────────
  _generate() {
    const RADIUS = 45; // +50% vs 30

    // 1. Générer toutes les cases dans le rayon
    for (let q = -RADIUS; q <= RADIUS; q++) {
      for (let r = -RADIUS; r <= RADIUS; r++) {
        if (Math.abs(q + r) <= RADIUS) {
          const type = this._pickType(q, r);
          const cell = new HexCell(q, r, type);
          this.cells.set(cell.key, cell);
        }
      }
    }

    // 2. Base Principale au centre (révélée)
    const center = this.getCell(0, 0);
    if (center) {
      center.type = CELL_TYPE.BASE_MAIN;
      center.state = CELL_STATE.REVEALED;
      center.maxHP = 0; center.currentHP = 0;
    }

    // 3. Révéler l'anneau 1
    HexUtils.hexRing(0, 0, 1).forEach(({ q, r }) => {
      const c = this.getCell(q, r);
      if (c) c.state = CELL_STATE.REVEALED;
    });

    // 4. Ruines et autels (tous à partir de l'anneau 5)
    this._placeSpecialCells();

    // 5. Fleuve circulaire + bras de riviere
    this._placeRiverSystem();

    console.log(`[HexGrid] Grille générée : ${this.cells.size} cases (seed: ${this.seed})`);
  }

  _pickType(q, r) {
    const dist = HexUtils.hexDistance(0, 0, q, r);
    const noise = this.rng();

    // Anneau 0-2 : toujours plaine (zone de depart)
    if (dist <= 2) return CELL_TYPE.PLAIN;

    // Anneaux 0-5 : demarrage facile (40% plaine, 40% foret, 20% montagne)
    if (dist <= 5) {
      if (noise < 0.40) return CELL_TYPE.PLAIN;
      if (noise < 0.80) return CELL_TYPE.FOREST;
      return CELL_TYPE.MOUNTAIN;
    }

    // Anneaux 5-15 : transition normale (sans riviere aleatoire)
    if (dist <= 15) {
      if (noise < 0.35) return CELL_TYPE.PLAIN;
      if (noise < 0.68) return CELL_TYPE.FOREST;
      return CELL_TYPE.MOUNTAIN;
    }

    // Anneaux 15-40 : zone intermediaire (sans riviere aleatoire)
    if (dist <= 40) {
      if (noise < 0.25) return CELL_TYPE.PLAIN;
      if (noise < 0.52) return CELL_TYPE.FOREST;
      return CELL_TYPE.MOUNTAIN;
    }

    // Anneaux 40-45 : zone hostile
    if (noise < 0.08) return CELL_TYPE.PLAIN;
    if (noise < 0.42) return CELL_TYPE.FOREST;
    return CELL_TYPE.MOUNTAIN;
  }

  _placeSpecialCells() {
    // 30 Ruines Antiques (BASE) : 5 anneaux x 6 secteurs, dist 7 a 38
    // 8 Autels de Promethe (ALTAR) : dist 25 a 44, bien repartis
    const ruins = [
      // Anneau ~7 : 6 ruines (un par secteur)
      {q:   7, r:  -7}, {q:   7, r:   0}, {q:   0, r:   7},
      {q:  -7, r:   7}, {q:  -7, r:   0}, {q:   0, r:  -7},
      // Anneau ~15 : 6 ruines (decale 30 degres)
      {q:  15, r:  -8}, {q:   7, r:   8}, {q:  -8, r:  15},
      {q: -15, r:   8}, {q:  -8, r:  -8}, {q:   7, r: -15},
      // Anneau ~20 : 6 ruines
      {q:  20, r: -20}, {q:  20, r:   0}, {q:   0, r:  20},
      {q: -20, r:  20}, {q: -20, r:   0}, {q:   0, r: -20},
      // Anneau ~34 : 6 ruines (decale 30 degres)
      {q:  34, r: -17}, {q:  17, r:  17}, {q: -17, r:  33},
      {q: -34, r:  17}, {q: -17, r: -17}, {q:  17, r: -33},
      // Anneau ~38 : 6 ruines
      {q:  38, r: -38}, {q:  38, r:   0}, {q:   0, r:  38},
      {q: -38, r:  38}, {q: -38, r:   0}, {q:   0, r: -38},
    ];

    // 8 Autels de Promethe : repartis en 4 paires, dist 25-44
    const altars = [
      {q:  25, r: -13}, {q: -25, r:  13},  // dist=25, secteurs NE/SO
      {q:  15, r:  20}, {q: -15, r: -20},  // dist=35, secteurs SE/NO
      {q:  38, r:  -8}, {q: -38, r:   8},  // dist=38, secteurs E/O
      {q:   6, r:  38}, {q:  -6, r: -38},  // dist=44, secteurs S/N
    ];

    ruins.forEach(({q, r}) => {
      const cell = this.getCell(q, r);
      if (!cell || cell.state === CELL_STATE.REVEALED) return;
      cell.type          = CELL_TYPE.BASE;
      cell.maxHP         = MathUtils.randomInt(300, 500);
      cell.currentHP     = cell.maxHP;
      cell.glowIntensity = 0.8 + this.rng() * 0.2;
    });

    altars.forEach(({q, r}) => {
      const cell = this.getCell(q, r);
      if (!cell || cell.state === CELL_STATE.REVEALED) return;
      cell.type          = CELL_TYPE.ALTAR;
      cell.maxHP         = MathUtils.randomInt(1500, 2500);
      cell.currentHP     = cell.maxHP;
      cell.glowIntensity = 1.0;
    });
  }

  // ── Reset pour Prestige ────────────────────────────────
  _reset(heritage) {
    var self = this;
    // Nouvelle seed
    this.seed = Date.now();
    this.rng  = MathUtils.seededRandom(this.seed);

    // Regenerer toutes les cases
    this.cells.clear();
    var RADIUS = 45;
    for (var q = -RADIUS; q <= RADIUS; q++) {
      for (var r = -RADIUS; r <= RADIUS; r++) {
        if (Math.abs(q + r) <= RADIUS) {
          var type = self._pickType(q, r);
          var cell = new HexCell(q, r, type);
          self.cells.set(cell.key, cell);
        }
      }
    }

    // Base principale
    var center = this.getCell(0, 0);
    if (center) {
      center.type = CELL_TYPE.BASE_MAIN;
      center.state = CELL_STATE.REVEALED;
      center.maxHP = 0; center.currentHP = 0;
    }

    // Anneau 1 revele
    HexUtils.hexRing(0, 0, 1).forEach(function(pos) {
      var c = self.getCell(pos.q, pos.r);
      if (c) c.state = CELL_STATE.REVEALED;
    });

    // Ruines et autels
    this._placeSpecialCells();

    // Fleuve + bras
    this._placeRiverSystem();

    // Appliquer l heritage : marquer les spectres
    if (heritage && heritage.length > 0) {
      heritage.forEach(function(h) {
        var cell = self.getCell(h.q, h.r);
        if (cell) {
          cell.isHeritage = true;
          // Niveau de l heritage conserve pour affichage spectre
          cell._heritageLevel = h.level;
        }
      });
    }

    console.log('[HexGrid] Reset prestige, seed:', this.seed, 'heritage:', heritage ? heritage.length : 0);
    EventBus.emit('grid:reset');
  }


  // ── Systeme de fleuve et bras de riviere ────────────────
  _placeRiverSystem() {
    var self = this;
    var rng  = this.rng;
    var seed = this.seed;
    var riverSet = new Set();

    // ─────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────

    // Trace une bande fluviale circulaire
    function drawRing(innerBase, width, noiseMag, islandThresh) {
      self.cells.forEach(function(cell) {
        var dist = HexUtils.hexDistance(0, 0, cell.q, cell.r);
        if (dist < innerBase - 4 || dist > innerBase + width + 4) return;
        var angle = Math.atan2(cell.r, cell.q);
        var n = Math.sin(angle * 3 + seed % 100) * 0.5 +
                Math.sin(angle * 7 + seed % 37)  * 0.25 +
                Math.sin(angle * 13 + seed % 17) * 0.1;
        n *= noiseMag;
        var inner = innerBase + n * 0.8;
        var outer = inner + width + Math.sin(angle * 5 + seed % 53) * 0.5;
        if (dist < inner || dist > outer) return;
        // iles rares
        var islandN = Math.sin(cell.q * 1.7 + seed % 23) * Math.cos(cell.r * 1.3 + seed % 31);
        if (islandN > islandThresh) return;
        riverSet.add(cell.key);
      });
    }

    // Marche organique d un point vers une cible de distance
    function walkBranch(startAngle, startDist, targetDistMin, targetDistMax, maxLen) {
      // Convertit angle+dist en coordonnees hex
      var fx = startDist * Math.cos(startAngle - Math.PI / 6);
      var fz = startDist * Math.sin(startAngle - Math.PI / 6);
      var cubeX = fx * 2 / Math.sqrt(3);
      var cubeZ = -fx / Math.sqrt(3) + fz;
      var q = Math.round(cubeX), r = Math.round(cubeZ);
      var s = -q - r;
      var dq = Math.abs(q - cubeX), dr = Math.abs(r - cubeZ), ds = Math.abs(s - (-cubeX - cubeZ));
      if (dq > dr && dq > ds) q = -r - s; else if (dr > ds) r = -q - s;

      var cq = q, cr = r;
      var visited = new Set();
      for (var step = 0; step < maxLen; step++) {
        var curDist = HexUtils.hexDistance(0, 0, cq, cr);
        if (curDist <= targetDistMin) break;
        var key = HexUtils.hexKey(cq, cr);
        if (visited.has(key)) break;
        visited.add(key);
        riverSet.add(key);

        var dirs = HexUtils.getNeighbors(cq, cr).filter(function(d) {
          var c = self.getCell(d.q, d.r);
          return c && c.type !== CELL_TYPE.BASE_MAIN && c.type !== CELL_TYPE.BASE && c.type !== CELL_TYPE.ALTAR;
        });
        if (!dirs.length) break;

        var scored = dirs.map(function(d) {
          var nd = HexUtils.hexDistance(0, 0, d.q, d.r);
          var progress = curDist - nd;
          // si on veut atteindre une bande intermediaire plutot que le centre,
          // on penalise les cases trop proches de la cible
          var penalty = (nd < targetDistMin) ? -2 : 0;
          var noise = rng() * 0.6 - 0.3;
          var lateral = Math.sin(step * 0.4 + startAngle * 3) * 0.45;
          return { pos: d, score: progress * 1.5 + noise + lateral + penalty };
        });
        scored.sort(function(a, b) { return b.score - a.score; });
        var pick = rng() < 0.82
          ? scored[0]
          : scored[Math.floor(rng() * Math.min(3, scored.length))];
        cq = pick.pos.q; cr = pick.pos.r;
      }
    }

    // ─────────────────────────────────────────────────────
    // 1. FLEUVE INTERIEUR (anneaux 20-22)
    // ─────────────────────────────────────────────────────
    drawRing(20, 2, 2.5, 0.82);

    // Bras internes : du fleuve interieur vers l anneau 5
    var NUM_INNER = 8 + Math.floor(rng() * 5); // 8-12
    for (var b = 0; b < NUM_INNER; b++) {
      var angle = (2 * Math.PI * b / NUM_INNER) + (rng() - 0.5) * (2 * Math.PI / NUM_INNER) * 0.7;
      walkBranch(angle, 19, 5, 19, 80);
    }

    // ─────────────────────────────────────────────────────
    // 2. FLEUVE EXTERIEUR (anneaux 35-37)
    // ─────────────────────────────────────────────────────
    drawRing(35, 1, 1.4, 0.62);

    // Bras inter-fleuves : du fleuve exterieur vers le fleuve interieur (6-10 bras)
    var NUM_INTER = 6 + Math.floor(rng() * 5); // 6-10
    for (var bi = 0; bi < NUM_INTER; bi++) {
      // Angles decales par rapport aux bras internes pour eviter superposition
      var angleI = (2 * Math.PI * bi / NUM_INTER) + Math.PI / NUM_INTER +
                   (rng() - 0.5) * (2 * Math.PI / NUM_INTER) * 0.6;
      // Depart depuis le bord interieur du fleuve ext (dist ~34)
      // Cible : atteindre dist 22-23 (bord exterieur du fleuve int)
      walkBranch(angleI, 34, 22, 34, 45);
    }

    // ─────────────────────────────────────────────────────
    // 3. Appliquer les cases
    // ─────────────────────────────────────────────────────
    var applied = 0;
    riverSet.forEach(function(key) {
      var cell = self.cells.get(key);
      if (!cell) return;
      if (cell.type === CELL_TYPE.BASE_MAIN || cell.type === CELL_TYPE.BASE ||
          cell.type === CELL_TYPE.ALTAR) return;
      if (cell.state === CELL_STATE.REVEALED) return;
      cell.type = CELL_TYPE.RIVER;
      cell.maxHP = MathUtils.randomInt(60, 100);
      cell.currentHP = cell.maxHP;
      applied++;
    });
    console.log('[HexGrid] Fleuves: ' + applied + ' cases riviere (bras internes: ' +
      NUM_INNER + ', bras inter: ' + NUM_INTER + ')');
  }

  // ── Accesseurs ──────────────────────────────────────────
  getCell(q, r)    { return this.cells.get(HexUtils.hexKey(q, r)) || null; }
  getCellByKey(key){ return this.cells.get(key) || null; }

  getNeighbors(q, r) {
    return HexUtils.getNeighbors(q, r)
      .map(n => this.getCell(n.q, n.r))
      .filter(Boolean);
  }

  getRevealedCells() {
    return [...this.cells.values()].filter(c => c.isRevealed);
  }

  getHiddenAdjacentToRevealed() {
    const revealed = this.getRevealedCells();
    const hiddenSet = new Set();
    revealed.forEach(cell => {
      this.getNeighbors(cell.q, cell.r).forEach(neighbor => {
        if (neighbor.isHidden) hiddenSet.add(neighbor);
      });
    });
    return [...hiddenSet];
  }

  // ── Score de Renaissance ────────────────────────────────
  computeRenaissanceScore() {
    let score = 0;
    const buildingScores = {
      farm: 150, lumber: 120, mine_copper: 200, mine_iron: 300, scout: 100,
    };
    this.cells.forEach(cell => {
      if (!cell.isRevealed) return;
      // Cases revelees
      const typeValues = {
        [CELL_TYPE.PLAIN]: 10, [CELL_TYPE.FOREST]: 15,
        [CELL_TYPE.MOUNTAIN]: 20, [CELL_TYPE.RIVER]: 12,
        [CELL_TYPE.FIELD]: 20,  [CELL_TYPE.GROVE]: 18,
        [CELL_TYPE.BASE_MAIN]: 0,
      };
      score += typeValues[cell.type] || 5;
      // Batiment connecte : bonus * niveau
      if (cell.building && cell.isConnected) {
        score += (buildingScores[cell.building] || 100) * cell.buildingLevel;
      }
      // Route
      if (cell.hasRoad) score += 25;
    });
    return Math.floor(score);
  }

  // ── Sérialisation ───────────────────────────────────────
  serialize() {
    const cells = {};
    this.cells.forEach((cell, key) => { cells[key] = cell.serialize(); });
    return { seed: this.seed, cells };
  }

  static deserialize(data) {
    const grid = new HexGrid(data.seed);
    grid.cells.clear();
    Object.entries(data.cells).forEach(([key, cellData]) => {
      grid.cells.set(key, HexCell.deserialize(cellData));
    });
    return grid;
  }
}
