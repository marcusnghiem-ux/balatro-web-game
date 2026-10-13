/**
 * MainMenu.js
 * Lead Architecture for Balatro Title & Main Screen UI.
 * Features:
 * - Clean logo rendering & foreground z-index hierarchy: "BALATRO" pixel-art logo
 *   renders prominently in the foreground with zero obscuring cards or locks.
 * - Dark container bottom panel cleanly housing:
 *   - "CONTINUE" (highlighted when active run exists)
 *   - "PLAY"
 *   - "OPTIONS"
 *   - "QUIT"
 *   - "COLLECTION" (with authentic red notification exclamation badge)
 * - Profile P1 badge on left
 * - 100% clean touch and mouse interaction (complete purge of controller/gamepad icons)
 */

export class MainMenu {
  /**
   * @param {import('../game/GameEngine.js').GameEngine} game
   * @param {import('./Renderer.js').Renderer} renderer
   */
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;

    this.titleScreenEl = document.getElementById('title-screen');
    this.playBtn = document.getElementById('title-play-btn');
    this.continueBtn = document.getElementById('title-continue-btn');
    this.optionsBtn = document.getElementById('title-options-btn');
    this.quitBtn = document.getElementById('title-quit-btn');
    this.collectionBtn = document.getElementById('title-collection-btn');

    this.init();
  }

  init() {
    this.bindButtons();
    this.updateContinueButton();
  }

  bindButtons() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.renderer.playSound('card_select');
        this.openDeckSelection();
      });
    }

    if (this.continueBtn) {
      this.continueBtn.addEventListener('click', () => {
        this.renderer.playSound('win');
        this.continueRun();
      });
    }

    if (this.optionsBtn) {
      this.optionsBtn.addEventListener('click', () => {
        this.renderer.playSound('card_slide');
        this.renderer.openOptionsModal();
      });
    }

    if (this.quitBtn) {
      this.quitBtn.addEventListener('click', () => {
        this.renderer.playSound('card_deselect');
        // Gentle arcade reset
        if (confirm('Exit game and clear current session?')) {
          this.game.saveManager?.clearActiveRun();
          window.location.reload();
        }
      });
    }

    if (this.collectionBtn) {
      this.collectionBtn.addEventListener('click', () => {
        this.renderer.playSound('card_slide');
        this.renderer.openCollectionModal();
      });
    }
  }

  /**
   * Checks if an ongoing run exists in storage to show the CONTINUE button
   */
  updateContinueButton() {
    if (!this.continueBtn) return;
    const hasRun = this.game.saveManager?.hasActiveRun();
    if (hasRun) {
      this.continueBtn.classList.remove('hidden');
    } else {
      this.continueBtn.classList.add('hidden');
    }
  }

  openDeckSelection() {
    this.renderer.openDeckSelectModal();
  }

  continueRun() {
    const success = this.game.loadSavedRun();
    if (success) {
      if (this.titleScreenEl) this.titleScreenEl.classList.add('hidden');
      const app = document.getElementById('app');
      if (app) app.classList.remove('hidden');
      this.renderer.render();
      if (this.game.state === 'SHOP') {
        this.renderer.renderShop();
      }
    } else {
      this.openDeckSelection();
    }
  }

  show() {
    if (this.titleScreenEl) {
      this.titleScreenEl.classList.remove('hidden');
    }
    this.updateContinueButton();
  }

  hide() {
    if (this.titleScreenEl) {
      this.titleScreenEl.classList.add('hidden');
    }
  }
}
