/**
 * Renderer.js
 * Visual presentation layer, procedural audio synthesizer (Web Audio API),
 * hypnotic golden spiral vortex shader, 3-zone Shop system, booster pack overlays,
 * and DOM orchestration.
 */

import { ScoringEngine } from '../game/ScoringEngine.js';
import { HAND_DEFINITIONS } from '../game/HandEvaluator.js';
import { GAME_STATES, BLIND_TYPES } from '../game/GameEngine.js';
import { CONSUMABLE_TYPES, TAROT_CARDS, PLANET_CARDS } from '../game/ConsumableSystem.js';
import { ENHANCEMENT_LABELS, EDITIONS, Card } from '../game/Card.js';
import { DECKS, STAKES } from '../game/DeckDefinitions.js';
import { unlockablesManager } from '../game/UnlockablesSystem.js';
import { ALL_150_JOKERS } from '../game/JokerDatabase.js';
import { VOUCHER_CATALOG } from '../game/ShopEngine.js';
import { tooltipRenderer } from './TooltipRenderer.js';
import { ShopUI } from './ShopUI.js';
import { saveManager } from '../game/SaveManager.js';
import { renderJokerCardFace, getJokerIllustrationHtml } from './JokerArtwork.js';
import { BackgroundRenderer } from './BackgroundRenderer.js';
import { GameOverScreen } from './GameOverScreen.js';
import { DeckViewer } from './DeckViewer.js';
import { stakeManager } from '../game/StakeManager.js';
import { challengeMode } from '../game/ChallengeMode.js';
import { MainMenu } from './MainMenu.js';
import { TitleScreenRenderer } from './TitleScreenRenderer.js';
import { RunInfoModal } from './RunInfoModal.js';
import { ShopBackgroundManager } from './ShopBackgroundManager.js';
import { TransitionAnimator } from './TransitionAnimator.js';
import { DeckAnimator } from './DeckAnimator.js';
import { CardRenderer } from './CardRenderer.js';

// Swirling red & deep sapphire satin vortex palette for Title Screen (matching Photo 1)
export const TITLE_COLOR_PALETTE = {
  dark: [0.20, 0.04, 0.06],
  mid: [0.55, 0.10, 0.14],
  gold: [0.12, 0.35, 0.70],
  high: [0.45, 0.80, 0.98],
  hue2d: 350
};

export const ANTE_COLOR_PALETTES = [
  // Ante 1: Calmed Warm Amber Ochre (subdued, not overly bright yellow)
  { dark: [0.08, 0.05, 0.01], mid: [0.26, 0.18, 0.05], gold: [0.46, 0.33, 0.08], high: [0.65, 0.50, 0.14], hue2d: 36 },
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

    // Victory Modal Elements (Ante 8 Boss Defeated & Endless Mode Choice)
    this.victoryModal = document.getElementById('victory-modal');
    this.victoryDeckName = document.getElementById('victory-deck-name');
    this.victoryStakeName = document.getElementById('victory-stake-name');
    this.victoryRoundScore = document.getElementById('victory-round-score');
    this.victoryCash = document.getElementById('victory-cash');
    this.victoryEndlessBtn = document.getElementById('victory-endless-btn');
    this.victoryEndBtn = document.getElementById('victory-end-btn');

    // Title Screen Elements (Matching Photo 1)
    this.titleScreen = document.getElementById('title-screen');
    this.appContainer = document.getElementById('app');
    this.titleContinueBtn = document.getElementById('title-continue-btn');
    this.titlePlayBtn = document.getElementById('title-play-btn');
    this.titleOptionsBtn = document.getElementById('title-options-btn');
    this.titleQuitBtn = document.getElementById('title-quit-btn');
    this.titleCollectionBtn = document.getElementById('title-collection-btn');

    // In-Run Pause & Options Modal Elements
    this.runOptionsBtn = document.getElementById('run-options-btn') || document.getElementById('sound-toggle');
    this.inRunOptionsModal = document.getElementById('in-run-options-modal');
    this.closeInRunOptionsBtn = document.getElementById('close-in-run-options-btn');
    this.inRunSaveLeaveBtn = document.getElementById('in-run-save-leave-btn');
    this.inRunResumeBtn = document.getElementById('in-run-resume-btn');
    this.inRunSoundBtn = document.getElementById('in-run-sound-btn');
    this.inRunSoundLabel = document.getElementById('in-run-sound-label');
    this.inRunCrtBtn = document.getElementById('in-run-crt-btn');
    this.inRunCrtLabel = document.getElementById('in-run-crt-label');
    this.inRunParticlesBtn = document.getElementById('in-run-particles-btn');
    this.inRunParticlesLabel = document.getElementById('in-run-particles-label');
    this.inRunAbandonBtn = document.getElementById('in-run-abandon-btn');

    // Main Menu Options / Settings Modal Elements
    this.optionsModal = document.getElementById('options-modal');
    this.closeOptionsModalBtn = document.getElementById('close-options-modal-btn');
    this.optSoundToggle = document.getElementById('opt-sound-toggle');
    this.optSoundLabel = document.getElementById('opt-sound-label');
    this.optCrtToggle = document.getElementById('opt-crt-toggle');
    this.optCrtLabel = document.getElementById('opt-crt-label');
    this.optCurvatureToggle = document.getElementById('opt-curvature-toggle');
    this.optCurvatureLabel = document.getElementById('opt-curvature-label');
    this.optParticlesToggle = document.getElementById('opt-particles-toggle');
    this.optParticlesLabel = document.getElementById('opt-particles-label');
    this.optContrastToggle = document.getElementById('opt-contrast-toggle');
    this.optContrastLabel = document.getElementById('opt-contrast-label');
    this.optWipeProgressBtn = document.getElementById('opt-wipe-progress-btn');

    // Display & Notification Elements
    this.balatroToast = document.getElementById('balatro-toast');
    this.crtOverlay = document.querySelector('.crt-overlay');
    this.vignetteOverlay = document.querySelector('.vignette-overlay');
    this.ambientParticlesCanvas = document.getElementById('ambient-particles');

    this.crtEnabled = true;
    this.curvatureEnabled = true;
    this.particlesEnabled = true;
    this.contrastEnabled = false;

    // Authentic Shop Screen Elements (Matching sho[.jpg)
    this.shopSidebarHeader = document.getElementById('shop-sidebar-header');
    this.shopBoardArena = document.getElementById('shop-board-arena');
    this.shopUI = new ShopUI(this.game, this);

    // Show Continue button if active save exists
    if (this.titleContinueBtn && saveManager.hasActiveRun()) {
      this.titleContinueBtn.classList.remove('hidden');
    }

    // Deck Select Modal Elements (Matching Photo 2)
    this.deckSelectModal = document.getElementById('deck-select-modal');
    this.deckPrevBtn = document.getElementById('deck-prev-btn');
    this.deckNextBtn = document.getElementById('deck-next-btn');
    this.deckPreviewStack = document.getElementById('deck-preview-stack');
    this.deckPreviewPattern = document.getElementById('deck-preview-pattern');
    this.deckPreviewName = document.getElementById('deck-preview-name');
    this.deckPreviewDescBox = document.getElementById('deck-preview-desc-box');
    this.deckPreviewLockBanner = document.getElementById('deck-preview-lock-banner');
    this.deckDotsContainer = document.getElementById('deck-dots-container');
    this.deckUnlockCountBadge = document.getElementById('deck-unlock-count-badge');
    this.stakePrevBtn = document.getElementById('stake-prev-btn');
    this.stakeNextBtn = document.getElementById('stake-next-btn');
    this.stakePreviewChip = document.getElementById('stake-preview-chip');
    this.stakePreviewName = document.getElementById('stake-preview-name');
    this.stakePreviewDesc = document.getElementById('stake-preview-desc');
    this.startSelectedRunBtn = document.getElementById('start-selected-run-btn');
    this.closeDeckSelectBtn = document.getElementById('close-deck-select-btn');

    // Collection Modal Elements
    this.collectionModal = document.getElementById('collection-modal');
    this.collectionTotalProgress = document.getElementById('collection-total-progress');
    this.sandboxToggleBtn = document.getElementById('sandbox-toggle-btn');
    this.closeCollectionBtn = document.getElementById('close-collection-btn');
    this.collectionGrid = document.getElementById('collection-grid');
    this.collectionTabs = {
      decks: document.getElementById('tab-coll-decks'),
      jokers: document.getElementById('tab-coll-jokers'),
      vouchers: document.getElementById('tab-coll-vouchers'),
      tarots: document.getElementById('tab-coll-tarots')
    };

    // Modal & Selection State
    this.selectedDeckIndex = 0;
    this.selectedStakeIndex = 0;
    this.collectionCurrentTab = 'decks';
    this.collectionJokerPage = 1;
    this.isChallengeMode = false;
    this.selectedChallengeIndex = 0;

    // Sub-module presentations
    this.backgroundRenderer = new BackgroundRenderer(this.bgCanvas, this.game);
    this.gameOverScreen = new GameOverScreen(this.game, this);
    this.deckViewer = new DeckViewer(this.game, this);
    this.stakeManager = stakeManager;
    this.challengeMode = challengeMode;
    this.mainMenu = new MainMenu(this.game, this);
    this.titleScreenRenderer = new TitleScreenRenderer(this.titleScreen, this.backgroundRenderer);
    this.runInfoModalComponent = new RunInfoModal(this.game, this);
    this.shopBackgroundManager = new ShopBackgroundManager(this.bgCanvas, this.game);
    this.cardRenderer = new CardRenderer();
    this.transitionAnimator = new TransitionAnimator(this);
    this.deckAnimator = new DeckAnimator(this, this.cardRenderer);
    this.shouldAnimateDeal = false;

    // Audio Engine state
    this.audioCtx = null;
    this.soundEnabled = true;

    // Start background spiral shader, ambient particles & event bindings
    this.initBgShader();
    this.initAmbientParticles();
    this.bindEvents();

    // Wire up Deck Pile click listeners across all scenes
    const deckCards = document.querySelectorAll('.deck-pile-card, #deck-counter, #shop-deck-counter, #blind-deck-counter');
    deckCards.forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playSound('card_slide');
        this.deckViewer.show();
      });
    });
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

        case 'mult_chord':
          // Authentic resonant Balatro mult chord chime
          [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const cOsc = this.audioCtx.createOscillator();
            const cGain = this.audioCtx.createGain();
            cOsc.type = 'triangle';
            cOsc.frequency.setValueAtTime(freq, now + idx * 0.02);
            cGain.gain.setValueAtTime(0.2, now + idx * 0.02);
            cGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.45);
            cOsc.connect(cGain);
            cGain.connect(this.audioCtx.destination);
            cOsc.start(now + idx * 0.02);
            cOsc.stop(now + idx * 0.02 + 0.45);
          });
          break;

        case 'chip_burst':
          // Rapid sparkling arpeggio for chip-burst spraying into target counter
          [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
            const bOsc = this.audioCtx.createOscillator();
            const bGain = this.audioCtx.createGain();
            bOsc.type = 'sine';
            bOsc.frequency.setValueAtTime(freq, now + idx * 0.045);
            bGain.gain.setValueAtTime(0.16, now + idx * 0.045);
            bGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.22);
            bOsc.connect(bGain);
            bGain.connect(this.audioCtx.destination);
            bOsc.start(now + idx * 0.045);
            bOsc.stop(now + idx * 0.045 + 0.22);
          });
          break;

        case 'reroll_shuffle':
          // Tactile card-flip/shuffle whoosh
          [220, 330, 440, 330].forEach((freq, idx) => {
            const sOsc = this.audioCtx.createOscillator();
            const sGain = this.audioCtx.createGain();
            sOsc.type = 'sawtooth';
            sOsc.frequency.setValueAtTime(freq, now + idx * 0.035);
            sGain.gain.setValueAtTime(0.12, now + idx * 0.035);
            sGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.12);
            sOsc.connect(sGain);
            sGain.connect(this.audioCtx.destination);
            sOsc.start(now + idx * 0.035);
            sOsc.stop(now + idx * 0.035 + 0.12);
          });
          break;

        case 'card_flip':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
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

          // Get calm color palette based on current Ante level or Title Screen
          let target;
          if (this.game.state === GAME_STATES.TITLE) {
            target = TITLE_COLOR_PALETTE;
          } else {
            const anteIdx = Math.max(0, Math.min(ANTE_COLOR_PALETTES.length - 1, (this.game.ante || 1) - 1));
            target = ANTE_COLOR_PALETTES[anteIdx];
          }

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

      let target;
      if (this.game.state === GAME_STATES.TITLE) {
        target = TITLE_COLOR_PALETTE;
      } else {
        const anteIdx = Math.max(0, Math.min(ANTE_COLOR_PALETTES.length - 1, (this.game.ante || 1) - 1));
        target = ANTE_COLOR_PALETTES[anteIdx];
      }
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
   * Ambient Floating Dust Motes & Shimmering Ambient Particles
   * Matches the tactile atmospheric ambient feel of authentic Balatro
   */
  initAmbientParticles() {
    const canvas = document.getElementById('ambient-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1.2 + Math.random() * 2.8,
      speedY: 0.18 + Math.random() * 0.42,
      speedX: (Math.random() - 0.5) * 0.35,
      alpha: 0.15 + Math.random() * 0.35,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03
    }));

    const renderParticles = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.pulse) * 0.3;
        p.pulse += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.65 + 0.35 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 170, ${currentAlpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(255, 210, 90, 0.55)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(renderParticles);
    };

    requestAnimationFrame(renderParticles);
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

    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        this.toggleSound();
      });
    }

    this.runInfoBtn.addEventListener('click', () => {
      this.showRunInfo();
    });

    if (this.closeRunInfoBtn) {
      this.closeRunInfoBtn.addEventListener('click', () => {
        this.runInfoModal?.classList.add('hidden');
      });
    }

    this.rerollBtn.addEventListener('click', () => {
      const prevCost = this.game.shopEngine.rerollCost;
      const res = this.game.rerollShop();
      if (res.success) {
        this.playSound('reroll_shuffle');
        this.spawnCashPop(this.rerollCostEl, prevCost);
        // Card shuffle flip animation
        Array.from(this.shopCardsShelf.children).forEach(c => c.classList.add('card-reroll-anim'));
        setTimeout(() => {
          this.renderShop();
          Array.from(this.shopCardsShelf.children).forEach(c => c.classList.add('card-reroll-anim'));
        }, 150);
      } else {
        this.playSound('card_deselect');
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
      if (this.shopBackgroundManager) {
        this.shopBackgroundManager.clearPackTheme();
      }
      this.playSound('card_slide');
      this.render();
      this.renderShop();
    });

    this.restartRunBtn.addEventListener('click', () => {
      this.gameOverModal.classList.add('hidden');
      this.game.startNewRun();
    });

    // Blind Select Stage "Select" buttons with authentic Blind Shift-Down transition
    this.blindSelectBtns.forEach((btn, index) => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.game.blindIndex === index) {
            this.transitionAnimator.animateBlindShiftDown(index, () => {
              this.game.selectActiveBlind();
              this.shouldAnimateDeal = true;
              this.render();
            });
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

    // ==========================================
    // TITLE SCREEN & MODAL EVENT BINDINGS
    // ==========================================
    if (this.titleContinueBtn) {
      this.titleContinueBtn.addEventListener('click', () => {
        const success = this.game.continueSavedRun();
        if (success) {
          this.playSound('win');
          if (this.titleScreen) this.titleScreen.classList.add('hidden');
          if (this.appContainer) this.appContainer.classList.remove('hidden');
          this.render();
          if (this.game.state === GAME_STATES.SHOP) {
            this.renderShop();
          }
        }
      });
    }

    if (this.titlePlayBtn) {
      this.titlePlayBtn.addEventListener('click', () => {
        this.openDeckSelectModal();
      });
    }

    if (this.titleCollectionBtn) {
      this.titleCollectionBtn.addEventListener('click', () => {
        this.openCollectionModal();
      });
    }

    if (this.titleOptionsBtn) {
      this.titleOptionsBtn.addEventListener('click', () => {
        if (this.optionsModal) this.optionsModal.classList.remove('hidden');
        this.playSound('card_slide');
      });
    }

    if (this.closeOptionsModalBtn) {
      this.closeOptionsModalBtn.addEventListener('click', () => {
        if (this.optionsModal) this.optionsModal.classList.add('hidden');
        this.playSound('card_slide');
      });
    }

    if (this.optSoundToggle) {
      this.optSoundToggle.addEventListener('click', () => {
        this.toggleSound();
      });
    }

    if (this.optCrtToggle) {
      this.optCrtToggle.addEventListener('click', () => {
        this.toggleCrt();
      });
    }

    if (this.optCurvatureToggle) {
      this.optCurvatureToggle.addEventListener('click', () => {
        this.toggleCurvature();
      });
    }

    if (this.optParticlesToggle) {
      this.optParticlesToggle.addEventListener('click', () => {
        this.toggleParticles();
      });
    }

    if (this.optContrastToggle) {
      this.optContrastToggle.addEventListener('click', () => {
        this.toggleContrast();
      });
    }

    if (this.optWipeProgressBtn) {
      this.optWipeProgressBtn.addEventListener('click', () => {
        this.permanentlyDeleteProgress();
      });
    }

    // In-Run Pause & Options Modal Event Listeners
    if (this.runOptionsBtn) {
      this.runOptionsBtn.addEventListener('click', () => {
        this.openInRunOptionsModal();
      });
    }

    const sidebarRunInfoBtn = document.getElementById('sidebar-run-info-btn');
    if (sidebarRunInfoBtn) {
      sidebarRunInfoBtn.addEventListener('click', () => {
        this.showRunInfo();
      });
    }

    const inRunInfoBtn = document.getElementById('in-run-info-btn');
    if (inRunInfoBtn) {
      inRunInfoBtn.addEventListener('click', () => {
        if (this.inRunOptionsModal) this.inRunOptionsModal.classList.add('hidden');
        this.showRunInfo();
      });
    }

    if (this.previewHandName) {
      this.previewHandName.style.cursor = 'pointer';
      this.previewHandName.title = 'Click to view Poker Hand Levels';
      this.previewHandName.addEventListener('click', () => this.showRunInfo());
    }

    if (this.inRunSaveLeaveBtn) {
      this.inRunSaveLeaveBtn.addEventListener('click', () => {
        this.saveAndLeaveRun();
      });
    }

    if (this.inRunResumeBtn) {
      this.inRunResumeBtn.addEventListener('click', () => {
        if (this.inRunOptionsModal) this.inRunOptionsModal.classList.add('hidden');
        this.playSound('card_slide');
      });
    }

    if (this.closeInRunOptionsBtn) {
      this.closeInRunOptionsBtn.addEventListener('click', () => {
        if (this.inRunOptionsModal) this.inRunOptionsModal.classList.add('hidden');
        this.playSound('card_slide');
      });
    }

    if (this.inRunSoundBtn) {
      this.inRunSoundBtn.addEventListener('click', () => {
        this.toggleSound();
      });
    }

    if (this.inRunCrtBtn) {
      this.inRunCrtBtn.addEventListener('click', () => {
        this.toggleCrt();
      });
    }

    if (this.inRunParticlesBtn) {
      this.inRunParticlesBtn.addEventListener('click', () => {
        this.toggleParticles();
      });
    }

    if (this.inRunAbandonBtn) {
      this.inRunAbandonBtn.addEventListener('click', () => {
        const confirmAbandon = confirm('⚠️ Abandon this run?\nYour current run progress will be lost.');
        if (!confirmAbandon) return;
        saveManager.clearActiveRun();
        this.playSound('card_deselect');
        this.showToast('RUN ABANDONED');
        if (this.inRunOptionsModal) this.inRunOptionsModal.classList.add('hidden');
        if (this.appContainer) this.appContainer.classList.add('hidden');
        if (this.titleScreen) this.titleScreen.classList.remove('hidden');
        if (this.titleContinueBtn) this.titleContinueBtn.classList.add('hidden');
      });
    }

    if (this.titleQuitBtn) {
      this.titleQuitBtn.addEventListener('click', () => {
        this.playSound('card_deselect');
        alert('Balatro Roguelike Card Game\nClose tab or continue playing anytime!');
      });
    }

    // Deck Select Modal (Photo 2)
    if (this.deckPrevBtn) {
      this.deckPrevBtn.addEventListener('click', () => {
        this.selectedDeckIndex = (this.selectedDeckIndex - 1 + DECKS.length) % DECKS.length;
        this.renderDeckCarousel();
        this.renderStakeCarousel();
        this.playSound('card_slide');
      });
    }

    if (this.deckNextBtn) {
      this.deckNextBtn.addEventListener('click', () => {
        this.selectedDeckIndex = (this.selectedDeckIndex + 1) % DECKS.length;
        this.renderDeckCarousel();
        this.renderStakeCarousel();
        this.playSound('card_slide');
      });
    }

    if (this.stakePrevBtn) {
      this.stakePrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectedStakeIndex = this.stakeManager.cyclePrev(this.selectedStakeIndex);
        this.renderStakeCarousel();
        this.playSound('card_slide');
      });
    }

    if (this.stakeNextBtn) {
      this.stakeNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectedStakeIndex = this.stakeManager.cycleNext(this.selectedStakeIndex);
        this.renderStakeCarousel();
        this.playSound('card_slide');
      });
    }

    if (this.startSelectedRunBtn) {
      this.startSelectedRunBtn.addEventListener('click', () => {
        if (this.isChallengeMode) {
          const challenges = this.challengeMode.getChallengeList();
          const challenge = challenges[this.selectedChallengeIndex || 0];
          this.challengeMode.selectChallenge(challenge.id);
          this.game.startNewRun(DECKS[0].id, STAKES[0].id);
          this.challengeMode.applyActiveChallenge(this.game);
          if (this.deckSelectModal) this.deckSelectModal.classList.add('hidden');
          if (this.titleScreen) this.titleScreen.classList.add('hidden');
          if (this.appContainer) this.appContainer.classList.remove('hidden');
          this.playSound('win');
          this.render();
          return;
        }

        const deck = DECKS[this.selectedDeckIndex];
        const stake = STAKES[this.selectedStakeIndex];
        if (!unlockablesManager.isDeckUnlocked(deck.id) || !this.stakeManager.isStakeUnlocked(deck.id, this.selectedStakeIndex)) {
          this.playSound('card_deselect');
          return;
        }

        if (this.deckSelectModal) this.deckSelectModal.classList.add('hidden');
        if (this.titleScreen) this.titleScreen.classList.add('hidden');
        if (this.appContainer) this.appContainer.classList.remove('hidden');

        this.game.startNewRun(deck.id, stake.id);
        this.playSound('win');
        this.render();
      });
    }

    const tabChallengesBtn = document.getElementById('tab-challenges');
    if (tabChallengesBtn) {
      tabChallengesBtn.addEventListener('click', () => {
        this.isChallengeMode = true;
        this.playSound('card_select');
        this.renderChallengeCarousel();
      });
    }

    const tabNewRunBtn = document.getElementById('tab-new-run');
    if (tabNewRunBtn) {
      tabNewRunBtn.addEventListener('click', () => {
        this.isChallengeMode = false;
        this.playSound('card_select');
        this.renderDeckCarousel();
        this.renderStakeCarousel();
      });
    }

    if (this.closeDeckSelectBtn) {
      this.closeDeckSelectBtn.addEventListener('click', () => {
        if (this.deckSelectModal) this.deckSelectModal.classList.add('hidden');
        this.playSound('card_deselect');
      });
    }

    // Collection Modal
    if (this.closeCollectionBtn) {
      this.closeCollectionBtn.addEventListener('click', () => {
        if (this.collectionModal) this.collectionModal.classList.add('hidden');
        this.playSound('card_deselect');
      });
    }

    if (this.sandboxToggleBtn) {
      this.sandboxToggleBtn.addEventListener('click', () => {
        unlockablesManager.toggleSandboxAllUnlocked();
        this.renderCollectionModal(this.collectionCurrentTab);
        this.renderDeckCarousel();
        this.playSound('cash');
      });
    }

    Object.keys(this.collectionTabs).forEach(tabKey => {
      const btn = this.collectionTabs[tabKey];
      if (btn) {
        btn.addEventListener('click', () => {
          this.renderCollectionModal(tabKey);
          this.playSound('card_slide');
        });
      }
    });

    // Options Modal
    if (this.closeOptionsModalBtn) {
      this.closeOptionsModalBtn.addEventListener('click', () => {
        if (this.optionsModal) this.optionsModal.classList.add('hidden');
        this.playSound('card_deselect');
      });
    }

    if (this.optSoundToggle) {
      this.optSoundToggle.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        if (this.optSoundLabel) this.optSoundLabel.textContent = this.soundEnabled ? 'ON 🔊' : 'OFF 🔇';
        if (this.soundStateLabel) this.soundStateLabel.textContent = this.soundEnabled ? 'ON 🔊' : 'OFF 🔇';
      });
    }

    if (this.optTitleReturnBtn) {
      this.optTitleReturnBtn.addEventListener('click', () => {
        if (this.optionsModal) this.optionsModal.classList.add('hidden');
        if (this.appContainer) this.appContainer.classList.add('hidden');
        if (this.titleScreen) this.titleScreen.classList.remove('hidden');
        this.game.state = GAME_STATES.TITLE;
        this.playSound('card_slide');
      });
    }

    if (this.optResetProfileBtn) {
      this.optResetProfileBtn.addEventListener('click', () => {
        if (confirm('Reset all unlockables, stakes, and discoveries back to default?')) {
          unlockablesManager.resetProfile();
          this.renderCollectionModal(this.collectionCurrentTab);
          this.renderDeckCarousel();
          alert('Profile reset successfully.');
        }
      });
    }

    // Victory Modal Choices (Part 4: Endless Mode vs End Run)
    if (this.victoryEndlessBtn) {
      this.victoryEndlessBtn.addEventListener('click', () => {
        if (this.victoryModal) this.victoryModal.classList.add('hidden');
        this.game.continueEndlessMode();
        this.playSound('win');
      });
    }

    if (this.victoryEndBtn) {
      this.victoryEndBtn.addEventListener('click', () => {
        if (this.victoryModal) this.victoryModal.classList.add('hidden');
        if (this.appContainer) this.appContainer.classList.add('hidden');
        if (this.titleScreen) this.titleScreen.classList.remove('hidden');
        this.game.state = GAME_STATES.TITLE;
        this.playSound('card_slide');
        this.render();
      });
    }
  }

  showToast(message, durationMs = 2400) {
    if (!this.balatroToast) return;
    this.balatroToast.textContent = message;
    this.balatroToast.classList.add('toast-visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      if (this.balatroToast) this.balatroToast.classList.remove('toast-visible');
    }, durationMs);
  }

  openInRunOptionsModal() {
    if (!this.inRunOptionsModal) return;
    this.inRunOptionsModal.classList.remove('hidden');
    this.playSound('card_slide');
    if (this.inRunSoundLabel) {
      this.inRunSoundLabel.textContent = this.soundEnabled ? 'ON 🔊' : 'OFF 🔇';
    }
    if (this.inRunCrtLabel) {
      this.inRunCrtLabel.textContent = this.crtEnabled ? 'ON' : 'OFF';
      this.inRunCrtLabel.className = this.crtEnabled ? 'text-emerald-400 font-sans text-xs font-bold' : 'text-slate-400 font-sans text-xs font-bold';
    }
    if (this.inRunParticlesLabel) {
      this.inRunParticlesLabel.textContent = this.particlesEnabled ? 'ON' : 'OFF';
      this.inRunParticlesLabel.className = this.particlesEnabled ? 'text-emerald-400 font-sans text-xs font-bold' : 'text-slate-400 font-sans text-xs font-bold';
    }
  }

  saveAndLeaveRun() {
    const saved = saveManager.saveCurrentRun(this.game);
    if (saved) {
      this.playSound('win');
      this.showToast('💾 RUN SAVED!');
      if (this.inRunOptionsModal) this.inRunOptionsModal.classList.add('hidden');
      if (this.appContainer) this.appContainer.classList.add('hidden');
      if (this.titleScreen) this.titleScreen.classList.remove('hidden');
      if (this.titleContinueBtn) {
        this.titleContinueBtn.classList.remove('hidden');
        this.titleContinueBtn.innerHTML = `CONTINUE (Ante ${this.game.ante})`;
      }
      this.game.state = GAME_STATES.TITLE;
    } else {
      this.showToast('Failed to save run');
    }
  }

  permanentlyDeleteProgress() {
    const confirmed = confirm(
      '⚠️ DANGER ZONE: PERMANENT WIPE\\n\\n' +
      'Are you sure you want to PERMANENTLY DELETE ALL PROGRESS?\\n\\n' +
      'This will permanently erase:\\n' +
      '• All Unlocked Decks\\n' +
      '• All Discovered Jokers\\n' +
      '• High Scores & Stakes\\n' +
      '• Active Mid-Run Saves\\n\\n' +
      'This action cannot be undone!'
    );
    if (!confirmed) return;

    saveManager.wipeAllData();
    unlockablesManager.resetProfile();

    if (this.titleContinueBtn) {
      this.titleContinueBtn.classList.add('hidden');
    }
    this.playSound('cash');
    this.showToast('🗑️ ALL PROGRESS PERMANENTLY WIPED!');
    if (this.optionsModal) {
      this.optionsModal.classList.add('hidden');
    }

    // Reset local selections
    this.selectedDeckIndex = 0;
    this.selectedStakeIndex = 0;
    this.renderDeckCarousel();
    this.renderStakeCarousel();
    if (this.deckUnlockCountBadge) {
      this.deckUnlockCountBadge.textContent = 'Decks: 1 / 15 Unlocked';
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const labelText = this.soundEnabled ? 'ON 🔊' : 'OFF 🔇';
    if (this.soundStateLabel) this.soundStateLabel.textContent = labelText;
    if (this.optSoundLabel) this.optSoundLabel.textContent = labelText;
    if (this.inRunSoundLabel) this.inRunSoundLabel.textContent = labelText;
    if (this.soundEnabled) this.playSound('card_select');
  }

  toggleCrt() {
    this.crtEnabled = !this.crtEnabled;
    const overlays = document.querySelectorAll('.crt-overlay');
    overlays.forEach(el => {
      el.style.display = this.crtEnabled ? 'block' : 'none';
    });
    const labelText = this.crtEnabled ? 'ON' : 'OFF';
    const cls = this.crtEnabled ? 'text-emerald-400 font-sans text-sm font-bold' : 'text-slate-400 font-sans text-sm font-bold';
    if (this.optCrtLabel) {
      this.optCrtLabel.textContent = labelText;
      this.optCrtLabel.className = cls;
    }
    if (this.inRunCrtLabel) {
      this.inRunCrtLabel.textContent = labelText;
      this.inRunCrtLabel.className = this.crtEnabled ? 'text-emerald-400 font-sans text-xs font-bold' : 'text-slate-400 font-sans text-xs font-bold';
    }
    this.playSound('card_slide');
  }

  toggleCurvature() {
    this.curvatureEnabled = !this.curvatureEnabled;
    if (this.vignetteOverlay) {
      this.vignetteOverlay.style.display = this.curvatureEnabled ? 'block' : 'none';
    }
    const labelText = this.curvatureEnabled ? 'ON' : 'OFF';
    const cls = this.curvatureEnabled ? 'text-emerald-400 font-sans text-sm font-bold' : 'text-slate-400 font-sans text-sm font-bold';
    if (this.optCurvatureLabel) {
      this.optCurvatureLabel.textContent = labelText;
      this.optCurvatureLabel.className = cls;
    }
    this.playSound('card_slide');
  }

  toggleParticles() {
    this.particlesEnabled = !this.particlesEnabled;
    if (this.ambientParticlesCanvas) {
      this.ambientParticlesCanvas.style.display = this.particlesEnabled ? 'block' : 'none';
    }
    const labelText = this.particlesEnabled ? 'ON' : 'OFF';
    const cls = this.particlesEnabled ? 'text-emerald-400 font-sans text-sm font-bold' : 'text-slate-400 font-sans text-sm font-bold';
    if (this.optParticlesLabel) {
      this.optParticlesLabel.textContent = labelText;
      this.optParticlesLabel.className = cls;
    }
    if (this.inRunParticlesLabel) {
      this.inRunParticlesLabel.textContent = labelText;
      this.inRunParticlesLabel.className = this.particlesEnabled ? 'text-emerald-400 font-sans text-xs font-bold' : 'text-slate-400 font-sans text-xs font-bold';
    }
    this.playSound('card_slide');
  }

  toggleContrast() {
    this.contrastEnabled = !this.contrastEnabled;
    const labelText = this.contrastEnabled ? 'ON' : 'OFF';
    const cls = this.contrastEnabled ? 'text-emerald-400 font-sans text-sm font-bold' : 'text-slate-400 font-sans text-sm font-bold';
    if (this.optContrastLabel) {
      this.optContrastLabel.textContent = labelText;
      this.optContrastLabel.className = cls;
    }
    document.body.classList.toggle('high-contrast-mode', this.contrastEnabled);
    this.playSound('card_slide');
  }

  /**
   * Opens the Deck Select Modal (Photo 2)
   */
  openDeckSelectModal() {
    this.renderDeckCarousel();
    this.renderStakeCarousel();
    if (this.deckSelectModal) this.deckSelectModal.classList.remove('hidden');
    this.playSound('card_slide');
  }

  /**
   * Renders the 3D Deck Stack Carousel and rule description (Photo 2)
   */
  renderDeckCarousel() {
    const deck = DECKS[this.selectedDeckIndex];
    if (!deck) return;

    const isUnlocked = unlockablesManager.isDeckUnlocked(deck.id);

    if (this.deckPreviewName) {
      this.deckPreviewName.textContent = isUnlocked ? deck.name : `${deck.name} 🔒`;
    }

    if (this.deckPreviewPattern) {
      this.deckPreviewPattern.style.background = isUnlocked ? deck.bgPattern : 'repeating-linear-gradient(45deg, #2c3e50, #2c3e50 10px, #1a252f 10px, #1a252f 20px)';
    }

    if (this.deckPreviewStack) {
      this.deckPreviewStack.style.borderColor = isUnlocked ? deck.color : '#7f8c8d';
      this.deckPreviewStack.style.boxShadow = isUnlocked ? `0 12px 28px ${deck.color}66` : 'none';
    }

    if (this.deckPreviewDescBox) {
      if (isUnlocked) {
        this.deckPreviewDescBox.innerHTML = `${deck.descriptionHtml || deck.description}<div class="absolute bottom-1 right-2 text-xs text-slate-400">🎴</div>`;
        this.deckPreviewDescBox.className = 'deck-rule-box w-full';
      } else {
        this.deckPreviewDescBox.innerHTML = '🔒 Locked Deck';
        this.deckPreviewDescBox.className = 'deck-rule-box w-full bg-slate-900 text-slate-400 border-slate-700';
      }
    }

    if (this.deckPreviewLockBanner) {
      if (isUnlocked) {
        this.deckPreviewLockBanner.classList.add('hidden');
      } else {
        this.deckPreviewLockBanner.classList.remove('hidden');
        this.deckPreviewLockBanner.innerHTML = `🔒 Unlock: <span class="text-white">${deck.unlockDesc || 'Complete requirement'}</span>`;
      }
    }

    if (this.startSelectedRunBtn) {
      if (isUnlocked) {
        this.startSelectedRunBtn.disabled = false;
        this.startSelectedRunBtn.innerHTML = 'PLAY';
        this.startSelectedRunBtn.className = 'deck-play-btn';
      } else {
        this.startSelectedRunBtn.disabled = true;
        this.startSelectedRunBtn.innerHTML = 'LOCKED 🔒';
        this.startSelectedRunBtn.className = 'deck-play-btn opacity-50 cursor-not-allowed bg-slate-800 border-slate-700';
      }
    }

    // Dynamic 15 Pagination dots
    if (this.deckDotsContainer) {
      this.deckDotsContainer.innerHTML = '';
      DECKS.forEach((d, idx) => {
        const dot = document.createElement('div');
        const isCurrent = idx === this.selectedDeckIndex;
        const dUnlocked = unlockablesManager.isDeckUnlocked(d.id);
        dot.className = `deck-dot ${isCurrent ? 'active' : ''}`;
        if (!isCurrent) {
          dot.style.backgroundColor = dUnlocked ? '#64748b' : '#334155';
        }
        dot.title = d.name;
        dot.addEventListener('click', () => {
          this.selectedDeckIndex = idx;
          this.renderDeckCarousel();
          this.renderStakeCarousel();
          this.playSound('card_slide');
        });
        this.deckDotsContainer.appendChild(dot);
      });
    }

    if (this.deckUnlockCountBadge) {
      const unlockedCount = DECKS.filter(d => unlockablesManager.isDeckUnlocked(d.id)).length;
      this.deckUnlockCountBadge.textContent = `Decks: ${unlockedCount} / ${DECKS.length} Unlocked`;
    }
  }

  /**
   * Renders the Stake (difficulty) Carousel
   */
  renderStakeCarousel() {
    const deck = DECKS[this.selectedDeckIndex] || DECKS[0];
    this.selectedStakeIndex = this.stakeManager.clampIndex(this.selectedStakeIndex);
    const stake = this.stakeManager.getStakeByIndex(this.selectedStakeIndex);
    if (!stake) return;

    const isUnlocked = this.stakeManager.isStakeUnlocked(deck.id, this.selectedStakeIndex);

    // 1. Update Stake Name
    if (this.stakePreviewName) {
      if (isUnlocked) {
        this.stakePreviewName.innerHTML = `<span style="color: #0f172a;">${stake.name.toUpperCase()}</span>`;
      } else {
        this.stakePreviewName.innerHTML = `<span style="color: #64748b;">${stake.name.toUpperCase()}</span> <span class="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/40 ml-1 font-bold">🔒 LOCKED</span>`;
      }
    }

    // 2. Update Stake Description & Lock Requirement
    if (this.stakePreviewDesc) {
      if (isUnlocked) {
        this.stakePreviewDesc.innerHTML = `<div class="text-[12px] font-bold text-slate-800 tracking-wide">${stake.description}</div>`;
      } else {
        const prevStake = STAKES[Math.max(0, this.selectedStakeIndex - 1)];
        this.stakePreviewDesc.innerHTML = `
          <div class="text-[12px] font-bold text-slate-700 tracking-wide opacity-85">${stake.description}</div>
          <div class="text-[10px] font-bold text-red-600 mt-1 bg-red-100/90 py-0.5 px-2 rounded border border-red-300 inline-block shadow-sm">
            🔒 Defeat ${prevStake ? prevStake.name : 'previous stake'} with ${deck.name} to unlock!
          </div>
        `;
      }
    }

    // 3. Update Stake Poker Chip Graphic
    if (this.stakePreviewChip) {
      this.stakePreviewChip.innerHTML = this.stakeManager.generateChipSvg(stake, isUnlocked);
      this.stakePreviewChip.style.background = 'transparent';
      this.stakePreviewChip.style.border = 'none';
      this.stakePreviewChip.style.boxShadow = isUnlocked
        ? `0 6px 16px ${stake.color || '#cbd5e1'}66`
        : '0 4px 10px rgba(0,0,0,0.4)';
    }

    // 4. Update Stake Carousel Arrow Buttons (< and >)
    if (this.stakePrevBtn) {
      this.stakePrevBtn.disabled = false;
      this.stakePrevBtn.style.opacity = '1';
      this.stakePrevBtn.style.cursor = 'pointer';
      this.stakePrevBtn.style.filter = 'none';
      this.stakePrevBtn.title = 'Previous Stake';
    }

    if (this.stakeNextBtn) {
      this.stakeNextBtn.disabled = false;
      this.stakeNextBtn.style.opacity = '1';
      this.stakeNextBtn.style.cursor = 'pointer';
      this.stakeNextBtn.style.filter = 'none';
      this.stakeNextBtn.title = 'Next Stake';
    }

    // 5. Update Play Button State
    const isDeckUnlocked = unlockablesManager.isDeckUnlocked(deck.id);
    if (this.startSelectedRunBtn && !this.isChallengeMode) {
      if (!isDeckUnlocked) {
        this.startSelectedRunBtn.disabled = true;
        this.startSelectedRunBtn.textContent = 'DECK LOCKED 🔒';
        this.startSelectedRunBtn.className = 'deck-play-btn opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-400';
      } else if (!isUnlocked) {
        this.startSelectedRunBtn.disabled = true;
        this.startSelectedRunBtn.textContent = 'STAKE LOCKED 🔒';
        this.startSelectedRunBtn.className = 'deck-play-btn opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-400';
      } else {
        this.startSelectedRunBtn.disabled = false;
        this.startSelectedRunBtn.textContent = 'PLAY';
        this.startSelectedRunBtn.className = 'deck-play-btn';
      }
    }

    // 6. Update Visual Status Dots
    const dotsContainer = document.getElementById('stake-dots-container');
    if (dotsContainer) {
      dotsContainer.innerHTML = this.stakeManager.generateStatusDotsHtml(deck.id, this.selectedStakeIndex);
      dotsContainer.querySelectorAll('.stake-status-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.dataset.stakeIndex, 10);
          this.selectedStakeIndex = this.stakeManager.clampIndex(idx);
          this.renderStakeCarousel();
          if (dot.dataset.unlocked === 'true') {
            this.playSound('card_slide');
          } else {
            this.playSound('card_deselect');
          }
        });
      });
    }
  }

  renderChallengeCarousel() {
    const challenges = this.challengeMode.getChallengeList();
    const curIdx = this.selectedChallengeIndex || 0;
    const challenge = challenges[curIdx] || challenges[0];

    if (this.deckPreviewName) {
      this.deckPreviewName.textContent = `${challenge.name} 🏆`;
    }
    if (this.deckPreviewDescBox) {
      this.deckPreviewDescBox.innerHTML = `
        <div class="font-bold text-sm text-amber-300 mb-1">${challenge.icon} ${challenge.name}</div>
        <div class="text-xs text-slate-200 leading-snug">${challenge.description}</div>
      `;
      this.deckPreviewDescBox.className = 'deck-rule-box w-full bg-slate-900 border-amber-500/50';
    }
    if (this.startSelectedRunBtn) {
      this.startSelectedRunBtn.disabled = false;
      this.startSelectedRunBtn.textContent = 'PLAY CHALLENGE';
      this.startSelectedRunBtn.className = 'deck-play-btn bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black';
    }
    if (this.deckDotsContainer) {
      this.deckDotsContainer.innerHTML = challenges.map((c, i) => `
        <div class="deck-dot ${i === curIdx ? 'active' : ''}" style="${i === curIdx ? 'background:#f59e0b;' : 'background:#475569;'}" title="${c.name}"></div>
      `).join('');
    }
  }

  /**
   * Opens the Collection & Unlockables Modal
   */
  openCollectionModal() {
    this.renderCollectionModal(this.collectionCurrentTab || 'decks');
    if (this.collectionModal) this.collectionModal.classList.remove('hidden');
    this.playSound('card_slide');
  }

  /**
   * Populates the Collection categories (Decks, Jokers, Vouchers, Tarots)
   */
  renderCollectionModal(tab = 'decks') {
    this.collectionCurrentTab = tab;

    // Update tab active states
    Object.keys(this.collectionTabs).forEach(k => {
      const btn = this.collectionTabs[k];
      if (btn) {
        if (k === tab) {
          btn.className = 'collection-tab-btn px-4 py-1.5 bg-[#2ecc71] text-slate-950 font-pixel text-lg rounded-xl font-black cursor-pointer shadow-md';
        } else {
          btn.className = 'collection-tab-btn px-4 py-1.5 bg-slate-800 text-slate-300 font-pixel text-lg rounded-xl font-black cursor-pointer hover:bg-slate-700';
        }
      }
    });

    if (this.sandboxToggleBtn) {
      this.sandboxToggleBtn.textContent = unlockablesManager.profile.sandboxAllUnlocked ? '🔓 Sandbox: ALL UNLOCKED' : 'Unlock All (Sandbox)';
      this.sandboxToggleBtn.className = unlockablesManager.profile.sandboxAllUnlocked ? 'px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg border border-emerald-300 shadow cursor-pointer' : 'px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-lg border border-purple-400 shadow cursor-pointer';
    }

    if (!this.collectionGrid) return;
    this.collectionGrid.innerHTML = '';

    if (tab === 'decks') {
      const unlockedCount = DECKS.filter(d => unlockablesManager.isDeckUnlocked(d.id)).length;
      if (this.collectionTotalProgress) {
        this.collectionTotalProgress.textContent = `Unlocked: ${unlockedCount} / ${DECKS.length} Decks`;
      }

      DECKS.forEach(deck => {
        const isUnlocked = unlockablesManager.isDeckUnlocked(deck.id);
        const card = document.createElement('div');
        card.className = `collection-card bg-[#141d22] border-2 rounded-2xl p-3 flex flex-col justify-between items-center text-center shadow-lg transition-all ${isUnlocked ? 'border-slate-500 hover:border-amber-400' : 'border-slate-700 is-locked opacity-70'}`;
        
        card.innerHTML = `
          <div class="w-12 h-16 rounded-lg mb-2 shadow-md flex items-center justify-center font-pixel text-2xl border border-white/20" style="background: ${isUnlocked ? deck.bgPattern : '#1e293b'}">
            ${isUnlocked ? deck.icon : '🔒'}
          </div>
          <span class="font-pixel text-lg text-white font-bold leading-tight">${deck.name}</span>
          <div class="text-[10px] text-slate-300 my-1 line-clamp-3 leading-snug">
            ${isUnlocked ? deck.description : `Unlock: ${deck.unlockDesc || 'Hidden'}`}
          </div>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-red-950/60 text-red-400 border border-red-500/40'}">
            ${isUnlocked ? 'UNLOCKED' : 'LOCKED'}
          </span>
        `;
        this.collectionGrid.appendChild(card);
      });
    } else if (tab === 'jokers') {
      const discoveredCount = unlockablesManager.profile.discoveredItems.filter(id => id.startsWith('joker_') || ALL_150_JOKERS.some(j => j.id === id)).length;
      if (this.collectionTotalProgress) {
        this.collectionTotalProgress.textContent = `Discovered: ${discoveredCount} / ${ALL_150_JOKERS.length} Jokers`;
      }

      const pageSize = 15;
      const totalPages = Math.ceil(ALL_150_JOKERS.length / pageSize);
      const currentPage = Math.max(1, Math.min(totalPages, this.collectionJokerPage || 1));
      const startIdx = (currentPage - 1) * pageSize;
      const pageJokers = ALL_150_JOKERS.slice(startIdx, startIdx + pageSize);

      const wrapper = document.createElement('div');
      wrapper.className = 'w-full flex flex-col items-center gap-3';

      // 3x5 Grid of 15 Jokers matching Reference Photo 2
      const grid = document.createElement('div');
      grid.className = 'collection-grid-3x5';

      pageJokers.forEach(joker => {
        const isDiscovered = unlockablesManager.profile.sandboxAllUnlocked || unlockablesManager.profile.discoveredItems.includes(joker.id) || joker.id === 'joker';
        const card = document.createElement('div');
        const rarity = (joker.rarity || 'common').toLowerCase();

        card.className = `playing-card joker-card relative flex flex-col items-center justify-between p-1 select-none shadow-md transition-all ${isDiscovered ? '' : 'is-locked opacity-70 grayscale'}`;
        card.style.height = '120px';

        if (isDiscovered) {
          card.innerHTML = renderJokerCardFace(joker);
          tooltipRenderer.attach(card, joker);
        } else {
          card.innerHTML = `
            <div class="joker-locked-pill bg-slate-700 text-slate-300 font-pixel text-xs px-2 py-0.5 rounded">LOCKED</div>
            <div class="w-full flex-1 flex flex-col items-center justify-center text-slate-500 font-pixel">
              <span class="text-3xl">🔒</span>
              <span class="text-xs">?????</span>
            </div>
          `;
        }
        grid.appendChild(card);
      });
      wrapper.appendChild(grid);

      // Pagination Controls matching Photo 2: < Page X/10 >
      const pager = document.createElement('div');
      pager.className = 'flex items-center justify-center gap-2 mt-2';
      pager.innerHTML = `
        <button id="collection-prev-page" class="collection-pager-btn px-4 py-1">◀</button>
        <div class="collection-pager-btn px-6 py-1 font-pixel text-2xl tracking-wider select-none">
          Page ${currentPage}/${totalPages}
        </div>
        <button id="collection-next-page" class="collection-pager-btn px-4 py-1">▶</button>
      `;

      pager.querySelector('#collection-prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
          this.collectionJokerPage = currentPage - 1;
          this.playSound('card_slide');
          this.renderCollectionModal('jokers');
        }
      });

      pager.querySelector('#collection-next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
          this.collectionJokerPage = currentPage + 1;
          this.playSound('card_slide');
          this.renderCollectionModal('jokers');
        }
      });
      wrapper.appendChild(pager);

      // Wide Orange Back Button matching Photo 2
      const backBtn = document.createElement('button');
      backBtn.className = 'collection-back-btn mt-1';
      backBtn.textContent = 'Back';
      backBtn.addEventListener('click', () => {
        this.playSound('card_deselect');
        if (this.collectionModal) {
          this.collectionModal.classList.add('hidden');
        }
      });
      wrapper.appendChild(backBtn);

      this.collectionGrid.appendChild(wrapper);
    } else if (tab === 'vouchers') {
      if (this.collectionTotalProgress) {
        this.collectionTotalProgress.textContent = `Vouchers: ${VOUCHER_CATALOG.length} Available`;
      }

      VOUCHER_CATALOG.forEach(v => {
        const card = document.createElement('div');
        card.className = 'collection-card bg-[#141d22] border-2 border-amber-600/60 rounded-2xl p-3 flex flex-col justify-between items-center text-center shadow-lg';
        card.innerHTML = `
          <div class="w-12 h-14 bg-amber-950/40 rounded-xl mb-2 shadow flex items-center justify-center text-3xl border border-amber-500/50">
            ${v.icon || '📦'}
          </div>
          <span class="font-pixel text-lg text-amber-300 font-bold leading-tight">${v.name}</span>
          <div class="text-[10px] text-slate-300 my-1 leading-snug">${v.description}</div>
          <span class="text-[10px] font-bold text-amber-400">$${v.cost}</span>
        `;
        this.collectionGrid.appendChild(card);
      });
    } else if (tab === 'tarots') {
      const allTarotsAndPlanets = [...TAROT_CARDS, ...PLANET_CARDS];
      if (this.collectionTotalProgress) {
        this.collectionTotalProgress.textContent = `Tarots & Planets: ${allTarotsAndPlanets.length} Available`;
      }

      allTarotsAndPlanets.forEach(c => {
        const isTarot = c.type === 'Tarot';
        const card = document.createElement('div');
        card.className = `collection-card bg-[#141d22] border-2 rounded-2xl p-2.5 flex flex-col justify-between items-center text-center shadow-lg ${isTarot ? 'border-purple-600/60' : 'border-cyan-600/60'}`;
        card.innerHTML = `
          <div class="w-11 h-14 rounded-xl mb-1.5 shadow flex items-center justify-center text-2xl border" style="background: ${isTarot ? '#3b1d54' : '#103947'}; border-color: ${isTarot ? '#a855f7' : '#06b6d4'}">
            ${c.icon || '🃏'}
          </div>
          <span class="font-pixel text-base text-white font-bold leading-tight truncate w-full">${c.name}</span>
          <div class="text-[10px] text-slate-300 my-1 line-clamp-3 leading-snug">${c.description}</div>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase" style="color: ${isTarot ? '#c084fc' : '#22d3ee'}; background: rgba(0,0,0,0.4)">
            ${c.type}
          </span>
        `;
        this.collectionGrid.appendChild(card);
      });
    }
  }

  /**
   * Full game HUD & Card layout update
   */
  render() {
    if (this.game.state === GAME_STATES.TITLE) {
      if (this.titleScreen) this.titleScreen.classList.remove('hidden');
      if (this.appContainer) this.appContainer.classList.add('hidden');
      return;
    }

    if (this.titleScreen) this.titleScreen.classList.add('hidden');
    if (this.appContainer) this.appContainer.classList.remove('hidden');

    this.renderHUD();
    this.renderJokers();
    this.renderConsumables();

    if (this.game.state === GAME_STATES.BLIND_SELECT) {
      if (this.blindSelectStage) this.blindSelectStage.classList.remove('hidden');
      if (this.playArena) this.playArena.classList.add('hidden');
      if (this.shopBoardArena) this.shopBoardArena.classList.add('hidden');
      if (this.blindSelectSidebarTitle) this.blindSelectSidebarTitle.classList.remove('hidden');
      if (this.shopSidebarHeader) this.shopSidebarHeader.classList.add('hidden');
      if (this.blindCardEl) this.blindCardEl.classList.add('hidden');
      this.renderBlindSelectStage();
    } else if (this.game.state === GAME_STATES.SHOP) {
      if (this.blindSelectStage) this.blindSelectStage.classList.add('hidden');
      if (this.playArena) this.playArena.classList.add('hidden');
      if (this.shopBoardArena) this.shopBoardArena.classList.remove('hidden');
      if (this.blindSelectSidebarTitle) this.blindSelectSidebarTitle.classList.add('hidden');
      if (this.shopSidebarHeader) this.shopSidebarHeader.classList.remove('hidden');
      if (this.blindCardEl) this.blindCardEl.classList.add('hidden');
      if (this.shopUI) this.shopUI.render();
    } else {
      if (this.blindSelectStage) this.blindSelectStage.classList.add('hidden');
      if (this.shopBoardArena) this.shopBoardArena.classList.add('hidden');
      if (this.playArena) this.playArena.classList.remove('hidden');
      if (this.blindSelectSidebarTitle) this.blindSelectSidebarTitle.classList.add('hidden');
      if (this.shopSidebarHeader) this.shopSidebarHeader.classList.add('hidden');
      if (this.blindCardEl) this.blindCardEl.classList.remove('hidden');
      this.renderHand();
      this.renderPreviewBanner();
      this.updateActionButtons();
    }
  }

  /**
   * Renders the 3-column Blind Select Stage with individual colors per Blind and Boss!
   */
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
      const badgeEl = this.blindBadges[i];

      const blindColor = blind.color || '#0072b2';
      const blindBorder = blind.border || '#009dff';

      if (scoreTarget) scoreTarget.textContent = blind.target.toLocaleString();
      if (rewardLabel) {
        rewardLabel.innerHTML = `<span class="px-2 py-0.5 rounded-md bg-[#196f3d] border border-[#27ae60] text-amber-200 font-pixel text-sm font-black shadow">${blind.reward}</span>`;
      }

      // Unique title & individual colors
      if (titleEl) {
        titleEl.textContent = blind.name;
        titleEl.style.backgroundColor = blindColor;
        titleEl.style.borderColor = blindBorder;
      }

      // Unique badge & individual colors with animated spinning chip graphics
      if (badgeEl) {
        badgeEl.style.backgroundColor = blindColor;
        badgeEl.style.borderColor = blindBorder;
        if (i === 2) {
          badgeEl.innerHTML = `
            <span class="text-3xl drop-shadow transform hover:scale-110 transition">${blind.icon || '⚓'}</span>
            <span class="text-[10px] font-pixel tracking-wider text-amber-200 uppercase mt-0.5">BOSS</span>
          `;
        } else if (i === 0) {
          badgeEl.innerHTML = `
            <div class="w-8 h-8 rounded-full border-2 border-dashed border-white/80 bg-blue-500/80 flex items-center justify-center font-pixel text-xs text-white shadow animate-[spin_6s_linear_infinite]">
              ❂
            </div>
            <span class="text-[10px] font-pixel tracking-wider text-white mt-0.5">SMALL</span>
          `;
        } else if (i === 1) {
          badgeEl.innerHTML = `
            <div class="w-8 h-8 rounded-full border-2 border-dashed border-white/80 bg-amber-500/80 flex items-center justify-center font-pixel text-xs text-white shadow animate-[spin_6s_linear_infinite]">
              ❂
            </div>
            <span class="text-[10px] font-pixel tracking-wider text-white mt-0.5">BIG</span>
          `;
        }
      }

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
          col.style.borderColor = blindBorder;
          col.style.boxShadow = `0 0 24px ${blindColor}aa`;
        } else if (isPast) {
          col.style.opacity = '0.45';
          col.style.borderColor = '#334155';
          col.style.boxShadow = 'none';
        } else {
          col.style.opacity = '0.85';
          col.style.borderColor = `${blindColor}88`;
          col.style.boxShadow = 'none';
        }
      }
    });
  }

  renderHUD() {
    // Blind card & individual colors
    const isBoss = this.game.blindType === BLIND_TYPES.BOSS;
    const curBlind = (this.game.anteBlinds && this.game.anteBlinds[this.game.blindIndex]) ? this.game.anteBlinds[this.game.blindIndex] : null;
    const curColor = curBlind?.color || (isBoss ? '#8b2626' : (this.game.blindIndex === 1 ? '#8c6d1f' : '#0072b2'));
    const curBorder = curBlind?.border || (isBoss ? '#e74c3c' : (this.game.blindIndex === 1 ? '#f39c12' : '#009dff'));

    if (this.blindCardEl) {
      this.blindCardEl.style.borderColor = curBorder;
      this.blindCardEl.style.boxShadow = `0 4px 18px ${curColor}55`;
    }

    const blindCoin = document.getElementById('blind-coin');
    if (blindCoin) {
      blindCoin.style.backgroundColor = curColor;
      blindCoin.style.borderColor = curBorder;
      blindCoin.textContent = isBoss && this.game.activeBoss ? (this.game.activeBoss.icon || '⚓') : '❂';
    }

    this.blindNameEl.textContent = isBoss && this.game.activeBoss ? this.game.activeBoss.name : this.game.blindType;
    this.blindConditionEl.textContent = isBoss && this.game.activeBoss ? this.game.activeBoss.desc : 'Score to beat this blind';
    this.blindRewardEl.textContent = isBoss ? '$$$$$' : (this.game.blindIndex === 1 ? '$$$$' : '$$$');
    this.anteCounterEl.textContent = `Ante ${this.game.ante}/${this.game.maxAnte}`;

    this.targetScoreEl.textContent = this.game.roundTarget.toLocaleString();
    this.currentScoreEl.textContent = this.game.state === GAME_STATES.SHOP ? '0' : this.game.roundScore.toLocaleString();
    this.handsLeftEl.textContent = this.game.handsLeft;
    this.discardsLeftEl.textContent = this.game.discardsLeft;
    this.moneyDisplayEl.textContent = this.game.money;
    this.anteSubEl.textContent = this.game.ante;
    this.roundSubEl.textContent = (this.game.ante - 1) * 3 + (this.game.blindIndex + 1);

    const totalDeckCards = this.game.deck.length + this.game.discardPile.length + this.game.hand.length;
    this.deckCounterEl.textContent = `${this.game.deck.length}/${totalDeckCards}`;

    // Shop HUD alignment matching reference screenshot sho[.jpg
    const interestCard = document.getElementById('interest-card');
    if (this.game.state === GAME_STATES.SHOP) {
      if (this.previewChipsBox) this.previewChipsBox.textContent = '0';
      if (this.previewMultBox) this.previewMultBox.textContent = '0';
      if (this.previewHandName) this.previewHandName.textContent = 'SHOP';
      if (this.previewHandLevel) this.previewHandLevel.textContent = '';
      if (interestCard) interestCard.classList.add('hidden');
    } else {
      if (interestCard) interestCard.classList.remove('hidden');
    }

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
      const rarityClass = joker.rarity ? `rarity-${joker.rarity.toLowerCase()}` : 'rarity-common';
      card.className = `joker-card ${rarityClass} ${joker.edition && joker.edition !== 'normal' ? 'edition-' + joker.edition : ''}`;
      if (joker.debuffed) card.classList.add('card-debuffed');
      card.id = `joker-dom-${joker.instanceId || joker.id}`;
      card.dataset.index = index;
      card.title = `${joker.name}: ${joker.description} (Sell: $${joker.sellValue})`;

      // Stickers (Part 5)
      let stickerHtml = '';
      if (joker.isEternal) {
        stickerHtml = '<span class="joker-sticker sticker-eternal">ETERNAL</span>';
      } else if (joker.isPerishable) {
        stickerHtml = `<span class="joker-sticker sticker-perishable">${joker.perishableRoundsLeft !== undefined ? joker.perishableRoundsLeft : 5} RND</span>`;
      }
      if (joker.isRental) {
        stickerHtml += '<span class="joker-sticker sticker-rental" style="top:auto; bottom:-6px; right:-6px;">RENTAL</span>';
      }

      // Loyalty Card Persistent Live Countdown Badge (Part 3)
      let dynamicBadgeHtml = '';
      if (joker.id === 'loyalty_card') {
        const remaining = joker.handsRemaining !== undefined ? joker.handsRemaining : 5;
        if (remaining === 0) {
          dynamicBadgeHtml = '<div class="loyalty-badge active-glow">ACTIVE! ×4</div>';
        } else {
          dynamicBadgeHtml = `<div class="loyalty-badge">${remaining} hands left</div>`;
        }
      }

      // Blueprint / Brainstorm target badge (Part 1.2)
      let copyTargetHtml = '';
      if (joker.id === 'blueprint' || joker.id === 'brainstorm') {
        if (joker.hasTarget && joker.targetName) {
          copyTargetHtml = `<div class="blueprint-badge blueprint-active">Copying: ${joker.targetName}</div>`;
        } else {
          copyTargetHtml = `<div class="blueprint-badge blueprint-no-target">No target!</div>`;
        }
      }

      card.innerHTML = `
        ${stickerHtml}
        ${renderJokerCardFace(joker, {
          showSell: true,
          sellIndex: index,
          badgeHtml: dynamicBadgeHtml,
          copyTargetHtml: copyTargetHtml
        })}
      `;

      // Drag-to-sell and Safe Shop Inspection
      card.draggable = true;
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'owned_joker', index }));
      });
      card.addEventListener('click', (e) => {
        if (this.game.state === GAME_STATES.SHOP) {
          e.stopPropagation();
          this.playSound('card_select');
          this.shopUI.inspectedItem = joker;
          this.shopUI.inspectedType = 'owned_joker';
          this.shopUI.inspectedIndex = index;
          this.shopUI.renderBuySellSquare();
        }
      });

      // Attach floating inspection tooltip
      tooltipRenderer.attach(card, joker);

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
      card.dataset.index = index;
      card.id = `consumable-dom-${item.instanceId || item.id}`;
      card.title = `${item.name} (${item.type}): ${item.description}`;
      card.draggable = true;

      card.innerHTML = `
        <div class="text-[9px] font-black uppercase text-cyan-200 tracking-wider truncate w-full text-center">
          ${item.name}
        </div>
        <div class="text-3xl sm:text-4xl my-auto">${item.icon}</div>
        <div class="w-full flex justify-center items-center text-[9px] px-0.5 font-bold">
          <button class="use-consumable-btn bg-cyan-600 hover:bg-cyan-500 text-white rounded px-2.5 py-0.5 text-[8px] font-black uppercase">Use</button>
        </div>
      `;

      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'owned_consumable', index }));
      });

      card.addEventListener('click', (e) => {
        if (this.game.state === GAME_STATES.SHOP) {
          e.stopPropagation();
          this.playSound('card_select');
          this.shopUI.inspectedItem = item;
          this.shopUI.inspectedType = 'owned_consumable';
          this.shopUI.inspectedIndex = index;
          this.shopUI.renderBuySellSquare();
        }
      });

      // Attach floating inspection tooltip
      tooltipRenderer.attach(card, item);

      card.querySelector('.use-consumable-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedCount = this.game.getSelectedCards().length;
        const isTargeted = item.type === 'Tarot' || item.type === 'Spectral';
        const hasCards = (this.game.hand && this.game.hand.length > 0) || (this.game.deck && this.game.deck.length > 0);
        if (isTargeted && selectedCount === 0 && hasCards) {
          this.openConsumableTargetModal(item, index);
          return;
        }

        const res = this.game.useConsumable(index);
        if (res.success) {
          this.playSound('win');
          this.render();
          if (this.game.state === GAME_STATES.SHOP) this.renderShop();
        } else {
          if (isTargeted && hasCards) {
            this.openConsumableTargetModal(item, index);
          } else {
            alert(res.message);
          }
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
   * When shouldAnimateDeal is true, plays the physical unravelling and dealing sequence out of the deck pile!
   */
  renderHand() {
    if (this.shouldAnimateDeal) {
      this.shouldAnimateDeal = false;
      this.deckAnimator.dealCards(this.game.hand, this.playerHandEl, () => {
        this.renderPreviewBanner();
        this.updateActionButtons();
      });
      return;
    }

    this.playerHandEl.innerHTML = '';
    const cards = this.game.hand;
    const total = cards.length;

    cards.forEach((card, i) => {
      const cardEl = this.cardRenderer.createCardElement(card, i, total);
      this.playerHandEl.appendChild(cardEl);
    });
  }

  generateCardPipsHtml(rank, symbol) {
    return this.cardRenderer.generateCardPipsHtml(rank, symbol);
  }

  renderPreviewBanner() {
    const selected = this.game.getSelectedCards();
    if (selected.length === 0) {
      this.previewHandName.textContent = 'Select Cards';
      this.previewHandLevel.textContent = 'lvl. 1';
      this.previewChipsBox.textContent = '0';
      this.previewMultBox.textContent = '0';
      this.setFireOverflow(false);
      return;
    }

    const preview = this.game.calculateCurrentHandPreview();

    this.previewHandName.textContent = preview.handName;
    this.previewHandLevel.textContent = `lvl. ${preview.level || 1}`;
    this.previewChipsBox.textContent = preview.chips.toLocaleString();
    this.previewMultBox.textContent = preview.mult.toLocaleString();

    // Trigger high-impact Single-Hand Blind Overflow fire effect!
    const isOverflow = Boolean(preview.isSingleHandOverflow);
    this.setFireOverflow(isOverflow);
  }

  setFireOverflow(isActive) {
    const roundScoreCard = document.getElementById('round-score-card') || this.currentScoreEl?.closest('.bg-\\[\\#1b1713\\]') || this.currentScoreEl?.parentElement?.parentElement;
    if (isActive) {
      if (this.liveHandCard) this.liveHandCard.classList.add('score-fire-overflow');
      if (this.previewChipsBox) this.previewChipsBox.classList.add('chips-fire');
      if (this.previewMultBox) this.previewMultBox.classList.add('mult-fire');
      if (roundScoreCard) roundScoreCard.classList.add('round-score-fire');
      if (this.currentScoreEl) this.currentScoreEl.classList.add('score-counter-fire');
    } else {
      if (this.liveHandCard) this.liveHandCard.classList.remove('score-fire-overflow');
      if (this.previewChipsBox) this.previewChipsBox.classList.remove('chips-fire');
      if (this.previewMultBox) this.previewMultBox.classList.remove('mult-fire');
      if (roundScoreCard) roundScoreCard.classList.remove('round-score-fire');
      if (this.currentScoreEl) this.currentScoreEl.classList.remove('score-counter-fire');
    }
  }

  /**
   * Opens clean 8-card target selection modal for Tarot / Spectral card modifications
   */
  openConsumableTargetModal(item, itemIndex) {
    let modal = document.getElementById('consumable-target-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'consumable-target-modal';
      modal.className = 'consumable-target-modal';
      document.body.appendChild(modal);
    }

    const eligibleCards = (this.game.hand && this.game.hand.length > 0)
      ? this.game.hand.slice(0, 8)
      : (this.game.deck || []).slice(0, 8);
    let selectedSet = new Set();
    const maxSelect = item.maxTargets || (item.name === 'Death' ? 2 : (item.name === 'Strength' ? 2 : (item.name === 'The Hanged Man' ? 2 : 1)));

    const renderModalContent = () => {
      modal.innerHTML = `
        <div class="consumable-target-dialog flex flex-col gap-4 select-none">
          <div class="flex items-center justify-between border-b border-amber-500/40 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-3xl">${item.icon || '🃏'}</span>
              <div>
                <h3 class="font-pixel text-3xl text-amber-300 leading-none">${item.name}</h3>
                <span class="text-xs text-slate-300 font-bold">${item.description}</span>
              </div>
            </div>
            <button id="close-consumable-modal-btn" class="text-slate-400 hover:text-white font-bold text-2xl px-2 cursor-pointer">✕</button>
          </div>

          <div class="text-xs font-black uppercase tracking-wider text-slate-300 flex justify-between">
            <span>Select up to ${maxSelect} target card(s):</span>
            <span class="text-amber-400 font-pixel text-base">${selectedSet.size} / ${maxSelect} Selected</span>
          </div>

          <!-- Up to 8 Eligible Cards Grid -->
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2 py-2">
            ${eligibleCards.map(card => {
              const isSelected = selectedSet.has(card.id);
              const suitSymbol = card.getSuitSymbol();
              const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
              return `
                <div class="target-card-btn ${isSelected ? 'target-selected' : ''} bg-[#faf8f5] rounded-xl p-1.5 flex flex-col items-center justify-between h-24 border-2 shadow" data-card-id="${card.id}">
                  <div class="flex items-center justify-between w-full leading-none ${isRed ? 'text-[#fe5f55]' : 'text-[#009dff]'}">
                    <span class="font-black text-xs font-sans">${card.rank}</span>
                    <span class="text-[10px] font-sans">${suitSymbol}</span>
                  </div>
                  <div class="text-2xl my-auto ${isRed ? 'text-[#fe5f55]' : 'text-[#009dff]'}">
                    ${suitSymbol}
                  </div>
                  <span class="text-[8px] font-black uppercase text-slate-500 truncate w-full text-center">
                    ${card.enhancement !== 'none' ? card.enhancement : ''}
                  </span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-end gap-3 border-t border-slate-700/80 pt-3">
            <button id="cancel-target-btn" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl cursor-pointer">
              Cancel
            </button>
            <button id="confirm-target-btn" class="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-pixel text-xl font-black rounded-xl shadow-lg cursor-pointer ${selectedSet.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
              Apply Effect
            </button>
          </div>
        </div>
      `;

      modal.querySelectorAll('.target-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cid = btn.dataset.cardId;
          if (selectedSet.has(cid)) {
            selectedSet.delete(cid);
          } else {
            if (selectedSet.size < maxSelect) {
              selectedSet.add(cid);
            } else if (maxSelect === 1) {
              selectedSet.clear();
              selectedSet.add(cid);
            }
          }
          this.playSound('card_select');
          renderModalContent();
        });
      });

      modal.querySelector('#close-consumable-modal-btn')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
      modal.querySelector('#cancel-target-btn')?.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      modal.querySelector('#confirm-target-btn')?.addEventListener('click', () => {
        if (selectedSet.size === 0) return;
        eligibleCards.forEach(c => {
          c.selected = selectedSet.has(c.id);
        });
        const res = this.game.useConsumable(itemIndex);
        modal.classList.add('hidden');
        if (res.success) {
          this.playSound('win');
          this.render();
          if (this.game.state === GAME_STATES.SHOP) this.renderShop();
        } else {
          alert(res.message);
        }
      });
    };

    modal.classList.remove('hidden');
    renderModalContent();
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

        // Dynamically activate red-orange fire overflow when target is achieved
        if (scoringResult.isSingleHandOverflow || (tallyChipsVal * tallyMultVal >= this.game.roundTarget && this.game.roundTarget > 0)) {
          this.setFireOverflow(true);
        }

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

    // Pacing: Dramatic pause before multiplication (Part 1)
    await this.wait(450);

    // Multiplication: Play mult_chord chime and flash tally total
    this.playSound('mult_chord');
    this.tallyTotal.textContent = (tallyChipsVal * tallyMultVal).toLocaleString();
    if (scoringResult.isSingleHandOverflow || (tallyChipsVal * tallyMultVal >= this.game.roundTarget && this.game.roundTarget > 0)) {
      this.setFireOverflow(true);
    }
    this.tallyTotal.style.transform = 'scale(1.25)';
    this.tallyTotal.style.color = '#f1c40f';
    document.body.classList.add('screen-shake');
    setTimeout(() => {
      this.tallyTotal.style.transform = '';
      this.tallyTotal.style.color = '';
      document.body.classList.remove('screen-shake');
    }, 320);

    await this.wait(400);

    // Final chip-burst animation spraying across screen into target counter
    this.playSound('chip_burst');
    this.spawnChipBurst(this.tallyTotal, this.currentScoreEl, 16);

    // Wait for chip burst to land
    await this.wait(800);

    this.scoringBoard.classList.remove('opacity-100', 'scale-100');
    this.scoringBoard.classList.add('opacity-0', 'scale-95');
    this.scoringStage.classList.add('hidden');
    this.playedCardsStage.innerHTML = '';
    this.setFireOverflow(false);

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

  /**
   * Spawns golden chip-burst particles spraying into the target counter
   */
  spawnChipBurst(sourceEl, targetEl, count = 16) {
    if (!sourceEl || !targetEl) return;
    const sRect = sourceEl.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();
    const sX = sRect.left + sRect.width / 2;
    const sY = sRect.top + sRect.height / 2;
    const targetDeltaX = (tRect.left + tRect.width / 2) - sX;
    const targetDeltaY = (tRect.top + tRect.height / 2) - sY;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'chip-burst-particle';
      p.style.left = `${sX}px`;
      p.style.top = `${sY}px`;
      const spreadX = (Math.random() - 0.5) * 80;
      const spreadY = (Math.random() - 0.5) * 80;
      p.style.setProperty('--burst-target', `translate(${targetDeltaX + spreadX}px, ${targetDeltaY + spreadY}px)`);
      p.style.animationDelay = `${i * 0.03}s`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 850 + i * 30);
    }
  }

  /**
   * Floating cash spending pop (-$X)
   */
  spawnCashPop(targetEl, amount) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const p = document.createElement('div');
    p.className = 'cash-pop-particle';
    p.textContent = `-$${amount}`;
    p.style.left = `${rect.left + rect.width / 2 - 20}px`;
    p.style.top = `${rect.top - 12}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 850);
  }

  showRunInfo(tab = null) {
    if (this.runInfoModalComponent) {
      this.runInfoModalComponent.show(tab);
    }
  }

  showTitleScreen() {
    this.game.state = GAME_STATES.TITLE;
    if (this.mainMenu) {
      this.mainMenu.show();
    } else if (this.titleScreen) {
      this.titleScreen.classList.remove('hidden');
    }
    if (this.appContainer) this.appContainer.classList.add('hidden');
    if (this.deckSelectModal) this.deckSelectModal.classList.add('hidden');
    if (this.gameOverModal) this.gameOverModal.classList.add('hidden');
    if (this.optionsModal) this.optionsModal.classList.add('hidden');
    if (this.backgroundRenderer) {
      this.backgroundRenderer.setAntePalette(0);
    }
    this.playSound('card_slide');
  }

  /**
   * ZONE B: Main Shop Area Rendering (Exact Balatro Look from sho[.jpg)
   */
  renderShop() {
    this.game.state = GAME_STATES.SHOP;
    this.render();
    if (this.shopUI) {
      this.shopUI.render();
    }
  }

  /**
   * ZONE C: Interactive Booster Pack Opening Overlay
   * Displays cards face up to choose from with visible mutations, editions, and keep buttons!
   */
  openBoosterPack(pack) {
    this.showPackOpeningOverlay({
      pack: pack,
      cards: this.game.shopEngine.packCards || [],
      choicesRemaining: pack.choices || 1
    });
  }

  showPackOpeningOverlay(packData) {
    if (this.shopBackgroundManager && packData && packData.pack) {
      this.shopBackgroundManager.setPackTheme(packData.pack);
    }

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
        const isSpectral = item.type === 'Spectral';
        const isPlanet = item.type === 'Planet';
        const typeLabel = isSpectral ? 'Spectral' : (isPlanet ? 'Planet' : 'Tarot');
        const themeBtn = isSpectral ? 'bg-[#06b6d4] hover:bg-cyan-400 text-slate-950 border-cyan-200' : (isPlanet ? 'bg-[#2563eb] hover:bg-blue-500 text-white border-blue-300' : 'bg-[#9333ea] hover:bg-purple-500 text-white border-purple-300');
        const themeBadge = isSpectral ? 'text-cyan-300' : (isPlanet ? 'text-blue-300' : 'text-purple-300');
        const themeCard = isSpectral ? 'consumable-type-spectral' : (isPlanet ? 'consumable-type-planet' : 'consumable-type-tarot');

        cardSlot.innerHTML = `
          <div class="text-[10px] font-black uppercase ${themeBadge}">${typeLabel} Card</div>
          <div class="consumable-card ${themeCard} my-1 pointer-events-none">
            <div class="text-[9px] font-black uppercase text-cyan-200 tracking-wider truncate w-full text-center">${item.name}</div>
            <div class="text-4xl my-auto">${item.icon}</div>
          </div>
          <div class="font-bold text-xs text-slate-100 text-center leading-tight">${item.name}</div>
          <p class="text-[10px] text-amber-200/90 leading-tight text-center px-1 my-0.5 min-h-[28px]">${item.description}</p>
          <button class="w-full py-2 ${themeBtn} font-black text-xs uppercase rounded-xl border shadow-lg active:scale-95 transition">Keep ${typeLabel}</button>
        `;
      } else {
        // Joker from Buffoon Pack
        const rarityClass = item.rarity ? `rarity-${item.rarity.toLowerCase()}` : 'rarity-common';
        const edClass = item.edition && item.edition !== 'normal' ? `edition-${item.edition}` : '';
        cardSlot.innerHTML = `
          <div class="text-[10px] font-black uppercase text-amber-300">Joker</div>
          <div class="joker-card ${rarityClass} ${edClass} my-1 pointer-events-none shadow-xl">
            ${renderJokerCardFace(item)}
          </div>
          <p class="text-[10px] text-amber-200/90 leading-tight text-center px-1 my-0.5 min-h-[28px]">${item.description}</p>
          <button class="w-full py-2 bg-[#f0ad28] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl border border-amber-200 shadow-lg active:scale-95 transition">Pick Joker</button>
        `;
      }

      cardSlot.addEventListener('click', () => {
        const pickRes = this.game.pickPackCard(index);
        if (pickRes.success) {
          this.playSound('win');
          this.render();
          if (pickRes.packFinished) {
            this.packOverlay.classList.add('hidden');
            if (this.shopBackgroundManager) {
              this.shopBackgroundManager.clearPackTheme();
            }
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
    if (this.gameOverScreen) {
      this.gameOverScreen.show(data);
    }
    this.playSound('game_over');
  }

  showVictory(data = {}) {
    if (this.victoryDeckName) {
      this.victoryDeckName.textContent = this.game.selectedDeck ? this.game.selectedDeck.name : 'Red Deck';
    }
    if (this.victoryStakeName) {
      this.victoryStakeName.textContent = this.game.selectedStake ? this.game.selectedStake.name : 'White Stake';
    }
    if (this.victoryRoundScore) {
      const score = (data && data.roundScore !== undefined) ? data.roundScore : (this.game.roundScore || 0);
      this.victoryRoundScore.textContent = score.toLocaleString();
    }
    if (this.victoryCash) {
      this.victoryCash.textContent = `$${this.game.money}`;
    }
    if (this.victoryModal) {
      this.victoryModal.classList.remove('hidden');
    }
    this.playSound('win');
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
