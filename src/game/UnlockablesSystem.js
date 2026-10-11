/**
 * UnlockablesSystem.js
 * Persistent player profile & unlockables manager for Balatro.
 * Tracks unlocked Decks, discovered Jokers, Vouchers, Consumables, and Stake achievements.
 * Reference: https://balatrowiki.org/w/Unlockables
 */

import { DECKS, STAKES } from './DeckDefinitions.js';

const STORAGE_KEY = 'balatro_profile_v1';

export class UnlockablesSystem {
  constructor() {
    this.profile = this.loadProfile();
  }

  loadProfile() {
    const defaultProfile = {
      unlockedDecks: ['deck_red'],
      unlockedJokers: [],
      discoveredItems: ['deck_red', 'joker_joker'],
      deckHighStakes: {},
      runsPlayed: 0,
      runsWon: 0,
      sandboxAllUnlocked: false
    };

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...defaultProfile, ...parsed };
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using in-memory profile');
    }

    return defaultProfile;
  }

  saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Reset profile to initial default factory state
   */
  resetProfile() {
    this.profile = {
      unlockedDecks: ['deck_red'],
      unlockedJokers: [],
      discoveredItems: ['deck_red', 'joker_joker'],
      deckHighStakes: {},
      runsPlayed: 0,
      runsWon: 0,
      sandboxAllUnlocked: false
    };
    this.saveProfile();
  }

  /**
   * Check if a deck is unlocked
   */
  isDeckUnlocked(deckId) {
    if (this.profile.sandboxAllUnlocked) return true;
    const def = DECKS.find(d => d.id === deckId);
    if (!def) return false;
    if (def.unlockedByDefault) return true;
    return this.profile.unlockedDecks.includes(deckId);
  }

  /**
   * Unlock a deck
   */
  unlockDeck(deckId) {
    if (!this.profile.unlockedDecks.includes(deckId)) {
      this.profile.unlockedDecks.push(deckId);
      this.saveProfile();
      return true;
    }
    return false;
  }

  /**
   * Mark an item as discovered (seen/used in collection)
   */
  discoverItem(itemId) {
    if (!this.profile.discoveredItems.includes(itemId)) {
      this.profile.discoveredItems.push(itemId);
      this.checkDeckUnlockRequirements();
      this.saveProfile();
      return true;
    }
    return false;
  }

  getDiscoveredCount() {
    return this.profile.discoveredItems.length;
  }

  /**
   * Check discovery-based deck unlocks
   */
  checkDeckUnlockRequirements() {
    const count = this.getDiscoveredCount();
    DECKS.forEach(deck => {
      if (deck.requiredDiscoveries && count >= deck.requiredDiscoveries) {
        this.unlockDeck(deck.id);
      }
    });
  }

  /**
   * Record a run victory and check win-based unlocks
   */
  recordWin(deckId, stakeId) {
    this.profile.runsWon += 1;
    this.profile.deckHighStakes[deckId] = stakeId;

    // Check specific deck win unlocks
    if (deckId === 'deck_red') this.unlockDeck('deck_magic');
    if (deckId === 'deck_blue') this.unlockDeck('deck_nebula');
    if (deckId === 'deck_yellow') this.unlockDeck('deck_ghost');
    if (deckId === 'deck_green') this.unlockDeck('deck_abandoned');
    if (deckId === 'deck_black') this.unlockDeck('deck_checkered');

    // Check stake win unlocks
    if (stakeId === 'stake_red') this.unlockDeck('deck_zodiac');
    if (stakeId === 'stake_green') this.unlockDeck('deck_painted');
    if (stakeId === 'stake_black') this.unlockDeck('deck_anaglyph');
    if (stakeId === 'stake_blue') this.unlockDeck('deck_plasma');
    if (stakeId === 'stake_orange') this.unlockDeck('deck_erratic');

    this.saveProfile();
  }

  /**
   * Toggle Sandbox Mode (Unlocks all decks and jokers for instant testing)
   */
  toggleSandboxAllUnlocked() {
    this.profile.sandboxAllUnlocked = !this.profile.sandboxAllUnlocked;
    this.saveProfile();
    return this.profile.sandboxAllUnlocked;
  }

  /**
   * Reset profile data back to factory defaults
   */
  resetProfile() {
    this.profile = {
      unlockedDecks: ['deck_red'],
      unlockedJokers: [],
      discoveredItems: ['deck_red', 'joker_joker'],
      deckHighStakes: {},
      runsPlayed: 0,
      runsWon: 0,
      sandboxAllUnlocked: false
    };
    this.saveProfile();
  }
}

export const unlockablesManager = new UnlockablesSystem();
