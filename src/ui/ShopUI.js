/**
 * ShopUI.js
 * Pixel-perfect implementation of authentic Balatro Shop architecture matching screenshot `sho[.jpg`.
 * Features:
 * - Left HUD sidebar with marquee bulb "SHOP - Improve your run!" header, score tracker, chips/mult, and stats
 * - Center recessed board with Left Action Buttons (Red "Next Round", Green "Reroll $X")
 * - Top Card Shelf with floating gold price tags ($5, $8) directly above cards
 * - Bottom Shelf: Left Voucher slot ($10) + Right Booster Packs slots ($4, $6, $8)
 * - Far Bottom Right deck pile displaying cards remaining (52/52)
 * - Full integration with TooltipRenderer, SaveManager, and Sound Engine
 */

import { tooltipRenderer } from './TooltipRenderer.js';
import { ENHANCEMENT_LABELS } from '../game/Card.js';
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

    // Cache DOM nodes for the Shop Board
    this.shopContainer = document.getElementById('shop-board-arena');
    this.shopCardsShelf = document.getElementById('shop-cards-shelf');
    this.shopVoucherSlot = document.getElementById('shop-voucher-slot');
    this.shopPacksShelf = document.getElementById('shop-packs-shelf');
    this.rerollBtn = document.getElementById('shop-reroll-btn');
    this.nextRoundBtn = document.getElementById('shop-next-round-btn');
    this.rerollCostLabel = document.getElementById('shop-reroll-cost-label');
    this.shopDeckCounter = document.getElementById('shop-deck-counter');

    // Sidebar shop header
    this.shopSidebarHeader = document.getElementById('shop-sidebar-header');
    this.blindSidebarHeader = document.getElementById('blind-select-sidebar-title');
    this.liveHandCard = document.getElementById('live-hand-card');

    this.bindEvents();
  }

  bindEvents() {
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
          // Visual card flip animation on shelf
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
  }

  /**
   * Primary render loop for the shop screen
   */
  render() {
    if (!this.shopContainer) return;

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

    // 3. Render Top Card Shelf (2 buyable items: Jokers, Tarots, Planets)
    this.renderCardShelf();

    // 4. Render Bottom Shelf (Left: Voucher, Right: 2 Booster Packs)
    this.renderVoucherSlot();
    this.renderBoosterPacks();
  }

  /**
   * Top Card Shelf with floating gold price tags
   */
  renderCardShelf() {
    if (!this.shopCardsShelf) return;
    this.shopCardsShelf.innerHTML = '';

    const items = this.game.shopEngine.shopCards || [];

    items.forEach((item, index) => {
      const cardSlot = document.createElement('div');
      cardSlot.className = 'shop-card-slot relative flex flex-col items-center cursor-pointer select-none';

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
        // Consumable (Tarot, Planet, Spectral)
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

      // Buy click action
      cardSlot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!canAfford) {
          this.renderer.playSound('card_deselect');
          return;
        }
        if (isFull) {
          alert(isJoker ? 'Joker slots are full! Sell a Joker first.' : 'Consumable slots are full! Use or sell a card first.');
          this.renderer.playSound('card_deselect');
          return;
        }

        const res = this.game.buyShopCard(index);
        if (res.success) {
          this.renderer.playSound('cash');
          this.renderer.spawnCashPop(priceTag, cost);
          this.renderer.render();
          this.render();
        } else {
          alert(res.message);
        }
      });

      this.shopCardsShelf.appendChild(cardSlot);
    });

    // Fill empty slots with grooved indentation placeholder
    for (let i = items.length; i < 2; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'shop-empty-slot flex flex-col items-center justify-center text-center select-none';
      emptySlot.innerHTML = `
        <span class="font-pixel text-slate-700 text-3xl">SOLD OUT</span>
      `;
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
      voucherSlot.className = 'shop-voucher-slot relative flex flex-col items-center cursor-pointer select-none';

      const cost = voucher.finalCost || voucher.cost || 10;
      const canAfford = this.game.money >= cost;

      // Floating Gold Price Tag
      const priceTag = document.createElement('div');
      priceTag.className = `shop-price-tag ${canAfford ? 'price-affordable' : 'price-unaffordable'}`;
      priceTag.innerHTML = `<span>$${cost}</span>`;
      voucherSlot.appendChild(priceTag);

      // Voucher Card Face
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

      // Tooltip
      tooltipRenderer.attach(voucherSlot, {
        name: voucher.name,
        type: 'Voucher',
        rarity: 'Uncommon',
        description: voucher.description,
        cost: cost
      });

      voucherSlot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!canAfford) {
          this.renderer.playSound('card_deselect');
          return;
        }
        const res = this.game.buyVoucher();
        if (res.success) {
          this.renderer.playSound('cash');
          this.renderer.spawnCashPop(priceTag, cost);
          this.renderer.render();
          this.render();
        }
      });

      this.shopVoucherSlot.appendChild(voucherSlot);
    } else {
      const soldOut = document.createElement('div');
      soldOut.className = 'shop-empty-slot flex flex-col items-center justify-center text-center select-none w-full h-full';
      soldOut.innerHTML = `
        <span class="font-pixel text-slate-700 text-2xl">SOLD OUT</span>
        <span class="text-[9px] font-bold text-slate-600 mt-1 uppercase">Available Next Ante</span>
      `;
      this.shopVoucherSlot.appendChild(soldOut);
    }
  }

  /**
   * Bottom Right Slots: 2 Booster Packs with floating gold price tags
   */
  renderBoosterPacks() {
    if (!this.shopPacksShelf) return;
    this.shopPacksShelf.innerHTML = '';

    const packs = this.game.shopEngine.boosterPacks || [];

    packs.forEach((pack, index) => {
      const packSlot = document.createElement('div');
      packSlot.className = 'shop-pack-slot relative flex flex-col items-center cursor-pointer select-none';

      const cost = pack.finalCost || pack.cost || 4;
      const canAfford = this.game.money >= cost;

      // Floating Gold Price Tag
      const priceTag = document.createElement('div');
      priceTag.className = `shop-price-tag ${canAfford ? 'price-affordable' : 'price-unaffordable'}`;
      priceTag.innerHTML = `<span>$${cost}</span>`;
      packSlot.appendChild(priceTag);

      // Booster Pack Foil Wrapper
      const packFace = document.createElement('div');
      packFace.className = 'w-full h-full relative';
      packFace.innerHTML = renderBoosterPackHtml(pack);
      packSlot.appendChild(packFace);

      // Tooltip
      tooltipRenderer.attach(packSlot, {
        name: pack.name,
        type: 'Booster Pack',
        rarity: 'Rare',
        description: pack.description,
        cost: cost
      });

      packSlot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!canAfford) {
          this.renderer.playSound('card_deselect');
          return;
        }
        const res = this.game.buyBoosterPack(index);
        if (res.success) {
          this.renderer.playSound('cash');
          this.renderer.spawnCashPop(priceTag, cost);
          this.renderer.render();
          this.render();
          this.renderer.showPackOpeningOverlay(res);
        }
      });

      this.shopPacksShelf.appendChild(packSlot);
    });

    for (let i = packs.length; i < 2; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'shop-empty-slot flex flex-col items-center justify-center text-center select-none';
      emptySlot.innerHTML = `
        <span class="font-pixel text-slate-700 text-2xl">OPENED</span>
      `;
      this.shopPacksShelf.appendChild(emptySlot);
    }
  }
}
