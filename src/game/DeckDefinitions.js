/**
 * DeckDefinitions.js
 * Complete specifications for all 15 official Balatro Decks and 8 Stakes (difficulty levels).
 * Reference: https://balatrowiki.org/w/Decks
 */

export const DECKS = [
  {
    id: 'deck_red',
    name: 'Red Deck',
    icon: '🔴',
    color: '#e74c3c',
    bgPattern: 'repeating-linear-gradient(45deg, #c0392b, #c0392b 10px, #a93226 10px, #a93226 20px)',
    description: '+1 discard every round',
    unlockDesc: 'Unlocked from start',
    unlockedByDefault: true,
    apply: (game) => {
      game.maxDiscards = 4;
      game.discardsLeft = 4;
    }
  },
  {
    id: 'deck_blue',
    name: 'Blue Deck',
    icon: '🔵',
    color: '#2980b9',
    bgPattern: 'repeating-linear-gradient(45deg, #2980b9, #2980b9 10px, #1f618d 10px, #1f618d 20px)',
    description: '+1 hand every round',
    unlockDesc: 'Discover at least 20 items from your collection',
    requiredDiscoveries: 20,
    unlockedByDefault: false,
    apply: (game) => {
      game.maxHands = 5;
      game.handsLeft = 5;
    }
  },
  {
    id: 'deck_yellow',
    name: 'Yellow Deck',
    icon: '🟡',
    color: '#d4ac0d',
    bgPattern: 'repeating-linear-gradient(45deg, #d4ac0d, #d4ac0d 10px, #b7950b 10px, #b7950b 20px)',
    description: 'Start with extra $10 (total $14)',
    unlockDesc: 'Discover at least 50 items from your collection',
    requiredDiscoveries: 50,
    unlockedByDefault: false,
    apply: (game) => {
      game.money += 10;
    }
  },
  {
    id: 'deck_green',
    name: 'Green Deck',
    icon: '🟢',
    color: '#27ae60',
    bgPattern: 'repeating-linear-gradient(45deg, #27ae60, #27ae60 10px, #1e8449 10px, #1e8449 20px)',
    description: 'At end of each Round: $2 per remaining Hand, $1 per remaining Discard. Earn no Interest',
    unlockDesc: 'Discover at least 75 items from your collection',
    requiredDiscoveries: 75,
    unlockedByDefault: false,
    apply: (game) => {
      game.greenDeckActive = true;
    }
  },
  {
    id: 'deck_black',
    name: 'Black Deck',
    icon: '⚫',
    color: '#1c2833',
    bgPattern: 'repeating-linear-gradient(45deg, #1c2833, #1c2833 10px, #17202a 10px, #17202a 20px)',
    description: '+1 Joker slot, -1 hand every round',
    unlockDesc: 'Discover at least 100 items from your collection',
    requiredDiscoveries: 100,
    unlockedByDefault: false,
    apply: (game) => {
      game.jokerSystem.maxJokers = 6;
      game.maxHands = 3;
      game.handsLeft = 3;
    }
  },
  {
    id: 'deck_magic',
    name: 'Magic Deck',
    icon: '🔮',
    color: '#8e44ad',
    bgPattern: 'radial-gradient(circle at 40% 40%, #f39c12 0%, #8e44ad 38%, #2980b9 75%, #1a252f 100%)',
    description: 'Start run with the Crystal Ball voucher and 2 copies of The Fool',
    descriptionHtml: 'Start run with the <span style="color:#8e44ad; font-weight:800;">Crystal Ball</span> voucher and <span style="color:#8e44ad; font-weight:800;">2 copies of The Fool</span>',
    unlockDesc: 'Win a run with Red Deck on any difficulty',
    unlockedByDefault: false,
    apply: (game) => {
      // Add Crystal Ball voucher
      game.activeVouchers = game.activeVouchers || [];
      game.activeVouchers.push('voucher_crystal_ball');
      game.consumableSystem.maxSlots += 1;
      // Add 2 copies of The Fool
      const foolCard1 = {
        id: 'tarot_fool_1',
        name: 'The Fool',
        type: 'Tarot',
        icon: '🃏',
        sellValue: 1,
        description: 'Creates the last Tarot or Planet card used during this run',
        canUse: () => true,
        execute: (g) => ({ success: true, message: 'The Fool executed!' })
      };
      const foolCard2 = { ...foolCard1, id: 'tarot_fool_2' };
      game.consumableSystem.addConsumable(foolCard1);
      game.consumableSystem.addConsumable(foolCard2);
    }
  },
  {
    id: 'deck_nebula',
    name: 'Nebula Deck',
    icon: '🌌',
    color: '#5b2c6f',
    bgPattern: 'radial-gradient(ellipse, #7d3c98 0%, #2e114d 100%)',
    description: 'Start run with the Telescope voucher, -1 consumable slot',
    unlockDesc: 'Win a run with Blue Deck on any difficulty',
    unlockedByDefault: false,
    apply: (game) => {
      game.activeVouchers = game.activeVouchers || [];
      game.activeVouchers.push('voucher_telescope');
      game.consumableSystem.maxSlots = Math.max(1, game.consumableSystem.maxSlots - 1);
    }
  },
  {
    id: 'deck_ghost',
    name: 'Ghost Deck',
    icon: '👻',
    color: '#16a085',
    bgPattern: 'repeating-linear-gradient(135deg, #1abc9c, #1abc9c 10px, #117864 10px, #117864 20px)',
    description: 'Spectral cards may appear in shop, start with a Hex card',
    unlockDesc: 'Win a run with Yellow Deck on any difficulty',
    unlockedByDefault: false,
    apply: (game) => {
      game.ghostDeckActive = true;
      const hexCard = {
        id: 'spectral_hex',
        name: 'Hex',
        type: 'Spectral',
        icon: '✨',
        sellValue: 2,
        description: 'Add Polychrome to a random Joker, destroy all others',
        canUse: (g) => g.jokerSystem.count > 0,
        execute: (g) => {
          const jokers = g.jokerSystem.getJokers();
          if (jokers.length > 0) {
            jokers[0].edition = 'polychrome';
            return { success: true, message: 'Hex added Polychrome!' };
          }
          return { success: false, message: 'No Jokers to enchant!' };
        }
      };
      game.consumableSystem.addConsumable(hexCard);
    }
  },
  {
    id: 'deck_abandoned',
    name: 'Abandoned Deck',
    icon: '🏚️',
    color: '#7f8c8d',
    bgPattern: 'repeating-linear-gradient(45deg, #95a5a6, #95a5a6 10px, #7f8c8d 10px, #7f8c8d 20px)',
    description: 'Start run with no Face Cards in your deck (40 cards)',
    unlockDesc: 'Win a run with Green Deck on any difficulty',
    unlockedByDefault: false,
    apply: (game) => {
      game.deck = game.deck.filter(c => !['J', 'Q', 'K'].includes(c.rank));
    }
  },
  {
    id: 'deck_checkered',
    name: 'Checkered Deck',
    icon: '🏁',
    color: '#900c3f',
    bgPattern: 'repeating-conic-gradient(#17202a 0% 25%, #900c3f 0% 50%) 50% / 20px 20px',
    description: 'Start run with 26 Spades and 26 Hearts in deck',
    unlockDesc: 'Win a run with Black Deck on any difficulty',
    unlockedByDefault: false,
    apply: (game) => {
      // 26 Spades and 26 Hearts
      game.deck.forEach((card, idx) => {
        card.suit = idx < 26 ? 'spades' : 'hearts';
      });
    }
  },
  {
    id: 'deck_zodiac',
    name: 'Zodiac Deck',
    icon: '♈',
    color: '#1b4f72',
    bgPattern: 'radial-gradient(circle, #2874a6 10%, #154360 90%)',
    description: 'Start run with Tarot Merchant, Planet Merchant, and Overstock vouchers',
    unlockDesc: 'Win a run with any deck on Red Stake difficulty or harder',
    unlockedByDefault: false,
    apply: (game) => {
      game.activeVouchers = game.activeVouchers || [];
      game.activeVouchers.push('voucher_tarot_merchant', 'voucher_planet_merchant', 'voucher_overstock');
      game.shopCardSlots = 3;
    }
  },
  {
    id: 'deck_painted',
    name: 'Painted Deck',
    icon: '🎨',
    color: '#d35400',
    bgPattern: 'linear-gradient(45deg, #e74c3c, #f39c12, #2ecc71, #3498db)',
    description: '+2 hand size, -1 Joker slot',
    unlockDesc: 'Win a run with any deck on Green Stake difficulty or harder',
    unlockedByDefault: false,
    apply: (game) => {
      game.maxHandSize = 10;
      game.jokerSystem.maxJokers = 4;
    }
  },
  {
    id: 'deck_anaglyph',
    name: 'Anaglyph Deck',
    icon: '🕶️',
    color: '#00a8ff',
    bgPattern: 'repeating-linear-gradient(90deg, #e74c3c 0 8px, #00a8ff 8px 16px)',
    description: 'After defeating each Boss Blind, gain a Double Tag',
    unlockDesc: 'Win a run with any deck on Black Stake difficulty or harder',
    unlockedByDefault: false,
    apply: (game) => {
      game.anaglyphDeckActive = true;
    }
  },
  {
    id: 'deck_plasma',
    name: 'Plasma Deck',
    icon: '⚡',
    color: '#9b59b6',
    bgPattern: 'radial-gradient(circle, #e056fd 20%, #686de0 80%)',
    description: 'Balance Chips and Mult when scoring hand, X2 base Blind size',
    unlockDesc: 'Win a run with any deck on Blue Stake difficulty or harder',
    unlockedByDefault: false,
    apply: (game) => {
      game.plasmaDeckActive = true;
    }
  },
  {
    id: 'deck_erratic',
    name: 'Erratic Deck',
    icon: '🎲',
    color: '#2c3e50',
    bgPattern: 'repeating-linear-gradient(45deg, #34495e 0, #34495e 4px, #1a252f 4px, #1a252f 8px)',
    description: 'All Ranks and Suits in deck are randomized',
    unlockDesc: 'Win a run with any deck on Orange Stake difficulty or harder',
    unlockedByDefault: false,
    apply: (game) => {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      game.deck.forEach(c => {
        c.suit = suits[Math.floor(Math.random() * suits.length)];
        c.rank = ranks[Math.floor(Math.random() * ranks.length)];
      });
    }
  }
];

export const STAKES = [
  {
    id: 'stake_white',
    name: 'White Stake',
    icon: '⚪',
    color: '#ecf0f1',
    description: 'Base Difficulty',
    unlockedByDefault: true,
    scoreMultiplier: 1.0
  },
  {
    id: 'stake_red',
    name: 'Red Stake',
    icon: '🔴',
    color: '#e74c3c',
    description: 'Small Blind gives no reward money',
    unlockedByDefault: false,
    scoreMultiplier: 1.0,
    noSmallBlindReward: true
  },
  {
    id: 'stake_green',
    name: 'Green Stake',
    icon: '🟢',
    color: '#2ecc71',
    description: 'Required score scales faster for each Ante',
    unlockedByDefault: false,
    scoreMultiplier: 1.2
  },
  {
    id: 'stake_black',
    name: 'Black Stake',
    icon: '⚫',
    color: '#2c3e50',
    description: 'Shop can have Eternal Jokers (cannot be sold)',
    unlockedByDefault: false,
    scoreMultiplier: 1.2,
    hasEternalJokers: true
  },
  {
    id: 'stake_blue',
    name: 'Blue Stake',
    icon: '🔵',
    color: '#3498db',
    description: '-1 Discard per round',
    unlockedByDefault: false,
    scoreMultiplier: 1.2,
    discardPenalty: 1
  },
  {
    id: 'stake_purple',
    name: 'Purple Stake',
    icon: '🟣',
    color: '#9b59b6',
    description: 'Required score scales even faster',
    unlockedByDefault: false,
    scoreMultiplier: 1.45
  },
  {
    id: 'stake_orange',
    name: 'Orange Stake',
    icon: '🟠',
    color: '#e67e22',
    description: 'Booster Packs cost $1 more per Ante',
    unlockedByDefault: false,
    scoreMultiplier: 1.45,
    packCostScale: true
  },
  {
    id: 'stake_gold',
    name: 'Gold Stake',
    icon: '🟡',
    color: '#f1c40f',
    description: '-1 Hand size',
    unlockedByDefault: false,
    scoreMultiplier: 1.6,
    handSizePenalty: 1
  }
];
