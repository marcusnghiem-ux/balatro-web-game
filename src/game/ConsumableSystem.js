/**
 * ConsumableSystem.js
 * Comprehensive implementation of Tarot and Planet cards,
 * consumable slot management (default: 2), and immediate active execution logic.
 */

import { ENHANCEMENTS, EDITIONS, RANKS } from './Card.js';

export const CONSUMABLE_TYPES = {
  TAROT: 'Tarot',
  PLANET: 'Planet',
  SPECTRAL: 'Spectral'
};

export const TAROT_CARDS = [
  {
    id: 'tarot_hermit',
    name: 'The Hermit',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🧙‍♂️',
    description: 'Doubles money (Max +$20)',
    canUse: (gameState) => true,
    execute: (gameState) => {
      const gain = Math.min(20, Math.max(0, gameState.money));
      gameState.money += gain;
      return { success: true, message: `The Hermit: +$${gain} gained!` };
    }
  },
  {
    id: 'tarot_sun',
    name: 'The Sun',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '☀️',
    description: 'Converts up to 3 selected cards to Hearts',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 3;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected.forEach(c => { c.suit = 'hearts'; });
      return { success: true, message: `Converted ${selected.length} cards to Hearts!` };
    }
  },
  {
    id: 'tarot_moon',
    name: 'The Moon',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🌙',
    description: 'Converts up to 3 selected cards to Clubs',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 3;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected.forEach(c => { c.suit = 'clubs'; });
      return { success: true, message: `Converted ${selected.length} cards to Clubs!` };
    }
  },
  {
    id: 'tarot_star',
    name: 'The Star',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '⭐',
    description: 'Converts up to 3 selected cards to Diamonds',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 3;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected.forEach(c => { c.suit = 'diamonds'; });
      return { success: true, message: `Converted ${selected.length} cards to Diamonds!` };
    }
  },
  {
    id: 'tarot_world',
    name: 'The World',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🌍',
    description: 'Converts up to 3 selected cards to Spades',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 3;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected.forEach(c => { c.suit = 'spades'; });
      return { success: true, message: `Converted ${selected.length} cards to Spades!` };
    }
  },
  {
    id: 'tarot_strength',
    name: 'Strength',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🦁',
    description: 'Increases rank of up to 2 selected cards by 1',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 2;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected.forEach(card => {
        const curIdx = RANKS.indexOf(card.rank);
        if (curIdx !== -1 && curIdx < RANKS.length - 1) {
          card.rank = RANKS[curIdx + 1];
          card.order = card.order + 1;
        }
      });
      return { success: true, message: `Strength: Upgraded ${selected.length} cards!` };
    }
  },
  {
    id: 'tarot_empress',
    name: 'The Empress',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '👑',
    description: 'Enhances up to 2 selected cards to Mult cards (+4 Mult)',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 2;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected.forEach(c => { c.enhancement = ENHANCEMENTS.MULT; });
      return { success: true, message: `The Empress: Enhanced ${selected.length} cards to Mult!` };
    }
  },
  {
    id: 'tarot_hierophant',
    name: 'The Hierophant',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '📜',
    description: 'Enhances up to 2 selected cards to Bonus cards (+30 Chips)',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 2;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected.forEach(c => { c.enhancement = ENHANCEMENTS.BONUS; });
      return { success: true, message: `The Hierophant: Enhanced ${selected.length} cards to Bonus Chips!` };
    }
  },
  {
    id: 'tarot_chariot',
    name: 'The Chariot',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🛡️',
    description: 'Enhances 1 selected card into a Steel card (×1.5 Mult in hand)',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length === 1;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected[0].enhancement = ENHANCEMENTS.STEEL;
      return { success: true, message: `The Chariot: Card enhanced to Steel!` };
    }
  },
  {
    id: 'tarot_lovers',
    name: 'The Lovers',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '❤️',
    description: 'Enhances 1 selected card into a Wild card',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length === 1;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected[0].enhancement = ENHANCEMENTS.WILD;
      return { success: true, message: `The Lovers: Card enhanced to Wild!` };
    }
  },
  {
    id: 'tarot_justice',
    name: 'Justice',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '⚖️',
    description: 'Enhances 1 selected card into a Glass card (×2 Mult)',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length === 1;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected[0].enhancement = ENHANCEMENTS.GLASS;
      return { success: true, message: `Justice: Card mutated into Glass Card (×2 Mult)!` };
    }
  },
  {
    id: 'tarot_tower',
    name: 'The Tower',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🗼',
    description: 'Enhances 1 selected card into a Stone card (+50 Chips, no rank/suit)',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length === 1;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected[0].enhancement = ENHANCEMENTS.STONE;
      return { success: true, message: `The Tower: Card mutated into Stone Card (+50 Chips)!` };
    }
  },
  {
    id: 'tarot_devil',
    name: 'The Devil',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '😈',
    description: 'Enhances 1 selected card into a Gold card (+$3 if held at end of round)',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length === 1;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected[0].enhancement = ENHANCEMENTS.GOLD;
      return { success: true, message: `The Devil: Card mutated into Gold Card (+$3 Cash)!` };
    }
  },
  {
    id: 'tarot_magician',
    name: 'The Magician',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🪄',
    description: 'Enhances up to 2 selected cards into Lucky cards',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 2;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      selected.forEach(c => { c.enhancement = ENHANCEMENTS.LUCKY; });
      return { success: true, message: `The Magician: Mutated ${selected.length} card(s) into Lucky Cards!` };
    }
  },
  {
    id: 'tarot_death',
    name: 'Death',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '💀',
    description: 'Select 2 cards: converts the left card into a copy of the right card',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length === 2;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      const target = selected[0];
      const source = selected[1];
      target.rank = source.rank;
      target.suit = source.suit;
      target.order = source.order;
      target.baseChips = source.baseChips;
      target.enhancement = source.enhancement;
      target.edition = source.edition;
      return { success: true, message: `Death: Converted left card into copy of right card!` };
    }
  },
  {
    id: 'tarot_hanged_man',
    name: 'The Hanged Man',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🪢',
    description: 'Destroys up to 2 selected cards permanently from your deck',
    canUse: (gameState) => {
      const selected = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return selected.length >= 1 && selected.length <= 2;
    },
    execute: (gameState) => {
      const selected = gameState.getSelectedCards();
      const idsToRemove = selected.map(c => c.id);
      gameState.hand = gameState.hand.filter(c => !idsToRemove.includes(c.id));
      gameState.deck = gameState.deck.filter(c => !idsToRemove.includes(c.id));
      gameState.discardPile = gameState.discardPile.filter(c => !idsToRemove.includes(c.id));
      return { success: true, message: `The Hanged Man: Destroyed ${selected.length} card(s) from deck!` };
    }
  },
  {
    id: 'tarot_wheel_of_fortune',
    name: 'Wheel of Fortune',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🎡',
    description: '1 in 4 chance to add Foil, Holographic, or Polychrome to a random Joker',
    canUse: (gameState) => gameState.jokerSystem.count > 0,
    execute: (gameState) => {
      const jokers = gameState.jokerSystem.getJokers().filter(j => !j.edition || j.edition === 'normal');
      if (jokers.length === 0) return { success: false, message: 'All Jokers already have editions!' };
      const roll = Math.random();
      if (roll < 0.25) {
        const editions = [EDITIONS.FOIL, EDITIONS.HOLO, EDITIONS.POLYCHROME];
        const chosenEd = editions[Math.floor(Math.random() * editions.length)];
        const target = jokers[Math.floor(Math.random() * jokers.length)];
        target.edition = chosenEd;
        return { success: true, message: `Wheel of Fortune: Succeeded! Added ${chosenEd.toUpperCase()} to ${target.name}!` };
      } else {
        return { success: true, message: 'Wheel of Fortune: Nope! (Did not trigger)' };
      }
    }
  },
  {
    id: 'tarot_temperance',
    name: 'Temperance',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🏺',
    description: 'Gives the total sell value of all current Jokers (Max $50)',
    canUse: () => true,
    execute: (gameState) => {
      const totalSell = gameState.jokerSystem.getJokers().reduce((acc, j) => acc + (j.sellValue || 1), 0);
      const gain = Math.min(50, totalSell);
      gameState.money += gain;
      return { success: true, message: `Temperance: +$${gain} gained from Joker sell values!` };
    }
  },
  {
    id: 'tarot_judgement',
    name: 'Judgement',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '⚖️',
    description: 'Spawns a random Joker card (Must have room)',
    canUse: (gameState) => gameState.jokerSystem.count < gameState.jokerSystem.maxJokers,
    execute: (gameState) => {
      const newJoker = gameState.shopEngine.getRandomJoker();
      gameState.jokerSystem.addJoker(newJoker);
      return { success: true, message: `Judgement: Created ${newJoker.name}!` };
    }
  }
];

export const PLANET_CARDS = [
  { id: 'planet_mercury', name: 'Mercury', hand: 'Pair', cost: 3, sellValue: 1, icon: '☿️', description: 'Levels up Pair (+15 Chips, +1 Mult)' },
  { id: 'planet_uranus', name: 'Uranus', hand: 'Two Pair', cost: 3, sellValue: 1, icon: '♅', description: 'Levels up Two Pair (+20 Chips, +1 Mult)' },
  { id: 'planet_venus', name: 'Venus', hand: 'Three of a Kind', cost: 3, sellValue: 1, icon: '♀️', description: 'Levels up Three of a Kind (+20 Chips, +2 Mult)' },
  { id: 'planet_earth', name: 'Earth', hand: 'Full House', cost: 3, sellValue: 1, icon: '🌍', description: 'Levels up Full House (+25 Chips, +2 Mult)' },
  { id: 'planet_mars', name: 'Mars', hand: 'Four of a Kind', cost: 3, sellValue: 1, icon: '♂️', description: 'Levels up Four of a Kind (+30 Chips, +3 Mult)' },
  { id: 'planet_jupiter', name: 'Jupiter', hand: 'Flush', cost: 3, sellValue: 1, icon: '♃', description: 'Levels up Flush (+15 Chips, +2 Mult)' },
  { id: 'planet_saturn', name: 'Saturn', hand: 'Straight', cost: 3, sellValue: 1, icon: '🪐', description: 'Levels up Straight (+30 Chips, +2 Mult)' },
  { id: 'planet_neptune', name: 'Neptune', hand: 'Straight Flush', cost: 3, sellValue: 1, icon: '♆', description: 'Levels up Straight Flush (+40 Chips, +3 Mult)' },
  { id: 'planet_pluto', name: 'Pluto', hand: 'High Card', cost: 3, sellValue: 1, icon: '♇', description: 'Levels up High Card (+10 Chips, +1 Mult)' },
  { id: 'planet_planet_x', name: 'Planet X', hand: 'Five of a Kind', cost: 3, sellValue: 1, icon: '🌌', description: 'Levels up Five of a Kind (+35 Chips, +3 Mult)' },
  { id: 'planet_ceres', name: 'Ceres', hand: 'Flush House', cost: 3, sellValue: 1, icon: '🌾', description: 'Levels up Flush House (+40 Chips, +3 Mult)' },
  { id: 'planet_eris', name: 'Eris', hand: 'Flush Five', cost: 3, sellValue: 1, icon: '🔴', description: 'Levels up Flush Five (+40 Chips, +3 Mult)' }
].map(p => ({
  ...p,
  type: CONSUMABLE_TYPES.PLANET,
  canUse: () => true,
  execute: (gameState) => {
    gameState.handLevels[p.hand] = (gameState.handLevels[p.hand] || 1) + 1;
    return {
      success: true,
      message: `${p.name}: ${p.hand} leveled up to Lv. ${gameState.handLevels[p.hand]}!`
    };
  }
}));

export class ConsumableSystem {
  constructor(maxSlots = 2) {
    this.maxSlots = maxSlots;
    this.slots = [];
    this.lastUsed = null;
  }

  get count() {
    return this.slots.length;
  }

  addConsumable(item) {
    if (this.slots.length >= this.maxSlots) return false;
    const instance = {
      ...item,
      instanceId: `con_${item.id}_${Math.random().toString(36).substr(2, 6)}`
    };
    this.slots.push(instance);
    return true;
  }

  removeConsumable(index) {
    if (index >= 0 && index < this.slots.length) {
      return this.slots.splice(index, 1)[0];
    }
    return null;
  }

  useConsumable(index, gameState) {
    if (index < 0 || index >= this.slots.length) return { success: false, message: 'Invalid slot' };
    const item = this.slots[index];

    if (typeof item.canUse === 'function' && !item.canUse(gameState)) {
      return {
        success: false,
        message: item.type === CONSUMABLE_TYPES.TAROT ? 'Select the required cards in hand first!' : 'Cannot use right now'
      };
    }

    const result = item.execute(gameState);
    if (result && result.success) {
      this.lastUsed = item;
      this.slots.splice(index, 1);
    }
    return result;
  }

  getItems() {
    return [...this.slots];
  }
}
