/**
 * HandLevelManager.js
 * Lead UI/UX & Systems Engineer implementation of Balatro Poker Hand Levels.
 * Manages hand level scaling, chips/multiplier progression, Planet card upgrades,
 * play frequency statistics, and persistence across the active run.
 */

import { HAND_DEFINITIONS } from './HandEvaluator.js';

export const HAND_ORDER = [
  'Straight Flush',
  'Four of a Kind',
  'Full House',
  'Flush',
  'Straight',
  'Three of a Kind',
  'Two Pair',
  'Pair',
  'High Card'
];

export const SECRET_HANDS = [
  'Flush Five',
  'Flush House',
  'Five of a Kind'
];

export const PLANET_HAND_MAP = {
  mercury: { name: 'Mercury', hand: 'Pair', chipGain: 15, multGain: 1, icon: '☿️' },
  uranus: { name: 'Uranus', hand: 'Two Pair', chipGain: 20, multGain: 1, icon: '♅' },
  venus: { name: 'Venus', hand: 'Three of a Kind', chipGain: 20, multGain: 2, icon: '♀️' },
  saturn: { name: 'Saturn', hand: 'Straight', chipGain: 30, multGain: 3, icon: '🪐' },
  jupiter: { name: 'Jupiter', hand: 'Flush', chipGain: 15, multGain: 2, icon: '♃' },
  earth: { name: 'Earth', hand: 'Full House', chipGain: 25, multGain: 2, icon: '🌍' },
  mars: { name: 'Mars', hand: 'Four of a Kind', chipGain: 30, multGain: 3, icon: '♂️' },
  neptune: { name: 'Neptune', hand: 'Straight Flush', chipGain: 40, multGain: 4, icon: '♆' },
  pluto: { name: 'Pluto', hand: 'High Card', chipGain: 10, multGain: 1, icon: '♇' },
  planet_x: { name: 'Planet X', hand: 'Five of a Kind', chipGain: 35, multGain: 3, icon: '🌌' },
  ceres: { name: 'Ceres', hand: 'Flush House', chipGain: 40, multGain: 4, icon: '🌾' },
  eris: { name: 'Eris', hand: 'Flush Five', chipGain: 50, multGain: 3, icon: '🔴' }
};

export class HandLevelManager {
  /**
   * @param {Object} [game=null] Reference to active GameEngine instance
   */
  constructor(game = null) {
    this.game = game;
    this.handLevels = {};
    this.initDefaultLevels();
  }

  /**
   * Initializes all standard and secret poker hands to level 1
   */
  initDefaultLevels() {
    for (const handName of Object.keys(HAND_DEFINITIONS)) {
      this.handLevels[handName] = 1;
    }
  }

  /**
   * Synchronizes levels with game engine state
   * @param {Object} game
   */
  attachGame(game) {
    this.game = game;
    if (game && game.handLevels) {
      for (const [hand, level] of Object.entries(game.handLevels)) {
        this.handLevels[hand] = Math.max(1, level);
      }
    }
  }

  /**
   * Returns current level of a poker hand
   * @param {string} handName
   * @returns {number} Level integer (>= 1)
   */
  getLevel(handName) {
    if (this.game && this.game.handLevels && this.game.handLevels[handName]) {
      return this.game.handLevels[handName];
    }
    return this.handLevels[handName] || 1;
  }

  /**
   * Permanently upgrades a poker hand by N levels (triggered by Planet cards)
   * @param {string} handName
   * @param {number} [levels=1]
   * @returns {Object} Updated stats { handName, level, chips, mult }
   */
  upgradeHand(handName, levels = 1) {
    const current = this.getLevel(handName);
    const newLevel = current + Math.max(1, levels);
    this.handLevels[handName] = newLevel;

    if (this.game) {
      this.game.handLevels = this.game.handLevels || {};
      this.game.handLevels[handName] = newLevel;
      if (typeof this.game.notify === 'function') {
        this.game.notify('HAND_LEVEL_UP', {
          handName,
          level: newLevel,
          stats: this.getHandStats(handName)
        });
      }
    }

    return this.getHandStats(handName);
  }

  /**
   * Returns complete calculated statistics for a single poker hand
   * @param {string} handName
   * @returns {Object}
   */
  getHandStats(handName) {
    const def = HAND_DEFINITIONS[handName] || {
      baseChips: 5,
      baseMult: 1,
      levelChips: 10,
      levelMult: 1,
      description: 'Custom Hand'
    };

    const level = this.getLevel(handName);
    const chips = def.baseChips + (level - 1) * def.levelChips;
    const mult = def.baseMult + (level - 1) * def.levelMult;

    const playCounts = (this.game && this.game.stats && this.game.stats.handPlayCounts) || {};
    const timesPlayed = playCounts[handName] || 0;

    return {
      handName,
      level,
      chips,
      mult,
      baseChips: def.baseChips,
      baseMult: def.baseMult,
      levelChips: def.levelChips,
      levelMult: def.levelMult,
      timesPlayed,
      isUpgraded: level > 1,
      description: def.description
    };
  }

  /**
   * Returns list of all poker hands arranged in authentic Balatro UI order
   * Matching reference screenshot 20261012_133112_HDR.jpg
   * @returns {Array<Object>}
   */
  getAllHandsList() {
    const result = [];

    // Standard 9 hands (from Straight Flush down to High Card)
    for (const handName of HAND_ORDER) {
      if (HAND_DEFINITIONS[handName]) {
        result.push(this.getHandStats(handName));
      }
    }

    // Secret hands if leveled or played
    for (const handName of SECRET_HANDS) {
      const stats = this.getHandStats(handName);
      if (stats.level > 1 || stats.timesPlayed > 0) {
        result.unshift(stats);
      }
    }

    return result;
  }

  /**
   * Resets all hands back to level 1 for a new run
   */
  reset() {
    this.initDefaultLevels();
    if (this.game && this.game.handLevels) {
      for (const handName of Object.keys(HAND_DEFINITIONS)) {
        this.game.handLevels[handName] = 1;
      }
    }
  }
}

export const handLevelManager = new HandLevelManager();
