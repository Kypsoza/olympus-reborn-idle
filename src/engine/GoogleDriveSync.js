/* ═══════════════════════════════════════════════════════════
   GoogleDriveSync.js v2 — FedCM + Drive API
   Utilise Google One Tap (pas de popup) pour l'auth,
   évite le problème Cross-Origin-Opener-Policy de GitHub Pages.
════════════════════════════════════════════════════════════ */

const GoogleDriveSync = (() => {

  const CLIENT_ID = '470727767346-fkckcjsbf49kg33cmdnhaa045hs9reeq.apps.googleusercontent.com';
  const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  const SAVE_FILE   = 'olympus_reborn_save.json';
  const DISCOVERY   = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  const IS_LOCAL = location.protocol === 'file:';

  let _idToken     = null;   // JWT de One Tap → infos user
  let _accessToken = null;   // OAuth2 token → Drive API
  let _userInfo    = null;   // { name, email, picture }
  let _tokenClient = null;
  let _gapiReady   = false;
  let _gisReady    = false;
  let _onReadyCbs  = [];
  let _signInCb    = null;   // callback appelé après connexion réussie

  function _loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector('script[src="' + src + '"]')) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.async = true; s.defer = true;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // ── Init ─────────────────────────────────────────────────
  async function init() {
    if (IS_LOCAL) {
      console.log('[GDriveSync] Mode local — Drive désactivé.');
      _gapiReady = _gisReady = true;
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
      _initOneTap();
      console.log('[GDriveSync] Initialisé (FedCM mode).');
    } catch(e) {
      console.warn('[GDriveSync] Init échouée:', e);
      _gapiReady = _gisReady = true;
      _checkReady();
    }
  }

  function _initGapi() {
    return new Promise((res, rej) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({ discoveryDocs: [DISCOVERY] });
          _gapiReady = true;
          _checkReady();
          res();
        } catch(e) { rej(e); }
      });
    });
  }

  function _initGis() {
    // Token client pour Drive uniquement (pas d'infos user ici)
    _tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope:     DRIVE_SCOPE,
      callback:  (resp) => {
        if (resp.error) {
          console.warn('[GDriveSync] Token Drive error:', resp.error);
          return;
        }
        _accessToken = resp.access_token;
        if (gapi.client) gapi.client.setToken({ access_token: _accessToken });
        console.log('[GDriveSync] Token Drive obtenu.');
        // Déclencher le callback de connexion complète
        if (_signInCb) { _signInCb(null); _signInCb = null; }
      },
    });
    _gisReady = true;
    _checkReady();
  }

  function _initOneTap() {
    // One Tap : déclenché par signIn(), donne le JWT avec infos user
    google.accounts.id.initialize({
      client_id:  CLIENT_ID,
      callback:   _onOneTapCredential,
      auto_select: false,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: true,  // FedCM natif, pas de popup
    });
  }

  function _parseJWT(token) {
    try {
      const b64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
      return JSON.parse(atob(b64));
    } catch(e) { return null; }
  }

  function _onOneTapCredential(response) {
    if (!response || !response.credential) return;
    _idToken = response.credential;
    const payload = _parseJWT(_idToken);
    if (payload) {
      _userInfo = {
        name:    payload.name    || payload.email || 'Joueur',
        email:   payload.email   || '',
        picture: payload.picture || '',
      };
      localStorage.setItem('gds_user_name',  _userInfo.name);
      localStorage.setItem('gds_user_email', _userInfo.email);
      localStorage.setItem('gds_user_pic',   _userInfo.picture);
      console.log('[GDriveSync] Identité reçue via One Tap:', _userInfo.email);
    }
    // Demander ensuite le token Drive (peut ouvrir une mini popup discrète)
    _tokenClient.requestAccessToken({ prompt: '' });
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

  // ── Connexion ────────────────────────────────────────────
  function signIn() {
    return new Promise((res, rej) => {
      if (IS_LOCAL) { rej(new Error('Mode local')); return; }
      if (!_tokenClient) { rej(new Error('GIS non initialisé')); return; }

      // Si on a déjà tout ce qu'il faut
      if (_accessToken && _userInfo) { res(_userInfo); return; }

      // Timeout de sécurité
      const timeout = setTimeout(() => {
        rej(new Error('Timeout connexion Google'));
      }, 120000);

      if (_idToken) {
        // On a déjà l'identité, demander juste le token Drive
        _signInCb = (err) => {
          clearTimeout(timeout);
          if (err) rej(err);
          else res(_userInfo);
        };
        _tokenClient.requestAccessToken({ prompt: '' });
      } else {
        // Première connexion : One Tap + Drive token
        _signInCb = (err) => {
          clearTimeout(timeout);
          if (err) rej(err);
          else res(_userInfo);
        };
        // Déclencher One Tap
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap non disponible → fallback popup classique avec scope drive
            clearTimeout(timeout);
            const t2 = setTimeout(() => rej(new Error('Timeout')), 120000);
            _tokenClient.callback = (resp) => {
              clearTimeout(t2);
              if (resp.error) { rej(new Error(resp.error)); return; }
              _accessToken = resp.access_token;
              if (gapi.client) gapi.client.setToken({ access_token: _accessToken });
              // Infos user depuis cache localStorage si disponibles
              _userInfo = {
                name:    localStorage.getItem('gds_user_name')  || 'Joueur',
                email:   localStorage.getItem('gds_user_email') || '',
                picture: localStorage.getItem('gds_user_pic')   || '',
              };
              res(_userInfo);
            };
            _tokenClient.requestAccessToken({ prompt: 'select_account' });
          }
        });
      }
    });
  }

  function signOut() {
    if (_accessToken) google.accounts.oauth2.revoke(_accessToken, () => {});
    google.accounts.id.disableAutoSelect();
    _accessToken = _idToken = _userInfo = null;
    if (gapi.client) gapi.client.setToken(null);
    ['gds_user_name','gds_user_email','gds_user_pic'].forEach(k => localStorage.removeItem(k));
    console.log('[GDriveSync] Déconnecté.');
  }

  function isSignedIn() { return !!_accessToken; }

  async function getUserInfo() {
    if (_userInfo) return _userInfo;
    // Fallback cache
    const name  = localStorage.getItem('gds_user_name');
    const email = localStorage.getItem('gds_user_email');
    const pic   = localStorage.getItem('gds_user_pic');
    if (name || email) return { name: name||'Joueur', email: email||'', picture: pic||'' };
    return null;
  }

  // ── Drive : trouver le fichier de save ───────────────────
  async function _findSaveFile() {
    const resp = await gapi.client.drive.files.list({
      spaces: 'appDataFolder',
      q:      "name='" + SAVE_FILE + "'",
      fields: 'files(id,name,modifiedTime)',
      pageSize: 1,
    });
    const files = resp.result.files;
    return (files && files.length > 0) ? files[0] : null;
  }

  // ── Drive : lire la save ─────────────────────────────────
  async function loadFromDrive() {
    if (!_accessToken) throw new Error('Non connecté');
    const file = await _findSaveFile();
    if (!file) return null;
    const resp = await fetch(
      'https://www.googleapis.com/drive/v3/files/' + file.id + '?alt=media',
      { headers: { Authorization: 'Bearer ' + _accessToken } }
    );
    if (!resp.ok) throw new Error('Erreur lecture Drive: ' + resp.status);
    return { raw: await resp.text(), modifiedTime: file.modifiedTime, fileId: file.id };
  }

  // ── Drive : écrire la save ───────────────────────────────
  async function saveToDrive(encodedSave) {
    if (!_accessToken) throw new Error('Non connecté');
    const existingFile = await _findSaveFile();
    const metadata = existingFile ? { name: SAVE_FILE } : { name: SAVE_FILE, parents: ['appDataFolder'] };
    const boundary = 'olympus_' + Date.now();
    const body = [
      '--' + boundary,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      '--' + boundary,
      'Content-Type: text/plain',
      '',
      encodedSave,
      '--' + boundary + '--',
    ].join('\r\n');

    const url = existingFile
      ? 'https://www.googleapis.com/upload/drive/v3/files/' + existingFile.id + '?uploadType=multipart'
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&spaces=appDataFolder';

    const resp = await fetch(url, {
      method: existingFile ? 'PATCH' : 'POST',
      headers: {
        Authorization:  'Bearer ' + _accessToken,
        'Content-Type': 'multipart/related; boundary="' + boundary + '"',
      },
      body,
    });
    if (!resp.ok) throw new Error('Erreur écriture Drive: ' + resp.status);
    console.log('[GDriveSync] Save Drive OK.');
    return true;
  }

  async function getDriveSaveInfo() {
    if (!_accessToken) return null;
    try {
      const file = await _findSaveFile();
      return file ? { modifiedTime: file.modifiedTime } : null;
    } catch(e) { return null; }
  }

  return { init, onReady, signIn, signOut, isSignedIn, getUserInfo,
           loadFromDrive, saveToDrive, getDriveSaveInfo, isLocalMode: () => IS_LOCAL };
})();
