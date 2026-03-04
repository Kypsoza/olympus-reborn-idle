/* ═══════════════════════════════════════════════════════════
   GoogleDriveSync.js — Auth Google + sauvegarde Drive
   Client ID : 470727767346-fkckcjsbf49kg33cmdnhaa045hs9reeq.apps.googleusercontent.com
   Hosted at  : https://kypsoza.github.io/olympus-reborn-idle/
════════════════════════════════════════════════════════════ */

const GoogleDriveSync = (() => {

  const CLIENT_ID  = '470727767346-fkckcjsbf49kg33cmdnhaa045hs9reeq.apps.googleusercontent.com';
  const SCOPES     = 'https://www.googleapis.com/auth/drive.appdata';
  const SAVE_FILE  = 'olympus_reborn_save.json';
  const DISCOVERY  = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  // Désactivé si on tourne en file:// (OAuth ne fonctionne qu'en HTTPS)
  const IS_LOCAL = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  let _tokenClient  = null;
  let _accessToken  = null;
  let _gapiReady    = false;
  let _gisReady     = false;
  let _onReadyCbs   = [];

  // ── Chargement des scripts Google ───────────────────────
  function _loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.async = true; s.defer = true;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  async function init() {
    // En file:// ou localhost : pas de Google OAuth, mode local uniquement
    if (IS_LOCAL) {
      console.log('[GDriveSync] Mode local (file:// ou localhost) — Google Drive désactivé.');
      _gapiReady = true;
      _gisReady  = true;
      _checkReady();
      return;
    }
    try {
      await Promise.all([
        _loadScript('https://apis.google.com/js/api.js'),
        _loadScript('https://accounts.google.com/gsi/client'),
      ]);
      await _initGapi();
      _initGis();
      console.log('[GDriveSync] Initialisé.');
    } catch(e) {
      console.warn('[GDriveSync] Impossible de charger les scripts Google:', e);
      // Fallback : déclencher quand même les callbacks pour afficher le mode local
      _gapiReady = true;
      _gisReady  = true;
      _checkReady();
    }
  }

  function _initGapi() {
    return new Promise((res, rej) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            discoveryDocs: [DISCOVERY],
          });
          _gapiReady = true;
          _checkReady();
          res();
        } catch(e) { rej(e); }
      });
    });
  }

  function _initGis() {
    _tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope:     SCOPES,
      callback:  _onTokenResponse,
    });
    _gisReady = true;
    _checkReady();
  }

  function _checkReady() {
    if (_gapiReady && _gisReady) {
      _onReadyCbs.forEach(cb => cb());
      _onReadyCbs = [];
    }
  }

  function onReady(cb) {
    if (_gapiReady && _gisReady) cb();
    else _onReadyCbs.push(cb);
  }

  function _onTokenResponse(resp) {
    if (resp.error) {
      console.warn('[GDriveSync] Token error:', resp.error);
      _accessToken = null;
      return;
    }
    _accessToken = resp.access_token;
    gapi.client.setToken({ access_token: _accessToken });
    console.log('[GDriveSync] Token obtenu.');
  }

  // ── Connexion ────────────────────────────────────────────
  function signIn() {
    return new Promise((res, rej) => {
      if (IS_LOCAL) { rej(new Error('Google Drive non disponible en mode local')); return; }
      if (!_tokenClient) { rej(new Error('GIS non initialisé')); return; }
      const origCb = _tokenClient.callback;
      _tokenClient.callback = (resp) => {
        _onTokenResponse(resp);
        _tokenClient.callback = origCb;
        if (resp.error) rej(new Error(resp.error));
        else res(_accessToken);
      };
      // Si on a déjà un token en cache, pas de popup
      if (_accessToken) { res(_accessToken); return; }
      _tokenClient.requestAccessToken({ prompt: 'select_account' });
    });
  }

  function signOut() {
    if (_accessToken) {
      google.accounts.oauth2.revoke(_accessToken, () => {});
    }
    _accessToken = null;
    gapi.client.setToken(null);
    localStorage.removeItem('gds_user_name');
    localStorage.removeItem('gds_user_email');
    localStorage.removeItem('gds_user_pic');
    console.log('[GDriveSync] Déconnecté.');
  }

  function isSignedIn() { return !!_accessToken; }

  // ── Profil utilisateur (via tokeninfo) ──────────────────
  async function getUserInfo() {
    if (!_accessToken) return null;
    try {
      const r = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: 'Bearer ' + _accessToken } }
      );
      if (!r.ok) return null;
      const info = await r.json();
      // Cache local pour affichage rapide
      localStorage.setItem('gds_user_name',  info.name  || '');
      localStorage.setItem('gds_user_email', info.email || '');
      localStorage.setItem('gds_user_pic',   info.picture || '');
      return info;
    } catch(e) { return null; }
  }

  // ── Drive : trouver le fichier de save ───────────────────
  async function _findSaveFile() {
    const resp = await gapi.client.drive.files.list({
      spaces:  'appDataFolder',
      q:       `name='${SAVE_FILE}'`,
      fields:  'files(id,name,modifiedTime)',
      pageSize: 1,
    });
    const files = resp.result.files;
    return files && files.length > 0 ? files[0] : null;
  }

  // ── Drive : lire la save ─────────────────────────────────
  async function loadFromDrive() {
    if (!_accessToken) throw new Error('Non connecté');
    const file = await _findSaveFile();
    if (!file) return null; // Pas de save sur Drive

    const resp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      { headers: { Authorization: 'Bearer ' + _accessToken } }
    );
    if (!resp.ok) throw new Error('Erreur lecture Drive: ' + resp.status);
    const text = await resp.text();
    return { raw: text, modifiedTime: file.modifiedTime, fileId: file.id };
  }

  // ── Drive : écrire la save ───────────────────────────────
  async function saveToDrive(encodedSave) {
    if (!_accessToken) throw new Error('Non connecté');

    const existingFile = await _findSaveFile();
    const metadata = { name: SAVE_FILE, parents: existingFile ? undefined : ['appDataFolder'] };
    const boundary  = 'olympus_boundary_' + Date.now();
    const body = [
      '--' + boundary,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(existingFile ? { name: SAVE_FILE } : metadata),
      '--' + boundary,
      'Content-Type: text/plain',
      '',
      encodedSave,
      '--' + boundary + '--',
    ].join('\r\n');

    const url = existingFile
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&spaces=appDataFolder';

    const resp = await fetch(url, {
      method:  existingFile ? 'PATCH' : 'POST',
      headers: {
        Authorization:  'Bearer ' + _accessToken,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    });
    if (!resp.ok) throw new Error('Erreur écriture Drive: ' + resp.status);
    console.log('[GDriveSync] Save écrite sur Drive.');
    return true;
  }

  // ── Infos save Drive (date, lisibilité) ──────────────────
  async function getDriveSaveInfo() {
    if (!_accessToken) return null;
    try {
      const file = await _findSaveFile();
      if (!file) return null;
      return { modifiedTime: file.modifiedTime };
    } catch(e) { return null; }
  }

  return { init, onReady, signIn, signOut, isSignedIn, getUserInfo,
           loadFromDrive, saveToDrive, getDriveSaveInfo, isLocalMode: () => IS_LOCAL };
})();
