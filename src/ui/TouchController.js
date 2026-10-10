/**
 * TouchController.js
 * Hardware-agnostic PointerEvents controller providing seamless touch, stylus,
 * and mouse interactions for iPad, mobile devices, and desktop browsers.
 * Distinguishes between tap/click (select) and horizontal drag-and-drop (reorder).
 */

export class TouchController {
  /**
   * @param {GameEngine} gameEngine
   * @param {HTMLElement} handContainer
   * @param {Function} onSoundRequest - Audio feedback callback
   */
  constructor(gameEngine, handContainer, onSoundRequest = () => {}) {
    this.gameEngine = gameEngine;
    this.container = handContainer;
    this.playSound = onSoundRequest;

    // Active drag tracking
    this.activePointerId = null;
    this.draggedCardElement = null;
    this.draggedCardId = null;
    this.startIndex = -1;
    this.targetIndex = -1;

    // Drag distance thresholds
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
    this.container.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: false });
    window.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
    window.addEventListener('pointerup', this.onPointerUp.bind(this), { passive: false });
    window.addEventListener('pointercancel', this.onPointerCancel.bind(this), { passive: false });
  }

  /**
   * Locate the closest card element from event target
   */
  getCardElement(target) {
    return target.closest('.playing-card');
  }

  onPointerDown(e) {
    // Only accept primary pointer (prevent multi-touch conflicts)
    if (this.activePointerId !== null) return;

    const cardEl = this.getCardElement(e.target);
    if (!cardEl) return;

    this.activePointerId = e.pointerId;
    this.draggedCardElement = cardEl;
    this.draggedCardId = cardEl.dataset.cardId;
    this.startIndex = parseInt(cardEl.dataset.index, 10);
    this.targetIndex = this.startIndex;

    this.startX = e.clientX;
    this.startY = e.clientY;
    this.currentX = e.clientX;
    this.currentY = e.clientY;
    this.isDragging = false;

    // Hardware capture
    try {
      cardEl.setPointerCapture(e.pointerId);
    } catch (err) {
      // Fallback for browsers that restrict setPointerCapture
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
      this.playSound('card_drag');
    }

    if (this.isDragging) {
      e.preventDefault(); // Prevent accidental scroll or pull-to-refresh
      this.currentX = e.clientX;
      this.currentY = e.clientY;

      // Apply transform translation following pointer with tilt
      const tilt = Math.min(Math.max(deltaX * 0.1, -12), 12);
      this.draggedCardElement.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${tilt}deg) scale(1.12)`;

      // Identify candidate reorder index
      this.detectReorderTarget(e.clientX);
    }
  }

  /**
   * Determine card target index based on horizontal position
   */
  detectReorderTarget(pointerX) {
    const cardElements = Array.from(this.container.querySelectorAll('.playing-card'));
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
  }

  onPointerUp(e) {
    if (this.activePointerId !== e.pointerId) return;

    const cardEl = this.draggedCardElement;
    const wasDragging = this.isDragging;
    const startIdx = this.startIndex;
    const targetIdx = this.targetIndex;
    const cardId = this.draggedCardId;

    this.resetDragState();

    if (wasDragging) {
      if (startIdx !== targetIdx && targetIdx !== -1) {
        this.gameEngine.reorderHand(startIdx, targetIdx);
        this.playSound('card_slide');
      } else {
        // Re-render to reset CSS styles
        this.gameEngine.notify('HAND_RENDER_NEEDED');
      }
    } else {
      // Tap / Click action: Toggle card selection
      if (cardId) {
        const selected = this.gameEngine.toggleCardSelection(cardId);
        this.playSound(selected ? 'card_select' : 'card_deselect');
      }
    }
  }

  onPointerCancel(e) {
    if (this.activePointerId === e.pointerId) {
      this.resetDragState();
      this.gameEngine.notify('HAND_RENDER_NEEDED');
    }
  }

  /**
   * Clean up drag state and release pointer captures
   */
  resetDragState() {
    if (this.draggedCardElement) {
      this.draggedCardElement.classList.remove('is-dragging');
      this.draggedCardElement.style.transform = '';
      try {
        if (this.activePointerId !== null && this.draggedCardElement.hasPointerCapture(this.activePointerId)) {
          this.draggedCardElement.releasePointerCapture(this.activePointerId);
        }
      } catch (err) {
        // Ignore capture release error
      }
    }

    this.activePointerId = null;
    this.draggedCardElement = null;
    this.draggedCardId = null;
    this.isDragging = false;
    this.startIndex = -1;
    this.targetIndex = -1;
  }
}
