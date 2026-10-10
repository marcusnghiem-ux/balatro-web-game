/**
 * Renderer.js
 * Visual presentation layer, procedural audio synthesizer (Web Audio API),
 * hypnotic golden spiral vortex shader, 3-zone Shop system, booster pack overlays,
 * and DOM orchestration.
 */

import { ScoringEngine } from '../game/ScoringEngine.js';
import { HAND_DEFINITIONS } from '../game/HandEvaluator.js';
import { GAME_STATES, BLIND_TYPES } from '../game/GameEngine.js';
import { CONSUMABLE_TYPES } from '../game/ConsumableSystem.js';
import { ENHANCEMENT_LABELS, EDITIONS } from '../game/Card.js';

export const ANTE_COLOR_PALETTES = [
  // Ante 1: Calming Warm Amber / Molten Gold Silk
  { dark: [0.18, 0.11, 0.02], mid: [0.58, 0.41, 0.08], gold: [0.89, 0.69, 0.16], high: [1.0, 0.95, 0.64], hue2d: 38 },
  // Ante 2: Calming Deep Sage / Emerald Green Satin (Exact match to reference photo!)
  { dark: [0.05, 0.14, 0.09], mid: [0.12, 0.32, 0.22], gold: [0.24, 0.58, 0.40], high: [0.58, 0.88, 0.70], hue2d: 145 },
  // Ante 3: Calming Midnight / Sapphire Blue Satin
  { dark: [0.04, 0.08, 0.16], mid: [0.10, 0.24, 0.42], gold: [0.20, 0.45, 0.72], high: [0.55, 0.78, 0.98], hue2d: 215 },
  // Ante 4: Calming Royal Plum / Amethyst Velvet
  { dark: [0.12, 0.05, 0.16], mid: [0.30, 0.14, 0.40], gold: [0.52, 0.26, 0.68], high: [0.82, 0.62, 0.96], hue2d: 280 },
  // Ante 5: Calming Deep Wine / Rose Crimson
  { dark: [0.16, 0.05, 0.08], mid: [0.38, 0.12, 0.18], gold: [0.66, 0.24, 0.32], high: [0.94, 0.62, 0.70], hue2d: 345 },
  // Ante 6: Calming Oceanic Teal / Marine Silk
  { dark: [0.04, 0.12, 0.14], mid: [0.10, 0.30, 0.34], gold: [0.18, 0.54, 0.58], high: [0.52, 0.86, 0.90], hue2d: 185 },
  // Ante 7: Calming Smoked Bronze / Charcoal
  { dark: [0.10, 0.08, 0.06], mid: [0.28, 0.24, 0.18], gold: [0.52, 0.45, 0.35], high: [0.85, 0.78, 0.68], hue2d: 35 },
  // Ante 8: Calming Celestial Dusk / Indigo Violet
  { dark: [0.08, 0.06, 0.16], mid: [0.22, 0.16, 0.40], gold: [0.42, 0.30, 0.70], high: [0.76, 0.64, 0.96], hue2d: 265 }
];

export class Renderer {
  /**
   * @param {GameEngine} gameEngine
   */
  constructor(gameEngine) {
    this.game = gameEngine;

    // Cache DOM Elements
    this.bgCanvas = document.getElementById('bg-canvas');
    this.blindCardEl = document.getElementById('blind-card');
    this.blindSelectSidebarTitle = document.getElementById('blind-select-sidebar-title');
    this.blindNameEl = document.getElementById('blind-name');
    this.blindConditionEl = document.getElementById('blind-condition');
    this.blindRewardEl = document.getElementById('blind-reward');
    this.anteCounterEl = document.getElementById('ante-counter');
    this.targetScoreEl = document.getElementById('target-score');
    this.currentScoreEl = document.getElementById('current-score');
    
    // Blind Select Stage Elements
    this.blindSelectStage = document.getElementById('blind-select-stage');
    this.playArena = document.getElementById('play-arena');
    this.blindDeckCounter = document.getElementById('blind-deck-counter');

    this.blindCols = [
      document.getElementById('blind-col-0'),
      document.getElementById('blind-col-1'),
      document.getElementById('blind-col-2')
    ];
    this.blindSelectBtns = [
      document.getElementById('blind-select-btn-0'),
      document.getElementById('blind-select-btn-1'),
      document.getElementById('blind-select-btn-2')
    ];
    this.blindSkipBtns = [
      document.getElementById('blind-skip-btn-0'),
      document.getElementById('blind-skip-btn-1')
    ];
    this.blindScoreTargets = [
      document.getElementById('blind-score-target-0'),
      document.getElementById('blind-score-target-1'),
      document.getElementById('blind-score-target-2')
    ];
    this.blindRewardLabels = [
      document.getElementById('blind-reward-label-0'),
      document.getElementById('blind-reward-label-1'),
      document.getElementById('blind-reward-label-2')
    ];
    this.blindTitles = [
      document.getElementById('blind-title-0'),
      document.getElementById('blind-title-1'),
      document.getElementById('blind-title-2')
    ];
    this.blindBadges = [
      document.getElementById('blind-badge-0'),
      document.getElementById('blind-badge-1'),
      document.getElementById('blind-badge-2')
    ];
    this.blindTagIcons = [
      document.getElementById('blind-tag-icon-0'),
      document.getElementById('blind-tag-icon-1')
    ];
    this.blindBossDesc = document.getElementById('blind-boss-desc-2');

    this.previewHandName = document.getElementById('preview-hand-name');
    this.previewHandLevel = document.getElementById('preview-hand-level');
    this.previewChipsBox = document.getElementById('preview-chips-box');
    this.previewMultBox = document.getElementById('preview-mult-box');

    this.jokerCountEl = document.getElementById('joker-count');
    this.consumableCountEl = document.getElementById('consumable-count');
    this.jokerTriggerBanner = document.getElementById('joker-trigger-banner');
    this.moneyDisplayEl = document.getElementById('money-display');
    this.soundToggleBtn = document.getElementById('sound-toggle');
    this.soundStateLabel = document.getElementById('sound-state-label');
    this.jokersContainer = document.getElementById('jokers-container');
    this.consumablesContainer = document.getElementById('consumables-container');
    this.handsLeftEl = document.getElementById('hands-left');
    this.discardsLeftEl = document.getElementById('discards-left');
    this.anteSubEl = document.getElementById('ante-sub');
    this.roundSubEl = document.getElementById('round-sub');
    this.playerHandEl = document.getElementById('player-hand');
    this.playedCardsStage = document.getElementById('played-cards-stage');
    this.deckCounterEl = document.getElementById('deck-counter');

    this.playBtn = document.getElementById('play-btn');
    this.discardBtn = document.getElementById('discard-btn');
    this.playCountEl = document.getElementById('play-count');
    this.discardCountEl = document.getElementById('discard-count');
    this.sortRankBtn = document.getElementById('sort-rank-btn');
    this.sortSuitBtn = document.getElementById('sort-suit-btn');
    this.runInfoBtn = document.getElementById('run-info-btn');
    this.skipBlindBtn = document.getElementById('skip-blind-btn');

    // Interest Bar Elements
    this.interestCurrentVal = document.getElementById('interest-current-val');
    this.interestBarFill = document.getElementById('interest-bar-fill');
    this.interestMoneyNum = document.getElementById('interest-money-num');
    this.interestNextNum = document.getElementById('interest-next-num');

    this.scoringStage = document.getElementById('scoring-stage');
    this.scoringBoard = document.getElementById('scoring-board');
    this.scoringHandTitle = document.getElementById('scoring-hand-title');
    this.tallyChips = document.getElementById('tally-chips');
    this.tallyMult = document.getElementById('tally-mult');
    this.tallyTotal = document.getElementById('tally-total');

    // Shop Elements
    this.shopModal = document.getElementById('shop-modal');
    this.shopMoneyEl = document.getElementById('shop-money');
    this.shopAnteIndicator = document.getElementById('shop-ante-indicator');
    this.rerollCostEl = document.getElementById('reroll-cost');
    this.rerollBtn = document.getElementById('reroll-btn');
    this.shopCardsShelf = document.getElementById('shop-cards-shelf');
    this.shopPacksShelf = document.getElementById('shop-packs-shelf');
    this.shopVoucherSlot = document.getElementById('shop-voucher-slot');
    this.nextRoundBtn = document.getElementById('next-round-btn');

    // Pack Opening Overlay Elements
    this.packOverlay = document.getElementById('pack-overlay');
    this.packOverlayTitle = document.getElementById('pack-overlay-title');
    this.packOverlaySubtitle = document.getElementById('pack-overlay-subtitle');
    this.packCardsContainer = document.getElementById('pack-cards-container');
    this.skipPackBtn = document.getElementById('skip-pack-btn');

    // Run Info & Game Over
    this.runInfoModal = document.getElementById('run-info-modal');
    this.closeRunInfoBtn = document.getElementById('close-run-info-btn');
    this.handLevelsList = document.getElementById('hand-levels-list');

    this.gameOverModal = document.getElementById('game-over-modal');
    this.gameOverTitle = document.getElementById('game-over-title');
    this.gameOverMessage = document.getElementById('game-over-message');
    this.finalAnteEl = document.getElementById('final-ante');
    this.finalScoreEl = document.getElementById('final-score');
    this.restartRunBtn = document.getElementById('restart-run-btn');

    // Audio Engine state
    this.audioCtx = null;
    this.soundEnabled = true;

    // Start background spiral shader & event bindings
    this.initBgShader();
    this.bindEvents();
  }

  /**
   * Sound engine using procedural Web Audio synthesis
   */
  playSound(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      switch (type) {
        case 'card_select':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(1040, now + 0.09);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
          osc.start(now);
          osc.stop(now + 0.09);
          break;

        case 'card_deselect':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(680, now);
          osc.frequency.exponentialRampToValueAtTime(340, now + 0.08);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case 'card_slide':
        case 'card_drag':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
          osc.start(now);
          osc.stop(now + 0.07);
          break;

        case 'chip_add':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(640, now);
          osc.frequency.exponentialRampToValueAtTime(1100, now + 0.1);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'mult_add':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(560, now + 0.13);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
          osc.start(now);
          osc.stop(now + 0.13);
          break;

        case 'mult_x':
          osc.type = 'square';
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(720, now + 0.22);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
          break;

        case 'hand_slam':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);
          gain.gain.setValueAtTime(0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
          break;

        case 'cash':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(987.77, now);
          osc.frequency.setValueAtTime(1318.51, now + 0.09);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
          osc.start(now);
          osc.stop(now + 0.32);
          break;

        case 'win':
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const chordOsc = this.audioCtx.createOscillator();
            const chordGain = this.audioCtx.createGain();
            chordOsc.type = 'triangle';
            chordOsc.frequency.setValueAtTime(freq, now + i * 0.08);
            chordGain.gain.setValueAtTime(0.18, now + i * 0.08);
            chordGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.4);
            chordOsc.connect(chordGain);
            chordGain.connect(this.audioCtx.destination);
            chordOsc.start(now + i * 0.08);
            chordOsc.stop(now + i * 0.08 + 0.4);
          });
          break;

        case 'game_over':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.65);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
          osc.start(now);
          osc.stop(now + 0.65);
          break;
      }
    } catch (err) {
      // AudioContext policy
    }
  }

  /**
   * Liquid Golden Satin / Silk Waves Shader Canvas
   * Recreates the authentic shimmering molten gold / yellow satin fabric seen in Balatro
   */
  initBgShader() {
    if (!this.bgCanvas) return;
    const canvas = this.bgCanvas;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Try WebGL for authentic 60fps liquid metallic satin ripples
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false }) || canvas.getContext('experimental-webgl');
    if (gl) {
      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });

      const vsSource = `
        attribute vec2 a_pos;
        void main() {
          gl_Position = vec4(a_pos, 0.0, 1.0);
        }
      `;
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

          // Vortex swirl
          float twist = a + r * 1.9 - u_time * 0.15;
          vec2 p = vec2(cos(twist) * r, sin(twist) * r) * 3.4;

          // Domain-warped silky satin folds
          float t = u_time * 0.26;
          for (int i = 1; i <= 4; i++) {
            float fi = float(i);
            p += vec2(
              sin(p.y * 1.8 + t * 0.45 + fi * 1.2) * 0.42,
              cos(p.x * 1.8 - t * 0.55 + fi * 1.1) * 0.42
            );
          }

          // Liquid satin ripple waves
          float wave1 = sin(p.x * 2.7 + sin(p.y * 3.2 + t * 0.7));
          float wave2 = cos(p.y * 2.9 - sin(p.x * 2.4 + t * 0.5));
          float satin = 0.5 + 0.5 * (wave1 * 0.6 + wave2 * 0.4);

          // Specular metallic sheen along silky fold ridges
          float spec1 = pow(clamp(sin(p.x * 4.2 + p.y * 3.6 + t * 0.9), 0.0, 1.0), 3.5);
          float spec2 = pow(clamp(cos(p.x * 3.1 - p.y * 3.9 - t * 0.6), 0.0, 1.0), 5.5);

          vec3 col = mix(u_cDark, u_cMid, clamp(satin * 1.35, 0.0, 1.0));
          col = mix(col, u_cGold, clamp(satin * satin * 1.5, 0.0, 1.0));
          col += u_cHigh * (spec1 * 0.75 + spec2 * 0.65);

          // Subtle edge vignette
          col *= clamp(1.15 - r * 0.38, 0.45, 1.0);

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
      if (vs && fs) {
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

        let curDark = [0.18, 0.11, 0.02];
        let curMid = [0.58, 0.41, 0.08];
        let curGold = [0.89, 0.69, 0.16];
        let curHigh = [1.0, 0.95, 0.64];

        let startTime = performance.now();
        const renderLoop = (now) => {
          const elapsed = (now - startTime) * 0.001;
          gl.viewport(0, 0, width, height);
          gl.uniform2f(resUniform, width, height);
          gl.uniform1f(timeUniform, elapsed);

          // Get calm color palette based on current Ante level
          const anteIdx = Math.max(0, Math.min(ANTE_COLOR_PALETTES.length - 1, (this.game.ante || 1) - 1));
          const target = ANTE_COLOR_PALETTES[anteIdx];

          // Smooth lerp transition
          for (let c = 0; c < 3; c++) {
            curDark[c] += (target.dark[c] - curDark[c]) * 0.05;
            curMid[c] += (target.mid[c] - curMid[c]) * 0.05;
            curGold[c] += (target.gold[c] - curGold[c]) * 0.05;
            curHigh[c] += (target.high[c] - curHigh[c]) * 0.05;
          }

          gl.uniform3f(cDarkUniform, curDark[0], curDark[1], curDark[2]);
          gl.uniform3f(cMidUniform, curMid[0], curMid[1], curMid[2]);
          gl.uniform3f(cGoldUniform, curGold[0], curGold[1], curGold[2]);
          gl.uniform3f(cHighUniform, curHigh[0], curHigh[1], curHigh[2]);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
          requestAnimationFrame(renderLoop);
        };
        requestAnimationFrame(renderLoop);
        return;
      }
    }

    // 2D Canvas Fallback
    const ctx = canvas.getContext('2d');
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let time = 0;
    const renderGoldLiquid = () => {
      time += 0.015;

      const anteIdx = Math.max(0, Math.min(ANTE_COLOR_PALETTES.length - 1, (this.game.ante || 1) - 1));
      const target = ANTE_COLOR_PALETTES[anteIdx];
      const baseHue = target.hue2d;

      const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, Math.hypot(width, height) * 0.75);
      bgGrad.addColorStop(0, `hsla(${baseHue}, 70%, 15%, 1)`);
      bgGrad.addColorStop(0.5, `hsla(${baseHue}, 80%, 7%, 1)`);
      bgGrad.addColorStop(1, '#050505');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const maxR = Math.hypot(width, height) * 0.85;

      const bands = 14;
      for (let b = 0; b < bands; b++) {
        const yBase = (b / bands) * height * 1.3 - height * 0.15;
        ctx.beginPath();
        for (let x = 0; x <= width + 20; x += 20) {
          const wave1 = Math.sin(x * 0.003 + time * 0.7 + b * 0.5) * 55;
          const wave2 = Math.cos(x * 0.006 - time * 0.4 + b * 0.4) * 28;
          const y = yBase + wave1 + wave2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const goldHue = baseHue + Math.sin(time * 0.4 + b) * 4;
        const lightness = 20 + (b % 2 === 0 ? 14 : 5) + Math.sin(time + b) * 5;
        ctx.fillStyle = `hsla(${goldHue}, 85%, ${lightness}%, 0.35)`;
        ctx.fill();
      }

      const spiralArms = 8;
      for (let arm = 0; arm < spiralArms; arm++) {
        const armAngle = (arm / spiralArms) * Math.PI * 2 + time * 0.45;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        const steps = 30;
        for (let s = 0; s <= steps; s++) {
          const tFactor = s / steps;
          const r = tFactor * maxR;
          const angle = armAngle + Math.pow(tFactor, 0.7) * 3.8;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.lineWidth = 48 + Math.sin(time + arm) * 10;
        const goldHue = 40 + Math.sin(time * 0.3 + arm) * 4;
        const lightness = 26 + (arm % 2 === 0 ? 14 : 0);
        ctx.strokeStyle = `hsla(${goldHue}, 92%, ${lightness}%, 0.28)`;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(renderGoldLiquid);
    };
    renderGoldLiquid();
  }

  /**
   * Bind DOM Events
   */
  bindEvents() {
    this.playBtn.addEventListener('click', () => {
      this.game.playSelected();
    });

    this.discardBtn.addEventListener('click', () => {
      this.game.discardSelected();
      this.playSound('card_slide');
    });

    this.sortRankBtn.addEventListener('click', () => {
      this.game.sortHandByRank();
      this.playSound('card_slide');
    });

    this.sortSuitBtn.addEventListener('click', () => {
      this.game.sortHandBySuit();
      this.playSound('card_slide');
    });

    if (this.skipBlindBtn) {
      this.skipBlindBtn.addEventListener('click', () => {
        if (this.game.skipCurrentBlind()) {
          this.playSound('card_slide');
          this.render();
          // Give brief moment then open shop
          setTimeout(() => {
            this.renderShop();
          }, 300);
        }
      });
    }

    this.soundToggleBtn.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      this.soundStateLabel.textContent = this.soundEnabled ? 'ON 🔊' : 'OFF 🔇';
    });

    this.runInfoBtn.addEventListener('click', () => {
      this.showRunInfo();
    });

    this.closeRunInfoBtn.addEventListener('click', () => {
      this.runInfoModal.classList.add('hidden');
    });

    this.rerollBtn.addEventListener('click', () => {
      const res = this.game.rerollShop();
      if (res.success) {
        this.playSound('card_slide');
        this.renderShop();
      }
    });

    this.nextRoundBtn.addEventListener('click', () => {
      this.shopModal.classList.add('hidden');
      this.playSound('card_slide');
      this.game.startNextRoundFromShop();
      this.render();
    });

    this.skipPackBtn.addEventListener('click', () => {
      this.game.skipPack();
      this.packOverlay.classList.add('hidden');
      this.playSound('card_slide');
      this.render();
      this.renderShop();
    });

    this.restartRunBtn.addEventListener('click', () => {
      this.gameOverModal.classList.add('hidden');
      this.game.startNewRun();
    });

    // Blind Select Stage "Select" buttons
    this.blindSelectBtns.forEach((btn, index) => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.game.blindIndex === index) {
            this.game.selectActiveBlind();
            this.playSound('card_slide');
            this.render();
          }
        });
      }
    });

    // Blind Select Stage "Skip Blind" buttons
    this.blindSkipBtns.forEach((btn, index) => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.game.blindIndex === index) {
            if (this.game.skipCurrentBlind()) {
              this.playSound('cash');
              this.render();
            }
          }
        });
      }
    });
  }

  /**
   * Full game HUD & Card layout update
   */
  render() {
    this.renderHUD();
    this.renderJokers();
    this.renderConsumables();

    if (this.game.state === GAME_STATES.BLIND_SELECT) {
      if (this.blindSelectStage) this.blindSelectStage.classList.remove('hidden');
      if (this.playArena) this.playArena.classList.add('hidden');
      if (this.blindSelectSidebarTitle) this.blindSelectSidebarTitle.classList.remove('hidden');
      if (this.blindCardEl) this.blindCardEl.classList.add('hidden');
      this.renderBlindSelectStage();
    } else {
      if (this.blindSelectStage) this.blindSelectStage.classList.add('hidden');
      if (this.playArena) this.playArena.classList.remove('hidden');
      if (this.blindSelectSidebarTitle) this.blindSelectSidebarTitle.classList.add('hidden');
      if (this.blindCardEl) this.blindCardEl.classList.remove('hidden');
      this.renderHand();
      this.renderPreviewBanner();
      this.updateActionButtons();
    }
  }

  renderBlindSelectStage() {
    if (!this.game.anteBlinds || this.game.anteBlinds.length < 3) return;

    if (this.blindDeckCounter) {
      const totalDeckCards = this.game.deck.length + this.game.discardPile.length + this.game.hand.length;
      this.blindDeckCounter.textContent = `${this.game.deck.length}/${totalDeckCards}`;
    }

    this.game.anteBlinds.forEach((blind, i) => {
      const col = this.blindCols[i];
      const selectBtn = this.blindSelectBtns[i];
      const scoreTarget = this.blindScoreTargets[i];
      const rewardLabel = this.blindRewardLabels[i];
      const titleEl = this.blindTitles[i];

      if (scoreTarget) scoreTarget.textContent = blind.target.toLocaleString();
      if (rewardLabel) rewardLabel.textContent = blind.reward;
      if (titleEl) titleEl.textContent = blind.name;

      if (i === 2 && this.blindBossDesc && blind.desc) {
        this.blindBossDesc.textContent = blind.desc;
      }

      if (i < 2 && this.blindTagIcons[i] && blind.tag) {
        this.blindTagIcons[i].textContent = blind.tag.icon || '🏷️';
        this.blindTagIcons[i].title = `${blind.tag.name}: ${blind.tag.desc}`;
      }

      const isActive = this.game.blindIndex === i && this.game.state === GAME_STATES.BLIND_SELECT;
      const isPast = this.game.blindIndex > i;

      if (selectBtn) {
        if (isActive) {
          selectBtn.disabled = false;
          selectBtn.textContent = 'Select';
          selectBtn.className = 'w-full py-2 bg-[#f39c12] hover:bg-[#e67e22] text-slate-950 font-black text-sm uppercase rounded-xl border-2 border-amber-200 shadow-md active:scale-95 transition cursor-pointer';
        } else if (isPast) {
          selectBtn.disabled = true;
          selectBtn.textContent = blind.status === 'skipped' ? 'Skipped' : 'Defeated';
          selectBtn.className = 'w-full py-2 bg-slate-800 text-slate-500 font-black text-sm uppercase rounded-xl border border-slate-700 cursor-not-allowed';
        } else {
          selectBtn.disabled = true;
          selectBtn.textContent = 'Upcoming';
          selectBtn.className = 'w-full py-2 bg-slate-700 text-slate-400 font-black text-sm uppercase rounded-xl border border-slate-600 cursor-not-allowed';
        }
      }

      if (i < 2 && this.blindSkipBtns[i]) {
        const skipBtn = this.blindSkipBtns[i];
        if (isActive) {
          skipBtn.disabled = false;
          skipBtn.className = 'flex-1 py-2.5 bg-[#fe5f55] hover:bg-[#e0453b] text-white font-black text-xs uppercase rounded-xl border border-red-300 shadow active:scale-95 transition cursor-pointer';
        } else {
          skipBtn.disabled = true;
          skipBtn.className = 'flex-1 py-2.5 bg-slate-800 text-slate-600 font-black text-xs uppercase rounded-xl border border-slate-700 cursor-not-allowed';
        }
      }

      if (col) {
        if (isActive) {
          col.style.opacity = '1';
          if (i === 0) col.style.borderColor = '#009dff';
          else if (i === 1) col.style.borderColor = '#f39c12';
          else col.style.borderColor = '#fe5f55';
        } else if (isPast) {
          col.style.opacity = '0.45';
          col.style.borderColor = '#334155';
        } else {
          col.style.opacity = '0.75';
          col.style.borderColor = '#475569';
        }
      }
    });
  }

  renderHUD() {
    // Blind card
    const isBoss = this.game.blindType === BLIND_TYPES.BOSS;
    this.blindNameEl.textContent = isBoss && this.game.activeBoss ? this.game.activeBoss.name : this.game.blindType;
    this.blindConditionEl.textContent = isBoss && this.game.activeBoss ? this.game.activeBoss.desc : 'Score to beat this blind';
    this.blindRewardEl.textContent = isBoss ? '$$$$$' : (this.game.blindIndex === 1 ? '$$$$' : '$$$');
    this.anteCounterEl.textContent = `Ante ${this.game.ante}/${this.game.maxAnte}`;

    this.targetScoreEl.textContent = this.game.roundTarget.toLocaleString();
    this.currentScoreEl.textContent = this.game.roundScore.toLocaleString();
    this.handsLeftEl.textContent = this.game.handsLeft;
    this.discardsLeftEl.textContent = this.game.discardsLeft;
    this.moneyDisplayEl.textContent = this.game.money;
    this.anteSubEl.textContent = this.game.ante;
    this.roundSubEl.textContent = (this.game.ante - 1) * 3 + (this.game.blindIndex + 1);

    const totalDeckCards = this.game.deck.length + this.game.discardPile.length + this.game.hand.length;
    this.deckCounterEl.textContent = `${this.game.deck.length}/${totalDeckCards}`;

    // Interest Bar logic: +1 per $5 held, capping at $50 (max +$10 interest)
    const interestInfo = this.game.getInterestInfo();
    if (this.interestCurrentVal) {
      this.interestCurrentVal.textContent = `+$${interestInfo.currentInterest} / +$10`;
      if (this.interestBarFill) {
        this.interestBarFill.style.width = `${Math.min(100, Math.max(5, interestInfo.percent))}%`;
      }
      if (this.interestMoneyNum) {
        this.interestMoneyNum.textContent = this.game.money;
      }
      if (this.interestNextNum) {
        this.interestNextNum.textContent = interestInfo.currentInterest >= 10 ? 'MAX CAP ($10)' : `Next +$1 at $${interestInfo.nextThreshold}`;
      }
    }

    // Skip Blind Button (disabled on Boss Blinds or outside selecting phase)
    if (this.skipBlindBtn) {
      const isBoss = this.game.blindType === BLIND_TYPES.BOSS;
      this.skipBlindBtn.disabled = isBoss || this.game.state !== GAME_STATES.SELECTING;
      this.skipBlindBtn.textContent = isBoss ? 'Boss Blind (Cannot Skip)' : 'Skip Blind (Earn $0)';
    }
  }

  /**
   * Zone A.1: Jokers Bar (Top Middle)
   */
  renderJokers() {
    const jokers = this.game.jokerSystem.getJokers();
    this.jokerCountEl.textContent = `${jokers.length} / ${this.game.jokerSystem.maxJokers}`;
    this.jokersContainer.innerHTML = '';

    jokers.forEach((joker, index) => {
      const card = document.createElement('div');
      card.className = `joker-card joker-rarity-${joker.rarity} ${joker.edition && joker.edition !== 'normal' ? 'edition-' + joker.edition : ''}`;
      card.id = `joker-dom-${joker.instanceId || joker.id}`;
      card.title = `${joker.name}: ${joker.description} (Sell: $${joker.sellValue})`;

      card.innerHTML = `
        <div class="text-[9px] font-black uppercase text-amber-200 tracking-wider truncate w-full text-center">
          ${joker.name}
        </div>
        <div class="text-3xl sm:text-4xl my-auto">${joker.icon}</div>
        <div class="w-full flex justify-between items-center text-[10px] px-1 font-bold">
          <span class="text-amber-400 font-pixel text-sm">$${joker.sellValue}</span>
          <button class="sell-joker-btn text-red-400 hover:text-red-200 font-black px-1" data-index="${index}">Sell</button>
        </div>
      `;

      card.querySelector('.sell-joker-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.sellJoker(index);
        this.playSound('cash');
        this.render();
      });

      this.jokersContainer.appendChild(card);
    });
  }

  /**
   * Zone A.2: Consumables Bar (Top Right)
   */
  renderConsumables() {
    const items = this.game.consumableSystem.getItems();
    this.consumableCountEl.textContent = `${items.length} / ${this.game.consumableSystem.maxSlots}`;
    this.consumablesContainer.innerHTML = '';

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `consumable-card consumable-type-${item.type.toLowerCase()}`;
      card.title = `${item.name} (${item.type}): ${item.description}`;

      card.innerHTML = `
        <div class="text-[9px] font-black uppercase text-cyan-200 tracking-wider truncate w-full text-center">
          ${item.name}
        </div>
        <div class="text-3xl sm:text-4xl my-auto">${item.icon}</div>
        <div class="w-full flex justify-between items-center text-[9px] px-0.5 font-bold">
          <button class="use-consumable-btn bg-cyan-600 hover:bg-cyan-500 text-white rounded px-1.5 py-0.5 text-[8px] font-black uppercase">Use</button>
          <button class="sell-consumable-btn text-amber-400 hover:text-amber-200 text-[8px] font-black">$${item.sellValue || 1}</button>
        </div>
      `;

      card.querySelector('.use-consumable-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const res = this.game.useConsumable(index);
        if (res.success) {
          this.playSound('win');
          this.render();
          if (this.game.state === GAME_STATES.SHOP) this.renderShop();
        } else {
          alert(res.message);
        }
      });

      card.querySelector('.sell-consumable-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.sellConsumable(index);
        this.playSound('cash');
        this.render();
      });

      this.consumablesContainer.appendChild(card);
    });
  }

  /**
   * Render player hand cards with authentic pips and lift animations
   */
  renderHand() {
    this.playerHandEl.innerHTML = '';
    const cards = this.game.hand;
    const total = cards.length;

    cards.forEach((card, i) => {
      const cardEl = document.createElement('div');
      cardEl.className = `playing-card suit-${card.suit}`;
      cardEl.dataset.cardId = card.id;
      cardEl.dataset.index = i;

      if (card.selected) cardEl.classList.add('card-selected');
      if (card.debuffed) cardEl.classList.add('card-debuffed');
      if (card.edition !== 'normal') cardEl.classList.add(`edition-${card.edition}`);
      if (card.enhancement !== 'none') cardEl.classList.add(`enhancement-${card.enhancement}`);

      // Smooth fan spread
      const offset = i - (total - 1) / 2;
      const rotation = offset * 2.2;
      const translateY = Math.abs(offset) * 2.5;

      if (!card.selected) {
        cardEl.style.transform = `rotate(${rotation}deg) translateY(${translateY}px)`;
      }

      const suitSymbol = card.getSuitSymbol();
      const pipsHtml = this.generateCardPipsHtml(card.rank, suitSymbol);

      cardEl.innerHTML = `
        <div class="flex items-center justify-between leading-none pointer-events-none">
          <div class="flex flex-col items-center">
            <span class="font-black text-sm sm:text-base font-sans">${card.rank}</span>
            <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
          </div>
          <span class="text-[9px] font-black text-slate-400 uppercase font-sans">${card.enhancement !== 'none' ? card.enhancement : ''}</span>
        </div>

        ${pipsHtml}

        <div class="flex items-center justify-between leading-none rotate-180 pointer-events-none">
          <div class="flex flex-col items-center">
            <span class="font-black text-sm sm:text-base font-sans">${card.rank}</span>
            <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
          </div>
        </div>
      `;

      this.playerHandEl.appendChild(cardEl);
    });
  }

  generateCardPipsHtml(rank, symbol) {
    if (['J', 'Q', 'K'].includes(rank)) {
      return `<div class="card-pips-container pips-face">
        <span>${rank}</span>
        <span class="text-sm opacity-60">👑</span>
      </div>`;
    }
    if (rank === 'A') {
      return `<div class="card-pips-container pips-1"><span>${symbol}</span></div>`;
    }

    const num = parseInt(rank, 10);
    if (num === 2) return `<div class="card-pips-container pips-2"><span>${symbol}</span><span>${symbol}</span></div>`;
    if (num === 3) return `<div class="card-pips-container pips-3"><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span></div>`;
    if (num === 4) return `<div class="card-pips-container pips-4"><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span></div>`;
    if (num === 5) return `<div class="card-pips-container pips-5"><span>${symbol}</span><span>${symbol}</span><span class="pip-center">${symbol}</span><span>${symbol}</span><span>${symbol}</span></div>`;
    if (num === 6) return `<div class="card-pips-container pips-6">${`<span>${symbol}</span>`.repeat(6)}</div>`;
    if (num === 7) return `<div class="card-pips-container pips-7"><span>${symbol}</span><span>${symbol}</span><span class="pip-center">${symbol}</span><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span></div>`;
    if (num === 8) return `<div class="card-pips-container pips-8">${`<span>${symbol}</span>`.repeat(8)}</div>`;
    if (num === 9) return `<div class="card-pips-container pips-9"><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span><span class="pip-center">${symbol}</span><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span><span>${symbol}</span></div>`;
    if (num === 10) return `<div class="card-pips-container pips-10">${`<span>${symbol}</span>`.repeat(10)}</div>`;
    return `<div class="card-pips-container pips-1"><span>${symbol}</span></div>`;
  }

  renderPreviewBanner() {
    const selected = this.game.getSelectedCards();
    if (selected.length === 0) {
      this.previewHandName.textContent = 'Select Cards';
      this.previewHandLevel.textContent = 'lvl. 1';
      this.previewChipsBox.textContent = '0';
      this.previewMultBox.textContent = '0';
      return;
    }

    const preview = ScoringEngine.preview(
      selected,
      this.game.jokerSystem.getJokers(),
      this.game.handLevels,
      {
        discardsLeft: this.game.discardsLeft,
        handsLeft: this.game.handsLeft,
        money: this.game.money
      }
    );

    this.previewHandName.textContent = preview.handName;
    this.previewHandLevel.textContent = `lvl. ${preview.level || 1}`;
    this.previewChipsBox.textContent = preview.chips;
    this.previewMultBox.textContent = preview.mult;
  }

  updateActionButtons() {
    const selected = this.game.getSelectedCards();
    const count = selected.length;
    const canPlay = count >= 1 && count <= 5 && this.game.handsLeft > 0 && this.game.state === GAME_STATES.SELECTING;
    const canDiscard = count >= 1 && count <= 5 && this.game.discardsLeft > 0 && this.game.state === GAME_STATES.SELECTING;

    this.playBtn.disabled = !canPlay;
    this.discardBtn.disabled = !canDiscard;
    this.playCountEl.textContent = count;
    this.discardCountEl.textContent = count;
  }

  /**
   * Animated Scoring Sequence Execution
   */
  async playScoringSequence(scoringResult, playedCards) {
    this.playedCardsStage.innerHTML = '';
    playedCards.forEach((c) => {
      const clone = document.createElement('div');
      clone.className = `playing-card suit-${c.suit} card-selected`;
      clone.id = `stage-card-${c.id}`;
      clone.innerHTML = `
        <div class="flex items-center justify-between leading-none">
          <div class="flex flex-col items-center">
            <span class="font-black text-sm">${c.rank}</span>
            <span class="text-xs">${c.getSuitSymbol()}</span>
          </div>
        </div>
        ${this.generateCardPipsHtml(c.rank, c.getSuitSymbol())}
        <div class="flex items-center justify-between leading-none rotate-180">
          <div class="flex flex-col items-center">
            <span class="font-black text-sm">${c.rank}</span>
            <span class="text-xs">${c.getSuitSymbol()}</span>
          </div>
        </div>
      `;
      this.playedCardsStage.appendChild(clone);
    });

    this.scoringStage.classList.remove('hidden');
    this.scoringBoard.classList.remove('opacity-0', 'scale-95');
    this.scoringBoard.classList.add('opacity-100', 'scale-100');

    this.scoringHandTitle.textContent = `${scoringResult.evaluation.handName} (Lv. ${scoringResult.evaluation.level})`;
    this.tallyChips.textContent = scoringResult.evaluation.baseChips;
    this.tallyMult.textContent = scoringResult.evaluation.baseMult;
    this.tallyTotal.textContent = (scoringResult.evaluation.baseChips * scoringResult.evaluation.baseMult).toLocaleString();

    this.playSound('hand_slam');
    await this.wait(400);

    let tallyChipsVal = scoringResult.evaluation.baseChips;
    let tallyMultVal = scoringResult.evaluation.baseMult;

    for (const step of scoringResult.steps) {
      if (step.type === 'INIT_HAND') continue;

      if (step.type === 'CARD_CHIPS' || step.type === 'CARD_ENHANCEMENT' || step.type === 'CARD_EDITION') {
        const stageCard = document.getElementById(`stage-card-${step.cardId}`);
        if (stageCard) stageCard.classList.add('card-scoring');

        if (step.chipsAdded) {
          tallyChipsVal = step.currentChips;
          this.tallyChips.textContent = tallyChipsVal;
          this.spawnParticle(stageCard, `+${step.chipsAdded}`, '#009dff');
          this.playSound('chip_add');
        }
        if (step.multAdded) {
          tallyMultVal = step.currentMult;
          this.tallyMult.textContent = tallyMultVal;
          this.spawnParticle(stageCard, `+${step.multAdded} Mult`, '#fe5f55');
          this.playSound('mult_add');
        }
        if (step.multMultiplier) {
          tallyMultVal = step.currentMult;
          this.tallyMult.textContent = tallyMultVal;
          this.spawnParticle(stageCard, `×${step.multMultiplier}`, '#fe5f55');
          this.playSound('mult_x');
        }

        this.tallyTotal.textContent = (tallyChipsVal * tallyMultVal).toLocaleString();
        // Pause period to emphasize card scoring
        await this.wait(480);
        if (stageCard) stageCard.classList.remove('card-scoring');
        await this.wait(140);
      }

      if (step.type === 'JOKER_TRIGGER' || step.type === 'JOKER_CARD_TRIGGER') {
        const jokerEl = document.getElementById(`joker-dom-${step.jokerId}`);
        if (jokerEl) jokerEl.classList.add('joker-active');

        this.jokerTriggerBanner.textContent = step.message || 'Again!';
        this.jokerTriggerBanner.classList.remove('opacity-0');
        setTimeout(() => this.jokerTriggerBanner.classList.add('opacity-0'), 700);

        tallyChipsVal = step.currentChips;
        tallyMultVal = step.currentMult;
        this.tallyChips.textContent = tallyChipsVal;
        this.tallyMult.textContent = tallyMultVal;
        this.tallyTotal.textContent = (tallyChipsVal * tallyMultVal).toLocaleString();

        if (step.mod && step.mod.multMultiplier) {
          this.playSound('mult_x');
        } else if (step.mod && step.mod.mult) {
          this.playSound('mult_add');
        } else {
          this.playSound('chip_add');
        }

        // Pause period for each Joker activation
        await this.wait(540);
        if (jokerEl) jokerEl.classList.remove('joker-active');
        await this.wait(180);
      }
    }

    this.playSound('cash');
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 320);

    // Final pause period before board dissolves
    await this.wait(750);

    this.scoringBoard.classList.remove('opacity-100', 'scale-100');
    this.scoringBoard.classList.add('opacity-0', 'scale-95');
    this.scoringStage.classList.add('hidden');
    this.playedCardsStage.innerHTML = '';

    this.game.commitScoredPoints(scoringResult.finalScore);
  }

  spawnParticle(targetEl, text, color = '#f0b02f') {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const particle = document.createElement('div');
    particle.className = 'score-particle';
    particle.textContent = text;
    particle.style.color = color;
    particle.style.left = `${rect.left + rect.width / 2 - 25}px`;
    particle.style.top = `${rect.top - 12}px`;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 850);
  }

  showRunInfo() {
    this.handLevelsList.innerHTML = '';
    const hands = Object.entries(HAND_DEFINITIONS);

    hands.forEach(([name, def]) => {
      const level = this.game.handLevels[name] || 1;
      const chips = def.baseChips + (level - 1) * def.levelChips;
      const mult = def.baseMult + (level - 1) * def.levelMult;

      const row = document.createElement('div');
      row.className = 'bg-black/60 border border-[#4a391e] rounded-xl p-3 flex justify-between items-center';
      row.innerHTML = `
        <div class="flex flex-col">
          <span class="font-pixel text-xl text-amber-300">${name}</span>
          <span class="text-[11px] text-slate-400 font-bold">${def.description}</span>
        </div>
        <div class="flex items-center gap-3 font-pixel text-2xl">
          <span class="text-xs font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Lv. ${level}</span>
          <span class="text-[#009dff]">${chips}</span>
          <span class="text-white text-sm">✕</span>
          <span class="text-[#fe5f55]">${mult}</span>
        </div>
      `;
      this.handLevelsList.appendChild(row);
    });

    this.runInfoModal.classList.remove('hidden');
  }

  /**
   * ZONE B: Main Shop Area Rendering (Exact Balatro Look)
   */
  renderShop() {
    this.shopMoneyEl.textContent = this.game.money;
    this.shopAnteIndicator.textContent = this.game.ante;
    this.rerollCostEl.textContent = this.game.shopEngine.rerollCost;

    // 1. Top Shelf: Card Shelf (2 buyable cards: Jokers, Tarots, Planets)
    this.shopCardsShelf.innerHTML = '';
    this.game.shopEngine.shopCards.forEach((item, index) => {
      const cardEl = document.createElement('div');
      const cost = item.finalCost || item.cost;
      const canAfford = this.game.money >= cost;
      const isJoker = item.category === 'joker';
      const isFull = isJoker
        ? this.game.jokerSystem.count >= this.game.jokerSystem.maxJokers
        : this.game.consumableSystem.count >= this.game.consumableSystem.maxSlots;

      cardEl.className = 'bg-black/75 border-2 border-[#524128] hover:border-amber-400 p-3 rounded-2xl flex flex-col justify-between items-center text-center transition shadow-lg relative';
      
      cardEl.innerHTML = `
        <div class="flex justify-between w-full items-center text-[10px] font-black uppercase text-amber-300">
          <span>${item.type || item.rarity}</span>
          ${item.edition && item.edition !== 'normal' ? `<span class="text-purple-400">${item.edition}</span>` : ''}
        </div>
        <div class="text-4xl my-1">${item.icon}</div>
        <div class="font-bold text-sm text-slate-100">${item.name}</div>
        <p class="text-[11px] text-amber-200/80 leading-tight my-1 font-medium">${item.description}</p>
        <button class="buy-card-btn w-full py-2 bg-[#f0ad28] hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase rounded-xl transition active:scale-95" ${!canAfford || isFull ? 'disabled' : ''}>
          Buy ($${cost})
        </button>
      `;

      cardEl.querySelector('.buy-card-btn').addEventListener('click', () => {
        const res = this.game.buyShopCard(index);
        if (res.success) {
          this.playSound('cash');
          this.render();
          this.renderShop();
        } else {
          alert(res.message);
        }
      });

      this.shopCardsShelf.appendChild(cardEl);
    });

    // 2. Bottom Left Shelf: Booster Packs (2 Booster Packs)
    this.shopPacksShelf.innerHTML = '';
    this.game.shopEngine.boosterPacks.forEach((pack, index) => {
      const packEl = document.createElement('div');
      const cost = pack.finalCost || pack.cost;
      const canAfford = this.game.money >= cost;

      packEl.className = 'booster-pack-card';
      packEl.innerHTML = `
        <span class="text-[10px] font-black uppercase tracking-wider text-amber-300">Booster Pack</span>
        <div class="text-4xl my-1">${pack.icon}</div>
        <div class="font-bold text-sm text-amber-100 text-center">${pack.name}</div>
        <p class="text-[10px] text-amber-200/80 text-center leading-tight">${pack.description}</p>
        <button class="buy-pack-btn w-full py-2 bg-[#009dff] hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase rounded-xl transition active:scale-95 border border-blue-200" ${!canAfford ? 'disabled' : ''}>
          Open ($${cost})
        </button>
      `;

      packEl.querySelector('.buy-pack-btn').addEventListener('click', () => {
        const res = this.game.buyBoosterPack(index);
        if (res.success) {
          this.playSound('win');
          this.render();
          this.renderShop();
          this.showPackOpeningOverlay(res);
        }
      });

      this.shopPacksShelf.appendChild(packEl);
    });

    // 3. Bottom Right Shelf: Voucher Slot (1 active Voucher per Ante)
    this.shopVoucherSlot.innerHTML = '';
    const voucher = this.game.shopEngine.currentVoucher;
    if (voucher) {
      const cost = voucher.finalCost || voucher.cost;
      const canAfford = this.game.money >= cost;

      const voucherEl = document.createElement('div');
      voucherEl.className = 'bg-black/80 border-2 border-amber-500 rounded-2xl p-3 flex flex-col justify-between items-center text-center shadow-lg w-full h-full';
      voucherEl.innerHTML = `
        <span class="text-[10px] font-black uppercase text-amber-300">Voucher</span>
        <div class="text-4xl my-1">${voucher.icon}</div>
        <div class="font-bold text-sm text-slate-100">${voucher.name}</div>
        <p class="text-[11px] text-amber-200/80 leading-tight">${voucher.description}</p>
        <button class="buy-voucher-btn w-full py-2 bg-[#f0ad28] hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase rounded-xl transition active:scale-95" ${!canAfford ? 'disabled' : ''}>
          Buy ($${cost})
        </button>
      `;

      voucherEl.querySelector('.buy-voucher-btn').addEventListener('click', () => {
        const res = this.game.buyVoucher();
        if (res.success) {
          this.playSound('cash');
          this.render();
          this.renderShop();
        }
      });

      this.shopVoucherSlot.appendChild(voucherEl);
    } else {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'bg-black/40 border-2 border-dashed border-[#4a391e] rounded-2xl p-4 flex flex-col items-center justify-center text-center text-slate-500 w-full h-full';
      emptyEl.innerHTML = `
        <span class="font-pixel text-2xl text-slate-600">SOLD OUT</span>
        <span class="text-[10px] font-bold text-slate-600 mt-1">Available next Ante</span>
      `;
      this.shopVoucherSlot.appendChild(emptyEl);
    }

    this.shopModal.classList.remove('hidden');
  }

  /**
   * ZONE C: Interactive Booster Pack Opening Overlay
   * Displays 10 cards face up to choose from with visible mutations, editions, and keep buttons!
   */
  showPackOpeningOverlay(packData) {
    this.packOverlayTitle.textContent = packData.pack.name.toUpperCase();
    this.packOverlaySubtitle.textContent = `Choose ${packData.choicesRemaining} of ${packData.cards.length} cards to keep in your deck`;
    this.packCardsContainer.innerHTML = '';

    packData.cards.forEach((item, index) => {
      const cardSlot = document.createElement('div');
      cardSlot.className = 'pack-card-slot min-w-[130px] max-w-[170px] w-full';

      if (item.category === 'playing_card') {
        const playingCard = document.createElement('div');
        playingCard.className = `playing-card suit-${item.suit}`;
        if (item.enhancement && item.enhancement !== 'none') {
          playingCard.classList.add(`enhancement-${item.enhancement}`);
        }
        if (item.edition && item.edition !== 'normal') {
          playingCard.classList.add(`edition-${item.edition}`);
        }

        const suitSymbol = item.getSuitSymbol();
        const pipsHtml = item.enhancement === 'stone'
          ? `<div class="card-pips-container pips-face flex items-center justify-center font-pixel text-4xl">🗿</div>`
          : this.generateCardPipsHtml(item.rank, suitSymbol);

        playingCard.innerHTML = `
          <div class="flex items-center justify-between leading-none pointer-events-none">
            <div class="flex flex-col items-center">
              <span class="font-black text-sm sm:text-base font-sans">${item.rank}</span>
              <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
            </div>
            <span class="text-[9px] font-black text-slate-400 uppercase font-sans">${item.enhancement !== 'none' ? item.enhancement : ''}</span>
          </div>

          ${pipsHtml}

          <div class="flex items-center justify-between leading-none rotate-180 pointer-events-none">
            <div class="flex flex-col items-center">
              <span class="font-black text-sm sm:text-base font-sans">${item.rank}</span>
              <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
            </div>
          </div>
        `;

        // Enhancement / Mutation badge & Edition Badge
        let badgeHtml = '';
        if (item.enhancement && item.enhancement !== 'none' && ENHANCEMENT_LABELS[item.enhancement]) {
          const enh = ENHANCEMENT_LABELS[item.enhancement];
          badgeHtml += `<span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full text-white shadow-sm font-sans" style="background-color: ${enh.color};">${enh.name}: ${enh.badge}</span>`;
        }
        if (item.edition && item.edition !== 'normal') {
          const edNames = { foil: 'FOIL (+50 Chips)', holo: 'HOLO (+10 Mult)', polychrome: 'POLY (×1.5 Mult)' };
          badgeHtml += `<span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-700 text-purple-200 border border-purple-400 font-sans shadow">${edNames[item.edition] || item.edition}</span>`;
        }

        cardSlot.innerHTML = `
          <div class="text-[10px] font-black uppercase text-amber-300">Playing Card</div>
        `;
        cardSlot.appendChild(playingCard);

        const badgeWrapper = document.createElement('div');
        badgeWrapper.className = 'flex flex-col gap-1 items-center w-full min-h-[20px]';
        badgeWrapper.innerHTML = badgeHtml;
        cardSlot.appendChild(badgeWrapper);

        const keepBtn = document.createElement('button');
        keepBtn.className = 'w-full py-2 bg-[#009dff] hover:bg-blue-400 text-white font-black text-xs uppercase rounded-xl border border-blue-200 shadow-lg active:scale-95 transition';
        keepBtn.textContent = 'Keep Card';
        cardSlot.appendChild(keepBtn);
      } else if (item.category === 'consumable') {
        cardSlot.innerHTML = `
          <div class="text-[10px] font-black uppercase text-purple-300">${item.type || 'Tarot'} Mutation</div>
          <div class="consumable-card consumable-type-${item.type ? item.type.toLowerCase() : 'tarot'} my-1 pointer-events-none">
            <div class="text-[9px] font-black uppercase text-cyan-200 tracking-wider truncate w-full text-center">${item.name}</div>
            <div class="text-4xl my-auto">${item.icon}</div>
          </div>
          <div class="font-bold text-xs text-slate-100 text-center leading-tight">${item.name}</div>
          <p class="text-[10px] text-amber-200/90 leading-tight text-center px-1 my-0.5 min-h-[28px]">${item.description}</p>
          <button class="w-full py-2 bg-[#9333ea] hover:bg-purple-500 text-white font-black text-xs uppercase rounded-xl border border-purple-300 shadow-lg active:scale-95 transition">Keep Tarot</button>
        `;
      } else {
        cardSlot.innerHTML = `
          <div class="text-[10px] font-black uppercase text-amber-300">${item.rarity || 'Item'}</div>
          <div class="text-4xl my-2">${item.icon}</div>
          <div class="font-bold text-xs text-slate-100 text-center leading-tight">${item.name}</div>
          <p class="text-[10px] text-amber-200/90 leading-tight text-center px-1 my-0.5 min-h-[28px]">${item.description}</p>
          <button class="w-full py-2 bg-[#f0ad28] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl border border-amber-200 shadow-lg active:scale-95 transition">Pick Item</button>
        `;
      }

      cardSlot.addEventListener('click', () => {
        const pickRes = this.game.pickPackCard(index);
        if (pickRes.success) {
          this.playSound('win');
          this.render();
          if (pickRes.packFinished) {
            this.packOverlay.classList.add('hidden');
            this.renderShop();
          } else {
            // Re-render remaining picks
            this.showPackOpeningOverlay({
              pack: packData.pack,
              cards: this.game.shopEngine.packCards,
              choicesRemaining: pickRes.choicesRemaining
            });
          }
        } else {
          alert(pickRes.message);
        }
      });

      this.packCardsContainer.appendChild(cardSlot);
    });

    this.packOverlay.classList.remove('hidden');
  }

  showGameOver(data) {
    this.gameOverTitle.textContent = 'GAME OVER';
    this.gameOverTitle.className = 'font-pixel text-6xl text-[#fe5f55] tracking-wider';
    this.gameOverMessage.textContent = `You reached Ante ${data.ante} but fell short of ${data.targetScore.toLocaleString()} chips.`;
    this.finalAnteEl.textContent = `Ante ${data.ante}`;
    this.finalScoreEl.textContent = data.finalScore.toLocaleString();
    this.gameOverModal.classList.remove('hidden');
    this.playSound('game_over');
  }

  showVictory() {
    this.gameOverTitle.textContent = 'VICTORY!';
    this.gameOverTitle.className = 'font-pixel text-6xl text-amber-400 tracking-wider';
    this.gameOverMessage.textContent = 'You conquered Ante 8 and defeated the Boss Blind!';
    this.finalAnteEl.textContent = 'Ante 8 Cleared!';
    this.finalScoreEl.textContent = this.game.roundScore.toLocaleString();
    this.gameOverModal.classList.remove('hidden');
    this.playSound('win');
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
