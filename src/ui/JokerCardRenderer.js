/**
 * JokerCardRenderer.js
 * High-fidelity, authentic Balatro Joker card rendering engine.
 *
 * SPECIFICATIONS:
 * 1. Clean face: No printed bottom name tag text box.
 * 2. Clean face: No permanent top rarity badge (e.g., "RARE").
 * 3. Margins: Classic vertical "JOKER" typography down the left margin
 *    (reading downwards) and right margin (upside down / reading upwards with 180° symmetry).
 * 4. Center: Clean, centered pixel art illustration without visual clutter.
 * 5. Joker name and rarity are displayed exclusively in hover/tap tooltips.
 */

import { getJokerIllustrationHtml } from './JokerArtwork.js';

export class JokerCardRenderer {
  /**
   * Generates authentic, uncluttered Balatro Joker card face HTML
   * @param {Object} joker
   * @param {Object} [options]
   * @returns {string}
   */
  static renderJokerCardFace(joker, options = {}) {
    const {
      badgeHtml = '',
      copyTargetHtml = ''
    } = options;

    const illustration = getJokerIllustrationHtml(joker);

    return `
      <div class="joker-body-grid w-full h-full flex items-stretch justify-between relative px-0.5 overflow-hidden">
        <!-- Left Vertical JOKER Ribbon (reading downwards) -->
        <div class="joker-side-label-left" aria-hidden="true">
          <span>J</span><span>O</span><span>K</span><span>E</span><span>R</span>
        </div>

        <!-- Center Clean Art Canvas (Full-bleed / Centered pixel art) -->
        <div class="joker-fullbleed-canvas flex-1 relative flex items-center justify-center p-0.5 overflow-hidden mx-0.5">
          <div class="w-full h-full flex items-center justify-center relative">
            ${illustration}
          </div>
          ${badgeHtml}
          ${copyTargetHtml}
        </div>

        <!-- Right Vertical JOKER Ribbon (inverted 180° for authentic playing card rotational symmetry) -->
        <div class="joker-side-label-right" aria-hidden="true">
          <span>J</span><span>O</span><span>K</span><span>E</span><span>R</span>
        </div>
      </div>
    `;
  }

  /**
   * Instantiates a fully configured Joker card DOM element
   * @param {Object} joker
   * @param {number} [index]
   * @param {Object} [options]
   * @returns {HTMLElement}
   */
  static createJokerCardElement(joker, index = 0, options = {}) {
    const cardEl = document.createElement('div');
    const rarityClass = joker.rarity ? `rarity-${joker.rarity.toLowerCase()}` : 'rarity-common';
    const editionClass = joker.edition && joker.edition !== 'normal' ? `edition-${joker.edition}` : '';

    cardEl.className = `joker-card ${rarityClass} ${editionClass}`.trim();
    cardEl.dataset.jokerId = joker.id;
    cardEl.dataset.index = index;

    if (joker.debuffed) cardEl.classList.add('card-debuffed');
    if (joker.isRental) cardEl.classList.add('is-rental');
    if (joker.isPerishable) cardEl.classList.add('is-perishable');
    if (joker.isEternal) cardEl.classList.add('is-eternal');

    cardEl.innerHTML = JokerCardRenderer.renderJokerCardFace(joker, options);
    return cardEl;
  }
}

// Global helper export
export function renderJokerCardFace(joker, options = {}) {
  return JokerCardRenderer.renderJokerCardFace(joker, options);
}

export const jokerCardRenderer = new JokerCardRenderer();
