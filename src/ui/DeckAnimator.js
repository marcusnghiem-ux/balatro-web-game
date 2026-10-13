/**
 * DeckAnimator.js
 * Lead UI Animator implementation of authentic Balatro card-dealing mechanics.
 *
 * Implements:
 * - DECK UNRAVELLING & CARD DEALING ANIMATION:
 *   Cards physically animate out of the bottom-right deck stack sequentially (with 50ms delay between cards).
 * - PARABOLIC ARC TRAJECTORY:
 *   Each card starts at the exact coordinates of the deck pile `(deckX, deckY)`,
 *   slides upward and leftward in an authentic arc, rotates during flight,
 *   flips face-up, and settles into its fan slot with a tactile settling bounce/scale effect.
 * - 60FPS LOCKED PERFORMANCE:
 *   Hardware-accelerated CSS 3D transforms (`translate3d`) and `requestAnimationFrame`.
 */

import { Card } from '../game/Card.js';

export class DeckAnimator {
  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('./CardRenderer.js').CardRenderer} cardRenderer
   */
  constructor(renderer, cardRenderer) {
    this.renderer = renderer;
    this.cardRenderer = cardRenderer;
    this.isDealing = false;
    this.activeFlyers = [];
    this.staggerTimers = [];
  }

  /**
   * Animates dealing cards sequentially out of the deck pile into the player's hand
   * @param {Array<import('../game/Card.js').Card>} cards The cards to deal into hand
   * @param {HTMLElement} handContainer The #player-hand DOM container
   * @param {Function} [onComplete] Callback invoked after the last card has settled
   */
  dealCards(cards, handContainer, onComplete = () => {}) {
    if (!cards || cards.length === 0 || !handContainer) {
      onComplete();
      return;
    }

    // Cancel any ongoing sequence cleanly
    this.cancelOngoing();
    this.isDealing = true;

    // 1. Establish final layout in playerHandEl by rendering invisible card elements
    handContainer.innerHTML = '';
    const totalCards = cards.length;
    const targetCardElements = [];

    cards.forEach((card, i) => {
      const el = this.cardRenderer.createCardElement(card, i, totalCards);
      // Temporarily hide actual cards in DOM so they don't pop into existence
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      handContainer.appendChild(el);
      targetCardElements.push(el);
    });

    // Force layout flush so destination coordinates can be accurately read
    void handContainer.offsetHeight;

    // 2. Measure bottom-right deck pile starting coordinates
    const deckEl = document.querySelector('#play-arena .deck-pile-card') ||
                   document.querySelector('.deck-pile-card') ||
                   document.getElementById('deck-counter');

    const deckRect = deckEl ? deckEl.getBoundingClientRect() : {
      left: window.innerWidth - 120,
      top: window.innerHeight - 170,
      width: 82,
      height: 122
    };

    const deckX = deckRect.left;
    const deckY = deckRect.top;
    const cardWidth = deckRect.width || 82;
    const cardHeight = deckRect.height || 122;

    let completedCards = 0;

    // 3. Sequential dealing loop with authentic 50ms stagger
    cards.forEach((card, i) => {
      const delay = i * 50;

      const timerId = setTimeout(() => {
        const targetEl = targetCardElements[i];
        if (!targetEl) return;

        const targetRect = targetEl.getBoundingClientRect();
        const fan = this.cardRenderer.getFanTransform(i, totalCards, card.selected);

        // Sound: Card deals out of the deck pile with authentic pitch shift
        this.renderer.playSound('card_slide');

        // Execute parabolic arc flight
        this.animateCardFlight({
          card,
          index: i,
          totalCards,
          startX: deckX,
          startY: deckY,
          destX: targetRect.left,
          destY: targetRect.top,
          cardWidth,
          cardHeight,
          targetFan: fan,
          targetEl,
          onArrive: () => {
            completedCards++;
            if (completedCards >= totalCards) {
              this.isDealing = false;
              // Re-enable pointer interactions
              targetCardElements.forEach(el => {
                el.style.pointerEvents = 'auto';
              });
              onComplete();
            }
          }
        });
      }, delay);

      this.staggerTimers.push(timerId);
    });
  }

  /**
   * Animates a single card flying along a parabolic arc from deck pile to hand slot
   */
  animateCardFlight({
    card,
    index,
    totalCards,
    startX,
    startY,
    destX,
    destY,
    cardWidth,
    cardHeight,
    targetFan,
    targetEl,
    onArrive
  }) {
    // Create dedicated flying card element
    const flyer = document.createElement('div');
    flyer.className = `playing-card card-drag-avatar select-none pointer-events-none`;
    flyer.style.position = 'fixed';
    flyer.style.width = `${cardWidth}px`;
    flyer.style.height = `${cardHeight}px`;
    flyer.style.left = '0px';
    flyer.style.top = '0px';
    flyer.style.margin = '0';
    flyer.style.zIndex = `${100 + index}`;
    flyer.style.willChange = 'transform, opacity';

    // Start with ornamental Balatro face-down card back
    flyer.innerHTML = Card.getCardBackSvg();
    document.body.appendChild(flyer);
    this.activeFlyers.push(flyer);

    // Parabolic Arc Geometry
    const flightDuration = 340; // milliseconds
    const startTime = performance.now();

    // Flight rotation parameters
    const startAngle = 12; // tilted as it slides off deck
    const midAngle = -8;   // rotates counter-clockwise in flight
    const destAngle = targetFan.rotation;

    // Peak height of upward arc
    const horizontalDist = Math.abs(destX - startX);
    const arcHeight = Math.min(125, Math.max(50, horizontalDist * 0.18));

    let hasFlippedFace = false;

    const frameStep = (currentTime) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(1.0, elapsed / flightDuration);

      // Smooth ease-out quadratic transition
      const progress = 1 - Math.pow(1 - rawProgress, 2);

      // Parabolic arc crest
      const arcCrest = -Math.sin(rawProgress * Math.PI) * arcHeight;
      const curX = startX + (destX - startX) * progress;
      const curY = startY + (destY - startY) * progress + arcCrest;

      // Dynamic rotation interpolation
      let curAngle = 0;
      if (rawProgress < 0.5) {
        const subT = rawProgress / 0.5;
        curAngle = startAngle + (midAngle - startAngle) * subT;
      } else {
        const subT = (rawProgress - 0.5) / 0.5;
        curAngle = midAngle + (destAngle - midAngle) * subT;
      }

      // Dynamic scale: expands slightly mid-flight, then shrinks on arrival
      const scale = 0.92 + Math.sin(rawProgress * Math.PI) * 0.16;

      // Card flip at 55% of flight path (reveals card face unless boss blind debuffs face-down)
      if (rawProgress >= 0.55 && !hasFlippedFace) {
        hasFlippedFace = true;
        if (!card.isFaceDown) {
          flyer.className = `playing-card suit-${card.suit} card-drag-avatar select-none pointer-events-none`;
          if (card.edition !== 'normal') flyer.classList.add(`edition-${card.edition}`);
          if (card.enhancement !== 'none') flyer.classList.add(`enhancement-${card.enhancement}`);
          flyer.innerHTML = this.cardRenderer.getCardInnerHtml(card);
        }
      }

      // Hardware-accelerated 3D transform
      flyer.style.transform = `translate3d(${curX}px, ${curY}px, 0) rotate(${curAngle}deg) scale(${scale})`;

      if (rawProgress < 1.0) {
        requestAnimationFrame(frameStep);
      } else {
        // Arrival Sequence: Remove flyer & trigger settling bounce on native card element
        flyer.remove();
        const flyerIdx = this.activeFlyers.indexOf(flyer);
        if (flyerIdx !== -1) this.activeFlyers.splice(flyerIdx, 1);

        targetEl.style.visibility = 'visible';
        targetEl.style.opacity = '1';
        targetEl.classList.add('card-settle-bounce');

        setTimeout(() => {
          targetEl.classList.remove('card-settle-bounce');
        }, 250);

        onArrive();
      }
    };

    requestAnimationFrame(frameStep);
  }

  /**
   * Cancels any active dealing sequence and settles all cards immediately
   */
  cancelOngoing() {
    this.staggerTimers.forEach(id => clearTimeout(id));
    this.staggerTimers = [];

    this.activeFlyers.forEach(flyer => flyer.remove());
    this.activeFlyers = [];

    this.isDealing = false;
  }
}
