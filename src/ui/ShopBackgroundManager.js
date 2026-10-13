/**
 * ShopBackgroundManager.js
 * Dynamic Atmospheric Booster Pack Background Engine for Balatro.
 * Procedurally renders the 4 authentic Balatro booster pack themes matching reference photos:
 * 1. Celestial / Planet Packs: Deep pitch-black cosmic space canvas filled with subtle twinkling white stars.
 * 2. Arcana / Tarot Packs: Rich purple fluid lava lamp waves with vibrant amethyst & magenta ripples.
 * 3. Spectral Packs: Deep electric blue fluid lava lamp waves with luminous sapphire & cyan swells.
 * 4. Buffoon / Standard / Jumbo Packs: Warm orange/caramel/brown fluid lava lamp waves with golden highlights.
 * 
 * Features smooth real-time cross-fade transitions upon opening, switching, or skipping booster packs.
 */

export const PACK_THEMES = {
  CELESTIAL: 'celestial', // Deep black space canvas with twinkling stars
  ARCANA: 'arcana',       // Rich purple fluid lava lamp waves
  SPECTRAL: 'spectral',   // Deep electric blue fluid lava lamp waves
  BUFFOON: 'buffoon'      // Warm orange/brown fluid lava lamp waves
};

// Shader Palettes for Fluid Lava Lamp Themes
export const PACK_COLOR_PALETTES = {
  [PACK_THEMES.ARCANA]: {
    name: 'Arcana Tarot Lava',
    dark: [0.08, 0.02, 0.14],     // Deep dark midnight plum (#140524)
    mid: [0.45, 0.12, 0.72],      // Rich royal purple (#7e22ce)
    gold: [0.75, 0.15, 0.82],     // Vibrant electric magenta (#c026d3)
    high: [0.95, 0.65, 1.00],     // Luminescent lavender sheen (#f0abfc)
    hue2d: 285
  },
  [PACK_THEMES.SPECTRAL]: {
    name: 'Spectral Abyss Lava',
    dark: [0.02, 0.05, 0.16],     // Deep abyss midnight (#040d21)
    mid: [0.08, 0.28, 0.82],      // Deep electric royal sapphire (#1d4ed8)
    gold: [0.02, 0.68, 0.88],     // Electric cyan/cerulean (#06b6d4)
    high: [0.65, 0.92, 1.00],     // Electric crystalline sheen (#bae6fd)
    hue2d: 215
  },
  [PACK_THEMES.BUFFOON]: {
    name: 'Buffoon Amber Lava',
    dark: [0.10, 0.04, 0.01],     // Deep dark roasted espresso (#1a0a03)
    mid: [0.55, 0.22, 0.04],      // Warm burnt sienna / caramel (#c2410c)
    gold: [0.92, 0.45, 0.08],     // Warm molten amber/orange (#f97316)
    high: [1.00, 0.82, 0.45],     // Warm golden yellow sheen (#fde047)
    hue2d: 28
  }
};

export class ShopBackgroundManager {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('../game/GameEngine.js').GameEngine} gameEngine
   */
  constructor(canvas, gameEngine) {
    this.canvas = canvas || document.getElementById('bg-canvas');
    this.game = gameEngine;
    this.activeTheme = null; // null = default ante background
    this.gl = null;
    this.ctx = null;
    this.animationId = null;

    // Transition interpolation state (0 = normal ante, 1 = full pack theme)
    this.transitionFactor = 0.0;
    this.targetTransition = 0.0;
    this.celestialOpacity = 0.0;

    // Current interpolated RGB uniforms for fluid lava shader
    this.curDark = [0.08, 0.05, 0.01];
    this.curMid = [0.32, 0.20, 0.05];
    this.curGold = [0.55, 0.38, 0.10];
    this.curHigh = [0.78, 0.60, 0.18];

    // Procedural Starfield for Celestial / Planet Pack
    this.stars = [];
    this.initStars(160);

    this.init();
  }

  /**
   * Initializes 160 procedural stars with random coordinates, sizes, depths, and twinkle rates
   */
  initStars(count = 160) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() < 0.8 ? 0.7 + Math.random() * 1.2 : 2.0 + Math.random() * 1.5,
        twinkleSpeed: 1.5 + Math.random() * 3.5,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 0.3 + Math.random() * 0.7,
        driftSpeedX: (Math.random() - 0.5) * 0.00004,
        driftSpeedY: (Math.random() - 0.5) * 0.00004
      });
    }
  }

  /**
   * Detects and sets the pack theme based on pack type or id
   * @param {string|object} packData
   */
  setPackTheme(packData) {
    let type = '';
    if (typeof packData === 'string') {
      type = packData.toLowerCase();
    } else if (packData && packData.type) {
      type = packData.type.toLowerCase();
    } else if (packData && packData.id) {
      type = packData.id.toLowerCase();
    }

    if (type.includes('planet') || type.includes('celestial')) {
      this.activeTheme = PACK_THEMES.CELESTIAL;
    } else if (type.includes('tarot') || type.includes('arcana')) {
      this.activeTheme = PACK_THEMES.ARCANA;
    } else if (type.includes('spectral')) {
      this.activeTheme = PACK_THEMES.SPECTRAL;
    } else if (type.includes('joker') || type.includes('buffoon') || type.includes('standard') || type.includes('playing_card')) {
      this.activeTheme = PACK_THEMES.BUFFOON;
    } else {
      this.activeTheme = PACK_THEMES.BUFFOON;
    }

    this.targetTransition = 1.0;
  }

  /**
   * Clears the pack theme and smoothly transitions back to the Ante atmosphere
   */
  clearPackTheme() {
    this.activeTheme = null;
    this.targetTransition = 0.0;
  }

  init() {
    if (!this.canvas) return;

    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      if (this.gl) {
        this.gl.viewport(0, 0, this.width, this.height);
      }
    });

    // Try WebGL for authentic 60fps liquid metallic satin ripples
    this.gl = this.canvas.getContext('webgl', { antialias: false, alpha: false }) ||
              this.canvas.getContext('experimental-webgl');

    if (this.gl) {
      this.initWebGL();
    } else {
      this.init2D();
    }
  }

  initWebGL() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // Authentic Balatro fluid lava lamp advection shader with celestial space blend
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_cDark;
      uniform vec3 u_cMid;
      uniform vec3 u_cGold;
      uniform vec3 u_cHigh;
      uniform float u_celestialBlend;

      // Pseudo-random star noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        float r = length(uv);
        float a = atan(uv.y, uv.x);

        // Slow hypnotic fluid vortex swirl
        float twist = a + r * 1.8 - u_time * 0.14;
        vec2 p = vec2(cos(twist) * r, sin(twist) * r) * 3.3;

        // Multi-frequency domain-warped lava folds
        float t = u_time * 0.24;
        for (int i = 1; i <= 4; i++) {
          float fi = float(i);
          p += vec2(
            sin(p.y * 1.6 + t * 0.42 + fi * 1.25) * 0.45,
            cos(p.x * 1.6 - t * 0.48 + fi * 1.15) * 0.45
          );
        }

        // Liquid lava ripple waves
        float wave1 = sin(p.x * 2.5 + sin(p.y * 2.9 + t * 0.65));
        float wave2 = cos(p.y * 2.7 - sin(p.x * 2.3 + t * 0.48));
        float fluid = 0.5 + 0.5 * (wave1 * 0.62 + wave2 * 0.38);

        // Secondary counter-wave for rich lava marbling
        float wave3 = sin(p.y * 3.1 + cos(p.x * 2.9 - t * 0.52));
        float marbling = clamp(0.5 + 0.5 * wave3, 0.0, 1.0);

        // Specular sheen along silky fold ridges
        float spec1 = pow(clamp(sin(p.x * 4.0 + p.y * 3.4 + t * 0.8), 0.0, 1.0), 3.5);
        float spec2 = pow(clamp(cos(p.x * 3.0 - p.y * 3.6 - t * 0.55), 0.0, 1.0), 4.5);

        // Color blending between dark base, mid-tone, and vibrant highlight
        vec3 lavaCol = mix(u_cDark, u_cMid, clamp(fluid * 1.32, 0.0, 1.0));
        lavaCol = mix(lavaCol, u_cGold, clamp(marbling * marbling * 1.35, 0.0, 1.0));
        lavaCol += u_cHigh * (spec1 * 0.65 + spec2 * 0.55);

        // Subtle edge vignette
        lavaCol *= clamp(1.18 - r * 0.36, 0.48, 1.0);

        // Deep Black Space Canvas with Twinkling Stars for Celestial Pack
        if (u_celestialBlend > 0.01) {
          vec3 spaceBlack = vec3(0.012, 0.020, 0.035);
          // Very subtle cosmic nebula dust
          vec3 nebula = vec3(0.03, 0.05, 0.09) * (0.5 + 0.5 * sin(p.x * 0.8 + p.y * 0.6));
          spaceBlack += nebula;

          // Procedural grid stars
          vec2 gridUv = gl_FragCoord.xy * 0.065;
          vec2 id = floor(gridUv);
          vec2 f = fract(gridUv) - 0.5;
          float starRandom = hash(id);
          if (starRandom > 0.88) {
            float dist = length(f);
            float twinkle = 0.5 + 0.5 * sin(u_time * (2.5 + starRandom * 4.0) + starRandom * 6.28);
            float starGlow = smoothstep(0.18, 0.0, dist) * twinkle * (starRandom * 1.2);
            spaceBlack += vec3(0.9, 0.95, 1.0) * starGlow;
          }

          lavaCol = mix(lavaCol, spaceBlack, u_celestialBlend);
        }

        gl_FragColor = vec4(lavaCol, 1.0);
      }
    `;

    const createShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vs || !fs) {
      this.init2D();
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const resUniform = gl.getUniformLocation(program, 'u_resolution');
    const timeUniform = gl.getUniformLocation(program, 'u_time');
    const cDarkUniform = gl.getUniformLocation(program, 'u_cDark');
    const cMidUniform = gl.getUniformLocation(program, 'u_cMid');
    const cGoldUniform = gl.getUniformLocation(program, 'u_cGold');
    const cHighUniform = gl.getUniformLocation(program, 'u_cHigh');
    const celestialUniform = gl.getUniformLocation(program, 'u_celestialBlend');

    const startTime = performance.now();

    const renderLoop = (now) => {
      const elapsed = (now - startTime) * 0.001;
      gl.viewport(0, 0, this.width, this.height);
      gl.uniform2f(resUniform, this.width, this.height);
      gl.uniform1f(timeUniform, elapsed);

      // Smooth transition interpolation
      this.transitionFactor += (this.targetTransition - this.transitionFactor) * 0.06;
      const targetCelestial = this.activeTheme === PACK_THEMES.CELESTIAL ? 1.0 : 0.0;
      this.celestialOpacity += (targetCelestial - this.celestialOpacity) * 0.07;
      gl.uniform1f(celestialUniform, this.celestialOpacity);

      // Determine target color palette
      const targetPalette = this.getTargetPalette();

      // Smooth color lerp transition
      for (let c = 0; c < 3; c++) {
        this.curDark[c] += (targetPalette.dark[c] - this.curDark[c]) * 0.06;
        this.curMid[c] += (targetPalette.mid[c] - this.curMid[c]) * 0.06;
        this.curGold[c] += (targetPalette.gold[c] - this.curGold[c]) * 0.06;
        this.curHigh[c] += (targetPalette.high[c] - this.curHigh[c]) * 0.06;
      }

      gl.uniform3f(cDarkUniform, this.curDark[0], this.curDark[1], this.curDark[2]);
      gl.uniform3f(cMidUniform, this.curMid[0], this.curMid[1], this.curMid[2]);
      gl.uniform3f(cGoldUniform, this.curGold[0], this.curGold[1], this.curGold[2]);
      gl.uniform3f(cHighUniform, this.curHigh[0], this.curHigh[1], this.curHigh[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      this.animationId = requestAnimationFrame(renderLoop);
    };

    this.animationId = requestAnimationFrame(renderLoop);
  }

  init2D() {
    this.ctx = this.canvas.getContext('2d');
    let time = 0;

    const render2DLoop = () => {
      time += 0.015;

      this.transitionFactor += (this.targetTransition - this.transitionFactor) * 0.06;
      const targetCelestial = this.activeTheme === PACK_THEMES.CELESTIAL ? 1.0 : 0.0;
      this.celestialOpacity += (targetCelestial - this.celestialOpacity) * 0.07;

      if (this.celestialOpacity > 0.95) {
        // Render pure Celestial Black Space Canvas with Twinkling Stars
        this.renderCelestial2D(time);
      } else {
        // Render Fluid Lava Lamp Canvas
        this.renderLava2D(time);
        if (this.celestialOpacity > 0.05) {
          this.ctx.save();
          this.ctx.globalAlpha = this.celestialOpacity;
          this.renderCelestial2D(time);
          this.ctx.restore();
        }
      }

      this.animationId = requestAnimationFrame(render2DLoop);
    };

    this.animationId = requestAnimationFrame(render2DLoop);
  }

  renderCelestial2D(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Pitch black deep space
    ctx.fillStyle = '#030508';
    ctx.fillRect(0, 0, w, h);

    // Subtle cosmic nebula clouds in background
    const nebulaGrad = ctx.createRadialGradient(w * 0.4, h * 0.45, 80, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.6);
    nebulaGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    nebulaGrad.addColorStop(0.6, 'rgba(6, 11, 24, 0.25)');
    nebulaGrad.addColorStop(1, 'rgba(2, 4, 8, 0.9)');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling white stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.x += s.driftSpeedX;
      s.y += s.driftSpeedY;
      if (s.x < 0) s.x += 1;
      if (s.x > 1) s.x -= 1;
      if (s.y < 0) s.y += 1;
      if (s.y > 1) s.y -= 1;

      const px = s.x * w;
      const py = s.y * h;
      const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.phase);
      const alpha = s.baseAlpha * twinkle;

      ctx.beginPath();
      ctx.arc(px, py, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      ctx.shadowBlur = s.size > 1.8 ? 6 : 0;
      ctx.shadowColor = '#ffffff';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  renderLava2D(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const target = this.getTargetPalette();
    const baseHue = target.hue2d || 28;

    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.75);
    bgGrad.addColorStop(0, `hsla(${baseHue}, 80%, 16%, 1)`);
    bgGrad.addColorStop(0.5, `hsla(${baseHue}, 85%, 8%, 1)`);
    bgGrad.addColorStop(1, '#050403');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const bands = 14;
    for (let b = 0; b < bands; b++) {
      const yBase = (b / bands) * h * 1.3 - h * 0.15;
      ctx.beginPath();
      for (let x = 0; x <= w + 20; x += 20) {
        const wave1 = Math.sin(x * 0.003 + time * 0.7 + b * 0.45) * 52;
        const wave2 = Math.cos(x * 0.0055 - time * 0.38 + b * 0.35) * 26;
        const y = yBase + wave1 + wave2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const hue = baseHue + Math.sin(time * 0.4 + b) * 6;
      const lightness = 18 + (b % 2 === 0 ? 14 : 5) + Math.sin(time + b) * 5;
      ctx.fillStyle = `hsla(${hue}, 88%, ${lightness}%, 0.38)`;
      ctx.fill();
    }
  }

  /**
   * Retrieves the target color palette based on current pack theme or default Ante
   */
  getTargetPalette() {
    if (this.activeTheme && PACK_COLOR_PALETTES[this.activeTheme]) {
      return PACK_COLOR_PALETTES[this.activeTheme];
    }

    // Default: Ante atmosphere from GameEngine
    const ante = this.game ? (this.game.ante || 1) : 1;
    const antePalettes = [
      { dark: [0.08, 0.05, 0.01], mid: [0.32, 0.20, 0.05], gold: [0.55, 0.38, 0.10], high: [0.78, 0.60, 0.18], hue2d: 36 }, // Ante 1
      { dark: [0.04, 0.12, 0.08], mid: [0.12, 0.35, 0.24], gold: [0.22, 0.58, 0.38], high: [0.50, 0.85, 0.65], hue2d: 145 }, // Ante 2
      { dark: [0.03, 0.06, 0.16], mid: [0.08, 0.22, 0.46], gold: [0.18, 0.46, 0.80], high: [0.50, 0.78, 0.98], hue2d: 215 }, // Ante 3
      { dark: [0.10, 0.04, 0.15], mid: [0.28, 0.12, 0.38], gold: [0.52, 0.24, 0.68], high: [0.82, 0.58, 0.95], hue2d: 280 }, // Ante 4
      { dark: [0.14, 0.04, 0.07], mid: [0.38, 0.11, 0.18], gold: [0.68, 0.22, 0.32], high: [0.92, 0.58, 0.68], hue2d: 345 }, // Ante 5
      { dark: [0.03, 0.10, 0.13], mid: [0.09, 0.28, 0.34], gold: [0.16, 0.52, 0.58], high: [0.48, 0.84, 0.90], hue2d: 185 }, // Ante 6
      { dark: [0.09, 0.07, 0.05], mid: [0.26, 0.22, 0.16], gold: [0.50, 0.42, 0.32], high: [0.82, 0.74, 0.65], hue2d: 35 },  // Ante 7
      { dark: [0.07, 0.05, 0.15], mid: [0.20, 0.14, 0.38], gold: [0.40, 0.28, 0.68], high: [0.74, 0.60, 0.95], hue2d: 265 }  // Ante 8
    ];

    const idx = Math.max(0, Math.min(antePalettes.length - 1, ante - 1));
    return antePalettes[idx];
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
