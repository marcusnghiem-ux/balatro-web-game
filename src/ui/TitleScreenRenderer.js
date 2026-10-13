/**
 * TitleScreenRenderer.js
 * Visual coordinator for Balatro Title Screen dynamics.
 * - Deep midnight navy/indigo base background overlaid with slow, hypnotic,
 *   fluid waves of vibrant crimson red slowly shifting into royal blue.
 * - Ensures foreground pixel-art "BALATRO" logo has zero obscuring card graphics.
 * - Manages clean canvas resizing and frame stability without layout thrashing.
 */

export class TitleScreenRenderer {
  /**
   * @param {HTMLElement} titleScreenElement
   * @param {import('./BackgroundRenderer.js').BackgroundRenderer} backgroundRenderer
   */
  constructor(titleScreenElement, backgroundRenderer) {
    this.titleScreenEl = titleScreenElement || document.getElementById('title-screen');
    this.bgRenderer = backgroundRenderer;
    this.logoText = document.querySelector('.title-balatro-text');
    this.initVisualHierarchy();
  }

  initVisualHierarchy() {
    if (this.logoText) {
      // Enforce high foreground z-index and clean letter spacing
      this.logoText.style.zIndex = '25';
      this.logoText.style.position = 'relative';
      this.logoText.style.pointerEvents = 'none';
    }

    // Verify background renderer is focused on title screen palette
    if (this.bgRenderer && typeof this.bgRenderer.setAntePalette === 'function') {
      this.bgRenderer.setAntePalette(0); // 0 = Title Palette (Midnight Navy, Crimson, Royal Blue)
    }
  }

  onResize() {
    if (this.bgRenderer && typeof this.bgRenderer.handleResize === 'function') {
      this.bgRenderer.handleResize();
    }
  }
}
