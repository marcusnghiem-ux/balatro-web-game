/**
 * TouchController.js
 * Hardware-agnostic PointerEvents interaction controller providing seamless touch, stylus,
 * and mouse tracking for iPad, mobile devices, and desktop browsers.
 *
 * Interaction Features:
 * 1) Hand cards: Tap to select/deselect, smooth horizontal drag-and-drop reordering with fan curve preservation.
 * 2) Jokers bar: Drag-and-drop horizontal reordering with dynamic gap insertion.
 *    - In Shop Mode: Dragging upward transforms top Joker bar into "Sell $[sellValue]" drop zone.
 * 3) Consumable bar: Drag-and-drop horizontal reordering with dynamic gap insertion.
 *    - In Shop Mode: Dragging to top bar sells the consumable for +$[sellValue].
 *    - In Round Mode: Dragging toward right side reveals the red "USE" drop target box (screenshot 20261012_131157_HDR.jpg).
 * 4) Fluid Motion & Anti-Sticking:
 *    - Hardware pointer capture release safety.
 *    - Global cleanup on window pointerup/pointercancel preventing stuck cards.
 */

export class TouchController {
  /**
   * @param {import('../game/GameEngine.js').GameEngine} gameEngine
   * @param {HTMLElement} handContainer
   * @param {HTMLElement|Function} jokersContainerOrSound
   * @param {Function} [onSoundRequest]
   */
  constructor(gameEngine, handContainer, jokersContainerOrSound, onSoundRequest = () => { }) {
    this.gameEngine = gameEngine;
    this.handContainer = handContainer;

    if (typeof jokersContainerOrSound === 'function') {
      this.jokersContainer = document.getElementById('jokers-container');
      this.playSound = jokersContainerOrSound;
    } else {
      this.jokersContainer = jokersContainerOrSound || document.getElementById('jokers-container');
      this.playSound = onSoundRequest;
    }

    this.consumablesContainer = document.getElementById('consumables-container');
    this.jokerOverlay = document.getElementById('joker-bar-drop-overlay');
    this.jokerTitle = document.getElementById('joker-bar-action-title');
    this.jokerCost = document.getElementById('joker-bar-action-cost');
    this.gameUseDropZone = document.getElementById('game-use-drop-zone');

    // Drag tracking state
    this.activePointerId = null;
    this.dragType = null; // 'hand' | 'joker' | 'consumable'
    this.dragContainer = null;
    this.draggedCardElement = null;
    this.draggedCardId = null;
    this.draggedItemData = null;
    this.startIndex = -1;
    this.targetIndex = -1;

    // Movement coordinates
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.dragThreshold = 8; // Pixels before drag mode activates

    this.initListeners();
  }

  /**
   * Attach unified PointerEvent listeners
   */
  initListeners() {
    if (this.handContainer) {
      this.handContainer.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: false });
    }
    if (this.jokersContainer) {
      this.jokersContainer.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: false });
    }
    if (this.consumablesContainer) {
      this.consumablesContainer.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: false });
    }

    window.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
    window.addEventListener('pointerup', this.onPointerUp.bind(this), { passive: false });
    window.addEventListener('pointercancel', this.onPointerCancel.bind(this), { passive: false });
  }

  refreshDomElements() {
    if (!this.jokerOverlay) this.jokerOverlay = document.getElementById('joker-bar-drop-overlay');
    if (!this.jokerTitle) this.jokerTitle = document.getElementById('joker-bar-action-title');
    if (!this.jokerCost) this.jokerCost = document.getElementById('joker-bar-action-cost');
    if (!this.gameUseDropZone) this.gameUseDropZone = document.getElementById('game-use-drop-zone');
  }

  onPointerDown(e) {
    if (this.activePointerId !== null) return;

    // Ignore interactive sub-buttons
    if (
      e.target.closest('button') ||
      e.target.closest('.sell-joker-btn') ||
      e.target.closest('.use-consumable-btn') ||
      e.target.closest('.sell-consumable-btn')
    ) {
      return;
    }

    const handCard = e.target.closest('.playing-card');
    const jokerCard = e.target.closest('.joker-card');
    const consumableCard = e.target.closest('.consumable-card');

    if (!handCard && !jokerCard && !consumableCard) return;

    this.refreshDomElements();
    this.activePointerId = e.pointerId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.currentX = e.clientX;
    this.currentY = e.clientY;
    this.isDragging = false;

    if (handCard) {
      this.dragType = 'hand';
      this.dragContainer = this.handContainer;
      this.draggedCardElement = handCard;
      this.draggedCardId = handCard.dataset.cardId;
      this.startIndex = parseInt(handCard.dataset.index, 10);
      this.draggedItemData = null;
    } else if (jokerCard) {
      this.dragType = 'joker';
      this.dragContainer = this.jokersContainer;
      this.draggedCardElement = jokerCard;
      this.draggedCardId = jokerCard.id;
      this.startIndex = parseInt(jokerCard.dataset.index, 10);
      const jokers = this.gameEngine.jokerSystem ? this.gameEngine.jokerSystem.getJokers() : [];
      this.draggedItemData = jokers[this.startIndex] || null;
    } else if (consumableCard) {
      this.dragType = 'consumable';
      this.dragContainer = this.consumablesContainer;
      this.draggedCardElement = consumableCard;
      this.draggedCardId = consumableCard.id;
      this.startIndex = parseInt(consumableCard.dataset.index, 10);
      const items = this.gameEngine.consumableSystem ? this.gameEngine.consumableSystem.getItems() : [];
      this.draggedItemData = items[this.startIndex] || null;
    }

    this.targetIndex = this.startIndex;

    try {
      this.draggedCardElement.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore capture error
    }
  }

  onPointerMove(e) {
    if (this.activePointerId !== e.pointerId || !this.draggedCardElement) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    const distance = Math.hypot(deltaX, deltaY);

    if (!this.isDragging && distance > this.dragThreshold) {
      this.isDragging = true;
      this.draggedCardElement.classList.add('is-dragging');
      this.draggedCardElement.style.zIndex = '60';
      this.playSound('card_drag');

      // If dragging owned Joker or Consumable in the shop, show "Sell $[sellValue]" overlay
      if (this.dragType === 'joker' && this.gameEngine.state === 'SHOP') {
        const sellVal = this.draggedItemData?.sellValue !== undefined ? this.draggedItemData.sellValue : 2;
        this.showSellOverlay(sellVal);
      } else if (this.dragType === 'consumable') {
        const sellVal = this.draggedItemData?.sellValue !== undefined ? this.draggedItemData.sellValue : 1;
        if (this.gameEngine.state === 'SHOP') {
          this.showSellOverlay(sellVal);
        } else {
          // In active round: Reveal red "USE" drop target box (Screenshot 20261012_131157_HDR.jpg)
          this.showGameUseDropZone();
        }
      }
    }

    if (this.isDragging) {
      e.preventDefault();
      this.currentX = e.clientX;
      this.currentY = e.clientY;

      // Apply fluid translation and velocity tilt
      const tilt = Math.min(Math.max(deltaX * 0.12, -15), 15);
      this.draggedCardElement.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${tilt}deg) scale(1.12)`;

      // Check external drop zones
      const isOverSellZone = this.checkPointInOverlay(this.jokerOverlay, e.clientX, e.clientY);
      const isOverUseZone = this.checkPointInOverlay(this.gameUseDropZone, e.clientX, e.clientY);

      if (this.jokerOverlay) {
        this.jokerOverlay.classList.toggle('is-drag-over', isOverSellZone);
      }
      if (this.gameUseDropZone) {
        this.gameUseDropZone.classList.toggle('is-drag-over', isOverUseZone);
      }

      // Reordering sibling shifts if pointer remains near container
      if (!isOverSellZone && !isOverUseZone) {
        this.updateSiblingShifts(e.clientX);
      } else {
        this.clearSiblingShifts();
      }
    }
  }

  showSellOverlay(sellVal) {
    if (!this.jokerOverlay) return;
    if (this.jokerTitle) this.jokerTitle.textContent = 'SELL';
    if (this.jokerCost) this.jokerCost.textContent = `+$${sellVal}`;
    this.jokerOverlay.classList.remove('overlay-buy');
    this.jokerOverlay.classList.add('overlay-sell');
    this.jokerOverlay.style.opacity = '1';
    this.jokerOverlay.style.pointerEvents = 'auto';
  }

  hideSellOverlay() {
    if (!this.jokerOverlay) return;
    this.jokerOverlay.style.opacity = '0';
    this.jokerOverlay.style.pointerEvents = 'none';
    this.jokerOverlay.classList.remove('is-drag-over', 'overlay-sell');
  }

  showGameUseDropZone() {
    if (!this.gameUseDropZone) return;
    this.gameUseDropZone.classList.remove('hidden');
    this.gameUseDropZone.style.opacity = '1';
  }

  hideGameUseDropZone() {
    if (!this.gameUseDropZone) return;
    this.gameUseDropZone.classList.add('hidden');
    this.gameUseDropZone.classList.remove('is-drag-over');
  }

  checkPointInOverlay(element, x, y) {
    if (!element || element.classList.contains('hidden')) return false;
    const rect = element.getBoundingClientRect();
    return (
      x >= rect.left - 10 &&
      x <= rect.right + 10 &&
      y >= rect.top - 10 &&
      y <= rect.bottom + 10
    );
  }

  /**
   * Determine target slot index and apply dynamic shift animation to adjacent cards
   */
  updateSiblingShifts(pointerX) {
    if (!this.dragContainer) return;

    const selector = this.dragType === 'hand'
      ? '.playing-card'
      : (this.dragType === 'joker' ? '.joker-card' : '.consumable-card');

    const cardElements = Array.from(this.dragContainer.querySelectorAll(selector));
    let newTargetIndex = this.startIndex;

    for (let i = 0; i < cardElements.length; i++) {
      const card = cardElements[i];
      if (card === this.draggedCardElement) continue;

      const rect = card.getBoundingClientRect();
      const cardMidX = rect.left + rect.width / 2;

      if (pointerX < cardMidX && i < this.startIndex) {
        newTargetIndex = i;
        break;
      } else if (pointerX > cardMidX && i > this.startIndex) {
        newTargetIndex = i;
      }
    }

    this.targetIndex = newTargetIndex;

    const shiftDistance = this.dragType === 'hand' ? 44 : 32;

    cardElements.forEach((card, i) => {
      if (card === this.draggedCardElement) return;

      let shift = 0;
      if (this.startIndex < this.targetIndex) {
        if (i > this.startIndex && i <= this.targetIndex) {
          shift = -shiftDistance;
        }
      } else if (this.startIndex > this.targetIndex) {
        if (i >= this.targetIndex && i < this.startIndex) {
          shift = shiftDistance;
        }
      }

      if (this.dragType === 'hand' && !card.classList.contains('card-selected')) {
        const total = cardElements.length;
        const offset = i - (total - 1) / 2;
        const rotation = offset * 2.2;
        const translateY = Math.abs(offset) * 2.5;
        card.style.transform = `translate3d(${shift}px, ${translateY}px, 0) rotate(${rotation}deg)`;
      } else {
        card.style.transform = shift !== 0 ? `translate3d(${shift}px, 0, 0)` : '';
      }
      card.style.transition = 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)';
    });
  }

  clearSiblingShifts() {
    if (!this.dragContainer) return;
    const selector = this.dragType === 'hand'
      ? '.playing-card'
      : (this.dragType === 'joker' ? '.joker-card' : '.consumable-card');

    const cardElements = Array.from(this.dragContainer.querySelectorAll(selector));
    cardElements.forEach((card) => {
      card.style.transition = '';
      if (card !== this.draggedCardElement) {
        card.style.transform = '';
      }
    });
  }

  onPointerUp(e) {
    if (this.activePointerId !== e.pointerId) return;

    const dragType = this.dragType;
    const wasDragging = this.isDragging;
    const startIdx = this.startIndex;
    const targetIdx = this.targetIndex;
    const cardId = this.draggedCardId;
    const dropX = e.clientX;
    const dropY = e.clientY;

    const droppedOnSellZone = this.checkPointInOverlay(this.jokerOverlay, dropX, dropY);
    const droppedOnUseZone = this.checkPointInOverlay(this.gameUseDropZone, dropX, dropY);

    this.clearSiblingShifts();
    this.hideSellOverlay();
    this.hideGameUseDropZone();
    this.resetDragState();

    if (dragType === 'hand') {
      if (wasDragging) {
        if (startIdx !== targetIdx && targetIdx !== -1) {
          this.gameEngine.reorderHand(startIdx, targetIdx);
          this.playSound('card_slide');
        } else {
          this.gameEngine.notify('HAND_RENDER_NEEDED');
        }
      } else {
        // Tap / Click action: Toggle card selection
        if (cardId) {
          const selected = this.gameEngine.toggleCardSelection(cardId);
          this.playSound(selected ? 'card_select' : 'card_deselect');
        }
      }
    } else if (dragType === 'joker') {
      if (wasDragging) {
        if (droppedOnSellZone && this.gameEngine.state === 'SHOP') {
          // Sell Joker on top bar drop
          this.gameEngine.sellJoker(startIdx);
          this.playSound('cash');
        } else if (startIdx !== targetIdx && targetIdx !== -1) {
          this.gameEngine.reorderJokers(startIdx, targetIdx);
          this.playSound('card_slide');
        } else {
          this.gameEngine.notify('JOKER_REORDERED');
        }
      }
    } else if (dragType === 'consumable') {
      if (wasDragging) {
        // BUG FIX #13: Only sell consumables in SHOP phase (authentic behaviour).
        if (droppedOnSellZone && this.gameEngine.state === 'SHOP') {
          // Sell consumable on top bar drop
          this.gameEngine.sellConsumable(startIdx);
          this.playSound('cash');
        } else if (droppedOnUseZone) {
          // Use consumable on right-side USE drop
          const res = this.gameEngine.useConsumable(startIdx);
          if (res && res.success) {
            this.playSound('win');
          } else {
            this.playSound('card_deselect');
          }
        } else if (startIdx !== targetIdx && targetIdx !== -1) {
          this.gameEngine.reorderConsumables(startIdx, targetIdx);
          this.playSound('card_slide');
        } else {
          this.gameEngine.notify('CONSUMABLE_REORDERED');
        }
      }
    }
  }

  onPointerCancel(e) {
    if (this.activePointerId === e.pointerId) {
      const dragType = this.dragType;
      this.clearSiblingShifts();
      this.hideSellOverlay();
      this.hideGameUseDropZone();
      this.resetDragState();

      if (dragType === 'hand') {
        this.gameEngine.notify('HAND_RENDER_NEEDED');
      } else if (dragType === 'joker') {
        this.gameEngine.notify('JOKER_REORDERED');
      } else if (dragType === 'consumable') {
        this.gameEngine.notify('CONSUMABLE_REORDERED');
      }
    }
  }

  resetDragState() {
    if (this.draggedCardElement) {
      this.draggedCardElement.classList.remove('is-dragging');
      this.draggedCardElement.style.transform = '';
      this.draggedCardElement.style.zIndex = '';
      this.draggedCardElement.style.transition = '';
      // BUG FIX #14: Release pointer capture BEFORE nulling activePointerId.
      // Previously activePointerId was null by the time the hasPointerCapture guard ran,
      // so capture was never released → sticky dragged cards on fast flick gestures.
      try {
        if (this.activePointerId !== null && this.draggedCardElement.hasPointerCapture(this.activePointerId)) {
          this.draggedCardElement.releasePointerCapture(this.activePointerId);
        }
      } catch (err) {
        // Ignore capture release error on elements already detached from DOM
      }
    }

    // Null the pointer ID only AFTER the capture release above
    this.activePointerId = null;
    this.dragType = null;
    this.dragContainer = null;
    this.draggedCardElement = null;
    this.draggedCardId = null;
    this.draggedItemData = null;
    this.isDragging = false;
    this.startIndex = -1;
    this.targetIndex = -1;
  }
}
