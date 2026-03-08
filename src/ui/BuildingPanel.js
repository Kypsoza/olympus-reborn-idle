/* BuildingPanel.js — v0.6.0
   Drawer coulissant en bas de l'ecran (remplace le tooltip flottant)
*/

class BuildingPanel {
  constructor(bm, rm, tm, pm, zm) {
    this.bm = bm; this.rm = rm; this.tm = tm; this.pm_pan = pm; this.pan = pm; this.zm = zm;
    this._lockedBuildingId = null; // Mode verrou construction
    this.currentCell = null;
    this._createDrawer();
    this._createBuildBar();
    this._createTalentPanel();
    this._bindEvents();
  }

  // ── Drawer principal ────────────────────────────────────

  // ══════════════════════════════════════════════════════════
  //  BUILD BAR — Dock 7 catégories + tiroir surgissant
  // ══════════════════════════════════════════════════════════
  _createBuildBar() {
    var self = this;

    // ── Catégories ────────────────────────────────────────
    var CATS = [
      { id:'nature',    icon:'🌿', label:'Nature',      ids:['farm','lumber','moulin','verger','halle','jardins','bosquet'] },
      { id:'extract',   icon:'⛏️', label:'Extraction',  ids:['mine_copper','mine_iron','tresor'] },
      { id:'transform', icon:'⚙️', label:'Transfo',     ids:['atelier_forgeron','fonderie_celeste','alambic','forge_divine','autel_fusion','distillerie','fontaine'] },
      { id:'housing',   icon:'🛖', label:'Logements',   ids:['huttes','maison','palais','stele_zeus','bibliotheque'] },
      { id:'energy',    icon:'⚡', label:'Énergie',     ids:['pylone','noeud_olympien'] },
      { id:'explore',   icon:'🗺️', label:'Explore',     ids:['scout','sanctuaire','temple_hermes'] },
      { id:'wonders',   icon:'🏛️', label:'Merveilles',  ids:['agora','forteresse','senat'] },
      { id:'road',      icon:'🛤️', label:'Routes',      ids:[] },
    ];

    // ── Outer bar DOM ─────────────────────────────────────
    var bar = document.createElement('div');
    bar.id = 'bb-bar';
    bar.innerHTML =
      '<div id="bb-drawer" class="bb-drawer-closed"></div>' +
      '<div id="bb-dock"></div>';
    document.body.appendChild(bar);

    var dock      = bar.querySelector('#bb-dock');
    var drawerEl  = bar.querySelector('#bb-drawer');
    var activeCell= null;
    var openCatId = null;

    // ── Hexagone SVG helper ───────────────────────────────
    function hexSVG() {
      return '<svg viewBox="0 0 100 114" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon class="hex-poly-fill" points="50,2 96,27 96,87 50,112 4,87 4,27"/>' +
        '<polygon class="hex-poly-stroke" points="50,2 96,27 96,87 50,112 4,87 4,27"/>' +
        '</svg>';
    }

    // ── Render dock tabs ──────────────────────────────────
    dock.innerHTML = '';
    CATS.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'bb-tab';
      btn.dataset.cat = cat.id;
      btn.innerHTML = '<span class="bb-tab-icon">' + cat.icon + '</span><span class="bb-tab-label">' + cat.label + '</span>';
      dock.appendChild(btn);
    });

    // ── Build tooltip DOM ─────────────────────────────────
    var tt = document.getElementById('bld-tooltip');
    if (!tt) {
      tt = document.createElement('div');
      tt.id = 'bld-tooltip';
      document.body.appendChild(tt);
    }

    function buildTTContent(def, check) {
      var prodLines = '';
      if (def.baseProdPerField)   prodLines += '<div class="btt-prod">🌾 +' + def.baseProdPerField + '/champ/s</div>';
      if (def.baseProdPerSupport) prodLines += '<div class="btt-prod">🪵 +' + def.baseProdPerSupport + '/forêt/s</div>';
      if (def.produces) Object.entries(def.produces).forEach(function(e){ prodLines += '<div class="btt-prod">' + (RES_ICONS[e[0]]||e[0]) + ' +' + e[1] + '/s</div>'; });
      if (def.consumes) Object.entries(def.consumes).forEach(function(e){ prodLines += '<div class="btt-consume">' + (RES_ICONS[e[0]]||e[0]) + ' −' + e[1] + '/s</div>'; });
      var costChips = Object.entries(def.buildCost).map(function(e){
        var has = self.rm.get(e[0]) >= e[1];
        return '<span class="btt-cost-item ' + (has?'btt-cost-ok':'btt-cost-ko') + '">' + (RES_ICONS[e[0]]||e[0]) + ' ' + self._fmt(e[1]) + '</span>';
      }).join('');
      var state = check.ok
        ? '<div class="btt-state ok">✅ Constructible</div>'
        : '<div class="btt-state ko">🔒 ' + check.reason + '</div>';
      return '<div class="btt-head"><span class="btt-icon">' + def.glyph + '</span>' +
        '<div class="btt-title"><span class="btt-name">' + def.name + '</span></div></div>' +
        '<div class="btt-desc">' + def.description + '</div>' +
        '<div class="btt-section">Coût</div><div class="btt-costs">' + costChips + '</div>' +
        (prodLines ? '<div class="btt-section">Production</div><div class="btt-prods">' + prodLines + '</div>' : '') +
        state + '<button class="btt-close">✕</button>';
    }
    function showTT(hexEl, def, check) {
      tt.innerHTML = buildTTContent(def, check);
      tt.classList.add('visible');
      tt.style.pointerEvents = 'none';
      var closeBtn = tt.querySelector('.btt-close');
      if (closeBtn) { closeBtn.addEventListener('click', function(e){ e.stopPropagation(); tt.dataset.pinned=''; tt.className=''; }); }
      var r=hexEl.getBoundingClientRect(), tw=255, th=tt.offsetHeight||160;
      if (window.innerWidth > 600) {
        var tx=r.left-tw-12, ty=r.top-th+r.height/2;
        if (tx<8) tx=r.right+12;
        if (ty<8) ty=8;
        if (ty+th>window.innerHeight-8) ty=window.innerHeight-th-8;
        tt.style.left=tx+'px'; tt.style.top=ty+'px'; tt.style.bottom='auto';
      } else { tt.style.left=''; tt.style.top=''; }
    }
    function hideTT() { if (!tt.dataset.pinned) tt.className=''; }

    // ── Render drawer content ─────────────────────────────
    function renderDrawer(catId) {
      if (!activeCell) return;
      var cat = CATS.find(function(c){ return c.id===catId; });
      if (!cat) return;
      openCatId = catId;

      drawerEl.className = 'bb-drawer-open';
      drawerEl.innerHTML = '<button class="bb-drawer-close" id="bb-close">✕</button>';

      var available = BuildingManager.getBuildingsForTerrain(activeCell.type);
      var transforms = BuildingManager.getTerrainTransforms(activeCell.type);
      var hasRoadAction = (activeCell.type === CELL_TYPE.PLAIN || activeCell.type === CELL_TYPE.FIELD ||
                           activeCell.type === CELL_TYPE.GROVE || activeCell.hasRoad);
      var frag = document.createDocumentFragment();

      // Road category
      if (catId === 'road') {
        var roadEl = document.createElement('div');
        if (hasRoadAction) {
          if (activeCell.hasRoad) {
            var rr = self.bm.canRemoveRoad(activeCell);
            roadEl.className = 'hex-btn hex-action hex-danger' + (rr.ok?'':' hex-locked');
            roadEl.dataset.bbAction = 'road-remove';
            roadEl.innerHTML = '<div class="hex-bg">' + hexSVG() + '</div><span class="hex-icon">🗑️</span><span class="hex-label">Démolir Route</span>';
          } else {
            var rc = self.bm.canPlaceRoad(activeCell);
            roadEl.className = 'hex-btn hex-action' + (rc.ok?' hex-ok':' hex-locked');
            roadEl.dataset.bbAction = 'road';
            roadEl.innerHTML = '<div class="hex-bg">' + hexSVG() + '</div><span class="hex-icon">🛤️</span><span class="hex-label">Route</span><span class="hex-cost' + (rc.ok?'':' short') + '">30🪙 10🪵</span>';
          }
          frag.appendChild(roadEl);
        }
        // Transforms
        transforms.forEach(function(tr) {
          var ok = self.rm.canAfford(tr.cost);
          var trEl = document.createElement('div');
          trEl.className = 'hex-btn hex-action' + (ok?' hex-ok':' hex-locked');
          trEl.dataset.bbTransform = tr.targetType;
          var firstCost = Object.entries(tr.cost)[0];
          var trCost = firstCost ? ((RES_ICONS[firstCost[0]]||firstCost[0]) + ' ' + self._fmt(firstCost[1])) : '';
          trEl.innerHTML = '<div class="hex-bg">' + hexSVG() + '</div><span class="hex-icon">' + tr.glyph + '</span><span class="hex-label">' + tr.label + '</span>' + (trCost ? '<span class="hex-cost' + (ok?'':' short') + '">' + trCost + '</span>' : '');
          frag.appendChild(trEl);
        });
      } else {
        // Buildings filtered by category ids (allow all if cat.ids is null)
        available.forEach(function(def) {
          if (!def) return;
          // Filter: if cat has explicit ids, skip buildings not in the list
          // Also show building if no ids defined (catch-all)
          var inCat = !cat.ids.length || cat.ids.includes(def.id);
          if (!inCat) return;
          var check = self.bm.canBuild(activeCell, def.id);
          var eraLocked = def.era && def.era > 1 && self.tm && self.tm.getUnlockedEra() < def.era;
          var hexEl = document.createElement('div');
          var cls = 'hex-btn';
          if (!check.ok) cls += ' hex-locked';
          if (check.ok) cls += ' hex-ok';
          if (eraLocked) cls += ' hex-era-locked';
          hexEl.className = cls;
          hexEl.dataset.bbId = def.id;
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
            hexEl.addEventListener('mouseenter', function(){ showTT(hexEl, _def2, self.bm.canBuild(activeCell, _def2.id)); });
            hexEl.addEventListener('mouseleave', function(){ if (!tt.dataset.pinned) hideTT(); });
          }
          frag.appendChild(hexEl);
        });
      }

      drawerEl.appendChild(frag);

      // Close button
      document.getElementById('bb-close').onclick = function() { closeDrawer(); };

      // ── Click: build immediately on activeCell ──────────
      drawerEl.onclick = function(e) {
        if (!activeCell) return;

        // Close
        var closeBtn = e.target.closest('#bb-close');
        if (closeBtn) { closeDrawer(); return; }

        // Info button (mobile)
        var infoBtn = e.target.closest('.hex-info-btn');
        if (infoBtn) {
          e.stopPropagation();
          var id = infoBtn.dataset.info;
          var defObj = (typeof BUILDINGS !== 'undefined') ? BUILDINGS[id] : null;
          if (!defObj) return;
          var checkObj = self.bm.canBuild(activeCell, id);
          var parentHex = infoBtn.closest('.hex-btn');
          if (tt.dataset.pinned === id) { tt.dataset.pinned=''; tt.className=''; }
          else { showTT(parentHex, defObj, checkObj); tt.dataset.pinned=id; tt.classList.add('pinned'); tt.style.pointerEvents='auto'; }
          return;
        }

        if (tt.dataset.pinned) { tt.dataset.pinned=''; tt.className=''; }

        var hexEl = e.target.closest('.hex-btn');
        if (!hexEl || hexEl.classList.contains('hex-locked')) return;

        var now2 = Date.now();
        if (self._lastBuildAt && now2 - self._lastBuildAt < 350) return;
        self._lastBuildAt = now2;

        // Build
        if (hexEl.dataset.bbId) {
          self.bm.build(activeCell, hexEl.dataset.bbId, 0, 0);
          // Refresh drawer (costs may have changed)
          renderDrawer(catId);
          return;
        }
        // Road
        var act = hexEl.dataset.bbAction;
        if (act === 'road')        { self.bm.placeRoad(activeCell, 0, 0); renderDrawer(catId); }
        else if (act === 'road-remove') { self.bm.removeRoad(activeCell, 0, 0); renderDrawer(catId); }
        // Transform
        if (hexEl.dataset.bbTransform) { self.bm.transformTerrain(activeCell, hexEl.dataset.bbTransform, 0, 0); closeDrawer(); }
      };

      // Highlight active tab
      dock.querySelectorAll('.bb-tab').forEach(function(t){
        t.classList.toggle('bb-tab-active', t.dataset.cat === catId);
      });
    }

    function closeDrawer() {
      drawerEl.className = 'bb-drawer-closed';
      drawerEl.innerHTML = '';
      openCatId = null;
      dock.querySelectorAll('.bb-tab').forEach(function(t){ t.classList.remove('bb-tab-active'); });
    }

    // ── Dock click ────────────────────────────────────────
    dock.onclick = function(e) {
      var tab = e.target.closest('.bb-tab');
      if (!tab) return;
      var catId = tab.dataset.cat;
      if (openCatId === catId) { closeDrawer(); return; }
      renderDrawer(catId);
    };

    // ── Prevent events leaking to map ────────────────────
    bar.addEventListener('touchstart', function(e){ e.stopPropagation(); }, { passive: false });
    bar.addEventListener('touchend',   function(e){ e.stopPropagation(); }, { passive: false });
    bar.addEventListener('mousedown',  function(e){ e.stopPropagation(); });

    // ── Public API ────────────────────────────────────────
    this._buildBar = {
      bar: bar,
      setCell: function(cell, isNewCell) {
        var prevCell = activeCell;
        activeCell = cell;
        bar.classList.add('bb-bar-visible');
        // Only auto-open drawer when switching to a NEW cell
        // If user closed the drawer (openCatId===null), respect that
        if (isNewCell) {
          // New cell: auto-open first relevant category
          var available2 = cell ? BuildingManager.getBuildingsForTerrain(cell.type) : [];
          var firstCat = null;
          CATS.forEach(function(cat) {
            if (firstCat) return;
            if (cat.id==='road') return;
            var hasSomething = available2.some(function(def){ return !cat.ids.length || cat.ids.includes(def.id); });
            if (hasSomething) firstCat = cat.id;
          });
          if (firstCat) renderDrawer(firstCat);
          else closeDrawer();
        } else if (openCatId) {
          // Same cell refresh: only refresh if drawer is open
          renderDrawer(openCatId);
        }
        // If openCatId===null: drawer was closed by user — don't reopen
      },
      hide: function() {
        activeCell = null;
        closeDrawer();
        bar.classList.remove('bb-bar-visible');
      },
      refresh: function() {
        if (activeCell && openCatId) renderDrawer(openCatId);
      }
    };
  }


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
    // Stop touch/mouse events from reaching the map canvas below
    this.drawer.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: false });
    this.drawer.addEventListener('touchend',   function(e) { e.stopPropagation(); }, { passive: false });
    this.drawer.addEventListener('mousedown',  function(e) { e.stopPropagation(); });
    document.getElementById('bp-close').addEventListener('click', () => this.hide());
    // Délégation unique — remplace tous les listeners posés individuellement
    var self2 = this;
    var bpBody = document.getElementById('bp-body');
    if (bpBody) {
      bpBody.addEventListener('click', function(e) {
        if (self2 && typeof self2._handleBodyClick === 'function') {
          self2._handleBodyClick(e);
        }
      });
    }
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

  open(cell, isNewCell) {
    // isNewCell=true (defaut) → nouveau clic → reset onglet build bar
    // isNewCell=false → refresh meme case → preserve l'onglet actif
    if (isNewCell === undefined) isNewCell = true;
    this.currentCell = cell;
    document.getElementById('bp-title').textContent = cell.displayName + (cell.hasRoad ? ' 🛤️' : '');
    var body = document.getElementById('bp-body');
    body.onclick = null;
    body.innerHTML = '';
    if      (cell.isHidden)                      this._renderDigUI(cell, body);
    else if (cell.type === CELL_TYPE.BASE_MAIN)   this._renderBaseUI(cell, body);
    else if (cell.type === CELL_TYPE.BASE)         this._renderBaseHiddenUI(cell, body);
    else if (cell.type === CELL_TYPE.ALTAR)        this._renderAltarUI(cell, body);
    else if (cell.type === CELL_TYPE.MUD)          this._renderMudUI(cell, body);
    else if (cell.type === CELL_TYPE.RUBBLE)       this._renderRubbleUI(cell, body);
    else if (cell.type === CELL_TYPE.TUNNEL)       this._renderTunnelUI(cell, body);
    else if (cell.building)                        this._renderBuildingUI(cell, body);
    else                                           this._renderEmptyUI(cell, body, isNewCell);
    this.drawer.classList.remove('bp-drawer-closed');
    this.drawer.classList.add('bp-drawer-open');
  }
  hide() {
    this.drawer.classList.remove('bp-drawer-open');
    this.drawer.classList.add('bp-drawer-closed');
    this.currentCell = null;
    if (this._buildBar) this._buildBar.hide();
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
      if (this.currentCell) this.open(this.currentCell, false); // refresh: preserve active tab
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
      { id:'cartographie', label:'Cartographie',  icon:'🗺️' },
      { id:'prestige_codex',label:'Héritage',     icon:'📜' },
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

    el.innerHTML = tabBar + '<div id="dt-content" data-branch="' + activeCat + '"></div>';

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

    // Cartographie and Héritage come from PantheonManager (PANTHEON_BRANCHES)
    var PB = (typeof PANTHEON_BRANCHES !== 'undefined') ? PANTHEON_BRANCHES : (window.PANTHEON_BRANCHES || []);
    var panBranch = PB.find(function(b){ return b.id===branchId; });
    if (branchId === 'cartographie' || branchId === 'prestige_codex') {
      if (panBranch) {
        self._renderPantheonBranch(el, branchId, panBranch);
        return;
      }
      el.innerHTML = '<div style="padding:24px;color:#888;text-align:center">Branche non chargée.</div>';
      return;
    }
    var branches = self.tm.getBranchData().filter(function(b) { return b.id === branchId; });
    if (!branches.length) {
      el.innerHTML = '<div style="padding:24px;color:#888;text-align:center">Branche inconnue.</div>';
      return;
    }
    var b = branches[0];

    // Branch image map (ASCII filenames matching user's disk)
    var BRANCH_IMG = {
      'agriculture':   'assets/tabs/agriculture.jpg',
      'sylviculture':  'assets/tabs/Sylviculture.jpg',
      'metallurgie':   'assets/tabs/metallurgie.jpg',
      'siderurgie':    'assets/tabs/siderurgie.jpg',
      'population':    'assets/tabs/population.jpg',
      'ingenierie':    'assets/tabs/Ingenierie.jpg',
      'cartographie':  'assets/tabs/Cartographie.jpg',
      'prestige_codex':'assets/tabs/Heritage.jpg',
    };
    var branchImg = BRANCH_IMG[branchId] || null;

    var COL_W = 200;
    var R     = 36;
    var SUB   = 50;
    // Center nodes vertically: header=40px, 4 rows with 110px gap, bottom padding=50px
    var NODE_Y = [88, 198, 308, 418];
    var ncols  = b.cols.length;
    var VW     = Math.max(ncols * COL_W * 2, 400);
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
      var s = '<svg id="dt-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
        + ' width="' + VW + '" height="' + VH + '"'
        + ' style="display:block;overflow:hidden;background:transparent">';

      // Defs with filters and clipPath for background image
      s += '<defs>'
        + '<clipPath id="dt-clip"><rect width="' + VW + '" height="' + VH + '"/></clipPath>'
        + '<filter id="dt-gd" x="-80%" y="-80%" width="260%" height="260%">'
        + '<feGaussianBlur stdDeviation="6" result="b"/>'
        + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
        + '<filter id="dt-ga" x="-60%" y="-60%" width="220%" height="220%">'
        + '<feGaussianBlur stdDeviation="3" result="b"/>'
        + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
        + '</defs>';

      // Background image fills SVG exactly
      if (branchImg) {
        s += '<image href="' + branchImg + '" xlink:href="' + branchImg + '" x="0" y="0"'
          + ' width="' + VW + '" height="' + VH + '"'
          + ' preserveAspectRatio="xMidYMid slice"'
          + ' clip-path="url(#dt-clip)" opacity="0.6"/>';
      }
      // Dark overlay for readability
      s += '<rect width="' + VW + '" height="' + VH + '" fill="rgba(4,2,12,0.48)"/>';

      // Thin golden méandre border frame (decorative only)
      s += '<rect x="4" y="4" width="' + (VW-8) + '" height="' + (VH-8) + '"'
        + ' fill="none" stroke="rgba(200,149,26,0.35)" stroke-width="1.5" rx="4"/>';

      // Branch header centered at top
      s += '<text x="' + (VW/2) + '" y="28" text-anchor="middle" font-family="Cinzel,serif" font-size="16"'
        + ' font-weight="700" fill="' + b.color + '" letter-spacing="0.08em">'
        + b.icon + ' ' + b.label + '</text>';

      // Separator line under header
      s += '<line x1="40" y1="40" x2="' + (VW-40) + '" y2="40"'
        + ' stroke="rgba(200,149,26,0.20)" stroke-width="1"/>';

      // Col separator line (between columns)
      if (ncols > 1) {
        s += '<line x1="' + cxBase + '" y1="52" x2="' + cxBase + '" y2="' + (VH-20) + '"'
          + ' stroke="rgba(200,149,26,0.10)" stroke-width="1" stroke-dasharray="4,6"/>';
      }
      s += colLabelsSVG;

      // Edges
      EDGES.forEach(function(e) {
        var a = NODE_POS[e[0]], bNode = NODE_POS[e[1]];
        if (!a || !bNode) return;
        var stA = getState(e[0]), stB = getState(e[1]);
        var edgeColor = stA === 'learned' && stB === 'learned' ? '#c8961a' :
                        stA === 'learned' ? 'rgba(200,149,26,0.5)' : 'rgba(120,120,150,0.25)';
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
        var fillInner = st === 'learned'   ? 'rgba(180,140,30,0.45)' :
                        st === 'available' ? 'rgba(20,16,50,0.88)'   :
                                             'rgba(10,8,24,0.82)';
        var strokeCol = st === 'learned'   ? col :
                        st === 'available' ? 'rgba(210,185,110,0.75)' :
                                             'rgba(80,80,110,0.35)';
        var strokeW   = st === 'available' ? 2.5 : 2;
        var textFill  = st === 'learned'   ? '#f0d880' :
                        st === 'available' ? '#d8c880'   :
                                             'rgba(150,130,110,0.5)';

        var pts = '';
        for (var i = 0; i < 6; i++) {
          var ang = (Math.PI / 180) * (60 * i - 30);
          pts += (i === 0 ? 'M' : 'L') + (pos.x + R * Math.cos(ang)).toFixed(1) + ',' + (pos.y + R * Math.sin(ang)).toFixed(1);
        }
        pts += 'Z';

        s += '<g class="dt-node' + (_dtSelected===id?' dt-selected':'') + '" data-id="' + id + '" style="cursor:pointer">';
        if (_dtSelected === id) {
          var selPts = '';
          for (var si2=0; si2<6; si2++) {
            var sa2 = (Math.PI/180)*(60*si2-30);
            selPts += (si2===0?'M':'L')+(pos.x+(R+9)*Math.cos(sa2)).toFixed(1)+','+(pos.y+(R+9)*Math.sin(sa2)).toFixed(1);
          }
          s += '<path d="' + selPts + 'Z" fill="rgba(240,200,64,0.15)"'
            + ' stroke="#f0c840" stroke-width="3" filter="url(#dt-gd)"/>';
        }
        if (st !== 'locked') {
          s += '<path d="' + pts + '" fill="' + (st==='learned'?col:'rgba(200,160,60,0.2)') + '"'
            + ' opacity="0.22" filter="url(#dt-g' + (st==='learned'?'d':'a') + ')"/>';
        }
        s += '<path d="' + pts + '" fill="' + fillInner + '"'
          + ' stroke="' + strokeCol + '" stroke-width="' + strokeW + '"/>';
        if (st === 'learned') {
          s += '<text x="' + pos.x + '" y="' + (pos.y - R*0.55) + '"'
            + ' text-anchor="middle" font-size="11" fill="rgba(200,200,60,0.7)">✓</text>';
        }
        s += '<text x="' + pos.x + '" y="' + (pos.y + 6) + '"'
          + ' text-anchor="middle" dominant-baseline="middle"'
          + ' font-size="22">' + (def.icon || '⭐') + '</text>';
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
    // Build side detail panel (always visible)
    var sideHtml = '<div id="dt-side-panel" class="dt-side-panel">'
      + '<div id="dt-side-content" class="dt-side-empty">'
      + '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(200,180,100,0.5);text-align:center;padding-top:40px;line-height:1.8">'
      + '✨<br>Cliquez sur<br>un talent<br>pour voir<br>les détails'
      + '</div></div></div>';

    el.innerHTML =
      '<div class="dt-drachmes-count">🪙 ' + fmt(drachmes) + ' Drachmes</div>' +
      '<div class="dt-body-row">' +
        '<div id="dt-scroll-wrap"><div style="min-width:' + VW + 'px">' + buildSVG() + '</div></div>' +
        sideHtml +
      '</div>';

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
    var ttBox    = null; // legacy - unused, side panel replaces it
    var ttPinned = false;

    function showSide(id) {
      var side = document.getElementById('dt-side-content');
      if (!side) return;
      if (!id) {
        side.className = 'dt-side-empty';
        side.innerHTML = '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(200,180,100,0.5);text-align:center;padding-top:40px;line-height:1.8">✨<br>Cliquez sur<br>un talent<br>pour voir<br>les détails</div>';
        return;
      }
      side.className = '';
      side.innerHTML = buildTT(id);
    }

    function bindSVG(svg) {
      if (!svg) return;
      svg.querySelectorAll('.dt-node').forEach(function(g) {
        g.addEventListener('mouseenter', function() {
          if (!_dtSelected) showSide(g.dataset.id);
        });
        g.addEventListener('mouseleave', function() {
          if (!_dtSelected) showSide(null);
        });
        g.addEventListener('click', function(e) {
          e.stopPropagation();
          var wasSelected = (_dtSelected === g.dataset.id);
          _dtSelected = wasSelected ? null : g.dataset.id;
          curNode = _dtSelected;
          showSide(_dtSelected);
          // Refresh SVG for selection highlight
          var _sw = document.getElementById('dt-scroll-wrap');
          if (_sw) { _sw.innerHTML = '<div style="min-width:'+VW+'px">'+buildSVG()+'</div>'; bindSVG(_sw.querySelector('#dt-svg')); startRuneAnim(_sw.querySelector('#dt-svg')); }
        });
      });
    }
    bindSVG(el.querySelector('#dt-svg'));
    startRuneAnim(el.querySelector('#dt-svg'));

    // Clic en dehors des nœuds → désélectionne
    document.addEventListener('click', function unpinHandler(e) {
      if (!e.target.closest('.dt-node') && !e.target.closest('#dt-side-panel')) {
        if (_dtSelected) {
          _dtSelected = null; curNode = null;
          showSide(null);
          var _sw = document.getElementById('dt-scroll-wrap');
          if (_sw) { _sw.innerHTML = '<div style="min-width:'+VW+'px">'+buildSVG()+'</div>'; bindSVG(_sw.querySelector('#dt-svg')); startRuneAnim(_sw.querySelector('#dt-svg')); }
        }
      }
    });

    // Buy button handler on the side panel
    el.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-learn]'); if (!btn) return;
      e.stopPropagation();
      if (!self.tm.learn(btn.dataset.learn)) return;
      // Rebuild SVG + refresh side panel
      var scrollWrap = document.getElementById('dt-scroll-wrap');
      if (scrollWrap) {
        stopRuneAnim();
        scrollWrap.innerHTML = '<div style="min-width:' + VW + 'px">' + buildSVG() + '</div>';
        bindSVG(scrollWrap.querySelector('#dt-svg'));
        startRuneAnim(scrollWrap.querySelector('#dt-svg'));
      }
      if (curNode) showSide(curNode);
      var dNew = self.rm ? Math.floor(self.rm.get('drachmes')) : 0;
      var hdr  = el.querySelector('.dt-drachmes-count');
      if (hdr) hdr.textContent = '🪙 ' + fmt(dNew) + ' Drachmes';
    });
  }


  // ── Renderer pour branches Panthéon dans l'onglet Drachmes ─────────────────
  _renderPantheonBranch(el, branchId, branchDef) {
    var self = this;
    var pan  = self.pan;
    var PN   = (typeof PANTHEON_NODES !== 'undefined') ? PANTHEON_NODES : (window.PANTHEON_NODES || {});

    if (!pan || !Object.keys(PN).length) {
      el.innerHTML = '<div style="padding:24px;color:#888;text-align:center">Données non chargées.</div>';
      return;
    }

    var bc = branchDef.color || '#888';
    function hexToRgb(hex) {
      if (!hex||hex.length<7) return '128,128,128';
      return parseInt(hex.slice(1,3),16)+','+parseInt(hex.slice(3,5),16)+','+parseInt(hex.slice(5,7),16);
    }
    var rgb = hexToRgb(bc);

    // Collect nodes for this branch
    var rings = { 1:[], 2:[], 3:[] };
    Object.keys(PN).forEach(function(nid) {
      var nd = PN[nid];
      if (!nd || nd.branch !== branchId) return;
      var r = nd.ring || 1;
      if (!rings[r]) rings[r] = [];
      rings[r].push({ id: nid, nd: nd });
    });
    // Sort by slot
    [1,2,3].forEach(function(r) {
      rings[r].sort(function(a,b){ return (a.nd.slot||0)-(b.nd.slot||0); });
    });

    var VW = 720, VH = 460;
    var CX = VW/2, CY = 55;
    var ROW_Y = { 1: 100, 2: 220, 3: 340 };
    var NODE_R = 28;

    function getState(nid) { return pan.getNodeState(nid); }
    function hexPath(cx, cy, r) {
      var pts = [];
      for (var i=0; i<6; i++) {
        var a = Math.PI/3*i - Math.PI/6;
        pts.push((cx + r*Math.cos(a)).toFixed(1) + ',' + (cy + r*Math.sin(a)).toFixed(1));
      }
      return 'M'+pts.join('L')+'Z';
    }
    function nodeX(ring, idx, total) {
      if (total <= 1) return CX;
      var span = Math.min(total * 120, VW - 80);
      return CX - span/2 + idx * (span/(total-1));
    }

    // Build positions
    var positions = {};
    [1,2,3].forEach(function(r) {
      var nodes = rings[r];
      nodes.forEach(function(item, i) {
        positions[item.id] = { x: nodeX(r, i, nodes.length), y: ROW_Y[r] };
      });
    });

    function buildSVG() {
      var s = '<svg xmlns="http://www.w3.org/2000/svg" width="'+VW+'" height="'+VH+'"'
            + ' style="display:block;overflow:visible">';
      s += '<defs>'
         + '<linearGradient id="pb-bg" x1="0%" y1="0%" x2="100%" y2="100%">'
         + '<stop offset="0%" stop-color="rgba('+rgb+',0.08)"/>'
         + '<stop offset="100%" stop-color="rgba(0,0,0,0)"/>'
         + '</linearGradient>'
         + '<filter id="pb-glow" x="-50%" y="-50%" width="200%" height="200%">'
         + '<feGaussianBlur stdDeviation="6" result="b"/>'
         + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>'
         + '</filter></defs>';
      s += '<rect width="'+VW+'" height="'+VH+'" fill="url(#pb-bg)"/>';

      // Ring labels
      var RING_LABELS = { 1:'Anneau I', 2:'Anneau II', 3:'Anneau III' };
      [1,2,3].forEach(function(r) {
        s += '<text x="14" y="'+(ROW_Y[r]+5)+'" font-family="Cinzel,serif" font-size="10"'
           + ' fill="rgba('+rgb+',0.4)" letter-spacing="0.05em">'+RING_LABELS[r]+'</text>';
        s += '<line x1="0" y1="'+(ROW_Y[r]-40)+'" x2="'+VW+'" y2="'+(ROW_Y[r]-40)+'"'
           + ' stroke="rgba('+rgb+',0.08)" stroke-width="1"/>';
      });

      // Edges (requires links)
      Object.keys(positions).forEach(function(nid) {
        var nd = PN[nid];
        if (!nd || !nd.requires) return;
        nd.requires.forEach(function(req) {
          var pa = positions[req], pb = positions[nid];
          if (!pa || !pb) return;
          var st1 = getState(req), st2 = getState(nid);
          var active = st1==='learned' && st2==='learned';
          var half   = st1==='learned' && st2!=='learned';
          var col = active ? bc : half ? 'rgba('+rgb+',0.5)' : 'rgba(80,80,100,0.3)';
          var sw  = active ? 2.5 : 1.5;
          s += '<line x1="'+pa.x.toFixed(1)+'" y1="'+pa.y.toFixed(1)+'"'
             + ' x2="'+pb.x.toFixed(1)+'" y2="'+pb.y.toFixed(1)+'"'
             + ' stroke="'+col+'" stroke-width="'+sw+'" stroke-dasharray="'+(active?'none':'4,4')+'"/>';
        });
      });

      // Nodes
      Object.keys(positions).forEach(function(nid) {
        var pos = positions[nid];
        var nd  = PN[nid];
        if (!nd) return;
        var st = getState(nid);
        var pts2 = pan.invested[nid] || 0;
        var isLearned = st==='learned', isAvail = st==='available';
        var fillCol = isLearned ? 'rgba('+rgb+',0.35)' : isAvail ? 'rgba(20,15,40,0.95)' : 'rgba(8,6,18,0.92)';
        var strokeCol = isLearned ? bc : isAvail ? 'rgba(200,170,80,0.7)' : 'rgba(80,80,100,0.3)';
        var strokeW = isLearned ? 2.5 : isAvail ? 2 : 1.2;
        var hexOuter = hexPath(pos.x, pos.y, NODE_R+6);
        var hexInner = hexPath(pos.x, pos.y, NODE_R);
        var isSelected = (self._panBranchSel === nid);

        s += '<g class="pb-node" data-nid="'+nid+'" style="cursor:pointer">';
        if (isSelected) s += '<path d="'+hexPath(pos.x,pos.y,NODE_R+14)+'" fill="rgba('+rgb+',0.15)" stroke="'+bc+'" stroke-width="2" filter="url(#pb-glow)"/>';
        if (isLearned) s += '<path d="'+hexOuter+'" fill="rgba('+rgb+',0.2)" filter="url(#pb-glow)"/>';
        s += '<path d="'+hexInner+'" fill="'+fillCol+'" stroke="'+strokeCol+'" stroke-width="'+strokeW+'"/>';
        if (isLearned) s += '<text x="'+pos.x+'" y="'+(pos.y-NODE_R*0.55).toFixed(1)+'" text-anchor="middle" font-size="10" fill="rgba(220,220,80,0.8)">✓</text>';
        if (nd.uncapped && pts2>1) s += '<text x="'+(pos.x+NODE_R*0.7).toFixed(1)+'" y="'+(pos.y-NODE_R*0.55).toFixed(1)+'" text-anchor="middle" font-size="9" fill="#ffd54f">×'+pts2+'</text>';
        s += '<text x="'+pos.x+'" y="'+(pos.y+8)+'" text-anchor="middle" dominant-baseline="middle" font-size="20">'+nd.icon+'</text>';
        var lbl = nd.name || nid; if (lbl.length>13) lbl=lbl.slice(0,12)+'…';
        var labelFill = isLearned ? '#f0e080' : isAvail ? 'rgba(220,200,150,0.85)' : 'rgba(120,110,100,0.5)';
        s += '<text x="'+pos.x+'" y="'+(pos.y+NODE_R+13)+'" text-anchor="middle" font-family="Cinzel,serif" font-size="9.5" fill="'+labelFill+'">'+lbl+'</text>';
        s += '</g>';
      });
      s += '</svg>';
      return s;
    }

    function buildTooltip(nid) {
      var nd = PN[nid]; if (!nd) return '';
      var st = getState(nid), pts2 = pan.invested[nid]||0;
      var can = pan.canLearn(nid);
      var stColor = st==='learned'?'#60e060':st==='available'?'#f0c840':'#808080';
      var stLabel = st==='learned'?'✅ Acquis':st==='available'?'🟡 Disponible':'🔒 Verrouillé';
      var prereqHtml = '';
      if (nd.requires && nd.requires.length) {
        prereqHtml = '<div class="dt-tt-lock" style="font-size:11px">🔗 '
          + nd.requires.map(function(r){ var ok=(pan.invested[r]||0)>0; var rn=PN[r]; return '<span style="color:'+(ok?'#60e080':'#e06060')+'">'+(rn?rn.name:r)+'</span>'; }).join(', ')
          + '</div>';
      }
      var buyDisabled = (st==='learned' && !nd.uncapped) || !can.ok;
      var buyLabel = nd.uncapped ? '✨ Acheter encore (×'+(pts2+1)+') — '+nd.cost+' Éther'
                  : st==='learned' ? '✅ Déjà acquis'
                  : can.ok ? '✨ Apprendre — '+nd.cost+' Éther'
                  : '🔒 '+(can.reason||'Indisponible');
      return '<div class="dt-tt-icon">'+nd.icon+'</div>'
        + '<div class="dt-tt-name">'+nd.name+'</div>'
        + '<div class="dt-tt-state" style="color:'+stColor+'">'+stLabel+'</div>'
        + '<div class="dt-tt-desc">'+nd.desc+'</div>'
        + '<div class="dt-tt-cost" style="font-size:11px">Coût : '+nd.cost+' ✨ Éther'+(nd.uncapped?' · ∞':''+(pts2>0?' · ×'+pts2:''))+'</div>'
        + prereqHtml
        + (st==='available' ? '<button data-learn="'+nid+'" class="dt-tt-buy"'+(buyDisabled?' disabled':'')+'>'+buyLabel+'</button>' : '');
    }

    var drachmes = self.rm ? Math.floor(self.rm.get('drachmes')) : 0;
    var fmt = function(v){ return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(1)+'k':''+v; };
    el.innerHTML =
      '<div class="dt-drachmes-count">✨ '+fmt(self.rm ? Math.floor(self.rm.get('ether')) : 0)+' Éther disponible</div>'
      + '<div id="dt-scroll-wrap"><div style="min-width:'+VW+'px">'+buildSVG()+'</div></div>'
      + '<div id="dt-tooltip" class="dt-branch-tt" style="display:none"></div>';

    var ttBox = document.getElementById('dt-tooltip');
    var ttPinned = false;
    var curNode = self._panBranchSel || null;
    if (curNode) { ttBox.innerHTML = buildTooltip(curNode); ttBox.style.display = 'block'; ttPinned = true; }

    function bindNodes() {
      el.querySelectorAll('.pb-node').forEach(function(g) {
        g.addEventListener('mouseenter', function() {
          if (ttPinned) return;
          ttBox.innerHTML = buildTooltip(g.dataset.nid);
          ttBox.style.display = 'block';
        });
        g.addEventListener('mouseleave', function() {
          if (ttPinned) return;
          setTimeout(function(){ if (!ttBox.matches(':hover')) ttBox.style.display='none'; }, 120);
        });
        g.addEventListener('click', function(e) {
          e.stopPropagation();
          self._panBranchSel = g.dataset.nid;
          ttPinned = true;
          ttBox.innerHTML = buildTooltip(g.dataset.nid);
          ttBox.style.display = 'block';
          var sw = document.getElementById('dt-scroll-wrap');
          if (sw) { sw.innerHTML='<div style="min-width:'+VW+'px">'+buildSVG()+'</div>'; bindNodes(); }
        });
      });
    }
    bindNodes();

    document.addEventListener('click', function unpin(e) {
      if (!ttBox.contains(e.target) && !e.target.closest('.pb-node')) {
        ttPinned=false; ttBox.style.display='none'; self._panBranchSel=null;
      }
    });

    ttBox.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-learn]'); if (!btn) return;
      e.stopPropagation();
      if (!pan.learn(btn.dataset.learn)) return;
      var sw = document.getElementById('dt-scroll-wrap');
      if (sw) { sw.innerHTML='<div style="min-width:'+VW+'px">'+buildSVG()+'</div>'; bindNodes(); }
      if (self._panBranchSel) { ttBox.innerHTML=buildTooltip(self._panBranchSel); ttBox.style.display='block'; }
      var hdr = el.querySelector('.dt-drachmes-count');
      if (hdr) hdr.textContent='✨ '+fmt(self.rm?Math.floor(self.rm.get('ether')):0)+' Éther disponible';
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

  _renderEmptyUI(cell, body, isNewCell) {
    var self = this;
    body.innerHTML = '';
    body.onclick = null;
    // Build Bar handles empty cells — just bind cell to it
    if (self._buildBar) self._buildBar.setCell(cell, isNewCell !== false);
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


  _renderPantheonTab(el) {
    var self = this;
    var pan  = this.pan;
    if (!pan) {
      el.innerHTML = '<div style="padding:24px;color:#888;text-align:center">Panthéon non initialisé.</div>';
      return;
    }

    var PN = (typeof PANTHEON_NODES !== 'undefined') ? PANTHEON_NODES : (window.PANTHEON_NODES || {});
    var etherOwned = self.rm ? Math.floor(self.rm.get('ether')) : 0;
    var fmtE = function(v){ return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'k':String(Math.floor(v)); };
    var selNode = el._panSelNode || null;

    function hexToRgb(hex) {
      if (!hex||hex.length<7) return '128,128,128';
      return parseInt(hex.slice(1,3),16)+','+parseInt(hex.slice(3,5),16)+','+parseInt(hex.slice(5,7),16);
    }

    // ── 6 branches divines seulement (cartographie et héritage → Drachmes) ──
    var BRANCHES = [
      { id:'zeus',       label:'Zeus',       icon:'⚡', color:'#ffd54f', angle:0   },
      { id:'demeter',    label:'Déméter',    icon:'🌾', color:'#8bc34a', angle:60  },
      { id:'aphrodite',  label:'Aphrodite',  icon:'💫', color:'#f48fb1', angle:120 },
      { id:'artemis',    label:'Artémis',    icon:'🌙', color:'#4fc3f7', angle:180 },
      { id:'hades',      label:'Hadès',      icon:'💀', color:'#9575cd', angle:240 },
      { id:'hephaïstos', label:'Héphaïstos', icon:'🔨', color:'#ff7043', angle:300 },
    ];
    var branchMap = {};
    BRANCHES.forEach(function(b){ branchMap[b.id]=b; });

    // ── Canvas dimensions ────────────────────────────────────────────────────
    var W=1600, H=1000;
    var CX=800, CY=500;
    // Ellipse stretch
    var EX=1.40, EY=0.78;
    // Ring radii — increased to prevent overlap with spread=40°
    var R1=220, R2=360, R3=490;
    var RING_RADII = [0, R1, R2, R3];
    var NODE_R = 22; // hex radius (slightly smaller for spacing)
    var SLOTS = { 1:5, 2:5, 3:5 };
    var SPREAD = 40; // ±degrees around branch angle

    // ── Ellipse-mapped position for a node ───────────────────────────────────
    function nodePos(angleDeg, ring, slot) {
      var r = RING_RADII[ring] || R1;
      var n = SLOTS[ring] || 5;
      var step = (SPREAD * 2) / (n - 1);
      var slotAngle = angleDeg + (slot - (n-1)/2) * step;
      var rad = slotAngle * Math.PI / 180;
      return {
        x: CX + Math.cos(rad) * r * EX,
        y: CY + Math.sin(rad) * r * EY
      };
    }

    // ── Gather nodes by branch ───────────────────────────────────────────────
    var nodesByBranch = {};
    BRANCHES.forEach(function(b){ nodesByBranch[b.id] = {1:[],2:[],3:[]}; });
    Object.keys(PN).forEach(function(nid) {
      var nd = PN[nid];
      if (!nd) return;
      if (!nodesByBranch[nd.branch]) return; // skip cartographie/héritage
      var ring = nd.ring || 1;
      if (!nodesByBranch[nd.branch][ring]) nodesByBranch[nd.branch][ring] = [];
      nodesByBranch[nd.branch][ring].push(nid);
    });

    // ── Compute node positions ───────────────────────────────────────────────
    var nodePositions = {}; // nid → {x, y}
    BRANCHES.forEach(function(b) {
      [1,2,3].forEach(function(ring) {
        var nodes = nodesByBranch[b.id][ring] || [];
        nodes.forEach(function(nid, si) {
          nodePositions[nid] = nodePos(b.angle, ring, si);
        });
      });
    });

    // ── Edge style per branch ────────────────────────────────────────────────
    function makeEdge(nid1, nid2, branchId, state1, state2) {
      var p1 = nodePositions[nid1], p2 = nodePositions[nid2];
      if (!p1 || !p2) return '';
      var b = branchMap[branchId] || { color:'#888' };
      var active = (state1==='learned' && state2==='learned');
      var halfway = (state1==='learned' && state2!=='learned');
      var opacity = active?'0.9':halfway?'0.45':'0.18';
      var x1=p1.x, y1=p1.y, x2=p2.x, y2=p2.y;
      var dx=x2-x1, dy=y2-y1;
      var col = active ? b.color : halfway ? b.color : 'rgba(120,120,140,1)';
      var sw = active?2.8:halfway?1.8:1.2;

      // Branch-specific style
      if (branchId==='zeus') {
        // Pure crackling lightning — multi-layer glow like reference
        var pts=[[x1,y1]], n=8;
        var rng=function(s){return(Math.sin(s*127.1+3.7)*0.5+0.5)*2-1;};
        var nxz=-dy/Math.hypot(dx,dy), nyz=dx/Math.hypot(dx,dy);
        var amp0=active?20:12;
        for(var i=1;i<n;i++){
          var t=i/n, amp=(i%2===0?amp0:-amp0)*(0.6+Math.abs(rng(i)));
          pts.push([x1+t*dx+amp*nxz, y1+t*dy+amp*nyz]);
        }
        pts.push([x2,y2]);
        var d='M'+pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join('L');
        var glowOp = active?'0.35':halfway?'0.15':'0.06';
        return '<path d="'+d+'" fill="none" stroke="rgba(180,220,255,'+glowOp+')" stroke-width="'+(sw*4)+'" stroke-linecap="round" filter="url(#glow-s)"/>'+
               '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+opacity+'" stroke-linecap="round"/>'+
               (active?'<path d="'+d+'" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1" stroke-linecap="round"/>':'');
      }
      if (branchId==='demeter') {
        // Glowing emerald vines like reference image
        var len=Math.hypot(dx,dy);
        var nxd=-dy/len, nyd=dx/len;
        var amp=(active?30:16);
        var cp1x=x1+dx*0.3+nxd*amp, cp1y=y1+dy*0.3+nyd*amp;
        var cp2x=x1+dx*0.7-nxd*amp, cp2y=y1+dy*0.7-nyd*amp;
        var main='M'+x1.toFixed(1)+','+y1.toFixed(1)+' C'+cp1x.toFixed(1)+','+cp1y.toFixed(1)+' '+cp2x.toFixed(1)+','+cp2y.toFixed(1)+' '+x2.toFixed(1)+','+y2.toFixed(1);
        var cp3x=x1+dx*0.4+nxd*(amp*0.5), cp3y=y1+dy*0.4+nyd*(amp*0.5);
        var cp4x=x1+dx*0.6-nxd*(amp*0.4), cp4y=y1+dy*0.6-nyd*(amp*0.4);
        var brin2='M'+(x1+nxd*8).toFixed(1)+','+(y1+nyd*8).toFixed(1)+' C'+cp3x.toFixed(1)+','+cp3y.toFixed(1)+' '+cp4x.toFixed(1)+','+cp4y.toFixed(1)+' '+(x2+nxd*8).toFixed(1)+','+(y2+nyd*8).toFixed(1);
        var glowCol = active?'rgba(100,255,120,0.22)':'rgba(60,180,80,0.07)';
        return '<path d="'+main+'" fill="none" stroke="'+glowCol+'" stroke-width="'+(sw*6)+'" filter="url(#glow-s)"/>'+
               '<path d="'+main+'" fill="none" stroke="'+col+'" stroke-width="'+(sw*1.3)+'" opacity="'+opacity+'" />'+
               '<path d="'+brin2+'" fill="none" stroke="'+col+'" stroke-width="'+(sw*0.65)+'" opacity="'+(parseFloat(opacity)*0.65)+'" />';
      }
      if (branchId==='hephaïstos') {
        // Molten chains with fire glow like reference
        var fireGlow = active?'rgba(255,140,30,0.3)':'rgba(180,80,10,0.1)';
        return '<path d="M'+x1.toFixed(1)+','+y1.toFixed(1)+'L'+x2.toFixed(1)+','+y2.toFixed(1)+'" fill="none" stroke="'+fireGlow+'" stroke-width="'+(sw*8)+'" filter="url(#glow-s)"/>'+
               '<path d="M'+x1.toFixed(1)+','+y1.toFixed(1)+'L'+x2.toFixed(1)+','+y2.toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="'+(sw*1.5)+'" opacity="'+opacity+'" stroke-dasharray="12,5" stroke-linecap="round"/>'+
               (active?'<path d="M'+x1.toFixed(1)+','+y1.toFixed(1)+'L'+x2.toFixed(1)+','+y2.toFixed(1)+'" fill="none" stroke="rgba(255,220,100,0.4)" stroke-width="1" stroke-dasharray="4,13" stroke-dashoffset="6"/>':'');
      }
      if (branchId==='aphrodite') {
        // Luminous silk ribbons — dual sinuous strands like reference image
        var len2=Math.hypot(dx,dy), nx3=-dy/len2, ny3=dx/len2;
        var Nw=16, pts2=[[x1,y1]], pts2b=[[x1,y1]];
        var ampA=active?22:13;
        for(var iw=0;iw<Nw;iw++){
          var tw=(iw+1)/(Nw+1);
          var ww=Math.sin(tw*Math.PI*3.5)*ampA;
          pts2.push([x1+tw*dx+ww*nx3, y1+tw*dy+ww*ny3]);
          var ww2=Math.sin(tw*Math.PI*3.5+1.2)*ampA*0.6;
          pts2b.push([x1+tw*dx+ww2*nx3, y1+tw*dy+ww2*ny3]);
        }
        pts2.push([x2,y2]); pts2b.push([x2,y2]);
        var d2='M'+pts2.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join('L');
        var d2b='M'+pts2b.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join('L');
        var petalGlow = active?'rgba(255,150,200,0.22)':'rgba(200,80,120,0.07)';
        return '<path d="'+d2+'" fill="none" stroke="'+petalGlow+'" stroke-width="'+(sw*6)+'" filter="url(#glow-s)"/>'+
               '<path d="'+d2+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+opacity+'" stroke-linecap="round"/>'+
               '<path d="'+d2b+'" fill="none" stroke="rgba(255,200,230,0.38)" stroke-width="'+(sw*0.55)+'" opacity="'+(parseFloat(opacity)*0.7)+'" stroke-linecap="round"/>';
      }
      if (branchId==='hades') {
        // Sapphire-shadow veins — dark fissures with deep violet glow
        var len3=Math.hypot(dx,dy), nx4=-dy/len3, ny4=dx/len3;
        var rng2=function(s){return Math.sin(s*231.7+5.1)*0.5;};
        var pts3=[[x1,y1]], n3=12;
        var ampH=active?16:9;
        for(var ij=1;ij<n3;ij++){
          var tj=ij/n3, jj=(ij%2===0?1:-1)*(ampH*0.6+Math.abs(rng2(ij))*ampH);
          pts3.push([x1+tj*dx+jj*nx4, y1+tj*dy+jj*ny4]);
        }
        pts3.push([x2,y2]);
        var d3='M'+pts3.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join('L');
        var voidGlow = active?'rgba(100,40,180,0.35)':'rgba(60,20,100,0.12)';
        return '<path d="'+d3+'" fill="none" stroke="'+voidGlow+'" stroke-width="'+(sw*5)+'" filter="url(#glow-s)"/>'+
               '<path d="'+d3+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+opacity+'"/>'+
               (active?'<path d="'+d3+'" fill="none" stroke="rgba(180,120,255,0.3)" stroke-width="1"/>':'');
      }
      if (branchId==='artemis') {
        // Moonsilver spectral arrows with cool ethereal glow
        var dx2=x2-x1, dy2=y2-y1, dist=Math.hypot(dx2,dy2);
        var ax=dx2/dist, ay=dy2/dist;
        var nxa=-dy2/dist, nya=dx2/dist;
        // Arrowhead
        var al=Math.min(10,dist*0.12);
        var ah='M'+(x2-ax*al+nxa*4).toFixed(1)+','+(y2-ay*al+nya*4).toFixed(1)+
               'L'+x2.toFixed(1)+','+y2.toFixed(1)+
               'L'+(x2-ax*al-nxa*4).toFixed(1)+','+(y2-ay*al-nya*4).toFixed(1);
        var moonGlow = active?'rgba(180,230,255,0.2)':'rgba(100,160,200,0.06)';
        return '<path d="M'+x1.toFixed(1)+','+y1.toFixed(1)+'L'+x2.toFixed(1)+','+y2.toFixed(1)+'" fill="none" stroke="'+moonGlow+'" stroke-width="'+(sw*5)+'" filter="url(#glow-s)"/>'+
               '<path d="M'+x1.toFixed(1)+','+y1.toFixed(1)+'L'+x2.toFixed(1)+','+y2.toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+opacity+'" stroke-dasharray="'+(active?'none':'14,4')+'" stroke-linecap="butt"/>'+
               '<path d="'+ah+'" fill="none" stroke="'+col+'" stroke-width="'+(sw*0.85)+'" opacity="'+opacity+'" stroke-linecap="round"/>';
      }
      // Default
      return '<path d="M'+x1.toFixed(1)+','+y1.toFixed(1)+'L'+x2.toFixed(1)+','+y2.toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+opacity+'"/>';
    }

    // ── Build SVG ────────────────────────────────────────────────────────────
    function buildSVG() {
      var selNode = el._panSelNode || null;

      function hexP(cx,cy,r){
        var pts=[];
        for(var i=0;i<6;i++){var a=Math.PI/3*i-Math.PI/6;pts.push((cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1));}
        return 'M'+pts.join('L')+'Z';
      }

      var s = '<svg id="pnt-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
            + ' viewBox="0 0 '+W+' '+H+'"'
            + ' style="width:100%;height:100%;display:block;cursor:grab;user-select:none">';

      // ── Defs ──────────────────────────────────────────────────────────────
      s += '<defs>'
         + '<filter id="glow-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         + '<filter id="glow-m" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         + '<filter id="glow-l" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
         + '<radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">'
         +   '<stop offset="0%" stop-color="#12082a"/>'
         +   '<stop offset="100%" stop-color="#04020c"/>'
         + '</radialGradient>'
         + '</defs>';

      // ── Background ────────────────────────────────────────────────────────
      s += '<rect width="'+W+'" height="'+H+'" fill="url(#bg-grad)"/>';

      // Stars
      var STARS=[[120,80],[350,40],[650,90],[950,30],[1280,65],[1480,110],[80,200],[1550,300],[70,450],[1520,420],[100,700],[200,850],[500,920],[900,950],[1300,880],[1480,750],[1530,600],[240,160],[760,50],[1100,140],[430,800],[1050,820],[680,920],[1380,200],[320,520],[1200,460]];
      STARS.forEach(function(st){
        var r=0.5+((st[0]*13+st[1]*7)%10)*0.18;
        s+='<circle cx="'+st[0]+'" cy="'+st[1]+'" r="'+r.toFixed(1)+'" fill="rgba(255,255,255,'+(0.18+r*0.1)+')"/>';
      });

      // ── Colored sector fills — camembert semi-transparent (~40%) ──────────
      BRANCHES.forEach(function(b){
        var rgb=hexToRgb(b.color);
        var unlocked = pan.isBranchUnlocked ? pan.isBranchUnlocked(b.id) : true;
        var a0=(b.angle-30)*Math.PI/180, a1=(b.angle+30)*Math.PI/180;
        var sR=R3+110, steps=24;
        // Full sector fill
        var arcPts=CX.toFixed(1)+','+CY.toFixed(1);
        for(var si=0;si<=steps;si++){
          var ta=a0+(a1-a0)*si/steps;
          arcPts+=' '+(CX+Math.cos(ta)*sR*EX).toFixed(1)+','+(CY+Math.sin(ta)*sR*EY).toFixed(1);
        }
        s+='<polygon points="'+arcPts+'" fill="rgba('+rgb+','+(unlocked?'0.38':'0.08')+')" stroke="none"/>';
        // Bright rim band (inner arc strip at R3 for depth)
        if(unlocked){
          var rimPts='';
          for(var ri=0;ri<=steps;ri++){
            var tr=a0+(a1-a0)*ri/steps;
            var ix=(CX+Math.cos(tr)*(R3-6)*EX).toFixed(1)+','+(CY+Math.sin(tr)*(R3-6)*EY).toFixed(1);
            rimPts+=(ri===0?'M':'L')+ix;
          }
          for(var ri2=steps;ri2>=0;ri2--){
            var tr2=a0+(a1-a0)*ri2/steps;
            var ox=(CX+Math.cos(tr2)*(R3+50)*EX).toFixed(1)+','+(CY+Math.sin(tr2)*(R3+50)*EY).toFixed(1);
            rimPts+='L'+ox;
          }
          s+='<path d="'+rimPts+'" fill="rgba('+rgb+',0.22)" stroke="rgba('+rgb+',0.55)" stroke-width="1.5"/>';
        }
        // Center divider line
        var radM=b.angle*Math.PI/180;
        s+='<line x1="'+CX+'" y1="'+CY+'" x2="'+(CX+Math.cos(radM)*(R3+85)*EX).toFixed(1)+'" y2="'+(CY+Math.sin(radM)*(R3+85)*EY).toFixed(1)+'"'
          +' stroke="rgba('+rgb+','+(unlocked?'0.35':'0.08')+')" stroke-width="2" stroke-dasharray="3,7"/>';
      });

      // ── Ellipse guide rings ───────────────────────────────────────────────
      [R1,R2,R3].forEach(function(r){
        s+='<ellipse cx="'+CX+'" cy="'+CY+'" rx="'+(r*EX).toFixed(0)+'" ry="'+(r*EY).toFixed(0)+'"'
          +' fill="none" stroke="rgba(200,149,26,0.09)" stroke-width="1" stroke-dasharray="4,8"/>';
      });

      // ── Center orb ───────────────────────────────────────────────────────
      s+='<circle cx="'+CX+'" cy="'+CY+'" r="82" fill="none" stroke="rgba(255,220,100,0.04)" stroke-width="40"/>';
      s+='<circle cx="'+CX+'" cy="'+CY+'" r="58" fill="none" stroke="rgba(255,200,80,0.09)" stroke-width="22"/>';
      s+='<circle cx="'+CX+'" cy="'+CY+'" r="45" fill="rgba(50,22,88,0.60)" stroke="rgba(255,220,120,0.22)" stroke-width="9" filter="url(#glow-l)"/>';
      s+='<circle cx="'+CX+'" cy="'+CY+'" r="38" fill="rgba(18,8,42,0.96)" filter="url(#glow-m)"/>';
      s+='<circle cx="'+CX+'" cy="'+CY+'" r="37" fill="none" stroke="rgba(255,210,70,0.95)" stroke-width="2.5"/>';
      s+='<circle cx="'+CX+'" cy="'+CY+'" r="30" fill="none" stroke="rgba(255,180,50,0.30)" stroke-width="1"/>';
      s+='<text x="'+CX+'" y="'+(CY+13)+'" text-anchor="middle" font-size="36" filter="url(#glow-m)">⚡</text>';

      // ── Edges: center → ring1 ─────────────────────────────────────────────
      BRANCHES.forEach(function(b){
        (nodesByBranch[b.id][1]||[]).forEach(function(nid){
          var st=pan.getNodeState(nid); var p=nodePositions[nid];
          if(!p) return;
          s+=makeEdgeDirect(CX,CY,p.x,p.y,b.id,'learned',st);
        });
      });
      // ring1→ring2, ring2→ring3 via requires
      Object.keys(nodePositions).forEach(function(nid){
        var nd=PN[nid]; if(!nd||!nd.requires) return;
        var st1=pan.getNodeState(nid);
        nd.requires.forEach(function(reqId){
          if(!nodePositions[reqId]) return;
          var st2=pan.getNodeState(reqId);
          s+=makeEdge(reqId,nid,nd.branch,st2,st1);
        });
      });

      // ── Nodes ─────────────────────────────────────────────────────────────
      Object.keys(nodePositions).forEach(function(nid){
        var nd=PN[nid]; if(!nd) return;
        var b=branchMap[nd.branch]; if(!b) return;
        var pos=nodePositions[nid];
        var state=pan.getNodeState(nid);
        var pts2=pan.invested[nid]||0;
        var bc=b.color, rgb=hexToRgb(bc);
        var isSelected=(selNode===nid);
        var isLearned=(state==='learned');
        var isAvailable=(state==='available');
        var unlocked=pan.isBranchUnlocked?pan.isBranchUnlocked(nd.branch):true;

        s+='<g data-nid="'+nid+'" style="cursor:pointer">';
        if(isSelected){
          s+='<path d="'+hexP(pos.x,pos.y,NODE_R+17)+'" fill="rgba('+rgb+',0.22)" stroke="'+bc+'" stroke-width="3" filter="url(#glow-m)"/>';
          s+='<path d="'+hexP(pos.x,pos.y,NODE_R+24)+'" fill="none" stroke="rgba('+rgb+',0.35)" stroke-width="1.5" stroke-dasharray="4,4"/>';
        }
        if(isLearned){
          s+='<path d="'+hexP(pos.x,pos.y,NODE_R+20)+'" fill="rgba('+rgb+',0.14)" stroke="none" filter="url(#glow-l)"/>';
          s+='<path d="'+hexP(pos.x,pos.y,NODE_R+9)+'" fill="rgba('+rgb+',0.30)" stroke="none" filter="url(#glow-m)"/>';
        } else if(isAvailable&&unlocked){
          s+='<path d="'+hexP(pos.x,pos.y,NODE_R+9)+'" fill="rgba('+rgb+',0.07)" stroke="rgba('+rgb+',0.28)" stroke-width="1" filter="url(#glow-s)"/>';
        }
        var fillCol=isLearned?'rgba('+rgb+',0.30)':isAvailable?'rgba(12,7,28,0.93)':'rgba(6,4,14,0.93)';
        var strokeCol=isLearned?bc:(isAvailable&&unlocked)?'rgba('+rgb+',0.68)':'rgba(55,55,78,0.38)';
        var strokeW=isLearned?3.0:(isAvailable&&unlocked)?1.8:1.0;
        s+='<path d="'+hexP(pos.x,pos.y,NODE_R)+'" fill="'+fillCol+'" stroke="'+strokeCol+'" stroke-width="'+strokeW+'"/>';
        if(isLearned){
          s+='<path d="'+hexP(pos.x,pos.y,NODE_R-3)+'" fill="none" stroke="rgba('+rgb+',0.42)" stroke-width="1"/>';
          s+='<text x="'+pos.x+'" y="'+(pos.y-NODE_R*0.58).toFixed(1)+'" text-anchor="middle" font-size="9" fill="rgba(255,240,100,0.85)">✓</text>';
        }
        if(nd.uncapped&&pts2>1)
          s+='<text x="'+(pos.x+NODE_R*0.72).toFixed(1)+'" y="'+(pos.y-NODE_R*0.58).toFixed(1)+'" text-anchor="middle" font-size="9" fill="#ffd54f" font-family="Cinzel,serif">×'+pts2+'</text>';
        s+='<text x="'+pos.x.toFixed(1)+'" y="'+(pos.y+9).toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(isLearned?25:21)+'">'+nd.icon+'</text>';
        var lbl=nd.name||nid; if(lbl.length>12) lbl=lbl.slice(0,11)+'…';
        var labelFill=isLearned?'#f0e080':(isAvailable&&unlocked)?'rgba(220,200,150,0.88)':'rgba(105,100,90,0.42)';
        s+='<text x="'+pos.x.toFixed(1)+'" y="'+(pos.y+NODE_R+14).toFixed(1)+'" text-anchor="middle" font-family="Cinzel,serif" font-size="9.5" fill="'+labelFill+'">'+lbl+'</text>';
        s+='</g>';
      });

      // ── God labels — luminous bloom ────────────────────────────────────────
      BRANCHES.forEach(function(b){
        var rad=b.angle*Math.PI/180;
        var lx=CX+Math.cos(rad)*(R3+65)*EX;
        var ly=CY+Math.sin(rad)*(R3+65)*EY;
        lx=Math.max(82,Math.min(W-82,lx));
        ly=Math.max(40,Math.min(H-40,ly));
        var rgb=hexToRgb(b.color);
        var unlocked=pan.isBranchUnlocked?pan.isBranchUnlocked(b.id):true;
        var col=unlocked?b.color:'rgba(68,64,80,1)';
        var pillW=Math.max(96,b.label.length*10+32), pillH=34;

        if(unlocked){
          // Bloom halo
          s+='<ellipse cx="'+lx.toFixed(1)+'" cy="'+ly.toFixed(1)+'" rx="'+(pillW*0.68)+'" ry="22"'
            +' fill="rgba('+rgb+',0.12)" filter="url(#glow-l)"/>';
          // Pill
          s+='<rect x="'+(lx-pillW/2).toFixed(1)+'" y="'+(ly-pillH/2).toFixed(1)+'"'
            +' width="'+pillW+'" height="'+pillH+'" rx="'+Math.round(pillH/2)+'"'
            +' fill="rgba(6,3,16,0.84)" stroke="rgba('+rgb+',0.75)" stroke-width="2"/>';
          // Icon
          s+='<text x="'+(lx-pillW/2+19).toFixed(1)+'" y="'+(ly+7).toFixed(1)+'" text-anchor="middle" font-size="16">'+b.icon+'</text>';
          // Name — glow layer beneath + solid layer on top
          s+='<text x="'+(lx+10).toFixed(1)+'" y="'+(ly+7).toFixed(1)+'" text-anchor="middle"'
            +' font-family="Cinzel,serif" font-size="13.5" font-weight="900" letter-spacing="0.06em"'
            +' fill="rgba('+rgb+',0.55)" filter="url(#glow-m)">'+b.label+'</text>';
          s+='<text x="'+(lx+10).toFixed(1)+'" y="'+(ly+7).toFixed(1)+'" text-anchor="middle"'
            +' font-family="Cinzel,serif" font-size="13.5" font-weight="900" letter-spacing="0.06em"'
            +' fill="'+col+'">'+b.label+'</text>';
        } else {
          s+='<rect x="'+(lx-pillW/2).toFixed(1)+'" y="'+(ly-pillH/2).toFixed(1)+'"'
            +' width="'+pillW+'" height="'+pillH+'" rx="'+Math.round(pillH/2)+'"'
            +' fill="rgba(6,3,16,0.62)" stroke="rgba(88,82,100,0.30)" stroke-width="1"/>';
          s+='<text x="'+lx.toFixed(1)+'" y="'+(ly+7).toFixed(1)+'" text-anchor="middle"'
            +' font-family="Cinzel,serif" font-size="12" font-weight="700" fill="rgba(78,74,90,0.55)">🔒 '+b.label+'</text>';
        }
      });

      s+='</svg>';
      return s;
    }

    // Helper: direct edge between two absolute positions
    function makeEdgeDirect(x1,y1,x2,y2,branchId,st1,st2){
      var b=branchMap[branchId]||{color:'#888'};
      var active=(st1==='learned'&&st2==='learned');
      var halfway=(st1==='learned'&&st2!=='learned');
      var unlocked=pan.isBranchUnlocked?pan.isBranchUnlocked(branchId):true;
      var op=active?1.0:halfway?0.55:(unlocked?0.22:0.07);
      var col=active?b.color:halfway?b.color:'rgba(65,62,85,1)';
      var sw=active?3.2:halfway?1.9:1.0;
      var dx=x2-x1,dy=y2-y1;
      var len=Math.sqrt(dx*dx+dy*dy)||1;
      var nx=-dy/len,ny=dx/len;
      if(!active&&!halfway&&!unlocked) return '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="rgba(40,38,58,0.12)" stroke-width="0.8"/>';

      // ── ZEUS — éclairs crépitants multicouches ──────────────────────────
      if(branchId==='zeus'){
        var rng=function(s){return Math.sin(s*127.3+1.8)*Math.sin(s*31.7+5.1);};
        var amp=active?26:halfway?16:9;
        var n=12, pts='';
        for(var i=0;i<=n;i++){
          var t=i/n;
          var j=(i>0&&i<n)?nx*rng(i)*amp+ny*rng(i*1.3+2)*amp*0.4:0;
          var j2=(i>0&&i<n)?ny*rng(i)*amp-nx*rng(i*1.3+2)*amp*0.4:0;
          pts+=(i===0?'M':'L')+(x1+t*dx+j).toFixed(1)+','+(y1+t*dy+j2).toFixed(1);
        }
        // secondary bolt (offset phase)
        var pts2='';
        for(var i2=0;i2<=n;i2++){
          var t2=i2/n;
          var j3=(i2>0&&i2<n)?nx*rng(i2+4.1)*amp*0.55+ny*rng(i2*1.7+3.3)*amp*0.2:0;
          var j4=(i2>0&&i2<n)?ny*rng(i2+4.1)*amp*0.55-nx*rng(i2*1.7+3.3)*amp*0.2:0;
          pts2+=(i2===0?'M':'L')+(x1+t2*dx+j3).toFixed(1)+','+(y1+t2*dy+j4).toFixed(1);
        }
        return '<path d="'+pts+'" fill="none" stroke="rgba(120,190,255,'+(active?'0.35':halfway?'0.18':'0.06')+')" stroke-width="'+(sw*6)+'" stroke-linecap="round" filter="url(#glow-s)"/>'
             + '<path d="'+pts+'" fill="none" stroke="rgba(200,230,255,'+(active?'0.55':halfway?'0.28':'0.10')+')" stroke-width="'+(sw*2.2)+'" stroke-linecap="round"/>'
             + '<path d="'+pts+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+op+'" stroke-linecap="round"/>'
             + (active?'<path d="'+pts+'" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" stroke-linecap="round"/>':'')
             + (active?'<path d="'+pts2+'" fill="none" stroke="rgba(255,220,80,0.45)" stroke-width="1.0" stroke-linecap="round"/>':'')
             + (halfway?'<path d="'+pts2+'" fill="none" stroke="rgba(255,200,60,0.22)" stroke-width="0.8" stroke-linecap="round"/>':'');
      }

      // ── DEMETER — vignes entrelacées émeraude ───────────────────────────
      if(branchId==='demeter'){
        var amp2=active?32:halfway?20:11;
        var cp1x=x1+dx*0.28+nx*amp2, cp1y=y1+dy*0.28+ny*amp2;
        var cp2x=x1+dx*0.72-nx*amp2, cp2y=y1+dy*0.72-ny*amp2;
        var main='M'+x1.toFixed(1)+','+y1.toFixed(1)+' C'+cp1x.toFixed(1)+','+cp1y.toFixed(1)+' '+cp2x.toFixed(1)+','+cp2y.toFixed(1)+' '+x2.toFixed(1)+','+y2.toFixed(1);
        // secondary brin, opposite S-curve
        var off=nx*11, ofy=ny*11;
        var cp3x=x1+dx*0.32-nx*amp2*0.65+off, cp3y=y1+dy*0.32-ny*amp2*0.65+ofy;
        var cp4x=x1+dx*0.68+nx*amp2*0.50+off, cp4y=y1+dy*0.68+ny*amp2*0.50+ofy;
        var brin='M'+(x1+off).toFixed(1)+','+(y1+ofy).toFixed(1)+' C'+cp3x.toFixed(1)+','+cp3y.toFixed(1)+' '+cp4x.toFixed(1)+','+cp4y.toFixed(1)+' '+(x2+off).toFixed(1)+','+(y2+ofy).toFixed(1);
        // root tendrils: small knot at midpoint
        var mx2=(x1+x2)/2+nx*8, my2=(y1+y2)/2+ny*8;
        var knot=active?'<circle cx="'+mx2.toFixed(1)+'" cy="'+my2.toFixed(1)+'" r="3" fill="rgba(80,200,80,0.55)" filter="url(#glow-s)"/>':'';
        return '<path d="'+main+'" fill="none" stroke="rgba(40,200,60,'+(active?'0.28':halfway?'0.14':'0.05')+')" stroke-width="'+(sw*7.5)+'" filter="url(#glow-s)" class="edge-dem-glow"/>'
             + '<path d="'+main+'" fill="none" stroke="'+col+'" stroke-width="'+(sw*1.6)+'" opacity="'+op+'" stroke-linecap="round"/>'
             + '<path d="'+brin+'" fill="none" stroke="'+col+'" stroke-width="'+(sw*0.8)+'" opacity="'+(op*0.62).toFixed(2)+'" stroke-linecap="round"/>'
             + (active?'<path d="'+main+'" fill="none" stroke="rgba(140,255,100,0.28)" stroke-width="1.2" stroke-dasharray="3,6"/>':'')
             + knot;
      }

      // ── HEPHAÏSTOS — chaînes incandescentes rouge-orange ────────────────
      if(branchId==='hephaïstos'){
        var fireGlow=active?'rgba(255,110,10,0.35)':halfway?'rgba(200,70,5,0.18)':'rgba(130,40,5,0.07)';
        var embers=active?'rgba(255,230,70,0.55)':halfway?'rgba(255,170,40,0.28)':'rgba(0,0,0,0)';
        // Chain: thick dashes with ember sparks
        var chainLen=Math.sqrt(dx*dx+dy*dy);
        var sparkPts='';
        if(active){
          var ax2=dx/len,ay2=dy/len;
          for(var ci=1;ci<4;ci++){
            var ct=ci/4;
            var spx=(x1+ct*dx+nx*(ci%2===0?6:-6)).toFixed(1);
            var spy=(y1+ct*dy+ny*(ci%2===0?6:-6)).toFixed(1);
            sparkPts+='<circle cx="'+spx+'" cy="'+spy+'" r="2.5" fill="rgba(255,200,50,0.7)" filter="url(#glow-s)"/>';
          }
        }
        return '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+fireGlow+'" stroke-width="'+(sw*9)+'" filter="url(#glow-s)"/>'
             + '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="'+(sw*2)+'" opacity="'+op+'" stroke-dasharray="12,5" stroke-linecap="round"/>'
             + '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+embers+'" stroke-width="1.8" stroke-dasharray="4,13" stroke-dashoffset="8" class="edge-hep-ember"/>'
             + sparkPts;
      }

      // ── APHRODITE — rubans de soie sinusoïdaux ──────────────────────────
      if(branchId==='aphrodite'){
        var ampA=active?24:halfway?15:8;
        var N=20, pts1='', pts2='';
        for(var ia=0;ia<=N;ia++){
          var ta2=ia/N;
          var w1=Math.sin(ta2*Math.PI*3.8)*ampA;
          var w2=Math.sin(ta2*Math.PI*3.8+Math.PI*0.45)*ampA*0.52;
          pts1+=(ia===0?'M':'L')+(x1+ta2*dx+w1*nx).toFixed(1)+','+(y1+ta2*dy+w1*ny).toFixed(1);
          pts2+=(ia===0?'M':'L')+(x1+ta2*dx+w2*nx).toFixed(1)+','+(y1+ta2*dy+w2*ny).toFixed(1);
        }
        // petal sparkle at midpoint
        var pmx=(x1+x2)/2, pmy=(y1+y2)/2;
        var petalSpark=active?'<circle cx="'+pmx.toFixed(1)+'" cy="'+pmy.toFixed(1)+'" r="3.5" fill="rgba(255,180,220,0.65)" filter="url(#glow-m)"/>':'';
        var petalGlow=active?'rgba(255,130,180,0.30)':halfway?'rgba(210,85,130,0.15)':'rgba(150,55,85,0.06)';
        return '<path d="'+pts1+'" fill="none" stroke="'+petalGlow+'" stroke-width="'+(sw*7)+'" filter="url(#glow-s)"/>'
             + '<path d="'+pts1+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+op+'" stroke-linecap="round"/>'
             + '<path d="'+pts2+'" fill="none" stroke="rgba(255,215,235,0.42)" stroke-width="'+(sw*0.55)+'" opacity="'+(op*0.65).toFixed(2)+'" stroke-linecap="round"/>'
             + (active?'<path d="'+pts1+'" fill="none" stroke="rgba(255,240,250,0.20)" stroke-width="0.8" stroke-dasharray="2,4"/>':'')
             + petalSpark;
      }

      // ── HADES — veines d'ombre saphir ───────────────────────────────────
      if(branchId==='hades'){
        var rngH=function(s){return Math.sin(s*193.1+3.7)*0.5+Math.sin(s*47.3+1.2)*0.3;};
        var ampH=active?16:halfway?10:5;
        var nH=14, ptsH='';
        for(var ih=0;ih<=nH;ih++){
          var thH=ih/nH;
          var jH=(ih>0&&ih<nH)?(ih%2===0?1:-1)*(ampH*0.5+Math.abs(rngH(ih))*ampH):0;
          ptsH+=(ih===0?'M':'L')+(x1+thH*dx+jH*nx).toFixed(1)+','+(y1+thH*dy+jH*ny).toFixed(1);
        }
        // fissure cracks (secondary jagged path, perpendicular offset)
        var ptsH2='';
        for(var ih2=0;ih2<=nH;ih2++){
          var thH2=ih2/nH;
          var jH2=(ih2>0&&ih2<nH)?(ih2%2===0?-1:1)*(ampH*0.4+Math.abs(rngH(ih2+2.5))*ampH*0.6):0;
          ptsH2+=(ih2===0?'M':'L')+(x1+thH2*dx+jH2*nx+nx*6).toFixed(1)+','+(y1+thH2*dy+jH2*ny+ny*6).toFixed(1);
        }
        return '<path d="'+ptsH+'" fill="none" stroke="rgba(80,20,170,'+(active?'0.38':halfway?'0.18':'0.06')+')" stroke-width="'+(sw*6)+'" filter="url(#glow-s)"/>'
             + '<path d="'+ptsH+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+op+'" stroke-linecap="square"/>'
             + (active?'<path d="'+ptsH+'" fill="none" stroke="rgba(180,120,255,0.32)" stroke-width="1.2"/>':'')
             + (active?'<path d="'+ptsH2+'" fill="none" stroke="rgba(100,50,200,0.22)" stroke-width="0.8" stroke-dasharray="2,5"/>':'')
             + (halfway?'<path d="'+ptsH2+'" fill="none" stroke="rgba(80,30,150,0.15)" stroke-width="0.7" stroke-dasharray="2,6"/>':'');
      }

      // ── ARTEMIS — flèches spectrales lunaires ───────────────────────────
      if(branchId==='artemis'){
        var ax3=dx/len,ay3=dy/len;
        var al=Math.min(12,len*0.13);
        // Arrowhead
        var ah='M'+(x2-ax3*al+nx*4.5).toFixed(1)+','+(y2-ay3*al+ny*4.5).toFixed(1)
              +' L'+x2.toFixed(1)+','+y2.toFixed(1)
              +' L'+(x2-ax3*al-nx*4.5).toFixed(1)+','+(y2-ay3*al-ny*4.5).toFixed(1);
        // Secondary parallel ray
        var off2=nx*8,ofy2=ny*8;
        var moonGlow=active?'rgba(150,215,255,0.28)':halfway?'rgba(90,165,220,0.14)':'rgba(50,90,135,0.06)';
        return '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+moonGlow+'" stroke-width="'+(sw*6)+'" filter="url(#glow-s)"/>'
             + '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+op+'" stroke-dasharray="'+(active?'none':halfway?'16,4':'9,6')+'" stroke-linecap="butt" class="'+(active?'edge-art-flow':'')+'"/>'
             + '<path d="'+ah+'" fill="none" stroke="'+col+'" stroke-width="'+(sw*0.9)+'" opacity="'+op+'" stroke-linecap="round"/>'
             + (active?'<line x1="'+(x1+off2).toFixed(1)+'" y1="'+(y1+ofy2).toFixed(1)+'" x2="'+(x2+off2).toFixed(1)+'" y2="'+(y2+ofy2).toFixed(1)+'" stroke="rgba(180,230,255,0.22)" stroke-width="0.8" stroke-dasharray="6,5"/>':'');
      }

      // Fallback
      return '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="'+sw+'" opacity="'+op+'"/>';
    }

    // ── DOM Setup ────────────────────────────────────────────────────────────
    el.innerHTML = '<div class="pnt-wrap" id="pnt-wrap"></div>';
    var wrap = el.querySelector('#pnt-wrap');
    wrap.innerHTML =
      '<div class="pnt-header">'
      + '<span class="pnt-title">⚡ Panthéon des Dieux</span>'
      + '<span class="pnt-ether" id="pnt-ether">✨ '+fmtE(etherOwned)+' Éther</span>'
      + '</div>'
      + '<div class="pnt-body">'
      +   '<div class="pnt-canvas-box" id="pnt-canvas-box"></div>'
      +   '<div class="pnt-side" id="pnt-side"><div class="pnt-hint">← Clique sur un talent</div></div>'
      + '</div>';

    var canvasBox = wrap.querySelector('#pnt-canvas-box');
    var sideEl    = wrap.querySelector('#pnt-side');

    // ── Inject SVG ────────────────────────────────────────────────────────────
    canvasBox.innerHTML = buildSVG();
    var svgEl = canvasBox.querySelector('#pnt-svg');

    // ── Pan / Zoom ────────────────────────────────────────────────────────────
    var vb = { x:0, y:0, scale:1 };
    var MIN_SCALE=0.45, MAX_SCALE=2.8;
    var drag2 = { active:false, sx:0, sy:0, vx:0, vy:0, moved:false };
    var touchPts = {};

    function clampVB() {
      var cw=canvasBox.clientWidth||900, ch=canvasBox.clientHeight||580;
      var vw=cw/vb.scale, vh=ch/vb.scale;
      // 25% overshoot so you can pan to edges
      var ox=W*0.25, oy=H*0.25;
      vb.x=Math.max(-ox, Math.min(vb.x, Math.max(-ox, W-vw+ox)));
      vb.y=Math.max(-oy, Math.min(vb.y, Math.max(-oy, H-vh+oy)));
    }
    function applyVB() {
      clampVB();
      var cw=canvasBox.clientWidth||900, ch=canvasBox.clientHeight||580;
      var vw=cw/vb.scale, vh=ch/vb.scale;
      if (!svgEl) return;
      svgEl.setAttribute('viewBox', vb.x.toFixed(1)+' '+vb.y.toFixed(1)+' '+vw.toFixed(1)+' '+vh.toFixed(1));
    }
    // Initial fit — center the full diagram
    setTimeout(function(){
      if (!canvasBox) return;
      var cw=canvasBox.clientWidth, ch=canvasBox.clientHeight;
      if (!cw||!ch) return;
      vb.scale = Math.min(cw/W, ch/H) * 0.96;
      MIN_SCALE = vb.scale * 0.80;
      // Center the diagram in the viewport
      vb.x = -(cw/vb.scale - W) / 2;
      vb.y = -(ch/vb.scale - H) / 2;
      applyVB();
    }, 40);

    function bindEvents(svg) {
      svg.addEventListener('wheel', function(e) {
        e.preventDefault();
        var rect=canvasBox.getBoundingClientRect();
        var mx=(e.clientX-rect.left)/rect.width*W/vb.scale+vb.x;
        var my=(e.clientY-rect.top)/rect.height*H/vb.scale+vb.y;
        var delta=e.deltaY<0?1.12:1/1.12;
        var ns=Math.max(MIN_SCALE,Math.min(MAX_SCALE,vb.scale*delta));
        vb.x=mx-(mx-vb.x)*(vb.scale/ns);
        vb.y=my-(my-vb.y)*(vb.scale/ns);
        vb.scale=ns; applyVB();
      },{passive:false});
      svg.addEventListener('mousedown',function(e){
        if(e.button!==0) return;
        drag2={active:true,sx:e.clientX,sy:e.clientY,vx:vb.x,vy:vb.y,moved:false};
        svg.style.cursor='grabbing';
      });
      window.addEventListener('mousemove',function(e){
        if(!drag2.active) return;
        var dx=e.clientX-drag2.sx, dy=e.clientY-drag2.sy;
        if(Math.hypot(dx,dy)>4) drag2.moved=true;
        var rect=canvasBox.getBoundingClientRect();
        if(!rect.width||!rect.height) return;
        vb.x=drag2.vx-dx*(W/rect.width/vb.scale);
        vb.y=drag2.vy-dy*(H/rect.height/vb.scale);
        applyVB();
      });
      window.addEventListener('mouseup',function(){
        if(drag2.active){drag2.active=false; if(svgEl) svgEl.style.cursor='grab';}
      });
      svg.addEventListener('touchstart',function(e){
        e.preventDefault();
        Array.from(e.changedTouches).forEach(function(t){touchPts[t.identifier]={x:t.clientX,y:t.clientY};});
        if(Object.keys(touchPts).length===1){
          var t=e.changedTouches[0];
          drag2={active:true,sx:t.clientX,sy:t.clientY,vx:vb.x,vy:vb.y,moved:false};
        }
      },{passive:false});
      svg.addEventListener('touchmove',function(e){
        e.preventDefault();
        var ids=Object.keys(touchPts);
        if(ids.length>=2&&e.touches.length>=2){
          var t0=touchPts[ids[0]],t1=touchPts[ids[1]];
          var d0=Math.hypot(t0.x-t1.x,t0.y-t1.y);
          var d1=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
          var rect=canvasBox.getBoundingClientRect();
          var mx=((t0.x+t1.x)/2-rect.left)/rect.width*W/vb.scale+vb.x;
          var my=((t0.y+t1.y)/2-rect.top)/rect.height*H/vb.scale+vb.y;
          var ns=Math.max(MIN_SCALE,Math.min(MAX_SCALE,vb.scale*d1/d0));
          vb.x=mx-(mx-vb.x)*(vb.scale/ns); vb.y=my-(my-vb.y)*(vb.scale/ns); vb.scale=ns; applyVB();
          Array.from(e.changedTouches).forEach(function(t){touchPts[t.identifier]={x:t.clientX,y:t.clientY};});
        } else {
          Array.from(e.changedTouches).forEach(function(t){touchPts[t.identifier]={x:t.clientX,y:t.clientY};});
          if(drag2.active){
            var t=e.changedTouches[0];
            var dx=t.clientX-drag2.sx, dy=t.clientY-drag2.sy;
            if(Math.hypot(dx,dy)>4) drag2.moved=true;
            var rect=canvasBox.getBoundingClientRect();
            vb.x=drag2.vx-dx*(W/rect.width/vb.scale);
            vb.y=drag2.vy-dy*(H/rect.height/vb.scale);
            applyVB();
          }
        }
      },{passive:false});
      svg.addEventListener('touchend',function(e){
        Array.from(e.changedTouches).forEach(function(t){delete touchPts[t.identifier];});
        if(!drag2.moved&&e.changedTouches.length===1){
          var t=e.changedTouches[0];
          handleClick({clientX:t.clientX,clientY:t.clientY,target:document.elementFromPoint(t.clientX,t.clientY)});
        }
        drag2.active=false;
      },{passive:false});
      svg.addEventListener('click', handleClick);
    }

    function handleClick(e) {
      if (drag2.moved) return;
      var tgt=e.target;
      if (!tgt) return;
      var nidEl = tgt.closest ? tgt.closest('[data-nid]') : null;
      if (!nidEl) return;
      var nid = nidEl.getAttribute('data-nid');
      if (!nid) return;
      selNode = nid;
      el._panSelNode = nid;
      canvasBox.innerHTML = buildSVG();
      svgEl = canvasBox.querySelector('#pnt-svg');
      bindEvents(svgEl);
      applyVB();
      renderDetail(nid);
    }

    bindEvents(svgEl);

    // ── Detail panel ──────────────────────────────────────────────────────────
    function renderDetail(nodeId) {
      var nd=PN[nodeId];
      if(!nd){sideEl.innerHTML='<div class="pnt-hint">← Clique sur un talent</div>'; return;}
      var b=branchMap[nd.branch];
      var bc=b?b.color:'#888', rgb=hexToRgb(bc);
      var state=pan.getNodeState(nodeId), pts2=pan.invested[nodeId]||0;
      var check=pan.canLearn(nodeId), unlocked=pan.isBranchUnlocked ? pan.isBranchUnlocked(nd.branch) : true;
      var stateLabel=state==='learned'?'✅ Acquis':state==='available'?'🟡 Disponible':'🔒 Verrouillé';
      var stateColor=state==='learned'?'#60e060':state==='available'?'#f0c840':'#808080';
      var prereqHtml='';
      if(nd.requires&&nd.requires.length>0){
        prereqHtml='<div class="pnt-d-prereq">🔗 Prérequis : '+
          nd.requires.map(function(rId){
            var rn=PN[rId]; var ok=(pan.invested[rId]||0)>0;
            return '<span style="color:'+(ok?'#60e060':'#e06060')+'">'+(rn?rn.name:rId)+'</span>';
          }).join(', ')+'</div>';
      }
      var buyDisabled=(state==='learned'&&!nd.uncapped)||!check.ok;
      var buyLabel=nd.uncapped?'✨ Acheter encore (×'+(pts2+1)+') — '+nd.cost+' Éther'
                  :state==='learned'?'✅ Déjà acquis'
                  :check.ok?'✨ Apprendre — '+nd.cost+' Éther'
                  :'🔒 '+(check.reason||'Indisponible');
      sideEl.innerHTML=
        '<div class="pnt-d-wrap" style="--bc:'+bc+';--rgb:'+rgb+'">'
        +'<div class="pnt-d-head">'
          +'<svg viewBox="0 0 60 70" width="52" height="60">'
            +'<polygon points="30,2 56,17 56,53 30,68 4,53 4,17" fill="rgba('+rgb+',0.25)" stroke="'+bc+'" stroke-width="2.5"/>'
            +'<text x="30" y="44" text-anchor="middle" font-size="26">'+nd.icon+'</text>'
          +'</svg>'
          +'<div class="pnt-d-info">'
            +'<div class="pnt-d-name">'+nd.name+'</div>'
            +'<div class="pnt-d-branch" style="color:'+bc+'">'+(b?b.icon+' '+b.label:'')+'</div>'
            +'<div class="pnt-d-ring">Anneau '+nd.ring+(nd.uncapped?' · ∞ (×'+pts2+' acquis)':'')+' · '+nd.cost+' ✨</div>'
          +'</div>'
        +'</div>'
        +'<div class="pnt-d-state" style="color:'+stateColor+'">'+stateLabel+'</div>'
        +'<div class="pnt-d-desc">'+nd.desc+'</div>'
        +prereqHtml
        +'<button class="pnt-d-buy'+(buyDisabled?' disabled':'')+'\" data-buy-node="'+nodeId+'"'+(buyDisabled?' disabled':'')+'>'+buyLabel+'</button>'
        +'</div>';

      var buyBtn=sideEl.querySelector('[data-buy-node]');
      if(buyBtn) buyBtn.onclick=function(e){
        if(this.disabled) return;
        var nid2=this.dataset.buyNode;
        if(pan.learn(nid2,e.clientX,e.clientY)){
          var etEl=document.getElementById('pnt-ether');
          if(etEl) etEl.textContent='✨ '+fmtE(self.rm?self.rm.get('ether'):0)+' Éther';
          canvasBox.innerHTML=buildSVG();
          svgEl=canvasBox.querySelector('#pnt-svg');
          bindEvents(svgEl); applyVB();
          renderDetail(nid2);
        }
      };
    }

    if (selNode) renderDetail(selNode);
  }





  // ── Mode verrou construction ─────────────────────────────
  _updateLockHUD(def) {
    var hud = document.getElementById('lock-build-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'lock-build-hud';
      document.body.appendChild(hud);
    }
    var drawer = document.getElementById('bp-drawer');
    if (!def) {
      hud.className = 'lbh-hidden';
      hud.innerHTML = '';
      if (drawer) drawer.classList.remove('bp-lock-active');
      return;
    }
    if (drawer) drawer.classList.add('bp-lock-active');
    hud.className = 'lbh-visible';
    hud.innerHTML =
      '<span class="lbh-icon">' + def.glyph + '</span>' +
      '<div class="lbh-info">'
        + '<span class="lbh-name">🔒 Verrou actif : <b>' + def.name + '</b></span>'
        + '<span class="lbh-hint">Clique sur une case vide pour construire</span>'
      + '</div>'
      + '<button class="lbh-cancel" id="lbh-cancel-btn">✕</button>';
    document.getElementById('lbh-cancel-btn').onclick = function() {
      this._lockedBuildingId = null;
      this._updateLockHUD(null);
      if (this.currentCell) this.refresh();
    }.bind(this);
  }


  // ── Liaison événements ──────────────────────────────────
  _bindEvents() {
    var self = this;

    // Échap → déverrouille le mode verrou
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && self._lockedBuildingId) {
        self._lockedBuildingId = null;
        self._updateLockHUD(null);
        if (self.currentCell) self.refresh();
      }
    });

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

      // Mode verrou actif sur case révélée vide → essaie de construire directement
      if (self._lockedBuildingId && !cell.building && !cell.isHidden) {
        var lockDef = (typeof BUILDINGS !== 'undefined') ? BUILDINGS[self._lockedBuildingId] : null;
        if (lockDef) {
          var lockCheck = self.bm.canBuild(cell, self._lockedBuildingId);
          if (lockCheck.ok) {
            // Debounce: évite double-build (touch + mouse)
            var nowLock = Date.now();
            if (self._lastBuildAt && nowLock - self._lastBuildAt < 350) return;
            self._lastBuildAt = nowLock;
            self.bm.build(cell, self._lockedBuildingId, sx, sy);
            // Don't open drawer — just a quick flash feedback
            EventBus.emit('ui:feedback', { text: lockDef.glyph + ' Construit !', x: sx, y: sy, color: '#60e060' });
            return;
          } else {
            // Incompatible — brief error, open drawer normally
            EventBus.emit('ui:feedback', { text: '⚠️ ' + lockCheck.reason, x: sx, y: sy, color: '#e06020' });
          }
        }
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
// Also expose globally for zones tab etc.
window.RES_ICONS = RES_ICONS;
window.RES_NAMES = RES_NAMES;
