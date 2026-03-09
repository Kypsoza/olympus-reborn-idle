/* ═══════════════════════════════════════════════════════════
   HelpPanel.js — Wiki Olympus Reborn v0.9.0
   Interface style wiki avec recherche globale, navigation
   cliquable et toutes les phases 1-9 documentées.
   ═══════════════════════════════════════════════════════════ */

const WIKI_INDEX = [
  { tab:'guide',   section:'guide-start',    title:'Guide du débutant',          icon:'🌱', keywords:'début débutant tutoriel premier pas commencer comment jouer' },
  { tab:'guide',   section:'guide-controls', title:'Contrôles',                  icon:'🎮', keywords:'clavier souris zoom déplacer clic mobile' },
  { tab:'guide',   section:'guide-order',    title:'Ordre de jeu recommandé',    icon:'📋', keywords:'stratégie ordre priorité conseils déroulement' },
  { tab:'guide',   section:'guide-tips',     title:'Conseils et Astuces',        icon:'💡', keywords:'astuce conseil optimiser stratégie avancé' },
  { tab:'guide',   section:'guide-faq',      title:'FAQ — Questions fréquentes', icon:'❓', keywords:'faq question problème aide' },
  { tab:'resources', section:'res-era1',   title:'Ressources Ère 1',            icon:'🏛️', keywords:'drachmes bois ambroisie fer habitants farine ère1 antiquité' },
  { tab:'resources', section:'res-era2',   title:'Ressources Ère 2',            icon:'🏺', keywords:'nectar bronze acier âge classique ère2' },
  { tab:'resources', section:'res-era3',   title:'Ressources Ère 3',            icon:'🌟', keywords:'foudre orichalque métal divin amrita âge divin ère3' },
  { tab:'resources', section:'res-divine', title:'Ressources Divines (Zones)',  icon:'✨', keywords:'nectar metal divin amrita orichalque ambroisie foudre zone divine' },
  { tab:'resources', section:'res-ether',  title:'Éther',                       icon:'✨', keywords:'ether permanent prestige monnaie divine' },
  { tab:'buildings', section:'b-era1',   title:'Bâtiments Ère 1 — Antiquité',  icon:'🏛️', keywords:'ferme bûcheron mine cuivre fer tour hutte moulin pylone sanctuaire antiquité' },
  { tab:'buildings', section:'b-era2',   title:'Bâtiments Ère 2 — Classique',  icon:'🏺', keywords:'verger halle atelier fonderie maison alambic agora temple forteresse stèle classique' },
  { tab:'buildings', section:'b-era3',   title:'Bâtiments Ère 3 — Divin',      icon:'🌟', keywords:'jardins bosquet trésor forge palais sénat nœud autel omphalos divin' },
  { tab:'world',   section:'w-terrain', title:'Types de Terrain',              icon:'🗺️', keywords:'plaine forêt montagne rivière vase ruine autel terrain case' },
  { tab:'world',   section:'w-roads',   title:'Routes et Connexions',          icon:'🛤️', keywords:'route connexion production déconnecté construire démolir' },
  { tab:'world',   section:'w-score',   title:'Score de Renaissance',          icon:'⭐', keywords:'score renaissance points calcul formule' },
  { tab:'world',   section:'w-transform', title:'Transformations de terrain',  icon:'🔄', keywords:'transformer terrain plaine forêt rivière vase drainer' },
  { tab:'eras',    section:'e-eras',    title:'Les 3 Ères',                    icon:'⏳', keywords:'ère antiquité classique divin âge débloquer éther' },
  { tab:'eras',    section:'e-etherTree', title:'Arbre Éther',                 icon:'🌿', keywords:'arbre éther ères reliques constellations permanent' },
  { tab:'eras',    section:'e-relics',  title:'Reliques',                      icon:'🫙', keywords:'relique amphore enclume carte graine éclair omphalos' },
  { tab:'eras',    section:'e-constellations', title:'Constellations',         icon:'⭐', keywords:'constellation forge pionnier peuple éternité olympienne' },
  { tab:'prestige', section:'p-prestige', title:'Le Prestige — Renaissance',   icon:'🔮', keywords:'prestige renaissance réinitialiser éther conditions' },
  { tab:'prestige', section:'p-altar',    title:'Autel de Prométhée',          icon:'🔥', keywords:'autel prométhée activation fouille prestige' },
  { tab:'prestige', section:'p-ruins',    title:'Ruines Antiques',             icon:'🏛️', keywords:'ruine améliorer niveau bonus prestige condition' },
  { tab:'prestige', section:'p-heritage', title:'Héritage et Spectres',        icon:'👻', keywords:'spectre fantôme héritage conserver prestige' },
  { tab:'talents',  section:'t-drachmes', title:'Talents Drachmes (In-Run)',   icon:'🧠', keywords:'talent drachme agriculture sylviculture métallurgie sidérurgie population ingénierie' },
  { tab:'talents',  section:'t-ether',    title:'Talents Éther (Permanents)',  icon:'✨', keywords:'talent éther permanent ère relique constellation' },
  { tab:'codex',   section:'c-codex',   title:'Codex Olympien',                icon:'📖', keywords:'codex pages multiplicateur prestige permanent phase6' },
  { tab:'codex',   section:'c-pages',   title:'Pages Codex — Sources',        icon:'📄', keywords:'pages codex sources bonus prestige' },
  { tab:'codex',   section:'c-invest',  title:'Investissements Éther Codex',  icon:'💰', keywords:'investissement éther slots dorées pages codex' },
  { tab:'codex',   section:'c-levels',  title:'Niveaux du Codex',             icon:'📊', keywords:'niveau codex seuil multiplicateur progression' },
  { tab:'pantheon', section:'pan-intro',   title:'Panthéon Olympien', icon:'🏛️', keywords:'panthéon arbre talent permanent nœud branche cercle anneau phase7' },
  { tab:'pantheon', section:'pan-layout',  title:'Layout Circulaire',          icon:'⭕', keywords:'cercle anneau layout position équitable radial' },
  { tab:'pantheon', section:'pan-zeus',    title:'Branche Zeus ⚡',            icon:'⚡', keywords:'zeus foudre score production pylônes global force' },
  { tab:'pantheon', section:'pan-poseidon',title:'Branche Poséidon 🌊',        icon:'🌊', keywords:'poseidon mer exploration fouille révélation scout navigation' },
  { tab:'pantheon', section:'pan-hades',   title:'Branche Hadès 💀',           icon:'💀', keywords:'hades enfers éther prestige codex orichalque' },
  { tab:'pantheon', section:'pan-athena',  title:'Branche Athéna 🦉',          icon:'🦉', keywords:'athena sagesse niveaux max codex coût bâtiments' },
  { tab:'pantheon', section:'pan-apollon', title:'Branche Apollon ☀️',         icon:'☀️', keywords:'apollon soleil nourriture agriculture population scouts lumière' },
  { tab:'pantheon', section:'pan-ares',    title:'Branche Arès ⚔️',            icon:'⚔️', keywords:'ares guerre vitesse scouts score combat militaire' },
  { tab:'pantheon', section:'pan-supreme', title:'Nœuds Suprêmes ♾️',          icon:'♾️', keywords:'suprême sans plafond infini palier investissement éther illimité' },
  { tab:'zones',   section:'z-overview', title:'Zones Divines',icon:'🌍', keywords:'zone divine biome phase8 déverrouiller malédiction' },
  { tab:'zones',   section:'z-poseidon', title:'Zone 1 — Poséidon 🌊',         icon:'🌊', keywords:'poseidon zone mer nectar rivière révélation exploration' },
  { tab:'zones',   section:'z-apollon',  title:'Zone 2 — Apollon ☀️',          icon:'☀️', keywords:'apollon zone soleil ambroisie agriculture nourriture prestige' },
  { tab:'zones',   section:'z-athena',   title:'Zone 3 — Athéna 🦉',           icon:'🦉', keywords:'athena zone sagesse métal divin bibliothèque drachmes agora' },
  { tab:'zones',   section:'z-hades',    title:'Zone 4 — Hadès 💀',            icon:'💀', keywords:'hades zone souterrain orichalque prestige mines' },
  { tab:'zones',   section:'z-ares',     title:'Zone 5 — Arès ⚔️',             icon:'⚔️', keywords:'ares zone guerre amrita forteresse sénat codex' },
  { tab:'zones',   section:'z-zeus',     title:'Zone 6 — Zeus ⚡ FINALE',      icon:'⚡', keywords:'zeus zone olympe foudre pylône dernier score final légendaire roi' },
  { tab:'zones',   section:'z-unlock',   title:'Système de Déverrouillage',   icon:'🗝️', keywords:'déverrouiller conditions score clé divine rituel frontière craft' },
  { tab:'zones',   section:'z-curses',   title:'Malédictions Progressives',   icon:'💀', keywords:'malédiction stade production pénalité démolition zone' },
  { tab:'modes',   section:'m-pantheon', title:'Mode Panthéon',               icon:'⚡', keywords:'mode panthéon défaut city builder idle' },
  { tab:'modes',   section:'m-theomachie', title:'Mode Théomachie',           icon:'⚔️', keywords:'mode théomachie guerre dieux hubris factions' },
  { tab:'modes',   section:'m-genese',   title:'Mode Genèse Divine',          icon:'🌅', keywords:'mode genèse divine âges mythologie quêtes' },
  { tab:'debug',   section:'d-debug',   title:'Outils de debug',              icon:'🧪', keywords:'debug test localStorage reset console' },
];
class HelpPanel {
  constructor() {
    this._currentTab     = 'guide';
    this._currentSection = null;
    this._searchQuery    = '';
    this._build();
    this._bindEvents();
  }

  _build() {
    var overlay = document.createElement('div');
    overlay.id  = 'help-overlay';
    overlay.innerHTML =
      '<div id="help-panel">' +
        '<div id="help-header">' +
          '<span class="help-logo">📖</span>' +
          '<div id="help-title-wrap">' +
            '<h2>Wiki Olympus Reborn</h2>' +
            '<div id="help-search-wrap">' +
              '<span class="help-search-icon">🔍</span>' +
              '<input id="help-search" type="text" placeholder="Rechercher dans le wiki…" autocomplete="off">' +
              '<button id="help-search-clear" class="help-search-clear" style="display:none">✕</button>' +
            '</div>' +
          '</div>' +
          '<button id="help-close">✕</button>' +
        '</div>' +
        '<div id="help-main">' +
          '<div id="help-sidebar"><nav id="help-nav">' + this._buildNav() + '</nav></div>' +
          '<div id="help-body-wrap">' +
            '<div id="help-search-results" style="display:none"></div>' +
            '<div id="help-body"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this._renderTab('guide');
  }

  _buildNav() {
    var sections = [
      { id:'guide',    label:'Guide Débutant',  icon:'🌱' },
      { id:'resources',label:'Ressources',       icon:'💎' },
      { id:'buildings',label:'Bâtiments',        icon:'🏛️' },
      { id:'world',    label:'Monde & Routes',   icon:'🗺️' },
      { id:'eras',     label:'Ères & Éther',     icon:'✨' },
      { id:'prestige', label:'Prestige',          icon:'🔮' },
      { id:'talents',  label:'Talents',           icon:'🧠' },
      { id:'codex',    label:'Codex Olympien',   icon:'📖' },
      { id:'pantheon', label:'Panthéon',          icon:'🏛️' },
      { id:'zones',    label:'Zones Divines',    icon:'🌍' },
      { id:'modes',    label:'Modes de Jeu',     icon:'⚡' },
      { id:'debug',    label:'Debug & Tests',    icon:'🧪' },
    ];
    var html = '';
    sections.forEach(function(s) {
      html += '<button class="help-nav-btn" data-tab="' + s.id + '">' +
        '<span class="hnb-icon">' + s.icon + '</span><span class="hnb-label">' + s.label + '</span></button>';
    });
    return html;
  }

  _bindEvents() {
    var self = this;
    document.getElementById('help-close').addEventListener('click', function() { self.hide(); });
    document.getElementById('help-overlay').addEventListener('click', function(e) { if (e.target === self.overlay) self.hide(); });
    // btn-help est bindé dans HUD.js via EventBus.emit('help:open') — on n'ajoute pas de double binding ici
    EventBus.on('help:open', function(d) { self.show(); if (d && d.tab) self._switchTab(d.tab, d.section); });

    document.getElementById('help-nav').addEventListener('click', function(e) {
      var btn = e.target.closest('.help-nav-btn');
      if (btn) self._switchTab(btn.dataset.tab);
    });

    var searchEl = document.getElementById('help-search');
    var clearBtn = document.getElementById('help-search-clear');
    searchEl.addEventListener('input', function() {
      self._searchQuery = searchEl.value.trim();
      clearBtn.style.display = self._searchQuery ? 'block' : 'none';
      if (self._searchQuery.length >= 2) { self._renderSearch(self._searchQuery); }
      else { document.getElementById('help-search-results').style.display = 'none'; document.getElementById('help-body').style.display = 'block'; }
    });
    clearBtn.addEventListener('click', function() {
      searchEl.value = ''; self._searchQuery = ''; clearBtn.style.display = 'none';
      document.getElementById('help-search-results').style.display = 'none';
      document.getElementById('help-body').style.display = 'block'; searchEl.focus();
    });

    document.getElementById('help-body-wrap').addEventListener('click', function(e) {
      var link = e.target.closest('[data-wiki]');
      if (!link) return;
      var parts = link.dataset.wiki.split('#');
      self._switchTab(parts[0], parts[1] || null);
    });
  }

  show()   { this.overlay.classList.add('open'); }
  hide()   { this.overlay.classList.remove('open'); }
  toggle() { this.overlay.classList.contains('open') ? this.hide() : this.show(); }

  _switchTab(tab, section) {
    this._currentTab = tab; this._currentSection = section || null;
    document.querySelectorAll('.help-nav-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tab === tab); });
    document.getElementById('help-search-results').style.display = 'none';
    document.getElementById('help-body').style.display = 'block';
    this._renderTab(tab);
    if (section) {
      requestAnimationFrame(function() {
        var el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    } else { var bw = document.getElementById('help-body-wrap'); if (bw) bw.scrollTop = 0; }
  }

  _renderSearch(q) {
    var ql = q.toLowerCase();
    var results = WIKI_INDEX.filter(function(e) {
      return e.title.toLowerCase().includes(ql) || e.keywords.toLowerCase().includes(ql);
    });
    var resEl = document.getElementById('help-search-results');
    document.getElementById('help-body').style.display = 'none';
    resEl.style.display = 'block';
    if (!results.length) { resEl.innerHTML = '<div class="help-search-empty">Aucun résultat pour <strong>"' + q + '"</strong></div>'; return; }
    var self = this;
    var html = '<div class="help-search-header">🔍 ' + results.length + ' résultat(s) pour <strong>"' + q + '"</strong></div><div class="help-search-list">';
    results.forEach(function(e) {
      html += '<div class="help-search-item" data-wiki="' + e.tab + '#' + e.section + '">' +
        '<span class="hsi-icon">' + e.icon + '</span>' +
        '<div class="hsi-text"><div class="hsi-title">' + e.title + '</div><div class="hsi-tab">' + self._tabLabel(e.tab) + '</div></div>' +
        '<span class="hsi-arrow">→</span></div>';
    });
    resEl.innerHTML = html + '</div>';
  }

  _tabLabel(tab) {
    var L = { guide:'Guide Débutant', resources:'Ressources', buildings:'Bâtiments', world:'Monde & Routes',
      eras:'Ères & Éther', prestige:'Prestige', talents:'Talents', codex:'Codex Olympien',
      pantheon:'Panthéon', zones:'Zones Divines', modes:'Modes de Jeu', debug:'Debug' };
    return L[tab] || tab;
  }

  _renderTab(tab) {
    var body = document.getElementById('help-body');
    var map = { guide:this._tabGuide, resources:this._tabResources, buildings:this._tabBuildings,
      world:this._tabWorld, eras:this._tabEras, prestige:this._tabPrestige, talents:this._tabTalents,
      codex:this._tabCodex, pantheon:this._tabPantheon, zones:this._tabZones, modes:this._tabModes, debug:this._tabDebug };
    body.innerHTML = map[tab] ? map[tab].call(this) : '';
    document.querySelectorAll('.help-nav-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tab === tab); });
  }

  // ── Helpers ─────────────────────────────────────────────
  _h(id, title, level) {
    var cls = (level||2) === 3 ? 'hp-h3' : 'hp-h2';
    return '<div class="' + cls + '" id="' + id + '">' + title + '</div>';
  }
  _wikiLink(tab, section, label, icon) {
    return '<span class="hp-wlink" data-wiki="' + tab + (section ? '#' + section : '') + '">' + (icon ? icon + ' ' : '') + label + '</span>';
  }
  _callout(cls, html) { return '<div class="hp-callout hp-callout-' + cls + '">' + html + '</div>'; }
  _bcard(glyph, name, era, cost, prod, desc, extra) {
    var eraColor = era===1?'#c8a840':era===2?'#60a8ff':'#c080f0';
    var eraLabel = era===1?'🏛️ Ère 1':era===2?'🏺 Ère 2':'🌟 Ère 3';
    return '<div class="hp-bcard">' +
      '<div class="hp-bcard-head"><span class="hp-bcard-glyph">' + glyph + '</span>' +
      '<div class="hp-bcard-info"><span class="hp-bcard-name">' + name + '</span>' +
      '<span class="hp-bcard-era" style="color:' + eraColor + '">' + eraLabel + '</span></div></div>' +
      '<div class="hp-bcard-desc">' + desc + '</div>' +
      '<div class="hp-bcard-row"><span class="hp-label">💰 Coût</span><span>' + cost + '</span></div>' +
      '<div class="hp-bcard-row"><span class="hp-label">⚡ Produit</span><span>' + prod + '</span></div>' +
      (extra ? '<div class="hp-bcard-extra">' + extra + '</div>' : '') + '</div>';
  }
  _nodeCard(icon, name, cost, desc, uncapped) {
    return '<div class="hp-node-card' + (uncapped?' hp-node-uncapped':'') + '">' +
      '<div class="hp-node-head"><span class="hp-node-icon">' + icon + '</span>' +
      '<div><div class="hp-node-name">' + name + '</div>' + (uncapped ? '<div class="hp-node-badge">♾️ Sans plafond</div>' : '') + '</div>' +
      '<div class="hp-node-cost">✨ ' + cost + '</div></div>' +
      '<div class="hp-node-desc">' + desc + '</div></div>';
  }

  // ════════════════════════════════════════════════════════
  //  🌱 GUIDE DU DÉBUTANT
  // ════════════════════════════════════════════════════════
  _tabGuide() {
    var self = this;
    return (
      '<div class="hp-section" id="guide-start">' + this._h('guide-start-t','🌱 Guide du Débutant') +
        this._callout('gold','<strong>Bienvenue dans Olympus Reborn !</strong> Un idle city-builder grec où vous reconstruisez une civilisation depuis l\'Antiquité jusqu\'à l\'Âge Divin, en traversant des Prestiges qui renforcent votre cité à chaque cycle.') +
        '<p class="hp-p">Ce guide vous mène de votre première fouille à votre premier Prestige. Utilisez la barre de recherche ci-dessus pour trouver n\'importe quelle mécanique.</p>' +
      '</div>' +

      '<div class="hp-section" id="guide-controls">' + this._h('guide-controls-t','🎮 Contrôles') +
        '<div class="hp-grid">' +
          '<div class="hp-card"><div class="hp-glyph">🖱️</div><div class="hp-card-title">Navigation</div><div class="hp-card-body">Clic-glisser pour déplacer. Molette pour zoomer. ⌂ pour recentrer.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">👆</div><div class="hp-card-title">Sélection</div><div class="hp-card-body">Clic sur case révélée → panneau latéral (PC) ou bas (mobile). Reclic = ferme.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">⛏️</div><div class="hp-card-title">Fouille</div><div class="hp-card-body">Clic sur case cachée = 1 fouille (5🪙). Cases adjacentes à une révélée uniquement.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">💾</div><div class="hp-card-title">Sauvegarde</div><div class="hp-card-body">Auto toutes les 30s. Bouton 💾 dans HUD. Google Drive si connecté.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">📖</div><div class="hp-card-title">Ce Wiki</div><div class="hp-card-body">Bouton ? dans le HUD. Recherche globale, navigation cliquable partout.</div></div>' +
          '<div class="hp-card"><div class="hp-glyph">📱</div><div class="hp-card-title">Mobile</div><div class="hp-card-body">Pinch pour zoomer, glisser pour déplacer. Panneau bâtiment en bas.</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="hp-section" id="guide-order">' + this._h('guide-order-t','📋 Ordre de jeu — Première partie') +
        '<div class="hp-steps">' +
          '<div class="hp-step"><div class="hp-step-num">1</div><div class="hp-step-content"><strong>Révélez les cases autour de la base</strong> — fouillez en anneau jusqu\'à distance 4-5. Objectif : 20 cases révélées.</div></div>' +
          '<div class="hp-step"><div class="hp-step-num">2</div><div class="hp-step-content"><strong>Construisez une Ferme Antique</strong> sur une PLAINE adjacente. Elle remplit auto. 4 champs voisins en Champs Cultivés (+20% prod chacun).</div></div>' +
          '<div class="hp-step"><div class="hp-step-num">3</div><div class="hp-step-content"><strong>Posez une Route</strong> (30🪙 + 10🪵) adjacente à la Ferme. <strong>Sans route = 0 production !</strong> La connexion base→bâtiment doit être continue.</div></div>' +
          '<div class="hp-step"><div class="hp-step-num">4</div><div class="hp-step-content"><strong>Ajoutez un Camp de Bûcherons</strong> sur une FORÊT, et une <strong>Mine de Cuivre</strong> sur une MONTAGNE. Reliez par des routes.</div></div>' +
          '<div class="hp-step"><div class="hp-step-num">5</div><div class="hp-step-content"><strong>Construisez des Huttes</strong> pour avoir des travailleurs disponibles pour les mines.</div></div>' +
          '<div class="hp-step"><div class="hp-step-num">6</div><div class="hp-step-content"><strong>Ouvrez les Talents 🧠</strong> — investissez dans Agriculture et Sylviculture pour multiplier la production.</div></div>' +
          '<div class="hp-step"><div class="hp-step-num">7</div><div class="hp-step-content"><strong>Trouvez et améliorez 3 Ruines Antiques</strong> (halos dorés dans le brouillard) jusqu\'au Niveau 5. C\'est la condition principale du Prestige.</div></div>' +
          '<div class="hp-step"><div class="hp-step-num">8</div><div class="hp-step-content"><strong>Révélez 50 cases</strong> puis activez l\'Autel de Prométhée pour votre premier ' + self._wikiLink('prestige','p-prestige','Prestige','🔮') + '.</div></div>' +
          '<div class="hp-step"><div class="hp-step-num">9</div><div class="hp-step-content"><strong>Dépensez l\'Éther</strong> dans l\'arbre Éther (onglet ✨). Priorité : ' + self._wikiLink('eras','e-eras','Âge Classique','🏺') + ' (100✨) pour bâtiments Ère 2.</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="hp-section" id="guide-tips">' + this._h('guide-tips-t','💡 Conseils & Astuces') +
        '<div class="hp-tips-grid">' +
          '<div class="hp-tip-card"><div class="hp-tip-icon">🔗</div><div class="hp-tip-text"><strong>Route = vie</strong> — Tout bâtiment non connecté produit 0. Planifiez votre réseau avant de construire loin.</div></div>' +
          '<div class="hp-tip-card"><div class="hp-tip-icon">🌾</div><div class="hp-tip-text"><strong>Maximisez les champs</strong> — Placez la Ferme au centre de 4 plaines libres. Chaque champ = +20% production.</div></div>' +
          '<div class="hp-tip-card"><div class="hp-tip-icon">👥</div><div class="hp-tip-text"><strong>Travailleurs d\'abord</strong> — Les mines nécessitent habitants libres. Construisez Huttes avant Mines.</div></div>' +
          '<div class="hp-tip-card"><div class="hp-tip-icon">📖</div><div class="hp-tip-text"><strong>' + self._wikiLink('codex','c-codex','Codex Olympien','📖') + '</strong> — Après le 1er Prestige, multiplie votre Éther. Plus vous prestiguez souvent, plus il monte.</div></div>' +
          '<div class="hp-tip-card"><div class="hp-tip-icon">🏛️</div><div class="hp-tip-text"><strong>' + self._wikiLink('pantheon','pan-intro','Panthéon','🏛️') + '</strong> — 120 talents permanents. Branches Cartographie et Héritage disponibles dès le 1er Prestige.</div></div>' +
          '<div class="hp-tip-card"><div class="hp-tip-icon">💀</div><div class="hp-tip-text"><strong>' + self._wikiLink('zones','z-curses','Malédictions','💀') + '</strong> — Dès 25 cases révélées, les Zones commencent à vous maudire. Travaillez à les déverrouiller.</div></div>' +
          '<div class="hp-tip-card"><div class="hp-tip-icon">👻</div><div class="hp-tip-text"><strong>Spectres d\'Héritage</strong> — Les Ruines Niv.≥2 laissent un spectre qui vous guide vers leur emplacement au cycle suivant.</div></div>' +
          '<div class="hp-tip-card"><div class="hp-tip-icon">⭐</div><div class="hp-tip-text"><strong>Score Renaissance</strong> — Ne vous précipitez pas si le score est faible. Révélez plus, construisez plus, améliorez plus.</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="hp-section" id="guide-faq">' + this._h('guide-faq-t','❓ Questions Fréquentes') +
        '<div class="hp-faqs">' +
          '<div class="hp-faq"><div class="hp-faq-q">Pourquoi mon bâtiment ne produit-il rien ?</div><div class="hp-faq-a">Il n\'est pas connecté à la base par une route. Badge 🔴 dans le panneau bâtiment. Tracez une route continue jusqu\'à la base.</div></div>' +
          '<div class="hp-faq"><div class="hp-faq-q">Je n\'ai pas assez de travailleurs.</div><div class="hp-faq-a">Construisez des Huttes des Pionniers ou des Maisons Athéniennes (Ère 2) pour augmenter la population.</div></div>' +
          '<div class="hp-faq"><div class="hp-faq-q">Comment débloquer l\'Ère 2 ?</div><div class="hp-faq-a">Dépensez 100 Éther dans l\'Arbre Éther → nœud "Âge Classique". L\'Éther s\'obtient uniquement en faisant un Prestige.</div></div>' +
          '<div class="hp-faq"><div class="hp-faq-q">Qu\'est-ce que je conserve après un Prestige ?</div><div class="hp-faq-a">Éther, arbre Éther, Codex Olympien, Panthéon, Zones conquises, Spectres d\'Héritage. Ressources et bâtiments → zéro.</div></div>' +
          '<div class="hp-faq"><div class="hp-faq-q">Qu\'est-ce que le Codex Olympien ?</div><div class="hp-faq-a">Un système qui accumule des Pages à chaque Prestige. Plus de Pages = Éther multiplié. Voir ' + self._wikiLink('codex','c-codex','Codex','📖') + '.</div></div>' +
          '<div class="hp-faq"><div class="hp-faq-q">Les Zones me pénalisent énormément.</div><div class="hp-faq-a">Les Malédictions s\'intensifient avec le temps. Travaillez les conditions dans l\'onglet 🗺️ Zones du panneau Talents.</div></div>' +
          '<div class="hp-faq"><div class="hp-faq-q">Comment utiliser le Panthéon ?</div><div class="hp-faq-a">Panneau Talents 🧠 → onglet 🏛️ Panthéon. Cliquez les nœuds pour les acheter en Éther. Glissez/molette pour naviguer.</div></div>' +
          '<div class="hp-faq"><div class="hp-faq-q">Comment réinitialiser ?</div><div class="hp-faq-a">Menu burger → Réinitialiser. Ou console : <code>localStorage.clear(); location.reload()</code>. Irréversible !</div></div>' +
        '</div>' +
      '</div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  💎 RESSOURCES
  // ════════════════════════════════════════════════════════
  _tabResources() {
    return (
      '<div class="hp-section" id="res-era1">' + this._h('res-era1-t','🏛️ Ressources Ère 1 — Antiquité') +
        '<table class="hp-table"><tr><th>Icône</th><th>Nom</th><th>Source</th><th>Usage</th></tr>' +
        '<tr><td>🪙</td><td><strong>Drachmes</strong></td><td>Mine Cuivre, passif</td><td>Fouille, routes, bâtiments, talents</td></tr>' +
        '<tr><td>🪵</td><td><strong>Bois de Styx</strong></td><td>Camp Bûcherons</td><td>Construction, routes, améliorations</td></tr>' +
        '<tr><td>🌾</td><td><strong>Ambroisie</strong> (Nourr)</td><td>Ferme Antique, Jardins, Zones</td><td>Maisons, alambic, Zone Zeus</td></tr>' +
        '<tr><td>⚙️</td><td><strong>Fer Céleste</strong></td><td>Mine de Fer</td><td>Bâtiments avancés, Clés Divines</td></tr>' +
        '<tr><td>👥</td><td><strong>Habitants</strong></td><td>Huttes, Maisons Athéniennes</td><td>Travailleurs pour mines</td></tr>' +
        '<tr><td>🌾→</td><td><strong>Farine Sacrée</strong></td><td>Moulin à Grain</td><td>Maisons Athéniennes</td></tr>' +
        '<tr><td>✨</td><td><strong>Éther</strong></td><td>Uniquement au Prestige</td><td>Arbre Éther, Panthéon — permanent</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="res-era2">' + this._h('res-era2-t','🏺 Ressources Ère 2 — Âge Classique') +
        '<table class="hp-table"><tr><th>Icône</th><th>Nom</th><th>Source</th><th>Usage</th></tr>' +
        '<tr><td>🍯</td><td><strong>Nectar</strong></td><td>Zone Poséidon (Abysses)</td><td>Alambic, Clé Arès</td></tr>' +
        '<tr><td>🟫</td><td><strong>Bronze</strong></td><td>Atelier Forgeron</td><td>Fonderie, Forteresse, Agora</td></tr>' +
        '<tr><td>🔩</td><td><strong>Acier</strong></td><td>Fonderie Céleste</td><td>Bâtiments Ère 3, Clés Divines</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="res-era3">' + this._h('res-era3-t','🌟 Ressources Ère 3 — Âge Divin') +
        '<table class="hp-table"><tr><th>Icône</th><th>Nom</th><th>Source</th><th>Usage</th></tr>' +
        '<tr><td>⚡</td><td><strong>Foudre</strong></td><td>Pylône, Stèle, Zone Zeus</td><td>Bâtiments Ère 3, Clé Zeus</td></tr>' +
        '<tr><td>🌟</td><td><strong>Orichalque</strong></td><td>Forge Divine, Zone Hadès</td><td>Autel Fusion, Clé Hadès</td></tr>' +
        '<tr><td>⚗️</td><td><strong>Métal Divin</strong></td><td>Autel Fusion, Zone Athéna</td><td>Forges, Sénat, Clés avancées</td></tr>' +
        '<tr><td>💎</td><td><strong>Amrita</strong></td><td>Autel Fusion, Zone Arès</td><td>Ressource finale, Score</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="res-divine">' + this._h('res-divine-t','🌍 Ressources Divines — Zones conquises') +
        '<p class="hp-p">Produites passivement après conquête. Voir ' + this._wikiLink('zones','z-overview','Zones Divines','🌍') + '.</p>' +
        '<table class="hp-table"><tr><th>Ressource</th><th>Zone</th><th>Taux</th></tr>' +
        '<tr><td>🍯 Nectar</td><td>⚡ Zeus</td><td>+5/s</td></tr>' +
        '<tr><td>⚙️ Métal Divin</td><td>🦉 Athéna</td><td>+2/s</td></tr>' +
        '<tr><td>💎 Amrita</td><td>⚔️ Arès</td><td>+1/s + 50🪙</td></tr>' +
        '<tr><td>🌑 Orichalque</td><td>💀 Hadès</td><td>+1/s</td></tr>' +
        '<tr><td>🌾 Ambroisie</td><td>☀️ Apollon</td><td>+3/s + bois</td></tr>' +
        '<tr><td>⚡ Foudre ×3</td><td>⚡ Zeus</td><td>+5/s + 2 Éther</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="res-ether">' + this._h('res-ether-t','✨ Éther — Monnaie Permanente') +
        this._callout('purple','L\'Éther est obtenu <strong>uniquement en faisant le Prestige</strong>. Ne se perd jamais.') +
        '<p class="hp-p">Formule : <strong>√(Score) × 15 × multiplicateur Codex × bonus Panthéon</strong></p>' +
        '<p class="hp-p">Ex : Score 10 000 → 1 500 Éther. Avec Codex Niv.3 (×4) → 6 000 Éther.</p>' +
      '</div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  🏛️ BÂTIMENTS
  // ════════════════════════════════════════════════════════
  _tabBuildings() {
    var b = this._bcard.bind(this);
    return (
      '<div class="hp-section" id="b-era1">' + this._h('b-era1-t','🏛️ Ère 1 — Antiquité (9 bâtiments)') +
        '<p class="hp-p">Tous nécessitent une <strong>route adjacente</strong> ou être adjacent à la Base pour produire.</p>' +
        '<div class="hp-bcards">' +
        b('🌾','Ferme Antique',1,'50🪙 + 20🪵','Ambroisie × champs adjacents','Produit de l\'Ambroisie. Jusqu\'à 4 PLAINES voisines → Champs auto. 1 case réservée route.') +
        b('🪓','Camp de Bûcherons',1,'60🪙','Bois × forêts adjacentes','Jusqu\'à 4 FORÊTS → Bosquets auto.') +
        b('⛏️','Mine de Cuivre',1,'80🪙 + 40🪵','+5🪙/s — 3 travailleurs','Production fixe de Drachmes.') +
        b('⚙️','Mine de Fer Céleste',1,'150🪙 + 60🪵','+1⚙️/s — 4 travailleurs','Indispensable pour bâtiments avancés.') +
        b('🗼','Tour de Guet',1,'100🪙 + 50🪵','Fouille auto','Révèle les cases cachées autour d\'elle.') +
        b('🛖','Huttes des Pionniers',1,'120🪙 + 80🪵','+2 Habitants','Fournit des travailleurs.') +
        b('🔥','Sanctuaire d\'Hestia',1,'200🪙 + 100🪵','Aura fouille -20% rayon 2','Réduit coût fouille des cases voisines.') +
        b('🟠','Moulin à Grain',1,'180🪙 + 120🪵','+0.5 Farine/s — consomme 1🌾/s','Transforme Ambroisie → Farine. Nécessaire pour Maisons Athéniennes.') +
        b('⚡','Pylône d\'Hermès',1,'300🪙 + 150🪵 + 30⚙️','+2⚡/s','Génère Foudre dans rayon 3. Essentiel pour Ère 2+.') +
        '</div></div>' +

      '<div class="hp-section" id="b-era2">' + this._h('b-era2-t','🏺 Ère 2 — Âge Classique (9 bâtiments, 100✨)') +
        '<div class="hp-bcards">' +
        b('🍇','Verger d\'Apollon',2,'500🪙 + 200🪵 + 50🍯','Ambroisie ×3 + 0.5🍯/s','Ferme améliorée. 6 champs max.') +
        b('🌲','Halle des Sylvains',2,'600🪙 + 400🪵 + 30🟫','Bois ×3 — 6 forêts max','Auto-plante forêts Niv.20+.') +
        b('🔨','Atelier du Forgeron',2,'800🪙 + 300🪵 + 100⚙️','+20🪙/s + 0.5🟫/s','Mine Cuivre ×4 + Bronze.') +
        b('🏭','Fonderie Céleste',2,'1200🪙 + 500🪵 + 200⚙️','+3⚙️/s + 0.3🔩/s','Mine Fer ×3 + Acier.') +
        b('🏛️','Maison Athénienne',2,'400🪙 + 250🪵 + 20🌾','+10 Habitants — 0.5🌾/s','Bonus +20% si 2 maisons adjacentes.') +
        b('🫗','Alambic de Dionysos',2,'600🪙 + 200🪵 + 100🍯','+5🌾/s — 1🍯/s','Nectar → Ambroisie ×5.') +
        b('🏟️','Agora',2,'1000🪙 + 400🪵 + 80🟫','Aura Drachmes ×1.5 rayon 2','Multiplie Drachmes voisins.') +
        b('🏺','Temple d\'Hermès',2,'800🪙 + 300🪵 + 60🟫','Scouts ×2 rayon 3','Double vitesse Tours de Guet.') +
        b('🏰','Forteresse',2,'1200🪙 + 600🪵 + 150🟫','Protection anti-Corruption','UNIQUE par carte.') +
        '</div></div>' +

      '<div class="hp-section" id="b-era3">' + this._h('b-era3-t','🌟 Ère 3 — Âge Divin (8 bâtiments, 10 000✨)') +
        '<div class="hp-bcards">' +
        b('🌺','Jardins Élyséens',3,'1500🪙 + 600🪵 + 200🍯','Ambroisie ×5 + Nectar','Ferme divine.') +
        b('🌳','Bosquet Éternel',3,'1800🪙 + 800🪵 + 100🔩','Bois ×5 — auto-plantation','Auto-plante rayon 2 toutes 30s.') +
        b('💎','Trésor Olympien',3,'2000🪙 + 500🪵 + 200🟫','Drachmes ×6 + Orichalque','Mine divine.') +
        b('🔥🔨','Forge Divine',3,'2500🪙 + 800🪵 + 300🔩','Orichalque + Métal Divin','Ressources rares pour Autel Fusion.') +
        b('🏛★','Palais des Titans',3,'3000🪙 + 1000🪵 + 500⚙️','Éther passif × niveau','Consomme Ambroisie + Foudre.') +
        b('🏛❤️','Sénat',3,'5000🪙 + 2000🪵 + 500🔩','UNIQUE — ×2 production globale','UNIQUE. Nécessite 100 Habitants.') +
        b('⚡✴️','Nœud Olympien',3,'3500🪙 + 1500🪵 + 300⚡','Réseau Foudre ×3','Consomme Orichalque.') +
        b('✨🔥','Autel de Fusion',3,'4000🪙 + 1000🪵 + 200🔩','Métal Divin + Amrita','Acier + Orichalque → ressources finales.') +
        '</div></div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  🗺️ MONDE & ROUTES
  // ════════════════════════════════════════════════════════
  _tabWorld() {
    return (
      '<div class="hp-section" id="w-terrain">' + this._h('w-terrain-t','🗺️ Types de Terrain') +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">🌿</div><div class="hp-card-title">Plaine</div><div class="hp-card-body">Terrain de base. Fermes, Routes, Maisons. Devient Champ auto. près d\'une Ferme.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🌲</div><div class="hp-card-title">Forêt</div><div class="hp-card-body">Camp de Bûcherons. Devient Bosquet auto. Peut être reboisée ou rasée.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">⛰️</div><div class="hp-card-title">Montagne</div><div class="hp-card-body">Mines Cuivre et Fer. 180–280 HP. Abondante en périphérie.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">💧</div><div class="hp-card-title">Rivière</div><div class="hp-card-body">60–100 HP. Drainable → Vase → Plaine. Nécessaire Zone Arès.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🌾</div><div class="hp-card-title">Champ Cultivé</div><div class="hp-card-body">Auto-créé par Ferme/Verger/Jardins. +20% prod. par champ (max 4 ou 6).</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🌳</div><div class="hp-card-title">Bosquet Cultivé</div><div class="hp-card-body">Auto-créé par Camp/Halle/Bosquet. +20% prod. par bosquet.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🟫</div><div class="hp-card-title">Vase Marécageuse</div><div class="hp-card-body">Rivière drainée. Aucune construction.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🏛️</div><div class="hp-card-title">Ruines Antiques</div><div class="hp-card-body">400–600 HP. Niv.1→5. +5/12/22/35% prod global. Requis pour Prestige.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🔮</div><div class="hp-card-title">Autel de Renaissance</div><div class="hp-card-body">1500–2500 HP. Active le Prestige. Halo violet visible dans le brouillard.</div></div>' +
        '</div></div>' +

      '<div class="hp-section" id="w-transform">' + this._h('w-transform-t','🔄 Transformations de Terrain') +
        '<table class="hp-table"><tr><th>Depuis</th><th>Vers</th><th>Coût</th></tr>' +
        '<tr><td>PLAINE</td><td>FORÊT</td><td>80🪙 + 30🪵</td></tr>' +
        '<tr><td>FORÊT</td><td>PLAINE</td><td>40🪙</td></tr>' +
        '<tr><td>RIVIÈRE</td><td>VASE</td><td>60🪙</td></tr>' +
        '<tr><td>VASE</td><td>PLAINE</td><td>120🪙 + 60🪵</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="w-roads">' + this._h('w-roads-t','🛤️ Routes & Connexions') +
        this._callout('red','Un bâtiment <strong>non connecté produit 0 ressource</strong>. La connexion route→base est obligatoire.') +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">🛤️</div><div class="hp-card-title">Construire</div><div class="hp-card-body">30🪙 + 10🪵. PLAINE uniquement.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🔨</div><div class="hp-card-title">Démolir</div><div class="hp-card-body">10🪙. Déconnecte les bâtiments au-delà.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">✅</div><div class="hp-card-title">Connexion</div><div class="hp-card-body">Route adjacente OU adjacent à la Base.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🔴</div><div class="hp-card-title">Déconnecté</div><div class="hp-card-body">Badge rouge dans panneau bâtiment. Production = 0.</div></div>' +
        '</div></div>' +

      '<div class="hp-section" id="w-score">' + this._h('w-score-t','⭐ Score de Renaissance') +
        '<table class="hp-table"><tr><th>Élément</th><th>Points</th></tr>' +
        '<tr><td>Case PLAINE révélée</td><td>+10</td></tr>' +
        '<tr><td>Case FORÊT révélée</td><td>+15</td></tr>' +
        '<tr><td>Case MONTAGNE révélée</td><td>+20</td></tr>' +
        '<tr><td>Route posée</td><td>+25</td></tr>' +
        '<tr><td>Bâtiment connecté</td><td>+100 à +300 × niveau</td></tr>' +
        '</table>' +
        '<p class="hp-p">Formule Éther : <strong>√(Score) × 15 × multiplicateur Codex × bonus</strong></p>' +
        '<p class="hp-p">Aussi requis pour déverrouiller les ' + this._wikiLink('zones','z-overview','Zones Divines','🌍') + '.</p>' +
      '</div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  ✨ ÈRES & ÉTHER
  // ════════════════════════════════════════════════════════
  _tabEras() {
    return (
      '<div class="hp-section" id="e-eras">' + this._h('e-eras-t','⏳ Les 3 Ères') +
        '<table class="hp-table"><tr><th>Ère</th><th>Nom</th><th>Coût</th><th>Débloque</th></tr>' +
        '<tr><td style="color:#c8a840">🏛️ Ère 1</td><td>Antiquité</td><td>—</td><td>9 bâtiments</td></tr>' +
        '<tr><td style="color:#60a8ff">🏺 Ère 2</td><td>Âge Classique</td><td><strong>100✨</strong></td><td>+9 bâtiments + Nectar, Bronze, Acier</td></tr>' +
        '<tr><td style="color:#c080f0">🌟 Ère 3</td><td>Âge Divin</td><td><strong>10 000✨</strong></td><td>+8 bâtiments divins + Foudre, Orichalque, Métal Divin, Amrita</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="e-etherTree">' + this._h('e-etherTree-t','🌿 Arbre Éther — 3 Branches') +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">🏛️</div><div class="hp-card-title" style="color:#c0a060">Ères (2 nœuds)</div><div class="hp-card-body">Âge Classique (100✨) → Âge Divin (10 000✨).</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🫙</div><div class="hp-card-title" style="color:#9c6fce">Reliques (6 nœuds)</div><div class="hp-card-body">Voir ' + this._wikiLink('eras','e-relics','Reliques') + '.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">⭐</div><div class="hp-card-title" style="color:#4fc3f7">Constellations (5 nœuds)</div><div class="hp-card-body">Voir ' + this._wikiLink('eras','e-constellations','Constellations') + '.</div></div>' +
        '</div></div>' +

      '<div class="hp-section" id="e-relics">' + this._h('e-relics-t','🫙 Reliques') +
        '<div class="hp-bcards">' +
        this._nodeCard('🏺','Amphore d\'Abondance','40✨','+20% production Ambroisie et Nectar.') +
        this._nodeCard('⚒️','Enclume Divine','75✨','Les Mines ne nécessitent plus de route pour produire.') +
        this._nodeCard('🗺️','Carte des Titans','60✨','7 cases supplémentaires révélées au début de chaque run.') +
        this._nodeCard('🌰','Graine Éternelle','120✨','Forêts créées par bûcherons = indestructibles.') +
        this._nodeCard('⚡','Éclair de Zeus','75✨','30 fouilles gratuites au début de chaque run.') +
        this._nodeCard('🔮','Pierre Omphalos','500✨','+50% Éther au Prestige. Prérequis pour bâtiment Omphalos.') +
        '</div></div>' +

      '<div class="hp-section" id="e-constellations">' + this._h('e-constellations-t','⭐ Constellations') +
        '<div class="hp-bcards">' +
        this._nodeCard('⚒️','Constellation de la Forge','1 500✨','+10% production globale.') +
        this._nodeCard('🗺️','Constellation du Pionnier','3 000✨','Fouille -10%.') +
        this._nodeCard('👥','Constellation du Peuple','5 000✨','+25% capacité population maximale.') +
        this._nodeCard('✨','Constellation de l\'Éternité','10 000✨','+25% Éther au Prestige.') +
        this._nodeCard('🌟','Constellation Olympienne','25 000✨','+25% production si Ère 3 débloquée.') +
        '</div></div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  🔮 PRESTIGE
  // ════════════════════════════════════════════════════════
  _tabPrestige() {
    return (
      '<div class="hp-section" id="p-prestige">' + this._h('p-prestige-t','🔮 Le Prestige — La Renaissance') +
        this._callout('purple','Réinitialise le monde, vous récompense d\'<strong>Éther</strong> et de <strong>Pages Codex</strong>. Cœur de la progression long terme.') +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">🗺️</div><div class="hp-card-title">50 cases révélées</div><div class="hp-card-body">Explorez en fouillant autour de la base.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🏛️</div><div class="hp-card-title">3 Ruines Niv.5</div><div class="hp-card-body">Trouvez 3 Ruines (anneaux ≥7) et améliorez-les 4 fois.</div></div>' +
        '</div></div>' +

      '<div class="hp-section" id="p-ruins">' + this._h('p-ruins-t','🏛️ Ruines Antiques — Amélioration') +
        '<table class="hp-table"><tr><th>Niveau</th><th>Coût</th><th>Bonus prod. global</th></tr>' +
        '<tr><td>1 → 2</td><td>500🪙 + 200🪵</td><td>+5%</td></tr>' +
        '<tr><td>2 → 3</td><td>1 200🪙 + 500🪵 + 50⚙️</td><td>+12%</td></tr>' +
        '<tr><td>3 → 4</td><td>2 500🪙 + 1 000🪵 + 150⚙️</td><td>+22%</td></tr>' +
        '<tr><td>4 → 5</td><td>5 000🪙 + 2 000🪵 + 400⚙️ + 200🌾</td><td>+35%</td></tr>' +
        '</table>' +
        '<p class="hp-p"><span class="hp-tip">💡</span> 3 Ruines Niv.5 = <strong>+105% production globale</strong> !</p>' +
      '</div>' +

      '<div class="hp-section" id="p-altar">' + this._h('p-altar-t','🔥 Autel de Prométhée') +
        '<p class="hp-p">Case spéciale (halo violet-doré dans le brouillard). Fouillez-le (1500–2500 HP), puis activez-le une fois les 2 conditions remplies. L\'écran affiche un aperçu Éther + Pages Codex.</p>' +
      '</div>' +

      '<div class="hp-section" id="p-heritage">' + this._h('p-heritage-t','👻 Héritage & Spectres') +
        '<p class="hp-p"><span class="hp-ok">✓</span> Éther accumulé, arbre Éther, ' + this._wikiLink('codex','c-codex','Codex','📖') + ', ' + this._wikiLink('pantheon','pan-intro','Panthéon','🏛️') + ', Zones conquises, Spectres.</p>' +
        '<p class="hp-p"><span class="hp-warn">✗</span> Ressources, bâtiments, routes, talents Drachmes — tout remis à zéro.</p>' +
        '<p class="hp-p">Les <strong>Spectres 👻</strong> sont des fantômes des Ruines Niv.≥2 qui indiquent leur emplacement au cycle suivant.</p>' +
      '</div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  🧠 TALENTS
  // ════════════════════════════════════════════════════════
  _tabTalents() {
    return (
      '<div class="hp-section" id="t-drachmes">' + this._h('t-drachmes-t','🧠 Talents Drachmes — In-Run') +
        '<p class="hp-p">Réinitialisés à chaque Prestige. 7 branches.</p>' +
        '<table class="hp-table"><tr><th>Branche</th><th>Effets</th></tr>' +
        '<tr><td>🌾 Agriculture</td><td>Niv. max Ferme +15/+25/+40 · Prod +30/60/120%</td></tr>' +
        '<tr><td>🌲 Sylviculture</td><td>Niv. max Camp +15/+25/+40 · Prod +30/60/120%</td></tr>' +
        '<tr><td>⛏️ Métallurgie</td><td>Niv. max Mines Cuivre +15/25/40 · Prod +30/60/120%</td></tr>' +
        '<tr><td>⚙️ Sidérurgie</td><td>Niv. max Mines Fer +15/25/40 · Prod +30/60/120%</td></tr>' +
        '<tr><td>🏠 Population</td><td>Capacité +50/100/200% · Prod/habitant +0.5/1/2%</td></tr>' +
        '<tr><td>🏛️ Ingénierie</td><td>Niv. max tous +8 → fouille -25% → prod tous +15% → +15</td></tr>' +
        '<tr><td>⚡ Énergie</td><td>Portée Pylônes +1 → Foudre +50% → +100%</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="t-ether">' + this._h('t-ether-t','✨ Talents Éther — Permanents') +
        '<p class="hp-p">Voir aussi le ' + this._wikiLink('pantheon','pan-intro','Panthéon','🏛️') + ' pour les 120 talents Éther avancés (Phase 7).</p>' +
        '<table class="hp-table"><tr><th>Branche</th><th>Nœuds</th><th>Coût Éther</th></tr>' +
        '<tr><td>🏛️ Ères</td><td>Âge Classique · Âge Divin</td><td>100 → 10 000</td></tr>' +
        '<tr><td>🫙 Reliques</td><td>6 reliques permanentes</td><td>40 à 500</td></tr>' +
        '<tr><td>⭐ Constellations</td><td>5 multiplicateurs progressifs</td><td>1 500 à 25 000</td></tr>' +
        '</table>' +
        '<p class="hp-p"><span class="hp-tip">💡</span> Priorité : Âge Classique (100✨) → Carte des Titans (60✨) → Éclair (75✨) → Constellations.</p>' +
      '</div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  📖 CODEX OLYMPIEN (Phase 6)
  // ════════════════════════════════════════════════════════
  _tabCodex() {
    return (
      '<div class="hp-section" id="c-codex">' + this._h('c-codex-t','📖 Codex Olympien — Phase 6') +
        this._callout('purple','Le Codex accumule des <strong>Pages</strong> à chaque Prestige. Plus de Pages = <strong>multiplicateur Éther plus élevé</strong>. Badge 📖 Niv.X ×Y en bas-droite du HUD.') +
        '<p class="hp-p">Accès : panneau Talents 🧠 → onglet 📖 Codex.</p>' +
      '</div>' +

      '<div class="hp-section" id="c-pages">' + this._h('c-pages-t','📄 Pages Codex — Sources') +
        '<table class="hp-table"><tr><th>Source</th><th>Pages</th></tr>' +
        '<tr><td>Base</td><td>Score ÷ 1000</td></tr>' +
        '<tr><td>Types de bâtiments variés</td><td>+5 par type (si Source débloquée)</td></tr>' +
        '<tr><td>Ère 3 atteinte</td><td>+20 (×2 si investissement)</td></tr>' +
        '<tr><td>Slots bonus débloqués</td><td>+15 par slot (max 5)</td></tr>' +
        '<tr><td>Pages Dorées</td><td>×1.5 / ×2.25 / ×3.0</td></tr>' +
        '<tr><td>Branches Panthéon (Héritage)</td><td>+15/+20/+30 par nœud</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="c-invest">' + this._h('c-invest-t','💰 Investissements Éther — Codex') +
        '<table class="hp-table"><tr><th>Investissement</th><th>Coût</th><th>Effet</th></tr>' +
        '<tr><td>Slots Bonus (5×)</td><td>50/120/300/750/2 000✨</td><td>+15 Pages/prestige chacun</td></tr>' +
        '<tr><td>Pages Dorées (3×)</td><td>80/250/800✨</td><td>×1.5/×2.25/×3 multiplicateur</td></tr>' +
        '<tr><td>Source des Bâtiments</td><td>150✨</td><td>+5 Pages par type distinct</td></tr>' +
        '<tr><td>Source des Ères</td><td>200✨</td><td>+20 Pages si Ère 3 atteinte</td></tr>' +
        '</table></div>' +

      '<div class="hp-section" id="c-levels">' + this._h('c-levels-t','📊 Niveaux du Codex') +
        '<table class="hp-table"><tr><th>Niveau</th><th>Seuil Pages</th><th>Multiplicateur Éther</th></tr>' +
        '<tr><td>1</td><td>0</td><td>×1.0</td></tr>' +
        '<tr><td>2</td><td>100</td><td>×1.5</td></tr>' +
        '<tr><td>3</td><td>300</td><td>×2.5</td></tr>' +
        '<tr><td>4</td><td>700</td><td>×4.0</td></tr>' +
        '<tr><td>5</td><td>1 500</td><td>×6.5</td></tr>' +
        '<tr><td>6</td><td>3 000</td><td>×10.0</td></tr>' +
        '<tr><td>7</td><td>6 000</td><td>×16.0</td></tr>' +
        '<tr><td>8</td><td>12 000</td><td>×25.0</td></tr>' +
        '<tr><td>9</td><td>25 000</td><td>×40.0</td></tr>' +
        '<tr><td>10</td><td>50 000</td><td>×65.0</td></tr>' +
        '</table>' +
        '<p class="hp-p"><span class="hp-tip">💡</span> Codex Niv.5 = Éther ×6.5 — soit +550% par rapport au niveau 1 !</p>' +
      '</div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  🏛️ PANTHÉON (Phase 7)
  // ════════════════════════════════════════════════════════
  _tabPantheon() {
    var self = this;
    return (
      '<div class="hp-section" id="pan-intro">' + this._h('pan-intro-t','🏛️ Panthéon Olympien — Vue d\'ensemble') +
        this._callout('gold','<strong>6 branches divines</strong> · <strong>15 nœuds/branche</strong> · 5 rangs/nœud = 90 talents normaux + <strong>6 nœuds Suprêmes sans plafond</strong>. Payés en Éther permanent. Layout circulaire radial.') +
        '<p class="hp-p">Panneau Talents 🧠 → onglet 🏛️ Panthéon. Molette = zoom · Glisser = déplacer · Clic = sélectionner/acheter.</p>' +
        '<p class="hp-p"><strong>Déverrouillage :</strong> chaque branche se débloque en conquérant la ' + this._wikiLink('zones','z-overview','Zone Divine','🌍') + ' du dieu correspondant.</p>' +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">⚡</div><div class="hp-card-title" style="color:#ffd54f">Zeus</div><div class="hp-card-body">Production globale, score, pylônes, Éther. Zone 1.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🌊</div><div class="hp-card-title" style="color:#29b6f6">Poséidon</div><div class="hp-card-body">Exploration, fouille, révélation, scouts. Zone 2.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">💀</div><div class="hp-card-title" style="color:#7e57c2">Hadès</div><div class="hp-card-body">Éther, prestige, Codex, orichalque. Zone 3.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🦉</div><div class="hp-card-title" style="color:#80cbc4">Athéna</div><div class="hp-card-body">Niveaux max, coûts, Codex, sagesse. Zone 4.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">☀️</div><div class="hp-card-title" style="color:#ffb300">Apollon</div><div class="hp-card-body">Nourriture, agriculture, population, lumière. Zone 5.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">⚔️</div><div class="hp-card-title" style="color:#ef5350">Arès</div><div class="hp-card-body">Vitesse scouts, score, guerre, puissance. Zone 6.</div></div>' +
        '</div></div>' +

      '<div class="hp-section" id="pan-layout">' + this._h('pan-layout-t','⭕ Layout Circulaire') +
        this._callout('','Le Panthéon utilise un <strong>cercle parfait</strong>. Les nœuds de chaque anneau sont répartis équitablement sur 360°.') +
        '<table class="hp-table"><tr><th>Anneau</th><th>Rayon</th><th>Nœuds/branche</th><th>Total</th><th>Coût base</th></tr>' +
        '<tr><td>1</td><td>130px</td><td>1</td><td>6</td><td>50✨</td></tr>' +
        '<tr><td>2</td><td>240px</td><td>2</td><td>12</td><td>100✨</td></tr>' +
        '<tr><td>3</td><td>360px</td><td>4</td><td>24</td><td>180✨</td></tr>' +
        '<tr><td>4</td><td>480px</td><td>8</td><td>48</td><td>280✨</td></tr>' +
        '<tr><td>5 (Suprême)</td><td>590px</td><td>1</td><td>6</td><td>500✨+</td></tr>' +
        '</table>' +
        '<p class="hp-p">Chaque branche occupe un secteur de <strong>60°</strong>. Les 4 premiers anneaux ont 5 rangs par nœud. Le 5e est le nœud Suprême.</p>' +
      '</div>' +

      '<div class="hp-section" id="pan-zeus">' + this._h('pan-zeus-t','⚡ Zeus — Foudre & Puissance') +
        '<table class="hp-table"><tr><th>Nœud</th><th>Anneau</th><th>Bonus cumulé max</th></tr>' +
        '<tr><td>Présence Olympienne</td><td>1</td><td>+50% production globale</td></tr>' +
        '<tr><td>Foudre / Gouvernance</td><td>2</td><td>+75% Pylônes · -40% coûts · +25% global</td></tr>' +
        '<tr><td>Éclair / Prestige / Architecte / Aigle</td><td>3</td><td>+portée · +Éther · +niveaux max · +scouts</td></tr>' +
        '<tr><td>Apothéose × 8 nœuds</td><td>4</td><td>+prod globale, +score, +Éther, +Pylônes, +niveaux max, +scouts</td></tr>' +
        '</table>' +
        '<p class="hp-p">Thème : <em>omnipotence</em>. Améliore quasi toutes les statistiques. Idéal pour un build généraliste.</p>' +
      '</div>' +

      '<div class="hp-section" id="pan-poseidon">' + this._h('pan-poseidon-t','🌊 Poséidon — Exploration & Fouille') +
        '<table class="hp-table"><tr><th>Nœud</th><th>Anneau</th><th>Bonus cumulé max</th></tr>' +
        '<tr><td>Appel des Profondeurs</td><td>1</td><td>+5 portée révélation · -40% fouille</td></tr>' +
        '<tr><td>Trident / Vagues Porteuses</td><td>2</td><td>+80% vitesse révélation · +60% Nourriture · -45% fouille</td></tr>' +
        '<tr><td>Tsunami / Séisme / Courant / Navigation</td><td>3</td><td>+portée · +scouts · -fouille · +mines · +global</td></tr>' +
        '<tr><td>8 nœuds niveau 4</td><td>4</td><td>Maîtrise exploration totale · max vitesse fouille · +slots scouts</td></tr>' +
        '</table>' +
        '<p class="hp-p">Thème : <em>exploration</em>. Spécialiste fouille, révélation et mobilité des scouts. Indispensable pour débloquer rapidement des zones.</p>' +
      '</div>' +

      '<div class="hp-section" id="pan-hades">' + this._h('pan-hades-t','💀 Hadès — Éther & Prestige') +
        '<table class="hp-table"><tr><th>Nœud</th><th>Anneau</th><th>Bonus cumulé max</th></tr>' +
        '<tr><td>Royaume des Morts</td><td>1</td><td>+50% gain Éther</td></tr>' +
        '<tr><td>Âme Perdue / Cerberus</td><td>2</td><td>+Éther · +Codex · +score prestige</td></tr>' +
        '<tr><td>Styx / Tartare / Élysée / Mort</td><td>3</td><td>+Éther · +Pages · +score · +pop</td></tr>' +
        '<tr><td>8 nœuds niveau 4</td><td>4</td><td>Maîtrise permanence · Éther max · score max</td></tr>' +
        '</table>' +
        '<p class="hp-p">Thème : <em>permanence</em>. Maximise l\'Éther gagné par prestige. Indispensable pour l\'endgame.</p>' +
      '</div>' +

      '<div class="hp-section" id="pan-athena">' + this._h('pan-athena-t','🦉 Athéna — Sagesse & Niveaux Max') +
        '<table class="hp-table"><tr><th>Nœud</th><th>Anneau</th><th>Bonus cumulé max</th></tr>' +
        '<tr><td>Égide Dorée</td><td>1</td><td>+3 niveaux max tous bâtiments</td></tr>' +
        '<tr><td>Stratège / Codex Vivant</td><td>2</td><td>+niveaux · +Pages Codex · -coûts</td></tr>' +
        '<tr><td>Sparte / Athènes / Oracle / Connaissance</td><td>3</td><td>Spécialisation bâtiments · +Codex · -coûts · +global</td></tr>' +
        '<tr><td>8 nœuds niveau 4</td><td>4</td><td>Maîtrise construction · coûts minimaux · niveaux infinis</td></tr>' +
        '</table>' +
        '<p class="hp-p">Thème : <em>efficacité</em>. Réduit coûts, augmente niveaux max. Build optimal pour maximiser la puissance de chaque bâtiment.</p>' +
      '</div>' +

      '<div class="hp-section" id="pan-apollon">' + this._h('pan-apollon-t','☀️ Apollon — Lumière & Agriculture') +
        '<table class="hp-table"><tr><th>Nœud</th><th>Anneau</th><th>Bonus cumulé max</th></tr>' +
        '<tr><td>Soleil Levant</td><td>1</td><td>+50% production Nourriture</td></tr>' +
        '<tr><td>Rayon d\'Or / Moisson</td><td>2</td><td>+Nourriture · +production globale · +pop cap</td></tr>' +
        '<tr><td>Aube / Zénith / Crépuscule / Nuit</td><td>3</td><td>+Nourriture · +global · +pop · +scouts</td></tr>' +
        '<tr><td>8 nœuds niveau 4</td><td>4</td><td>Domination agricole · pop illimitée · production max</td></tr>' +
        '</table>' +
        '<p class="hp-p">Thème : <em>vie</em>. Spécialiste nourriture et population. Idéal en début de run pour soutenir une population élevée.</p>' +
      '</div>' +

      '<div class="hp-section" id="pan-ares">' + this._h('pan-ares-t','⚔️ Arès — Guerre & Vitesse') +
        '<table class="hp-table"><tr><th>Nœud</th><th>Anneau</th><th>Bonus cumulé max</th></tr>' +
        '<tr><td>Furor Belli</td><td>1</td><td>+50% vitesse Éclaireurs</td></tr>' +
        '<tr><td>Lame Tranchante / Stratégie</td><td>2</td><td>+vitesse · +slots scouts · +score</td></tr>' +
        '<tr><td>Siège / Razzia / Conquête / Domination</td><td>3</td><td>+vitesse · +score · +portée · +prod globale</td></tr>' +
        '<tr><td>8 nœuds niveau 4</td><td>4</td><td>Légions olympiennes · vitesse max scouts · score max</td></tr>' +
        '</table>' +
        '<p class="hp-p">Thème : <em>agression</em>. Scouts ultra-rapides, score élevé. Optimal pour les runs courts maximisant le prestige.</p>' +
      '</div>' +

      '<div class="hp-section" id="pan-supreme">' + this._h('pan-supreme-t','♾️ Nœuds Suprêmes — Sans Plafond') +
        this._callout('gold','Se débloquent uniquement quand <strong>tous les 15 nœuds de la branche sont maîtrisés</strong> (rang 5/5). Aucune limite de rangs. Les bonus augmentent à chaque palier atteint.') +
        '<table class="hp-table"><tr><th>Dieu</th><th>Nom</th><th>Bonus par palier</th></tr>' +
        '<tr><td>⚡ Zeus</td><td>Toute-Puissance Olympienne</td><td>+2% production globale</td></tr>' +
        '<tr><td>🌊 Poséidon</td><td>Profondeur Abyssale</td><td>-1% coût fouille · +1% révélation</td></tr>' +
        '<tr><td>💀 Hadès</td><td>Maître de l\'ternité</td><td>+1.5% gain Éther</td></tr>' +
        '<tr><td>🦉 Athéna</td><td>Sagesse Infinie</td><td>+1 niveau max tous bâtiments</td></tr>' +
        '<tr><td>☀️ Apollon</td><td>Lumière Éternelle</td><td>+3% production Nourriture</td></tr>' +
        '<tr><td>⚔️ Arès</td><td>Furie Sans Fin</td><td>+2% score · +1% vitesse scouts</td></tr>' +
        '</table>' +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">📊</div><div class="hp-card-title">Paliers</div><div class="hp-card-body">10 → 50 → 100 → 500 → 1 000 → 5 000 → 10 000 → 50 000 → … (×5, ×2, alternés, sans fin)</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">💰</div><div class="hp-card-title">Coût minimal</div><div class="hp-card-body">500 Éther par unité. Le bouton "Tout investir" dépense tout votre Éther disponible en une fois.</div></div>' +
        '</div>' +
        '<p class="hp-p">Exemple : Zeus Suprême au palier 10 = +20% production globale permanent. Au palier 100 = +200% production globale.</p>' +
      '</div>'
    );
  }

  _tabZones() {
    var self = this;
    var zones = [
      { id:'z-poseidon', icon:'🌊', god:'Poséidon', color:'#29b6f6', biome:'Abysses Océaniques', resource:'Nectar +4/s + Nourr', score:'2 000',   frontier:'2 Routes sur cases Rivière', key:'1 200 Nourr + 400 Bois + 3 000🪙 — 90s', ritual:'Révéler 40 cases', curse:'Fureur de Poséidon (-5%/-15%/-30%/démolition)' },
      { id:'z-apollon',  icon:'☀️', god:'Apollon',  color:'#ffb300', biome:'Plaines de Delphes', resource:'Ambroisie +3/s + Nourr', score:'8 000', frontier:'8 bâtiments Nature connectés', key:'3 000 Bois + 500 Ambroisie + 10 000🪙 — 180s', ritual:'500 Nourr/s + 1 Prestige', curse:'Éclipse d\'Apollon (-5%/-15%/-30%/démolition)' },
      { id:'z-athena',   icon:'🦉', god:'Athéna',   color:'#80cbc4', biome:'Bibliothèque Céleste', resource:'Métal Divin +2/s + Éther', score:'25 000', frontier:'1 Bibliothèque + 1 Agora connectées', key:'15 000🪙 + 200 Ambroisie + 500 Fer — 240s', ritual:'3 000 Drachmes/s', curse:'Jugement d\'Athéna (-5%/-15%/-30%/démolition)' },
      { id:'z-hades',    icon:'💀', god:'Hadès',    color:'#7e57c2', biome:'Souterrains du Tartare', resource:'Orichalque +1/s + Éther', score:'100 000', frontier:'5 Mines de Fer connectées', key:'1 000 Fer + 300 Acier + 500 Éther — 300s', ritual:'5 Prestiges', curse:'Malédiction d\'Hadès (-5%/-15%/-30%/démolition)' },
      { id:'z-ares',     icon:'⚔️', god:'Arès',     color:'#ef5350', biome:'Champs de Bataille Éternels', resource:'Amrita +2/s + Foudre', score:'300 000', frontier:'1 Forteresse + 1 Sénat connectés', key:'1 500 Éther + 400 Orichalque + 150 Métal Divin — 480s', ritual:'Codex Niveau 7', curse:'Rage d\'Arès (-5%/-15%/-30%/démolition)' },
      { id:'z-zeus',     icon:'⚡', god:'Zeus',     color:'#ffd54f', biome:'Cimes de l\'Olympe', resource:'Foudre +8/s + Éther', score:'750 000', frontier:'Libre (conditions légendaires)', key:'3 000 Éther + 500 Orichalque + 300 Métal Divin — 480s', ritual:'3 Pylônes connectés + Codex niv.5 + 8 Prestiges + Hadès & Arès conquis', curse:'Colère de Zeus (-5%/-15%/-30%/démolition)' },
    ];

    var html =
      '<div class="hp-section" id="z-overview">' + this._h('z-overview-t','🌍 Zones Divines — Vue d\'ensemble') +
        this._callout('purple','6 zones entourent votre cité. Chaque zone non conquise vous <strong>maudit progressivement</strong>. Les conquérir déverrouille ressources, branches du ' + self._wikiLink('pantheon','pan-intro','Panthéon','🏛️') + ', et ressources divines exclusives.') +
        '<p class="hp-p">Gérez dans le panneau Talents 🧠 → onglet 🗺️ Zones.</p>' +
        '<table class="hp-table"><tr><th>Zone</th><th>Biome</th><th>Ressource</th><th>Score requis</th></tr>' +
        zones.map(function(z){ return '<tr><td style="color:'+z.color+'">'+z.icon+' '+z.god+'</td><td>'+z.biome+'</td><td>'+z.resource+'</td><td>'+z.score+'</td></tr>'; }).join('') +
        '</table></div>' +

      '<div class="hp-section" id="z-unlock">' + this._h('z-unlock-t','🗝️ Système de Déverrouillage') +
        this._callout('red','4 conditions simultanées à remplir.') +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">⭐</div><div class="hp-card-title">Score Renaissance</div><div class="hp-card-body">Le score de votre dernier Prestige doit atteindre le seuil requis.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🏔️</div><div class="hp-card-title">Frontière Vivante</div><div class="hp-card-body">Construire certains bâtiments ou remplir une condition de terrain.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🗝️</div><div class="hp-card-title">Clé Divine Craftée</div><div class="hp-card-body">Ressources + timer. Jusqu\'à 2 crafts simultanés.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🕯️</div><div class="hp-card-title">Rituel de Dédicace</div><div class="hp-card-body">Condition narrative unique à chaque zone.</div></div>' +
        '</div></div>' +

      zones.map(function(z) {
        return '<div class="hp-section" id="' + z.id + '">' +
          '<div class="hp-h2" style="color:' + z.color + '">' + z.icon + ' Zone ' + z.god + '</div>' +
          '<table class="hp-table"><tr><th>Propriété</th><th>Valeur</th></tr>' +
          '<tr><td>Biome</td><td>' + z.biome + '</td></tr>' +
          '<tr><td>Ressource produite</td><td>' + z.resource + '</td></tr>' +
          '<tr><td>Score requis</td><td>' + z.score + '</td></tr>' +
          '<tr><td>Frontière</td><td>' + z.frontier + '</td></tr>' +
          '<tr><td>Clé Divine</td><td>' + z.key + '</td></tr>' +
          '<tr><td>Rituel</td><td>' + z.ritual + '</td></tr>' +
          '<tr><td>Malédiction</td><td>' + z.curse + '</td></tr>' +
          '<tr><td>Pages Codex</td><td>+10 à la conquête (+20 pour Arès)</td></tr>' +
          '<tr><td>Panthéon débloqué</td><td>Branche ' + z.icon + ' ' + z.god + ' + Nœud Suprême</td></tr>' +
          '</table></div>';
      }).join('') +

      '<div class="hp-section" id="z-curses">' + this._h('z-curses-t','💀 Malédictions Progressives') +
        this._callout('red','S\'activent dès 25 cases révélées. S\'intensifient avec le temps. <strong>Conquérir la zone stoppe définitivement la malédiction.</strong>') +
        '<table class="hp-table"><tr><th>Stade</th><th>Durée</th><th>Effet</th></tr>' +
        '<tr><td>1</td><td>0–10 min</td><td>Production -5%</td></tr>' +
        '<tr><td>2</td><td>10–30 min</td><td>Production -15%</td></tr>' +
        '<tr><td>3</td><td>30–60 min</td><td>Production -30%</td></tr>' +
        '<tr><td>4</td><td>60+ min</td><td>-30% + 1 bâtiment détruit toutes les 5 min</td></tr>' +
        '</table>' +
        '<p class="hp-p">Indicateur 💀 dans le HUD affiche la malédiction la plus sévère active.</p>' +
      '</div>';

    return html;
  }

  _tabModes() {
    return (
      '<div class="hp-section" id="m-pantheon">' + this._h('m-pantheon-t','⚡ Mode Panthéon — Mode par défaut') +
        this._callout('gold','Le mode principal. City-builder idle avec toutes les mécaniques Phases 1 à 8.') +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">🏛️</div><div class="hp-card-title">27 Bâtiments</div><div class="hp-card-body">3 Ères, de l\'Antiquité à l\'Âge Divin.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🔮</div><div class="hp-card-title">Prestige & Codex</div><div class="hp-card-body">Éther, Codex Olympien (multiplicateur Pages).</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🏛️</div><div class="hp-card-title">Panthéon</div><div class="hp-card-body">90 talents sur 6 branches + 6 nœuds Suprêmes sans plafond.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🌍</div><div class="hp-card-title">6 Zones Divines</div><div class="hp-card-body">Malédictions, Clés, Rituels, Frontières.</div></div>' +
        '</div></div>' +

      '<div class="hp-section" id="m-theomachie">' + this._h('m-theomachie-t','⚔️ Mode Théomachie — En développement') +
        this._callout('','Ce mode est <strong>en cours de développement</strong>. Disponible prochainement.') +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">⚔️</div><div class="hp-card-title">Factions</div><div class="hp-card-body">6 dieux s\'affrontent. Choisissez une coalition, accumulez leurs bonus.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🌋</div><div class="hp-card-title">Hubris</div><div class="hp-card-body">Le dieu dominant attaque votre zone centrale si vous l\'ignorez.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🕊️</div><div class="hp-card-title">Arbitrage</div><div class="hp-card-body">Autels de rivalité, rituels de rééquilibrage pour maintenir l\'harmonie.</div></div>' +
        '</div></div>' +

      '<div class="hp-section" id="m-genese">' + this._h('m-genese-t','🌅 Mode Genèse Divine — En développement') +
        this._callout('','Ce mode est <strong>en cours de développement</strong>. Disponible prochainement.') +
        '<div class="hp-grid">' +
        '<div class="hp-card"><div class="hp-glyph">📜</div><div class="hp-card-title">Quêtes Narratives</div><div class="hp-card-body">Chaque zone a son histoire et conditions uniques.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">🗝️</div><div class="hp-card-title">Artefacts</div><div class="hp-card-body">Clés Divines → artefacts légendaires avec effets permanents.</div></div>' +
        '<div class="hp-card"><div class="hp-glyph">⏳</div><div class="hp-card-title">6 Âges</div><div class="hp-card-body">Antiquité → Âge Divin. Prestige = Nouvelle Ère avec récit différent.</div></div>' +
        '</div></div>'
    );
  }

  // ════════════════════════════════════════════════════════
  //  🧪 DEBUG
  // ════════════════════════════════════════════════════════
  _tabDebug() {
    return (
      '<div class="hp-section" id="d-debug">' + this._h('d-debug-t','🧪 Outils de Debug') +
        '<p class="hp-p"><strong>Réinitialiser :</strong> <code style="color:#80e080;background:rgba(0,0,0,.3);padding:2px 8px;border-radius:4px">localStorage.clear(); location.reload()</code></p>' +
        '<table class="hp-table"><tr><th>Test</th><th>Attendu</th></tr>' +
        '<tr><td>Route + bâtiment</td><td>Ferme sans route = 0. Avec route = production démarre.</td></tr>' +
        '<tr><td>Ferme + champs auto</td><td>Ferme sur PLAINE → 4 PLAINES → CHAMPS. 1 case route.</td></tr>' +
        '<tr><td>Prestige complet</td><td>3 Ruines Niv.5 + 50 cases → Autel → Éther calculé.</td></tr>' +
        '<tr><td>Codex badge HUD</td><td>Après 1er prestige, 📖 Niv.X ×Y apparaît en bas-droite.</td></tr>' +
        '<tr><td>Panthéon canvas</td><td>Talents → 🏛️ Panthéon. Canvas étoilé, nœuds cliquables.</td></tr>' +
        '<tr><td>Malédiction zone</td><td>Après 25 cases révélées, indicateur 💀 dans HUD.</td></tr>' +
        '<tr><td>Craft Clé Divine</td><td>Onglet Zones → Crafter → barre de progression.</td></tr>' +
        '<tr><td>Mode select Phase 9</td><td>Nouvelle Partie → écran Panthéon/Théomachie/Genèse.</td></tr>' +
        '</table>' +
      '</div>'
    );
  }
}
