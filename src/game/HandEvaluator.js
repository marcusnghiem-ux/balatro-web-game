/**
 * HandEvaluator.js
 * Comprehensive poker hand evaluation engine supporting standard poker combinations,
 * Balatro secret hands (Five of a Kind), Wild cards, and scalable hand levels.
 */

export const HAND_DEFINITIONS = {
  'Flush Five':      { baseChips: 160, baseMult: 16, levelChips: 40, levelMult: 3, description: '5 cards of the same rank and suit' },
  'Flush House':     { baseChips: 140, baseMult: 14, levelChips: 40, levelMult: 3, description: 'A Full House with all cards of the same suit' },
  'Five of a Kind':  { baseChips: 120, baseMult: 12, levelChips: 35, levelMult: 3, description: '5 cards of the same rank' },
  'Straight Flush':  { baseChips: 100, baseMult: 8,  levelChips: 40, levelMult: 3, description: '5 cards in sequence, all same suit' },
  'Royal Flush':     { baseChips: 100, baseMult: 8,  levelChips: 40, levelMult: 3, description: 'A, K, Q, J, 10 of one suit' },
  'Four of a Kind':  { baseChips: 60,  baseMult: 7,  levelChips: 30, levelMult: 3, description: '4 cards of the same rank' },
  'Full House':      { baseChips: 40,  baseMult: 4,  levelChips: 25, levelMult: 2, description: 'A Three of a Kind and a Pair' },
  'Flush':           { baseChips: 35,  baseMult: 4,  levelChips: 15, levelMult: 2, description: '5 cards of any suit that match' },
  'Straight':        { baseChips: 30,  baseMult: 4,  levelChips: 30, levelMult: 2, description: '5 cards in consecutive sequence' },
  'Three of a Kind': { baseChips: 30,  baseMult: 3,  levelChips: 20, levelMult: 2, description: '3 cards of the same rank' },
  'Two Pair':        { baseChips: 20,  baseMult: 2,  levelChips: 20, levelMult: 1, description: '2 pairs of different ranks' },
  'Pair':            { baseChips: 10,  baseMult: 2,  levelChips: 15, levelMult: 1, description: '2 cards of the same rank' },
  'High Card':       { baseChips: 5,   baseMult: 1,  levelChips: 10, levelMult: 1, description: 'No other poker hand made' }
};

export class HandEvaluator {
  /**
   * Evaluates an array of up to 5 cards and returns the poker hand details
   * @param {Card[]} cards - 1 to 5 selected cards
   * @param {Object} [handLevels] - Map of handName -> level integer (default 1)
   * @returns {Object} Evaluation report
   */
  static evaluate(cards, handLevels = {}) {
    if (!cards || cards.length === 0) {
      return {
        handName: 'None',
        level: 1,
        chips: 0,
        mult: 0,
        baseChips: 0,
        baseMult: 0,
        scoringCards: [],
        allCards: []
      };
    }

    // Sort descending by rank order
    const sorted = [...cards].sort((a, b) => b.order - a.order);
    const n = sorted.length;

    // Group cards by rank
    const rankGroups = {};
    for (const card of sorted) {
      rankGroups[card.rank] = rankGroups[card.rank] || [];
      rankGroups[card.rank].push(card);
    }
    const rankCounts = Object.entries(rankGroups)
      .map(([rank, list]) => ({ rank, count: list.length, cards: list }))
      .sort((a, b) => b.count - a.count || b.cards[0].order - a.cards[0].order);

    const isFlushResult = n === 5 && HandEvaluator.checkFlush(sorted);
    const straightResult = n === 5 ? HandEvaluator.checkStraight(sorted) : { isStraight: false, straightCards: [] };

    let handName = 'High Card';
    let scoringCards = [sorted[0]];

    // 1. Flush Five
    if (rankCounts[0].count === 5 && isFlushResult) {
      handName = 'Flush Five';
      scoringCards = sorted;
    }
    // 2. Flush House
    else if (rankCounts[0].count === 3 && rankCounts[1] && rankCounts[1].count >= 2 && isFlushResult) {
      handName = 'Flush House';
      scoringCards = [...rankCounts[0].cards, ...rankCounts[1].cards.slice(0, 2)];
    }
    // 3. Five of a Kind
    else if (rankCounts[0].count === 5) {
      handName = 'Five of a Kind';
      scoringCards = sorted;
    }
    // 4. Straight Flush / Royal Flush
    else if (isFlushResult && straightResult.isStraight) {
      const isRoyal = straightResult.straightCards[0].rank === 'A' && straightResult.straightCards[4].rank === '10';
      handName = isRoyal ? 'Royal Flush' : 'Straight Flush';
      scoringCards = straightResult.straightCards;
    }
    // 5. Four of a Kind
    else if (rankCounts[0].count === 4) {
      handName = 'Four of a Kind';
      scoringCards = rankCounts[0].cards;
    }
    // 6. Full House
    else if (rankCounts[0].count === 3 && rankCounts[1] && rankCounts[1].count >= 2) {
      handName = 'Full House';
      scoringCards = [...rankCounts[0].cards, ...rankCounts[1].cards.slice(0, 2)];
    }
    // 5. Flush
    else if (isFlushResult) {
      handName = 'Flush';
      scoringCards = sorted;
    }
    // 6. Straight
    else if (straightResult.isStraight) {
      handName = 'Straight';
      scoringCards = straightResult.straightCards;
    }
    // 7. Three of a Kind
    else if (rankCounts[0].count === 3) {
      handName = 'Three of a Kind';
      scoringCards = rankCounts[0].cards;
    }
    // 8. Two Pair
    else if (rankCounts[0].count === 2 && rankCounts[1] && rankCounts[1].count === 2) {
      handName = 'Two Pair';
      scoringCards = [...rankCounts[0].cards, ...rankCounts[1].cards];
    }
    // 9. Pair
    else if (rankCounts[0].count === 2) {
      handName = 'Pair';
      scoringCards = rankCounts[0].cards;
    }
    // 10. High Card
    else {
      handName = 'High Card';
      scoringCards = [sorted[0]];
    }

    // Hand level calculations
    const def = HAND_DEFINITIONS[handName] || HAND_DEFINITIONS['High Card'];
    const level = handLevels[handName] || 1;
    const chips = def.baseChips + (level - 1) * def.levelChips;
    const mult = def.baseMult + (level - 1) * def.levelMult;

    return {
      handName,
      level,
      chips,
      mult,
      baseChips: chips,
      baseMult: mult,
      scoringCards,
      allCards: sorted,
      description: def.description
    };
  }

  /**
   * Check if 5 cards satisfy flush criteria (accounting for Wild enhancement)
   * @param {Card[]} cards
   * @returns {boolean}
   */
  static checkFlush(cards) {
    if (cards.length !== 5) return false;
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    // Check if all cards can belong to any one of the 4 suits
    return suits.some(targetSuit => {
      return cards.every(card => card.enhancement === 'wild' || card.suit === targetSuit);
    });
  }

  /**
   * Check if 5 cards satisfy straight criteria
   * @param {Card[]} cards - sorted descending
   * @returns {{ isStraight: boolean, straightCards: Card[] }}
   */
  static checkStraight(cards) {
    if (cards.length !== 5) return { isStraight: false, straightCards: [] };

    // Check unique orders
    const uniqueCards = [];
    const seenRanks = new Set();
    for (const card of cards) {
      if (!seenRanks.has(card.rank)) {
        seenRanks.add(card.rank);
        uniqueCards.push(card);
      }
    }
    if (uniqueCards.length !== 5) return { isStraight: false, straightCards: [] };

    // Standard sequence check (e.g. 9-8-7-6-5 or 14-13-12-11-10)
    let isStandardStraight = true;
    for (let i = 0; i < 4; i++) {
      if (uniqueCards[i].order - uniqueCards[i + 1].order !== 1) {
        isStandardStraight = false;
        break;
      }
    }

    if (isStandardStraight) {
      return { isStraight: true, straightCards: uniqueCards };
    }

    // Ace-low straight check: A, 5, 4, 3, 2
    if (
      uniqueCards[0].rank === 'A' &&
      uniqueCards[1].rank === '5' &&
      uniqueCards[2].rank === '4' &&
      uniqueCards[3].rank === '3' &&
      uniqueCards[4].rank === '2'
    ) {
      return { isStraight: true, straightCards: uniqueCards };
    }

    return { isStraight: false, straightCards: [] };
  }
}
