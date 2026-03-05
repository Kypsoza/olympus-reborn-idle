/* BuildingPanel.js — v0.5.3
   Drawer coulissant en bas de l'ecran (remplace le tooltip flottant)
*/

class BuildingPanel {
  constructor(bm, rm, tm) {
    this.bm = bm; this.rm = rm; this.tm = tm;
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
    } else {
      this._renderEtherTree(el);
    }
  }

  _renderDrachmeTree(el) {
    var self = this;

    // ── Canvas virtuel (radial) ─────────────────────────
    var VW = 900, VH = 900;
    var CX = VW/2, CY = VH/2;  // centre
    var R  = 30;   // rayon nœud

    var branches = self.tm.getBranchData();
    var NB = branches.length; // 7 branches

    // Angles des branches (distribuées sur 360°, décalées de 90° pour commencer en haut)
    var BRANCH_ANGLES = {};
    branches.forEach(function(b, bi) {
      BRANCH_ANGLES[b.id] = -Math.PI/2 + (2*Math.PI/NB) * bi;
    });

    // Rayons des anneaux (distance du centre) — 3 nœuds par sous-colonne
    // col 0 = niv max, col 1 = prod
    // Anneau 0 = nœud centre (fictif), 1-3 = col0, 4-6 = col1 (offset angulaire)
    var RING_R = [0, 140, 250, 360, 140, 250, 360]; // indice = rang dans branch

    // ── Positions des nœuds ─────────────────────────────
    var NODE_POS = {}; // id → {x,y,branchId,branchColor,branchIcon,branchLabel}
    var EDGES    = []; // [[from,to]]

    branches.forEach(function(b) {
      var baseAngle = BRANCH_ANGLES[b.id];
      var twoCol    = b.cols.length === 2;
      var colOffAng = twoCol ? 0.18 : 0; // décalage angulaire entre les 2 sous-colonnes

      b.cols.forEach(function(col, ci) {
        var ang = baseAngle + (ci===0 ? -colOffAng : colOffAng);
        col.forEach(function(id, ri) {
          var dist = 130 + ri * 120; // distance croissante du centre
          NODE_POS[id] = {
            x: CX + Math.cos(ang) * dist,
            y: CY + Math.sin(ang) * dist,
            branchId: b.id, branchColor: b.color,
            branchIcon: b.icon, branchLabel: b.label,
            angle: ang, dist: dist
          };
          var def = self.tm.getTalentDef(id);
          if (def && def.requires) def.requires.forEach(function(req) {
            EDGES.push([req, id]);
          });
        });
      });
    });

    // ── État d'un nœud ───────────────────────────────────
    function getState(id) {
      if (self.tm.learned[id]) return 'learned';
      return self.tm.canLearn(id).ok ? 'available' : 'locked';
    }
    function fmtV(v) { return v>=1000?(v/1000).toFixed(0)+'k':''+v; }
    function fmtCost(cost) {
      var icons={drachmes:'🪙',bois:'🪵',nourr:'🌾',fer:'⚙️'};
      return Object.entries(cost).map(function(e){return fmtV(e[1])+(icons[e[0]]||e[0]);}).join('  ');
    }

    // ── Construction SVG ─────────────────────────────────
    function buildSVG() {
      var s = '<svg id="dt-svg" xmlns="http://www.w3.org/2000/svg"'
        +' width="'+VW+'" height="'+VH+'"'
        +' style="display:block;overflow:visible">';

      s += '<defs>';
      // Filtres glow
      s += '<filter id="dt-gd" x="-80%" y="-80%" width="260%" height="260%">'
         + '<feGaussianBlur stdDeviation="6" result="b"/>'
         + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      s += '<filter id="dt-ga" x="-60%" y="-60%" width="220%" height="220%">'
         + '<feGaussianBlur stdDeviation="3.5" result="b"/>'
         + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      // Dégradé fond
      s += '<linearGradient id="dt-bg" x1="0" y1="0" x2="0" y2="1">'
         + '<stop offset="0%" stop-color="#0a0800"/>'
         + '<stop offset="100%" stop-color="#060500"/>'
         + '</linearGradient>';
      s += '</defs>';

      // Fond
      s += '<rect width="'+VW+'" height="'+VH+'" fill="url(#dt-bg)" rx="16"/>';
      // Grille de points
      for (var gx=40;gx<VW;gx+=56) for (var gy=40;gy<VH;gy+=56)
        s += '<circle cx="'+gx+'" cy="'+gy+'" r="1" fill="rgba(255,220,100,0.03)"/>';

      // Cercles guides concentriques
      [130,250,370].forEach(function(rd) {
        s += '<circle cx="'+CX+'" cy="'+CY+'" r="'+rd+'" fill="none"'
          +' stroke="rgba(255,220,100,0.06)" stroke-width="1" stroke-dasharray="4,12"/>';
      });

      // Rayons de branche depuis le centre
      branches.forEach(function(b) {
        var ang = BRANCH_ANGLES[b.id];
        var ex = CX + Math.cos(ang)*400, ey = CY + Math.sin(ang)*400;
        s += '<line x1="'+CX+'" y1="'+CY+'" x2="'+ex+'" y2="'+ey+'"'
          +' stroke="'+b.color+'" stroke-width="1" opacity="0.10"/>';
        // Label branche
        var lx = CX + Math.cos(ang)*430, ly = CY + Math.sin(ang)*430;
        var rotDeg = (ang*180/Math.PI) + (ang>Math.PI/2||ang<-Math.PI/2 ? 0 : 0);
        s += '<g transform="translate('+lx+','+ly+')">';
        s += '<text text-anchor="middle" dominant-baseline="middle"'
          +' font-size="10" fill="'+b.color+'" font-family="Cinzel,serif" font-weight="700"'
          +' letter-spacing="0.6" style="pointer-events:none">'+b.icon+' '+b.label.toUpperCase()+'</text>';
        s += '</g>';
      });

      // Nœud central (⚡)
      s += '<circle cx="'+CX+'" cy="'+CY+'" r="30" fill="rgba(25,15,5,0.97)"'
        +' stroke="#c8961a" stroke-width="2.5" filter="url(#dt-gd)"/>';
      s += '<text x="'+CX+'" y="'+(CY+1)+'" text-anchor="middle" dominant-baseline="middle"'
        +' font-size="20" style="pointer-events:none">⚡</text>';

      // ── Lignes de connexion ──────────────────────────────
      EDGES.forEach(function(e) {
        var a=NODE_POS[e[0]], b=NODE_POS[e[1]]; if (!a||!b) return;
        var sa=getState(e[0]), sb=getState(e[1]);
        var active=sa==='learned'&&sb==='learned';
        var half=sa==='learned'&&sb!=='learned';
        var col = active ? 'rgba(240,192,60,0.85)' : half ? 'rgba(160,220,60,0.4)' : 'rgba(80,70,30,0.35)';
        var w = active ? 3 : 1.5;
        // Ligne courbe (bezier) entre nœuds
        var mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
        var path;
        if (a.x===b.x) {
          // Même colonne: ligne droite
          path='M'+a.x+','+a.y+' L'+b.x+','+b.y;
        } else {
          // Colonnes différentes: S-curve
          path='M'+a.x+','+(a.y+R)+' C'+a.x+','+(my)+' '+b.x+','+(my)+' '+b.x+','+(b.y-R);
        }
        s += '<path d="'+path+'" stroke="'+col+'" stroke-width="'+w+'" fill="none"'
          +(active?'':' stroke-dasharray="6,4"')+'/>';
        // Point milieu si actif
        if (active)
          s += '<circle cx="'+mx+'" cy="'+(a.y+R+(b.y-R-a.y-R)/2)+'" r="3" fill="rgba(240,200,60,0.9)"/>';
      });

      // ── Nœuds ────────────────────────────────────────────
      Object.entries(NODE_POS).forEach(function(entry) {
        var id=entry[0], pos=entry[1];
        var def=self.tm.getTalentDef(id); if (!def) return;
        var st=getState(id);
        var bc=pos.branchColor;
        var stroke = st==='learned'?bc : st==='available'?bc : 'rgba(70,65,40,0.6)';
        var fill   = st==='learned'?'rgba(28,20,0,0.97)' : st==='available'?'rgba(6,12,2,0.97)' : 'rgba(5,4,2,0.9)';
        var filt   = st==='learned'?' filter="url(#dt-gd)"' : st==='available'?' filter="url(#dt-ga)"':'';
        var sw     = st==='learned'?2.5:1.5;
        var alpha  = st==='locked'?'0.38':'1';
        var cur    = st!=='locked'?'pointer':'default';
        var textcol= st==='learned'?'#fff0a0':st==='available'?'#c0e890':'#4a4830';

        // Outer decorative ring
        if (st==='learned') {
          s += '<circle cx="'+pos.x+'" cy="'+pos.y+'" r="'+(R+12)+'" fill="none"'
            +' stroke="'+bc+'" stroke-width="0.6" opacity="0.2" stroke-dasharray="2,9"/>';
        }
        // Inner ring hint
        s += '<circle cx="'+pos.x+'" cy="'+pos.y+'" r="'+(R+5)+'" fill="none"'
          +' stroke="'+stroke+'" stroke-width="1" opacity="'+(st==='locked'?0.1:0.3)+'"/>';
        // Main circle
        s += '<circle cx="'+pos.x+'" cy="'+pos.y+'" r="'+R+'"'
          +' fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"'
          +filt+' data-dnode="'+id+'" style="cursor:'+cur+';opacity:'+alpha+'"/>';

        // Icon
        var icon = st==='locked'?'🔒':def.icon;
        s += '<text x="'+pos.x+'" y="'+(pos.y-6)+'" text-anchor="middle" dominant-baseline="middle"'
          +' font-size="17" style="pointer-events:none;user-select:none">'+icon+'</text>';

        // Coût / check
        if (st!=='learned') {
          var fv=Object.values(def.cost)[0];
          var afford=Object.entries(def.cost).every(function(e){return self.rm.get(e[0])>=e[1];});
          s += '<text x="'+pos.x+'" y="'+(pos.y+R*0.5)+'" text-anchor="middle"'
            +' font-size="8.5" fill="'+(afford?'#a0e060':'#e06050')+'" font-family="Cinzel,serif"'
            +' style="pointer-events:none">'+fmtV(fv)+'</text>';
        } else {
          s += '<text x="'+pos.x+'" y="'+(pos.y+R*0.5)+'" text-anchor="middle"'
            +' font-size="11" fill="#90e050" style="pointer-events:none">✓</text>';
        }

        // Nom sous le nœud
        var nm=def.name.length>14?def.name.substring(0,13)+'…':def.name;
        s += '<text x="'+pos.x+'" y="'+(pos.y+R+15)+'" text-anchor="middle"'
          +' font-size="9.5" fill="'+textcol+'" font-family="Cinzel,serif" font-weight="600"'
          +' style="pointer-events:none">'+nm+'</text>';
      });

      s += '</svg>';
      return s;
    }

    // ── Tooltip latéral ──────────────────────────────────
    function buildTT(id) {
      var def=self.tm.getTalentDef(id); if (!def) return '';
      var st=getState(id), pos=NODE_POS[id];
      var afford=st!=='learned'&&Object.entries(def.cost).every(function(e){return self.rm.get(e[0])>=e[1];});
      var reqNm=(def.requires||[]).map(function(r){var d=self.tm.getTalentDef(r);return d?d.name:r;}).join(', ');
      var btn='';
      if (st==='learned') btn='<div class="tt2-acquired">✓ Acquis</div>';
      else if (st==='available') btn='<button class="tt2-buy tt2-buy-d" data-learnnode="'+id+'">'+(afford?'💰 Apprendre':'🔒 Ressources insuffisantes')+'</button>';
      else { var ch=self.tm.canLearn(id); btn='<div class="tt2-locked">🔒 '+ch.reason+'</div>'; }
      return '<div class="tt2-head"><span class="tt2-icon">'+def.icon+'</span>'
        +'<div><div class="tt2-name">'+def.name+'</div>'
        +'<div class="tt2-branch" style="color:'+pos.branchColor+'">'+pos.branchIcon+' '+pos.branchLabel+'</div></div></div>'
        +'<div class="tt2-desc">'+def.desc+'</div>'
        +(reqNm?'<div class="tt2-req">🔗 Prérequis : '+reqNm+'</div>':'')
        +'<div class="tt2-cost">'+fmtCost(def.cost)+'</div>'
        +btn;
    }

    // ── Assemblage HTML ──────────────────────────────────
    var drach=self.rm?Math.floor(self.rm.get('drachmes')):0;
    el.innerHTML =
      '<div class="et-header">'
      +'<span class="et-ether-count" style="color:#f0d060">🪙 '+(drach>=1000?(drach/1000).toFixed(1)+'k':''+drach)+' Drachmes</span>'
      +'<div class="at-zoom-controls">'
        +'<button class="at-zoom-btn" id="dt-zoom-out">−</button>'
        +'<span class="at-zoom-label" id="dt-zoom-lbl">100%</span>'
        +'<button class="at-zoom-btn" id="dt-zoom-in">+</button>'
        +'<button class="at-zoom-btn" id="dt-zoom-fit" title="Ajuster">⊡</button>'
      +'</div>'
      +'<span class="et-hint">Clic = détails · Molette = zoom</span>'
      +'</div>'
      +'<div class="at-wrap">'
        +'<div class="at-canvas-outer" id="dt-outer">'
          +'<div class="at-canvas-inner" id="dt-inner">'+buildSVG()+'</div>'
        +'</div>'
        +'<div class="at-tooltip-panel" id="dt-ttbox"><div class="at-tt-placeholder">Cliquez sur<br>un nœud</div></div>'
      +'</div>';

    // ── Pan & Zoom ───────────────────────────────────────
    var outer = el.querySelector('#dt-outer');
    var inner = el.querySelector('#dt-inner');
    var ttBox = el.querySelector('#dt-ttbox');
    var scale = 0.78, tx = 0, ty = 0;
    var panning = false, px0 = 0, py0 = 0, tx0 = 0, ty0 = 0;

    function applyTransform() {
      inner.style.transform = 'translate('+tx+'px,'+ty+'px) scale('+scale+')';
      el.querySelector('#dt-zoom-lbl').textContent = Math.round(scale*100)+'%';
    }
    applyTransform();

    function clampTransform() {
      var ow=outer.clientWidth||600, oh=outer.clientHeight||400;
      var cw=VW*scale, ch=VH*scale;
      tx = Math.min(40, Math.max(tx, ow - cw - 40));
      ty = Math.min(40, Math.max(ty, oh - ch - 40));
    }

    // Molette
    outer.addEventListener('wheel', function(e) {
      e.preventDefault();
      var rect=outer.getBoundingClientRect();
      var mx=e.clientX-rect.left, my=e.clientY-rect.top;
      var delta = e.deltaY > 0 ? 0.88 : 1.14;
      var newScale = Math.min(2.0, Math.max(0.3, scale*delta));
      // Zoom centré sur curseur
      tx = mx - (mx - tx) * (newScale/scale);
      ty = my - (my - ty) * (newScale/scale);
      scale = newScale;
      clampTransform();
      applyTransform();
    }, {passive:false});

    // Pan souris
    outer.addEventListener('mousedown', function(e) {
      if (e.target.closest('[data-dnode]')) return;
      panning=true; px0=e.clientX; py0=e.clientY; tx0=tx; ty0=ty;
      outer.style.cursor='grabbing';
    });
    window.addEventListener('mousemove', function(e) {
      if (!panning) return;
      tx=tx0+(e.clientX-px0); ty=ty0+(e.clientY-py0);
      clampTransform(); applyTransform();
    });
    window.addEventListener('mouseup', function() {
      if (panning) { panning=false; outer.style.cursor='grab'; }
    });

    // Pan tactile
    var touch0=null;
    outer.addEventListener('touchstart', function(e) {
      if (e.touches.length===1) { touch0={x:e.touches[0].clientX,y:e.touches[0].clientY,tx:tx,ty:ty}; }
    },{passive:true});
    outer.addEventListener('touchmove', function(e) {
      if (touch0&&e.touches.length===1) {
        tx=touch0.tx+(e.touches[0].clientX-touch0.x);
        ty=touch0.ty+(e.touches[0].clientY-touch0.y);
        clampTransform(); applyTransform();
      }
    },{passive:true});
    outer.addEventListener('touchend', function(){touch0=null;},{passive:true});

    // Boutons zoom
    el.querySelector('#dt-zoom-in').addEventListener('click',function(){
      scale=Math.min(2.0,scale*1.2); clampTransform(); applyTransform();
    });
    el.querySelector('#dt-zoom-out').addEventListener('click',function(){
      scale=Math.max(0.3,scale/1.2); clampTransform(); applyTransform();
    });
    el.querySelector('#dt-zoom-fit').addEventListener('click',function(){
      var ow=outer.clientWidth||600, oh=outer.clientHeight||400;
      scale=Math.min(ow/VW, oh/VH)*0.9;
      tx=(ow-VW*scale)/2; ty=(oh-VH*scale)/2;
      applyTransform();
    });

    // ── Interactions nœuds ──────────────────────────────
    var svgEl=el.querySelector('#dt-svg');

    svgEl.addEventListener('click', function(e) {
      var c=e.target.closest('[data-dnode]'); if (!c) return;
      var id=c.dataset.dnode;
      ttBox.innerHTML=buildTT(id);
      ttBox.dataset.node=id;
    });
    svgEl.addEventListener('mousemove', function(e) {
      var c=e.target.closest('[data-dnode]');
      if (c && ttBox.dataset.node!==c.dataset.dnode) {
        ttBox.innerHTML=buildTT(c.dataset.dnode);
        ttBox.dataset.node=c.dataset.dnode;
      }
    });

    el.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-learnnode]');
      if (!btn) return;
      e.stopPropagation();
      var id = btn.dataset.learnnode;
      // Coords pour feedback visuel
      var sx = e.clientX || window.innerWidth * 0.5;
      var sy = e.clientY || window.innerHeight * 0.4;
      var ok = self.tm.learn(id, sx, sy);
      if (ok) {
        // Reconstruire uniquement le SVG (plus rapide que _renderTalents complet)
        var svg = el.querySelector('#dt-svg');
        if (svg) {
          var newSVG = document.createElement('div');
          newSVG.innerHTML = buildSVG();
          svg.parentNode.replaceChild(newSVG.firstChild, svg);
        }
        // Mise à jour du compteur Drachmes
        var drach = self.rm ? Math.floor(self.rm.get('drachmes')) : 0;
        var dEl = el.querySelector('.et-ether-count');
        if (dEl) dEl.textContent = '🪙 ' + (drach>=1000?(drach/1000).toFixed(1)+'k':drach) + ' Drachmes';
        // Mettre à jour tooltip si un nœud est sélectionné
        var node = ttBox.dataset.node;
        if (node) ttBox.innerHTML = buildTT(node);
      }
    });

  }


    _renderEtherTree(el) {
    var self = this;
    var etherOwned = self.rm ? Math.floor(self.rm.get('ether')) : 0;

    var VW=760, VH=480;

    var NODES = {
      ere2:            { x:380, y:75  },
      ere3:            { x:380, y:175 },
      relique_amphore: { x:100, y:210 },
      relique_enclume: { x:100, y:305 },
      relique_carte:   { x:100, y:400 },
      relique_graine:  { x:215, y:210 },
      relique_eclair:  { x:215, y:305 },
      relique_omphalos:{ x:215, y:400 },
      const_prod:      { x:535, y:210 },
      const_dig:       { x:535, y:305 },
      const_pop:       { x:650, y:210 },
      const_ether:     { x:650, y:305 },
      const_prod2:     { x:592, y:400 },
    };

    var EDGES = [
      ['ere2','ere3'],
      ['ere2','relique_amphore'],['ere2','relique_graine'],
      ['ere2','const_prod'],['ere2','const_dig'],
      ['relique_amphore','relique_enclume'],['relique_graine','relique_eclair'],
      ['relique_enclume','relique_carte'],['relique_eclair','relique_omphalos'],
      ['const_prod','const_pop'],['const_dig','const_ether'],
      ['const_pop','const_prod2'],['const_ether','const_prod2'],
    ];

    var R=30, R_ERA=40;
    var BCOL = { eres:'#c8a840', reliques:'#a060e0', constellations:'#40b8f0' };

    function getState(id) {
      if (self.tm.etherLearned[id]) return 'learned';
      return self.tm.canLearnEther(id).ok ? 'available' : 'locked';
    }
    function ethFmt(v) { return v>=10000?(v/1000).toFixed(0)+'k':v>=1000?(v/1000).toFixed(1)+'k':''+v; }
    function getBranchColor(id) {
      var def=self.tm.getEtherDef(id); if (!def) return '#888';
      return BCOL[def.branch] || '#888';
    }

    function buildSVG() {
      var s='<svg id="et-svg" xmlns="http://www.w3.org/2000/svg"'
        +' viewBox="0 0 '+VW+' '+VH+'"'
        +' style="width:100%;height:100%;display:block">';

      s+='<defs>';
      s+='<radialGradient id="etbg" cx="50%" cy="40%" r="55%">'
        +'<stop offset="0%" stop-color="#0e0820"/>'
        +'<stop offset="100%" stop-color="#040308"/>'
        +'</radialGradient>';
      s+='<filter id="etgp"><feGaussianBlur stdDeviation="5" result="b"/>'
        +'<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      s+='<filter id="etgb"><feGaussianBlur stdDeviation="3" result="b"/>'
        +'<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      s+='<filter id="etgg"><feGaussianBlur stdDeviation="6" result="b"/>'
        +'<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      s+='</defs>';

      s+='<rect width="'+VW+'" height="'+VH+'" fill="url(#etbg)"/>';
      for (var gx=30;gx<VW;gx+=40) for (var gy=30;gy<VH;gy+=40)
        s+='<circle cx="'+gx+'" cy="'+gy+'" r="1" fill="rgba(180,100,255,0.04)"/>';

      // Edges
      EDGES.forEach(function(e) {
        var a=NODES[e[0]], b=NODES[e[1]]; if (!a||!b) return;
        var sa=getState(e[0]), sb=getState(e[1]);
        var active=sa==='learned'&&sb==='learned', half=sa==='learned';
        var col=active?'rgba(180,100,255,0.8)':half?'rgba(100,180,255,0.35)':'rgba(50,40,70,0.5)';
        s+='<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'"'
          +' stroke="'+col+'" stroke-width="'+(active?2.5:1.5)+'"'
          +(active?'':' stroke-dasharray="5,4"')+'/>';
        if (active) s+='<circle cx="'+((a.x+b.x)/2)+'" cy="'+((a.y+b.y)/2)+'" r="2.5" fill="rgba(200,120,255,0.9)"/>';
      });

      // Branch zone labels
      s+='<text x="157" y="40" text-anchor="middle" font-size="10" fill="#a060e0" font-family="Cinzel,serif" font-weight="700" style="pointer-events:none">🫙 RELIQUES</text>';
      s+='<text x="380" y="40" text-anchor="middle" font-size="10" fill="#c8a840" font-family="Cinzel,serif" font-weight="700" style="pointer-events:none">🏛️ ÈRES</text>';
      s+='<text x="592" y="40" text-anchor="middle" font-size="10" fill="#40b8f0" font-family="Cinzel,serif" font-weight="700" style="pointer-events:none">⭐ CONSTELLATIONS</text>';

      // Nodes
      Object.keys(NODES).forEach(function(id) {
        var pos=NODES[id];
        var def=self.tm.getEtherDef(id); if (!def) return;
        var st=getState(id);
        var isEra=def.effect&&def.effect.type==='unlockEra';
        var r=isEra?R_ERA:R;
        var bc=getBranchColor(id);
        var stroke=st==='learned'?bc:st==='available'?bc:'rgba(80,70,100,0.5)';
        var fill=st==='learned'?'rgba(20,8,40,0.95)':st==='available'?'rgba(4,8,20,0.95)':'rgba(4,3,8,0.9)';
        var filt=st==='learned'?(isEra?'url(#etgg)':'url(#etgp)'):st==='available'?'url(#etgb)':'';
        var sw=st==='learned'?2.5:1.5;
        var opacity=st==='locked'?'0.4':'1';
        var cursor=st!=='locked'?'pointer':'default';
        var textcol=st==='learned'?'#e8d8ff':st==='available'?'#a0d8f0':'#484060';

        if (st==='learned')
          s+='<circle cx="'+pos.x+'" cy="'+pos.y+'" r="'+(r+10)+'" fill="none" stroke="'+bc+'" stroke-width="0.5" opacity="0.25" stroke-dasharray="2,8"/>';
        s+='<circle cx="'+pos.x+'" cy="'+pos.y+'" r="'+(r+4)+'" fill="none" stroke="'+bc+'" stroke-width="1" opacity="'+(st==='locked'?0.1:0.35)+'"/>';
        s+='<circle cx="'+pos.x+'" cy="'+pos.y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"'
          +(filt?' filter="'+filt+'"':'')+' data-enode="'+id+'" style="cursor:'+cursor+';opacity:'+opacity+'"/>';

        var icon=st==='locked'?'🔒':def.icon;
        s+='<text x="'+pos.x+'" y="'+(pos.y-(isEra?5:4))+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(isEra?22:17)+'" style="pointer-events:none;user-select:none">'+icon+'</text>';

        if (st!=='learned') {
          var ec=def.cost.ether||0, ca=etherOwned>=ec;
          s+='<text x="'+pos.x+'" y="'+(pos.y+r*0.5)+'" text-anchor="middle" font-size="8" fill="'+(ca?'#90e060':'#e06050')+'" font-family="Cinzel,serif" style="pointer-events:none">'+ethFmt(ec)+'✨</text>';
        } else {
          s+='<text x="'+pos.x+'" y="'+(pos.y+r*0.5)+'" text-anchor="middle" font-size="10" fill="#a060ff" style="pointer-events:none">✓</text>';
        }

        var nm=def.name.length>13?def.name.substring(0,12)+'…':def.name;
        s+='<text x="'+pos.x+'" y="'+(pos.y+r+13)+'" text-anchor="middle" font-size="9" fill="'+textcol+'" font-family="Cinzel,serif" font-weight="600" style="pointer-events:none">'+nm+'</text>';
      });

      s+='</svg>';
      return s;
    }

    function buildTooltipHtml(id) {
      var def=self.tm.getEtherDef(id); if (!def) return '';
      var st=getState(id), ec=def.cost.ether||0, ca=etherOwned>=ec;
      var reqNm=(def.requires||[]).map(function(r){var d=self.tm.getEtherDef(r);return d?d.name:r;}).join(', ');
      var typeLabel=def.effect&&def.effect.type==='unlockEra'?'🏛️ ÈRE'
                   :def.effect&&def.effect.type==='relique'?'🫙 RELIQUE':'⭐ CONSTELLATION';
      var bc=getBranchColor(id);
      var btn='';
      if (st==='learned') btn='<div class="tt2-acquired">✓ Acquis — Permanent</div>';
      else if (st==='available') btn='<button class="tt2-buy tt2-buy-e" data-learnether="'+id+'">'+(ca?'🔮 Acquérir — '+ethFmt(ec)+' ✨':'🔒 Éther insuffisant ('+etherOwned+' / '+ethFmt(ec)+')')+'</button>';
      else { var ch=self.tm.canLearnEther(id); btn='<div class="tt2-locked">🔒 '+ch.reason+'</div>'; }
      return '<div class="tt2-head"><span class="tt2-icon">'+def.icon+'</span>'
        +'<div><div class="tt2-name">'+def.name+'</div>'
        +'<div class="tt2-branch" style="color:'+bc+'">'+typeLabel+'</div></div></div>'
        +'<div class="tt2-desc">'+def.desc+'</div>'
        +(reqNm?'<div class="tt2-req">🔗 Prérequis : '+reqNm+'</div>':'')
        +'<div class="tt2-cost">'+ethFmt(ec)+' ✨</div>'
        +btn;
    }

    var etherStr=etherOwned>=1000?(etherOwned/1000).toFixed(1)+'k':''+etherOwned;
    el.innerHTML=
      '<div class="et-header">'
      +'<span class="et-ether-count">✨ '+etherStr+' Éther</span>'
      +'<span class="et-hint">Cliquez sur un nœud pour voir les détails</span>'
      +'</div>'
      +'<div class="at-wrap">'
        +'<div class="at-svg-box" id="et-svgbox">'+buildSVG()+'</div>'
        +'<div class="at-tooltip-panel" id="et-ttbox"><div class="at-tt-placeholder">Cliquez sur un nœud</div></div>'
      +'</div>';

    var svgEl=el.querySelector('#et-svg');
    var ttBox=el.querySelector('#et-ttbox');

    function showTooltip(id) {
      ttBox.innerHTML=buildTooltipHtml(id);
      ttBox.dataset.node=id;
    }

    svgEl.addEventListener('click', function(e) {
      var c=e.target.closest('[data-enode]'); if (!c) return;
      var id=c.dataset.enode, st=getState(id);
      if (st==='available') {
        showTooltip(id); // show first, user clicks button
      } else {
        showTooltip(id);
      }
    });
    svgEl.addEventListener('mousemove', function(e) {
      var c=e.target.closest('[data-enode]');
      if (c && ttBox.dataset.node!==c.dataset.enode) showTooltip(c.dataset.enode);
    });

    el.addEventListener('click', function(e) {
      var btn=e.target.closest('[data-learnether]'); if (!btn) return;
      if (self.tm.learnEther(btn.dataset.learnether)) self._renderTalents();
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
  _costInline(cost) {
    var self = this;
    return Object.entries(cost).map(function(e) {
      var ok = self.rm.get(e[0]) >= e[1];
      return '<span style="color:' + (ok ? '#80e080' : '#e08080') + '">' + e[1] + (RES_ICONS[e[0]] || e[0]) + '</span>';
    }).join(' ');
  }
  _lock(ok) { return ok ? '' : ' bp-locked'; }

  // ── UI Fouille ───────────────────────────────────────────
  _renderDigUI(cell, body) {
    var self = this;
    var adj    = this.bm.grid.getNeighbors(cell.q, cell.r).some(function(n){ return n.isRevealed; });
    var pct    = Math.max(0, Math.ceil((cell.currentHP / cell.maxHP) * 100));
    var canDig = adj && this.rm.canAfford({ drachmes: 5 });
    body.innerHTML =
      '<div class="bp-cards-row">' +
        '<div class="bp-card">' +
          '<div class="bp-card-glyph">\u26CF\uFE0F</div>' +
          '<div class="bp-card-name">Zone Inconnue</div>' +
          '<div class="bp-lvlbar-track"><div class="bp-lvlbar-fill" style="width:' + (100 - pct) + '%"></div></div>' +
          '<div class="bp-card-desc">Resistance : ' + Math.ceil(cell.currentHP) + ' / ' + cell.maxHP + '</div>' +
          (!adj ? '<div class="bp-card-desc" style="color:#e08080">\u26A0 Zone inaccessible</div>' : '') +
          '<div class="bp-card-cost">Cout : 5 \uD83E\uDE99</div>' +
          '<button class="bp-card-action' + self._lock(canDig) + '" data-action="dig">' + (canDig ? '\u26CF\uFE0F Fouiller' : 'Impossible') + '</button>' +
        '</div>' +
      '</div>';

  }

  // ── UI Case vide ─────────────────────────────────────────
  _renderMudUI(cell, body) {
    var self = this; var bm = this.bm;
    var canDrain = bm.rm.canAfford({ drachmes: 120, bois: 60 });
    var html = '<div class="bp-bld-header">'
      + '<span class="bp-bld-glyph">🟫</span>'
      + '<div><div class="bp-bld-name">Vase Marécageuse</div>'
      + '<div class="bp-bld-lvl">Production passive</div></div></div>';
    html += '<div class="bp-prod-badges">'
      + '<span class="bp-prod-badge" style="color:#5aaa5a">🌾 +0.3/s</span>'
      + '<span class="bp-prod-badge" style="color:#7a9a3a">🪵 +0.1/s</span></div>';
    html += '<div style="font-size:12px;color:#80c0ff;margin-bottom:8px">👍 Clic = +2🌾 +1🪵 (cd 3s)</div>';
    html += '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:10px">Case bloquée — ni bâtiment ni route.</div>';
    html += '<div class="bp-bld-actions">';
    html += '<button class="bp-upgrade-btn' + self._lock(canDrain) + '" data-action="mud-drain">'
      + '🚧 Assécher → Plaine<span class="bp-upgrade-cost">120🪙 + 60🪵</span></button>';
    html += '</div>';
    body.innerHTML = html;
  }

  _renderRubbleUI(cell, body) {
    var self = this; var bm = this.bm;
    var canClear = bm.rm.canAfford({ drachmes: 500, bois: 200, fer: 50 });
    var html = '<div class="bp-bld-header">'
      + '<span class="bp-bld-glyph">🪨</span>'
      + '<div><div class="bp-bld-name">Décombres</div>'
      + '<div class="bp-bld-lvl">Montagne démolie</div></div></div>';
    html += '<div class="bp-prod-badges">'
      + '<span class="bp-prod-badge" style="color:#7aaad4">⚙️ +0.2 Fer/s</span>'
      + '<span class="bp-prod-badge" style="color:#7a9a3a">🪵 +0.1 Bois/s</span></div>';
    html += '<div style="font-size:12px;color:#80c0ff;margin-bottom:8px">👍 Clic = +1⚙️ (cd 5s)</div>';
    html += '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:10px">Case bloquée — ni bâtiment ni route.</div>';
    html += '<div class="bp-bld-actions">';
    html += '<button class="bp-upgrade-btn' + self._lock(canClear) + '" data-action="rubble-clear">'
      + '🧹 Déblayer → Plaine<span class="bp-upgrade-cost">500🪙+200🪵+50⚙️</span></button>';
    html += '</div>';
    body.innerHTML = html;
  }

  _renderTunnelUI(cell, body) {
    var self = this; var bm = this.bm;
    var canCollapse = bm.rm.canAfford({ drachmes: 100 });
    var html = '<div class="bp-bld-header">'
      + '<span class="bp-bld-glyph">🛤️</span>'
      + '<div><div class="bp-bld-name">Tunnel</div>'
      + '<div class="bp-bld-lvl">Passage dans la montagne</div></div></div>';
    html += '<div style="font-size:13px;color:#80e080;margin-bottom:5px">✅ Route constructible sur ce tunnel</div>';
    html += '<div style="font-size:12px;color:#f0c040;margin-bottom:10px">Relie deux zones séparées par une chaîne de montagnes.</div>';
    html += '<div class="bp-bld-actions">';
    if (!cell.hasRoad) {
      var rc = bm.canPlaceRoad(cell);
      html += '<button class="bp-upgrade-btn' + self._lock(rc.ok) + '" data-action="tun-road">'
        + '🛤️ Construire Route<span class="bp-upgrade-cost">30🪙+10🪵</span></button>';
    } else {
      var rr = bm.canRemoveRoad(cell);
      html += '<button class="bp-upgrade-btn' + self._lock(rr.ok) + '" data-action="tun-road-rm">'
        + '🔨 Démolir Route<span class="bp-upgrade-cost">10🪙</span></button>';
    }
    html += '<button class="bp-demolish-btn' + self._lock(canCollapse) + '" data-action="tun-collapse">'
      + '💥 Effondrer (100🪙)</button>';
    html += '</div>';
    body.innerHTML = html;
  }

  _renderEmptyUI(cell, body) {
    var self = this;

    // Catégories
    var available = BuildingManager.getBuildingsForTerrain(cell.type);
    var CATS = [
      { id:'production', label:'⚒️ Production',    ids:['farm','lumber','mine_copper','mine_iron','moulin','alambic','autel_fusion','verger','halle','atelier_forgeron','fonderie_celeste','jardins','bosquet','tresor','forge_divine'] },
      { id:'logement',   label:'🏘️ Logement',      ids:['huttes','maison','palais'] },
      { id:'infra',      label:'🛤️ Infra',          ids:['pylone','stele_zeus','noeud_olympien','agora','senat'] },
      { id:'militaire',  label:'🛡️ Défense',        ids:['forteresse','bastion'] },
      { id:'special',    label:'✨ Spécial',         ids:['scout','sanctuaire','temple_hermes','oracle','bibliotheque','omphalos'] },
    ];

    var availIds = available.map(function(d){ return d.id; });
    var tabs = CATS.map(function(cat){
      return Object.assign({}, cat, {
        buildings: cat.ids
          .filter(function(id){ return availIds.includes(id); })
          .map(function(id){ return available.find(function(d){ return d.id===id; }); })
          .filter(Boolean)
      });
    }).filter(function(cat){ return cat.buildings.length > 0; });

    var transforms = BuildingManager.getTerrainTransforms(cell.type);
    var hasRoute = (cell.type === CELL_TYPE.PLAIN || cell.type === CELL_TYPE.FIELD ||
                    cell.type === CELL_TYPE.GROVE || cell.hasRoad);
    if (hasRoute || transforms.length > 0) {
      tabs.push({ id:'terrain', label:'🌍 Terrain', buildings:[] });
    }

    var frag = document.createDocumentFragment();

    // ── Barre d'onglets ──────────────────────────────────
    var tabBar = document.createElement('div');
    tabBar.className = 'bp-tabs';
    // Restaurer l'onglet actif précédent s'il existe dans cette cellule
    var availableTabIds = tabs.map(function(t){ return t.id; });
    var savedTab = self._activeBPTab && availableTabIds.includes(self._activeBPTab) ? self._activeBPTab : null;
    var activeTab = savedTab || (tabs[0] ? tabs[0].id : 'terrain');
    tabs.forEach(function(tab){
      var btn = document.createElement('button');
      btn.className = 'bp-tab' + (tab.id === activeTab ? ' bp-tab-active' : '');
      btn.textContent = tab.label;
      btn.dataset.tab = tab.id;
      tabBar.appendChild(btn);
    });
    frag.appendChild(tabBar);

    // ── Conteneur onglets ────────────────────────────────
    var tabContent = document.createElement('div');
    tabContent.className = 'bp-tab-content';
    frag.appendChild(tabContent);
    body.appendChild(frag);

    // ── Tooltip bâtiment ────────────────────────────────
    var tt = document.getElementById('bld-tooltip');
    if (!tt) {
      tt = document.createElement('div');
      tt.id = 'bld-tooltip';
      tt.className = 'bld-tooltip';
      document.body.appendChild(tt);
    }
    var ttTimer = null;
    function showTT(tile, def, check) {
      clearTimeout(ttTimer);
      // Infos de production
      var prodLines = '';
      if (def.baseProdPerField) prodLines += '<div class="btt-prod">🌾 +' + def.baseProdPerField + '/champ/s</div>';
      if (def.baseProdPerSupport) prodLines += '<div class="btt-prod">🪵 +' + def.baseProdPerSupport + '/forêt/s</div>';
      if (def.produces) {
        Object.entries(def.produces).forEach(function(e){
          prodLines += '<div class="btt-prod">' + (RES_ICONS[e[0]]||e[0]) + ' +' + e[1] + '/s</div>';
        });
      }
      if (def.consumes) {
        Object.entries(def.consumes).forEach(function(e){
          prodLines += '<div class="btt-consume">' + (RES_ICONS[e[0]]||e[0]) + ' −' + e[1] + '/s</div>';
        });
      }
      // Travailleurs / logements
      var workers = def.consumesWorkers ? '<div class="btt-workers">👷 ' + def.consumesWorkers + ' travailleur(s) requis</div>' : '';
      var capacity = def.habitantsCapacity ? '<div class="btt-workers">🏠 ' + def.habitantsCapacity + ' habitants/niveau</div>' : '';
      // Niveau max
      var lvlMax = '<div class="btt-lvl">Niveau max : ' + (def.maxLevel||50) + '</div>';
      // Ère
      var eraBadge = def.era > 1 ? '<span class="btt-era era-' + def.era + '">Ère ' + def.era + '</span>' : '';
      // État (constructible ou non)
      var state = check.ok
        ? '<div class="btt-state ok">✅ Constructible</div>'
        : '<div class="btt-state ko">🔒 ' + check.reason + '</div>';

      tt.innerHTML =
        '<div class="btt-head">' +
          '<span class="btt-icon">' + def.glyph + '</span>' +
          '<div class="btt-title">' +
            '<span class="btt-name">' + def.name + '</span>' +
            eraBadge +
          '</div>' +
        '</div>' +
        '<div class="btt-desc">' + def.description + '</div>' +
        (prodLines ? '<div class="btt-section">Production</div><div class="btt-prods">' + prodLines + '</div>' : '') +
        workers + capacity + lvlMax + state;

      // Bouton fermeture mobile (injecté dans le contenu)
      var closeBtn = tt.querySelector('.btt-close');
      if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.className = 'btt-close';
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', function(e){
          e.stopPropagation();
          tt.dataset.pinned = '';
          tt.className = 'bld-tooltip';
        });
        tt.appendChild(closeBtn);
      }
      tt.className = 'bld-tooltip visible';
      tt.style.pointerEvents = 'none';
      // Positionnement responsive
      var r = tile.getBoundingClientRect();
      var tw = tt.offsetWidth || 220;
      var th = tt.offsetHeight || 130;
      var isMob = window.innerWidth <= 520;
      var tx, ty;
      if (isMob) {
        // Mobile : tooltip CSS positionné (bottom: calc(30vh + ...)), pas besoin de JS
        tt.style.left = '';
        tt.style.top  = '';
      } else {
        // PC panel latéral : à gauche de la tuile
        tx = r.left - tw - 10;
        ty = r.top + r.height/2 - th/2;
        // Fallback si déborde à gauche
        if (tx < 8) { tx = r.right + 10; }
        // Clamp vertical
        if (ty < 8) ty = 8;
        if (ty + th > window.innerHeight - 8) ty = window.innerHeight - th - 8;
        tt.style.left = tx + 'px';
        tt.style.top  = ty + 'px';
      }
    }
    function hideTT() {
      clearTimeout(ttTimer);
      tt.className = 'bld-tooltip';
    }

    // ── Rendu d'un onglet ────────────────────────────────
    function renderTab(tabId) {
      tabContent.innerHTML = '';
      var tab = tabs.find(function(t){ return t.id===tabId; });

      if (tabId === 'terrain') {
        // -- Cartes terrain (conserver ancien format large, pas de tuile) --
        var html = '';
        if (!cell.hasRoad && (cell.type===CELL_TYPE.PLAIN||cell.type===CELL_TYPE.FIELD||cell.type===CELL_TYPE.GROVE)) {
          var rc = self.bm.canPlaceRoad(cell);
          html += '<div class="bp-terrain-cards"><div class="bp-card'+(rc.ok?'':' bp-locked')+'" data-action="road">' +
            '<div class="bp-card-glyph">🛤️</div>' +
            '<div class="bp-card-name">Construire Route</div>' +
            '<div class="bp-card-desc">Connecte les bâtiments au réseau.</div>' +
            '<div class="bp-card-cost">'+self._costHtml({drachmes:30,bois:10})+'</div>' +
            '<button class="bp-card-action'+(rc.ok?'':' bp-locked')+'">'+(rc.ok?'🛤️ Construire':rc.reason)+'</button>' +
            '</div></div>';
        } else if (cell.hasRoad) {
          var rr = self.bm.canRemoveRoad(cell);
          html += '<div class="bp-terrain-cards"><div class="bp-card" data-action="road-remove">' +
            '<div class="bp-card-glyph">🛤️</div>' +
            '<div class="bp-card-name">Route présente</div>' +
            '<div class="bp-card-desc">Démolir déconnecte les bâtiments.</div>' +
            '<div class="bp-card-cost">'+self._costHtml({drachmes:10})+'</div>' +
            '<button class="bp-card-action'+(rr.ok?'':' bp-locked')+'">'+(rr.ok?'🔨 Démolir':'Impossible')+'</button>' +
            '</div></div>';
        }
        if (transforms.length > 0) {
          html += '<div class="bp-section-label" style="margin:10px 0 6px">🔄 Transformer</div><div class="bp-terrain-cards">';
          transforms.forEach(function(tr){
            var ok = self.rm.canAfford(tr.cost);
            html += '<div class="bp-card'+(ok?'':' bp-locked')+'" data-transform="'+tr.targetType+'">' +
              '<div class="bp-card-glyph">'+tr.glyph+'</div>' +
              '<div class="bp-card-name">'+tr.label+'</div>' +
              '<div class="bp-card-desc">'+tr.description+'</div>' +
              '<div class="bp-card-cost">'+self._costHtml(tr.cost)+'</div>' +
              '<button class="bp-card-action'+(ok?'':' bp-locked')+'">'+(ok?'Transformer':'Ressources insuf.')+'</button>' +
              '</div>';
          });
          html += '</div>';
        }
        tabContent.innerHTML = html || '<div class="bp-empty-msg">Aucune action terrain disponible.</div>';

      } else if (tab && tab.buildings.length > 0) {
        // ── GRILLE DE TUILES COMPACTES ───────────────────
        var grid = document.createElement('div');
        grid.className = 'bld-grid';

        tab.buildings.forEach(function(def){
          if (!def) return;
          var check = self.bm.canBuild(cell, def.id);

          // Détecter si le blocage est dû à l'ère (pas aux ressources)
          var eraLocked = def.era && def.era > 1 && self.tm && self.tm.getUnlockedEra() < def.era;

          // Coûts inline compacts
          var costSpans = Object.entries(def.buildCost).map(function(e){
            var has = self.rm.get(e[0]) >= e[1];
            return '<span class="bld-cost-item' + (has ? '' : ' short') + '">' +
              (RES_ICONS[e[0]]||e[0]) + ' ' + self._fmt(e[1]) +
              '</span>';
          }).join('');

          // Message d'unlock d'ère
          var eraUnlockMsg = '';
          if (eraLocked) {
            var eraCost = def.era === 2 ? '100 ✨' : '10 000 ✨';
            var eraName = def.era === 2 ? 'Âge Classique' : 'Âge Divin';
            eraUnlockMsg = '<div class="bld-era-lock-msg">🔒 ' + eraName + '<br><span>' + eraCost + '</span></div>';
          }

          var tile = document.createElement('div');
          tile.className = 'bld-tile' + (check.ok ? '' : ' bld-locked') + (eraLocked ? ' bld-era-locked' : '');
          tile.dataset.id = def.id;
          tile.innerHTML =
            '<div class="bld-tile-icon">' + def.glyph + '</div>' +
            '<div class="bld-tile-name">' + def.name + '</div>' +
            (eraLocked ? eraUnlockMsg : '<div class="bld-tile-costs">' + costSpans + '</div>') +
            (def.era > 1 ? '<div class="bld-era era-' + def.era + '">Ère ' + def.era + '</div>' : '');

          // Hover tooltip (PC) — touch appui long (mobile)
          tile.addEventListener('mouseenter', function(){ showTT(tile, def, check); });
          tile.addEventListener('mouseleave', function(){ if (!tt.dataset.pinned) hideTT(); });
          // Appui long tactile → tooltip épinglé
          var _longT = null;
          tile.addEventListener('touchstart', function(e){
            _longT = setTimeout(function(){
              e.preventDefault();
              showTT(tile, def, check);
              tt.dataset.pinned = def.id;
              tt.className = 'bld-tooltip visible';
              tt.style.pointerEvents = 'auto';
            }, 400);
          }, {passive:true});
          tile.addEventListener('touchend', function(){ clearTimeout(_longT); });

          grid.appendChild(tile);
        });
        tabContent.appendChild(grid);

        // Délégation clic sur la grille
        grid.addEventListener('click', function(e){
          // Bouton info mobile : affiche/ferme tooltip épinglé
          var infoBtn = e.target.closest('.bld-info-btn');
          if (infoBtn) {
            e.stopPropagation();
            var id = infoBtn.dataset.info;
            var defObj = (typeof BUILDINGS !== 'undefined') ? BUILDINGS[id] : null;
            if (!defObj) return;
            var checkObj = self.bm.canBuild(cell, id);
            var parentTile = infoBtn.closest('.bld-tile');
            if (tt.dataset.pinned === id) {
              tt.dataset.pinned = '';
              tt.className = 'bld-tooltip';
            } else {
              showTT(parentTile, defObj, checkObj);
              tt.dataset.pinned = id;
              tt.className = 'bld-tooltip visible pinned';
              tt.style.pointerEvents = 'auto';
            }
            return;
          }
          // Clic ailleurs ferme le tooltip épinglé
          if (tt.dataset.pinned) { tt.dataset.pinned = ''; tt.className = 'bld-tooltip'; }
          // Construction
          var tile = e.target.closest('.bld-tile');
          if (!tile || tile.classList.contains('bld-locked')) return;
          var id = tile.dataset.id;
          if (id) { hideTT(); self.bm.build(cell, id, 0, 0); self.refresh(); }
        });

      } else {
        tabContent.innerHTML = '<div class="bp-empty-msg">Aucun bâtiment disponible ici.</div>';
      }

      // Délégation terrain
      if (tabId === 'terrain') {
        tabContent.addEventListener('click', function handler(e){
          var btn = e.target.closest('button.bp-card-action');
          if (!btn || btn.classList.contains('bp-locked')) return;
          var card = btn.closest('[data-id],[data-action],[data-transform]');
          if (!card) return;
          if (card.dataset.action==='road')        { var mc=document.getElementById('map-container'),mr=mc?mc.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight}; self.bm.placeRoad(cell,mr.left+mr.width*.5,mr.top+mr.height*.4); self.refresh(); }
          if (card.dataset.action==='road-remove') { var mc=document.getElementById('map-container'),mr=mc?mc.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight}; self.bm.removeRoad(cell,mr.left+mr.width*.5,mr.top+mr.height*.4); self.refresh(); }
          if (card.dataset.transform) { self.bm.transformTerrain(cell,card.dataset.transform,0,0); self.refresh(); }
        }, {once:true});
      }
    }

    renderTab(activeTab);

    // Changement d'onglet
    tabBar.addEventListener('click', function(e){
      var btn = e.target.closest('.bp-tab');
      if (!btn || btn.classList.contains('bp-tab-active')) return;
      hideTT();
      tabBar.querySelectorAll('.bp-tab').forEach(function(b){ b.classList.remove('bp-tab-active'); });
      btn.classList.add('bp-tab-active');
      activeTab = btn.dataset.tab;
      self._activeBPTab = activeTab;  // mémoriser pour la prochaine cellule
      renderTab(activeTab);
    });
  }

  // Formate un nombre compact (1000 → 1k)
  _fmt(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/,'') + 'M';
    if (n >= 1000)    return (n/1000).toFixed(1).replace(/\.0$/,'') + 'k';
    return String(n);
  }

  // ── Gestionnaire délégué unique (toutes les UI) ──────────
  _handleBodyClick(e) {
    var btn = e.target.closest('button, [data-action]');
    if (!btn) return;
    if (btn.classList.contains('bp-locked')) return;
    var cell = this.currentCell;
    if (!cell) return;
    var action = btn.dataset.action;
    var self = this;
    // data-id = construire
    var card = btn.closest('[data-id]');
    if (card && card.dataset.id) { this.bm.build(cell, card.dataset.id, 0, 0); this.refresh(); return; }
    // data-transform = transformer terrain
    var tc = btn.closest('[data-transform]');
    if (tc && tc.dataset.transform) { this.bm.transformTerrain(cell, tc.dataset.transform, 0, 0); this.refresh(); return; }
    // data-na = action voisin
    var na = btn.dataset.na;
    if (na !== undefined) {
      var info = this.bm.getBuildingInfo(cell);
      if (info && info.adjInfo && info.adjInfo.neighborActions) {
        var naObj = info.adjInfo.neighborActions[parseInt(na)];
        if (naObj) { this.bm.executeNeighborAction(cell, naObj.cell, naObj.action, 0, 0); this.refresh(); }
      }
      return;
    }
    // data-action routing
    // Coordonnées écran du centre de la carte (fallback pour feedbacks)
    var _mc = document.getElementById('map-container');
    var _r  = _mc ? _mc.getBoundingClientRect() : { left:0, top:0, width:window.innerWidth, height:window.innerHeight };
    var _sx = _r.left + _r.width * 0.5;
    var _sy = _r.top  + _r.height * 0.4;

    switch(action) {
      case 'dig': {
        if (!btn.classList.contains('bp-locked')) {
          this.bm.digCell(cell, _sx, _sy);
          this.refresh();
        }
        break;
      }
      case 'upgrade':     this.bm.upgrade(cell, _sx, _sy); this.refresh(); break;
      case 'demolish':    this.bm.demolish(cell, _sx, _sy); this.refresh(); break;
      case 'base-upgrade': {
        var pm = window.game && window.game.prestigeManager;
        if (pm) { pm.upgradeBase(cell); this.refresh(); }
        break;
      }
      case 'road':        this.bm.placeRoad(cell, _sx, _sy); this.refresh(); break;
      case 'road-remove': this.bm.removeRoad(cell, _sx, _sy); this.refresh(); break;
      case 'mud-drain':   this.bm.transformTerrain(cell, CELL_TYPE.PLAIN, 0, 0); this.refresh(); break;
      case 'rubble-clear':this.bm.transformTerrain(cell, CELL_TYPE.PLAIN, 0, 0); this.refresh(); break;
      case 'tun-road':    this.bm.placeRoad(cell, _sx, _sy); this.refresh(); break;
      case 'tun-road-rm': this.bm.removeRoad(cell, _sx, _sy); this.refresh(); break;
      case 'tun-collapse':this.bm.transformTerrain(cell, CELL_TYPE.PLAIN, 0, 0); this.refresh(); break;
    }
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
  _renderAltarUI(cell, body) {
    var self = this;
    var pm = window.game && window.game.prestigeManager;
    var cond = pm ? pm.getConditions() : { revealed: 0, revealedOk: false, basesLvl5: 0, basesLvl5Ok: false, allMet: false };
    var altarHP = cell.currentHP;
    var altarMax = cell.maxHP || 2000;
    var pct = Math.max(0, (altarHP / altarMax) * 100);
    var unlocked = cond.allMet;

    var html = '<div class="bp-bld-header">' +
      '<span class="bp-bld-glyph">🔮</span>' +
      '<div><div class="bp-bld-name">Autel de Prométhée</div>' +
      '<div class="bp-bld-lvl">' + (unlocked ? '⚡ Actif — Sacrifice requis' : '🔒 Conditions non remplies') + '</div></div>' +
      '</div>';

    // Barre de vie de l autel
    if (unlocked) {
      html += '<div style="margin-bottom:8px">' +
        '<div style="font-size:10px;color:rgba(255,255,255,.5);margin-bottom:3px">Résistance : ' + Math.ceil(altarHP) + ' / ' + altarMax + '</div>' +
        '<div class="bp-lvlbar-track" style="height:10px">' +
          '<div class="bp-lvlbar-fill" style="width:' + (100-pct) + '%;background:linear-gradient(90deg,#8a40c0,#c080ff)"></div>' +
        '</div>' +
      '</div>';
    }

    // Conditions
    html += '<div style="margin-bottom:10px">';
    html += '<div style="font-size:11px;color:rgba(255,255,255,.6);margin-bottom:6px">Conditions de Prestige :</div>';
    html += '<div style="font-size:12px;margin-bottom:4px;color:' + (cond.revealedOk ? '#80e080' : '#e08080') + '">' +
      (cond.revealedOk ? '✅' : '⬜') + ' ' + cond.revealed + ' / 50 cases révélées</div>';
    html += '<div style="font-size:12px;color:' + (cond.basesLvl5Ok ? '#80e080' : '#e08080') + '">' +
      (cond.basesLvl5Ok ? '✅' : '⬜') + ' ' + cond.basesLvl5 + ' / 3 Ruines Niv.5</div>';
    html += '</div>';

    if (unlocked) {
      // Estimation Ether
      var etherEstimate = pm ? pm.computeEther() : 0;
      html += '<div style="font-size:12px;color:#f0c040;margin-bottom:8px">✨ Éther estimé : +' + etherEstimate + ' Éther</div>';
      html += '<div style="font-size:10px;color:rgba(255,255,255,.4);margin-bottom:8px">Fouilllez l&#39;autel pour déclencher le Prestige.</div>';
    } else {
      html += '<div style="font-size:10px;color:rgba(255,255,255,.35)">Remplissez les conditions pour activer cet autel.</div>';
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
