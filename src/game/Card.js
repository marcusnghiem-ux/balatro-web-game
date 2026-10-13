/**
 * Card.js
 * Represents a playing card with suit, rank, Balatro editions, enhancements,
 * selection states, and interactive drag-and-drop metadata.
 */

import { KingQueenRenderer } from '../ui/KingQueenRenderer.js';

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
    this.isFaceDown = options.isFaceDown || false;

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
   * Procedural high-contrast pixel-art SVG court cards (King, Queen, Jack)
   * Powered by KingQueenRenderer.
   */
  static getFaceCardSvg(rank, suit) {
    return KingQueenRenderer.getFaceCardSvg(rank, suit);
  }

  /**
   * Procedural grand Ace pixel emblem matching Reference Screenshot 4
   */
  static getAceSvg(suit) {
    const isRed = suit === 'hearts' || suit === 'diamonds';
    const mainCol = isRed ? '#fe5f55' : '#009dff';
    const darkCol = isRed ? '#b03a2e' : '#1b4f72';

    if (suit === 'diamonds') {
      return `
        <svg viewBox="0 0 60 76" class="w-full h-full select-none pointer-events-none drop-shadow-md">
          <polygon points="30,6 54,38 30,70 6,38" fill="${mainCol}" stroke="#ffffff" stroke-width="2.5"/>
          <!-- Internal horizontal hatch engraving -->
          <line x1="12" y1="32" x2="48" y2="32" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <line x1="16" y1="26" x2="44" y2="26" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <line x1="22" y1="20" x2="38" y2="20" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <line x1="12" y1="44" x2="48" y2="44" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <line x1="16" y1="50" x2="44" y2="50" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <line x1="22" y1="56" x2="38" y2="56" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <!-- Inner core diamond -->
          <polygon points="30,22 42,38 30,54 18,38" fill="${darkCol}"/>
        </svg>
      `;
    }

    if (suit === 'spades') {
      return `
        <svg viewBox="0 0 60 76" class="w-full h-full select-none pointer-events-none drop-shadow-md">
          <path d="M 30 8 C 22 24, 8 36, 12 50 C 16 60, 26 56, 30 46 C 34 56, 44 60, 48 50 C 52 36, 38 24, 30 8 Z" fill="${mainCol}" stroke="#ffffff" stroke-width="2.5"/>
          <path d="M 26 46 L 24 64 L 36 64 L 34 46 Z" fill="${mainCol}" stroke="#ffffff" stroke-width="2"/>
          <line x1="18" y1="36" x2="42" y2="36" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <line x1="22" y1="28" x2="38" y2="28" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <circle cx="30" cy="38" r="6" fill="${darkCol}"/>
        </svg>
      `;
    }

    if (suit === 'hearts') {
      return `
        <svg viewBox="0 0 60 76" class="w-full h-full select-none pointer-events-none drop-shadow-md">
          <path d="M 30 20 C 24 6, 8 10, 8 26 C 8 46, 30 66, 30 66 C 30 66, 52 46, 52 26 C 52 10, 36 6, 30 20 Z" fill="${mainCol}" stroke="#ffffff" stroke-width="2.5"/>
          <line x1="16" y1="30" x2="44" y2="30" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <line x1="20" y1="38" x2="40" y2="38" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8"/>
          <circle cx="30" cy="34" r="5" fill="${darkCol}"/>
        </svg>
      `;
    }

    // Clubs
    return `
      <svg viewBox="0 0 60 76" class="w-full h-full select-none pointer-events-none drop-shadow-md">
        <circle cx="30" cy="22" r="12" fill="${mainCol}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="18" cy="38" r="12" fill="${mainCol}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="42" cy="38" r="12" fill="${mainCol}" stroke="#ffffff" stroke-width="2"/>
        <path d="M 26 38 L 24 62 L 36 62 L 34 38 Z" fill="${mainCol}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="30" cy="34" r="5" fill="${darkCol}"/>
      </svg>
    `;
  }

  /**
   * Authentic Balatro card back (Ornamental red geometric filigree)
   */
  static getCardBackSvg() {
    return `
      <div class="w-full h-full rounded-xl bg-[#c0392b] border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden select-none">
        <div class="absolute inset-1 rounded-lg border border-amber-300/60 opacity-80" style="background: repeating-linear-gradient(45deg, #a93226, #a93226 4px, #c0392b 4px, #c0392b 8px);"></div>
        <div class="w-8 h-10 rounded-full border-2 border-amber-200/90 flex items-center justify-center bg-[#8e281d] z-10 shadow">
          <span class="text-amber-200 text-lg font-pixel font-bold">❂</span>
        </div>
      </div>
    `;
  }

  /**
   * Toggle selected state
   * @returns {boolean}
   */
  toggleSelect() {
    if (this.isFaceDown) return false;
    this.selected = !this.selected;
    return this.selected;
  }

  setSelected(val) {
    if (this.isFaceDown) return;
    this.selected = !!val;
  }

  isFaceCard() {
    return ['J', 'Q', 'K'].includes(this.rank);
  }

  isEven() {
    return ['2', '4', '6', '8', '10'].includes(this.rank);
  }

  isOdd() {
    return ['3', '5', '7', '9', 'A'].includes(this.rank);
  }

  getSuitSymbol() {
    return SUIT_SYMBOLS[this.suit] || '?';
  }

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

  clone() {
    const card = new Card(this.suit, this.rank, {
      edition: this.edition,
      enhancement: this.enhancement,
      debuffed: this.debuffed,
      isFaceDown: this.isFaceDown
    });
    card.selected = this.selected;
    return card;
  }
}

