
//  * TouchController.js
//  * Hardware-agnostic PointerEvents controller providing seamless touch, stylus,
//  * and mouse interactions for iPad, mobile devices, and desktop browsers.
//  * 
//  * Supports:
//  * 1) Hand cards: Tap to select/deselect, horizontal drag-and-drop reordering
//  * 2) Jokers bar (0/5): Horizontal drag-and-drop reordering with dynamic insertion shifts
//  * 3) Consumable bar (0/2): Horizontal drag-and-drop reordering with dynamic insertion shifts
//  * 
//  * Dynamic Insertion Shift:
//  * While dragging, sibling cards smoothly slide left or right to visually open the drop gap,
//  * locking the card into its new sequence on release.
//  */

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

    // Drag tracking state
    this.activePointerId = null;
    this.dragType = null; // 'hand', 'joker', or 'consumable'
    this.dragContainer = null;
    this.draggedCardElement = null;
    this.draggedCardId = null;
    this.startIndex = -1;
    this.targetIndex = -1;

    // Movement coordinates
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.dragThreshold = 8; // Pixels moved before initiating drag mode

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

  onPointerDown(e) {
    // Only accept primary pointer (prevent multi-touch conflicts)
    if (this.activePointerId !== null) return;

    // Ignore interactive sub-buttons like Sell, Use, or Buy
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
    } else if (jokerCard) {
      this.dragType = 'joker';
      this.dragContainer = this.jokersContainer;
      this.draggedCardElement = jokerCard;
      this.draggedCardId = jokerCard.id;
      this.startIndex = parseInt(jokerCard.dataset.index, 10);
    } else if (consumableCard) {
      this.dragType = 'consumable';
      this.dragContainer = this.consumablesContainer;
      this.draggedCardElement = consumableCard;
      this.draggedCardId = consumableCard.id;
      this.startIndex = parseInt(consumableCard.dataset.index, 10);
    }

    this.targetIndex = this.startIndex;

    // Hardware capture
    try {
      this.draggedCardElement.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore
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
    }

    if (this.isDragging) {
      e.preventDefault();
      this.currentX = e.clientX;
      this.currentY = e.clientY;

      // Apply tactile translation and tilt to dragged element
      const tilt = Math.min(Math.max(deltaX * 0.12, -15), 15);
      this.draggedCardElement.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${tilt}deg) scale(1.12)`;

      // Identify candidate target index and update dynamic sibling shifts
      this.updateSiblingShifts(e.clientX);
    }
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

    // Calculate dynamic insertion gap shifts on sibling cards
    const shiftDistance = this.dragType === 'hand' ? 44 : 32;

    cardElements.forEach((card, i) => {
      if (card === this.draggedCardElement) return;

      let shift = 0;
      if (this.startIndex < this.targetIndex) {
        // Dragged to the right: items in between shift left
        if (i > this.startIndex && i <= this.targetIndex) {
          shift = -shiftDistance;
        }
      } else if (this.startIndex > this.targetIndex) {
        // Dragged to the left: items in between shift right
        if (i >= this.targetIndex && i < this.startIndex) {
          shift = shiftDistance;
        }
      }

      if (this.dragType === 'hand' && !card.classList.contains('card-selected')) {
        // Preserve hand fan rotation while applying horizontal insertion shift
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

  /**
   * Reset any temporary transform shifts on siblings
   */
  clearSiblingShifts() {
    if (!this.dragContainer) return;
    const selector = this.dragType === 'hand'
      ? '.playing-card'
      : (this.dragType === 'joker' ? '.joker-card' : '.consumable-card');

    const cardElements = Array.from(this.dragContainer.querySelectorAll(selector));
    cardElements.forEach((card, i) => {
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

    this.clearSiblingShifts();
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
        if (startIdx !== targetIdx && targetIdx !== -1) {
          this.gameEngine.reorderJokers(startIdx, targetIdx);
          this.playSound('card_slide');
        } else {
          this.gameEngine.notify('JOKER_REORDERED');
        }
      }
    } else if (dragType === 'consumable') {
      if (wasDragging) {
        if (startIdx !== targetIdx && targetIdx !== -1) {
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
      try {
        if (this.activePointerId !== null && this.draggedCardElement.hasPointerCapture(this.activePointerId)) {
          this.draggedCardElement.releasePointerCapture(this.activePointerId);
        }
      } catch (err) {
        // Ignore capture release error
      }
    }

    this.activePointerId = null;
    this.dragType = null;
    this.dragContainer = null;
    this.draggedCardElement = null;
    this.draggedCardId = null;
    this.isDragging = false;
    this.startIndex = -1;
    this.targetIndex = -1;
  }
}
