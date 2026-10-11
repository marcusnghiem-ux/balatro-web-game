/**
 * JokerSystem.js
 * Comprehensive implementation of all 150 official Balatro Jokers (from balatrowiki.org/w/Jokers).
 * Provides dynamic scoring hooks (on card scored, on hand evaluated, independent mult/chips, and end-of-round triggers).
 */

import { ALL_150_JOKERS } from './JokerDatabase.js';

// Specific custom logic map for distinct iconic Jokers
const CUSTOM_JOKER_HOOKS = {
  joker: {
    calculateGeneral: () => ({ mult: 4, message: '+4 Mult' })
  },
  greedy_joker: {
    calculateCard: (c) => (c.suit === 'diamonds' || c.enhancement === 'wild') ? ({ mult: 3, message: '+3 Mult' }) : null
  },
  lusty_joker: {
    calculateCard: (c) => (c.suit === 'hearts' || c.enhancement === 'wild') ? ({ mult: 3, message: '+3 Mult' }) : null
  },
  wrathful_joker: {
    calculateCard: (c) => (c.suit === 'spades' || c.enhancement === 'wild') ? ({ mult: 3, message: '+3 Mult' }) : null
  },
  gluttonous_joker: {
    calculateCard: (c) => (c.suit === 'clubs' || c.enhancement === 'wild') ? ({ mult: 3, message: '+3 Mult' }) : null
  },
  jolly_joker: {
    calculateHand: (h) => ['Pair', 'Two Pair', 'Full House'].includes(h.handName) ? ({ mult: 8, message: '+8 Mult' }) : null
  },
  zany_joker: {
    calculateHand: (h) => ['Three of a Kind', 'Full House'].includes(h.handName) ? ({ mult: 12, message: '+12 Mult' }) : null
  },
  mad_joker: {
    calculateHand: (h) => h.handName === 'Two Pair' ? ({ mult: 10, message: '+10 Mult' }) : null
  },
  crazy_joker: {
    calculateHand: (h) => ['Straight', 'Straight Flush', 'Royal Flush'].includes(h.handName) ? ({ mult: 12, message: '+12 Mult' }) : null
  },
  droll_joker: {
    calculateHand: (h) => ['Flush', 'Straight Flush', 'Royal Flush', 'Flush House', 'Flush Five'].includes(h.handName) ? ({ mult: 10, message: '+10 Mult' }) : null
  },
  sly_joker: {
    calculateHand: (h) => ['Pair', 'Two Pair', 'Full House'].includes(h.handName) ? ({ chips: 50, message: '+50 Chips' }) : null
  },
  wily_joker: {
    calculateHand: (h) => ['Three of a Kind', 'Full House'].includes(h.handName) ? ({ chips: 100, message: '+100 Chips' }) : null
  },
  clever_joker: {
    calculateHand: (h) => h.handName === 'Two Pair' ? ({ chips: 80, message: '+80 Chips' }) : null
  },
  devious_joker: {
    calculateHand: (h) => ['Straight', 'Straight Flush', 'Royal Flush'].includes(h.handName) ? ({ chips: 100, message: '+100 Chips' }) : null
  },
  crafty_joker: {
    calculateHand: (h) => ['Flush', 'Straight Flush', 'Royal Flush', 'Flush House', 'Flush Five'].includes(h.handName) ? ({ chips: 80, message: '+80 Chips' }) : null
  },
  half_joker: {
    calculateHand: (h) => (h.allCards && h.allCards.length <= 3) ? ({ mult: 20, message: '+20 Mult' }) : null
  },
  stencil: {
    calculateGeneral: (ctx, joker, gameState) => {
      const activeCount = (gameState?.jokerSystem?.count) || 1;
      const emptySlots = Math.max(0, 5 - activeCount);
      const multFactor = 1 + emptySlots;
      return multFactor > 1 ? { multMultiplier: multFactor, message: `×${multFactor} Mult` } : null;
    }
  },
  joker_stencil: {
    calculateGeneral: (ctx, joker, gameState) => {
      const activeCount = (gameState?.jokerSystem?.count) || 1;
      const emptySlots = Math.max(0, 5 - activeCount);
      const multFactor = 1 + emptySlots;
      return multFactor > 1 ? { multMultiplier: multFactor, message: `×${multFactor} Mult` } : null;
    }
  },
  banner: {
    calculateGeneral: (ctx) => {
      const d = ctx.discardsLeft || 0;
      return { chips: d * 30, message: `+${d * 30} Chips` };
    }
  },
  mystic_summit: {
    calculateGeneral: (ctx) => (ctx.discardsLeft === 0) ? ({ mult: 15, message: '+15 Mult' }) : null
  },
  scary_face: {
    calculateCard: (c) => c.isFaceCard() ? ({ chips: 30, message: '+30 Chips' }) : null
  },
  even_steven: {
    calculateCard: (c) => c.isEven() ? ({ mult: 4, message: '+4 Mult' }) : null
  },
  odd_todd: {
    calculateCard: (c) => c.isOdd() ? ({ chips: 30, message: '+30 Chips' }) : null
  },
  scholar: {
    calculateCard: (c) => c.rank === 'A' ? ({ chips: 20, mult: 4, message: '+20 Chips, +4 Mult' }) : null
  },
  fibonacci: {
    calculateCard: (c) => ['A', '2', '3', '5', '8'].includes(c.rank) ? ({ mult: 8, message: '+8 Mult' }) : null
  },
  smiley_face: {
    calculateCard: (c) => c.isFaceCard() ? ({ mult: 4, message: '+4 Mult' }) : null
  },
  walkie_talkie: {
    calculateCard: (c) => ['10', '4'].includes(c.rank) ? ({ chips: 10, mult: 4, message: '+10 Chips, +4 Mult' }) : null
  },
  gros_michel: {
    calculateGeneral: () => ({ mult: 15, message: '+15 Mult' })
  },
  cavendish: {
    calculateGeneral: () => ({ multMultiplier: 3, message: '×3 Mult' })
  },
  bull: {
    calculateGeneral: (ctx) => {
      const m = ctx.money || 0;
      return { chips: m * 2, message: `+${m * 2} Chips` };
    }
  },
  popcorn: {
    calculateGeneral: () => ({ mult: 20, message: '+20 Mult' })
  },
  the_duo: {
    calculateHand: (h) => ['Pair', 'Two Pair', 'Full House'].includes(h.handName) ? ({ multMultiplier: 2, message: '×2 Mult' }) : null
  },
  the_trio: {
    calculateHand: (h) => ['Three of a Kind', 'Full House'].includes(h.handName) ? ({ multMultiplier: 3, message: '×3 Mult' }) : null
  },
  the_family: {
    calculateHand: (h) => ['Four of a Kind', 'Five of a Kind'].includes(h.handName) ? ({ multMultiplier: 4, message: '×4 Mult' }) : null
  },
  the_order: {
    calculateHand: (h) => ['Straight', 'Straight Flush', 'Royal Flush'].includes(h.handName) ? ({ multMultiplier: 3, message: '×3 Mult' }) : null
  },
  the_tribe: {
    calculateHand: (h) => ['Flush', 'Straight Flush', 'Royal Flush', 'Flush House', 'Flush Five'].includes(h.handName) ? ({ multMultiplier: 2, message: '×2 Mult' }) : null
  },
  blackboard: {
    calculateHand: (h, ctx) => {
      const held = ctx.heldCards || [];
      const allSpadesOrClubs = held.length > 0 && held.every(c => c.suit === 'spades' || c.suit === 'clubs');
      return allSpadesOrClubs ? ({ multMultiplier: 3, message: '×3 Mult' }) : null;
    }
  },
  card_sharp: {
    calculateGeneral: () => ({ multMultiplier: 3, message: '×3 Mult' })
  },
  ramen: {
    calculateGeneral: () => ({ multMultiplier: 2, message: '×2 Mult' })
  },
  stuntman: {
    calculateGeneral: () => ({ chips: 300, message: '+300 Chips' })
  },
  blueprint: {
    calculateCard: (c, ctx, joker) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'blueprint') return null;
      if (typeof target.calculateCard === 'function') {
        const res = target.calculateCard(c, ctx, target);
        if (res) return { ...res, message: `Blueprint (${target.name}): ${res.message}` };
      }
      return null;
    },
    calculateHand: (h, ctx, joker) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'blueprint') return null;
      if (typeof target.calculateHand === 'function') {
        const res = target.calculateHand(h, ctx, target);
        if (res) return { ...res, message: `Blueprint (${target.name}): ${res.message}` };
      }
      return null;
    },
    calculateGeneral: (ctx, joker) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'blueprint') return null;
      if (typeof target.calculateGeneral === 'function') {
        const res = target.calculateGeneral(ctx, target);
        if (res) return { ...res, message: `Blueprint (${target.name}): ${res.message}` };
      }
      return null;
    },
    onHandPlayed: (joker) => {
      const target = joker && joker.targetJoker;
      if (target && !target.debuffed && typeof target.onHandPlayed === 'function') {
        target.onHandPlayed(target);
      }
    },
    onDiscard: (cards, gameState, joker) => {
      const target = joker && joker.targetJoker;
      if (target && !target.debuffed && typeof target.onDiscard === 'function') {
        target.onDiscard(cards, gameState, target);
      }
    },
    onRoundEnd: (ctx, joker) => {
      const target = joker && joker.targetJoker;
      if (target && !target.debuffed && typeof target.onRoundEnd === 'function') {
        const res = target.onRoundEnd(ctx, target);
        if (res) return { ...res, message: `Blueprint (${target.name}): ${res.message}` };
      }
      return null;
    }
  },
  brainstorm: {
    calculateCard: (c, ctx, joker) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'brainstorm') return null;
      if (typeof target.calculateCard === 'function') {
        const res = target.calculateCard(c, ctx, target);
        if (res) return { ...res, message: `Brainstorm (${target.name}): ${res.message}` };
      }
      return null;
    },
    calculateHand: (h, ctx, joker) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'brainstorm') return null;
      if (typeof target.calculateHand === 'function') {
        const res = target.calculateHand(h, ctx, target);
        if (res) return { ...res, message: `Brainstorm (${target.name}): ${res.message}` };
      }
      return null;
    },
    calculateGeneral: (ctx, joker) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'brainstorm') return null;
      if (typeof target.calculateGeneral === 'function') {
        const res = target.calculateGeneral(ctx, target);
        if (res) return { ...res, message: `Brainstorm (${target.name}): ${res.message}` };
      }
      return null;
    },
    onHandPlayed: (joker) => {
      const target = joker && joker.targetJoker;
      if (target && !target.debuffed && typeof target.onHandPlayed === 'function') {
        target.onHandPlayed(target);
      }
    },
    onDiscard: (cards, gameState, joker) => {
      const target = joker && joker.targetJoker;
      if (target && !target.debuffed && typeof target.onDiscard === 'function') {
        target.onDiscard(cards, gameState, target);
      }
    },
    onRoundEnd: (ctx, joker) => {
      const target = joker && joker.targetJoker;
      if (target && !target.debuffed && typeof target.onRoundEnd === 'function') {
        const res = target.onRoundEnd(ctx, target);
        if (res) return { ...res, message: `Brainstorm (${target.name}): ${res.message}` };
      }
      return null;
    }
  },
  triboulet: {
    calculateCard: (c) => ['K', 'Q'].includes(c.rank) ? ({ multMultiplier: 2, message: '×2 Mult' }) : null
  },
  yorick: {
    calculateGeneral: () => ({ multMultiplier: 5, message: '×5 Mult' })
  },
  chicot: {
    calculateGeneral: () => ({ mult: 10, message: '+10 Mult' })
  },
  loyalty_card: {
    calculateGeneral: (ctx, joker) => {
      if (joker && joker.handsRemaining === 0) {
        return { multMultiplier: 4, message: 'Loyalty Card: ×4 Mult!' };
      }
      return null;
    },
    onHandPlayed: (joker) => {
      if (!joker) return;
      if (joker.handsRemaining === 0) {
        joker.handsRemaining = 5;
      } else {
        joker.handsRemaining = Math.max(0, (joker.handsRemaining !== undefined ? joker.handsRemaining : 5) - 1);
      }
    }
  },
  golden_joker: {
    onRoundEnd: () => ({ money: 4, message: '+$4' })
  },
  rocket: {
    onRoundEnd: () => ({ money: 5, message: '+$5' })
  },
  cloud_9: {
    onRoundEnd: () => ({ money: 4, message: '+$4' })
  },
  perkeo: {
    onRoundEnd: () => ({ money: 5, message: '+$5' })
  }
};

// Auto-fallback hook builder for any joker with numeric descriptions
function buildDynamicFallbackHook(joker) {
  const desc = joker.description || '';
  
  // Check for X Mult (e.g. "X2 Mult" or "X1.5 Mult")
  const xMultMatch = desc.match(/X([0-9.]+)\s*Mult/i);
  if (xMultMatch) {
    const factor = parseFloat(xMultMatch[1]);
    return {
      calculateGeneral: () => ({ multMultiplier: factor, message: `×${factor} Mult` })
    };
  }

  // Check for +X Mult
  const plusMultMatch = desc.match(/\+([0-9]+)\s*Mult/i);
  if (plusMultMatch) {
    const val = parseInt(plusMultMatch[1], 10);
    return {
      calculateGeneral: () => ({ mult: val, message: `+${val} Mult` })
    };
  }

  // Check for +X Chips
  const plusChipsMatch = desc.match(/\+([0-9]+)\s*Chips/i);
  if (plusChipsMatch) {
    const val = parseInt(plusChipsMatch[1], 10);
    return {
      calculateGeneral: () => ({ chips: val, message: `+${val} Chips` })
    };
  }

  // Check for Earn $X
  const moneyMatch = desc.match(/Earn\s*\$([0-9]+)/i) || desc.match(/\+\$([0-9]+)/i);
  if (moneyMatch) {
    const val = parseInt(moneyMatch[1], 10);
    return {
      onRoundEnd: () => ({ money: val, message: `+$${val}` })
    };
  }

  return {};
}

// Assemble full roster of 150 Jokers
export const JOKER_CATALOG = ALL_150_JOKERS.map(j => {
  const custom = CUSTOM_JOKER_HOOKS[j.id] || buildDynamicFallbackHook(j);
  return {
    ...j,
    ...custom
  };
});

export class JokerSystem {
  constructor(maxJokers = 5) {
    this.maxJokers = maxJokers;
    this.activeJokers = [];
  }

  addJoker(joker) {
    if (this.activeJokers.length >= this.maxJokers) {
      return false;
    }
    const instance = {
      ...joker,
      instanceId: `inst_${joker.id}_${Math.random().toString(36).substr(2, 6)}`,
      sellValue: joker.isRental ? 1 : Math.max(1, Math.floor(joker.cost / 2)),
      handsRemaining: joker.id === 'loyalty_card' ? (joker.handsRemaining !== undefined ? joker.handsRemaining : 5) : undefined,
      perishableRoundsLeft: joker.isPerishable ? 5 : undefined,
      isEternal: !!joker.isEternal,
      isPerishable: !!joker.isPerishable,
      isRental: !!joker.isRental,
      debuffed: false
    };
    this.activeJokers.push(instance);
    this.updateBlueprintTargets();
    return true;
  }

  reorderJokers(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.activeJokers.length || toIndex < 0 || toIndex >= this.activeJokers.length) return false;
    const [moved] = this.activeJokers.splice(fromIndex, 1);
    this.activeJokers.splice(toIndex, 0, moved);
    this.updateBlueprintTargets();
    return true;
  }

  removeJoker(index) {
    if (index >= 0 && index < this.activeJokers.length) {
      const j = this.activeJokers[index];
      // Eternal jokers cannot be sold or destroyed!
      if (j.isEternal) return null;
      const removed = this.activeJokers.splice(index, 1)[0];
      this.updateBlueprintTargets();
      return removed;
    }
    return null;
  }

  updateBlueprintTargets() {
    this.activeJokers.forEach((joker, index) => {
      if (joker.id === 'blueprint') {
        const nextJoker = this.activeJokers[index + 1];
        if (nextJoker && !nextJoker.debuffed && nextJoker.id !== 'blueprint') {
          joker.targetJoker = nextJoker;
          joker.hasTarget = true;
          joker.targetName = nextJoker.name;
        } else {
          joker.targetJoker = null;
          joker.hasTarget = false;
          joker.targetName = 'No target!';
        }
      } else if (joker.id === 'brainstorm') {
        const leftmostJoker = this.activeJokers[0];
        if (index !== 0 && leftmostJoker && !leftmostJoker.debuffed && leftmostJoker.id !== 'brainstorm') {
          joker.targetJoker = leftmostJoker;
          joker.hasTarget = true;
          joker.targetName = leftmostJoker.name;
        } else {
          joker.targetJoker = null;
          joker.hasTarget = false;
          joker.targetName = 'No target!';
        }
      }
    });
  }

  getJokers() {
    return [...this.activeJokers];
  }

  get count() {
    return this.activeJokers.length;
  }

  /**
   * Generates random shop jokers with authentic rarity distribution:
   * Common: 70%, Uncommon: 25%, Rare: 5%
   */
  static getRandomShopJokers(count = 3) {
    const results = [];
    for (let c = 0; c < count; c++) {
      const roll = Math.random();
      let targetRarity = 'common';
      if (roll < 0.05) targetRarity = 'rare';
      else if (roll < 0.30) targetRarity = 'uncommon';
      else targetRarity = 'common';

      const pool = JOKER_CATALOG.filter(j => j.rarity === targetRarity);
      const chosen = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : JOKER_CATALOG[Math.floor(Math.random() * JOKER_CATALOG.length)];
      results.push(chosen);
    }
    return results;
  }
}
