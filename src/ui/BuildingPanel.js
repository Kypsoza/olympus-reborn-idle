/* BuildingPanel.js — v0.6.0
   Drawer coulissant en bas de l'ecran (remplace le tooltip flottant)
*/

class BuildingPanel {
  constructor(bm, rm, tm, pm, zm) {
    this.bm = bm; this.rm = rm; this.tm = tm; this.pm_pan = pm; this.pan = pm; this.zm = zm;
    this.currentCell = null;
    this._createDrawer();
    this._createTalentPanel();
    this._bindEvents();
  }

  // ── Drawer principal ────────────────────────────────────
  _createDrawer() {
    this.drawer = document.createElement('div');
    this.drawer.id = 'bp-drawer';
    this.drawer.className = 'bp-drawer-closed';
    this.drawer.innerHTML =
      '<div class="bp-drag-handle"></div>' +
      '<div class="bp-drawer-header">' +
        '<span class="bp-drawer-title" id="bp-title">Case</span>' +
        '<button class="bp-drawer-close" id="bp-close">\u2715</button>' +
      '</div>' +
      '<div class="bp-drawer-body" id="bp-body"></div>';
    document.body.appendChild(this.drawer);
    document.getElementById('bp-close').addEventListener('click', () => this.hide());
    // Délégation unique — remplace tous les listeners posés individuellement
    var self2 = this;
    document.getElementById('bp-body').addEventListener('click', function(e) { self2._handleBodyClick(e); });
  }

  _createTalentPanel() {
    this.talentPanel = document.createElement('div');
    this.talentPanel.id = 'talent-panel';
    this.talentPanel.className = 'talent-panel hidden';
    // Modal wrapper inside the overlay
    this.talentPanel.innerHTML =
      '<div id="tp-modal">' +
        '<div class="tp-header">' +
          '<span class="tp-title">⚡ Olympus — Talents</span>' +
          '<div class="tp-tab-bar">' +
            '<button class="tp-tab-btn tp-tab-active" data-tp="drachmes">🪙 Drachmes</button>' +
            '<button class="tp-tab-btn" data-tp="ether">✨ Éther</button>' +
            '<button class="tp-tab-btn" data-tp="codex">📖 Codex</button>' +
            '<button class="tp-tab-btn" data-tp="pantheon">🏛️ Panthéon</button>' +
            '<button class="tp-tab-btn" data-tp="zones">🗺️ Zones</button>' +
          '</div>' +
          '<button class="tp-close" id="tp-close">✕</button>' +
        '</div>' +
        '<div id="tp-era-bar"></div>' +
        '<div class="tp-body" id="tp-body"></div>' +
      '</div>';
    document.body.appendChild(this.talentPanel);
    document.getElementById('tp-close').addEventListener('click', () => this.hideTalents());

    // Click outside modal closes it
    var self = this;
    this.talentPanel.addEventListener('click', function(e) {
      if (e.target === self.talentPanel) self.hideTalents();
    });

    // Tab switching
    this.talentPanel.addEventListener('click', function(e) {
      var tb = e.target.closest('.tp-tab-btn');
      if (!tb) return;
      self.talentPanel.querySelectorAll('.tp-tab-btn').forEach(function(b){ b.classList.remove('tp-tab-active'); });
      tb.classList.add('tp-tab-active');
      self._tpActiveTab = tb.dataset.tp;
      self._renderTalents();
    });

    var btn = document.getElementById('btn-talents');
    if (btn) btn.addEventListener('click', () => this.toggleTalents());
  }

  open(cell) {
    this.currentCell = cell;
    document.getElementById('bp-title').textContent = cell.displayName + (cell.hasRoad ? ' 🛤️' : '');
    var body = document.getElementById('bp-body'); body.innerHTML = '';
    if      (cell.isHidden)                      this._renderDigUI(cell, body);
    else if (cell.type === CELL_TYPE.BASE_MAIN)   this._renderBaseUI(cell, body);
    else if (cell.type === CELL_TYPE.BASE)         this._renderBaseHiddenUI(cell, body);
    else if (cell.type === CELL_TYPE.ALTAR)        this._renderAltarUI(cell, body);
    else if (cell.type === CELL_TYPE.MUD)          this._renderMudUI(cell, body);
    else if (cell.type === CELL_TYPE.RUBBLE)       this._renderRubbleUI(cell, body);
    else if (cell.type === CELL_TYPE.TUNNEL)       this._renderTunnelUI(cell, body);
    else if (cell.building)                        this._renderBuildingUI(cell, body);
    else                                           this._renderEmptyUI(cell, body);
    this.drawer.classList.remove('bp-drawer-closed');
    this.drawer.classList.add('bp-drawer-open');
  }

  hide() {
    this.drawer.classList.remove('bp-drawer-open');
    this.drawer.classList.add('bp-drawer-closed');
    this.currentCell = null;
    EventBus.emit('scout:deselect', {});
  }

  // Délégation de clics sur le bp-body (upgrade/demolish/base-upgrade)
  _handleBodyClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var act  = btn.dataset.action;
    var cell = this.currentCell;
    if (!cell) return;
    var sx = window.innerWidth / 2, sy = window.innerHeight / 2;
    if (act === 'upgrade') {
      if (this.bm.upgrade(cell, sx, sy)) { this.refresh(); }
    } else if (act === 'demolish') {
      if (this.bm.demolish(cell, sx, sy)) { this.currentCell = null; this.hide(); }
    } else if (act === 'base-upgrade') {
      var pm = window.game && window.game.prestigeManager;
      if (pm && pm.upgradeBase(cell, sx, sy)) { this.refresh(); }
    }
  }

  refresh() {
    if (!this.currentCell) return;
    // Debounce: fusionne les refreshes rapprochés
    if (this._refreshPending) return;
    this._refreshPending = true;
    Promise.resolve().then(() => {
      this._refreshPending = false;
      if (this.currentCell) this.open(this.currentCell);
    });
  }

  toggleTalents() { this.talentPanel.classList.contains('hidden') ? this.showTalents() : this.hideTalents(); }
  showTalents()   { this._renderTalents(); this.talentPanel.classList.remove('hidden'); }
  hideTalents()   { this.talentPanel.classList.add('hidden'); }

  // ── Talents ─────────────────────────────────────────────
  _renderTalents() {
    var self = this;
    var tab  = this._tpActiveTab || 'drachmes';
    var el   = document.getElementById('tp-body');
    var eraBar = document.getElementById('tp-era-bar');

    // ── Barre d'ère active (toujours visible) ──
    if (eraBar) {
      var era      = this.tm.getUnlockedEra ? this.tm.getUnlockedEra() : 1;
      var eraNames = ['','🏛️ Ère 1 — Archaïque','🏺 Ère 2 — Classique','🌟 Ère 3 — Divine'];
      var eraColors= ['','#a09060','#60a8c8','#c080f0'];
      var etherRaw = this.rm ? this.rm.get('ether') : 0;
      var etherAmt = etherRaw >= 1e6 ? (etherRaw/1e6).toFixed(1)+'M' :
                     etherRaw >= 1e4 ? (etherRaw/1e3).toFixed(1)+'k' :
                     Math.floor(etherRaw).toString();
      eraBar.innerHTML =
        '<div class="tp-era-status">' +
          '<span class="tp-era-badge" style="background:rgba(0,0,0,.3);border-color:'+eraColors[era]+';color:'+eraColors[era]+'">'+eraNames[era]+'</span>' +
          '<span class="tp-ether-count">✨ '+etherAmt+' Éther</span>' +
        '</div>';
    }

    if (tab === 'drachmes') {
      this._renderDrachmeTree(el);
    } else if (tab === 'ether') {
      this._renderEtherTree(el);
    } else if (tab === 'codex') {
      this._renderCodexTab(el);
    } else if (tab === 'pantheon') {
      this._renderPantheonTab(el);
    } else if (tab === 'zones') {
      this._renderZonesTab(el);
    }
  }

  _renderDrachmeTree(el) {
    var self = this;

    // ── Sous-onglets par catégorie ───────────────────────
    var BRANCH_CATEGORIES = [
      { id:'agriculture',  label:'Agriculture',  icon:'🌾' },
      { id:'sylviculture', label:'Sylviculture',  icon:'🌲' },
      { id:'metallurgie',  label:'Métallurgie',   icon:'⛏️' },
      { id:'siderurgie',   label:'Sidérurgie',    icon:'⚙️' },
      { id:'population',   label:'Population',    icon:'👥' },
      { id:'ingenierie',   label:'Ingénierie',    icon:'🏛️' },
    ];

    if (!self._drachtab) self._drachtab = 'agriculture';
    var activeCat = self._drachtab;

    // Barre de sous-onglets
    var tabBar = '<div class="dt-sub-tabs">';
    BRANCH_CATEGORIES.forEach(function(cat) {
      var active = cat.id === activeCat ? ' dt-sub-active' : '';
      tabBar += '<button class="dt-sub-btn' + active + '" data-cat="' + cat.id + '">' +
        '<span class="dt-sub-icon">' + cat.icon + '</span>' +
        '<span class="dt-sub-label">' + cat.label + '</span>' +
        '</button>';
    });
    tabBar += '</div>';

    el.innerHTML = tabBar + '<div id="dt-content"></div>';

    // Listener sous-onglets
    el.querySelector('.dt-sub-tabs').addEventListener('click', function(e) {
      var btn = e.target.closest('.dt-sub-btn');
      if (!btn) return;
      self._drachtab = btn.dataset.cat;
      self._renderDrachmeTree(el);
    });

    // Render la branche active
    var contentEl = document.getElementById('dt-content');
    self._renderDrachBranch(contentEl, activeCat);
  }

  _renderDrachBranch(el, branchId) {
    var self = this;

    var branches = self.tm.getBranchData().filter(function(b) { return b.id === branchId; });
    if (!branches.length) {
      el.innerHTML = '<div style="padding:24px;color:#888;text-align:center">Branche inconnue.</div>';
      return;
    }
    var b = branches[0];

    var COL_W = 200;
    var R     = 36;
    var SUB   = 50;
    var NODE_Y = [100, 210, 320, 430];
    var ncols  = b.cols.length;
    var VW     = Math.max(ncols * COL_W * 2, 320);
    var VH     = 520;

    /* Positions */
    var NODE_POS = {};
    var EDGES    = [];
    var cxBase   = VW / 2;

    b.cols.forEach(function(col, ci) {
      var sx;
      if (ncols === 1) {
        sx = cxBase;
      } else {
        sx = cxBase + (ci === 0 ? -SUB - COL_W/4 : SUB + COL_W/4);
      }
      col.forEach(function(id, ri) {
        NODE_POS[id] = {
          x: sx,
          y: NODE_Y[ri] || (NODE_Y[NODE_Y.length-1] + (ri - NODE_Y.length + 1) * 110),
          branchColor: b.color,
          branchLabel: b.label,
          branchIcon:  b.icon,
          branchId:    b.id
        };
        var def = self.tm.getTalentDef(id);
        if (def && def.requires) def.requires.forEach(function(req) {
          if (NODE_POS[req] !== undefined || b.cols.some(function(c){ return c.includes(req); }))
            EDGES.push([req, id]);
        });
      });
    });

    function getState(id) {
      if (self.tm.learned[id]) return 'learned';
      return self.tm.canLearn(id).ok ? 'available' : 'locked';
    }
    function fmtV(v) { return v >= 1000 ? (v/1000).toFixed(0)+'k' : ''+v; }
    function fmtCost(cost) {
      var icons = { drachmes:'🪙', bois:'🪵', nourr:'🌾', fer:'⚙️' };
      return Object.entries(cost).map(function(e) {
        return fmtV(e[1]) + (icons[e[0]] || e[0]);
      }).join('  ');
    }

    // Colonne labels
    var colLabelsSVG = '';
    if (b.colLabels) {
      b.colLabels.forEach(function(lbl, ci) {
        var cx;
        if (ncols === 1) cx = cxBase;
        else cx = cxBase + (ci === 0 ? -SUB - COL_W/4 : SUB + COL_W/4);
        colLabelsSVG += '<text x="' + cx + '" y="50" text-anchor="middle" ' +
          'font-family="Cinzel,serif" font-size="12" fill="rgba(200,149,26,0.5)" letter-spacing="0.08em">' +
          lbl + '</text>';
      });
    }

    var RUNE_CHARS = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
    // RUNE_DATA[i] = {x,y,sz,phase,isOrange}  — précalculées 1x puis réutilisées
    var RUNE_DATA = (function() {
      var d = [];
      for (var i = 0; i < 22; i++) {
        d.push({
          x:  10 + (i * 137.5) % (VW - 20),
          y:  20 + (i * 73.1)  % (VH - 30),
          sz: 18 + (i % 4) * 5,
          phase: (i / 22),      // 0..1, décalage de phase
          isOrange: i % 3 === 0 // 1/3 orange, 2/3 violet
        });
      }
      return d;
    })();
    var _dtRuneRAF = null;
    var CYCLE_MS = 3000; // identique à MapRenderer._computePulse
    function buildRuneBg(w, h, count) {
      // Génère les éléments SVG avec data-rune-idx pour animation JS
      var s = '';
      RUNE_DATA.forEach(function(d, i) {
        s += '<text class="dt-rune" data-ri="' + i + '"'
          + ' x="' + d.x.toFixed(0) + '" y="' + d.y.toFixed(0) + '"'
          + ' font-size="' + d.sz + '" font-family="serif"'
          + ' fill="rgba(160,60,240,0.04)"'
          + ' style="pointer-events:none;user-select:none">'
          + RUNE_CHARS[i % RUNE_CHARS.length] + '</text>';
      });
      return s;
    }
    function startRuneAnim(svgEl) {
      if (_dtRuneRAF) cancelAnimationFrame(_dtRuneRAF);
      var runes = svgEl ? Array.from(svgEl.querySelectorAll('.dt-rune')) : [];
      function step() {
        var now = performance.now();
        runes.forEach(function(el, i) {
          var d = RUNE_DATA[i]; if (!d) return;
          var t = ((now / CYCLE_MS) + d.phase) % 1.0;
          var pulse = t < 0.5 ? t * 2.0 : (1.0 - t) * 2.0; // triangle wave
          var op, fill;
          if (d.isOrange) {
            op   = 0.04 + pulse * 0.18;
            fill = 'rgba(255,140,40,' + op.toFixed(3) + ')';
          } else {
            op   = 0.03 + pulse * 0.14;
            fill = 'rgba(160,60,240,' + op.toFixed(3) + ')';
          }
          el.setAttribute('fill', fill);
        });
        _dtRuneRAF = requestAnimationFrame(step);
      }
      _dtRuneRAF = requestAnimationFrame(step);
    }
    function stopRuneAnim() { if (_dtRuneRAF) { cancelAnimationFrame(_dtRuneRAF); _dtRuneRAF = null; } }

    var _dtSelected = null;
    function buildSVG() {
      var s = '<svg id="dt-svg" xmlns="http://www.w3.org/2000/svg"'
        + ' width="' + VW + '" height="' + VH + '"'
        + ' style="display:block;overflow:visible">';
      s += '<defs>'
        + '<filter id="dt-gd" x="-80%" y="-80%" width="260%" height="260%">'
        + '<feGaussianBlur stdDeviation="6" result="b"/>'
        + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
        + '<filter id="dt-ga" x="-60%" y="-60%" width="220%" height="220%">'
        + '<feGaussianBlur stdDeviation="3" result="b"/>'
        + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
        + '</defs>';
      // ── Fond dynamique par branche — thème mythologique unique ──
      var BRANCH_BG = {
        'production':    { grad: ['#1a2e0a','#142208','#0e1805'], accent: 'rgba(100,200,60,0.14)', decos: ['🌾','🪵','⚙️','🌿','🏺','⚱️','🌊','☀️'] },
        'construction':  { grad: ['#2e1a08','#221408','#181005'], accent: 'rgba(200,140,60,0.14)', decos: ['🏛️','⚒️','🪨','🏺','🏗️','🗿','⚔️','🛡️'] },
        'expansion':     { grad: ['#08162e','#081022','#060c18'], accent: 'rgba(60,130,220,0.14)', decos: ['🗺️','🧭','⚓','🌊','🦅','⛵','🔭','🌍'] },
        'prestige_econ': { grad: ['#2e2308','#221a05','#181205'], accent: 'rgba(220,180,40,0.18)', decos: ['🪙','💰','🏆','👑','📜','⚖️','🏺','💎'] },
        'social':        { grad: ['#28082e','#1e0622','#160418'], accent: 'rgba(180,80,220,0.14)', decos: ['🏛️','📚','🎭','🎨','🌹','💫','🦉','📿'] },
        'divine_econ':   { grad: ['#1a0808','#120505','#0e0303'], accent: 'rgba(220,60,60,0.12)', decos: ['⚡','🔥','💀','👁️','🌙','⭐','🔱','🦅'] },
      };
      var bbg = BRANCH_BG[b.id] || BRANCH_BG['production'];
      s += '<defs>'
        + '<linearGradient id="dtbg" x1="0%" y1="0%" x2="100%" y2="100%">'
        + '<stop offset="0%"   stop-color="' + bbg.grad[0] + '"/>'
        + '<stop offset="50%"  stop-color="' + bbg.grad[1] + '"/>'
        + '<stop offset="100%" stop-color="' + bbg.grad[2] + '"/>'
        + '</linearGradient>'
        + '<radialGradient id="dtglow" cx="50%" cy="50%" r="60%">'
        + '<stop offset="0%"  stop-color="' + bbg.accent + '"/>'
        + '<stop offset="100%" stop-color="rgba(0,0,0,0)"/>'
        + '</radialGradient>'
        + '</defs>';
      s += '<rect width="' + VW + '" height="' + VH + '" fill="url(#dtbg)"/>';
      s += '<rect width="' + VW + '" height="' + VH + '" fill="url(#dtglow)"/>';
      // Veines de marbre / texture
      var MARBLE = [[0,VH*0.25,VW*0.3,VH*0.2,VW*0.7,VH*0.28,VW,VH*0.22],
                    [0,VH*0.6,VW*0.4,VH*0.55,VW*0.6,VH*0.65,VW,VH*0.58],
                    [VW*0.2,0,VW*0.22,VH*0.4,VW*0.18,VH*0.7,VW*0.21,VH]];
      MARBLE.forEach(function(m) {
        s += '<path d="M'+m[0]+','+m[1]+' C'+m[2]+','+m[3]+' '+m[4]+','+m[5]+' '+m[6]+','+m[7]+'"'
          + ' fill="none" stroke="rgba(210,170,80,0.08)" stroke-width="2"/>';
      });
      // Méandre grec double
      s += '<rect x="3" y="3" width="'+(VW-6)+'" height="'+(VH-6)+'" fill="none" stroke="rgba(200,149,26,0.30)" stroke-width="2" rx="3"/>';
      s += '<rect x="8" y="8" width="'+(VW-16)+'" height="'+(VH-16)+'" fill="none" stroke="rgba(200,149,26,0.12)" stroke-width="1" rx="2" stroke-dasharray="8,4"/>';
      // Colonnes doriques
      [0, VW-22].forEach(function(cx) {
        s += '<rect x="'+cx+'" y="0" width="22" height="'+VH+'" fill="rgba(200,160,60,0.06)"/>';
        s += '<rect x="'+(cx+2)+'" y="0" width="1" height="'+VH+'" fill="rgba(200,160,60,0.12)"/>';
        s += '<rect x="'+(cx+20)+'" y="0" width="1" height="'+VH+'" fill="rgba(200,160,60,0.12)"/>';
        for (var fy=0; fy<VH; fy+=40)
          s += '<line x1="'+cx+'" y1="'+fy+'" x2="'+(cx+22)+'" y2="'+fy+'" stroke="rgba(200,160,60,0.05)" stroke-width="1"/>';
      });
      // Icones décoratifs de la branche
      for (var di=0; di<10; di++) {
        var ddx = 28 + (di*151.3)%(VW-56), ddy = 30 + (di*97.7)%(VH-50);
        s += '<text x="'+ddx+'" y="'+ddy+'" font-size="26" text-anchor="middle" opacity="0.12" style="pointer-events:none">' + bbg.decos[di%bbg.decos.length] + '</text>';
      }
      // Frise bas
      s += '<line x1="0" y1="'+(VH-28)+'" x2="'+VW+'" y2="'+(VH-28)+'" stroke="rgba(200,149,26,0.20)" stroke-width="1"/>';
      s += buildRuneBg(VW, VH, 22);

      // Col separator line
      if (ncols > 1) {
        s += '<line x1="' + cxBase + '" y1="60" x2="' + cxBase + '" y2="' + (VH-20) + '"'
          + ' stroke="rgba(200,149,26,0.12)" stroke-width="1" stroke-dasharray="4,6"/>';
      }
      s += colLabelsSVG;

      // Branch header
      s += '<text x="' + (VW/2) + '" y="24" text-anchor="middle" font-family="Cinzel,serif" font-size="15"'
        + ' font-weight="700" fill="' + b.color + '" letter-spacing="0.06em">'
        + b.icon + ' ' + b.label + '</text>';

      // Edges
      EDGES.forEach(function(e) {
        var a = NODE_POS[e[0]], bNode = NODE_POS[e[1]];
        if (!a || !bNode) return;
        var stA = getState(e[0]), stB = getState(e[1]);
        var edgeColor = stA === 'learned' && stB === 'learned' ? '#c8961a' :
                        stA === 'learned' ? 'rgba(200,149,26,0.5)' : 'rgba(100,100,120,0.3)';
        s += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + bNode.x + '" y2="' + bNode.y + '"'
          + ' stroke="' + edgeColor + '" stroke-width="2" stroke-dasharray="' +
          (stA === 'learned' ? 'none' : '5,5') + '"/>';
      });

      // Nodes
      Object.keys(NODE_POS).forEach(function(id) {
        var pos = NODE_POS[id];
        var def = self.tm.getTalentDef(id);
        if (!def) return;
        var st = getState(id);
        var col = pos.branchColor;
        var fillInner = st === 'learned'   ? 'rgba(180,140,30,0.35)' :
                        st === 'available' ? 'rgba(30,30,60,0.92)'   :
                                             'rgba(15,12,30,0.85)';
        var strokeCol = st === 'learned'   ? col :
                        st === 'available' ? 'rgba(200,180,100,0.7)' :
                                             'rgba(80,80,100,0.4)';
        var strokeW   = st === 'available' ? 2.5 : 2;
        var textFill  = st === 'learned'   ? '#f0d880' :
                        st === 'available' ? '#d8c880'   :
                                             'rgba(160,140,120,0.55)';

        // Hexagon path centered at (pos.x, pos.y) with radius R
        var pts = '';
        for (var i = 0; i < 6; i++) {
          var ang = (Math.PI / 180) * (60 * i - 30);
          var px = pos.x + R * Math.cos(ang);
          var py = pos.y + R * Math.sin(ang);
          pts += (i === 0 ? 'M' : 'L') + px.toFixed(1) + ',' + py.toFixed(1);
        }
        pts += 'Z';

        s += '<g class="dt-node' + (_dtSelected===id?' dt-selected':'') + '" data-id="' + id + '" style="cursor:pointer">';
        // Selection ring (orange glow around selected node)
        if (_dtSelected === id) {
          var selPts = '';
          for (var si2=0; si2<6; si2++) {
            var sa2 = (Math.PI/180)*(60*si2-30);
            selPts += (si2===0?'M':'L')+(pos.x+(R+9)*Math.cos(sa2)).toFixed(1)+','+(pos.y+(R+9)*Math.sin(sa2)).toFixed(1);
          }
          s += '<path d="' + selPts + 'Z" fill="rgba(240,200,64,0.15)"'
            + ' stroke="#f0c840" stroke-width="3" filter="url(#dt-gd)"/>';
        }
        // Glow for learned/available
        if (st !== 'locked') {
          s += '<path d="' + pts + '" fill="' + (st==='learned'?col:'rgba(200,160,60,0.2)') + '"'
            + ' opacity="0.18" filter="url(#dt-g' + (st==='learned'?'d':'a') + ')"/>';
        }
        // Main hex
        s += '<path d="' + pts + '" fill="' + fillInner + '"'
          + ' stroke="' + strokeCol + '" stroke-width="' + strokeW + '"/>';
        // Check mark if learned
        if (st === 'learned') {
          s += '<text x="' + pos.x + '" y="' + (pos.y - R*0.55) + '"'
            + ' text-anchor="middle" font-size="11" fill="rgba(200,200,60,0.7)">✓</text>';
        }
        // Icon
        s += '<text x="' + pos.x + '" y="' + (pos.y + 6) + '"'
          + ' text-anchor="middle" dominant-baseline="middle"'
          + ' font-size="22">' + (def.icon || '⭐') + '</text>';
        // Name below hex
        var name = def.name || id;
        if (name.length > 14) name = name.slice(0, 13) + '…';
        s += '<text x="' + pos.x + '" y="' + (pos.y + R + 14) + '"'
          + ' text-anchor="middle" font-family="Cinzel,serif" font-size="10"'
          + ' fill="' + textFill + '">' + name + '</text>';
        s += '</g>';
      });

      s += '</svg>';
      return s;
    }

    // Tooltip container
    var drachmes = self.rm ? Math.floor(self.rm.get('drachmes')) : 0;
    var fmt = function(v){ return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(1)+'k':''+v; };
    el.innerHTML =
      '<div class="dt-drachmes-count">🪙 ' + fmt(drachmes) + ' Drachmes</div>' +
      '<div id="dt-scroll-wrap"><div style="min-width:' + VW + 'px">' + buildSVG() + '</div></div>' +
      '<div id="dt-tooltip" class="dt-branch-tt" style="display:none"></div>';

    function buildTT(id) {
      var def = self.tm.getTalentDef(id);
      if (!def) return '';
      var st  = getState(id);
      var can = self.tm.canLearn(id);
      var stLabel = st === 'learned'   ? '<span style="color:#80e080">✓ Acquis</span>' :
                    st === 'available' ? '<span style="color:#f0d060">Disponible</span>' :
                                        '<span style="color:#e08080">🔒 Verrouillé</span>';
      return '<div class="dt-tt-icon">' + (def.icon||'⭐') + '</div>' +
        '<div class="dt-tt-name">' + (def.name||id) + '</div>' +
        '<div class="dt-tt-state">' + stLabel + '</div>' +
        '<div class="dt-tt-desc">' + (def.desc||'') + '</div>' +
        (def.cost ? '<div class="dt-tt-cost">Coût : ' + fmtCost(def.cost) + '</div>' : '') +
        (st !== 'learned' && !can.ok ? '<div class="dt-tt-lock">' + can.reason + '</div>' : '') +
        (st === 'available' ? '<button data-learn="' + id + '" class="dt-tt-buy">Acheter — ' + fmtCost(def.cost) + '</button>' : '');
    }

    var curNode  = null;
    var ttBox    = document.getElementById('dt-tooltip');
    var ttPinned = false;  // true quand l'utilisateur a cliqué sur un nœud

    function bindSVG(svg) {
      if (!svg) return;
      svg.querySelectorAll('.dt-node').forEach(function(g) {
        g.addEventListener('mouseenter', function() {
          if (ttPinned) return;
          curNode = g.dataset.id;
          ttBox.innerHTML = buildTT(curNode);
          ttBox.style.display = 'block';
        });
        g.addEventListener('mouseleave', function() {
          if (ttPinned) return;
          setTimeout(function() {
            if (!ttBox.matches(':hover')) { ttBox.style.display = 'none'; curNode = null; }
          }, 120);
        });
        g.addEventListener('click', function(e) {
          e.stopPropagation();
          ttPinned = true;
          curNode = g.dataset.id;
          _dtSelected = curNode;
          ttBox.innerHTML = buildTT(curNode);
          ttBox.style.display = 'block';
          // Refresh SVG to show selection highlight
          var _sw = document.getElementById('dt-scroll-wrap');
          if (_sw) { _sw.innerHTML = '<div style="min-width:'+VW+'px">'+buildSVG()+'</div>'; bindSVG(_sw.querySelector('#dt-svg')); startRuneAnim(_sw.querySelector('#dt-svg')); }
        });
      });
    }
    bindSVG(el.querySelector('#dt-svg'));
    startRuneAnim(el.querySelector('#dt-svg'));

    // Clic en dehors → dépingle
    document.addEventListener('click', function unpinHandler(e) {
      if (!ttBox.contains(e.target) && !e.target.closest('.dt-node')) {
        ttPinned = false;
        ttBox.style.display = 'none';
        curNode = null;
      }
    });

    ttBox.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-learn]'); if (!btn) return;
      e.stopPropagation();
      if (!self.tm.learn(btn.dataset.learn)) return;
      // Rebuild SVG in place
      var scrollWrap = document.getElementById('dt-scroll-wrap');
      stopRuneAnim();
      scrollWrap.innerHTML = '<div style="min-width:' + VW + 'px">' + buildSVG() + '</div>';
      bindSVG(scrollWrap.querySelector('#dt-svg'));
      startRuneAnim(scrollWrap.querySelector('#dt-svg'));
      if (curNode) { ttBox.innerHTML = buildTT(curNode); ttBox.style.display = 'block'; }
      var dNew = self.rm ? Math.floor(self.rm.get('drachmes')) : 0;
      var hdr  = el.querySelector('.dt-drachmes-count');
      if (hdr) hdr.textContent = '🪙 ' + fmt(dNew) + ' Drachmes';
    });
  }


  _renderEtherTree(el) {
    var self = this;
    var etherOwned = self.rm ? Math.floor(self.rm.get('ether')) : 0;

    /* ══════════════════════════════════════════════════════
       ARBRE ÉTHER — 3 colonnes fixes, nœuds R=36/48
       Layout : Reliques (2 sous-col) | Ères (1 col) | Constellations (2 sous-col)
       Espacement vertical 130px, sous-cols ±50px → min dist ~100px > 2×R=72
       ══════════════════════════════════════════════════════ */

    /* Positions explicites — garanties sans chevauchement */
    var R    = 36;
    var R_ERA = 48;

    /* Grille 5 colonnes, VW=900, VH=520
       Col 0 (x=90)  : Reliques gauche
       Col 1 (x=220) : Reliques droite
       Col 2 (x=450) : Ères (centre)
       Col 3 (x=680) : Constellations gauche
       Col 4 (x=810) : Constellations droite                */
    var VW = 900, VH = 520;
    var CX = [90, 220, 450, 680, 810];
    var RY = [115, 250, 385];   /* y des 3 rangs */

    var NODES = {
      /* Ères — colonne 2, grands nœuds */
      ere2:             { x: CX[2], y: RY[0] },
      ere3:             { x: CX[2], y: RY[1] },
      /* Reliques — col 0 et 1 */
      relique_amphore:  { x: CX[0], y: RY[0] },
      relique_enclume:  { x: CX[0], y: RY[1] },
      relique_carte:    { x: CX[0], y: RY[2] },
      relique_graine:   { x: CX[1], y: RY[0] },
      relique_eclair:   { x: CX[1], y: RY[1] },
      relique_omphalos: { x: CX[1], y: RY[2] },
      /* Constellations — col 3 et 4 */
      const_prod:       { x: CX[3], y: RY[0] },
      const_dig:        { x: CX[3], y: RY[1] },
      const_pop:        { x: CX[4], y: RY[0] },
      const_ether:      { x: CX[4], y: RY[1] },
      const_prod2:      { x: (CX[3]+CX[4])/2, y: RY[2] },
    };

    var EDGES = [
      ['ere2','ere3'],
      ['ere2','relique_amphore'], ['ere2','relique_graine'],
      ['ere2','const_prod'],      ['ere2','const_dig'],
      ['relique_amphore','relique_enclume'], ['relique_graine','relique_eclair'],
      ['relique_enclume','relique_carte'],   ['relique_eclair','relique_omphalos'],
      ['const_prod','const_pop'],  ['const_dig','const_ether'],
      ['const_pop','const_prod2'], ['const_ether','const_prod2'],
    ];

    var BCOL = { eres:'#c8a840', reliques:'#a060e0', constellations:'#40b8f0' };

    function getState(id) {
      if (self.tm.etherLearned[id]) return 'learned';
      return self.tm.canLearnEther(id).ok ? 'available' : 'locked';
    }
    function ethFmt(v) { return v>=10000?(v/1000).toFixed(0)+'k':v>=1000?(v/1000).toFixed(1)+'k':''+v; }
    function getBranchColor(id) {
      var def = self.tm.getEtherDef(id); if (!def) return '#888';
      return BCOL[def.branch] || '#888';
    }

    var _etSelected = null;
    var _etRuneRAF = null;
    var ET_CYCLE_MS = 3000;
    var ET_RUNE_META = (function(){
      var m = []; for(var i=0;i<24;i++) m.push({phase:i/24, isOrange:i%3===0}); return m;
    })();
    function startEtRuneAnim(svgEl) {
      if (_etRuneRAF) cancelAnimationFrame(_etRuneRAF);
      var runes = svgEl ? Array.from(svgEl.querySelectorAll('.et-rune')) : [];
      function step() {
        var now = performance.now();
        runes.forEach(function(el, i) {
          var m = ET_RUNE_META[i]; if (!m) return;
          var t = ((now / ET_CYCLE_MS) + m.phase) % 1.0;
          var pulse = t < 0.5 ? t*2.0 : (1.0-t)*2.0;
          var op, fill;
          if (m.isOrange) { op=0.03+pulse*0.17; fill='rgba(255,140,40,'+op.toFixed(3)+')'; }
          else            { op=0.02+pulse*0.13; fill='rgba(160,60,240,'+op.toFixed(3)+')'; }
          el.setAttribute('fill', fill);
        });
        _etRuneRAF = requestAnimationFrame(step);
      }
      _etRuneRAF = requestAnimationFrame(step);
    }
    function stopEtRuneAnim() { if(_etRuneRAF){cancelAnimationFrame(_etRuneRAF);_etRuneRAF=null;} }
    function etHexPts(cx, cy, r) {
      var pts = '';
      for (var i = 0; i < 6; i++) {
        var a = Math.PI / 180 * (60*i - 30);
        pts += (i===0?'M':'L') + (cx+r*Math.cos(a)).toFixed(1) + ',' + (cy+r*Math.sin(a)).toFixed(1);
      }
      return pts + 'Z';
    }
    function buildSVG() {
      var s = '<svg id="et-svg" xmlns="http://www.w3.org/2000/svg"'
            + ' viewBox="0 0 ' + VW + ' ' + VH + '"'
            + ' style="width:100%;height:100%;display:block">';

      s += '<defs>'
         + '<radialGradient id="etbg" cx="50%" cy="40%" r="55%">'
         + '<stop offset="0%" stop-color="#0e0820"/>'
         + '<stop offset="100%" stop-color="#040308"/>'
         + '</radialGradient>'
         + '<filter id="etgp"><feGaussianBlur stdDeviation="6" result="b"/>'
         + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         + '<filter id="etgb"><feGaussianBlur stdDeviation="3.5" result="b"/>'
         + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         + '<filter id="etgg"><feGaussianBlur stdDeviation="8" result="b"/>'
         + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         + '</defs>';

      // ── Fond mythologie grecque Éther — ciel nocturne étoilé, moins sombre ──
      s += '<defs>'
        + '<linearGradient id="etbg2" x1="0%" y1="0%" x2="60%" y2="100%">'
        + '<stop offset="0%"   stop-color="#1a0c35"/>'
        + '<stop offset="50%"  stop-color="#120828"/>'
        + '<stop offset="100%" stop-color="#0a0520"/>'
        + '</linearGradient>'
        + '<radialGradient id="etstar" cx="50%" cy="30%" r="55%">'
        + '<stop offset="0%"  stop-color="rgba(160,80,255,0.18)"/>'
        + '<stop offset="100%" stop-color="rgba(80,20,160,0)"/>'
        + '</radialGradient>'
        + '</defs>';
      s += '<rect width="' + VW + '" height="' + VH + '" fill="url(#etbg2)"/>';
      s += '<rect width="' + VW + '" height="' + VH + '" fill="url(#etstar)"/>';
      // Étoiles et constellations
      for (var si=0; si<60; si++) {
        var sx2 = 5+(si*137.5)%(VW-10), sy2 = 5+(si*73.1)%(VH-10);
        var sr  = si%5===0 ? 2 : si%3===0 ? 1.5 : 1;
        var sop = 0.3+((si*47)%100)/200;
        s += '<circle cx="'+sx2+'" cy="'+sy2+'" r="'+sr+'" fill="rgba(255,255,255,'+sop.toFixed(2)+')"/>';
      }
      // Lignes de constellation (reliant quelques étoiles)
      [[0,5],[5,14],[14,23],[23,32],[1,8],[8,17]].forEach(function(pair) {
        var a={x:5+(pair[0]*137.5)%(VW-10),y:5+(pair[0]*73.1)%(VH-10)};
        var b={x:5+(pair[1]*137.5)%(VW-10),y:5+(pair[1]*73.1)%(VH-10)};
        if (Math.abs(a.x-b.x)<200 && Math.abs(a.y-b.y)<150)
          s += '<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="rgba(180,120,255,0.12)" stroke-width="1"/>';
      });
      // Bordure cosmique
      s += '<rect x="3" y="3" width="'+(VW-6)+'" height="'+(VH-6)+'"'
        + ' fill="none" stroke="rgba(160,80,255,0.35)" stroke-width="1.5" rx="3"/>';
      s += '<rect x="7" y="7" width="'+(VW-14)+'" height="'+(VH-14)+'"'
        + ' fill="none" stroke="rgba(160,80,255,0.12)" stroke-width="1" rx="2" stroke-dasharray="6,5"/>';
      // Icônes mythologiques (cosmos)
      var ET_DECOS = ['⭐','🌙','🔮','✨','🌊','🦅','⚡','🏛️','💫'];
      for (var edi=0; edi<8; edi++) {
        var edx = 25+(edi*161)%(VW-50), edy = 25+(edi*103)%(VH-50);
        s += '<text x="'+edx+'" y="'+edy+'" font-size="24" text-anchor="middle"'
          + ' opacity="0.12" style="pointer-events:none">'+ET_DECOS[edi%ET_DECOS.length]+'</text>';
      }

      // Runes — animated via JS RAF (same CYCLE_MS=3000 as MapRenderer)
      var ET_RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
      for (var ri = 0; ri < 24; ri++) {
        var erx = 10 + (ri * 137.5) % (VW - 20);
        var ery = 20 + (ri * 73.1)  % (VH - 30);
        var ersz = 18 + (ri % 4) * 5;
        s += '<text class="et-rune" data-eri="' + ri + '" x="' + erx.toFixed(0) + '" y="' + ery.toFixed(0) + '"'
          + ' font-size="' + ersz + '" fill="rgba(160,60,240,0.04)"'
          + ' font-family="serif" style="pointer-events:none;user-select:none">'
          + ET_RUNES[ri % ET_RUNES.length] + '</text>';
      }

      /* Labels de section */
      s += '<text x="155" y="44" text-anchor="middle" font-size="15" fill="#a060e0"'
         + ' font-family="Cinzel,serif" font-weight="700" style="pointer-events:none">🫙 RELIQUES</text>';
      s += '<text x="450" y="44" text-anchor="middle" font-size="15" fill="#c8a840"'
         + ' font-family="Cinzel,serif" font-weight="700" style="pointer-events:none">🏛️ ÈRES</text>';
      s += '<text x="745" y="44" text-anchor="middle" font-size="15" fill="#40b8f0"'
         + ' font-family="Cinzel,serif" font-weight="700" style="pointer-events:none">⭐ CONSTELLATIONS</text>';

      /* Séparateurs */
      s += '<line x1="350" y1="58" x2="350" y2="' + (VH-10) + '"'
         + ' stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
      s += '<line x1="550" y1="58" x2="550" y2="' + (VH-10) + '"'
         + ' stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';

      /* Arêtes */
      EDGES.forEach(function(e) {
        var a = NODES[e[0]], b = NODES[e[1]]; if (!a || !b) return;
        var sa = getState(e[0]), sb = getState(e[1]);
        var active = sa==='learned' && sb==='learned';
        var half   = sa==='learned';
        var col    = active ? 'rgba(180,100,255,0.88)' : half ? 'rgba(100,180,255,0.38)' : 'rgba(50,40,70,0.42)';
        s += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"'
           + ' stroke="' + col + '" stroke-width="' + (active?3:1.8) + '"'
           + (active ? '' : ' stroke-dasharray="6,4"') + '/>';
        if (active)
          s += '<circle cx="' + ((a.x+b.x)/2) + '" cy="' + ((a.y+b.y)/2) + '"'
             + ' r="3.5" fill="rgba(200,120,255,0.88)"/>';
      });

      /* Nœuds */
      Object.keys(NODES).forEach(function(id) {
        var pos = NODES[id];
        var def = self.tm.getEtherDef(id); if (!def) return;
        var st  = getState(id);
        var isEra = def.effect && def.effect.type === 'unlockEra';
        var r     = isEra ? R_ERA : R;
        var bc    = getBranchColor(id);

        var stroke  = st==='learned' ? bc : st==='available' ? bc : 'rgba(80,70,100,0.38)';
        var fill    = st==='learned' ? 'rgba(20,8,40,0.96)' : st==='available' ? 'rgba(4,8,20,0.96)' : 'rgba(4,3,8,0.88)';
        var filt    = st==='learned' ? (isEra?'url(#etgg)':'url(#etgp)') : st==='available' ? 'url(#etgb)' : '';
        var sw      = st==='learned' ? 2.8 : st==='available' ? 2 : 1.2;
        var opacity = st==='locked'  ? '0.35' : '1';
        var cursor  = st!=='locked'  ? 'pointer' : 'default';
        var textcol = st==='learned' ? '#e8d8ff' : st==='available' ? '#a0d8f0' : '#484060';

        /* Anneau sélection */
        if (id === _etSelected) {
          s += '<path d="' + etHexPts(pos.x, pos.y, r+8) + '"'
             + ' fill="rgba(240,168,32,0.12)" stroke="#f0a820" stroke-width="2"'
             + ' stroke-linejoin="round" filter="url(#etgb)"/>';
        }
        /* Anneau déco hex uniquement si learned */
        if (st === 'learned') {
          s += '<path d="' + etHexPts(pos.x, pos.y, r+11) + '"'
             + ' fill="none" stroke="' + bc + '" stroke-width="0.8" opacity="0.2"'
             + ' stroke-dasharray="4,8"/>';
        }

        /* Hexagone principal */
        var hpts = etHexPts(pos.x, pos.y, r);
        s += '<path d="' + hpts + '"'
           + ' fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"'
           + ' stroke-linejoin="round"'
           + (filt ? ' filter="' + filt + '"' : '')
           + (_etSelected===id ? ' class="et-node-selected" stroke="#f0a820" stroke-width="3"' : '')
           + ' data-enode="' + id + '"'
           + ' style="cursor:' + cursor + ';opacity:' + opacity + '"/>';

        /* Icône */
        var icon = st === 'locked' ? '🔒' : def.icon;
        s += '<text x="' + pos.x + '" y="' + (pos.y - (isEra?5:4)) + '"'
           + ' text-anchor="middle" dominant-baseline="middle"'
           + ' font-size="' + (isEra?28:22) + '"'
           + ' style="pointer-events:none;user-select:none">' + icon + '</text>';

        /* Coût ou check */
        if (st !== 'learned') {
          var ec = def.cost.ether || 0;
          var ca = etherOwned >= ec;
          s += '<text x="' + pos.x + '" y="' + (pos.y + r*0.56) + '"'
             + ' text-anchor="middle" font-size="' + (isEra?15:13) + '"'
             + ' fill="' + (ca ? '#90e060' : '#e06050') + '"'
             + ' font-family="Cinzel,serif" font-weight="700"'
             + ' style="pointer-events:none">' + ethFmt(ec) + '✨</text>';
        } else {
          s += '<text x="' + pos.x + '" y="' + (pos.y + r*0.56) + '"'
             + ' text-anchor="middle" font-size="16" fill="#a060ff"'
             + ' style="pointer-events:none">✓</text>';
        }

        /* Nom sous le nœud */
        var nm = def.name.length > 13 ? def.name.substring(0, 12) + '…' : def.name;
        s += '<text x="' + pos.x + '" y="' + (pos.y + r + 18) + '"'
           + ' text-anchor="middle" font-size="13" fill="' + textcol + '"'
           + ' font-family="Cinzel,serif" font-weight="600"'
           + ' style="pointer-events:none">' + nm + '</text>';
      });

      s += '</svg>';
      return s;
    }

    function buildTooltipHtml(id) {
      var def = self.tm.getEtherDef(id); if (!def) return '';
      var st  = getState(id);
      var ec  = def.cost.ether || 0;
      var ca  = etherOwned >= ec;
      var reqNm = (def.requires || []).map(function(r) {
        var d = self.tm.getEtherDef(r); return d ? d.name : r;
      }).join(', ');
      var typeLabel = def.effect && def.effect.type === 'unlockEra' ? '🏛️ ÈRE'
                    : def.effect && def.effect.type === 'relique'   ? '🫙 RELIQUE'
                    : '⭐ CONSTELLATION';
      var bc  = getBranchColor(id);
      var btn = '';
      if (st === 'learned')
        btn = '<div class="tt2-acquired">✓ Acquis — Permanent</div>';
      else if (st === 'available')
        btn = '<button class="tt2-buy tt2-buy-e" data-learnether="' + id + '">'
            + (ca ? '🔮 Acquérir — ' + ethFmt(ec) + ' ✨' : '🔒 Éther insuffisant (' + etherOwned + ' / ' + ethFmt(ec) + ')')
            + '</button>';
      else {
        var ch = self.tm.canLearnEther(id);
        btn = '<div class="tt2-locked">🔒 ' + ch.reason + '</div>';
      }
      return '<div class="tt2-head"><span class="tt2-icon">' + def.icon + '</span>'
           + '<div><div class="tt2-name">' + def.name + '</div>'
           + '<div class="tt2-branch" style="color:' + bc + '">' + typeLabel + '</div></div></div>'
           + '<div class="tt2-desc">' + def.desc + '</div>'
           + (reqNm ? '<div class="tt2-req">🔗 Prérequis : ' + reqNm + '</div>' : '')
           + '<div class="tt2-cost">' + ethFmt(ec) + ' ✨</div>'
           + btn;
    }

    var etherStr = etherOwned >= 1000 ? (etherOwned/1000).toFixed(1)+'k' : ''+etherOwned;
    el.innerHTML =
      '<div class="et-header">'
      + '<span class="et-ether-count">✨ ' + etherStr + ' Éther</span>'
      + '<span class="et-hint">Cliquez sur un nœud pour les détails</span>'
      + '</div>'
      + '<div class="at-wrap">'
        + '<div class="at-svg-box" id="et-svgbox">' + buildSVG() + '</div>'
        + '<div class="at-tooltip-panel" id="et-ttbox">'
          + '<div class="at-tt-placeholder">Cliquez sur un nœud</div>'
        + '</div>'
      + '</div>';

    var svgEl = el.querySelector('#et-svg');
    var ttBox = el.querySelector('#et-ttbox');
    startEtRuneAnim(svgEl);

    function showTooltip(id) {
      ttBox.innerHTML = buildTooltipHtml(id);
      ttBox.dataset.node = id;
    }

    function bindEtSvg(svg) {
      svg.addEventListener('click', function onEtClick(e) {
        var node = e.target.closest('[data-enode]'); if (!node) return;
        var nid = node.dataset.enode;
        _etSelected = nid;
        showTooltip(nid);
        // Rebuild SVG with selection ring visible
        stopEtRuneAnim();
        var newDiv = document.createElement('div');
        newDiv.innerHTML = buildSVG();
        svg.parentNode.replaceChild(newDiv.firstChild, svg);
        svg = el.querySelector('#et-svg');
        svgEl = svg;
        startEtRuneAnim(svgEl);
        bindEtSvg(svgEl);
      });
    }
    bindEtSvg(svgEl);

    ttBox.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-learnether]'); if (!btn) return;
      var id  = btn.dataset.learnether;
      if (!self.tm.learnEther(id)) return;
      etherOwned = self.rm ? Math.floor(self.rm.get('ether')) : 0;
      var newDiv = document.createElement('div');
      newDiv.innerHTML = buildSVG();
      svgEl.parentNode.replaceChild(newDiv.firstChild, svgEl);
      svgEl = el.querySelector('#et-svg');
      svgEl.addEventListener('click', function(e) {
        var c = e.target.closest('[data-enode]'); if (!c) return;
        showTooltip(c.dataset.enode);
      });
      if (ttBox.dataset.node) showTooltip(ttBox.dataset.node);
      var hdr = el.querySelector('.et-ether-count');
      var eNew = self.rm ? Math.floor(self.rm.get('ether')) : 0;
      if (hdr) hdr.textContent = '✨ ' + (eNew >= 1000 ? (eNew/1000).toFixed(1)+'k' : eNew) + ' Éther';
    });

  }



  // ── Helpers ──────────────────────────────────────────────
  _costHtml(cost) {
    var self = this;
    return Object.entries(cost).map(function(e) {
      var ok = self.rm.get(e[0]) >= e[1];
      return '<span style="color:' + (ok ? '#80e080' : '#e08080') + '">' + e[1] + ' ' + (RES_ICONS[e[0]] || e[0]) + '</span>';
    }).join(' ');
  }
  _fmt(v) {
    if (v >= 1e6) return (v/1e6).toFixed(1)+'M';
    if (v >= 1e3) return (v/1e3).toFixed(0)+'k';
    return String(v);
  }

  _costInline(cost) {
    var self = this;
    return Object.entries(cost).map(function(e) {
      var ok = self.rm.get(e[0]) >= e[1];
      return '<span style="color:' + (ok ? '#80e080' : '#e08080') + '">' + e[1] + (RES_ICONS[e[0]] || e[0]) + '</span>';
    }).join(' ');
  }
  _lock(ok) { return ok ? '' : ' bp-locked'; }

  // ── Crée une hex-bar avec une liste d'items simples ─────
  _hexBar(items, cell) {
    var self = this;
    var SVG = '<svg viewBox="0 0 100 114" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon class="hex-poly-fill" points="50,2 96,27 96,87 50,112 4,87 4,27"/>' +
      '<polygon class="hex-poly-stroke" points="50,2 96,27 96,87 50,112 4,87 4,27"/></svg>';
    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;height:100%;padding:0 4px;';
    items.forEach(function(item) {
      var hexEl = document.createElement('div');
      var cls = 'hex-btn hex-action';
      if (item.locked)  cls += ' hex-locked';
      if (!item.locked) cls += ' hex-ok';
      if (item.danger)  cls += ' hex-danger';
      hexEl.className = cls;
      if (item.action) hexEl.dataset.action = item.action;
      // Premier coût
      var costStr = '';
      if (item.costs) {
        var firstEntry = Object.entries(item.costs)[0];
        if (firstEntry) {
          var has = Object.entries(item.costs).every(function(e){ return self.rm.get(e[0]) >= e[1]; });
          costStr = '<span class="hex-cost'+(has?'':' short')+'">'+(RES_ICONS[firstEntry[0]]||firstEntry[0])+' '+self._fmt(firstEntry[1])+(Object.keys(item.costs).length>1?'…':'')+'</span>';
        }
      }
      hexEl.innerHTML =
        '<div class="hex-bg">' + SVG + '</div>' +
        '<span class="hex-icon">' + item.icon + '</span>' +
        '<span class="hex-label">' + item.label + '</span>' +
        costStr;
      bar.appendChild(hexEl);
    });
    return bar;
  }


  // ── UI Fouille ───────────────────────────────────────────
  _renderDigUI(cell, body) {
    var self = this;
    var adj    = this.bm.grid.getNeighbors(cell.q, cell.r).some(function(n){ return n.isRevealed; });
    var pct    = Math.max(0, Math.ceil((cell.currentHP / cell.maxHP) * 100));
    var canDig = adj && this.rm.canAfford({ drachmes: 5 });
    var bar = this._hexBar([{
      icon: '⛏️', label: 'Fouiller', action: 'dig',
      locked: !canDig,
      lockReason: !adj ? 'Zone inaccessible' : 'Drachmes insuf.',
      costs: { drachmes: 5 },
      desc: 'Résistance : ' + Math.ceil(cell.currentHP) + ' / ' + cell.maxHP + '. Coût : 5 🪙/frappe.'
    }], cell);
    body.appendChild(bar);
  }

  // ── UI Case vide ─────────────────────────────────────────
  _renderMudUI(cell, body) {
    var self = this; var bm = this.bm;
    var canDrain = bm.rm.canAfford({ drachmes: 120, bois: 60 });
    body.appendChild(self._hexBar([
      { icon: '🟫', label: '+🌾+🪵 passif', action: null, locked: false },
      { icon: '🚧', label: 'Assécher', action: 'mud-drain', locked: !canDrain, costs: { drachmes: 120, bois: 60 } }
    ], cell));
  }

  _renderRubbleUI(cell, body) {
    var self = this; var bm = this.bm;
    var canClear = bm.rm.canAfford({ drachmes: 500, bois: 200, fer: 50 });
    body.appendChild(self._hexBar([
      { icon: '🪨', label: '+⚙️+🪵 passif', action: null, locked: false },
      { icon: '🧹', label: 'Déblayer', action: 'rubble-clear', locked: !canClear, costs: { drachmes: 500, bois: 200, fer: 50 } }
    ], cell));
  }

  _renderTunnelUI(cell, body) {
    var self = this; var bm = this.bm;
    var canCollapse = bm.rm.canAfford({ drachmes: 100 });
    var roadItem;
    if (!cell.hasRoad) {
      var rc = bm.canPlaceRoad(cell);
      roadItem = { icon: '🛤️', label: 'Route', action: 'tun-road', locked: !rc.ok, costs: { drachmes: 30, bois: 10 } };
    } else {
      var rr = bm.canRemoveRoad(cell);
      roadItem = { icon: '🔨', label: 'Suppr. Route', action: 'tun-road-rm', locked: !rr.ok, danger: true, costs: { drachmes: 10 } };
    }
    body.appendChild(self._hexBar([
      roadItem,
      { icon: '💥', label: 'Effondrer', action: 'tun-collapse', locked: !canCollapse, danger: true, costs: { drachmes: 100 } }
    ], cell));
  }

  _renderEmptyUI(cell, body) {
    var self = this;

    /* ── Catégories de bâtiments SimCity-style ─────────────── */
    var BUILDING_CATEGORIES = [
      { id:'all',         label:'Tout',        icon:'🏛️', ids: null },
      { id:'farm',        label:'Agriculture',  icon:'🌾', ids: ['ferme','moulin','grenier','verger','ruche','oliveraie'] },
      { id:'wood',        label:'Bois',         icon:'🌲', ids: ['camp_bucherons','scierie','charbonnerie'] },
      { id:'mine',        label:'Mine',         icon:'⛏️', ids: ['mine_fer','fonderie','forge','atelier'] },
      { id:'pop',         label:'Population',   icon:'👥', ids: ['maison','taverne','temple','marche'] },
      { id:'prod',        label:'Production',   icon:'⚙️', ids: ['manufacture','arsenal','atelier_divin'] },
      { id:'road',        label:'Routes',       icon:'🛤️', ids: [] },
    ];
    if (!self._activeBldCat) self._activeBldCat = 'all';
    var _activeBldCat = self._activeBldCat;

    /* ── SVG hexagone helper ──────────────────────────────── */
    function hexSVG() {
      // Flat-top hexagone — points calculés pour 68×78 (ratio utilisé)
      return '<svg viewBox="0 0 100 114" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon class="hex-poly-fill" points="50,2 96,27 96,87 50,112 4,87 4,27"/>' +
        '<polygon class="hex-poly-stroke" points="50,2 96,27 96,87 50,112 4,87 4,27"/>' +
        '</svg>';
    }

    /* ── Tooltip DOM ─────────────────────────────────────── */
    var tt = document.getElementById('bld-tooltip');
    if (!tt) {
      tt = document.createElement('div');
      tt.id = 'bld-tooltip';
      document.body.appendChild(tt);
    }
    tt.className = '';

    /* ── Contenu tooltip ────────────────────────────────── */
    function buildTTContent(def, check) {
      var prodLines = '';
      if (def.baseProdPerField)   prodLines += '<div class="btt-prod">🌾 +' + def.baseProdPerField + '/champ/s</div>';
      if (def.baseProdPerSupport) prodLines += '<div class="btt-prod">🪵 +' + def.baseProdPerSupport + '/forêt/s</div>';
      if (def.produces) Object.entries(def.produces).forEach(function(e){ prodLines += '<div class="btt-prod">' + (RES_ICONS[e[0]]||e[0]) + ' +' + e[1] + '/s</div>'; });
      if (def.consumes) Object.entries(def.consumes).forEach(function(e){ prodLines += '<div class="btt-consume">' + (RES_ICONS[e[0]]||e[0]) + ' −' + e[1] + '/s</div>'; });
      var workers = def.consumesWorkers ? '<div class="btt-workers">👷 ' + def.consumesWorkers + ' travailleurs requis</div>' : '';
      var eraBadge = def.era > 1 ? '<span class="btt-era era-' + def.era + '">Ère ' + def.era + '</span>' : '';
      var costChips = Object.entries(def.buildCost).map(function(e){
        var has = self.rm.get(e[0]) >= e[1];
        return '<span class="btt-cost-item ' + (has?'btt-cost-ok':'btt-cost-ko') + '">' + (RES_ICONS[e[0]]||e[0]) + ' ' + self._fmt(e[1]) + '</span>';
      }).join('');
      var state = check.ok
        ? '<div class="btt-state ok">✅ Constructible</div>'
        : '<div class="btt-state ko">🔒 ' + check.reason + '</div>';
      return '<div class="btt-head"><span class="btt-icon">' + def.glyph + '</span>' +
        '<div class="btt-title"><span class="btt-name">' + def.name + '</span>' + eraBadge + '</div></div>' +
        '<div class="btt-desc">' + def.description + '</div>' +
        '<div class="btt-section">Coût</div><div class="btt-costs">' + costChips + '</div>' +
        (prodLines ? '<div class="btt-section">Production</div><div class="btt-prods">' + prodLines + '</div>' : '') +
        workers + state +
        '<button class="btt-close">✕</button>';
    }

    function showTT(hexEl, def, check) {
      tt.innerHTML = buildTTContent(def, check);
      tt.classList.add('visible');
      tt.style.pointerEvents = 'none';
      // Liaison du bouton fermeture (mobile)
      var closeBtn = tt.querySelector('.btt-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e){
          e.stopPropagation();
          tt.dataset.pinned = '';
          tt.className = '';
        });
      }
      // Positionnement PC : à gauche de l'hexagone, ou au-dessus
      var r  = hexEl.getBoundingClientRect();
      var tw = 255; var th = tt.offsetHeight || 160;
      var isMob = window.innerWidth <= 600;
      if (!isMob) {
        var tx = r.left - tw - 12;
        var ty = r.top - th + r.height / 2;
        if (tx < 8) { tx = r.right + 12; }
        if (ty < 8) ty = 8;
        if (ty + th > window.innerHeight - 8) ty = window.innerHeight - th - 8;
        tt.style.left = tx + 'px'; tt.style.top = ty + 'px';
        tt.style.bottom = 'auto';
      } else {
        tt.style.left = ''; tt.style.top = '';
      }
    }
    function hideTT() {
      if (tt.dataset.pinned) return;
      tt.className = '';
    }

    /* ── Actions disponibles ────────────────────────────── */
    var available = BuildingManager.getBuildingsForTerrain(cell.type);
    var transforms = BuildingManager.getTerrainTransforms(cell.type);
    var hasRoadAction = (cell.type === CELL_TYPE.PLAIN || cell.type === CELL_TYPE.FIELD ||
                         cell.type === CELL_TYPE.GROVE || cell.hasRoad);

    /* ── Rendu : liste d'hexagones ─────────────────────── */
    // Note: building/road/transform rendering is done in filterAndRenderHex below
    var frag = { childNodes: [] }; // placeholder, not used anymore

    /* ── Barre de catégories SimCity-style ─────────────── */
    var catBar = document.createElement('div');
    catBar.id = 'bp-cat-bar';
    catBar.className = 'bp-cat-bar';
    BUILDING_CATEGORIES.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'bp-cat-btn' + (_activeBldCat === cat.id ? ' active' : '');
      btn.dataset.cat = cat.id;
      btn.innerHTML = '<span class="bp-cat-icon">' + cat.icon + '</span><span class="bp-cat-label">' + cat.label + '</span>';
      catBar.appendChild(btn);
    });

    /* ── Container scrollable pour les hex ─────────────── */
    var hexWrap = document.createElement('div');
    hexWrap.id = 'bp-hex-wrap';
    hexWrap.className = 'bp-hex-wrap';

    function filterAndRenderHex(catId) {
      hexWrap.innerHTML = '';
      var catDef = BUILDING_CATEGORIES.find(function(c2){ return c2.id === catId; });
      var showRoad = catId === 'all' || catId === 'road';
      var showTransform = catId === 'all';

      // Clone children from frag (already built)
      frag.childNodes.forEach ? null : null; // frag was already appended - rebuild inline
      var filteredFrag = document.createDocumentFragment();

      // Buildings
      available.forEach(function(def) {
        if (!def) return;
        if (catDef && catDef.ids && !catDef.ids.includes(def.id)) return;
        var check = self.bm.canBuild(cell, def.id);
        var eraLocked = def.era && def.era > 1 && self.tm && self.tm.getUnlockedEra() < def.era;
        var hexEl = document.createElement('div');
        var cls = 'hex-btn';
        if (!check.ok) cls += ' hex-locked';
        if (check.ok) cls += ' hex-ok';
        if (eraLocked) cls += ' hex-era-locked';
        hexEl.className = cls;
        hexEl.dataset.id = def.id;
        var firstCostEntry = Object.entries(def.buildCost)[0];
        var costStr = firstCostEntry
          ? ((RES_ICONS[firstCostEntry[0]]||firstCostEntry[0]) + ' ' + self._fmt(firstCostEntry[1]) + (Object.keys(def.buildCost).length > 1 ? '…' : ''))
          : '';
        var hasAllCosts = Object.entries(def.buildCost).every(function(e){ return self.rm.get(e[0]) >= e[1]; });
        hexEl.innerHTML =
          '<div class="hex-bg">' + hexSVG() + '</div>' +
          (window.innerWidth <= 600 ? '<button class="hex-info-btn" data-info="' + def.id + '">i</button>' : '') +
          (def.era > 1 ? '<span class="hex-era era-' + def.era + '">Ère ' + def.era + '</span>' : '') +
          '<span class="hex-icon">' + def.glyph + '</span>' +
          '<span class="hex-label">' + def.name + '</span>' +
          (costStr ? '<span class="hex-cost' + (hasAllCosts ? '' : ' short') + '">' + costStr + '</span>' : '');
        if (window.innerWidth > 600) {
          var _def2 = def;
          hexEl.addEventListener('mouseenter', function(){ showTT(hexEl, _def2, self.bm.canBuild(cell, _def2.id)); });
          hexEl.addEventListener('mouseleave', function(){ if (!tt.dataset.pinned) hideTT(); });
        }
        filteredFrag.appendChild(hexEl);
      });

      // Separator
      if (showRoad && (hasRoadAction || transforms.length > 0)) {
        var sep2 = document.createElement('div');
        sep2.className = 'hex-separator';
        filteredFrag.appendChild(sep2);
      }

      // Road
      if (showRoad && hasRoadAction) {
        var roadEl2 = document.createElement('div');
        var rc2 = self.bm.canPlaceRoad(cell);
        if (cell.hasRoad) {
          var rr2 = self.bm.canRemoveRoad(cell);
          roadEl2.className = 'hex-btn hex-action hex-danger' + (rr2.ok ? '' : ' hex-locked');
          roadEl2.dataset.action = 'road-remove';
          roadEl2.innerHTML = '<div class="hex-bg">' + hexSVG() + '</div><span class="hex-icon">🗑️</span><span class="hex-label">Démolir Route</span>';
        } else {
          roadEl2.className = 'hex-btn hex-action' + (rc2.ok ? ' hex-ok' : ' hex-locked');
          roadEl2.dataset.action = 'road';
          roadEl2.innerHTML = '<div class="hex-bg">' + hexSVG() + '</div><span class="hex-icon">🛤️</span><span class="hex-label">Route</span><span class="hex-cost' + (rc2.ok ? '' : ' short') + '">30🪙 10🪵</span>';
        }
        filteredFrag.appendChild(roadEl2);
      }

      // Transforms
      if (showTransform) {
        transforms.forEach(function(tr) {
          var ok = self.rm.canAfford(tr.cost);
          var trEl2 = document.createElement('div');
          trEl2.className = 'hex-btn hex-action' + (ok ? ' hex-ok' : ' hex-locked');
          trEl2.dataset.transform = tr.targetType;
          var firstCost2 = Object.entries(tr.cost)[0];
          var trCost2 = firstCost2 ? ((RES_ICONS[firstCost2[0]]||firstCost2[0]) + ' ' + self._fmt(firstCost2[1])) : '';
          trEl2.innerHTML = '<div class="hex-bg">' + hexSVG() + '</div><span class="hex-icon">' + tr.glyph + '</span><span class="hex-label">' + tr.label + '</span>' + (trCost2 ? '<span class="hex-cost' + (ok?'':' short') + '">' + trCost2 + '</span>' : '');
          filteredFrag.appendChild(trEl2);
        });
      }

      hexWrap.appendChild(filteredFrag);
    }

    filterAndRenderHex(_activeBldCat);
    body.appendChild(catBar);
    body.appendChild(hexWrap);

    // Category click handler
    catBar.addEventListener('click', function(e) {
      var catBtn = e.target.closest('.bp-cat-btn');
      if (!catBtn) return;
      _activeBldCat = catBtn.dataset.cat;
      self._activeBldCat = _activeBldCat;
      catBar.querySelectorAll('.bp-cat-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.cat === _activeBldCat); });
      filterAndRenderHex(_activeBldCat);
    });

    /* ── Délégation de clics sur le body ──────────────── */
    if (!body._hexHandlerBound) {
      body._hexHandlerBound = true;
      body.addEventListener('click', function handler(e) {
      // Bouton ⓘ mobile
      var infoBtn = e.target.closest('.hex-info-btn');
      if (infoBtn) {
        e.stopPropagation();
        var id = infoBtn.dataset.info;
        var defObj = (typeof BUILDINGS !== 'undefined') ? BUILDINGS[id] : null;
        if (!defObj) return;
        var checkObj = self.bm.canBuild(cell, id);
        var parentHex = infoBtn.closest('.hex-btn');
        if (tt.dataset.pinned === id) {
          tt.dataset.pinned = ''; tt.className = '';
        } else {
          showTT(parentHex, defObj, checkObj);
          tt.dataset.pinned = id;
          tt.classList.add('pinned');
          tt.style.pointerEvents = 'auto';
        }
        return;
      }

      // Ferme le tooltip épinglé si clic ailleurs
      if (tt.dataset.pinned) { tt.dataset.pinned = ''; tt.className = ''; }

      var hexEl = e.target.closest('.hex-btn');
      if (!hexEl || hexEl.classList.contains('hex-locked')) return;

      var _sx = window.innerWidth / 2, _sy = window.innerHeight / 2;

      // Construction bâtiment
      if (hexEl.dataset.id) {
        self.bm.build(cell, hexEl.dataset.id, 0, 0);
        self.refresh(); return;
      }
      // Transformation terrain
      if (hexEl.dataset.transform) {
        self.bm.transformTerrain(cell, hexEl.dataset.transform, 0, 0);
        self.refresh(); return;
      }
      // Route
      var act = hexEl.dataset.action;
      if (act === 'road')        { self.bm.placeRoad(cell, _sx, _sy); self.refresh(); }
      else if (act === 'road-remove') { self.bm.removeRoad(cell, _sx, _sy); self.refresh(); }
      });
    } // end if !_hexHandlerBound
  }


  // ── UI Batiment ──────────────────────────────────────────
  _renderBuildingUI(cell, body) {
    var self = this, info = this.bm.getBuildingInfo(cell);
    if (!info) return;
    var def = info.def, max = info.maxLevel, lvl = cell.buildingLevel;
    var pct = ((lvl - 1) / Math.max(1, max - 1)) * 100;

    // Entete batiment
    var connBadge = info.connected
      ? '<span style="color:#80e080;font-size:10px">\u2705 Connecte</span>'
      : '<span style="color:#e08080;font-size:10px">🔴 Sans route</span>';

    var html = '<div class="bp-bld-header">' +
      '<span class="bp-bld-glyph">' + def.glyph + '</span>' +
      '<div><div class="bp-bld-name">' + def.name + '</div>' +
      '<div class="bp-bld-lvl">Niveau ' + lvl + ' / ' + max + ' ' + connBadge + '</div></div>' +
      '</div>' +
      '<div class="bp-lvlbar-track"><div class="bp-lvlbar-fill" style="width:' + pct + '%"></div></div>';

    // Stats scout
    if (def.id === 'scout') {
      var stats = ScoutManager.getStats(lvl);
      var nextStats = lvl < max ? ScoutManager.getStats(lvl + 1) : null;
      html += '<div class="bp-prod-badges">' +
        '<span class="bp-prod-badge">🔭 Rayon ' + stats.radius + ' cases</span>' +
        '<span class="bp-prod-badge">⏱ 1 clic / ' + stats.interval.toFixed(1) + 's</span>' +
        '<span class="bp-prod-badge">💰 5 🪙/clic</span>' +
        '</div>';
      if (!info.connected) {
        html += '<div style="font-size:11px;color:#e08080;margin-bottom:6px">🔴 Connectez une route pour activer.</div>';
      }
      if (nextStats) {
        html += '<div class="bp-adj-line">Prochain niv. : rayon ' + nextStats.radius + ' cases, 1 clic / ' + nextStats.interval.toFixed(1) + 's</div>';
      }
    } else {
      // Adjacence
      if (info.adjInfo) {
        var a = info.adjInfo, filled = '';
        for (var i = 0; i < 5; i++) filled += '<span style="color:' + (i < a.count ? '#80e080' : '#404050') + '">' + (i < a.count ? '\u25C6' : '\u25C7') + '</span>';
        html += '<div class="bp-adj-line">' + a.label + ' : ' + filled + ' ' + a.count + '/5 = +' + a.bonusPct + '%</div>';
        // Actions voisins
        if (info.adjInfo.neighborActions && info.adjInfo.neighborActions.length > 0 && a.count < 5) {
          html += '<div class="bp-cards-row" style="margin-bottom:6px">';
          info.adjInfo.neighborActions.forEach(function(na, idx) {
            var ok = self.rm.canAfford(na.action.cost);
            html += '<div class="bp-card" style="min-width:130px">' +
              '<div class="bp-card-name">' + na.action.glyph + ' ' + na.action.label + '</div>' +
              '<div class="bp-card-cost">' + self._costInline(na.action.cost) + '</div>' +
              '<button class="bp-card-action' + self._lock(ok) + '" data-na="' + idx + '">' + (ok ? 'Transformer' : 'Ressources insuf.') + '</button>' +
              '</div>';
          });
          html += '</div>';
        }
        // Hint bucherons
        if (def.id === 'lumber' && a.count < 5) {
          var plainN = 0;
          self.bm.grid.getNeighbors(cell.q, cell.r).forEach(function(n) {
            if (n.isRevealed && !n.building && n.type === CELL_TYPE.PLAIN) plainN++;
          });
          if (plainN > 0) {
            html += '<div class="bp-hint">\uD83C\uDF32 ' + plainN + ' plaine(s) : plantez une foret dessus pour obtenir un bosquet.</div>';
          }
        }
      }

      // Production
      if (info.connected && Object.keys(info.production).length > 0) {
        html += '<div class="bp-prod-badges">';
        Object.entries(info.production).forEach(function(e) {
          html += '<span class="bp-prod-badge">+' + e[1] + ' ' + (RES_ICONS[e[0]] || e[0]) + '/s</span>';
        });
        html += '</div>';
      } else if (!info.connected) {
        html += '<div style="font-size:11px;color:#e08080;margin-bottom:6px">🔴 Pas de route — prod = 0. Posez une route sur une case PLAINE adjacente.</div>';
      } else if (info.adjInfo && info.adjInfo.count === 0) {
        html += '<div style="font-size:11px;color:#a08060;margin-bottom:6px">Aucune case ' + info.adjInfo.label + ' — prod = 0.</div>';
      }
      var tb = this.tm ? this.tm.getBonusProductionPct(cell.building) : 0;
      if (tb > 0) html += '<div style="font-size:10px;color:#c0a0ff;margin-bottom:4px">\uD83E\uDDE0 Bonus talents : +' + tb + '%</div>';
    }

    // Actions
    html += '<div class="bp-bld-actions">';
    if (lvl >= max) {
      html += '<span class="bp-max-lvl-tag">\u2B50 Niveau Max</span>';
    } else {
      var cost = info.upgradeCost, canUp = this.rm.canAfford(cost);
      html += '<button class="bp-upgrade-btn' + self._lock(canUp) + '" data-action="upgrade">' +
        '\u2B06 Niv.' + (lvl + 1) + ' / ' + max +
        '<span class="bp-upgrade-cost">' + self._costInline(cost) + '</span>' +
        '</button>';
    }
    html += '<button class="bp-demolish-btn" data-action="demolish">🔨 Demolir</button>';
    html += '</div>';

    body.innerHTML = html;
  }

  // ── UI Base Cachee (Ruines Antiques) ───────────────────────
  _renderBaseHiddenUI(cell, body) {
    var self = this;
    var isHiddenBase = !!cell.isHiddenBase; // vraie base améliorable
    var lvl = cell.baseLevel || 1;
    var pm = window.game && window.game.prestigeManager;
    var pct = ((lvl - 1) / 4) * 100;
    var bonus = pm ? pm.getBaseBonus(lvl) : 0;

    if (!isHiddenBase) {
      // === RUINE DÉCORATIVE : pas d'amélioration ===
      var html = '<div class="bp-bld-header">' +
        '<span class="bp-bld-glyph">⛩️</span>' +
        '<div><div class="bp-bld-name">Ruines Antiques</div>' +
        '<div class="bp-bld-lvl" style="color:#a08060">Vestiges d\'une civilisation passée</div></div>' +
        '</div>';
      if (cell.isHeritage) {
        html += '<div style="font-size:11px;color:#c090ff;margin-bottom:6px">👻 Spectre d\'héritage — Mémoire des anciens.</div>';
      }
      html += '<div style="font-size:11px;color:#888;margin-top:8px;text-align:center;padding:8px;background:rgba(255,255,255,0.04);border-radius:6px">' +
        '🏚️ Ces ruines ne peuvent pas être améliorées.<br>' +
        '<span style="color:#c8961a">Cherche les Bases Cachées ✦ pour progresser vers le Prestige.</span>' +
        '</div>';
      body.innerHTML = html;
      return;
    }

    // === BASE CACHÉE AMÉLIORABLE ===
    var html = '<div class="bp-bld-header">' +
      '<span class="bp-bld-glyph" style="filter:drop-shadow(0 0 6px #b060ff)">🏛️</span>' +
      '<div><div class="bp-bld-name" style="color:#c090ff">✦ Base Cachée</div>' +
      '<div class="bp-bld-lvl">Niveau ' + lvl + ' / 5' + (bonus > 0 ? ' — <span style="color:#c8e060">+' + bonus + '% prod.</span>' : '') + '</div></div>' +
      '</div>' +
      '<div class="bp-lvlbar-track"><div class="bp-lvlbar-fill" style="width:' + pct + '%;background:linear-gradient(90deg,#7030c0,#b060ff)"></div></div>';

    if (bonus > 0) {
      html += '<div class="bp-prod-badges"><span class="bp-prod-badge" style="background:rgba(176,96,255,0.15);color:#c090ff">✨ +' + bonus + '% production globale</span></div>';
    }

    if (cell.isHeritage) {
      html += '<div style="font-size:11px;color:#c090ff;margin-bottom:6px">👻 Spectre d\'héritage — Mémoire des anciens.</div>';
    }

    if (lvl < 5) {
      var check = pm ? pm.canUpgradeBase(cell) : { ok: false, reason: 'Chargement...' };
      var cost = pm ? pm.getBaseUpgradeCost(lvl) : null;
      html += '<div class="bp-bld-actions">';
      html += '<button class="bp-upgrade-btn' + self._lock(check.ok) + '" data-action="base-upgrade" style="' +
        (check.ok ? 'background:linear-gradient(135deg,#5020a0,#8040d0);border-color:#b060ff' : '') + '">' +
        '✦ Améliorer Niv.' + (lvl + 1) +
        (cost ? '<span class="bp-upgrade-cost">' + self._costInline(cost) + '</span>' : '') +
        '</button>';
      if (!check.ok && check.reason) {
        html += '<div style="font-size:10px;color:#e08060;margin-top:4px;text-align:center">' + check.reason + '</div>';
      }
      html += '</div>';
    } else {
      html += '<div class="bp-max-lvl-tag" style="display:block;text-align:center;margin-top:8px;color:#b060ff;background:rgba(176,96,255,0.1);border:1px solid #b060ff;border-radius:6px;padding:6px">⭐ Niveau Maximum — Condition Prestige remplie !</div>';
    }

    body.innerHTML = html;
  }

  // ── UI Autel de Prométhée ────────────────────────────────



  // ── Zones Divines (Phase 8) ─────────────────────────────
  _renderZonesTab(el) {
    var self = this;
    var zm   = this.zm || (window.game && window.game.zoneManager);
    var pm   = window.game && window.game.prestigeManager;
    var rm   = this.rm;

    if (!zm) {
      el.innerHTML = '<div style="padding:24px;text-align:center;color:#888">Zones non initialisées.</div>';
      return;
    }

    var zones    = zm.getZoneUIData();
    var curses   = zm.getActiveCurses();
    var ether    = rm ? Math.floor(rm.get('ether')) : 0;
    var liveScore = pm ? pm.getLiveScore() : 0;

    // ── En-tête ──────────────────────────────────────────
    var html =
      '<div class="zn-wrap">' +

      // Résumé malédictions actives
      (curses.length > 0 ?
        '<div class="zn-curse-bar">' +
          '<span class="zn-curse-icon">⚠️</span>' +
          '<span class="zn-curse-text">' + curses.length + ' malédiction(s) active(s) — Production ×' +
            zm.getCurseMult().toFixed(2) + '</span>' +
        '</div>'
      : '') +

      // Score actuel
      '<div class="zn-score-row">' +
        '<span class="zn-score-label">⭐ Score Renaissance actuel</span>' +
        '<span class="zn-score-val">' + liveScore.toLocaleString() + '</span>' +
      '</div>';

    // ── Craft slots actifs ───────────────────────────────
    var crafting = zones.filter(function(z){ return z.state.craftStarted && !z.state.craftDone; });
    if (crafting.length > 0) {
      html += '<div class="zn-craft-active">';
      crafting.forEach(function(z) {
        var pct = Math.round((z.state.craftProgress / z.def.keyCraftTime) * 100);
        var rem = Math.ceil(z.def.keyCraftTime - z.state.craftProgress);
        html +=
          '<div class="zn-craft-slot" data-craft-zone="' + z.def.id + '">' +
            '<span>' + z.def.icon + ' Clé de ' + z.def.god + '</span>' +
            '<div class="zn-craft-bar"><div class="zn-craft-fill" style="width:' + pct + '%;background:' + z.def.color + ';transition:width 0.5s linear"></div></div>' +
            '<span class="zn-craft-rem">' + rem + 's</span>' +
          '</div>';
      });
      html += '</div>';
    }

    // ── Cartes de zones ──────────────────────────────────
    html += '<div class="zn-grid">';

    zones.forEach(function(z) {
      var def   = z.def;
      var state = z.state;
      var conds = z.conditions;
      var stage = z.stage;

      var statusClass = state.unlocked ? 'zn-card-unlocked' : (stage ? 'zn-card-cursed' : 'zn-card-locked');
      var statusLabel = state.unlocked ? '✅ Conquise' :
                        (stage ? ('⚠️ ' + stage.label) : '🔒 Verrouillée');

      html += '<div class="zn-card ' + statusClass + '" style="--zone-color:' + def.color + '">' +

        // Header carte
        '<div class="zn-card-head">' +
          '<span class="zn-card-icon">' + def.icon + '</span>' +
          '<div class="zn-card-info">' +
            '<div class="zn-card-name" style="color:' + def.color + '">' + def.god + '</div>' +
            '<div class="zn-card-biome">' + def.biome + '</div>' +
          '</div>' +
          '<div class="zn-card-status ' + statusClass + '">' + statusLabel + '</div>' +
        '</div>';

      if (state.unlocked) {
        // Zone conquise : affiche production
        html +=
          '<div class="zn-prod">' +
            Object.entries(def.zoneProduction).map(function(e) {
              var icon = (window.RES_ICONS && window.RES_ICONS[e[0]]) || '▶';
              var name2 = (window.RES_NAMES && window.RES_NAMES[e[0]]) || e[0];
              return '<span class="zn-prod-item"><span class="zn-prod-icon">' + icon + '</span>'
                + '<span class="zn-prod-val">+' + e[1] + '</span>'
                + '<span class="zn-prod-name">' + name2 + '/s</span></span>';
            }).join('') +
          '</div>';
        if (state.residualCurse && !state.templeBuilt) {
          html += '<div class="zn-residual">⚠️ Malédiction résiduelle -10% — construisez un Temple</div>';
        }
      } else {
        // Conditions
        html += '<div class="zn-conds">';
        conds.forEach(function(c) {
          var ci = c.ok ? 'zn-cond-ok' : 'zn-cond-no';
          var val = c.value ? ' (' + c.value + ')' : '';
          if (c.crafting) {
            var pct2 = Math.round((c.progress / c.total) * 100);
            html += '<div class="zn-cond ' + ci + '" data-craft-cond="' + def.id + '">' +
              (c.ok ? '✅' : '⚙️') + ' ' + c.label +
              '<div class="zn-craft-bar-sm"><div class="zn-craft-fill-sm" style="width:' + pct2 + '%;background:' + def.color + ';height:100%;border-radius:2px;transition:width 0.5s linear"></div></div>' +
            '</div>';
          } else {
            html += '<div class="zn-cond ' + ci + '">' +
              (c.ok ? '✅' : '⬜') + ' ' + c.label + val + '</div>';
          }
        });
        html += '</div>';

        // Bouton craft
        if (!state.craftStarted && !state.craftDone) {
          var ingList = Object.entries(def.keyIngredients).map(function(e) {
            var icon = (window.RES_ICONS && window.RES_ICONS[e[0]]) || '';
            return icon + ' ' + e[1] + ' ' + ((window.RES_NAMES && window.RES_NAMES[e[0]]) || e[0]);
          }).join(', ');
          var canAfford = rm ? rm.canAfford(def.keyIngredients) : false;
          var slotsFull = crafting.length >= z.maxCraftSlots;
          html +=
            '<div class="zn-key-section">' +
              '<div class="zn-key-label">🗝️ Clé Divine (' + def.keyCraftTime + 's) : ' + ingList + '</div>' +
              (slotsFull ?
                '<button class="zn-btn zn-btn-disabled">Slots pleins (' + z.maxCraftSlots + '/' + z.maxCraftSlots + ')</button>' :
                '<button class="zn-btn' + (canAfford ? '' : ' zn-btn-disabled') + '" data-zone-craft="' + def.id + '">' +
                  (canAfford ? '⚒️ Crafter la Clé' : '🔒 Ressources insuffisantes') + '</button>'
              ) +
            '</div>';
        } else if (state.craftDone) {
          html += '<div class="zn-key-ready">🗝️ Clé Divine prête !</div>';
        }

        // Rituel Déméter
        if (def.id === 'demeter' && !state.ritualDone) {
          var hasAmbroisie = rm ? rm.canAfford({ ambroisie: def.ritualAmount }) : false;
          html +=
            '<div class="zn-ritual-section">' +
              '<div class="zn-ritual-label">🕯️ ' + def.ritual + '</div>' +
              '<button class="zn-btn' + (hasAmbroisie ? '' : ' zn-btn-disabled') + '" data-zone-ritual="demeter">' +
                (hasAmbroisie ? '🌿 Accomplir le Rituel (-' + def.ritualAmount + ' Ambroisie)' : '🔒 ' + def.ritualAmount + ' Ambroisie requise') +
              '</button>' +
            '</div>';
        }

        // Bouton déverrouillage
        if (z.canUnlock) {
          html +=
            '<button class="zn-btn zn-btn-unlock" data-zone-unlock="' + def.id + '">' +
              '⚡ Conquérir la Zone de ' + def.god + ' !</button>';
        }

        // Malédiction en cours
        if (stage) {
          var mins = Math.floor(state.curseMinutes || 0);
          html +=
            '<div class="zn-curse-detail">' +
              '<span>💀 ' + stage.label + '</span>' +
              '<span class="zn-curse-timer">' + mins + ' min</span>' +
            '</div>';
        }
      }

      html += '</div>'; // zn-card
    });

    html += '</div></div>'; // zn-grid + zn-wrap
    el.innerHTML = html;

    // ── Bind boutons ────────────────────────────────────
    function bindZoneButtons() {
      el.querySelectorAll('[data-zone-craft]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var zoneId = btn.dataset.zoneCraft;
          var result = zm.startCraft(zoneId);
          if (!result.ok) {
            EventBus.emit('ui:feedback', { text: result.reason, x: window.innerWidth/2, y: window.innerHeight/2, color: '#e05050' });
          }
          self._renderZonesTab(el);
        });
      });
      el.querySelectorAll('[data-zone-ritual]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var result = zm.performDemeterRitual();
          if (!result.ok) {
            EventBus.emit('ui:feedback', { text: result.reason, x: window.innerWidth/2, y: window.innerHeight/2, color: '#e05050' });
          }
          // Full re-render so button state updates correctly
          self._renderZonesTab(el);
        });
      });
      el.querySelectorAll('[data-zone-unlock]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var zoneId = btn.dataset.zoneUnlock;
          var ok = zm.unlock(zoneId);
          if (!ok) {
            EventBus.emit('ui:feedback', { text: 'Conditions non remplies.', x: window.innerWidth/2, y: window.innerHeight/2, color: '#e05050' });
          }
          self._renderZonesTab(el);
        });
      });
    }
    bindZoneButtons();

    // ── Live timer: update craft progress bars & counters every second ──
    if (el._zoneTimer) clearInterval(el._zoneTimer);
    el._zoneTimer = setInterval(function() {
      // Only tick if still in zones tab
      if (!el.closest('#tp-body') && !document.contains(el)) {
        clearInterval(el._zoneTimer); return;
      }
      var nowZones = zm.getZoneUIData();
      var anyCrafting = nowZones.some(function(z){ return z.state.craftStarted && !z.state.craftDone; });
      if (!anyCrafting) { clearInterval(el._zoneTimer); return; }

      // Update each craft bar in-place without full re-render
      nowZones.forEach(function(z) {
        if (!z.state.craftStarted || z.state.craftDone) return;
        var pct = Math.round((z.state.craftProgress / z.def.keyCraftTime) * 100);
        var rem = Math.ceil(z.def.keyCraftTime - z.state.craftProgress);

        // Update active craft slot bar (in header section)
        var slot = el.querySelector('[data-craft-zone="' + z.def.id + '"]');
        if (slot) {
          var fill = slot.querySelector('.zn-craft-fill');
          var remEl = slot.querySelector('.zn-craft-rem');
          if (fill) fill.style.width = pct + '%';
          if (remEl) remEl.textContent = rem + 's';
        }
        // Update condition bar inside card
        var condBar = el.querySelector('[data-craft-cond="' + z.def.id + '"]');
        if (condBar) {
          var fill2 = condBar.querySelector('.zn-craft-fill-sm');
          if (fill2) fill2.style.width = pct + '%';
        }
      });
    }, 500);
  }


  // ── Panthéon (Phase 7) ─────────────────────────────────
  _renderPantheonTab(el) {
    var self = this;
    var pan  = this.pan;
    if (!pan) {
      el.innerHTML = '<div style="padding:24px;color:#888;text-align:center">Panthéon non initialisé.</div>';
      return;
    }

    var etherOwned = self.rm ? Math.floor(self.rm.get('ether')) : 0;
    var fmtE = function(v){ return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'k':String(Math.floor(v)); };

    var branches      = pan.getAllBranches();
    var activeBranch  = el._panActiveBranch || branches[0].id;
    var selNode       = el._panSelectedNode || null;

    // ── Helper: hex color to rgb string ──────────────────
    function hexToRgb(hex) {
      if (!hex || hex.length < 7) return '128,128,128';
      var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
      return r+','+g+','+b;
    }

    // ── Build DOM ─────────────────────────────────────────
    el.innerHTML = '<div class="pan2-wrap"></div>';
    var wrap = el.querySelector('.pan2-wrap');

    // Header
    wrap.innerHTML =
      '<div class="pan2-header">' +
        '<span class="pan2-title">⚡ Panthéon des Dieux</span>' +
        '<span class="pan2-ether" id="pan-ether-count">✨ ' + fmtE(etherOwned) + ' Éther</span>' +
      '</div>' +
      '<div class="pan2-layout">' +
        '<nav class="pan2-branches" id="pan2-branches"></nav>' +
        '<div class="pan2-content" id="pan2-content"></div>' +
        '<div class="pan2-detail" id="pan2-detail"></div>' +
      '</div>';

    var navEl    = wrap.querySelector('#pan2-branches');
    var contentEl= wrap.querySelector('#pan2-content');
    var detailEl = wrap.querySelector('#pan2-detail');

    // ── Branch nav buttons ────────────────────────────────
    branches.forEach(function(b) {
      var unlocked = pan.isBranchUnlocked(b.id);
      var learned  = Object.keys(pan.invested||{}).filter(function(k){
        var pn = (typeof PANTHEON_NODES!=='undefined') ? PANTHEON_NODES : {};
        return pn[k] && pn[k].branch === b.id && (pan.invested[k]||0) > 0;
      }).length;
      var btn = document.createElement('button');
      btn.className = 'pan2-branch-btn' + (b.id===activeBranch?' active':'') + (unlocked?'':' locked');
      btn.dataset.branch = b.id;
      btn.style.setProperty('--bc', b.color || '#888');
      btn.innerHTML =
        '<span class="pan2-bb-icon">' + b.icon + '</span>' +
        '<span class="pan2-bb-label">' + b.label + '</span>' +
        (learned>0 ? '<span class="pan2-bb-count" style="background:'+b.color+'">' + learned + '</span>' : '') +
        (!unlocked ? '<span class="pan2-bb-lock">🔒</span>' : '');
      navEl.appendChild(btn);
    });

    // ── Render node detail panel ──────────────────────────
    function renderDetail(nodeId) {
      var PN = (typeof PANTHEON_NODES !== 'undefined') ? PANTHEON_NODES : {};
      var nd = PN[nodeId];
      if (!nd) { detailEl.innerHTML = '<div class="pan2-hint">Clique sur un talent pour voir les détails</div>'; return; }
      var branch = branches.find(function(b){ return b.id === nd.branch; });
      var bc = branch ? branch.color : '#888';
      var rgb = hexToRgb(bc);
      var state = pan.getNodeState(nodeId);
      var check = pan.canLearn(nodeId);
      var pts   = pan.invested[nodeId] || 0;

      var stateLabel = state==='learned' ? '✅ Acquis' : state==='available' ? '🟡 Disponible' : '🔒 Verrouillé';
      var stateColor = state==='learned' ? '#60e060' : state==='available' ? '#f0c840' : '#808080';

      var prereqHtml = '';
      if (nd.requires && nd.requires.length > 0) {
        prereqHtml = '<div class="pan2-d-prereq">🔗 Prérequis : ' +
          nd.requires.map(function(rId){
            var rn = PN[rId]; var ok = (pan.invested[rId]||0)>0;
            return '<span style="color:'+(ok?'#60e060':'#e06060')+'">'+(rn?rn.name:rId)+'</span>';
          }).join(', ') + '</div>';
      }

      var buyDisabled = (state==='learned' && !nd.uncapped) || !check.ok;
      var buyLabel = state==='learned' && !nd.uncapped ? '✅ Acquis'
                  : nd.uncapped ? '✨ +'+ nd.cost +' Éther (' + (pts>0?'×'+pts+' — ':'')+' sans limite)'
                  : check.ok    ? '✨ Apprendre — ' + nd.cost + ' Éther'
                  : '🔒 ' + (check.reason || 'Indisponible');

      detailEl.innerHTML =
        '<div class="pan2-d-wrap" style="--bc:'+bc+';--rgb:'+rgb+'">' +
          '<div class="pan2-d-head">' +
            '<div class="pan2-d-hex"><svg viewBox="0 0 60 70" width="56" height="64">' +
              '<polygon points="30,2 56,17 56,53 30,68 4,53 4,17" fill="rgba('+rgb+',0.25)" stroke="'+bc+'" stroke-width="2.5"/>' +
              '<text x="30" y="43" text-anchor="middle" font-size="24">'+nd.icon+'</text></svg></div>' +
            '<div class="pan2-d-info">' +
              '<div class="pan2-d-name">'+nd.name+'</div>' +
              '<div class="pan2-d-branch" style="color:'+bc+'">'+( branch?branch.icon+' '+branch.label:'')+'</div>' +
              '<div class="pan2-d-ring">Anneau ' + nd.ring + (nd.uncapped?' · ∞':'')+' · Coût : '+nd.cost+' ✨</div>' +
            '</div>' +
          '</div>' +
          '<div class="pan2-d-state" style="color:'+stateColor+'">'+stateLabel+(pts>1?' (×'+pts+')':state==='learned'&&pts===1?' (×1)':'')+'</div>' +
          '<div class="pan2-d-desc">'+nd.desc+'</div>' +
          prereqHtml +
          '<button class="pan2-d-buy'+(buyDisabled?' disabled':'')+'" data-buy-node="'+nodeId+'"'+(buyDisabled?' disabled':'')+'>'+buyLabel+'</button>' +
        '</div>';
    }

    // ── Render branch nodes grid ──────────────────────────
    function renderBranchContent(branchId) {
      activeBranch = branchId;
      el._panActiveBranch = branchId;
      navEl.querySelectorAll('.pan2-branch-btn').forEach(function(b){
        b.classList.toggle('active', b.dataset.branch === branchId);
      });

      var branch   = branches.find(function(b){ return b.id === branchId; });
      var unlocked = pan.isBranchUnlocked(branchId);

      if (!unlocked) {
        contentEl.innerHTML =
          '<div class="pan2-locked-branch">' +
          '<div style="font-size:48px">'+branch.icon+'</div>' +
          '<div style="font-size:18px;color:'+branch.color+';margin:8px 0">'+branch.label+'</div>' +
          '<div style="color:#888;font-size:13px">Branche verrouillée</div>' +
          '<div style="color:#666;font-size:11px;margin-top:4px">Débloquez la zone correspondante (Phase 8)</div>' +
          '</div>';
        return;
      }

      // Get nodes for this branch, sorted ring→slot
      var PN = (typeof PANTHEON_NODES !== 'undefined') ? PANTHEON_NODES : {};
      var bNodes = Object.keys(PN).filter(function(k){ return PN[k].branch===branchId; })
        .map(function(k){ return Object.assign({},PN[k],{id:k}); })
        .sort(function(a,b){ return a.ring!==b.ring ? a.ring-b.ring : a.slot-b.slot; });

      var byRing = {1:[],2:[],3:[]};
      bNodes.forEach(function(nd){ (byRing[nd.ring]||(byRing[nd.ring]=[])).push(nd); });

      var ringDefs = [
        {ring:1,label:'Anneau I — Fondements',   color:'#b09060'},
        {ring:2,label:'Anneau II — Synergies',    color:'#60a0c8'},
        {ring:3,label:'Anneau III — Maîtrise ∞',  color:'#c080f0'},
      ];

      var bc = branch.color || '#888';
      var html = '';
      ringDefs.forEach(function(rd) {
        var rNodes = byRing[rd.ring]||[];
        if (!rNodes.length) return;
        html += '<div class="pan2-ring-section"><div class="pan2-ring-label" style="color:'+rd.color+'">'+rd.label+'</div><div class="pan2-ring-grid">';
        rNodes.forEach(function(nd) {
          var state     = pan.getNodeState(nd.id);
          var pts       = pan.invested[nd.id] || 0;
          var isSel     = nd.id === selNode;
          var isLearned = state==='learned';
          var isAvail   = state==='available';
          var rgb = hexToRgb(bc);
          var borderCol = isLearned ? bc : isAvail ? '#c89620' : 'rgba(80,60,120,0.4)';
          var fillCol   = isLearned ? 'rgba('+rgb+',0.22)' : isAvail ? 'rgba(200,150,26,0.10)' : 'rgba(20,15,35,0.6)';
          var selStyle  = isSel ? 'box-shadow:0 0 0 2px #f0c840,0 0 14px rgba(240,200,64,0.55);' : '';
          html +=
            '<div class="pan2-node'+(isLearned?' learned':isAvail?' avail':'')+'" data-pannode="'+nd.id+'"'+
            ' style="border-color:'+borderCol+';background:'+fillCol+';'+selStyle+'">' +
            '<div class="pan2-node-hex"><svg viewBox="0 0 60 70" width="44" height="50">' +
              '<polygon points="30,2 56,17 56,53 30,68 4,53 4,17" fill="'+fillCol+'" stroke="'+borderCol+'" stroke-width="2.5"'+
              (isSel?' filter="drop-shadow(0 0 6px #f0c840)"':'')+'/>' +
              (isLearned?'<polygon points="30,2 56,17 56,53 30,68 4,53 4,17" fill="rgba('+rgb+',0.15)"/>':'') +
              '<text x="30" y="43" text-anchor="middle" font-size="20">'+nd.icon+'</text>' +
            '</svg></div>' +
            '<div class="pan2-node-name">'+nd.name+'</div>' +
            (nd.uncapped&&pts>0?'<div class="pan2-node-pts">×'+pts+'</div>':'') +
            (isLearned&&!nd.uncapped?'<div class="pan2-node-check">✅</div>':'') +
            '</div>';
        });
        html += '</div></div>';
      });
      contentEl.innerHTML = html;

      if (selNode) renderDetail(selNode);
      else detailEl.innerHTML = '<div class="pan2-hint">← Sélectionne un talent</div>';
    }

    // ── Events (use .onclick to avoid accumulation) ───────
    navEl.onclick = function(e) {
      var btn = e.target.closest('.pan2-branch-btn');
      if (!btn || btn.classList.contains('locked')) return;
      renderBranchContent(btn.dataset.branch);
    };

    contentEl.onclick = function(e) {
      var card = e.target.closest('[data-pannode]');
      if (!card) return;
      selNode = card.dataset.pannode;
      el._panSelectedNode = selNode;
      // Update selection highlight
      contentEl.querySelectorAll('[data-pannode]').forEach(function(c2){
        var isSel = c2.dataset.pannode === selNode;
        if (isSel) c2.style.boxShadow = '0 0 0 2px #f0c840,0 0 14px rgba(240,200,64,0.55)';
        else c2.style.boxShadow = '';
      });
      renderDetail(selNode);
    };

    detailEl.onclick = function(e) {
      var btn = e.target.closest('[data-buy-node]');
      if (!btn || btn.disabled) return;
      var nodeId = btn.dataset.buyNode;
      if (pan.learn(nodeId, e.clientX, e.clientY)) {
        var etherEl = document.getElementById('pan-ether-count');
        if (etherEl) etherEl.textContent = '✨ ' + fmtE(self.rm ? self.rm.get('ether') : 0) + ' Éther';
        // Refresh current branch
        renderBranchContent(activeBranch);
        renderDetail(nodeId);
      }
    };

    renderBranchContent(activeBranch);
    if (selNode) renderDetail(selNode);
    else detailEl.innerHTML = '<div class="pan2-hint">← Sélectionne un talent pour voir les détails</div>';
  }


  // ── Liaison événements ──────────────────────────────────
  _bindEvents() {
    var self = this;

    // Clic sur une case de la carte → ouvrir le drawer
    EventBus.on('cell:click', function(d) {
      var cell = d.cell;
      if (!cell) return;
      var sx = d.screenX || window.innerWidth / 2;
      var sy = d.screenY || window.innerHeight / 2;

      // Clic dans le vide -> ferme le slider
      if (!cell) { self.hide(); return; }

      // Case cachee -> fouille silencieuse + ferme le slider
      if (cell.isHidden) {
        var digMult = window._debugClickMultiplier || 1;
        for (var _di = 0; _di < digMult; _di++) { if (!self.bm.digCell(cell, sx, sy)) break; }
        self.hide();
        return;
      }

      // Case revelee deja selectionnee -> toggle (ferme)
      if (self.currentCell && self.currentCell.key === cell.key) {
        self.hide();
        return;
      }

      // Case revelee -> ouvre le drawer
      self.open(cell);
    });

    // Rafraîchissements réactifs
    EventBus.on('cell:revealed',       function(d) { if (self.currentCell && self.currentCell.key === d.cell.key) self.refresh(); });
    // resources:updated géré par le HUD uniquement (pas de refresh panel à chaque tick)
    EventBus.on('talent:applied',      function()  { if (self.currentCell) self.refresh(); });

    EventBus.on('road:placed',         function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('road:removed',        function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('terrain:transformed', function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('building:built',      function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('scout:revealed',      function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('base:upgraded',       function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('prestige:bonus_updated', function() { if (self.currentCell) self.refresh(); });
    EventBus.on('resources:updated',   function()  { if (self.currentCell) self.refresh(); });
  }

}
