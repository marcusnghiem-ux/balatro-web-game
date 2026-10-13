/**
 * BackgroundRenderer.js
 * High-performance WebGL and 2D Canvas Fluid Atmospheric Dynamics Engine for Balatro.
 * Recreates the mesmerizing abstract liquid waves matching reference photo:
 * - Deep midnight navy and dark indigo base tones
 * - Organic, slow-moving fluid waves of vibrant crimson red melting into electric royal blue
 * - Dynamic color transitions per Ante (calm emerald green for Ante 2, deep sapphire for Ante 3)
 */

export const TITLE_COLOR_PALETTE = {
  name: 'Title Screen',
  dark: [0.10, 0.03, 0.08],     // Deep midnight indigo/plum
  mid: [0.72, 0.12, 0.15],      // Vibrant crimson red
  gold: [0.08, 0.38, 0.85],     // Electric royal blue
  high: [0.95, 0.35, 0.40],     // Crimson highlight sheen
  hue2d: 350
};

export const ANTE_COLOR_PALETTES = [
  // Ante 1: Calmed Warm Amber Ochre
  { dark: [0.08, 0.05, 0.01], mid: [0.32, 0.20, 0.05], gold: [0.55, 0.38, 0.10], high: [0.78, 0.60, 0.18], hue2d: 36 },
  // Ante 2: Calming Deep Sage / Emerald Green Satin (Exact match to Reference Photo 3)
  { dark: [0.04, 0.12, 0.08], mid: [0.12, 0.35, 0.24], gold: [0.22, 0.58, 0.38], high: [0.50, 0.85, 0.65], hue2d: 145 },
  // Ante 3: Calming Midnight / Sapphire Blue Satin (Exact match to Reference Photo 4)
  { dark: [0.03, 0.06, 0.16], mid: [0.08, 0.22, 0.46], gold: [0.18, 0.46, 0.80], high: [0.50, 0.78, 0.98], hue2d: 215 },
  // Ante 4: Calming Royal Plum / Amethyst Velvet
  { dark: [0.10, 0.04, 0.15], mid: [0.28, 0.12, 0.38], gold: [0.52, 0.24, 0.68], high: [0.82, 0.58, 0.95], hue2d: 280 },
  // Ante 5: Calming Deep Wine / Rose Crimson
  { dark: [0.14, 0.04, 0.07], mid: [0.38, 0.11, 0.18], gold: [0.68, 0.22, 0.32], high: [0.92, 0.58, 0.68], hue2d: 345 },
  // Ante 6: Calming Oceanic Teal / Marine Silk
  { dark: [0.03, 0.10, 0.13], mid: [0.09, 0.28, 0.34], gold: [0.16, 0.52, 0.58], high: [0.48, 0.84, 0.90], hue2d: 185 },
  // Ante 7: Calming Smoked Bronze / Charcoal
  { dark: [0.09, 0.07, 0.05], mid: [0.26, 0.22, 0.16], gold: [0.50, 0.42, 0.32], high: [0.82, 0.74, 0.65], hue2d: 35 },
  // Ante 8: Calming Celestial Dusk / Indigo Violet
  { dark: [0.07, 0.05, 0.15], mid: [0.20, 0.14, 0.38], gold: [0.40, 0.28, 0.68], high: [0.74, 0.60, 0.95], hue2d: 265 }
];

export class BackgroundRenderer {
  constructor(canvasElement, gameEngine) {
    this.canvas = canvasElement;
    this.game = gameEngine;
    this.gl = null;
    this.ctx = null;
    this.animationId = null;

    this.curDark = [...TITLE_COLOR_PALETTE.dark];
    this.curMid = [...TITLE_COLOR_PALETTE.mid];
    this.curGold = [...TITLE_COLOR_PALETTE.gold];
    this.curHigh = [...TITLE_COLOR_PALETTE.high];

    this.init();
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

    // Attempt WebGL initialization
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

    // Multi-frequency organic fluid advection simulation
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_cDark;
      uniform vec3 u_cMid;
      uniform vec3 u_cGold;
      uniform vec3 u_cHigh;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        float r = length(uv);
        float a = atan(uv.y, uv.x);

        // Smooth slow organic swirl
        float twist = a + r * 1.6 - u_time * 0.12;
        vec2 p = vec2(cos(twist) * r, sin(twist) * r) * 3.2;

        // Fluid domain warping layers
        float t = u_time * 0.22;
        for (int i = 1; i <= 4; i++) {
          float fi = float(i);
          p += vec2(
            sin(p.y * 1.5 + t * 0.40 + fi * 1.3) * 0.48,
            cos(p.x * 1.5 - t * 0.45 + fi * 1.1) * 0.48
          );
        }

        // Fluid waves intertwining across screen
        float wave1 = sin(p.x * 2.4 + sin(p.y * 2.8 + t * 0.6));
        float wave2 = cos(p.y * 2.6 - sin(p.x * 2.2 + t * 0.45));
        float fluidPattern = 0.5 + 0.5 * (wave1 * 0.62 + wave2 * 0.38);

        // Secondary counter-wave for rich red/blue marbling
        float wave3 = sin(p.y * 3.2 + cos(p.x * 3.0 - t * 0.5));
        float marbling = clamp(0.5 + 0.5 * wave3, 0.0, 1.0);

        // Sheen reflections
        float spec1 = pow(clamp(sin(p.x * 3.8 + p.y * 3.2 + t * 0.7), 0.0, 1.0), 3.5);
        float spec2 = pow(clamp(cos(p.x * 2.8 - p.y * 3.4 - t * 0.5), 0.0, 1.0), 4.5);

        // Balance colors between dark midnight, vibrant crimson, and electric royal blue
        vec3 col = mix(u_cDark, u_cMid, clamp(fluidPattern * 1.3, 0.0, 1.0));
        col = mix(col, u_cGold, clamp(marbling * marbling * 1.25, 0.0, 1.0));
        col += u_cHigh * (spec1 * 0.55 + spec2 * 0.45);

        // Gentle edge vignette
        col *= clamp(1.18 - r * 0.35, 0.5, 1.0);

        gl_FragColor = vec4(col, 1.0);
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

    const startTime = performance.now();

    const renderLoop = (now) => {
      const elapsed = (now - startTime) * 0.001;
      gl.viewport(0, 0, this.width, this.height);
      gl.uniform2f(resUniform, this.width, this.height);
      gl.uniform1f(timeUniform, elapsed);

      const target = this.getTargetPalette();

      // Smooth color interpolation
      for (let c = 0; c < 3; c++) {
        this.curDark[c] += (target.dark[c] - this.curDark[c]) * 0.04;
        this.curMid[c] += (target.mid[c] - this.curMid[c]) * 0.04;
        this.curGold[c] += (target.gold[c] - this.curGold[c]) * 0.04;
        this.curHigh[c] += (target.high[c] - this.curHigh[c]) * 0.04;
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
      time += 0.012;
      const target = this.getTargetPalette();
      const baseHue = target.hue2d || 350;

      const bgGrad = this.ctx.createRadialGradient(
        this.width * 0.5, this.height * 0.5, 40,
        this.width * 0.5, this.height * 0.5, Math.hypot(this.width, this.height) * 0.75
      );
      bgGrad.addColorStop(0, `hsla(${baseHue}, 75%, 16%, 1)`);
      bgGrad.addColorStop(0.5, `hsla(${baseHue}, 80%, 8%, 1)`);
      bgGrad.addColorStop(1, '#05070a');
      this.ctx.fillStyle = bgGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      const bands = 12;
      for (let b = 0; b < bands; b++) {
        const yBase = (b / bands) * this.height * 1.3 - this.height * 0.15;
        this.ctx.beginPath();
        for (let x = 0; x <= this.width + 30; x += 30) {
          const wave1 = Math.sin(x * 0.003 + time * 0.6 + b * 0.45) * 50;
          const wave2 = Math.cos(x * 0.005 - time * 0.35 + b * 0.35) * 25;
          const y = yBase + wave1 + wave2;
          if (x === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();

        const hue = (baseHue + (b % 2 === 0 ? 0 : 210) + Math.sin(time * 0.3 + b) * 10) % 360;
        const lightness = 18 + (b % 2 === 0 ? 14 : 6) + Math.sin(time + b) * 4;
        this.ctx.fillStyle = `hsla(${hue}, 85%, ${lightness}%, 0.38)`;
        this.ctx.fill();
      }

      this.animationId = requestAnimationFrame(render2DLoop);
    };

    this.animationId = requestAnimationFrame(render2DLoop);
  }

  getTargetPalette() {
    if (!this.game || this.game.state === 'TITLE') {
      return TITLE_COLOR_PALETTE;
    }
    const anteIdx = Math.max(0, Math.min(ANTE_COLOR_PALETTES.length - 1, (this.game.ante || 1) - 1));
    return ANTE_COLOR_PALETTES[anteIdx];
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
