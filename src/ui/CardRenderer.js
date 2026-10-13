/**
 * CardRenderer.js
 * Dedicated visual card renderer for Balatro playing cards.
 * Generates authentic Balatro cards with high-fidelity vector face cards (King, Queen, Jack),
 * custom geometric suit insignia Aces, numbered pip matrices (2-10),
 * ornamental red geometric card backs, and foil/holo/polychrome/enhancement shaders.
 */

import { Card } from '../game/Card.js';
import { JokerCardRenderer, renderJokerCardFace } from './JokerCardRenderer.js';

export class CardRenderer {
  constructor() {}

  /**
   * Generates geometric SVG/HTML pip layout for numbered cards
   * @param {string} rank
   * @param {string} symbol
   * @returns {string}
   */
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

  /**
   * Calculates the authentic Balatro curved fan rotation and vertical offset for cards in hand
   * @param {number} index
   * @param {number} totalCards
   * @param {boolean} [isSelected=false]
   * @returns {{ rotation: number, translateY: number, transformString: string }}
   */
  getFanTransform(index, totalCards, isSelected = false) {
    const offset = index - (totalCards - 1) / 2;
    const rotation = offset * 2.2;
    const translateY = isSelected ? -24 : Math.abs(offset) * 2.5;
    return {
      rotation,
      translateY,
      transformString: `rotate(${rotation}deg) translateY(${translateY}px)`
    };
  }

  /**
   * Generates the inner HTML for a card
   * @param {import('../game/Card.js').Card} card
   * @returns {string}
   */
  getCardInnerHtml(card) {
    if (card.category === 'joker' || card.isJoker) {
      return renderJokerCardFace(card);
    }

    if (card.isFaceDown) {
      return Card.getCardBackSvg();
    }

    const suitSymbol = card.getSuitSymbol();
    const rank = card.rank;
    const enhancementText = card.enhancement !== 'none' ? card.enhancement : '';

    if (['J', 'Q', 'K'].includes(rank)) {
      return `
        <div class="flex items-center justify-between leading-none pointer-events-none z-10">
          <div class="flex flex-col items-center">
            <span class="font-black text-sm sm:text-base font-sans">${rank}</span>
            <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
          </div>
          <span class="text-[9px] font-black text-slate-400 uppercase font-sans">${enhancementText}</span>
        </div>
        <div class="card-face-svg-viewport w-full flex-1 flex items-center justify-center overflow-hidden py-0.5">
          ${Card.getFaceCardSvg(rank, card.suit)}
        </div>
        <div class="flex items-center justify-between leading-none rotate-180 pointer-events-none z-10">
          <div class="flex flex-col items-center">
            <span class="font-black text-sm sm:text-base font-sans">${rank}</span>
            <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
          </div>
        </div>
      `;
    }

    if (rank === 'A') {
      return `
        <div class="flex items-center justify-between leading-none pointer-events-none z-10">
          <div class="flex flex-col items-center">
            <span class="font-black text-sm sm:text-base font-sans">A</span>
            <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
          </div>
          <span class="text-[9px] font-black text-slate-400 uppercase font-sans">${enhancementText}</span>
        </div>
        <div class="card-face-svg-viewport w-full flex-1 flex items-center justify-center overflow-hidden py-0.5">
          ${Card.getAceSvg(card.suit)}
        </div>
        <div class="flex items-center justify-between leading-none rotate-180 pointer-events-none z-10">
          <div class="flex flex-col items-center">
            <span class="font-black text-sm sm:text-base font-sans">A</span>
            <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
          </div>
        </div>
      `;
    }

    // Numbered Cards 2-10
    const pipsHtml = this.generateCardPipsHtml(rank, suitSymbol);
    return `
      <div class="flex items-center justify-between leading-none pointer-events-none">
        <div class="flex flex-col items-center">
          <span class="font-black text-sm sm:text-base font-sans">${rank}</span>
          <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
        </div>
        <span class="text-[9px] font-black text-slate-400 uppercase font-sans">${enhancementText}</span>
      </div>

      ${pipsHtml}

      <div class="flex items-center justify-between leading-none rotate-180 pointer-events-none">
        <div class="flex flex-col items-center">
          <span class="font-black text-sm sm:text-base font-sans">${rank}</span>
          <span class="text-xs sm:text-sm font-sans">${suitSymbol}</span>
        </div>
      </div>
    `;
  }

  /**
   * Instantiates a fully-configured card DOM element
   * @param {import('../game/Card.js').Card} card
   * @param {number} index
   * @param {number} totalCards
   * @param {Object} [options]
   * @returns {HTMLElement}
   */
  createCardElement(card, index, totalCards, options = {}) {
    if (card.category === 'joker' || card.isJoker) {
      return JokerCardRenderer.createJokerCardElement(card, index, options);
    }

    const cardEl = document.createElement('div');
    cardEl.className = `playing-card suit-${card.suit}`;
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.index = index;

    if (card.selected) cardEl.classList.add('card-selected');
    if (card.debuffed) cardEl.classList.add('card-debuffed');
    if (card.edition !== 'normal') cardEl.classList.add(`edition-${card.edition}`);
    if (card.enhancement !== 'none') cardEl.classList.add(`enhancement-${card.enhancement}`);
    if (card.isFaceDown) cardEl.classList.add('card-face-down');

    // Apply resting fan layout if not custom styled
    if (!options.customTransform) {
      const fan = this.getFanTransform(index, totalCards, card.selected);
      cardEl.style.transform = fan.transformString;
    }

    cardEl.innerHTML = this.getCardInnerHtml(card);
    return cardEl;
  }

  /**
   * Instantiates a clean authentic Joker card element
   * @param {Object} joker
   * @param {number} [index=0]
   * @param {Object} [options]
   * @returns {HTMLElement}
   */
  createJokerElement(joker, index = 0, options = {}) {
    return JokerCardRenderer.createJokerCardElement(joker, index, options);
  }

  /**
   * Renders authentic clean Joker card face HTML
   * @param {Object} joker
   * @param {Object} [options]
   * @returns {string}
   */
  renderJokerFace(joker, options = {}) {
    return renderJokerCardFace(joker, options);
  }
}
