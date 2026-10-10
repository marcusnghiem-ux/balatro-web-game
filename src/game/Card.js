/**
 * Card.js
 * Represents a playing card with suit, rank, Balatro editions, enhancements,
 * selection states, and interactive drag-and-drop metadata.
 */

export const SUITS = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades'
};

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

export const EDITIONS = {
  NORMAL: 'normal',
  FOIL: 'foil',           // +50 Chips
  HOLO: 'holo',           // +10 Mult
  POLYCHROME: 'polychrome'// x1.5 Mult
};

export const ENHANCEMENTS = {
  NONE: 'none',
  BONUS: 'bonus', // +30 Chips
  MULT: 'mult',   // +4 Mult
  WILD: 'wild',   // Counts as any suit
  GLASS: 'glass', // x2 Mult, 1 in 4 chance to destroy card
  STEEL: 'steel', // x1.5 Mult while in hand
  GOLD: 'gold',   // +$3 if in hand at round end
  STONE: 'stone', // +50 Chips, no rank or suit
  LUCKY: 'lucky'  // 1 in 5 chance for +20 Mult, 1 in 15 chance for +$20
};

export const ENHANCEMENT_LABELS = {
  bonus: { name: 'Bonus', badge: '+30 Chips', color: '#009dff' },
  mult: { name: 'Mult', badge: '+4 Mult', color: '#fe5f55' },
  wild: { name: 'Wild', badge: 'Any Suit', color: '#a855f7' },
  glass: { name: 'Glass', badge: '×2 Mult', color: '#38bdf8' },
  steel: { name: 'Steel', badge: '×1.5 in Hand', color: '#94a3b8' },
  gold: { name: 'Gold', badge: '+$3 End Round', color: '#f59e0b' },
  stone: { name: 'Stone', badge: '+50 Chips', color: '#64748b' },
  lucky: { name: 'Lucky', badge: '+20M / +$20', color: '#10b981' }
};

export class Card {
  /**
   * @param {string} suit - 'hearts' | 'diamonds' | 'clubs' | 'spades'
   * @param {string} rank - '2' through '10', 'J', 'Q', 'K', 'A'
   * @param {Object} [options]
   */
  constructor(suit, rank, options = {}) {
    this.id = options.id || `card_${suit}_${rank}_${Math.random().toString(36).substr(2, 9)}`;
    this.suit = suit;
    this.rank = rank;

    // Numerical rank order: 2 = 2 ... 10 = 10, J = 11, Q = 12, K = 13, A = 14
    this.order = Card.getRankOrder(rank);

    // Scoring base chips: 2-10 = rank value, J/Q/K = 10, A = 11
    this.baseChips = Card.getRankChips(rank);

    // Modifiers & enhancements
    this.edition = options.edition || EDITIONS.NORMAL;
    this.enhancement = options.enhancement || ENHANCEMENTS.NONE;
    this.debuffed = options.debuffed || false;

    // Interactive UI states
    this.selected = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.domElement = null;
  }

  static getRankOrder(rank) {
    const map = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
      '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return map[rank] || 2;
  }

  static getRankChips(rank) {
    if (rank === 'A') return 11;
    if (['K', 'Q', 'J', '10'].includes(rank)) return 10;
    return parseInt(rank, 10) || 2;
  }

  /**
   * Toggle selected state
   * @returns {boolean}
   */
  toggleSelect() {
    this.selected = !this.selected;
    return this.selected;
  }

  /**
   * Explicitly set selection
   * @param {boolean} val
   */
  setSelected(val) {
    this.selected = !!val;
  }

  /**
   * Check if card is a face card (Jack, Queen, King)
   * @returns {boolean}
   */
  isFaceCard() {
    return ['J', 'Q', 'K'].includes(this.rank);
  }

  /**
   * Check if rank is even
   * @returns {boolean}
   */
  isEven() {
    return ['2', '4', '6', '8', '10'].includes(this.rank);
  }

  /**
   * Check if rank is odd
   * @returns {boolean}
   */
  isOdd() {
    return ['3', '5', '7', '9', 'A'].includes(this.rank);
  }

  /**
   * Get suit symbol
   * @returns {string}
   */
  getSuitSymbol() {
    return SUIT_SYMBOLS[this.suit] || '?';
  }

  /**
   * Get formatted display name
   * @returns {string}
   */
  getDisplayName() {
    const rankNames = {
      'A': 'Ace',
      'K': 'King',
      'Q': 'Queen',
      'J': 'Jack'
    };
    const r = rankNames[this.rank] || this.rank;
    const s = this.suit.charAt(0).toUpperCase() + this.suit.slice(1);
    return `${r} of ${s}`;
  }

  /**
   * Clone card instance
   * @returns {Card}
   */
  clone() {
    const card = new Card(this.suit, this.rank, {
      edition: this.edition,
      enhancement: this.enhancement,
      debuffed: this.debuffed
    });
    card.selected = this.selected;
    return card;
  }
}
