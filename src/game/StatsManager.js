/**
 * StatsManager.js
 * Comprehensive statistics tracking engine for Balatro runs.
 * Tracks best hand, play counts per hand type, cards played/discarded/purchased,
 * shop rerolls, new discoveries, ante, round, seed, and defeat causes.
 */

export class StatsManager {
  /**
   * @param {string} [initialSeed]
   */
  constructor(initialSeed = 'ALEEB') {
    this.seed = initialSeed;
    this.bestHandScore = 0;
    this.bestHandName = 'High Card';
    this.handPlayCounts = {};
    this.cardsPlayed = 0;
    this.cardsDiscarded = 0;
    this.cardsPurchased = 0;
    this.timesRerolled = 0;
    this.newDiscoveries = 0;
    this.roundsPlayed = 1;
    this.anteReached = 1;
    this.defeatedBy = {
      name: 'Small Blind',
      type: 'Small Blind',
      icon: '❂',
      color: '#0072b2',
      border: '#54b8ff'
    };
  }

  /**
   * Resets all run stats for a fresh run
   * @param {string} [newSeed]
   */
  reset(newSeed = null) {
    this.seed = newSeed || this.generateSeed();
    this.bestHandScore = 0;
    this.bestHandName = 'High Card';
    this.handPlayCounts = {};
    this.cardsPlayed = 0;
    this.cardsDiscarded = 0;
    this.cardsPurchased = 0;
    this.timesRerolled = 0;
    this.newDiscoveries = 0;
    this.roundsPlayed = 1;
    this.anteReached = 1;
    this.defeatedBy = {
      name: 'Small Blind',
      type: 'Small Blind',
      icon: '❂',
      color: '#0072b2',
      border: '#54b8ff'
    };
  }

  /**
   * Generates authentic 5-letter Balatro seed
   * @returns {string}
   */
  generateSeed() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Record a played hand with card count and achieved score
   * @param {string} handName
   * @param {number} cardCount
   * @param {number} score
   */
  recordHandPlay(handName, cardCount = 0, score = 0) {
    if (!handName) handName = 'High Card';
    this.cardsPlayed += Number(cardCount) || 0;
    this.handPlayCounts[handName] = (this.handPlayCounts[handName] || 0) + 1;

    const numericScore = Number(score) || 0;
    if (numericScore > this.bestHandScore) {
      this.bestHandScore = numericScore;
      this.bestHandName = handName;
    }
  }

  /**
   * Record cards discarded during a play turn
   * @param {number} count
   */
  recordCardsDiscarded(count = 0) {
    this.cardsDiscarded += Number(count) || 0;
  }

  /**
   * Record a shop purchase (Joker, Consumable, Pack, or Voucher)
   * @param {Object} [item]
   */
  recordCardPurchased(item = null) {
    this.cardsPurchased += 1;
    if (item && item.isNewDiscovery) {
      this.recordNewDiscovery();
    }
  }

  /**
   * Record a shop reroll action
   */
  recordShopReroll() {
    this.timesRerolled += 1;
  }

  /**
   * Record a newly discovered unlockable item
   */
  recordNewDiscovery() {
    this.newDiscoveries += 1;
  }

  /**
   * Increment the completed round counter
   */
  recordRoundPlayed() {
    this.roundsPlayed += 1;
  }

  /**
   * Set the current Ante level reached
   * @param {number} ante
   */
  setAnte(ante) {
    if (typeof ante === 'number' && !isNaN(ante)) {
      this.anteReached = Math.max(1, ante);
    }
  }

  /**
   * Set the specific blind or boss that defeated the run
   * @param {Object} blind
   */
  setDefeatedBy(blind) {
    if (!blind) return;
    this.defeatedBy = {
      name: blind.name || 'Small Blind',
      type: blind.type || blind.name || 'Small Blind',
      icon: blind.icon || '❂',
      color: blind.color || '#0072b2',
      border: blind.border || '#54b8ff'
    };
  }

  /**
   * Resolves the most played poker hand and its count
   * @returns {{ name: string, count: number, formatted: string }}
   */
  getMostPlayedHand() {
    let mostPlayed = 'High Card';
    let maxCount = 0;

    const entries = Object.entries(this.handPlayCounts);
    if (entries.length > 0) {
      for (const [hand, count] of entries) {
        if (count > maxCount) {
          maxCount = count;
          mostPlayed = hand;
        }
      }
    } else {
      maxCount = 1;
    }

    return {
      name: mostPlayed,
      count: maxCount,
      formatted: `${mostPlayed} (${maxCount})`
    };
  }

  /**
   * Export all aggregated metrics for Game Over summary
   * @param {Object} [context]
   * @returns {Object}
   */
  getSummary(context = {}) {
    const mostPlayed = this.getMostPlayedHand();
    const resolvedBestScore = Math.max(this.bestHandScore, Number(context.finalScore) || 0);

    return {
      bestHandScore: resolvedBestScore,
      bestHandFormatted: resolvedBestScore.toLocaleString(),
      bestHandName: this.bestHandName || 'High Card',
      mostPlayedHandName: mostPlayed.name,
      mostPlayedHandCount: mostPlayed.count,
      mostPlayedHandFormatted: mostPlayed.formatted,
      cardsPlayed: this.cardsPlayed,
      cardsDiscarded: this.cardsDiscarded,
      cardsPurchased: this.cardsPurchased,
      timesRerolled: this.timesRerolled,
      newDiscoveries: this.newDiscoveries,
      roundsPlayed: Math.max(this.roundsPlayed, Number(context.round) || 1),
      anteReached: Math.max(this.anteReached, Number(context.ante) || 1),
      seed: (context.seed || this.seed || 'ALEEB').toUpperCase(),
      defeatedBy: this.defeatedBy || {
        name: 'Small Blind',
        type: 'Small Blind',
        icon: '❂',
        color: '#0072b2',
        border: '#54b8ff'
      }
    };
  }
}

// Global Singleton Instance for engine-wide statistical parity
export const statsManager = new StatsManager('ALEEB');
