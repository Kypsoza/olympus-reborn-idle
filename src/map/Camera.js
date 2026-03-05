/* ═══════════════════════════════════════════════════════════
   Camera.js — Système de caméra (pan + zoom)
════════════════════════════════════════════════════════════ */

class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;       // Décalage X du monde
    this.y = 0;       // Décalage Y du monde
    this.zoom = 1.0;  // Facteur de zoom (0.3 – 3.0)
    this.minZoom = 0.3;
    this.maxZoom = 3.0;
    this.targetZoom = 1.0;

    // Drag
    this._dragging = false;
    this._lastX = 0;
    this._lastY = 0;

    // Touches actives (multi-touch)
    this._touches = [];

    this._bindEvents();
    this._centerOnOrigin();
  }

  _centerOnOrigin() {
    this.x = this.canvas.width  / 2;
    this.y = this.canvas.height / 2;
  }

  // ── Transformation ──────────────────────────────────────
  // Applique la caméra sur un contexte Canvas
  apply(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.zoom, this.zoom);
  }
  restore(ctx) { ctx.restore(); }

  // ── World ↔ Screen ──────────────────────────────────────
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.x) / this.zoom,
      y: (sy - this.y) / this.zoom
    };
  }
  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.x,
      y: wy * this.zoom + this.y
    };
  }

  // ── Zoom ────────────────────────────────────────────────
  zoomAt(delta, sx, sy) {
    const factor = delta > 0 ? 1.1 : 0.9;
    const newZoom = MathUtils.clamp(this.zoom * factor, this.minZoom, this.maxZoom);
    // Zoom centré sur le point d'intérêt
    this.x = sx - (sx - this.x) * (newZoom / this.zoom);
    this.y = sy - (sy - this.y) * (newZoom / this.zoom);
    this.zoom = newZoom;
  }

  setZoom(z) {
    const cx = this.canvas.width  / 2;
    const cy = this.canvas.height / 2;
    const newZoom = MathUtils.clamp(z, this.minZoom, this.maxZoom);
    this.x = cx - (cx - this.x) * (newZoom / this.zoom);
    this.y = cy - (cy - this.y) * (newZoom / this.zoom);
    this.zoom = newZoom;
  }

  resetView() {
    this._centerOnOrigin();
    this.zoom = 1.0;
  }

  // ── Événements Souris ───────────────────────────────────
  _bindEvents() {
    const c = this.canvas;

    // Souris : drag
    c.addEventListener('mousedown', e => {
      this._dragging = true;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      c.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
      if (!this._dragging) return;
      this.x += e.clientX - this._lastX;
      this.y += e.clientY - this._lastY;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      EventBus.emit('camera:moved');
    });
    window.addEventListener('mouseup', () => {
      this._dragging = false;
      c.style.cursor = 'grab';
    });

    // Souris : zoom roulette
    c.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      this.zoomAt(-e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
      EventBus.emit('camera:zoomed');
    }, { passive: false });

    // Touch : drag + pinch
    // _wasPinching : bloque le tap qui suit un pinch-to-zoom
    this._wasPinching = false;
    this._pinchEndTime = 0;

    c.addEventListener('touchstart', e => {
      e.preventDefault();
      this._touches = [...e.touches];
      // Si on pose 2 doigts, on entre en mode pinch
      if (e.touches.length === 2) this._wasPinching = true;
    }, { passive: false });

    c.addEventListener('touchmove', e => {
      e.preventDefault();
      const touches = [...e.touches];

      if (touches.length === 1 && this._touches.length === 1) {
        // Pan
        this.x += touches[0].clientX - this._touches[0].clientX;
        this.y += touches[0].clientY - this._touches[0].clientY;
        EventBus.emit('camera:moved');
      }
      else if (touches.length === 2 && this._touches.length >= 1) {
        // Pinch zoom — ratio de distance, sensibilité modérée
        const prevDist = this._touches.length === 2 ? Math.hypot(
          this._touches[0].clientX - this._touches[1].clientX,
          this._touches[0].clientY - this._touches[1].clientY
        ) : 0;
        const newDist = Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY
        );
        if (prevDist > 10) {
          const ratio = newDist / prevDist;
          // Atténuation 0.55 : sensibilité agréable (ni trop lente, ni brutale)
          const smoothRatio = 1 + (ratio - 1) * 0.55;
          const midX = (touches[0].clientX + touches[1].clientX) / 2;
          const midY = (touches[0].clientY + touches[1].clientY) / 2;
          const rect  = c.getBoundingClientRect();
          const cx = midX - rect.left;
          const cy = midY - rect.top;
          const newZoom = MathUtils.clamp(this.zoom * smoothRatio, this.minZoom, this.maxZoom);
          this.x = cx - (cx - this.x) * (newZoom / this.zoom);
          this.y = cy - (cy - this.y) * (newZoom / this.zoom);
          this.zoom = newZoom;
          EventBus.emit('camera:zoomed');
        }
        this._wasPinching = true;
      }
      this._touches = touches;
    }, { passive: false });

    c.addEventListener('touchend', e => {
      // Mémoriser la fin du pinch pour bloquer le tap fantôme
      if (this._wasPinching && e.touches.length < 2) {
        this._pinchEndTime = Date.now();
        this._wasPinching = false;
      }
      this._touches = [...e.touches];
    });
  }

  // ── Mise à jour canvas size ─────────────────────────────
  resize(w, h) {
    this.canvas.width  = w;
    this.canvas.height = h;
  }
}
