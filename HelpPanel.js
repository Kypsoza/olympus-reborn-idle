/* ═══════════════════════════════════════════════════════════
   EventBus.js — Système d'événements pub/sub global
════════════════════════════════════════════════════════════ */

const EventBus = (() => {
  const listeners = {};

  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  }

  function off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  }

  function emit(event, data) {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => {
      try { cb(data); }
      catch(e) { console.error(`[EventBus] Erreur dans "${event}":`, e); }
    });
  }

  function once(event, callback) {
    const wrapper = (data) => { callback(data); off(event, wrapper); };
    on(event, wrapper);
  }

  return { on, off, emit, once };
})();
