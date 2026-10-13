/**
 * ShopUI.js
 * Lead UI/UX Engineer implementation of authentic Balatro Shop interaction mechanics
 * matching reference screenshots `20261012_132451_HDR.jpg` (Shop Mode) and `20261012_131157_HDR.jpg`.
 *
 * Core Systems:
 * 1. SHOP JOKER BAR AS BUY ZONE:
 *    - When dragging ANY item from the shop shelves (Cards, Jokers, Tarots, Planets, Voucher, Packs),
 *      the top Joker area dynamically transforms into a prominent "Buy $[cost]" drop zone overlay.
 *    - Vibrant emerald green background, white rounded border, bold pixel text, and responsive drag-over pulse.
 * 2. RIGHT-SIDE "BUY AND USE" ZONE:
 *    - Vertical card-shaped drop target box reading "Buy and Use $[cost]" positioned on the right
 *      directly above the deck stack.
 *    - Dynamic Availability State: If the player lacks sufficient funds OR the consumable cannot be
 *      legally used in the current state, this side box automatically becomes greyed out (disabled)
 *      with reduced opacity and rejects the drop with audio/visual feedback.
 *    - When valid and dropped, immediately deducts cost, removes from shelf, and triggers consumable effect.
 * 3. FLUID DRAGGING:
 *    - Hardware-agnostic PointerEvents (touch, stylus, and desktop mouse) tracking.
 *    - Floating hardware-accelerated drag avatar with velocity tilt, smooth sub-pixel tracking,
 *      and foolproof cleanup preventing stuck cards or misfiring.
 *    - Full HTML5 drag-and-drop fallback.
 *    - Safe Inspection Layer: Clicking/tapping inspects items without purchasing.
 */

import { tooltipRenderer } from './TooltipRenderer.js';
import { renderJokerCardFace } from './JokerArtwork.js';
import { renderBoosterPackHtml } from './PackArtwork.js';

export class ShopUI {
  /**
   * @param {import('../game/GameEngine.js').GameEngine} game
   * @param {import('./Renderer.js').Renderer} renderer
   */
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;

    // Cache DOM nodes for the Shop Arena
    this.shopContainer = document.getElementById('shop-board-arena');
    this.shopCardsShelf = document.getElementById('shop-cards-shelf');
    this.shopVoucherSlot = document.getElementById('shop-voucher-slot');
    this.shopPacksShelf = document.getElementById('shop-packs-shelf');
    this.rerollBtn = document.getElementById('shop-reroll-btn');
    this.nextRoundBtn = document.getElementById('shop-next-round-btn');
    this.rerollCostLabel = document.getElementById('shop-reroll-cost-label');
    this.shopDeckCounter = document.getElementById('shop-deck-counter');

    // Top Joker Bar Overlay elements (Feature 1)
    this.jokersContainer = document.getElementById('jokers-container');
    this.jokerOverlay = document.getElementById('joker-bar-drop-overlay');
    this.jokerTitle = document.getElementById('joker-bar-action-title');
    this.jokerCost = document.getElementById('joker-bar-action-cost');

    // Right-Side "Buy and Use" elements (Feature 2)
    this.buyUseZone = document.getElementById('shop-buy-use-zone');
    this.buyUseCost = document.getElementById('shop-buy-use-cost-label');

    // Safe inspection state
    this.inspectedItem = null;
    this.inspectedType = null; // 'shelf_card' | 'voucher' | 'pack' | 'owned_joker' | 'owned_consumable'
    this.inspectedIndex = -1;

    // Pointer-based fluid drag tracking state (Feature 3)
    this.activePointerId = null;
    this.isPointerDragging = false;
    this.dragAvatar = null;
    this.dragItemData = null; // { item, index, type, element, cost }
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.pointerLastX = 0;
    this.pointerLastY = 0;
    this.currentDropTarget = null; // 'BUY' | 'BUY_AND_USE' | null

    this.ensureDomElements();
    this.bindStaticEvents();
  }

  /**
   * Verify and ensure drop zone DOM elements exist and are cached
   */
  ensureDomElements() {
    // 1. Joker bar drop overlay
    if (!this.jokerOverlay && this.jokersContainer) {
      const parent = this.jokersContainer.parentElement;
      if (parent) {
        let overlay = document.getElementById('joker-bar-drop-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'joker-bar-drop-overlay';
          overlay.className = 'joker-bar-drop-overlay absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-30 transition-all duration-150 opacity-0 pointer-events-none select-none';
          overlay.innerHTML = `
            <span id="joker-bar-action-title" class="font-pixel text-3xl sm:text-4xl text-white font-black uppercase leading-tight drop-shadow-md">BUY</span>
            <span id="joker-bar-action-cost" class="font-pixel text-2xl sm:text-3xl text-white font-black leading-tight drop-shadow-md">$3</span>
          `;
          parent.appendChild(overlay);
        }
        this.jokerOverlay = overlay;
        this.jokerTitle = document.getElementById('joker-bar-action-title');
        this.jokerCost = document.getElementById('joker-bar-action-cost');
      }
    }

    // 2. Right-side Buy and Use zone
    if (!this.buyUseZone && this.shopContainer) {
      let zone = document.getElementById('shop-buy-use-zone');
      if (!zone) {
        const rightCol = document.getElementById('shop-right-column');
        if (rightCol) {
          zone = document.createElement('div');
          zone.id = 'shop-buy-use-zone';
          zone.className = 'shop-buy-use-card flex flex-col items-center justify-center text-center p-3 rounded-2xl border-2 border-white shadow-2xl transition-all duration-200 select-none cursor-pointer';
          zone.innerHTML = `
            <span class="font-pixel text-xl sm:text-2xl text-white font-bold leading-none">Buy</span>
            <span class="font-pixel text-xs sm:text-sm text-white/90 font-bold leading-tight mt-0.5">and Use</span>
            <span id="shop-buy-use-cost-label" class="font-pixel text-2xl sm:text-3xl text-white font-black leading-tight mt-1">$3</span>
          `;
          rightCol.insertBefore(zone, rightCol.firstChild);
        }
      }
      this.buyUseZone = zone;
      this.buyUseCost = document.getElementById('shop-buy-use-cost-label');
    }
  }

  /**
   * Bind static action buttons and HTML5 fallback drop listeners
   */
  bindStaticEvents() {
    if (this.nextRoundBtn) {
      this.nextRoundBtn.addEventListener('click', () => {
        this.renderer.playSound('card_slide');
        this.game.startNextRoundFromShop();
        this.renderer.render();
      });
    }

    if (this.rerollBtn) {
      this.rerollBtn.addEventListener('click', () => {
        const prevCost = this.game.shopEngine.rerollCost;
        const res = this.game.rerollShop();
        if (res.success) {
          this.renderer.playSound('reroll_shuffle');
          this.renderer.spawnCashPop(this.rerollBtn, prevCost);
          this.inspectedItem = null;
          if (this.shopCardsShelf) {
            Array.from(this.shopCardsShelf.children).forEach(c => c.classList.add('card-reroll-anim'));
          }
          setTimeout(() => {
            this.render();
          }, 150);
        } else {
          this.renderer.playSound('card_deselect');
        }
      });
    }

    // HTML5 Drag Fallback: Joker Bar drop zone
    const jokerDropTarget = this.jokerOverlay || this.jokersContainer;
    if (jokerDropTarget) {
      jokerDropTarget.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.highlightJokerBar(true);
      });
      jokerDropTarget.addEventListener('dragleave', () => {
        this.highlightJokerBar(false);
      });
      jokerDropTarget.addEventListener('drop', (e) => {
        e.preventDefault();
        this.highlightJokerBar(false);
        this.hideJokerBarOverlay();
        const rawData = e.dataTransfer.getData('text/plain');
        if (!rawData) return;
        try {
          const payload = JSON.parse(rawData);
          this.handleDropTransaction('BUY', payload);
        } catch (err) {
          // ignore invalid json
        }
      });
    }

    // HTML5 Drag Fallback: Right-side Buy and Use drop zone
    if (this.buyUseZone) {
      this.buyUseZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!this.buyUseZone.classList.contains('drop-zone-disabled')) {
          e.dataTransfer.dropEffect = 'copy';
          this.highlightBuyUseZone(true);
        } else {
          e.dataTransfer.dropEffect = 'none';
        }
      });
      this.buyUseZone.addEventListener('dragleave', () => {
        this.highlightBuyUseZone(false);
      });
      this.buyUseZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.highlightBuyUseZone(false);
        if (this.buyUseZone.classList.contains('drop-zone-disabled')) {
          this.rejectDrop(this.buyUseZone);
          return;
        }
        const rawData = e.dataTransfer.getData('text/plain');
        if (!rawData) return;
        try {
          const payload = JSON.parse(rawData);
          this.handleDropTransaction('BUY_AND_USE', payload);
        } catch (err) {
          // ignore invalid json
        }
      });
    }
  }

  /**
   * Primary render loop for the shop screen
   */
  render() {
    if (!this.shopContainer) return;
    this.ensureDomElements();

    // 1. Update Reroll Button state
    const cost = this.game.shopEngine.rerollCost;
    const canAffordReroll = this.game.money >= cost;
    if (this.rerollCostLabel) {
      this.rerollCostLabel.textContent = `$${cost}`;
    }
    if (this.rerollBtn) {
      this.rerollBtn.disabled = !canAffordReroll;
      this.rerollBtn.classList.toggle('opacity-50', !canAffordReroll);
      this.rerollBtn.classList.toggle('cursor-not-allowed', !canAffordReroll);
    }

    // 2. Update Deck Counter in bottom right
    const remainingCards = this.game.deck ? this.game.deck.length : 52;
    const totalCards = (this.game.deck ? this.game.deck.length : 0) +
                       (this.game.hand ? this.game.hand.length : 0) +
                       (this.game.discardPile ? this.game.discardPile.length : 0);
    if (this.shopDeckCounter) {
      this.shopDeckCounter.textContent = `${remainingCards}/${totalCards || 52}`;
    }

    // 3. Reset Drop Zones to resting state
    this.hideJokerBarOverlay();
    this.resetBuyUseZone();

    // 4. Render Top Card Shelf (2 buyable items: Jokers, Tarots, Planets)
    this.renderCardShelf();

    // 5. Render Bottom Shelf (Left: Voucher, Right: 2 Booster Packs)
    this.renderVoucherSlot();
    this.renderBoosterPacks();
  }

  // ==========================================================================
  // FEATURE 1: DYNAMIC TOP JOKER BAR AS BUY ZONE
  // ==========================================================================

  /**
   * Dynamically transforms top Joker area into a clear "Buy $[cost]" overlay
   * @param {string} title 'BUY' | 'SELL'
   * @param {number} cost
   * @param {boolean} canAfford
   */
  showJokerBarOverlay(title, cost, canAfford = true) {
    this.ensureDomElements();
    if (!this.jokerOverlay) return;

    if (this.jokerTitle) {
      this.jokerTitle.textContent = title;
    }
    if (this.jokerCost) {
      this.jokerCost.textContent = `$${cost}`;
      this.jokerCost.classList.toggle('text-red-300', !canAfford);
      this.jokerCost.classList.toggle('text-white', canAfford);
    }

    this.jokerOverlay.classList.remove('overlay-buy', 'overlay-sell');
    if (title === 'SELL') {
      this.jokerOverlay.classList.add('overlay-sell');
    } else {
      this.jokerOverlay.classList.add('overlay-buy');
    }

    this.jokerOverlay.style.opacity = '1';
    this.jokerOverlay.style.pointerEvents = 'auto';
  }

  /**
   * Restores normal Joker inventory display
   */
  hideJokerBarOverlay() {
    if (!this.jokerOverlay) return;
    this.jokerOverlay.style.opacity = '0';
    this.jokerOverlay.style.pointerEvents = 'none';
    this.jokerOverlay.classList.remove('is-drag-over', 'overlay-buy', 'overlay-sell');
  }

  highlightJokerBar(isActive) {
    if (!this.jokerOverlay) return;
    this.jokerOverlay.classList.toggle('is-drag-over', isActive);
  }

  // ==========================================================================
  // FEATURE 2: RIGHT-SIDE "BUY AND USE" ZONE
  // ==========================================================================

  /**
   * Resets the right-side Buy and Use zone to resting state
   */
  resetBuyUseZone() {
    if (!this.buyUseZone) return;
    this.buyUseZone.classList.remove('is-drag-over', 'drop-zone-disabled');
    if (this.buyUseCost) {
      this.buyUseCost.textContent = '$3';
    }
    this.buyUseZone.style.opacity = '0.7';
  }

  /**
   * Updates Buy and Use zone state dynamically during item drag
   * @param {object} item The shelf item currently being dragged
   */
  updateBuyUseZoneForDrag(item) {
    if (!this.buyUseZone) return;

    const isConsumable = item && (
      item.category === 'consumable' ||
      item.type === 'Planet' ||
      item.type === 'Tarot' ||
      item.type === 'Spectral'
    );

    const cost = item ? (item.finalCost || item.cost || 3) : 3;
    if (this.buyUseCost) {
      this.buyUseCost.textContent = `$${cost}`;
    }

    if (!isConsumable) {
      // Jokers, Vouchers, Booster Packs cannot be "Buy and Used" directly
      this.buyUseZone.classList.add('drop-zone-disabled');
      this.buyUseZone.style.opacity = '0.3';
      return;
    }

    // Dynamic Availability State Check
    const canAfford = this.game.money >= cost;
    const isLegal = this.checkConsumableLegality(item);
    const isAvailable = canAfford && isLegal;

    if (isAvailable) {
      this.buyUseZone.classList.remove('drop-zone-disabled');
      this.buyUseZone.style.opacity = '1.0';
    } else {
      this.buyUseZone.classList.add('drop-zone-disabled');
      this.buyUseZone.style.opacity = '0.38';
    }
  }

  highlightBuyUseZone(isActive) {
    if (!this.buyUseZone) return;
    this.buyUseZone.classList.toggle('is-drag-over', isActive);
  }

  /**
   * Audits whether a consumable can be legally used in the current game state
   * @param {object} item
   * @returns {boolean}
   */
  checkConsumableLegality(item) {
    if (!item) return false;

    // 1. Planet cards: Always legally usable (levels up poker hand types)
    if (item.type === 'Planet' || item.category === 'planet') {
      return true;
    }

    // 2. Custom card canUse function
    if (typeof item.canUse === 'function') {
      try {
        return item.canUse(this.game);
      } catch (err) {
        return true;
      }
    }

    // 3. Specific Tarot rules
    if (item.type === 'Tarot') {
      // The Judgement requires available Joker capacity
      if (item.id === 'tarot_judgement') {
        return this.game.jokerSystem.count < this.game.jokerSystem.maxJokers;
      }
      // The Fool requires a previously used Tarot or Planet
      if (item.id === 'tarot_fool') {
        return !!this.game.consumableSystem.lastUsed;
      }
      // Card modifications (Empress, Hierophant, Lovers, etc.): Need cards in deck or hand
      const totalCards = (this.game.hand ? this.game.hand.length : 0) + (this.game.deck ? this.game.deck.length : 0);
      return totalCards >= 1;
    }

    return true;
  }

  // ==========================================================================
  // FEATURE 3: FLUID DRAGGING (TOUCH & MOUSE POINTER TRACKING)
  // ==========================================================================

  /**
   * Attaches unified PointerEvents to a shelf card element
   * @param {HTMLElement} cardElement
   * @param {object} item
   * @param {number} index
   * @param {string} type 'shelf_card' | 'voucher' | 'pack'
   */
  attachShelfPointerDrag(cardElement, item, index, type) {
    cardElement.style.touchAction = 'none';

    cardElement.addEventListener('pointerdown', (e) => {
      // Accept primary pointer only
      if (this.activePointerId !== null) return;
      if (e.target.closest('button')) return;

      this.activePointerId = e.pointerId;
      this.isPointerDragging = false;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.pointerLastX = e.clientX;
      this.pointerLastY = e.clientY;

      const cost = item.finalCost || item.cost || (type === 'voucher' ? 10 : 4);
      this.dragItemData = { item, index, type, element: cardElement, cost };

      const onPointerMove = (moveEvent) => {
        if (moveEvent.pointerId !== this.activePointerId) return;

        const deltaX = moveEvent.clientX - this.pointerStartX;
        const deltaY = moveEvent.clientY - this.pointerStartY;
        const dist = Math.hypot(deltaX, deltaY);

        if (!this.isPointerDragging && dist > 7) {
          this.isPointerDragging = true;
          this.createDragAvatar(cardElement, moveEvent.clientX, moveEvent.clientY);
          cardElement.style.opacity = '0.35';
          this.renderer.playSound('card_drag');

          // Transform top Joker bar & update Buy and Use zone
          const canAfford = this.game.money >= cost;
          this.showJokerBarOverlay('BUY', cost, canAfford);
          this.updateBuyUseZoneForDrag(item);
        }

        if (this.isPointerDragging) {
          moveEvent.preventDefault();
          this.updateDragAvatar(moveEvent.clientX, moveEvent.clientY);

          // Hit-test drop targets
          const hitTarget = this.testDropTargetCollision(moveEvent.clientX, moveEvent.clientY);
          this.currentDropTarget = hitTarget;

          this.highlightJokerBar(hitTarget === 'BUY');
          const isBuyUseDisabled = this.buyUseZone && this.buyUseZone.classList.contains('drop-zone-disabled');
          this.highlightBuyUseZone(hitTarget === 'BUY_AND_USE' && !isBuyUseDisabled);
        }
      };

      const onPointerUp = (upEvent) => {
        if (upEvent.pointerId !== this.activePointerId) return;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerCancel);

        const wasDragging = this.isPointerDragging;
        const dropTarget = this.currentDropTarget;
        const dragData = this.dragItemData;

        // Clean up visual drag artifacts
        this.cleanupPointerDrag();

        if (wasDragging && dragData) {
          if (dropTarget === 'BUY') {
            this.executeBuy(dragData.type, dragData.index, dragData.item);
          } else if (dropTarget === 'BUY_AND_USE') {
            this.executeBuyAndUse(dragData.index, dragData.item);
          } else {
            this.renderer.playSound('card_deselect');
          }
        } else if (!wasDragging && dragData) {
          // Tap / Click action: Safe inspection layer without buying
          this.renderer.playSound('card_select');
          this.inspectedItem = dragData.item;
          this.inspectedType = dragData.type;
          this.inspectedIndex = dragData.index;
          this.highlightInspectedCard(cardElement);
        }
      };

      const onPointerCancel = (cancelEvent) => {
        if (cancelEvent.pointerId !== this.activePointerId) return;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerCancel);
        this.cleanupPointerDrag();
      };

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp, { passive: false });
      window.addEventListener('pointercancel', onPointerCancel, { passive: false });
    });
  }

  /**
   * Spawns a hardware-accelerated floating drag avatar centered on the pointer
   */
  createDragAvatar(sourceElement, clientX, clientY) {
    if (this.dragAvatar) {
      this.dragAvatar.remove();
    }

    const rect = sourceElement.getBoundingClientRect();
    const avatar = sourceElement.cloneNode(true);
    avatar.className = `${sourceElement.className} card-drag-avatar`;
    avatar.style.width = `${rect.width}px`;
    avatar.style.height = `${rect.height}px`;
    avatar.style.left = `${clientX - rect.width / 2}px`;
    avatar.style.top = `${clientY - rect.height / 2}px`;
    avatar.style.transform = 'scale(1.1)';
    avatar.style.opacity = '0.96';

    document.body.appendChild(avatar);
    this.dragAvatar = avatar;
  }

  updateDragAvatar(clientX, clientY) {
    if (!this.dragAvatar) return;

    const deltaX = clientX - this.pointerLastX;
    this.pointerLastX = clientX;
    this.pointerLastY = clientY;

    const tilt = Math.min(Math.max(deltaX * 1.4, -16), 16);
    const rect = this.dragAvatar.getBoundingClientRect();
    const targetLeft = clientX - rect.width / 2;
    const targetTop = clientY - rect.height / 2;

    this.dragAvatar.style.left = `${targetLeft}px`;
    this.dragAvatar.style.top = `${targetTop}px`;
    this.dragAvatar.style.transform = `rotate(${tilt}deg) scale(1.12)`;
  }

  /**
   * Determines which drop target the pointer is hovering over using coordinate bounds
   * @param {number} x
   * @param {number} y
   * @returns {'BUY' | 'BUY_AND_USE' | null}
   */
  testDropTargetCollision(x, y) {
    // 1. Check Joker Bar Drop Zone
    const jokerTarget = this.jokerOverlay || this.jokersContainer;
    if (jokerTarget) {
      const rect = jokerTarget.getBoundingClientRect();
      if (
        x >= rect.left - 12 &&
        x <= rect.right + 12 &&
        y >= rect.top - 12 &&
        y <= rect.bottom + 12
      ) {
        return 'BUY';
      }
    }

    // 2. Check Right-Side Buy and Use Drop Zone
    if (this.buyUseZone) {
      const rect = this.buyUseZone.getBoundingClientRect();
      if (
        x >= rect.left - 12 &&
        x <= rect.right + 12 &&
        y >= rect.top - 12 &&
        y <= rect.bottom + 12
      ) {
        return 'BUY_AND_USE';
      }
    }

    return null;
  }

  /**
   * Complete teardown of active drag state preventing stuck cards
   */
  cleanupPointerDrag() {
    if (this.dragAvatar) {
      this.dragAvatar.remove();
      this.dragAvatar = null;
    }
    if (this.dragItemData && this.dragItemData.element) {
      this.dragItemData.element.style.opacity = '1';
    }

    this.activePointerId = null;
    this.isPointerDragging = false;
    this.dragItemData = null;
    this.currentDropTarget = null;

    this.hideJokerBarOverlay();
    this.resetBuyUseZone();
  }

  highlightInspectedCard(cardElement) {
    const allSlots = document.querySelectorAll('.shop-card-slot, .shop-voucher-slot, .shop-pack-slot');
    allSlots.forEach(s => s.classList.remove('ring-2', 'ring-amber-400', 'scale-105'));
    if (cardElement) {
      cardElement.classList.add('ring-2', 'ring-amber-400', 'scale-105');
    }
  }

  // ==========================================================================
  // TRANSACTION LOGIC & EXECUTION
  // ==========================================================================

  handleDropTransaction(targetZone, payload) {
    if (!payload || !payload.type) return;

    if (payload.type === 'shop_card') {
      const item = this.game.shopEngine.shopCards[payload.index];
      if (targetZone === 'BUY_AND_USE') {
        this.executeBuyAndUse(payload.index, item);
      } else {
        this.executeBuy('shelf_card', payload.index, item);
      }
    } else if (payload.type === 'shop_voucher') {
      const voucher = this.game.shopEngine.currentVoucher;
      this.executeBuy('voucher', 0, voucher);
    } else if (payload.type === 'shop_pack') {
      const pack = this.game.shopEngine.boosterPacks[payload.index];
      this.executeBuy('pack', payload.index, pack);
    }
  }

  /**
   * Executes a standard Purchase onto the Joker bar
   */
  executeBuy(type, index, item) {
    if (!item) return;
    const cost = item.finalCost || item.cost || (type === 'voucher' ? 10 : 4);

    if (this.game.money < cost) {
      this.renderer.playSound('card_deselect');
      this.rejectDrop(this.jokerOverlay || this.jokersContainer);
      return;
    }

    if (type === 'shelf_card') {
      const isJoker = item.category === 'joker';
      const isFull = isJoker
        ? this.game.jokerSystem.count >= this.game.jokerSystem.maxJokers
        : this.game.consumableSystem.count >= this.game.consumableSystem.maxSlots;

      if (isFull) {
        this.renderer.playSound('card_deselect');
        this.rejectDrop(this.jokerOverlay || this.jokersContainer);
        alert(isJoker ? 'Joker slots are full! Sell a Joker first.' : 'Consumable slots are full! Use or sell a card first.');
        return;
      }

      const res = this.game.buyShopCard(index);
      if (res.success) {
        this.renderer.playSound('cash');
        this.renderer.spawnCashPop(this.jokersContainer, cost);
        this.inspectedItem = null;
        this.renderer.render();
        this.render();
      }
    } else if (type === 'voucher') {
      const res = this.game.buyVoucher();
      if (res.success) {
        this.renderer.playSound('cash');
        this.renderer.spawnCashPop(this.jokersContainer, cost);
        this.inspectedItem = null;
        this.renderer.render();
        this.render();
      }
    } else if (type === 'pack') {
      const res = this.game.buyBoosterPack(index);
      if (res.success) {
        this.renderer.playSound('cash');
        this.inspectedItem = null;
        this.renderer.openBoosterPack(res.pack);
      }
    }
  }

  /**
   * Executes a "Buy and Use" transaction immediately
   */
  executeBuyAndUse(index, item) {
    if (!item) return;

    const isConsumable = item.category === 'consumable' ||
      item.type === 'Planet' ||
      item.type === 'Tarot' ||
      item.type === 'Spectral';

    if (!isConsumable) {
      this.renderer.playSound('card_deselect');
      this.rejectDrop(this.buyUseZone);
      return;
    }

    const cost = item.finalCost || item.cost || 3;
    const canAfford = this.game.money >= cost;
    const isLegal = this.checkConsumableLegality(item);

    if (!canAfford || !isLegal) {
      this.renderer.playSound('card_deselect');
      this.rejectDrop(this.buyUseZone);
      return;
    }

    // 1. Deduct cost
    this.game.money -= cost;

    // 2. Remove from shop cards shelf
    this.game.shopEngine.shopCards.splice(index, 1);

    // 3. Execute consumable effect immediately
    try {
      if (typeof item.execute === 'function') {
        item.execute(this.game);
      }
    } catch (err) {
      console.error('Error executing Buy and Use effect:', err);
    }

    // 4. Record as last used consumable
    if (this.game.consumableSystem) {
      this.game.consumableSystem.lastUsed = item;
    }

    // 5. Sound effects and visual feedback
    this.renderer.playSound('cash');
    this.renderer.playSound('win');
    if (this.buyUseZone) {
      this.renderer.spawnCashPop(this.buyUseZone, cost);
    }

    // 6. Notify game engine & re-render
    this.game.notify('CONSUMABLE_USED', { success: true, item, buyAndUse: true });
    this.inspectedItem = null;
    this.renderer.render();
    this.render();
  }

  rejectDrop(targetElement) {
    if (!targetElement) return;
    targetElement.classList.add('animate-shake');
    setTimeout(() => {
      targetElement.classList.remove('animate-shake');
    }, 350);
  }

  // ==========================================================================
  // SHELVES RENDERING (TOP CARDS, VOUCHER, PACKS)
  // ==========================================================================

  /**
   * Top Card Shelf with floating gold price tags & fluid pointer dragging
   */
  renderCardShelf() {
    if (!this.shopCardsShelf) return;
    this.shopCardsShelf.innerHTML = '';

    const items = this.game.shopEngine.shopCards || [];

    items.forEach((item, index) => {
      const cardSlot = document.createElement('div');
      cardSlot.className = `shop-card-slot relative flex flex-col items-center select-none cursor-grab ${this.inspectedItem === item ? 'ring-2 ring-amber-400 scale-105' : ''}`;
      cardSlot.draggable = true;

      // HTML5 Drag Fallback
      cardSlot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'shop_card', index }));
        const cost = item.finalCost || item.cost;
        this.showJokerBarOverlay('BUY', cost, this.game.money >= cost);
        this.updateBuyUseZoneForDrag(item);
      });
      cardSlot.addEventListener('dragend', () => {
        this.hideJokerBarOverlay();
        this.resetBuyUseZone();
      });

      // Unified Pointer Dragging (Feature 3)
      this.attachShelfPointerDrag(cardSlot, item, index, 'shelf_card');

      const cost = item.finalCost || item.cost;
      const canAfford = this.game.money >= cost;
      const isJoker = item.category === 'joker';
      const isFull = isJoker
        ? this.game.jokerSystem.count >= this.game.jokerSystem.maxJokers
        : this.game.consumableSystem.count >= this.game.consumableSystem.maxSlots;

      // Floating Gold Price Tag
      const priceTag = document.createElement('div');
      priceTag.className = `shop-price-tag ${canAfford && !isFull ? 'price-affordable' : 'price-unaffordable'}`;
      priceTag.innerHTML = `<span>$${cost}</span>`;
      cardSlot.appendChild(priceTag);

      // Card Face
      const cardFace = document.createElement('div');
      if (isJoker) {
        const rarityClass = `rarity-${(item.rarity || 'common').toLowerCase()}`;
        const edClass = item.edition && item.edition !== 'normal' ? `edition-${item.edition}` : '';
        cardFace.className = `joker-card ${rarityClass} ${edClass} relative shadow-2xl`;
        cardFace.innerHTML = renderJokerCardFace(item);
      } else {
        const typeClass = `consumable-type-${(item.type || 'tarot').toLowerCase()}`;
        cardFace.className = `consumable-card ${typeClass} relative flex flex-col items-center justify-between p-2 shadow-2xl`;
        cardFace.innerHTML = `
          <div class="text-[9px] font-black uppercase text-cyan-200 tracking-wider truncate w-full text-center">
            ${item.name}
          </div>
          <div class="text-4xl my-auto drop-shadow">${item.icon || '📜'}</div>
          <div class="text-[8px] font-black text-amber-300 uppercase tracking-widest mt-0.5">${(item.type || 'TAROT').toUpperCase()}</div>
        `;
      }
      cardSlot.appendChild(cardFace);

      // Attach tooltip
      tooltipRenderer.attach(cardSlot, item);

      this.shopCardsShelf.appendChild(cardSlot);
    });

    for (let i = items.length; i < 2; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'shop-empty-slot flex flex-col items-center justify-center text-center select-none';
      emptySlot.innerHTML = `<span class="font-pixel text-slate-700 text-3xl">SOLD OUT</span>`;
      this.shopCardsShelf.appendChild(emptySlot);
    }
  }

  /**
   * Bottom Left Slot: 1 Voucher with floating price tag ($10)
   */
  renderVoucherSlot() {
    if (!this.shopVoucherSlot) return;
    this.shopVoucherSlot.innerHTML = '';

    const voucher = this.game.shopEngine.currentVoucher;

    if (voucher) {
      const voucherSlot = document.createElement('div');
      voucherSlot.className = `shop-voucher-slot relative flex flex-col items-center select-none cursor-grab ${this.inspectedItem === voucher ? 'ring-2 ring-amber-400 scale-105' : ''}`;
      voucherSlot.draggable = true;

      voucherSlot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'shop_voucher', index: 0 }));
        const cost = voucher.finalCost || voucher.cost || 10;
        this.showJokerBarOverlay('BUY', cost, this.game.money >= cost);
        this.updateBuyUseZoneForDrag(voucher);
      });
      voucherSlot.addEventListener('dragend', () => {
        this.hideJokerBarOverlay();
        this.resetBuyUseZone();
      });

      this.attachShelfPointerDrag(voucherSlot, voucher, 0, 'voucher');

      const cost = voucher.finalCost || voucher.cost || 10;
      const canAfford = this.game.money >= cost;

      const priceTag = document.createElement('div');
      priceTag.className = `shop-price-tag ${canAfford ? 'price-affordable' : 'price-unaffordable'}`;
      priceTag.innerHTML = `<span>$${cost}</span>`;
      voucherSlot.appendChild(priceTag);

      const voucherFace = document.createElement('div');
      voucherFace.className = 'voucher-ticket-frame p-2 flex flex-col items-center justify-between shadow-2xl relative select-none';
      voucherFace.innerHTML = `
        <div class="w-full flex justify-between items-center px-1">
          <span class="text-[8px] font-pixel text-amber-300 font-bold uppercase tracking-wider">VOUCHER</span>
          <span class="text-[8px] font-pixel text-slate-300 font-bold uppercase tracking-wider">Ante ${this.game.ante}</span>
        </div>
        <div class="w-full flex-1 flex flex-col items-center justify-center my-1 relative">
          <div class="text-3xl sm:text-4xl drop-shadow-md z-10">${voucher.icon || '🎟️'}</div>
          <div class="text-[9px] font-black uppercase text-amber-200 tracking-wider truncate w-full text-center mt-1">
            ${voucher.name}
          </div>
        </div>
        <div class="w-full bg-[#181111]/80 rounded py-0.5 text-center border border-amber-500/30">
          <span class="text-[8px] text-amber-300 font-black uppercase tracking-wider">PERMANENT</span>
        </div>
      `;
      voucherSlot.appendChild(voucherFace);

      tooltipRenderer.attach(voucherSlot, {
        name: voucher.name,
        type: 'Voucher',
        rarity: 'common',
        description: voucher.description,
        cost: cost
      });

      this.shopVoucherSlot.appendChild(voucherSlot);
    } else {
      const soldOut = document.createElement('div');
      soldOut.className = 'shop-empty-slot flex flex-col items-center justify-center text-center select-none w-full h-full';
      soldOut.innerHTML = `
        <span class="font-pixel text-slate-700 text-3xl">SOLD OUT</span>
        <span class="text-[8px] text-slate-600 font-bold">1 per Ante</span>
      `;
      this.shopVoucherSlot.appendChild(soldOut);
    }
  }

  /**
   * Bottom Right Shelf: 2 Booster Packs with metallic foil wrappers
   */
  renderBoosterPacks() {
    if (!this.shopPacksShelf) return;
    this.shopPacksShelf.innerHTML = '';

    const packs = this.game.shopEngine.boosterPacks || [];

    packs.forEach((pack, index) => {
      const packSlot = document.createElement('div');
      packSlot.className = `shop-pack-slot relative flex flex-col items-center select-none cursor-grab ${this.inspectedItem === pack ? 'ring-2 ring-amber-400 scale-105' : ''}`;
      packSlot.draggable = true;

      packSlot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'shop_pack', index }));
        const cost = pack.finalCost || pack.cost;
        this.showJokerBarOverlay('BUY', cost, this.game.money >= cost);
        this.updateBuyUseZoneForDrag(pack);
      });
      packSlot.addEventListener('dragend', () => {
        this.hideJokerBarOverlay();
        this.resetBuyUseZone();
      });

      this.attachShelfPointerDrag(packSlot, pack, index, 'pack');

      const cost = pack.finalCost || pack.cost;
      const canAfford = this.game.money >= cost;

      const priceTag = document.createElement('div');
      priceTag.className = `shop-price-tag ${canAfford ? 'price-affordable' : 'price-unaffordable'}`;
      priceTag.innerHTML = `<span>$${cost}</span>`;
      packSlot.appendChild(priceTag);

      const packFace = document.createElement('div');
      packFace.className = 'booster-pack-wrapper w-full flex items-center justify-center';
      packFace.innerHTML = renderBoosterPackHtml(pack);
      packSlot.appendChild(packFace);

      tooltipRenderer.attach(packSlot, {
        name: pack.name,
        type: 'Booster Pack',
        rarity: 'uncommon',
        description: pack.description,
        cost: cost
      });

      this.shopPacksShelf.appendChild(packSlot);
    });

    for (let i = packs.length; i < 2; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'shop-empty-slot flex flex-col items-center justify-center text-center select-none';
      emptySlot.innerHTML = `<span class="font-pixel text-slate-700 text-3xl">OPENED</span>`;
      this.shopPacksShelf.appendChild(emptySlot);
    }
  }
}
