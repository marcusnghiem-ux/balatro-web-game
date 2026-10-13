/**
 * TransitionAnimator.js
 * Lead UI Animator implementation of authentic Balatro game transitions.
 *
 * Implements:
 * - THE BLIND SHIFT-DOWN TRANSITION:
 *   When the player clicks "Select" on a blind from the Ante map screen, the Boss/Big/Small Blind
 *   indicator box (with target score, reward chips, coin emblem) smoothly slides down vertically
 *   from top-center / off-screen into its locked position on the top-left HUD area over 0.4s
 *   using an authentic smooth ease-out quadratic transition (`cubic-bezier(0.16, 1, 0.3, 1)`).
 * - High-performance GPU layer composition (`transform: translate3d`) locked at 60fps.
 */

export class TransitionAnimator {
  /**
   * @param {import('./Renderer.js').Renderer} renderer
   */
  constructor(renderer) {
    this.renderer = renderer;
    this.isTransitioning = false;

    // Cache DOM Nodes
    this.blindCardEl = document.getElementById('blind-card');
    this.blindSelectStage = document.getElementById('blind-select-stage');
    this.playArena = document.getElementById('play-arena');
    this.blindSelectSidebarTitle = document.getElementById('blind-select-sidebar-title');
    this.targetScoreEl = document.getElementById('target-score');
    this.blindNameEl = document.getElementById('blind-name');
    this.blindRewardEl = document.getElementById('blind-reward');
    this.blindCoinEl = document.getElementById('blind-coin');
    this.anteCounterEl = document.getElementById('ante-counter');
  }

  refreshElements() {
    if (!this.blindCardEl) this.blindCardEl = document.getElementById('blind-card');
    if (!this.blindSelectStage) this.blindSelectStage = document.getElementById('blind-select-stage');
    if (!this.playArena) this.playArena = document.getElementById('play-arena');
    if (!this.blindSelectSidebarTitle) this.blindSelectSidebarTitle = document.getElementById('blind-select-sidebar-title');
    if (!this.targetScoreEl) this.targetScoreEl = document.getElementById('target-score');
    if (!this.blindNameEl) this.blindNameEl = document.getElementById('blind-name');
    if (!this.blindRewardEl) this.blindRewardEl = document.getElementById('blind-reward');
    if (!this.blindCoinEl) this.blindCoinEl = document.getElementById('blind-coin');
    if (!this.anteCounterEl) this.anteCounterEl = document.getElementById('ante-counter');
  }

  /**
   * Executes the authentic Blind Shift-Down transition sequence
   * @param {number} blindIndex Index of the selected blind (0: Small, 1: Big, 2: Boss)
   * @param {Function} [onComplete] Callback when the blind locks into the HUD
   */
  animateBlindShiftDown(blindIndex, onComplete = () => {}) {
    if (this.isTransitioning) {
      onComplete();
      return;
    }

    this.refreshElements();
    if (!this.blindCardEl) {
      onComplete();
      return;
    }

    this.isTransitioning = true;
    const game = this.renderer.game;
    const blind = (game.anteBlinds && game.anteBlinds[blindIndex])
      ? game.anteBlinds[blindIndex]
      : game.activeBlind;

    // 1. Synchronize the Blind Card HUD content before motion starts
    if (blind) {
      if (this.blindNameEl) this.blindNameEl.textContent = blind.name;
      if (this.targetScoreEl) {
        this.targetScoreEl.textContent = (blind.targetScore || game.roundTarget || 300).toLocaleString();
      }
      if (this.blindRewardEl) {
        this.blindRewardEl.textContent = '$'.repeat(blind.reward || 3);
      }
      if (this.anteCounterEl) {
        this.anteCounterEl.textContent = `Ante ${game.ante}/8`;
      }
    }

    // 2. Cross-fade stage views
    if (this.blindSelectSidebarTitle) {
      this.blindSelectSidebarTitle.classList.add('hidden');
    }
    if (this.blindSelectStage) {
      this.blindSelectStage.classList.add('hidden');
    }
    if (this.playArena) {
      this.playArena.classList.remove('hidden');
    }

    // Make blind card visible in normal DOM tree to measure destination
    this.blindCardEl.classList.remove('hidden');

    // 3. Measure target locked position in left-sidebar
    const destRect = this.blindCardEl.getBoundingClientRect();

    // Start position: Centered horizontally at top of viewport, off-screen vertically
    const startX = (window.innerWidth / 2) - (destRect.width / 2);
    const startY = -destRect.height - 80;

    const deltaX = startX - destRect.left;
    const deltaY = startY - destRect.top;

    // 4. Position at top-center/off-screen on GPU layer
    this.blindCardEl.style.transition = 'none';
    this.blindCardEl.style.willChange = 'transform, opacity';
    this.blindCardEl.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.06)`;
    this.blindCardEl.style.opacity = '0.92';
    this.blindCardEl.style.zIndex = '50';

    // Force style flush
    void this.blindCardEl.offsetHeight;

    // 5. Play sliding whoosh sound effect
    this.renderer.playSound('card_slide');

    // 6. Smoothly animate vertically down into locked position: 0.4s duration, cubic-bezier(0.16, 1, 0.3, 1)
    requestAnimationFrame(() => {
      this.blindCardEl.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease-out';
      this.blindCardEl.style.transform = 'translate3d(0, 0, 0) scale(1)';
      this.blindCardEl.style.opacity = '1';
    });

    // 7. On arrival at 400ms: Lock into place with physical settle effect
    setTimeout(() => {
      this.blindCardEl.style.transition = '';
      this.blindCardEl.style.transform = '';
      this.blindCardEl.style.willChange = '';
      this.blindCardEl.style.zIndex = '';

      // Tactile settle audio & subtle flash
      this.renderer.playSound('chip_add');
      this.blindCardEl.classList.add('blind-lock-settle');
      setTimeout(() => {
        this.blindCardEl.classList.remove('blind-lock-settle');
      }, 300);

      this.isTransitioning = false;
      onComplete();
    }, 400);
  }
}
