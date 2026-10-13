/**
 * ConsumableSystem.js
 * Comprehensive implementation of Tarot and Planet cards,
 * consumable slot management (default: 2), and immediate active execution logic.
 */

import { Card, ENHANCEMENTS, EDITIONS, RANKS } from './Card.js';

export const CONSUMABLE_TYPES = {
  TAROT: 'Tarot',
  PLANET: 'Planet',
  SPECTRAL: 'Spectral'
};

/**
 * Helper to resolve target cards whether inside Blind or inside Shop
 */
function resolveTarotTargetCards(gameState, minCount = 1, maxCount = 2) {
  let selected = (gameState.hand || []).filter(c => c.selected);
  if (selected.length === 0 && gameState.deck) {
    selected = (gameState.deck || []).filter(c => c.selected);
  }
  if (selected.length >= minCount && selected.length <= maxCount) {
    return selected;
  }
  const pool = (gameState.hand && gameState.hand.length > 0) ? gameState.hand : (gameState.deck || []);
  return pool.slice(0, Math.min(maxCount, pool.length));
}

function canUseTarotOnCards(gameState, minCount = 1, maxCount = 2) {
  const pool = (gameState.hand && gameState.hand.length > 0) ? gameState.hand : (gameState.deck || []);
  return pool.length >= minCount;
}

export const TAROT_CARDS = [
  {
    id: 'tarot_hermit',
    name: 'The Hermit',
    type: CONSUMABLE_TYPES.TAROT,
    cost: 3,
    sellValue: 1,
    icon: '🧙‍♂️',
    description: 'Doubles money (Max +$20)',
    canUse: () => true,
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 3),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 3);
      targetCards.forEach(c => { c.suit = 'hearts'; });
      return { success: true, message: `Converted ${targetCards.length} card(s) to Hearts!` };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 3),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 3);
      targetCards.forEach(c => { c.suit = 'clubs'; });
      return { success: true, message: `Converted ${targetCards.length} card(s) to Clubs!` };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 3),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 3);
      targetCards.forEach(c => { c.suit = 'diamonds'; });
      return { success: true, message: `Converted ${targetCards.length} card(s) to Diamonds!` };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 3),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 3);
      targetCards.forEach(c => { c.suit = 'spades'; });
      return { success: true, message: `Converted ${targetCards.length} card(s) to Spades!` };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 2),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 2);
      targetCards.forEach(card => {
        const curIdx = RANKS.indexOf(card.rank);
        if (curIdx !== -1 && curIdx < RANKS.length - 1) {
          card.rank = RANKS[curIdx + 1];
          card.order = card.order + 1;
          // BUG FIX #4: Sync baseChips after rank change so scoring uses correct value.
          card.baseChips = Card.getRankChips(card.rank);
        }
      });
      return { success: true, message: `Strength: Upgraded ${targetCards.length} card(s)!` };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 2),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 2);
      targetCards.forEach(c => { c.enhancement = ENHANCEMENTS.MULT; });
      return { success: true, message: `The Empress: Enhanced ${targetCards.length} card(s) to Mult!` };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 2),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 2);
      targetCards.forEach(c => { c.enhancement = ENHANCEMENTS.BONUS; });
      return { success: true, message: `The Hierophant: Enhanced ${targetCards.length} card(s) to Bonus Chips!` };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 1),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 1);
      if (targetCards.length > 0) {
        targetCards[0].enhancement = ENHANCEMENTS.STEEL;
        return { success: true, message: `The Chariot: Enhanced card to Steel (×1.5 Mult)!` };
      }
      return { success: false, message: 'No card selected' };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 1),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 1);
      if (targetCards.length > 0) {
        targetCards[0].enhancement = ENHANCEMENTS.WILD;
        return { success: true, message: `The Lovers: Enhanced card to Wild!` };
      }
      return { success: false, message: 'No card selected' };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 1),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 1);
      if (targetCards.length > 0) {
        targetCards[0].enhancement = ENHANCEMENTS.GLASS;
        return { success: true, message: `Justice: Mutated card into Glass Card (×2 Mult)!` };
      }
      return { success: false, message: 'No card selected' };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 1),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 1);
      if (targetCards.length > 0) {
        targetCards[0].enhancement = ENHANCEMENTS.STONE;
        return { success: true, message: `The Tower: Mutated card into Stone Card (+50 Chips)!` };
      }
      return { success: false, message: 'No card selected' };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 1),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 1);
      if (targetCards.length > 0) {
        targetCards[0].enhancement = ENHANCEMENTS.GOLD;
        return { success: true, message: `The Devil: Mutated card into Gold Card (+$3 Cash)!` };
      }
      return { success: false, message: 'No card selected' };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 2),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 2);
      targetCards.forEach(c => { c.enhancement = ENHANCEMENTS.LUCKY; });
      return { success: true, message: `The Magician: Mutated ${targetCards.length} card(s) into Lucky Cards!` };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 2, 2),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 2, 2);
      if (targetCards.length >= 2) {
        const target = targetCards[0];
        const source = targetCards[1];
        target.rank = source.rank;
        target.suit = source.suit;
        target.order = source.order;
        target.baseChips = source.baseChips;
        target.enhancement = source.enhancement;
        target.edition = source.edition;
        return { success: true, message: `Death: Converted card into copy of adjacent card!` };
      }
      return { success: false, message: 'Select 2 cards for Death!' };
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
    canUse: (gameState) => canUseTarotOnCards(gameState, 1, 2),
    execute: (gameState) => {
      const targetCards = resolveTarotTargetCards(gameState, 1, 2);
      const idsToRemove = targetCards.map(c => c.id);
      gameState.hand = (gameState.hand || []).filter(c => !idsToRemove.includes(c.id));
      gameState.deck = (gameState.deck || []).filter(c => !idsToRemove.includes(c.id));
      gameState.discardPile = (gameState.discardPile || []).filter(c => !idsToRemove.includes(c.id));
      return { success: true, message: `The Hanged Man: Destroyed ${targetCards.length} card(s) from deck!` };
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
    // BUG FIX #6: Guard to SHOP state only. Calling shopEngine.getRandomJoker() mid-round
    // accidentally consumes Edition Skip Tags (POLY/HOLO/FOIL) set for the next shop.
    canUse: (gameState) => {
      const inShop = gameState.state === 'SHOP';
      return inShop && gameState.jokerSystem.count < gameState.jokerSystem.maxJokers;
    },
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
    if (gameState.handLevelManager) {
      gameState.handLevelManager.upgradeHand(p.hand, 1);
    } else {
      gameState.handLevels[p.hand] = (gameState.handLevels[p.hand] || 1) + 1;
    }
    // Constellation synergy: increment Constellation jokers
    if (gameState.jokerSystem) {
      for (const j of gameState.jokerSystem.getJokers()) {
        if (j.id === 'constellation') {
          j.currentMultMultiplier = (j.currentMultMultiplier !== undefined ? j.currentMultMultiplier : 1) + 0.1;
        }
      }
    }
    return {
      success: true,
      message: `${p.name}: ${p.hand} leveled up to Lv. ${gameState.handLevels[p.hand]}!`
    };
  }
}));

export const SPECTRAL_CARDS = [
  {
    id: 'spectral_familiar',
    name: 'Familiar',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '🦉',
    description: 'Destroy 1 random card in hand, add 3 random Enhanced face cards',
    canUse: (gameState) => gameState.hand && gameState.hand.length >= 1,
    execute: (gameState) => {
      if (gameState.hand.length > 0) {
        const removed = gameState.hand.splice(Math.floor(Math.random() * gameState.hand.length), 1)[0];
        const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
        const faceRanks = ['J', 'Q', 'K'];
        const enhs = ['bonus', 'mult', 'wild', 'glass', 'steel', 'gold', 'lucky'];
        for (let i = 0; i < 3; i++) {
          const s = suits[Math.floor(Math.random() * 4)];
          const r = faceRanks[Math.floor(Math.random() * 3)];
          const e = enhs[Math.floor(Math.random() * enhs.length)];
          const card = new Card(s, r, { enhancement: e });
          gameState.hand.push(card);
        }
        return { success: true, message: `Familiar: Destroyed ${removed.rank}${removed.getSuitSymbol()} and drew 3 face cards!` };
      }
      return { success: false, message: 'No cards in hand' };
    }
  },
  {
    id: 'spectral_grim',
    name: 'Grim',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '💀',
    description: 'Destroy 1 random card in hand, add 2 random Enhanced Aces',
    canUse: (gameState) => gameState.hand && gameState.hand.length >= 1,
    execute: (gameState) => {
      if (gameState.hand.length > 0) {
        const removed = gameState.hand.splice(Math.floor(Math.random() * gameState.hand.length), 1)[0];
        const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
        const enhs = ['bonus', 'mult', 'wild', 'glass', 'steel', 'gold', 'lucky'];
        for (let i = 0; i < 2; i++) {
          const s = suits[Math.floor(Math.random() * 4)];
          const e = enhs[Math.floor(Math.random() * enhs.length)];
          const card = new Card(s, 'A', { enhancement: e });
          gameState.hand.push(card);
        }
        return { success: true, message: `Grim: Destroyed ${removed.rank}${removed.getSuitSymbol()} and added 2 Enhanced Aces!` };
      }
      return { success: false, message: 'No cards in hand' };
    }
  },
  {
    id: 'spectral_aura',
    name: 'Aura',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '✨',
    description: 'Add Foil, Holographic, or Polychrome effect to 1 selected card',
    canUse: (gameState) => {
      const sel = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return sel.length === 1;
    },
    execute: (gameState) => {
      const sel = gameState.getSelectedCards()[0];
      const eds = [EDITIONS.FOIL, EDITIONS.HOLO, EDITIONS.POLYCHROME];
      sel.edition = eds[Math.floor(Math.random() * eds.length)];
      return { success: true, message: `Aura: Added ${sel.edition.toUpperCase()} to ${sel.rank}${sel.getSuitSymbol()}!` };
    }
  },
  {
    id: 'spectral_wraith',
    name: 'Wraith',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '👻',
    description: 'Creates a random Rare or Legendary Joker, sets money to $0',
    canUse: (gameState) => gameState.jokerSystem.count < gameState.jokerSystem.maxJokers,
    execute: (gameState) => {
      const pool = gameState.shopEngine.getRandomJoker();
      gameState.jokerSystem.addJoker(pool);
      gameState.money = 0;
      return { success: true, message: `Wraith: Summoned ${pool.name} and set money to $0!` };
    }
  },
  {
    id: 'spectral_sigil',
    name: 'Sigil',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '🔮',
    description: 'Converts all cards in hand to a single random suit',
    canUse: (gameState) => gameState.hand && gameState.hand.length > 0,
    execute: (gameState) => {
      const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
      const chosenSuit = suits[Math.floor(Math.random() * 4)];
      gameState.hand.forEach(c => { c.suit = chosenSuit; });
      return { success: true, message: `Sigil: Transmuted all hand cards to ${chosenSuit.toUpperCase()}!` };
    }
  },
  {
    id: 'spectral_ouija',
    name: 'Ouija',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '👁️',
    description: 'Converts all cards in hand to a single random rank, -1 hand size',
    canUse: (gameState) => gameState.hand && gameState.hand.length > 0,
    execute: (gameState) => {
      const chosenRank = RANKS[Math.floor(Math.random() * RANKS.length)];
      const newOrder = Card.getRankOrder(chosenRank);
      const newChips = Card.getRankChips(chosenRank);
      // BUG FIX #5: Sync order and baseChips after mass rank mutation.
      // Previously only rank was set — HandEvaluator sort (by .order) and scoring (.baseChips) were wrong.
      gameState.hand.forEach(c => {
        c.rank = chosenRank;
        c.order = newOrder;
        c.baseChips = newChips;
      });
      gameState.maxHandSize = Math.max(4, gameState.maxHandSize - 1);
      return { success: true, message: `Ouija: Transmuted all hand cards to rank ${chosenRank}! (-1 Hand Size)` };
    }
  },
  {
    id: 'spectral_immolate',
    name: 'Immolate',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '🔥',
    description: 'Destroys 5 random cards in hand, gain +$20',
    canUse: (gameState) => gameState.hand && gameState.hand.length >= 5,
    execute: (gameState) => {
      for (let i = 0; i < 5; i++) {
        if (gameState.hand.length > 0) {
          gameState.hand.splice(Math.floor(Math.random() * gameState.hand.length), 1);
        }
      }
      gameState.money += 20;
      return { success: true, message: 'Immolate: Destroyed 5 cards and gained +$20!' };
    }
  },
  {
    id: 'spectral_black_hole',
    name: 'Black Hole',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '🕳️',
    description: 'Upgrades EVERY poker hand by 1 level',
    canUse: () => true,
    execute: (gameState) => {
      for (const handName of Object.keys(gameState.handLevels)) {
        gameState.handLevels[handName] = (gameState.handLevels[handName] || 1) + 1;
      }
      return { success: true, message: 'Black Hole: Upgraded ALL poker hands by +1 Level!' };
    }
  },
  {
    id: 'spectral_cryptid',
    name: 'Cryptid',
    type: CONSUMABLE_TYPES.SPECTRAL,
    cost: 4,
    sellValue: 2,
    icon: '🦕',
    description: 'Create 2 copies of 1 selected card in hand',
    canUse: (gameState) => {
      const sel = gameState.getSelectedCards ? gameState.getSelectedCards() : [];
      return sel.length === 1;
    },
    execute: (gameState) => {
      const sel = gameState.getSelectedCards()[0];
      for (let i = 0; i < 2; i++) {
        const copy = new Card(sel.suit, sel.rank, { enhancement: sel.enhancement, edition: sel.edition });
        gameState.hand.push(copy);
      }
      return { success: true, message: `Cryptid: Created 2 copies of ${sel.rank}${sel.getSuitSymbol()}!` };
    }
  }
];

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

  reorderConsumables(fromIndex, toIndex) {
    if (
      fromIndex < 0 || fromIndex >= this.slots.length ||
      toIndex < 0 || toIndex >= this.slots.length ||
      fromIndex === toIndex
    ) {
      return false;
    }
    const [moved] = this.slots.splice(fromIndex, 1);
    this.slots.splice(toIndex, 0, moved);
    return true;
  }

  getItems() {
    return [...this.slots];
  }
}
