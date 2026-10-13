/**
 * ShopEngine.js
 * Full implementation of Balatro's Shop System and Inventory Management Engine.
 * Features weighted item spawning, Booster Pack generation & interactive opening,
 * Ante Vouchers, and isolated Rerolls.
 */

import { JOKER_CATALOG } from './JokerSystem.js';
import { TAROT_CARDS, PLANET_CARDS, SPECTRAL_CARDS, CONSUMABLE_TYPES } from './ConsumableSystem.js';
import { Card, SUITS, RANKS, EDITIONS, ENHANCEMENTS } from './Card.js';

export const VOUCHER_CATALOG = [
  {
    id: 'voucher_overstock',
    name: 'Overstock',
    cost: 10,
    icon: '📦',
    description: '+1 Card slot available in shop',
    apply: (gameState) => { gameState.shopCardSlots = (gameState.shopCardSlots || 2) + 1; }
  },
  {
    id: 'voucher_grabber',
    name: 'Grabber',
    cost: 10,
    icon: '✋',
    description: 'Permanently gain +1 Hand per round',
    apply: (gameState) => { gameState.maxHands = (gameState.maxHands || 4) + 1; }
  },
  {
    id: 'voucher_wasteful',
    name: 'Wasteful',
    cost: 10,
    icon: '🗑️',
    description: 'Permanently gain +1 Discard per round',
    apply: (gameState) => { gameState.maxDiscards = (gameState.maxDiscards || 3) + 1; }
  },
  {
    id: 'voucher_clearance',
    name: 'Clearance Sale',
    cost: 10,
    icon: '🏷️',
    description: 'All items and packs in shop are 25% off',
    apply: (gameState) => { gameState.discountMultiplier = 0.75; }
  },
  {
    id: 'voucher_crystal_ball',
    name: 'Crystal Ball',
    cost: 10,
    icon: '🔮',
    description: '+1 Consumable slot',
    apply: (gameState) => { gameState.consumableSystem.maxSlots += 1; }
  }
];

export const BOOSTER_PACK_TEMPLATES = [
  // Arcana
  { id: 'pack_arcana', name: 'Arcana Pack', cost: 4, size: 3, choices: 1, type: 'tarot', icon: '🃏', description: 'Choose 1 of 3 Tarot cards' },
  { id: 'pack_arcana_jumbo', name: 'Jumbo Arcana Pack', cost: 6, size: 5, choices: 1, type: 'tarot', icon: '✨', description: 'Choose 1 of 5 Tarot cards' },
  { id: 'pack_arcana_mega', name: 'Mega Arcana Pack', cost: 8, size: 5, choices: 2, type: 'tarot', icon: '🌟', description: 'Choose 2 of 5 Tarot cards' },
  
  // Celestial
  { id: 'pack_celestial', name: 'Celestial Pack', cost: 4, size: 3, choices: 1, type: 'planet', icon: '🪐', description: 'Choose 1 of 3 Planet cards' },
  { id: 'pack_celestial_jumbo', name: 'Jumbo Celestial Pack', cost: 6, size: 5, choices: 1, type: 'planet', icon: '🌌', description: 'Choose 1 of 5 Planet cards' },
  { id: 'pack_celestial_mega', name: 'Mega Celestial Pack', cost: 8, size: 5, choices: 2, type: 'planet', icon: '🌠', description: 'Choose 2 of 5 Planet cards' },

  // Buffoon
  { id: 'pack_buffoon', name: 'Buffoon Pack', cost: 4, size: 2, choices: 1, type: 'joker', icon: '🎭', description: 'Choose 1 of 2 Jokers' },
  { id: 'pack_buffoon_jumbo', name: 'Jumbo Buffoon Pack', cost: 6, size: 4, choices: 1, type: 'joker', icon: '🎪', description: 'Choose 1 of 4 Jokers' },
  { id: 'pack_buffoon_mega', name: 'Mega Buffoon Pack', cost: 8, size: 4, choices: 2, type: 'joker', icon: '🎟️', description: 'Choose 2 of 4 Jokers' },

  // Standard
  { id: 'pack_standard', name: 'Standard Pack', cost: 4, size: 3, choices: 1, type: 'playing_card', icon: '🎴', description: 'Choose 1 of 3 Enhanced cards' },
  { id: 'pack_standard_jumbo', name: 'Jumbo Standard Pack', cost: 6, size: 5, choices: 1, type: 'playing_card', icon: '🃏', description: 'Choose 1 of 5 Enhanced cards' },
  { id: 'pack_standard_mega', name: 'Mega Standard Pack', cost: 8, size: 5, choices: 2, type: 'playing_card', icon: '👑', description: 'Choose 2 of 5 Enhanced cards' },

  // Spectral
  { id: 'pack_spectral', name: 'Spectral Pack', cost: 4, size: 2, choices: 1, type: 'spectral', icon: '👻', description: 'Choose 1 of 2 Spectral cards' },
  { id: 'pack_spectral_jumbo', name: 'Jumbo Spectral Pack', cost: 6, size: 4, choices: 1, type: 'spectral', icon: '🌀', description: 'Choose 1 of 4 Spectral cards' },
  { id: 'pack_spectral_mega', name: 'Mega Spectral Pack', cost: 8, size: 4, choices: 2, type: 'spectral', icon: '🔮', description: 'Choose 2 of 4 Spectral cards' }
];

export class ShopEngine {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.shopCards = [];
    this.boosterPacks = [];
    this.currentVoucher = null;
    this.rerollCost = 5;

    // Active Booster Pack Opening State
    this.activePack = null;
    this.packCards = [];
    this.packChoicesRemaining = 0;
  }

  /**
   * Called upon entering a new shop.
   *
   * BUG FIX #8: Apply Coupon Tag (50% off) for this shop session.
   * BUG FIX #10: Inject free Standard/Arcana packs from Skip Tags.
   */
  initShopForRound() {
    this.rerollCost = 5;

    // BUG FIX #8: Coupon Tag → 50% discount for this shop only.
    const couponIdx = (this.game.activeSkipTags || []).findIndex(t => t.effect === 'FREE_SHOP');
    if (couponIdx !== -1) {
      this.game.discountMultiplier = 0.5;
      this.game.activeSkipTags.splice(couponIdx, 1);
    }

    this.generateShopCards();
    this.generateBoosterPacks();

    // BUG FIX #10: Free Standard Pack tag → inject a zero-cost Standard Pack.
    const freeStdIdx = (this.game.activeSkipTags || []).findIndex(t => t.effect === 'FREE_STANDARD');
    if (freeStdIdx !== -1) {
      const stdTemplate = BOOSTER_PACK_TEMPLATES.find(p => p.id === 'pack_standard');
      if (stdTemplate) {
        this.boosterPacks.push({
          ...stdTemplate,
          instanceId: `pack_tag_standard_${Math.random().toString(36).substr(2, 6)}`,
          finalCost: 0
        });
      }
      this.game.activeSkipTags.splice(freeStdIdx, 1);
    }

    // BUG FIX #10: Free Arcana Pack tag → inject a zero-cost Arcana Pack.
    const freeArcIdx = (this.game.activeSkipTags || []).findIndex(t => t.effect === 'FREE_ARCANA');
    if (freeArcIdx !== -1) {
      const arcTemplate = BOOSTER_PACK_TEMPLATES.find(p => p.id === 'pack_arcana');
      if (arcTemplate) {
        this.boosterPacks.push({
          ...arcTemplate,
          instanceId: `pack_tag_arcana_${Math.random().toString(36).substr(2, 6)}`,
          finalCost: 0
        });
      }
      this.game.activeSkipTags.splice(freeArcIdx, 1);
    }

    // Only generate voucher if Ante changed or not already bought this Ante
    if (!this.currentVoucher && !this.game.voucherBoughtThisAnte) {
      this.generateVoucher();
    }
  }

  /**
   * Generates Top Shelf Shop Items with weighted probabilities:
   * Joker: 71%, Tarot: 14%, Planet: 14%
   */
  generateShopCards() {
    const slotsCount = this.game.shopCardSlots || 2;
    this.shopCards = [];

    for (let i = 0; i < slotsCount; i++) {
      const roll = Math.random();
      let item = null;

      if (roll < 0.71) {
        // Joker
        item = this.getRandomJoker();
      } else if (roll < 0.855) {
        // Tarot
        item = this.getRandomTarot();
      } else {
        // Planet
        item = this.getRandomPlanet();
      }

      if (item) {
        // Apply discount if voucher active
        const discount = this.game.discountMultiplier || 1;
        item.finalCost = Math.max(1, Math.round(item.cost * discount));
        this.shopCards.push(item);
      }
    }
  }

  /**
   * Generates 2 Booster Packs for bottom-left shelf
   */
  generateBoosterPacks() {
    const pool = [...BOOSTER_PACK_TEMPLATES];
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const discount = this.game.discountMultiplier || 1;
    this.boosterPacks = pool.slice(0, 2).map(p => ({
      ...p,
      instanceId: `pack_${p.id}_${Math.random().toString(36).substr(2, 6)}`,
      finalCost: Math.max(1, Math.round(p.cost * discount))
    }));
  }

  /**
   * Generates 1 Voucher per Ante for bottom-right shelf
   */
  generateVoucher() {
    const available = VOUCHER_CATALOG.filter(v => !(this.game.activeVouchers || []).includes(v.id));
    if (available.length > 0) {
      const v = available[Math.floor(Math.random() * available.length)];
      const discount = this.game.discountMultiplier || 1;
      this.currentVoucher = {
        ...v,
        finalCost: Math.max(1, Math.round(v.cost * discount))
      };
    } else {
      this.currentVoucher = null;
    }
  }

  getRandomJoker() {
    const catalog = [...JOKER_CATALOG];
    const joker = catalog[Math.floor(Math.random() * catalog.length)];

    // BUG FIX #9: Consume Edition Tags (POLY/HOLO/FOIL) before rolling random edition.
    // These tags force the NEXT shop joker to appear with the specified edition.
    let edition = EDITIONS.NORMAL;
    const tags = this.game.activeSkipTags || [];
    const editionTagMap = {
      POLY_JOKER: EDITIONS.POLYCHROME,
      HOLO_JOKER: EDITIONS.HOLO,
      FOIL_JOKER: EDITIONS.FOIL
    };
    let editionTagConsumed = false;
    for (const [effect, edValue] of Object.entries(editionTagMap)) {
      const idx = tags.findIndex(t => t.effect === effect);
      if (idx !== -1) {
        edition = edValue;
        this.game.activeSkipTags.splice(idx, 1);
        editionTagConsumed = true;
        break;
      }
    }

    if (!editionTagConsumed) {
      // Random edition chance: 80% Normal, 10% Foil, 7% Holo, 3% Poly
      const editionRoll = Math.random();
      if (editionRoll > 0.97) edition = EDITIONS.POLYCHROME;
      else if (editionRoll > 0.90) edition = EDITIONS.HOLO;
      else if (editionRoll > 0.80) edition = EDITIONS.FOIL;
    }

    // Stake stickers (Part 5: 8 Stakes & stickers)
    let isEternal = false;
    let isPerishable = false;
    let isRental = false;
    let cost = joker.cost;

    const stakeId = this.game.selectedStake ? this.game.selectedStake.id : 'stake_white';
    const stakeIds = ['stake_white', 'stake_red', 'stake_green', 'stake_blue', 'stake_black', 'stake_purple', 'stake_orange', 'stake_gold'];
    const stakeRank = stakeIds.indexOf(stakeId);

    // Black Stake+: 30% chance for Eternal
    if (stakeRank >= 4 && Math.random() < 0.30) {
      isEternal = true;
    }
    // Orange Stake+: 30% chance for Perishable
    if (!isEternal && stakeRank >= 6 && Math.random() < 0.30) {
      isPerishable = true;
    }
    // Gold Stake: 30% chance for Rental
    if (stakeRank >= 7 && Math.random() < 0.30) {
      isRental = true;
      cost = 1; // Rental jokers cost $1 to buy
    }

    return {
      ...joker,
      cost,
      category: 'joker',
      edition,
      isEternal,
      isPerishable,
      isRental,
      instanceId: `shop_joker_${joker.id}_${Math.random().toString(36).substr(2, 6)}`,
      sellValue: isRental ? 1 : Math.max(1, Math.floor(cost / 2))
    };
  }

  getRandomSpectral() {
    const card = SPECTRAL_CARDS[Math.floor(Math.random() * SPECTRAL_CARDS.length)];
    return {
      ...card,
      category: 'consumable',
      instanceId: `shop_spectral_${card.id}_${Math.random().toString(36).substr(2, 6)}`
    };
  }

  getRandomTarot() {
    const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    return {
      ...card,
      category: 'consumable',
      instanceId: `shop_tarot_${card.id}_${Math.random().toString(36).substr(2, 6)}`
    };
  }

  getRandomPlanet() {
    const card = PLANET_CARDS[Math.floor(Math.random() * PLANET_CARDS.length)];
    return {
      ...card,
      category: 'consumable',
      instanceId: `shop_planet_${card.id}_${Math.random().toString(36).substr(2, 6)}`
    };
  }

  /**
   * Buy an item from the top card shelf
   */
  buyShopCard(index) {
    if (index < 0 || index >= this.shopCards.length) return { success: false, message: 'Invalid item' };
    const item = this.shopCards[index];
    const cost = item.finalCost || item.cost;

    if (this.game.money < cost) {
      return { success: false, message: 'Not enough money!' };
    }

    if (item.category === 'joker') {
      if (this.game.jokerSystem.count >= this.game.jokerSystem.maxJokers) {
        return { success: false, message: 'Joker slots full!' };
      }
      this.game.money -= cost;
      this.game.jokerSystem.addJoker(item);
    } else if (item.category === 'consumable') {
      if (this.game.consumableSystem.count >= this.game.consumableSystem.maxSlots) {
        return { success: false, message: 'Consumable slots full!' };
      }
      this.game.money -= cost;
      this.game.consumableSystem.addConsumable(item);
    }

    this.shopCards.splice(index, 1);
    if (this.game && this.game.statsManager) {
      this.game.statsManager.recordCardPurchased(item);
    }
    return { success: true, item };
  }

  /**
   * Buy the active Voucher
   */
  buyVoucher() {
    if (!this.currentVoucher) return { success: false, message: 'No voucher available' };
    const cost = this.currentVoucher.finalCost || this.currentVoucher.cost;

    if (this.game.money < cost) {
      return { success: false, message: 'Not enough money!' };
    }

    this.game.money -= cost;
    this.currentVoucher.apply(this.game);
    this.game.activeVouchers = this.game.activeVouchers || [];
    this.game.activeVouchers.push(this.currentVoucher.id);
    this.game.voucherBoughtThisAnte = true;

    const bought = this.currentVoucher;
    this.currentVoucher = null;
    if (this.game && this.game.statsManager) {
      this.game.statsManager.recordCardPurchased(bought);
    }
    return { success: true, voucher: bought };
  }

  /**
   * Reroll shop: ONLY regenerates the 2 card shelf slots, NOT packs or vouchers.
   *
   * BUG FIX #7: D6 Tag (FREE_REROLLS) makes the first reroll this Ante cost $0.
   */
  rerollShop() {
    // BUG FIX #7: Check for FREE_REROLLS tag — if present consume it and reroll free.
    const freeRerollIdx = (this.game.activeSkipTags || []).findIndex(t => t.effect === 'FREE_REROLLS');
    if (freeRerollIdx !== -1) {
      this.game.activeSkipTags.splice(freeRerollIdx, 1);
      this.generateShopCards();
      if (this.game && this.game.statsManager) {
        this.game.statsManager.recordShopReroll();
      }
      return { success: true, newCost: this.rerollCost, free: true };
    }

    if (this.game.money < this.rerollCost) {
      return { success: false, message: 'Not enough money to reroll!' };
    }
    this.game.money -= this.rerollCost;
    this.rerollCost += 1;
    this.generateShopCards();
    if (this.game && this.game.statsManager) {
      this.game.statsManager.recordShopReroll();
    }
    return { success: true, newCost: this.rerollCost };
  }

  /**
   * Buy and open a Booster Pack
   */
  buyBoosterPack(index) {
    if (index < 0 || index >= this.boosterPacks.length) return { success: false, message: 'Invalid pack' };
    const pack = this.boosterPacks[index];
    const cost = pack.finalCost || pack.cost;

    if (this.game.money < cost) {
      return { success: false, message: 'Not enough money for pack!' };
    }

    this.game.money -= cost;
    this.boosterPacks.splice(index, 1);

    // Generate pack contents based on pack type and size
    this.activePack = pack;
    this.packChoicesRemaining = pack.choices;
    this.packCards = [];

    for (let i = 0; i < pack.size; i++) {
      if (pack.type === 'tarot') {
        this.packCards.push(this.getRandomTarot());
      } else if (pack.type === 'planet') {
        this.packCards.push(this.getRandomPlanet());
      } else if (pack.type === 'spectral') {
        this.packCards.push(this.getRandomSpectral());
      } else if (pack.type === 'joker') {
        this.packCards.push(this.getRandomJoker());
      } else {
        // In Standard packs, Tarot mutation cards can appear in packs alongside mutated playing cards!
        if (Math.random() < 0.20) {
          const tarot = this.getRandomTarot();
          this.packCards.push(tarot);
        } else {
          const suit = Object.values(SUITS)[Math.floor(Math.random() * 4)];
          const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
          const enhancementPool = [
            ENHANCEMENTS.NONE,
            ENHANCEMENTS.NONE,
            ENHANCEMENTS.BONUS,
            ENHANCEMENTS.MULT,
            ENHANCEMENTS.WILD,
            ENHANCEMENTS.GLASS,
            ENHANCEMENTS.STEEL,
            ENHANCEMENTS.GOLD,
            ENHANCEMENTS.LUCKY,
            ENHANCEMENTS.STONE
          ];
          const editions = [EDITIONS.NORMAL, EDITIONS.FOIL, EDITIONS.HOLO, EDITIONS.POLYCHROME];

          const card = new Card(suit, rank, {
            enhancement: enhancementPool[Math.floor(Math.random() * enhancementPool.length)],
            edition: Math.random() < 0.35 ? editions[Math.floor(Math.random() * (editions.length - 1)) + 1] : EDITIONS.NORMAL
          });
          card.category = 'playing_card';
          this.packCards.push(card);
        }
      }
    }

    return {
      success: true,
      pack,
      cards: this.packCards,
      choicesRemaining: this.packChoicesRemaining
    };
  }

  /**
   * Player picks a card from the opened booster pack
   */
  pickPackCard(index) {
    if (index < 0 || index >= this.packCards.length) return { success: false, message: 'Invalid pick' };
    const item = this.packCards[index];

    if (item.category === 'joker') {
      if (this.game.jokerSystem.count >= this.game.jokerSystem.maxJokers) {
        return { success: false, message: 'Joker slots are full! Sell a Joker first.' };
      }
      this.game.jokerSystem.addJoker(item);
    } else if (item.category === 'consumable') {
      if (this.game.consumableSystem.count >= this.game.consumableSystem.maxSlots) {
        // Can either add to consumable bar OR use immediately!
        return { success: false, message: 'Consumable slots full! Use or sell a consumable.' };
      }
      this.game.consumableSystem.addConsumable(item);
    } else if (item.category === 'playing_card') {
      // Add card to player's deck
      this.game.deck.push(item);
    }

    this.packCards.splice(index, 1);
    this.packChoicesRemaining -= 1;

    if (this.game && this.game.statsManager) {
      this.game.statsManager.recordCardPurchased(item);
    }

    const packFinished = this.packChoicesRemaining <= 0;
    if (packFinished) {
      this.activePack = null;
      this.packCards = [];
    }

    return {
      success: true,
      item,
      packFinished,
      choicesRemaining: this.packChoicesRemaining
    };
  }

  /**
   * Skip remaining pack choices and return to shop
   */
  skipPack() {
    this.activePack = null;
    this.packCards = [];
    this.packChoicesRemaining = 0;
    return { success: true };
  }
}
