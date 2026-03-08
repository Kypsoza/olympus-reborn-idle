/* MapRenderer — v0.5.3.js - Phase 3 */

class MapRenderer {
  constructor(canvas, grid, camera) {
    this.canvas      = canvas;
    this.ctx         = canvas.getContext('2d');
    this.grid        = grid;
    this.camera      = camera;
    this.hexSize     = 54;
    this.hoveredKey  = null;
    this.selectedKey = null;
    this._scoutCell  = null; // case scout selectionnee
    this._initTooltip();
  // Conversion écran → canvas (corrige CSS scaling / DPR)
  _clientToCanvas(cx, cy) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  }

    this._bindHover();
    this._bindClick();
    this._bindScoutEvents();
    this._initPrestigeOverlay();
    this._prestigeFlash = 0;
    this._prestigeFlashing = false;
    this._visibleCache = null;   // cache des cellules visibles
    this._visibleCacheBounds = null;
    this._dirtyVisible = true;   // force rebuild au 1er render
    this._bindCacheInvalidation();
  }

  render(dt) {
    const { ctx, canvas } = this;
    // Toujours redessiner si prestige actif ou animation en cours
    const hasAnim = this._prestigeFlashing || this._prestigeFlash > 0 || this._hasActiveAnims();
    if (!this._dirty && !hasAnim) return;
    this._dirty = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this._drawBackground();
    this.camera.apply(ctx);
    this._frameNow = performance.now(); // cache pour éviter N appels performance.now()
    this._getVisibleCells().forEach(cell => this._drawCell(cell));
    this.camera.restore(ctx);
    this._drawPrestigeOverlay(ctx, dt);
  }

  _hasActiveAnims() {
    const visible = this._visibleCache;
    if (!visible) return false;
    for (let i = 0; i < visible.length; i++) {
      const c = visible[i];
      if (c.isBeingDug || (c.revealAnim !== undefined && c.revealAnim < 1)) {
        this._dirty = true; // continue à animer la prochaine frame
        return true;
      }
    }
    // Cellules spéciales qui pulsent : toujours animer
    for (let i = 0; i < visible.length; i++) {
      const c = visible[i];
      if (c.isHidden && (c.isSpecial || c.type === CELL_TYPE.ALTAR)) {
        this._dirty = true;
        return true;
      }
    }
    return false;
  }

  _drawBackground() {
    const { ctx, canvas } = this;
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height));
    grad.addColorStop(0, '#100d20');
    grad.addColorStop(1, '#0a0812');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const rng = MathUtils.seededRandom(42);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + rng() * 0.4) + ')';
      ctx.beginPath();
      ctx.arc(rng() * canvas.width, rng() * canvas.height, rng() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _getVisibleCells() {
    const margin = this.hexSize * 3;
    const tl = this.camera.screenToWorld(-margin, -margin);
    const br = this.camera.screenToWorld(this.canvas.width + margin, this.canvas.height + margin);

    // Reuse cache si la vue n'a pas bougé ET la grille est propre
    if (!this._dirtyVisible && this._visibleCache && this._visibleCacheBounds) {
      const b = this._visibleCacheBounds;
      if (Math.abs(b.tlx - tl.x) < 1 && Math.abs(b.tly - tl.y) < 1 &&
          Math.abs(b.brx - br.x) < 1 && Math.abs(b.bry - br.y) < 1) {
        return this._visibleCache;
      }
    }

    const result = [];
    this.grid.cells.forEach(cell => {
      const { x, y } = HexUtils.hexToPixel(cell.q, cell.r, this.hexSize);
      if (x >= tl.x && x <= br.x && y >= tl.y && y <= br.y) result.push(cell);
    });
    this._visibleCache = result;
    this._visibleCacheBounds = { tlx: tl.x, tly: tl.y, brx: br.x, bry: br.y };
    this._dirtyVisible = false;
    return result;
  }

  _bindCacheInvalidation() {
    const inv = () => { this._dirtyVisible = true; };
    const dirtyAndInv = () => { this._dirty = true; this._dirtyVisible = true; };
    const dirty = () => { this._dirty = true; };
    this._dirty = true; // premier rendu
    EventBus.on('cell:revealed',       dirtyAndInv);
    EventBus.on('grid:reset',          dirtyAndInv);
    EventBus.on('terrain:transformed', dirtyAndInv);
    EventBus.on('camera:moved',        dirtyAndInv);
    EventBus.on('camera:zoomed',       dirtyAndInv);
    EventBus.on('building:built',      dirty);
    EventBus.on('building:demolished', dirty);
    EventBus.on('building:upgraded',   dirty);
    EventBus.on('road:placed',         dirty);
    EventBus.on('road:removed',        dirty);
    EventBus.on('resources:updated',   dirty); // met à jour les indicateurs actif/inactif
    EventBus.on('cell:dig',            dirty);
  }

  _drawCell(cell) {
    const { ctx, hexSize } = this;
    const { x, y } = HexUtils.hexToPixel(cell.q, cell.r, hexSize);
    const corners  = HexUtils.hexCorners(x, y, hexSize - 1);
    let dx = 0, dy = 0;
    if (cell.isBeingDug) {
      const t = (this._frameNow || 0) * 0.03;
      dx = Math.sin(t * 7.3) * 1.5;
      dy = Math.cos(t * 6.1) * 1.0;
    }
    ctx.save();
    ctx.translate(dx, dy);
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 6; i++) ctx.lineTo(corners[i].x, corners[i].y);
    ctx.closePath();
    if (cell.isHidden) this._drawHiddenCell(ctx, cell, x, y, corners);
    else               this._drawRevealedCell(ctx, cell, x, y, corners);
    ctx.restore();
  }

  _drawHiddenCell(ctx, cell, x, y, corners) {
    // Spectre d heritage visible dans le brouillard
    if (cell.isHeritage) {
      const hexSize = this.hexSize;
      this._hexPath(ctx, corners);
      ctx.fillStyle = 'rgba(130,70,220,0.15)'; ctx.fill();
      ctx.strokeStyle = 'rgba(160,100,255,0.50)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = (hexSize*0.28)+'px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.55;
      ctx.fillText('👻', x, y);
      ctx.globalAlpha = 1;
    }
    const { hexSize } = this;
    const fogGrad = ctx.createRadialGradient(x, y, 0, x, y, hexSize);
    fogGrad.addColorStop(0, '#1e1a30');
    fogGrad.addColorStop(1, '#0e0a1e');
    ctx.fillStyle = fogGrad; ctx.fill();
    ctx.strokeStyle = '#2a2440'; ctx.lineWidth = 0.8; ctx.stroke();
    if (cell.maxHP > 0 && cell.currentHP < cell.maxHP) this._drawDigBar(ctx, x, y, cell);
    if (cell.isSpecial || cell.type === CELL_TYPE.ALTAR) {
      // Halo visible seulement si à ≤5 cases d'une case révélée
      const minDist = this._minDistToRevealed(cell);
      if (minDist <= 5) {
        const pulse = this._computePulse(cell);
        const isAltar      = cell.type === CELL_TYPE.ALTAR;
        const isHiddenBase = cell.isHiddenBase === true; // vraie base cachée
        // Couleurs : Autel = violet, Base cachée = violet clair, Ruine = doré terne
        let gR, gG, gB;
        if (isAltar)           { gR=160; gG=60;  gB=240; }
        else if (isHiddenBase) { gR=180; gG=80;  gB=255; }
        else                   { gR=160; gG=120; gB=40;  } // Ruine : doré terne
        const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, hexSize * 1.6);
        haloGrad.addColorStop(0,    'rgba('+gR+','+gG+','+gB+','+(0.65*pulse)+')');
        haloGrad.addColorStop(0.35, 'rgba('+gR+','+gG+','+gB+','+(0.35*pulse)+')');
        haloGrad.addColorStop(1,    'rgba('+gR+','+gG+','+gB+',0)');
        ctx.beginPath(); ctx.arc(x, y, hexSize*1.6, 0, Math.PI*2); ctx.fillStyle = haloGrad; ctx.fill();
        this._hexPath(ctx, corners);
        ctx.fillStyle = 'rgba('+gR+','+gG+','+gB+','+(0.40*pulse)+')'; ctx.fill();
        ctx.strokeStyle = 'rgba('+gR+','+gG+','+gB+','+(0.90*pulse)+')'; ctx.lineWidth = 2.0; ctx.stroke();
        ctx.font = (hexSize*0.42)+'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.25 + 0.75*pulse;
        ctx.fillText(isAltar ? '🔮' : (isHiddenBase ? '\u{1F3DB}' : '\u2736'), x, y);
        ctx.globalAlpha = 1;
      }
    }
  }

  _drawDigBar(ctx, x, y, cell) {
    const { hexSize } = this;
    const pct = MathUtils.clamp(cell.currentHP / cell.maxHP, 0, 1);
    const barW = hexSize * 1.4, barH = 5;
    const barX = x - barW/2, barY = y + hexSize*0.75;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.roundRect(barX-1, barY-1, barW+2, barH+2, 3); ctx.fill();
    const r = Math.floor(MathUtils.lerp(40, 220, 1-pct));
    const g = Math.floor(MathUtils.lerp(200, 60, 1-pct));
    ctx.fillStyle = 'rgb('+r+','+g+',40)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW*pct, barH, 2); ctx.fill();
    ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(Math.ceil(cell.currentHP), x, barY+barH+2);
  }

  _drawRevealedCell(ctx, cell, x, y, corners) {
    const { hexSize } = this;
    const colors    = cell.colors;
    const isHovered = cell.key === this.hoveredKey;
    const isSelected= cell.key === this.selectedKey;
    const isField   = cell.type === CELL_TYPE.FIELD;
    const isGrove   = cell.type === CELL_TYPE.GROVE;

    if (cell.revealAnim < 1) {
      cell.revealAnim = Math.min(1, cell.revealAnim + 0.05);
      ctx.globalAlpha = cell.revealAnim;
    }

    const bodyGrad = ctx.createRadialGradient(x, y-hexSize*0.2, 0, x, y, hexSize);
    bodyGrad.addColorStop(0, this._lighten(colors.fill, 20));
    bodyGrad.addColorStop(1, colors.fill);
    ctx.fillStyle = bodyGrad; ctx.fill();

    ctx.strokeStyle = isSelected ? '#f0c040' : isHovered ? '#ffe080' : colors.stroke;
    ctx.lineWidth   = isSelected ? 2 : isHovered ? 2.0 : 0.8;
    ctx.stroke();

    // Overlay FIELD : teinture doree
    if (isField) {
      this._hexPath(ctx, corners);
      ctx.fillStyle = 'rgba(200,240,40,0.14)'; ctx.fill();
      ctx.strokeStyle = 'rgba(160,220,40,0.65)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    // Overlay GROVE : teinture verte
    if (isGrove) {
      this._hexPath(ctx, corners);
      ctx.fillStyle = 'rgba(40,210,60,0.15)'; ctx.fill();
      ctx.strokeStyle = 'rgba(40,200,80,0.65)'; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // Route : bande en bas de la case
    if (cell.hasRoad) this._drawRoadStripe(ctx, x, y, hexSize);

    // Zone d influence scout
    if (this._scoutCell && this._scoutInfluence) {
      var scoutRadius = this._scoutInfluence;
      var dist = HexUtils.hexDistance(this._scoutCell.q, this._scoutCell.r, cell.q, cell.r);
      if (dist > 0 && dist <= scoutRadius) {
        this._hexPath(ctx, corners);
        var alpha = 0.12 - dist * 0.015;
        ctx.fillStyle = 'rgba(100,200,255,' + Math.max(0.03, alpha) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100,200,255,0.35)';
        ctx.lineWidth = 1; ctx.stroke();
      }
    }

    const hasBuilding = !!cell.building;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (!hasBuilding) {
      // Terrain pur : grande icône centrée
      if (cell.hasRoad) {
        // Terrain en fond discret + route au centre
        ctx.font = (hexSize*0.26)+'px serif';
        ctx.globalAlpha = 0.35;
        ctx.fillText(colors.glyph, x, y - hexSize*0.28);
        ctx.globalAlpha = 1;
        ctx.font = (hexSize*0.52)+'px serif';
        ctx.fillText('🛤️', x, y + hexSize*0.08);
      } else {
        ctx.font = (hexSize*0.52)+'px serif';
        ctx.fillText(colors.glyph, x, y);
      }
    } else {
      // Bâtiment : terrain en fond très discret + bâtiment dominant
      ctx.font = (hexSize*0.20)+'px serif';
      ctx.globalAlpha = 0.20;
      ctx.fillText(colors.glyph, x, y - hexSize*0.44);
      ctx.globalAlpha = 1;
      this._drawBuilding(ctx, cell, x, y);
    }

    // Spectre d heritage (post-prestige)
    if (cell.isHeritage && !cell.isRevealed) {
      this._hexPath(ctx, corners);
      ctx.fillStyle = 'rgba(160,100,255,0.08)'; ctx.fill();
      ctx.strokeStyle = 'rgba(160,100,255,0.35)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = (hexSize*0.26)+'px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#c090ff';
      ctx.fillText('👻', x, y);
      ctx.globalAlpha = 1;
    }

    if (isHovered && cell.type !== CELL_TYPE.BASE_MAIN) {
      this._hexPath(ctx, corners);
      ctx.fillStyle = 'rgba(255,255,200,0.10)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,160,0.70)'; ctx.lineWidth = 2.0; ctx.stroke();
    }
    if (isSelected) {
      this._hexPath(ctx, corners);
      ctx.strokeStyle = '#f0c040'; ctx.lineWidth = 2.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  }

  // ── Bande de route en bas de la case ───────────────────
  _drawRoadStripe(ctx, x, y, hexSize) {
    const w = hexSize*0.85, h = 5;
    const rx = x - w/2, ry = y + hexSize*0.52;
    ctx.fillStyle = 'rgba(160,120,50,0.75)';
    ctx.beginPath(); ctx.roundRect(rx, ry, w, h, 2); ctx.fill();
    ctx.setLineDash([3,4]);
    ctx.strokeStyle = 'rgba(255,230,150,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx+3, ry+h/2); ctx.lineTo(rx+w-3, ry+h/2); ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Rendu batiment ──────────────────────────────────────
  _drawBuilding(ctx, cell, x, y) {
    const { hexSize } = this;
    const def = (typeof BUILDINGS !== 'undefined') ? BUILDINGS[cell.building] : null;
    if (!def) return;

    // Icône bâtiment : grande et centrée
    ctx.font = (hexSize*0.54)+'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(def.glyph, x, y + hexSize*0.06);

    // Badge niveau (si > 1) : pilule en bas à droite
    if (cell.buildingLevel > 1) {
      const lvlStr = '' + cell.buildingLevel;
      const bx = x + hexSize*0.38, by = y + hexSize*0.52;
      const pad = 5, r = 7;
      ctx.font = 'bold 10px monospace';
      const tw = ctx.measureText(lvlStr).width;
      const bw = tw + pad*2;
      ctx.fillStyle = '#111028';
      ctx.beginPath(); ctx.roundRect(bx - bw/2, by - r, bw, r*2, r); ctx.fill();
      ctx.strokeStyle = '#7098e0'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#b8d8ff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(lvlStr, bx, by);
    }

    // Indicateur connexion : petit point en bas à gauche
    const pulse  = 0.5 + 0.5 * Math.sin((this._frameNow||0)*0.002 + cell.q*3 + cell.r*5);
    const active = cell.isConnected !== false;
    const dotX = x - hexSize*0.40, dotY = y + hexSize*0.50;
    ctx.fillStyle = active
      ? ('rgba(100,220,100,' + (0.55 + 0.45*pulse) + ')')
      : 'rgba(220,70,70,0.85)';
    ctx.beginPath(); ctx.arc(dotX, dotY, 4, 0, Math.PI*2); ctx.fill();
    if (active) {
      ctx.strokeStyle = 'rgba(140,255,140,' + (0.3*pulse) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(dotX, dotY, 6, 0, Math.PI*2); ctx.stroke();
    }
  }


  // ── Prestige overlay ────────────────────────────────────
  _initPrestigeOverlay() {
    this._prestigeFlash = 0; // 0 = inactif, 1 = plein blanc
    var self = this;
    EventBus.on('prestige:sequence_start', function(d) {
      self._prestigeFlash = 0;
      self._prestigeFlashing = true;
      self._prestigeEther = d.etherGained;
    });
    EventBus.on('prestige:complete', function(d) {
      self._prestigeFlashing = false;
      self._prestigeFlash = 0;
      self._showPrestigeComplete(d);
    });
    EventBus.on('grid:reset', function() {
      // Force re-render
    });
  }

  _drawPrestigeOverlay(ctx, dt) {
    if (!this._prestigeFlashing && this._prestigeFlash <= 0) return;
    if (this._prestigeFlashing) {
      this._prestigeFlash = Math.min(1, this._prestigeFlash + dt * 0.8);
    } else {
      this._prestigeFlash = Math.max(0, this._prestigeFlash - dt * 0.5);
    }
    var a = this._prestigeFlash;
    // Fondu blanc -> doré
    var r = Math.round(255);
    var g = Math.round(200 + 55 * (1 - a));
    var b = Math.round(255 * (1 - a));
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (a * 0.92) + ')';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (a > 0.5) {
      ctx.font = 'bold 28px Cinzel, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(80,30,0,' + ((a - 0.5) * 2) + ')';
      ctx.fillText('✨ RENAISSANCE ✨', this.canvas.width/2, this.canvas.height/2);
      if (this._prestigeEther) {
        ctx.font = '18px Cinzel, serif';
        ctx.fillText('+' + this._prestigeEther + ' ✨ Ether', this.canvas.width/2, this.canvas.height/2 + 40);
      }
    }
  }

  _showPrestigeComplete(d) {
    var el = document.createElement('div');
    el.id = 'prestige-toast';
    el.innerHTML = '✨ Renaissance ! +' + d.etherGained + ' Ether obtenu (' + d.totalEther + ' total)';
    el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#3a1060,#6a20a0);color:#f0c0ff;font-family:Cinzel,serif;font-size:15px;padding:12px 28px;border-radius:8px;border:1px solid #9040d0;z-index:9999;box-shadow:0 4px 20px rgba(140,60,220,.5)';
    document.body.appendChild(el);
    setTimeout(function() { el.style.transition = 'opacity 1s'; el.style.opacity = '0'; }, 3500);
    setTimeout(function() { el.remove(); }, 4600);
  }

  _bindScoutEvents() {
    var self = this;
    EventBus.on('scout:select', function(d) {
      self._scoutCell = d.cell;
      if (d.cell && typeof ScoutManager !== 'undefined') {
        self._scoutInfluence = ScoutManager.getStats(d.cell.buildingLevel).radius;
      }
    });
    EventBus.on('scout:deselect', function() {
      self._scoutCell = null; self._scoutInfluence = null;
    });
    EventBus.on('building:upgraded', function(d) {
      if (self._scoutCell && d.cell && d.cell.key === self._scoutCell.key) {
        self._scoutInfluence = ScoutManager.getStats(d.cell.buildingLevel).radius;
      }
    });
  }

  _minDistToRevealed(cell) {
    // Retourne la distance min entre cette case et la plus proche case révélée
    let min = 999;
    const cells = this.grid.cells;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].isRevealed) {
        const d = HexUtils.hexDistance(cell.q, cell.r, cells[i].q, cells[i].r);
        if (d < min) min = d;
        if (min <= 1) return min; // Court-circuit
      }
    }
    return min;
  }

  _computePulse(cell) {
    const CYCLE_MS = 3000;
    const raw = Math.abs(cell.q)*7 + Math.abs(cell.r)*13 + cell.q*3 + cell.r*5;
    const phaseOffset = (((raw%100)+100)%100)/100;
    const t = (((this._frameNow||performance.now())/CYCLE_MS)+phaseOffset)%1.0;
    return t < 0.5 ? t*2.0 : (1.0-t)*2.0;
  }

  _hexPath(ctx, corners) {
    ctx.beginPath(); ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 6; i++) ctx.lineTo(corners[i].x, corners[i].y);
    ctx.closePath();
  }

  _lighten(hex, amount) {
    const num = parseInt(hex.replace('#',''), 16);
    return 'rgb('+Math.min(255,(num>>16)+amount)+','+Math.min(255,((num>>8)&0xff)+amount)+','+Math.min(255,(num&0xff)+amount)+')';
  }

  // ── Tooltip HTML sur les hexagones ────────────────────────
  _initTooltip() {
    this._talentManager = null; // set by GameLoop after init
    this._ttEl = document.getElementById('hex-tooltip');
    if (!this._ttEl) {
      this._ttEl = document.createElement('div');
      this._ttEl.id = 'hex-tooltip';
      document.body.appendChild(this._ttEl);
    }
    this._ttKey   = null;
    this._ttTimer = null;
  }

  _showTooltip(cell, cx, cy) {
    if (!this._ttEl) return;
    if (this._ttKey === cell.key) return;
    this._ttKey = cell.key;
    clearTimeout(this._ttTimer);
    this._ttTimer = setTimeout(() => {
      if (this._ttKey !== cell.key) return;

      // Icônes et couleurs par ressource
      const RES = {
        drachmes: { icon:'🪙', color:'#f0c040' },
        bois:     { icon:'🪵', color:'#8ab840' },
        nourr:    { icon:'🌾', color:'#60c060' },
        fer:      { icon:'⚙️', color:'#80b8e0' },
        ether:    { icon:'✨', color:'#c080f0' },
        habitants:{ icon:'👥', color:'#f0a060' },
        nectar:   { icon:'🍯', color:'#e8b840' },
        bronze:   { icon:'🟫', color:'#c08040' },
        acier:    { icon:'🔩', color:'#90b8d0' },
        farine:   { icon:'🌾', color:'#e0d080' },
        foudre:   { icon:'⚡', color:'#f0e040' },
        orichalque:{ icon:'🌟', color:'#e0b820' },
        metal_divin:{ icon:'⚙️', color:'#d0d0ff' },
        amrita:   { icon:'💎', color:'#80e8e0' },
      };
      const TERRAIN_NAMES = {
        plain:'Plaine', mountain:'Montagne', forest:'Forêt', river:'Rivière',
        field:'Champ cultivé', grove:'Bosquet', mud:'Vase Marécageuse',
        rubble:'Décombres', tunnel:'Tunnel', base_main:'Base Principale',
        base:'Avant-poste', altar:'Autel Mystique',
      };
      const TERRAIN_GLYPHS = {
        plain:'🌿',mountain:'⛰️',forest:'🌲',river:'🌊',field:'🌾',
        grove:'🍀',mud:'🟫',rubble:'🪨',tunnel:'🛤️',base_main:'⚔️',
        base:'🏚️',altar:'🔮',
      };
      const TERRAIN_DESC = {
        plain:'Terrain constructible. Convient à la plupart des bâtiments.',
        mountain:'Terrain rocheux. Mines de Cuivre et de Fer uniquement.',
        forest:'Forêt dense. Exploitée par les bûcherons adjacents.',
        river:'Cours d\'eau. Non constructible. Peut être drainée.',
        field:'Champ cultivé. Alimenté par une Ferme adjacente.',
        grove:'Bosquet. Non constructible.',
        mud:'Vase résiduelle. Produit Ambroisie et Bois passif. +clic.',
        rubble:'Décombres. Produit Fer et Bois passif. +clic.',
        tunnel:'Tunnel. Seul passage en montagne — route constructible.',
        base_main:'Votre camp de base. Centre du réseau routier.',
        base:'Ruines Antiques. Améliorable jusqu\'au niveau 5.',
        altar:'Autel du Prestige. Fouiller pour déclencher la Renaissance.',
      };

      const def = (typeof BUILDINGS !== 'undefined' && cell.building) ? BUILDINGS[cell.building] : null;

      // ─── CAS : CASE CACHEE ───────────────────────────
      if (cell.isHidden) {
        this._ttEl.innerHTML =
          '<div class="ht-head"><span class="ht-icon">🌫️</span>' +
          '<span class="ht-name">Zone Inconnue</span></div>' +
          '<div class="ht-section">' +
          '<div class="ht-dig-bar"><div class="ht-dig-fill" style="width:' +
          Math.round((1 - cell.currentHP/cell.maxHP)*100) + '%"></div></div>' +
          '<div class="ht-dig-label">Résistance ' + Math.ceil(cell.currentHP) + ' / ' + cell.maxHP + '</div>' +
          '</div>';
        this._positionTooltip(cx, cy);
        return;
      }

      // ─── CAS : BATIMENT ──────────────────────────────
      if (def) {
        const lvl = cell.buildingLevel;
        const maxLvl = (def.maxLevel || 50) +
          (this._talentManager ? (this._talentManager.getBonusMaxLevel(def.id)||0) : 0);
        const pct = Math.round(((lvl-1)/Math.max(1,maxLvl-1))*100);
        const connected = cell.isConnected !== false;
        const eraLabel = def.era > 1
          ? '<span class="ht-era-tag">Ère ' + def.era + '</span>' : '';

        // Section connexion + niveau
        let statusHtml =
          '<div class="ht-status">' +
          (connected
            ? '<span class="ht-conn ok"><span class="ht-dot ok"></span>Connecté</span>'
            : '<span class="ht-conn ko"><span class="ht-dot ko"></span>Sans route — production 0</span>') +
          (cell.hasRoad ? '<span class="ht-road">🛤️ Route</span>' : '') +
          '</div>';

        // Barre de niveau
        let levelHtml =
          '<div class="ht-lvl-row">' +
          '<span class="ht-lvl-label">Niv. ' + lvl + ' / ' + maxLvl + '</span>' +
          '<div class="ht-lvl-bar"><div class="ht-lvl-fill" style="width:' + pct + '%"></div></div>' +
          '</div>';

        // Production
        let prodHtml = '';
        const multProd = 1 + (lvl-1)*0.12;
        if (def.baseProdPerField || def.baseProdPerSupport) {
          const isWood = ['lumber','halle','bosquet'].includes(def.id);
          const supportType = isWood ? 'forêts' : 'champs';
          const baseVal = (def.baseProdPerField||def.baseProdPerSupport||1);
          const resKey  = isWood ? 'bois' : 'nourr';
          const rc      = RES[resKey] || {};
          prodHtml += '<div class="ht-prod-row">' +
            '<span class="ht-res-icon">' + (rc.icon||resKey) + '</span>' +
            '<span class="ht-res-val" style="color:' + (rc.color||'#fff') + '">' +
            (baseVal * multProd).toFixed(1) + '/s</span>' +
            '<span class="ht-res-note">par ' + supportType + ' adj.</span>' +
            '</div>';
        }
        if (def.produces) {
          Object.entries(def.produces).forEach(function(e) {
            const rc = RES[e[0]] || {};
            prodHtml += '<div class="ht-prod-row">' +
              '<span class="ht-res-icon">' + (rc.icon||e[0]) + '</span>' +
              '<span class="ht-res-val" style="color:' + (rc.color||'#fff') + '">' +
              (e[1]*multProd).toFixed(2) + '/s</span>' +
              '</div>';
          });
        }
        if (def.consumes) {
          Object.entries(def.consumes).forEach(function(e) {
            const rc = RES[e[0]] || {};
            prodHtml += '<div class="ht-prod-row consumes">' +
              '<span class="ht-res-icon">' + (rc.icon||e[0]) + '</span>' +
              '<span class="ht-res-val" style="color:#e08080">-' +
              (e[1]*multProd).toFixed(2) + '/s</span>' +
              '</div>';
          });
        }

        // Coût d'amélioration
        let upgHtml = '';
        if (lvl < maxLvl) {
          const upgMult = 1 + lvl*0.3;
          const upgCost = {};
          Object.entries(def.upgradeCostBase||{}).forEach(function(e){
            if(e[1]>0) upgCost[e[0]] = Math.floor(e[1]*upgMult);
          });
          if (Object.keys(upgCost).length === 0) upgCost.drachmes = Math.floor(30*upgMult);
          upgHtml = '<div class="ht-section ht-upg">' +
            '<div class="ht-section-title">⬆ Améliorer → Niv.' + (lvl+1) + '</div>' +
            '<div class="ht-cost-row">' +
            Object.entries(upgCost).map(function(e){
              const rc = RES[e[0]]||{};
              return '<span class="ht-cost-item">' +
                '<span class="ht-res-icon">' + (rc.icon||e[0]) + '</span>' +
                '<span style="color:' + (rc.color||'#ccc') + '">' + e[1] + '</span>' +
                '</span>';
            }).join('') +
            '</div></div>';
        } else {
          upgHtml = '<div class="ht-section ht-max">⭐ Niveau Maximum</div>';
        }

        this._ttEl.innerHTML =
          '<div class="ht-head">' +
          '<span class="ht-icon-lg">' + def.glyph + '</span>' +
          '<div class="ht-head-info">' +
          '<div class="ht-name">' + def.name + ' ' + eraLabel + '</div>' +
          '<div class="ht-desc">' + def.description + '</div>' +
          '</div></div>' +
          statusHtml + levelHtml +
          (prodHtml ? '<div class="ht-section"><div class="ht-section-title">Production</div>' +
            '<div class="ht-prod-grid">' + prodHtml + '</div></div>' : '') +
          upgHtml;

      // ─── CAS : TERRAIN VIDE ──────────────────────────
      } else {
        const tGlyph = TERRAIN_GLYPHS[cell.type] || '❓';
        const tName  = TERRAIN_NAMES[cell.type]  || cell.type;
        const tDesc  = TERRAIN_DESC[cell.type]   || '';

        // Quels bâtiments sont disponibles sur ce terrain ?
        const available = (typeof BuildingManager !== 'undefined')
          ? BuildingManager.getBuildingsForTerrain(cell.type).slice(0, 6)
          : [];
        let bldHtml = '';
        if (available.length > 0) {
          bldHtml = '<div class="ht-section">' +
            '<div class="ht-section-title">🏗 Constructible</div>' +
            '<div class="ht-bld-grid">' +
            available.map(function(b) {
              return '<div class="ht-bld-item">' +
                '<span class="ht-bld-icon">' + b.glyph + '</span>' +
                '<span class="ht-bld-name">' + b.name + '</span>' +
                '<span class="ht-bld-cost">' +
                Object.entries(b.buildCost).slice(0,3).map(function(e){
                  const rc = RES[e[0]]||{};
                  return '<span class="ht-cost-item">' +
                    (rc.icon||e[0]) + '<span style="color:' + (rc.color||'#ccc') + '">' + e[1] + '</span>' +
                    '</span>';
                }).join('') +
                '</span></div>';
            }).join('') +
            '</div></div>';
        }
        let roadHtml = cell.hasRoad
          ? '<div class="ht-terrain-badge">🛤️ Route présente</div>'
          : '';

        this._ttEl.innerHTML =
          '<div class="ht-head">' +
          '<span class="ht-icon-lg">' + tGlyph + '</span>' +
          '<div class="ht-head-info">' +
          '<div class="ht-name">' + tName + '</div>' +
          (tDesc ? '<div class="ht-desc">' + tDesc + '</div>' : '') +
          '</div></div>' +
          roadHtml + bldHtml;
      }

      this._positionTooltip(cx, cy);
    }, 140);
  }

  _positionTooltip(cx, cy) {
    this._ttEl.className = 'hex-tooltip visible';
    const tw = this._ttEl.offsetWidth  || 240;
    const th = this._ttEl.offsetHeight || 100;
    let tx = cx - tw/2, ty = cy - th - 20;
    if (tx < 6) tx = 6;
    if (tx + tw > window.innerWidth - 6) tx = window.innerWidth - tw - 6;
    if (ty < 6) ty = cy + 28;
    this._ttEl.style.left = tx + 'px';
    this._ttEl.style.top  = ty + 'px';
  }

  _hideTooltip() {
    clearTimeout(this._ttTimer);
    this._ttKey = null;
    if (this._ttEl) this._ttEl.className = 'hex-tooltip';
  }

  _bindHover() {
    this.canvas.addEventListener('mousemove', e => {
      const { x: _hx, y: _hy } = this._clientToCanvas(e.clientX, e.clientY);
      const world = this.camera.screenToWorld(_hx, _hy);
      const { q, r } = HexUtils.pixelToHex(world.x, world.y, this.hexSize);
      const key = HexUtils.hexKey(q, r);
      if (key !== this.hoveredKey) {
        this.hoveredKey = key;
        EventBus.emit('cell:hover', { cell: this.grid.getCellByKey(key), screenX: e.clientX, screenY: e.clientY });
      }
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredKey = null; this._hideTooltip(); EventBus.emit('cell:hover', { cell: null });
    });
  }

  _bindClick() {
    let _t0=0, _x0=0, _y0=0;
    // Evite le double-fire touchend+mouseup sur appareils hybrides
    let _lastTouch = 0;
    this.canvas.addEventListener('mousedown', e => { _t0=Date.now(); _x0=e.clientX; _y0=e.clientY; });
    this.canvas.addEventListener('mouseup', e => {
      if (Date.now() - _lastTouch < 500) return; // ignore mouseup apres touchend
      if (Date.now()-_t0 < 300 && Math.hypot(e.clientX-_x0, e.clientY-_y0) < 8) {
        const { x: _mx, y: _my } = this._clientToCanvas(e.clientX, e.clientY);
        const world = this.camera.screenToWorld(_mx, _my);
        const { q, r } = HexUtils.pixelToHex(world.x, world.y, this.hexSize);
        const cell = this.grid.getCell(q, r);
        if (cell) {
          this.selectedKey = cell.isHidden ? null : cell.key;
          EventBus.emit('cell:click', { cell, screenX: e.clientX, screenY: e.clientY });
        } else {
          // Clic dans le vide -> ferme le slider
          this.selectedKey = null;
          EventBus.emit('cell:click', { cell: null });
        }
      }
    });
    this.canvas.addEventListener('touchend', e => {
      _lastTouch = Date.now();
      if (e.changedTouches.length !== 1) return;

      // Bloquer le tap fantôme qui suit un pinch-to-zoom (300ms de grâce)
      if (this.camera._pinchEndTime && Date.now() - this.camera._pinchEndTime < 300) return;

      const t = e.changedTouches[0];
      const { x: _tx, y: _ty } = this._clientToCanvas(t.clientX, t.clientY);
      const world = this.camera.screenToWorld(_tx, _ty);
      const { q, r } = HexUtils.pixelToHex(world.x, world.y, this.hexSize);
      const cell = this.grid.getCell(q, r);
      if (cell) {
        // Bonus clic sur Vase marecageuse
        if (!cell.isHidden && cell.type === CELL_TYPE.MUD) {
          EventBus.emit('mud:click', { cell, screenX: t.clientX, screenY: t.clientY });
        }
        // Bonus clic sur Decombres
        if (!cell.isHidden && cell.type === CELL_TYPE.RUBBLE) {
          EventBus.emit('rubble:click', { cell, screenX: t.clientX, screenY: t.clientY });
        }
        this.selectedKey = cell.isHidden ? null : cell.key;
        EventBus.emit('cell:click', { cell, screenX: t.clientX, screenY: t.clientY });
      } else {
        this.selectedKey = null;
        EventBus.emit('cell:click', { cell: null });
      }
    });

  }

  resize(w, h) { this.canvas.width = w; this.canvas.height = h; }
}
