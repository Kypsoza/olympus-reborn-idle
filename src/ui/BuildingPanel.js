/* BuildingPanel.js — v0.6.0
   Drawer coulissant en bas de l'ecran (remplace le tooltip flottant)
*/

class BuildingPanel {
  constructor(bm, rm, tm, pm, zm) {
    this.bm = bm; this.rm = rm; this.tm = tm; this.pm_pan = pm; this.zm = zm;
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
    document.getElementById('bp-body').addEventListener('click', e => this._handleBodyClick(e));
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
    function buildRuneBg(w, h, count) {
      var s = '';
      for (var i = 0; i < count; i++) {
        var rx = 10 + (i * 137.5) % (w - 20);
        var ry = 20 + (i * 73.1)  % (h - 30);
        var sz = 16 + (i % 4) * 6;
        var op = 0.04 + (i % 3) * 0.025;
        var ch = RUNE_CHARS[i % RUNE_CHARS.length];
        s += '<text x="' + rx.toFixed(0) + '" y="' + ry.toFixed(0) + '"'
          + ' font-size="' + sz + '" fill="rgba(200,160,255,' + op.toFixed(3) + ')"'
          + ' font-family="serif" style="pointer-events:none;user-select:none">' + ch + '</text>';
      }
      return s;
    }

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
      s += '<rect width="' + VW + '" height="' + VH + '" fill="rgba(8,5,18,0.9)"/>';
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
          if (_sw) { _sw.innerHTML = '<div style="min-width:'+VW+'px">'+buildSVG()+'</div>'; bindSVG(_sw.querySelector('#dt-svg')); }
        });
      });
    }
    bindSVG(el.querySelector('#dt-svg'));

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
      scrollWrap.innerHTML = '<div style="min-width:' + VW + 'px">' + buildSVG() + '</div>';
      bindSVG(scrollWrap.querySelector('#dt-svg'));
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

      s += '<rect width="' + VW + '" height="' + VH + '" fill="url(#etbg)"/>';

      // Runes animées (style cohérent avec Drachmes)
      var ET_RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
      s += '<style>@keyframes erG{0%{opacity:0.04}40%{opacity:0.15;fill:rgba(255,140,40,0.22)}60%{opacity:0.09;fill:rgba(180,80,255,0.16)}100%{opacity:0.04}}.er{animation:erG 3.5s ease-in-out infinite;pointer-events:none}.er.ep1{animation-delay:1.1s}.er.ep2{animation-delay:2.2s}</style>';
      for (var ri = 0; ri < 24; ri++) {
        var erx = 10 + (ri * 137.5) % (VW - 20);
        var ery = 20 + (ri * 73.1)  % (VH - 30);
        var ersz = 18 + (ri % 4) * 5;
        var erph = ['','ep1','ep2'][ri%3];
        s += '<text x="' + erx.toFixed(0) + '" y="' + ery.toFixed(0) + '"'
          + ' class="er ' + erph + '"'
          + ' font-size="' + ersz + '" fill="rgba(180,120,255,0.06)"'
          + ' font-family="serif">'
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
           + (_etSelected===id ? ' class="et-node-selected"' : '')
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

    function showTooltip(id) {
      ttBox.innerHTML = buildTooltipHtml(id);
      ttBox.dataset.node = id;
    }

    svgEl.addEventListener('click', function(e) {
      var c = e.target.closest('[data-enode]'); if (!c) return;
      var nid = c.dataset.enode;
      _etSelected = nid;
      showTooltip(nid);
      // Refresh SVG to show selection
      var newDiv = document.createElement('div');
      newDiv.innerHTML = buildSVG();
      var newSvg = newDiv.firstChild;
      svgEl.parentNode.replaceChild(newSvg, svgEl);
      svgEl = el.querySelector('#et-svg');
      svgEl.addEventListener('click', arguments.callee);
    });

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
    var frag = document.createDocumentFragment();

    /* Bâtiments constructibles */
    available.forEach(function(def) {
      if (!def) return;
      var check = self.bm.canBuild(cell, def.id);
      var eraLocked = def.era && def.era > 1 && self.tm && self.tm.getUnlockedEra() < def.era;

      var hexEl = document.createElement('div');
      var cls = 'hex-btn';
      if (!check.ok) cls += ' hex-locked';
      if (check.ok) cls += ' hex-ok';
      if (eraLocked) cls += ' hex-era-locked';
      hexEl.className = cls;
      hexEl.dataset.id = def.id;

      // Coût mini à afficher sous l'icône
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

      /* PC : hover tooltip */
      if (window.innerWidth > 600) {
        hexEl.addEventListener('mouseenter', function(){ showTT(hexEl, def, check); });
        hexEl.addEventListener('mouseleave', function(){ if (!tt.dataset.pinned) hideTT(); });
      }

      frag.appendChild(hexEl);
    });

    /* Séparateur si bâtiments + actions terrain */
    if (available.length > 0 && (hasRoadAction || transforms.length > 0)) {
      var sep = document.createElement('div');
      sep.className = 'hex-separator';
      frag.appendChild(sep);
    }

    /* Route */
    if (hasRoadAction) {
      var roadEl = document.createElement('div');
      var rc = self.bm.canPlaceRoad(cell);
      if (cell.hasRoad) {
        var rr = self.bm.canRemoveRoad(cell);
        roadEl.className = 'hex-btn hex-action hex-danger' + (rr.ok ? '' : ' hex-locked');
        roadEl.dataset.action = 'road-remove';
        roadEl.innerHTML =
          '<div class="hex-bg">' + hexSVG() + '</div>' +
          '<span class="hex-icon">🗑️</span>' +
          '<span class="hex-label">Démolir Route</span>';
      } else {
        roadEl.className = 'hex-btn hex-action' + (rc.ok ? ' hex-ok' : ' hex-locked');
        roadEl.dataset.action = 'road';
        roadEl.innerHTML =
          '<div class="hex-bg">' + hexSVG() + '</div>' +
          '<span class="hex-icon">🛤️</span>' +
          '<span class="hex-label">Route</span>' +
          '<span class="hex-cost' + (rc.ok ? '' : ' short') + '">30🪙 10🪵</span>';
      }
      frag.appendChild(roadEl);
    }

    /* Transformations terrain */
    transforms.forEach(function(tr) {
      var ok = self.rm.canAfford(tr.cost);
      var trEl = document.createElement('div');
      trEl.className = 'hex-btn hex-action' + (ok ? ' hex-ok' : ' hex-locked');
      trEl.dataset.transform = tr.targetType;
      var firstCost = Object.entries(tr.cost)[0];
      var trCost = firstCost ? ((RES_ICONS[firstCost[0]]||firstCost[0]) + ' ' + self._fmt(firstCost[1])) : '';
      trEl.innerHTML =
        '<div class="hex-bg">' + hexSVG() + '</div>' +
        '<span class="hex-icon">' + tr.glyph + '</span>' +
        '<span class="hex-label">' + tr.label + '</span>' +
        (trCost ? '<span class="hex-cost' + (ok ? '' : ' short') + '">' + trCost + '</span>' : '');
      frag.appendChild(trEl);
    });

    if (available.length === 0 && !hasRoadAction && transforms.length === 0) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'bp-empty-msg';
      emptyMsg.textContent = 'Aucune action disponible ici.';
      frag.appendChild(emptyMsg);
    }

    body.appendChild(frag);

    /* ── Délégation de clics sur le body ──────────────── */
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
          '<div class="zn-craft-slot">' +
            '<span>' + z.def.icon + ' Clé de ' + z.def.god + '</span>' +
            '<div class="zn-craft-bar"><div class="zn-craft-fill" style="width:' + pct + '%;background:' + z.def.color + '"></div></div>' +
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
            Object.entries(def.zoneProduction).map(function(e){ return '▶ +' + e[1] + ' ' + e[0] + '/s'; }).join('  ') +
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
            html += '<div class="zn-cond ' + ci + '">' +
              (c.ok ? '✅' : '⚙️') + ' ' + c.label +
              '<div class="zn-craft-bar-sm"><div style="width:' + pct2 + '%;background:' + def.color + ';height:100%;border-radius:2px"></div></div>' +
            '</div>';
          } else {
            html += '<div class="zn-cond ' + ci + '">' +
              (c.ok ? '✅' : '⬜') + ' ' + c.label + val + '</div>';
          }
        });
        html += '</div>';

        // Bouton craft
        if (!state.craftStarted && !state.craftDone) {
          var ingList = Object.entries(def.keyIngredients).map(function(e){ return e[1] + ' ' + e[0]; }).join(', ');
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
        var zoneId = btn.dataset.zoneRitual;
        var result = zm.performDemeterRitual();
        if (!result.ok) {
          EventBus.emit('ui:feedback', { text: result.reason, x: window.innerWidth/2, y: window.innerHeight/2, color: '#e05050' });
        }
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


  // ── Panthéon (Phase 7) ─────────────────────────────────
  _renderPantheonTab(el) {
    var self = this;
    var pan  = this.pm_pan || (window.game && window.game.pantheonManager);
    if (!pan) {
      el.innerHTML = '<div style="padding:24px;text-align:center;color:#888">Panthéon non initialisé.</div>';
      return;
    }

    // Contenu HTML : header info + canvas Albion
    var ether = this.rm ? Math.floor(this.rm.get('ether')) : 0;
    var fmtE  = function(v){ return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'k':String(v); };

    el.innerHTML =
      '<div id="pan-wrap">' +
        '<div id="pan-header">' +
          '<div id="pan-title">🏛️ Panthéon Olympien</div>' +
          '<div id="pan-ether-count">✨ ' + fmtE(ether) + ' Éther</div>' +
          '<div id="pan-hint">Cliquez un nœud · Molette/pinch pour zoomer · Glisser pour déplacer</div>' +
        '</div>' +
        '<div id="pan-canvas-wrap">' +
          '<canvas id="pan-canvas"></canvas>' +
        '</div>' +
        '<div id="pan-tooltip" class="pan-tt hidden"></div>' +
      '</div>';

    // Laisser le DOM s'insérer avant d'initialiser le canvas
    requestAnimationFrame(function() {
      self._initPantheonCanvas(pan, el);
    });
  }

  _initPantheonCanvas(pan, container) {
    var self   = this;
    var canvas = document.getElementById('pan-canvas');
    if (!canvas) return;

    var wrap = document.getElementById('pan-canvas-wrap');
    var W = wrap.offsetWidth  || 800;
    var H = wrap.offsetHeight || 600;
    canvas.width  = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    // Layout
    var CX = W / 2, CY = H / 2;
    var RING_R = [0, 160, 310, 460];   // rayons plus grands pour éviter les chevauchements
    var NODE_R = 26;                   // nœuds plus grands

    // Couleurs
    var BRANCH_COLOR = {};
    pan.getAllBranches().forEach(function(b){ BRANCH_COLOR[b.id] = b.color; });

    // État caméra (pan/zoom)
    var cam = { x: 0, y: 0, scale: 1 };
    var drag = { active: false, sx: 0, sy: 0, cx: 0, cy: 0 };
    var pinchDist = null;

    // Précalcul positions des nœuds
    var nodePos = {};  // nodeId → {x, y, branchId, ring, slot}
    var NODES   = pan.getAllNodes();
    var BRANCHES= pan.getAllBranches();

    BRANCHES.forEach(function(branch) {
      var angle = branch.angle;
      // 5 nœuds par anneau, disposés en éventail autour de l'angle principal
      [1,2,3].forEach(function(ring) {
        for (var slot = 0; slot < 5; slot++) {
          var nodeId = null;
          // Chercher le nœud correspondant
          for (var nid in NODES) {
            var nd = NODES[nid];
            if (nd.branch === branch.id && nd.ring === ring && nd.slot === slot) {
              nodeId = nid; break;
            }
          }
          if (!nodeId) return;
          var r = RING_R[ring];
          // Spread angulaire : -2 à +2 slots * 0.22 rad (plus espacé)
          var spread = (slot - 2) * 0.22;
          var a = angle + spread;
          nodePos[nodeId] = { x: CX + Math.cos(a)*r, y: CY + Math.sin(a)*r, branchId: branch.id, ring: ring, slot: slot };
        }
      });
    });

    // ── Dessin ──────────────────────────────────────────────
    function toScreen(wx, wy) {
      return { x: (wx - CX) * cam.scale + CX + cam.x, y: (wy - CY) * cam.scale + CY + cam.y };
    }
    function toWorld(sx, sy) {
      return { x: (sx - CX - cam.x) / cam.scale + CX, y: (sy - CY - cam.y) / cam.scale + CY };
    }

    // Dessine un hexagone centré sur (cx,cy) de rayon r
    function drawHex(cx, cy, r) {
      ctx.beginPath();
      for (var i = 0; i < 6; i++) {
        var ang = (Math.PI / 180) * (60 * i - 30);
        var px = cx + r * Math.cos(ang), py = cy + r * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    // Runes mythologiques (positions fixes dans l'espace monde)
    var RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
    var runePositions = [];
    if (!window._pan_runes || window._pan_runes_W !== W) {
      window._pan_runes_W = W;
      window._pan_runes = [];
      for (var ri = 0; ri < 28; ri++) {
        var angle = (ri / 28) * Math.PI * 2 + Math.random() * 0.8;
        var dist  = 80 + Math.random() * 440;
        window._pan_runes.push({
          x: CX + Math.cos(angle) * dist,
          y: CY + Math.sin(angle) * dist,
          ch: RUNES[ri % RUNES.length],
          opacity: 0.04 + Math.random() * 0.07,
          size: 18 + Math.random() * 22,
        });
      }
    }
    runePositions = window._pan_runes;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Fond sombre
      ctx.fillStyle = '#07051a';
      ctx.fillRect(0, 0, W, H);

      // Dégradé radial central (ambiance)
      var sc0 = toScreen(CX, CY);
      var cgrad = ctx.createRadialGradient(sc0.x, sc0.y, 0, sc0.x, sc0.y, 400 * cam.scale);
      cgrad.addColorStop(0, 'rgba(60,20,100,0.18)');
      cgrad.addColorStop(0.5, 'rgba(30,10,60,0.10)');
      cgrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cgrad; ctx.fillRect(0, 0, W, H);

      // Runes animées (scintillement violet/orange)
      var now = Date.now() / 1000;
      ctx.save();
      runePositions.forEach(function(rn, ri) {
        var rs = toScreen(rn.x, rn.y);
        var phase = ri / runePositions.length * Math.PI * 2;
        var flicker = 0.5 + 0.5 * Math.sin(now * 0.9 + phase);
        var isOrange = ri % 3 === 0;
        var baseOp = rn.opacity;
        var animOp = baseOp + flicker * baseOp * 2.5;
        if (isOrange)
          ctx.fillStyle = 'rgba(255,140,40,' + Math.min(animOp, 0.22) + ')';
        else
          ctx.fillStyle = 'rgba(180,80,255,' + Math.min(animOp, 0.18) + ')';
        ctx.font = Math.round(rn.size * cam.scale) + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(rn.ch, rs.x, rs.y);
      });
      ctx.restore();

      // ── Secteurs colorés par dieu ──────────────────────
      var sc0 = toScreen(CX, CY);
      var outerR = (RING_R[3] + 30) * cam.scale;
      BRANCHES.forEach(function(branch) {
        var unlocked = pan.isBranchUnlocked(branch.id);
        var angleRange = Math.PI * 2 / BRANCHES.length;
        var a0 = branch.angle - angleRange * 0.5;
        var a1 = branch.angle + angleRange * 0.5;
        // Secteur rempli (très transparent)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sc0.x, sc0.y);
        ctx.arc(sc0.x, sc0.y, outerR, a0, a1);
        ctx.closePath();
        ctx.fillStyle = branch.color + (unlocked ? '18' : '08');
        ctx.fill();
        ctx.restore();

        // Ligne de division entre secteurs
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sc0.x, sc0.y);
        ctx.lineTo(sc0.x + Math.cos(a0) * outerR, sc0.y + Math.sin(a0) * outerR);
        ctx.strokeStyle = branch.color + (unlocked ? '55' : '22');
        ctx.lineWidth = unlocked ? 1.5 : 0.7;
        ctx.stroke();
        ctx.restore();
      });

      // Cercles de guide (anneaux)
      ctx.save();
      [1,2,3].forEach(function(ring) {
        var r = RING_R[ring] * cam.scale;
        ctx.beginPath();
        ctx.arc(sc0.x, sc0.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200,149,26,0.10)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.restore();

      // Labels de branches
      BRANCHES.forEach(function(branch) {
        var labelR = (RING_R[3] + 52) * cam.scale;
        var lsc = { x: sc0.x + Math.cos(branch.angle)*labelR, y: sc0.y + Math.sin(branch.angle)*labelR };
        var unlocked = pan.isBranchUnlocked(branch.id);
        ctx.font = (12 * Math.min(cam.scale, 1.2)) + 'px "Cinzel Decorative", Cinzel, serif';
        ctx.fillStyle = unlocked ? branch.color : '#404040';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(branch.icon + ' ' + branch.label, lsc.x, lsc.y);
      });

      // ── Lignes de connexion (dessinées AVANT tous les nœuds) ──
      for (var nid in NODES) {
        var nd  = NODES[nid];
        var pos = nodePos[nid];
        if (!pos) continue;
        (nd.requires || []).forEach(function(reqId) {
          var rpos = nodePos[reqId];
          if (!rpos) return;
          var ps = toScreen(pos.x, pos.y);
          var rs = toScreen(rpos.x, rpos.y);
          var state  = pan.getNodeState(nid);
          var rstate = pan.getNodeState(reqId);
          var color  = (rstate === 'learned') ? (BRANCH_COLOR[nd.branch] + '90') : 'rgba(80,80,80,0.28)';
          ctx.beginPath();
          ctx.moveTo(rs.x, rs.y);
          ctx.lineTo(ps.x, ps.y);
          ctx.strokeStyle = color;
          ctx.lineWidth = (rstate === 'learned') ? 2.5 : 1;
          if (rstate !== 'learned') ctx.setLineDash([4,5]);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // ── Nœuds (tous dessinés APRÈS les lignes pour éviter chevauchement) ──
      for (var nid in NODES) {
        var nd  = NODES[nid];
        var pos = nodePos[nid];
        if (!pos) continue;
        var ps    = toScreen(pos.x, pos.y);
        var r     = NODE_R * Math.min(cam.scale, 1.4);
        var state = pan.getNodeState(nid);
        var color = BRANCH_COLOR[nd.branch] || '#888';
        var pts   = pan.invested[nid] || 0;
        var unlocked = pan.isBranchUnlocked(nd.branch);

        // Glow pour les nœuds appris / disponibles
        if (state === 'learned') {
          ctx.save();
          ctx.shadowColor = color; ctx.shadowBlur = 16 * cam.scale;
          drawHex(ps.x, ps.y, r+4);
          ctx.fillStyle = color + '18'; ctx.fill(); ctx.restore();
        } else if (state === 'available') {
          ctx.save();
          ctx.shadowColor = color; ctx.shadowBlur = 7 * cam.scale;
        }

        // Hexagone principal
        drawHex(ps.x, ps.y, r);
        if (state === 'learned') {
          var grad = ctx.createRadialGradient(ps.x, ps.y, 0, ps.x, ps.y, r);
          grad.addColorStop(0, color + 'cc');
          grad.addColorStop(1, color + '44');
          ctx.fillStyle = grad;
        } else if (state === 'available') {
          ctx.fillStyle = '#1a1530';
        } else {
          ctx.fillStyle = unlocked ? '#0f0d20' : '#0a0a0a';
        }
        ctx.fill();

        // Bordure hexagonale
        drawHex(ps.x, ps.y, r);
        if (state === 'learned') ctx.strokeStyle = color;
        else if (state === 'available') ctx.strokeStyle = color + 'aa';
        else ctx.strokeStyle = unlocked ? '#444' : '#222';
        ctx.lineWidth = state === 'learned' ? 2.5 : 1.5;
        ctx.stroke();

        if (state === 'available') ctx.restore();

        // Icône
        var fontSize = Math.round(r * 0.85);
        ctx.font = fontSize + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.globalAlpha = (state === 'locked' && !unlocked) ? 0.2 : (state === 'locked' ? 0.4 : 1);
        ctx.fillText(nd.icon, ps.x, ps.y);
        ctx.globalAlpha = 1;

        // Badge "xN" pour les nœuds uncapped investis
        if (nd.uncapped && pts > 0) {
          var br = r * 0.45;
          var bx = ps.x + r*0.65, by = ps.y - r*0.65;
          ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2);
          ctx.fillStyle = '#ffd54f'; ctx.fill();
          ctx.font = 'bold ' + Math.round(br*1.1) + 'px sans-serif';
          ctx.fillStyle = '#1a1000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('×'+pts, bx, by);
        }
      }

      // Nœud central (hexagone)
      var cs = toScreen(CX, CY);
      var cr = 30 * Math.min(cam.scale, 1.4);
      ctx.save();
      ctx.shadowColor = '#ffd54f'; ctx.shadowBlur = 22;
      drawHex(cs.x, cs.y, cr);
      var cg = ctx.createRadialGradient(cs.x, cs.y, 0, cs.x, cs.y, cr);
      cg.addColorStop(0, '#fff8dc'); cg.addColorStop(1, '#c8961a44');
      ctx.fillStyle = cg; ctx.fill();
      drawHex(cs.x, cs.y, cr);
      ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.font = Math.round(cr*0.8) + 'px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🏛️', cs.x, cs.y);
    }

    // RAF loop for rune animation
    var _panAnimId = null;
    var _panLastTime = 0;
    function drawLoop(ts) {
      // Throttle to ~30fps for performance
      if (ts - _panLastTime > 33) {
        draw();
        _panLastTime = ts;
      }
      _panAnimId = requestAnimationFrame(drawLoop);
    }
    _panAnimId = requestAnimationFrame(drawLoop);

    // Cleanup when panel closes
    var _panCloseBtn = document.getElementById('tp-close');
    if (_panCloseBtn) {
      var _panOrigClose = _panCloseBtn.onclick;
      _panCloseBtn.onclick = function(e) {
        if (_panAnimId) cancelAnimationFrame(_panAnimId);
        if (_panOrigClose) _panOrigClose.call(this, e);
      };
    }

    // ── Tooltip ─────────────────────────────────────────────
    var ttEl = document.getElementById('pan-tooltip');

    function showTooltip(nodeId, screenX, screenY) {
      if (!ttEl) return;
      var nd    = NODES[nodeId];
      if (!nd) return;
      var state  = pan.getNodeState(nodeId);
      var pts    = pan.invested[nodeId] || 0;
      var branch = pan.getAllBranches().find(function(b){ return b.id === nd.branch; });
      var color  = branch ? branch.color : '#888';
      var check  = pan.canLearn(nodeId);
      var etherCost = nd.cost;

      var uncappedInfo = '';
      if (nd.uncapped && pts > 0) {
        var ethSpent = pan.pantheonManager ? (pan._etherInUncapped[nodeId] || 0) : (pan._etherInUncapped[nodeId] || 0);
        uncappedInfo = '<div class="pan-tt-uncapped">Investi : ' + ethSpent + ' Éther (×' + pts + ')</div>';
      }

      ttEl.innerHTML =
        '<div class="pan-tt-header" style="color:' + color + '">' + nd.icon + ' ' + nd.name + '</div>' +
        '<div class="pan-tt-branch">' + (branch ? branch.icon + ' ' + branch.label : '') + ' — Anneau ' + nd.ring + '</div>' +
        '<div class="pan-tt-desc">' + nd.desc + '</div>' +
        uncappedInfo +
        '<div class="pan-tt-cost ' + (state==='learned'?'pan-tt-learned':check.ok?'pan-tt-ok':'pan-tt-locked') + '">' +
          (state==='learned' && !nd.uncapped ? '✅ Acquis' :
           check.ok ? '✨ ' + etherCost + ' Éther' : '🔒 ' + check.reason) +
        '</div>';

      // Position fixe (viewport coords) pour éviter jitter canvas
      var tw = 240, th = 160;
      var vw = window.innerWidth, vh = window.innerHeight;
      var lx = screenX + 16;
      var ly = screenY - 20;
      if (lx + tw > vw - 8) lx = screenX - tw - 16;
      if (ly + th > vh - 8) ly = screenY - th - 10;
      if (ly < 8) ly = 8;
      ttEl.style.left = lx + 'px';
      ttEl.style.top  = ly + 'px';
      ttEl.classList.remove('hidden');
    }

    function hideTooltip() { if (ttEl) ttEl.classList.add('hidden'); }

    // ── Événements souris/tactile ────────────────────────────
    function getNodeAt(wx, wy) {
      for (var nid in nodePos) {
        var pos = nodePos[nid];
        var dx  = wx - pos.x, dy = wy - pos.y;
        if (dx*dx + dy*dy <= NODE_R*NODE_R*1.6) return nid;
      }
      return null;
    }

    canvas.addEventListener('mousedown', function(e) {
      drag.active = true;
      drag.sx = e.clientX; drag.sy = e.clientY;
      drag.cx = cam.x;     drag.cy = cam.y;
    });
    canvas.addEventListener('mousemove', function(e) {
      if (drag.active) {
        cam.x = drag.cx + (e.clientX - drag.sx);
        cam.y = drag.cy + (e.clientY - drag.sy);
        draw(); hideTooltip();
      } else {
        var wpos = toWorld(e.offsetX, e.offsetY);
        var nid  = getNodeAt(wpos.x, wpos.y);
        if (nid) { canvas.style.cursor = 'pointer'; showTooltip(nid, e.clientX, e.clientY); }
        else     { canvas.style.cursor = 'default';  hideTooltip(); }
      }
    });
    canvas.addEventListener('mouseup', function(e) {
      if (!drag.active) return;
      var moved = Math.abs(e.clientX-drag.sx) + Math.abs(e.clientY-drag.sy);
      drag.active = false;
      if (moved < 5) {
        var wpos = toWorld(e.offsetX, e.offsetY);
        var nid  = getNodeAt(wpos.x, wpos.y);
        if (nid) {
          _panSelected = nid;
          showTooltip(nid, e.clientX, e.clientY);
          if (pan.learn(nid, e.clientX, e.clientY)) {
            // Mettre à jour le compteur Éther dans l'en-tête
            var etherEl = document.getElementById('pan-ether-count');
            var newEth  = self.rm ? Math.floor(self.rm.get('ether')) : 0;
            var fmtE2   = function(v){ return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'k':String(v); };
            if (etherEl) etherEl.textContent = '✨ ' + fmtE2(newEth) + ' Éther';
            showTooltip(nid, e.clientX, e.clientY);
          }
        }
      }
    });
    canvas.addEventListener('mouseleave', function(){ drag.active = false; hideTooltip(); });

    // Molette = zoom
    canvas.addEventListener('wheel', function(e) {
      e.preventDefault();
      var delta  = e.deltaY < 0 ? 1.1 : 0.91;
      var mx = e.offsetX, my = e.offsetY;
      var wx = (mx - CX - cam.x) / cam.scale + CX;
      var wy = (my - CY - cam.y) / cam.scale + CY;
      cam.scale = Math.min(2.5, Math.max(0.35, cam.scale * delta));
      cam.x = mx - CX - (wx - CX) * cam.scale;
      cam.y = my - CY - (wy - CY) * cam.scale;
      draw();
    }, { passive: false });

    // Tactile : pinch zoom + drag
    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        drag.active = true;
        drag.sx = e.touches[0].clientX; drag.sy = e.touches[0].clientY;
        drag.cx = cam.x; drag.cy = cam.y;
      } else if (e.touches.length === 2) {
        drag.active = false;
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDist = Math.sqrt(dx*dx + dy*dy);
      }
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', function(e) {
      if (e.touches.length === 1 && drag.active) {
        cam.x = drag.cx + (e.touches[0].clientX - drag.sx);
        cam.y = drag.cy + (e.touches[0].clientY - drag.sy);
        draw();
      } else if (e.touches.length === 2 && pinchDist !== null) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var d  = Math.sqrt(dx*dx + dy*dy);
        var delta = d / pinchDist;
        cam.scale = Math.min(2.5, Math.max(0.35, cam.scale * delta));
        pinchDist = d;
        draw();
      }
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', function(e) {
      if (e.changedTouches.length === 1 && drag.active) {
        var t = e.changedTouches[0];
        var moved = Math.abs(t.clientX-drag.sx) + Math.abs(t.clientY-drag.sy);
        drag.active = false; pinchDist = null;
        if (moved < 12) {
          var rect = canvas.getBoundingClientRect();
          var ox   = t.clientX - rect.left;
          var oy   = t.clientY - rect.top;
          var wpos = toWorld(ox, oy);
          var nid  = getNodeAt(wpos.x, wpos.y);
          if (nid) { pan.learn(nid, t.clientX, t.clientY); draw(); }
        }
      } else { drag.active = false; pinchDist = null; }
    });

    // Redimensionnement : recalcule canvas si le panel change de taille
    var ro = new ResizeObserver(function() {
      var nW = wrap.offsetWidth, nH = wrap.offsetHeight;
      if (nW > 0 && nH > 0 && (nW !== W || nH !== H)) {
        W = nW; H = nH; CX = W/2; CY = H/2;
        canvas.width = W; canvas.height = H;
        // Recalculer positions nœuds
        for (var nid in nodePos) {
          var pos = nodePos[nid];
          var nd  = NODES[nid];
          var b   = pan.getAllBranches().find(function(br){ return br.id === nd.branch; });
          if (!b) continue;
          var r  = RING_R[nd.ring];
          var sp = (nd.slot - 2) * 0.22;
          var a  = b.angle + sp;
          pos.x = CX + Math.cos(a)*r; pos.y = CY + Math.sin(a)*r;
        }
        draw();
      }
    });
    ro.observe(wrap);
  }


  // ── Codex Olympien (Phase 6) ────────────────────────────
  _renderCodexTab(el) {
    var self = this;
    var cm = window.game && window.game.codexManager;
    var pm = window.game && window.game.prestigeManager;
    var rm = this.rm;

    if (!cm) {
      el.innerHTML = '<div style="padding:24px;text-align:center;color:#888">Codex non initialisé.</div>';
      return;
    }

    var pages      = cm.pages;
    var level      = cm.codexLevel;
    var mult       = cm.getEtherMultiplier();
    var nextThresh = cm.getPagesForNextLevel();
    var progress   = cm.getProgressToNextLevel();
    var pctBar     = Math.round(Math.min(1, progress) * 100);

    // Preview pages prochain prestige
    var score        = pm ? pm.getLiveScore() : 0;
    var bTypes       = cm.countBuildingTypes();
    var era3         = cm.isEra3Reached();
    var previewPages = cm.previewNextPages(score, bTypes, era3);

    // Ether actuel
    var etherAmt = rm ? Math.floor(rm.get('ether')) : 0;
    var fmtE = function(v) { return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'k':v.toString(); };

    // ── HTML principal ──────────────────────────────────────
    var html =
      '<div class="cx-wrap">' +
        // En-tête Codex
        '<div class="cx-header">' +
          '<div class="cx-book-icon">📖</div>' +
          '<div class="cx-title-block">' +
            '<div class="cx-title">Codex Olympien</div>' +
            '<div class="cx-subtitle">Niveau ' + level + (nextThresh === Infinity ? ' — Maximum' : ' / ' + (cm.LEVEL_THRESHOLDS.length + 1)) + '</div>' +
          '</div>' +
          '<div class="cx-mult-badge">×' + mult.toFixed(1) + ' Éther</div>' +
        '</div>' +

        // Barre de progression vers prochain niveau
        (nextThresh !== Infinity ?
          '<div class="cx-prog-section">' +
            '<div class="cx-prog-label">' +
              '<span>📄 Pages : <b>' + pages + '</b></span>' +
              '<span>Prochain niveau : <b>' + nextThresh + ' pages</b></span>' +
            '</div>' +
            '<div class="cx-prog-track"><div class="cx-prog-fill" style="width:' + pctBar + '%"></div></div>' +
          '</div>'
        :
          '<div class="cx-prog-section" style="text-align:center;color:#c8961a">⭐ Niveau Maximum atteint</div>'
        ) +

        // Preview prochain prestige
        '<div class="cx-preview">' +
          '<div class="cx-preview-title">📊 Prochain Prestige</div>' +
          '<div class="cx-preview-row"><span>Score Renaissance actuel</span><span>' + score.toLocaleString() + '</span></div>' +
          '<div class="cx-preview-row"><span>Pages gagnées</span><span class="cx-pages-gain">+' + previewPages + ' pages</span></div>' +
          '<div class="cx-preview-row"><span>Types de bâtiments</span><span>' + bTypes + (cm.buildingSourceUnlocked ? ' (+' + bTypes*5 + ' pages)' : '') + '</span></div>' +
          (era3 ? '<div class="cx-preview-row"><span>Ère 3 atteinte</span><span class="cx-bonus">+' + (cm.eraSourceUpgraded ? 40 : 20) + ' pages</span></div>' : '') +
          (cm.bonusPageSlots > 0 ? '<div class="cx-preview-row"><span>Slots bonus (' + cm.bonusPageSlots + ')</span><span class="cx-bonus">+' + cm.bonusPageSlots*15 + ' pages</span></div>' : '') +
          (cm.goldenPagesLevel > 0 ? '<div class="cx-preview-row"><span>Pages Dorées Niv.' + cm.goldenPagesLevel + '</span><span class="cx-bonus">×' + [1,1.5,2.25,3.0][cm.goldenPagesLevel].toFixed(2) + '</span></div>' : '') +
        '</div>' +

        // Nœud Central — Investissements Éther
        '<div class="cx-invest-title">🔮 Nœud Central — Investissements Éther</div>' +
        '<div class="cx-ether-avail">Éther disponible : <b>' + fmtE(etherAmt) + '</b></div>' +
        '<div class="cx-invest-grid">' +
          self._cxInvestCard(cm, 'slot',    '📚 Slots Pages',    'slot', etherAmt) +
          self._cxInvestCard(cm, 'golden',  '✨ Pages Dorées',   'golden', etherAmt) +
          self._cxInvestCard(cm, 'building','🏛️ Source Bâtiments','building_source', etherAmt) +
          self._cxInvestCard(cm, 'era',     '🌟 Source Ère',     'era_source', etherAmt) +
        '</div>' +

        // Table des niveaux Codex
        '<div class="cx-level-title">📈 Table des Niveaux</div>' +
        '<div class="cx-level-table">' + self._cxLevelTable(cm) + '</div>' +

      '</div>';

    el.innerHTML = html;

    // Bind boutons investissement
    el.querySelectorAll('[data-cx-buy]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var type = btn.dataset.cxBuy;
        var ok = false;
        if (type === 'slot')    ok = cm.buySlot();
        if (type === 'golden')  ok = cm.buyGoldenPages();
        if (type === 'building') ok = cm.buyBuildingSource();
        if (type === 'era')     ok = cm.buyEraSource();
        if (ok) self._renderCodexTab(el);
      });
    });
  }

  _cxInvestCard(cm, type, label, checkType, etherAmt) {
    var check, level, maxLevel, costNext;

    if (type === 'slot') {
      check = cm.canBuySlot();
      level = cm.bonusPageSlots;
      maxLevel = 5;
      costNext = cm.SLOT_COST[level] || null;
    } else if (type === 'golden') {
      check = cm.canBuyGoldenPages();
      level = cm.goldenPagesLevel;
      maxLevel = 3;
      costNext = cm.GOLDEN_COST[level] || null;
    } else if (type === 'building') {
      check = cm.canBuyBuildingSource();
      level = cm.buildingSourceUnlocked ? 1 : 0;
      maxLevel = 1;
      costNext = cm.BUILDING_COST;
    } else {
      check = cm.canBuyEraSource();
      level = cm.eraSourceUpgraded ? 1 : 0;
      maxLevel = 1;
      costNext = cm.ERA_COST;
    }

    var maxed = (level >= maxLevel);
    var canAfford = check.ok;
    var desc = '';
    if (type === 'slot')     desc = 'Ajoute +15 pages/prestige par slot';
    if (type === 'golden')   desc = 'Multiplie les pages ×' + [1,1.5,2.25,3.0][Math.min(level+1,3)].toFixed(2);
    if (type === 'building') desc = '+5 pages par type de bâtiment construit';
    if (type === 'era')      desc = 'Bonus Ère 3 : 40 pages au lieu de 20';

    return '<div class="cx-invest-card' + (maxed ? ' cx-maxed' : '') + '">' +
      '<div class="cx-ic-label">' + label + '</div>' +
      '<div class="cx-ic-level">' + (maxed ? '✅ Max' : 'Niv. ' + level + ' / ' + maxLevel) + '</div>' +
      '<div class="cx-ic-desc">' + desc + '</div>' +
      (!maxed ?
        '<button class="cx-ic-btn' + (canAfford ? '' : ' cx-ic-locked') + '" data-cx-buy="' + type + '">' +
          (canAfford ? '✨ ' + costNext + ' Éther' : '🔒 ' + check.reason) +
        '</button>'
      : '') +
    '</div>';
  }

  _cxLevelTable(cm) {
    var mults = cm.LEVEL_ETHER_MULT;
    var thres = cm.LEVEL_THRESHOLDS;
    var rows = '';
    for (var i = 0; i < mults.length; i++) {
      var active = (i + 1 === cm.codexLevel);
      var req = i === 0 ? 'Départ' : thres[i-1] + ' pages';
      rows +=
        '<div class="cx-lv-row' + (active ? ' cx-lv-active' : '') + '">' +
          '<span class="cx-lv-num">' + (active ? '▶ ' : '') + 'Niv.' + (i+1) + '</span>' +
          '<span class="cx-lv-req">' + req + '</span>' +
          '<span class="cx-lv-mult">×' + mults[i].toFixed(1) + '</span>' +
        '</div>';
    }
    return rows;
  }


  _renderAltarUI(cell, body) {
    var self = this;
    var pm = window.game && window.game.prestigeManager;
    var cm = window.game && window.game.codexManager;
    var cond = pm ? pm.getConditions() : { revealed: 0, revealedOk: false, basesLvl5: 0, basesLvl5Ok: false, allMet: false };
    var altarHP  = cell.currentHP;
    var altarMax = cell.maxHP || 2000;
    var pct      = Math.max(0, (altarHP / altarMax) * 100);
    var unlocked = cond.allMet;

    // Données Codex
    var codexLevel   = cm ? cm.codexLevel : 1;
    var codexMult    = cm ? cm.getEtherMultiplier() : 1;
    var codexPages   = cm ? cm.pages : 0;
    var previewPages = 0;
    if (cm && pm) {
      previewPages = cm.previewNextPages(pm.getLiveScore(), cm.countBuildingTypes(), cm.isEra3Reached());
    }

    var html = '<div class="bp-bld-header">' +
      '<span class="bp-bld-glyph" style="filter:drop-shadow(0 0 8px #c080ff)">🔮</span>' +
      '<div><div class="bp-bld-name">Autel de Prométhée</div>' +
      '<div class="bp-bld-lvl">' + (unlocked ? '⚡ Actif — Sacrifice requis' : '🔒 Conditions non remplies') + '</div></div>' +
      '</div>';

    // Barre de vie de l autel (si actif)
    if (unlocked) {
      html += '<div style="margin-bottom:8px">' +
        '<div style="font-size:10px;color:rgba(255,255,255,.5);margin-bottom:3px">Resistance : ' + Math.ceil(altarHP) + ' / ' + altarMax + '</div>' +
        '<div class="bp-lvlbar-track" style="height:8px">' +
          '<div class="bp-lvlbar-fill" style="width:' + (100-pct) + '%;background:linear-gradient(90deg,#8a40c0,#c080ff)"></div>' +
        '</div>' +
      '</div>';
    }

    // Conditions
    html += '<div style="margin-bottom:10px">' +
      '<div style="font-size:11px;color:rgba(255,255,255,.55);margin-bottom:5px">Conditions :</div>' +
      '<div style="font-size:12px;margin-bottom:3px;color:' + (cond.revealedOk ? '#80e080' : '#e08080') + '">' +
        (cond.revealedOk ? '✅' : '⬜') + ' ' + cond.revealed + ' / 50 cases révélées</div>' +
      '<div style="font-size:12px;color:' + (cond.basesLvl5Ok ? '#80e080' : '#e08080') + '">' +
        (cond.basesLvl5Ok ? '✅' : '⬜') + ' ' + cond.basesLvl5 + ' / 3 Bases Niv.5</div>' +
    '</div>';

    if (unlocked) {
      var etherEstimate = pm ? pm.computeEther() : 0;
      // Séparateur Prestige preview
      html +=
        '<div class="altar-prestige-preview">' +
          '<div class="app-title">⚡ Ce Prestige vous donnera</div>' +
          '<div class="app-row"><span>✨ Éther</span><span class="app-val app-ether">+' + etherEstimate + '</span></div>' +
          '<div class="app-row"><span>📖 Pages Codex</span><span class="app-val app-pages">+' + previewPages + '</span></div>' +
          '<div class="app-row app-small"><span>Multiplicateur Codex actuel</span><span>×' + codexMult.toFixed(1) + ' (Niv.' + codexLevel + ')</span></div>' +
          '<div class="app-row app-small"><span>Pages totales après</span><span>' + (codexPages + previewPages) + '</span></div>' +
        '</div>';
      html += '<div style="font-size:10px;color:rgba(255,255,255,.35);text-align:center;margin-top:6px">Fouillez l\'Autel pour déclencher la Renaissance.</div>';
    } else {
      html += '<div style="font-size:10px;color:rgba(255,255,255,.35)">Remplissez les conditions pour activer cet autel.</div>';
      if (cm && codexLevel > 1) {
        html += '<div style="font-size:11px;color:#c080ff;margin-top:8px;padding:6px 8px;background:rgba(176,96,255,0.08);border-radius:6px">' +
          '📖 Codex Niv.' + codexLevel + ' — multiplicateur actuel : ×' + codexMult.toFixed(1) + ' Éther</div>';
      }
    }

    body.innerHTML = html;
  }

  // ── UI Base ──────────────────────────────────────────────
  _renderBaseUI(cell, body) {
    var fmt = MathUtils.formatNumber, rm = this.rm;
    body.innerHTML =
      '<div class="bp-bld-header"><span class="bp-bld-glyph">\u26A1</span>' +
      '<div><div class="bp-bld-name">Base Principale</div>' +
      '<div class="bp-bld-lvl">Les batiments adjacents sont connectes automatiquement.</div></div></div>' +
      '<div class="bp-base-grid">' +
        '<div class="bp-base-row"><span>\uD83E\uDE99 Drachmes</span><span>+' + fmt(rm.getRate('drachmes')) + '/s</span></div>' +
        '<div class="bp-base-row"><span>\uD83E\uDEB5 Bois</span><span>+' + fmt(rm.getRate('bois')) + '/s</span></div>' +
        '<div class="bp-base-row"><span>\uD83C\uDF3E Ambroisie</span><span>+' + fmt(rm.getRate('nourr')) + '/s</span></div>' +
        '<div class="bp-base-row"><span>\u2699\uFE0F Fer</span><span>+' + fmt(rm.getRate('fer')) + '/s</span></div>' +
      '</div>';
  }

  // ── Events ───────────────────────────────────────────────
  _bindEvents() {
    var self = this;
    EventBus.on('cell:click', function(d) {
      // Clic dans le vide -> ferme le slider
      if (!d.cell) { self.hide(); return; }
      var cell = d.cell;

      // Case cachee -> fouille silencieuse + ferme le slider
      if (cell.isHidden) {
        var sx = d.screenX || window.innerWidth / 2;
        var sy = d.screenY || window.innerHeight / 2;
        self.bm.digCell(cell, sx, sy);
        self.hide();
        return;
      }

      // Case revelee deja selectionnee -> toggle (ferme)
      if (self.currentCell && self.currentCell.key === cell.key) {
        self.hide();
        return;
      }

      // Case revelee -> ouvre le slider
      self.open(cell);
      if (cell.building === 'scout') EventBus.emit('scout:select', { cell: cell });
      else EventBus.emit('scout:deselect', {});
    });
    EventBus.on('cell:revealed',       function(d) { if (self.currentCell && self.currentCell.key === d.cell.key) self.refresh(); });
    // resources:updated géré par le HUD uniquement (pas de refresh panel à chaque tick)
    EventBus.on('talent:applied',      function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('talents:toggle',       function()  { self.toggleTalents(); });
    EventBus.on('road:placed',         function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('road:removed',        function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('terrain:transformed', function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('building:built',      function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('scout:revealed',      function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('base:upgraded',       function()  { if (self.currentCell) self.refresh(); });
    EventBus.on('prestige:complete',   function()  { self.hide(); });
    EventBus.on('prestige:bonus_updated', function() { if (self.currentCell) self.refresh(); });
    // Mise à jour en temps réel des états verrouillés/déverrouillés quand les ressources changent
    EventBus.on('resources:updated', function() { if (self.currentCell) self.refresh(); });
  }



  _costHtmlPlain(cost) {
    var self = this;
    return Object.entries(cost).map(function(e) {
      return (RES_ICONS[e[0]]||e[0])+' '+e[1];
    }).join(' ');
  }

}

var RES_ICONS = {
  drachmes:'🪙', bois:'🪵', nourr:'🌾', fer:'⚙️', ether:'✨',
  habitants:'👥', nectar:'🍯', bronze:'🟫', acier:'🔩', farine:'🌾',
  foudre:'⚡', orichalque:'🌟', metal_divin:'⚗️', amrita:'💎',
};
var RES_NAMES = {
  drachmes:'Drachmes', bois:'Bois', nourr:'Ambroisie', fer:'Fer', ether:'Éther',
  habitants:'Habitants', nectar:'Nectar', bronze:'Bronze', acier:'Acier',
  farine:'Farine', foudre:'Foudre', orichalque:'Orichalque',
  metal_divin:'Métal Divin', amrita:'Amrita',
};
