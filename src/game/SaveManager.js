/**
 * SaveManager.js
 * Comprehensive mid-run persistence and profile unlock management via localStorage.
 * Automatically saves state after every meaningful game action (reordering, purchases,
 * hands played, discards, blind progression) and allows seamless mid-run continuation.
 */

import { Card } from './Card.js';

export const RUN_STORAGE_KEY = 'balatro_active_run_v1';
export const PROFILE_STORAGE_KEY = 'balatro_profile_v1';

export class SaveManager {
  constructor() {
    this.storageAvailable = this.checkStorage();
  }

  checkStorage() {
    try {
      const test = '__balatro_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  /**
   * Checks if an active ongoing run exists in storage
   * @returns {boolean}
   */
  hasActiveRun() {
    if (!this.storageAvailable) return false;
    try {
      const raw = localStorage.getItem(RUN_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed && parsed.ante && parsed.deck && parsed.deck.length > 0 && !parsed.runFinished);
    } catch (err) {
      return false;
    }
  }

  /**
   * Serializes and writes complete run state to localStorage
   * @param {import('./GameEngine.js').GameEngine} game
   */
  saveCurrentRun(game) {
    if (!this.storageAvailable || !game) return false;

    // Do not save dead or finished runs as active
    if (game.state === 'GAME_OVER' || (game.state === 'VICTORY' && !game.endlessMode)) {
      this.clearActiveRun();
      return true;
    }

    try {
      const snapshot = {
        timestamp: Date.now(),
        state: game.state,
        ante: game.ante,
        maxAnte: game.maxAnte,
        blindIndex: game.blindIndex,
        blindType: game.blindType,
        round: game.round,
        roundScore: game.roundScore,
        roundTarget: game.roundTarget,
        handsLeft: game.handsLeft,
        discardsLeft: game.discardsLeft,
        money: game.money,
        handsPlayedTotal: game.handsPlayedTotal || 0,
        endlessMode: Boolean(game.endlessMode),
        selectedDeck: game.selectedDeck,
        selectedStake: game.selectedStake,
        handLevels: game.handLevels,
        activeSkipTags: game.activeSkipTags || [],
        anteBlinds: game.anteBlinds || [],
        voucherBoughtThisAnte: Boolean(game.voucherBoughtThisAnte),

        // Deck, Hand, and Discard serialization
        deck: (game.deck || []).map(c => this.serializeCard(c)),
        hand: (game.hand || []).map(c => this.serializeCard(c)),
        discardPile: (game.discardPile || []).map(c => this.serializeCard(c)),

        // Jokers: strict sequence preservation, stickers, countdowns
        jokers: (game.jokerSystem ? game.jokerSystem.getJokers() : []).map(j => ({
          id: j.id,
          name: j.name,
          category: 'joker',
          rarity: j.rarity,
          cost: j.cost,
          sellValue: j.sellValue,
          description: j.description,
          icon: j.icon,
          edition: j.edition || 'normal',
          isEternal: Boolean(j.isEternal),
          isPerishable: Boolean(j.isPerishable),
          isRental: Boolean(j.isRental),
          perishableRoundsLeft: j.perishableRoundsLeft,
          // BUG FIX #1: Persist all dynamic runtime counters so they survive save/load.
          handsRemaining: j.handsRemaining,
          currentMult: j.currentMult,
          currentChips: j.currentChips,
          currentMultMultiplier: j.currentMultMultiplier,
          handSizeBonus: j.handSizeBonus,
          debuffed: Boolean(j.debuffed),
          instanceId: j.instanceId || `joker_${j.id}_${Math.random().toString(36).substr(2, 6)}`
        })),

        // Consumables: Tarots, Planets, Spectrals in order
        consumables: (game.consumableSystem ? game.consumableSystem.getItems() : []).map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          cost: c.cost,
          sellValue: c.sellValue,
          description: c.description,
          icon: c.icon,
          instanceId: c.instanceId
        })),

        // Shop Engine state
        shop: {
          rerollCost: game.shopEngine ? game.shopEngine.rerollCost : 5,
          rerollCount: game.shopEngine ? game.shopEngine.rerollCount : 0,
          shopCards: (game.shopEngine && game.shopEngine.shopCards ? game.shopEngine.shopCards : []).map(item => ({
            ...item,
            instanceId: item.instanceId
          })),
          boosterPacks: game.shopEngine && game.shopEngine.boosterPacks ? game.shopEngine.boosterPacks : [],
          currentVoucher: game.shopEngine ? game.shopEngine.currentVoucher : null,
          purchasedVouchers: game.shopEngine && game.shopEngine.purchasedVouchers ? game.shopEngine.purchasedVouchers : []
        }
      };

      localStorage.setItem(RUN_STORAGE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (err) {
      console.warn('Failed to save Balatro run:', err);
      return false;
    }
  }

  /**
   * Deserializes and restores the full run state into the given GameEngine
   * @param {import('./GameEngine.js').GameEngine} game
   * @returns {boolean}
   */
  loadCurrentRun(game) {
    if (!this.storageAvailable || !game) return false;

    try {
      const raw = localStorage.getItem(RUN_STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.ante) return false;

      // Restore core properties
      game.ante = data.ante;
      game.maxAnte = data.maxAnte || 8;
      game.blindIndex = data.blindIndex || 0;
      game.blindType = data.blindType || 'small';
      game.round = data.round || 1;
      game.roundScore = data.roundScore || 0;
      game.roundTarget = data.roundTarget || 300;
      game.handsLeft = data.handsLeft !== undefined ? data.handsLeft : 4;
      game.discardsLeft = data.discardsLeft !== undefined ? data.discardsLeft : 3;
      game.money = data.money !== undefined ? data.money : 10;
      game.handsPlayedTotal = data.handsPlayedTotal || 0;
      game.endlessMode = Boolean(data.endlessMode);
      game.selectedDeck = data.selectedDeck || game.selectedDeck;
      game.selectedStake = data.selectedStake || game.selectedStake;
      game.handLevels = data.handLevels || game.handLevels;
      game.activeSkipTags = data.activeSkipTags || [];
      game.anteBlinds = data.anteBlinds || [];
      game.voucherBoughtThisAnte = Boolean(data.voucherBoughtThisAnte);

      // Restore Card Arrays
      game.deck = (data.deck || []).map(c => this.deserializeCard(c));
      game.hand = (data.hand || []).map(c => this.deserializeCard(c));
      game.discardPile = (data.discardPile || []).map(c => this.deserializeCard(c));

      // Restore Jokers (exact sequence and custom hooks)
      if (game.jokerSystem) {
        // BUG FIX #2: Wrong field name '.jokers' → '.activeJokers'.
        // Using the wrong name meant the old array was never cleared, causing
        // Jokers to be duplicated on every 'Continue Run' load.
        game.jokerSystem.activeJokers = [];
        (data.jokers || []).forEach(j => {
          game.jokerSystem.addJoker(j);
          // BUG FIX #1: Restore dynamic runtime counters after addJoker re-initialises them.
          const inst = game.jokerSystem.activeJokers[game.jokerSystem.activeJokers.length - 1];
          if (inst) {
            if (j.currentMult !== undefined)           inst.currentMult           = j.currentMult;
            if (j.currentChips !== undefined)          inst.currentChips          = j.currentChips;
            if (j.currentMultMultiplier !== undefined) inst.currentMultMultiplier = j.currentMultMultiplier;
            if (j.handsRemaining !== undefined)        inst.handsRemaining        = j.handsRemaining;
            if (j.handSizeBonus !== undefined)         inst.handSizeBonus         = j.handSizeBonus;
            if (j.perishableRoundsLeft !== undefined)  inst.perishableRoundsLeft  = j.perishableRoundsLeft;
          }
        });
        game.jokerSystem.updateBlueprintTargets();
      }

      // Restore Consumables
      if (game.consumableSystem) {
        game.consumableSystem.slots = [];
        (data.consumables || []).forEach(c => {
          game.consumableSystem.addConsumable(c);
        });
      }

      // Restore Shop Engine
      if (game.shopEngine && data.shop) {
        game.shopEngine.rerollCost = data.shop.rerollCost || 5;
        game.shopEngine.rerollCount = data.shop.rerollCount || 0;
        game.shopEngine.shopCards = data.shop.shopCards || [];
        game.shopEngine.boosterPacks = data.shop.boosterPacks || [];
        game.shopEngine.currentVoucher = data.shop.currentVoucher || null;
        game.shopEngine.purchasedVouchers = data.shop.purchasedVouchers || [];
      }

      game.state = data.state || 'SELECTING';
      game.syncActiveBlindInfo();

      return true;
    } catch (err) {
      console.error('Failed to load Balatro run from storage:', err);
      return false;
    }
  }

  /**
   * Clears any active run from storage
   */
  clearActiveRun() {
    if (!this.storageAvailable) return;
    try {
      localStorage.removeItem(RUN_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Permanently wipes all stored profile data, active runs, and custom settings
   */
  wipeAllData() {
    if (!this.storageAvailable) return;
    try {
      localStorage.removeItem(RUN_STORAGE_KEY);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem('balatro_settings_v1');
    } catch (e) {
      console.warn('Failed to wipe all storage data:', e);
    }
  }

  serializeCard(card) {
    if (!card) return null;
    return {
      id: card.id,
      suit: card.suit,
      rank: card.rank,
      baseChips: card.baseChips,
      order: card.order,
      enhancement: card.enhancement || 'none',
      edition: card.edition || 'normal',
      seal: card.seal || 'none',
      selected: Boolean(card.selected),
      debuffed: Boolean(card.debuffed)
    };
  }

  deserializeCard(raw) {
    if (!raw) return null;
    const card = new Card(raw.suit, raw.rank, {
      enhancement: raw.enhancement || 'none',
      edition: raw.edition || 'normal',
      seal: raw.seal || 'none'
    });
    card.id = raw.id || card.id;
    card.baseChips = raw.baseChips || card.baseChips;
    card.order = raw.order !== undefined ? raw.order : card.order;
    card.selected = Boolean(raw.selected);
    card.debuffed = Boolean(raw.debuffed);
    return card;
  }
}

export const saveManager = new SaveManager();
