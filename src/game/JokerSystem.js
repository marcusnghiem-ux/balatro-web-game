/**
 * JokerSystem.js
 * Comprehensive implementation of all 150 official Balatro Jokers (from balatrowiki.org/w/Jokers).
 * Provides dynamic scoring hooks (on card scored, on hand evaluated, independent mult/chips, and end-of-round triggers).
 */

import { ALL_150_JOKERS } from './JokerDatabase.js';
import { ScoreCalculator } from './ScoreCalculator.js';

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
  // BUG FIX #18: Removed duplicate 'stencil' key — 'joker_stencil' is the canonical ID
  // matching JokerDatabase.js. In JS object literals the last duplicate key wins silently,
  // so the earlier 'stencil' entry was dead code and could mask the wrong ID at runtime.
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
    calculateGeneral: () => ({ mult: 15, message: '+15 Mult' }),
    onRoundEnd: (ctx, joker, gameState) => {
      if (Math.random() < (1 / 6)) {
        return { destroy: true, message: 'Gros Michel: Extinct!', extinct: 'gros_michel' };
      }
      return null;
    }
  },
  cavendish: {
    calculateGeneral: () => ({ multMultiplier: 3, message: '×3 Mult' }),
    onRoundEnd: (ctx, joker) => {
      if (Math.random() < 0.001) {
        return { destroy: true, message: 'Cavendish: Extinct!' };
      }
      return null;
    }
  },
  ice_cream: {
    calculateGeneral: (ctx, joker) => {
      const ch = joker.currentChips !== undefined ? joker.currentChips : 100;
      return { chips: ch, message: `+${ch} Chips` };
    },
    onHandPlayed: (joker) => {
      joker.currentChips = (joker.currentChips !== undefined ? joker.currentChips : 100) - 5;
      if (joker.currentChips <= 0) {
        return { destroy: true, message: 'Ice Cream: Melted away!' };
      }
      return null;
    }
  },
  bull: {
    calculateGeneral: (ctx) => {
      const m = ctx.money || 0;
      return { chips: m * 2, message: `+${m * 2} Chips` };
    }
  },
  popcorn: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMult !== undefined ? joker.currentMult : 20;
      return { mult: m, message: `+${m} Mult` };
    },
    onRoundEnd: (ctx, joker) => {
      joker.currentMult = (joker.currentMult !== undefined ? joker.currentMult : 20) - 4;
      if (joker.currentMult <= 0) {
        return { destroy: true, message: 'Popcorn: All popped!' };
      }
      return { message: `Popcorn: -4 Mult (${joker.currentMult} left)` };
    }
  },
  seltzer: {
    calculateGeneral: () => ({ message: 'Seltzer: Retriggering cards' }),
    onHandPlayed: (joker) => {
      joker.handsRemaining = (joker.handsRemaining !== undefined ? joker.handsRemaining : 10) - 1;
      if (joker.handsRemaining <= 0) {
        return { destroy: true, message: 'Seltzer: Lost fizz!' };
      }
      return null;
    }
  },
  turtle_bean: {
    onRoundEnd: (ctx, joker) => {
      joker.handSizeBonus = (joker.handSizeBonus !== undefined ? joker.handSizeBonus : 5) - 1;
      if (joker.handSizeBonus <= 0) {
        return { destroy: true, message: 'Turtle Bean: Depleted!' };
      }
      return null;
    }
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
    calculateHand: (evalResult, ctx) => {
      const handsPlayed = ctx.handsPlayedThisRound || [];
      if (handsPlayed.includes(evalResult.handName)) {
        return { multMultiplier: 3, message: 'Card Sharp: ×3 Mult' };
      }
      return null;
    }
  },
  baseball_card: {
    calculateGeneral: (ctx, joker, activeJokers) => {
      const list = activeJokers || joker.parentSystem?.activeJokers || [];
      const uncommonCount = list.filter(j => j !== joker && j.rarity === 'uncommon' && !j.debuffed).length;
      if (uncommonCount === 0) return null;
      const mult = Math.pow(1.5, uncommonCount);
      return {
        multMultiplier: mult,
        message: `Baseball Card: ×${mult.toFixed(2)} Mult (${uncommonCount} Uncommon)`
      };
    }
  },
  abstract_joker: {
    calculateGeneral: (ctx, joker, activeJokers) => {
      const list = activeJokers || joker.parentSystem?.activeJokers || [];
      const activeCount = list.filter(j => !j.debuffed).length;
      const m = activeCount * 3;
      return m > 0 ? { mult: m, message: `Abstract Joker: +${m} Mult` } : null;
    }
  },
  baron: {
    calculateGeneral: (ctx) => {
      const held = ctx.heldCards || [];
      const kings = held.filter(c => c.rank === 'K' && !c.debuffed).length;
      if (kings === 0) return null;
      const factor = Math.pow(1.5, kings);
      return { multMultiplier: factor, message: `Baron: ×${factor.toFixed(2)} Mult (${kings} King${kings > 1 ? 's' : ''})` };
    }
  },
  shoot_the_moon: {
    calculateGeneral: (ctx) => {
      const held = ctx.heldCards || [];
      const queens = held.filter(c => c.rank === 'Q' && !c.debuffed).length;
      if (queens === 0) return null;
      return { mult: queens * 13, message: `Shoot the Moon: +${queens * 13} Mult (${queens} Queen${queens > 1 ? 's' : ''})` };
    }
  },
  acrobat: {
    calculateGeneral: (ctx) => {
      if (ctx.handsLeft === 1) {
        return { multMultiplier: 3, message: 'Acrobat: ×3 Mult' };
      }
      return null;
    }
  },
  swashbuckler: {
    calculateGeneral: (ctx, joker, activeJokers) => {
      const list = activeJokers || joker.parentSystem?.activeJokers || [];
      let total = 0;
      for (const j of list) {
        if (j !== joker && !j.debuffed) total += (j.sellValue || 1);
      }
      return total > 0 ? { mult: total, message: `Swashbuckler: +${total} Mult` } : null;
    }
  },
  constellation: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 1;
      return m > 1 ? { multMultiplier: m, message: `Constellation: ×${m.toFixed(1)} Mult` } : null;
    }
  },
  hologram: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 1;
      return m > 1 ? { multMultiplier: m, message: `Hologram: ×${m.toFixed(2)} Mult` } : null;
    }
  },
  campfire: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 1;
      return m > 1 ? { multMultiplier: m, message: `Campfire: ×${m.toFixed(2)} Mult` } : null;
    }
  },
  obelisk: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 1;
      return m > 1 ? { multMultiplier: m, message: `Obelisk: ×${m.toFixed(1)} Mult` } : null;
    }
  },
  hit_the_road: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 1;
      return m > 1 ? { multMultiplier: m, message: `Hit the Road: ×${m.toFixed(1)} Mult` } : null;
    }
  },
  throwback: {
    calculateGeneral: (ctx, joker, activeJokers, gameState) => {
      const skipped = (gameState && gameState.stats && gameState.stats.blindsSkipped) || ctx.blindsSkipped || 0;
      const factor = 1 + skipped * 0.25;
      return factor > 1 ? { multMultiplier: factor, message: `Throwback: ×${factor.toFixed(2)} Mult` } : null;
    }
  },
  flower_pot: {
    calculateHand: (evalResult) => {
      const suits = new Set(evalResult.scoringCards.map(c => c.enhancement === 'wild' ? 'all' : c.suit));
      const hasD = suits.has('diamonds') || suits.has('all');
      const hasC = suits.has('clubs') || suits.has('all');
      const hasH = suits.has('hearts') || suits.has('all');
      const hasS = suits.has('spades') || suits.has('all');
      if (hasD && hasC && hasH && hasS) {
        return { multMultiplier: 3, message: 'Flower Pot: ×3 Mult' };
      }
      return null;
    }
  },
  seeing_double: {
    calculateHand: (evalResult) => {
      const clubs = evalResult.scoringCards.some(c => c.suit === 'clubs' || c.enhancement === 'wild');
      const others = evalResult.scoringCards.some(c => c.suit !== 'clubs' || c.enhancement === 'wild');
      if (clubs && others) {
        return { multMultiplier: 2, message: 'Seeing Double: ×2 Mult' };
      }
      return null;
    }
  },
  lucky_cat: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 1;
      return m > 1 ? { multMultiplier: m, message: `Lucky Cat: ×${m.toFixed(2)} Mult` } : null;
    }
  },
  drivers_license: {
    calculateGeneral: (ctx, joker, activeJokers, gameState) => {
      const deck = (gameState && gameState.deck) || [];
      const hand = (gameState && gameState.hand) || [];
      const discard = (gameState && gameState.discardPile) || [];
      const allCards = [...deck, ...hand, ...discard];
      const enhancedCount = allCards.filter(c => c.enhancement && c.enhancement !== 'none').length;
      if (enhancedCount >= 16) {
        return { multMultiplier: 3, message: `Driver's License: ×3 Mult (${enhancedCount} Enhanced)` };
      }
      return null;
    }
  },
  steel_joker: {
    calculateGeneral: (ctx, joker, activeJokers, gameState) => {
      const deck = (gameState && gameState.deck) || [];
      const hand = (gameState && gameState.hand) || [];
      const discard = (gameState && gameState.discardPile) || [];
      const allCards = [...deck, ...hand, ...discard];
      const steelCount = allCards.filter(c => c.enhancement === 'steel').length;
      if (steelCount === 0) return null;
      const factor = 1 + steelCount * 0.2;
      return { multMultiplier: factor, message: `Steel Joker: ×${factor.toFixed(1)} Mult (${steelCount} Steel)` };
    }
  },
  stone_joker: {
    calculateGeneral: (ctx, joker, activeJokers, gameState) => {
      const deck = (gameState && gameState.deck) || [];
      const hand = (gameState && gameState.hand) || [];
      const discard = (gameState && gameState.discardPile) || [];
      const allCards = [...deck, ...hand, ...discard];
      const stoneCount = allCards.filter(c => c.enhancement === 'stone').length;
      if (stoneCount === 0) return null;
      const chips = stoneCount * 25;
      return { chips, message: `Stone Joker: +${chips} Chips (${stoneCount} Stone)` };
    }
  },
  glass_joker: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 1;
      return m > 1 ? { multMultiplier: m, message: `Glass Joker: ×${m.toFixed(2)} Mult` } : null;
    }
  },
  ramen: {
    calculateGeneral: (ctx, joker) => {
      const m = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 2;
      return { multMultiplier: m, message: `×${m.toFixed(2)} Mult` };
    },
    onDiscard: (cards, gameState, joker) => {
      const reduction = cards.length * 0.01;
      const cur = joker.currentMultMultiplier !== undefined ? joker.currentMultMultiplier : 2;
      joker.currentMultMultiplier = Math.max(1, cur - reduction);
    }
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
    calculateHand: (h, ctx, joker, activeJokers, gameState) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'blueprint') return null;
      if (typeof target.calculateHand === 'function') {
        const res = target.calculateHand(h, ctx, target, activeJokers, gameState);
        if (res) return { ...res, message: `Blueprint (${target.name}): ${res.message}` };
      }
      return null;
    },
    calculateGeneral: (ctx, joker, activeJokers, gameState) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'blueprint') return null;
      if (typeof target.calculateGeneral === 'function') {
        const res = target.calculateGeneral(ctx, target, activeJokers, gameState);
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
    calculateHand: (h, ctx, joker, activeJokers, gameState) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'brainstorm') return null;
      if (typeof target.calculateHand === 'function') {
        const res = target.calculateHand(h, ctx, target, activeJokers, gameState);
        if (res) return { ...res, message: `Brainstorm (${target.name}): ${res.message}` };
      }
      return null;
    },
    calculateGeneral: (ctx, joker, activeJokers, gameState) => {
      const target = joker && joker.targetJoker;
      if (!target || target.debuffed || target.id === 'brainstorm') return null;
      if (typeof target.calculateGeneral === 'function') {
        const res = target.calculateGeneral(ctx, target, activeJokers, gameState);
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
// Strictly rejects any conditional phrases to prevent phantom scoring bugs
function buildDynamicFallbackHook(joker) {
  const desc = joker.description || '';

  // Reject ANY conditional trigger phrases - these MUST NOT have automatic static fallback!
  const conditionalRegex = /(each|per|if|when|gains|held in hand|uncommon|empty|discarded|remaining|for every|sell value|consecutive|skipped|destroyed|enhanced|contains|odds|chance|scored|first|last|final)/i;
  if (conditionalRegex.test(desc)) {
    return {};
  }

  // Check for flat unconditional X Mult (e.g. "X2 Mult" with no conditions)
  const xMultMatch = desc.match(/^X([0-9.]+)\s*Mult\.?$/i);
  if (xMultMatch) {
    const factor = parseFloat(xMultMatch[1]);
    return {
      calculateGeneral: () => ({ multMultiplier: factor, message: `×${factor} Mult` })
    };
  }

  // Check for flat unconditional +X Mult
  const plusMultMatch = desc.match(/^\+([0-9]+)\s*Mult\.?$/i);
  if (plusMultMatch) {
    const val = parseInt(plusMultMatch[1], 10);
    return {
      calculateGeneral: () => ({ mult: val, message: `+${val} Mult` })
    };
  }

  // Check for flat unconditional +X Chips
  const plusChipsMatch = desc.match(/^\+([0-9]+)\s*Chips\.?$/i);
  if (plusChipsMatch) {
    const val = parseInt(plusChipsMatch[1], 10);
    return {
      calculateGeneral: () => ({ chips: val, message: `+${val} Chips` })
    };
  }

  // Check for flat Earn $X at end of round
  const moneyMatch = desc.match(/^(?:Earn|\+)\s*\$([0-9]+)(?:\s*at end of round)?\.?$/i);
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
  constructor(maxJokers = 5, game = null) {
    this.maxJokers = maxJokers;
    this.activeJokers = [];
    // BUG FIX #8: Store game reference so addJoker/removeJoker can mutate maxHandSize.
    this._game = game;
  }

  addJoker(joker) {
    if (this.activeJokers.length >= this.maxJokers) {
      return false;
    }
    const instance = {
      ...joker,
      instanceId: `inst_${joker.id}_${Math.random().toString(36).substr(2, 6)}`,
      sellValue: joker.isRental ? 1 : Math.max(1, Math.floor(joker.cost / 2)),
      handsRemaining: joker.id === 'loyalty_card' ? 5 : (joker.id === 'seltzer' ? 10 : undefined),
      currentMult: joker.id === 'popcorn' ? 20 : undefined,
      currentChips: joker.id === 'ice_cream' ? 100 : undefined,
      currentMultMultiplier: joker.id === 'ramen' ? 2 : (['constellation', 'hologram', 'campfire', 'obelisk', 'hit_the_road', 'lucky_cat', 'glass_joker'].includes(joker.id) ? 1 : undefined),
      handSizeBonus: joker.id === 'turtle_bean' ? 5 : undefined,
      perishableRoundsLeft: joker.isPerishable ? 5 : undefined,
      isEternal: !!joker.isEternal,
      isPerishable: !!joker.isPerishable,
      isRental: !!joker.isRental,
      debuffed: false,
      parentSystem: this
    };
    this.activeJokers.push(instance);
    this.updateBlueprintTargets();

    // BUG FIX #8: Turtle Bean must actually apply its hand-size bonus.
    // Previously the bonus was stored as metadata only and never written to maxHandSize.
    if (instance.id === 'turtle_bean' && instance.handSizeBonus) {
      const gs = instance.parentSystem && instance.parentSystem._game;
      if (gs && typeof gs.maxHandSize === 'number') {
        gs.maxHandSize += instance.handSizeBonus;
      }
    }

    return true;
  }

  /**
   * Evaluates end of round lifecycle degradation for all active Jokers:
   * - Gros Michel extinction check (1 in 6)
   * - Cavendish extinction check (1 in 1000)
   * - Popcorn Mult reduction (-4) and pop destruction
   * - Turtle bean hand size countdown
   * - Perishable sticker countdown (debuffs after 5 rounds)
   */
  triggerRoundEndDegradation(gameState) {
    const notifications = [];
    const indicesToRemove = [];

    this.activeJokers.forEach((joker, index) => {
      // Perishable: debuffs after 5 rounds
      if (joker.isPerishable && joker.perishableRoundsLeft !== undefined) {
        joker.perishableRoundsLeft--;
        if (joker.perishableRoundsLeft <= 0) {
          joker.debuffed = true;
          notifications.push({ joker, message: `${joker.name}: Perished!` });
        }
      }

      // Execute onRoundEnd hook
      if (typeof joker.onRoundEnd === 'function') {
        const res = joker.onRoundEnd({ money: gameState?.money || 0 }, joker, gameState);
        if (res) {
          if (res.destroy && !joker.isEternal) {
            indicesToRemove.push(index);
            if (res.extinct && gameState) {
              gameState.grosMichelExtinct = true;
            }
          }
          if (res.message) {
            notifications.push({ joker, message: res.message });
          }
        }
      }
    });

    // Remove destroyed jokers from highest index downward
    indicesToRemove.sort((a, b) => b - a).forEach(idx => {
      this.activeJokers.splice(idx, 1);
    });

    if (indicesToRemove.length > 0) {
      this.updateBlueprintTargets();
    }

    return notifications;
  }

  /**
   * Evaluates per-hand played degradation:
   * - Ice Cream losing chips (-5 chips per hand, melts at 0)
   * - Loyalty Card countdown (every 6th hand X4 Mult)
   * - Seltzer countdown (-1 hand, expires at 0)
   */
  triggerHandPlayedDegradation(gameState) {
    const notifications = [];
    const indicesToRemove = [];

    this.activeJokers.forEach((joker, index) => {
      if (typeof joker.onHandPlayed === 'function') {
        const res = joker.onHandPlayed(joker, gameState);
        if (res) {
          if (res.destroy && !joker.isEternal) {
            indicesToRemove.push(index);
          }
          if (res.message) {
            notifications.push({ joker, message: res.message });
          }
        }
      }
    });

    indicesToRemove.sort((a, b) => b - a).forEach(idx => {
      this.activeJokers.splice(idx, 1);
    });

    if (indicesToRemove.length > 0) {
      this.updateBlueprintTargets();
    }

    return notifications;
  }

  /**
   * Evaluates discard degradation (e.g. Ramen losing X0.01 per card discarded)
   */
  triggerDiscardDegradation(cards, gameState) {
    this.activeJokers.forEach(joker => {
      if (typeof joker.onDiscard === 'function') {
        joker.onDiscard(cards, gameState, joker);
      }
    });
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
      // BUG FIX #8: Revert Turtle Bean hand-size bonus when Joker is sold/destroyed.
      if (j.id === 'turtle_bean' && j.handSizeBonus && this._game) {
        this._game.maxHandSize = Math.max(4, this._game.maxHandSize - j.handSizeBonus);
      }
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
   * Strictly evaluates active Jokers from left to right (index 0 to n-1).
   * Sequential ordering strictly matters: +Mult applied before xMult scales differently than after.
   * Handles Blueprint (copies right) and Brainstorm (copies leftmost).
   *
   * @param {Object} evalResult - Evaluated hand from HandEvaluator
   * @param {number} startChips - Accumulated chips before Joker processing
   * @param {number} startMult - Accumulated mult before Joker processing
   * @param {Object} [context={}] - Game context
   * @returns {Object} { chips, mult, steps }
   */
  evaluateSequentialJokers(evalResult, startChips, startMult, context = {}) {
    let currentChips = startChips;
    let currentMult = startMult;
    const steps = [];

    for (let i = 0; i < this.activeJokers.length; i++) {
      const joker = this.activeJokers[i];
      if (joker.debuffed) continue;

      const effectiveJoker = this.resolveEffectiveJoker(joker, i);
      if (!effectiveJoker) continue;

      // 1. Hand Synergy Hook
      if (typeof effectiveJoker.calculateHand === 'function') {
        const mod = effectiveJoker.calculateHand(evalResult, context, joker, this.activeJokers, context.gameState);
        if (mod) {
          if (mod.chips) currentChips += mod.chips;
          if (mod.mult) currentMult += mod.mult;
          if (mod.multMultiplier) currentMult = Math.floor(currentMult * mod.multMultiplier);

          steps.push({
            type: 'JOKER_TRIGGER',
            jokerId: joker.instanceId || joker.id,
            jokerName: joker.name,
            jokerIndex: i,
            mod,
            currentChips,
            currentMult,
            message: `${joker.name}: ${mod.message}`
          });
        }
      }

      // 2. General Independent Synergy Hook
      if (typeof effectiveJoker.calculateGeneral === 'function') {
        const mod = effectiveJoker.calculateGeneral(context, joker, this.activeJokers, context.gameState);
        if (mod) {
          if (mod.chips) currentChips += mod.chips;
          if (mod.mult) currentMult += mod.mult;
          if (mod.multMultiplier) currentMult = Math.floor(currentMult * mod.multMultiplier);

          steps.push({
            type: 'JOKER_TRIGGER',
            jokerId: joker.instanceId || joker.id,
            jokerName: joker.name,
            jokerIndex: i,
            mod,
            currentChips,
            currentMult,
            message: `${joker.name}: ${mod.message}`
          });
        }
      }

      // 3. Joker Self-Editions
      if (joker.edition === 'foil') {
        currentChips += 50;
        steps.push({
          type: 'JOKER_EDITION',
          jokerId: joker.instanceId || joker.id,
          jokerName: joker.name,
          chipsAdded: 50,
          currentChips,
          currentMult,
          message: `${joker.name} (Foil): +50 Chips`
        });
      }
      if (joker.edition === 'holo' || joker.edition === 'holographic') {
        currentMult += 10;
        steps.push({
          type: 'JOKER_EDITION',
          jokerId: joker.instanceId || joker.id,
          jokerName: joker.name,
          multAdded: 10,
          currentChips,
          currentMult,
          message: `${joker.name} (Holo): +10 Mult`
        });
      }
      if (joker.edition === 'polychrome') {
        currentMult = Math.floor(currentMult * 1.5);
        steps.push({
          type: 'JOKER_EDITION',
          jokerId: joker.instanceId || joker.id,
          jokerName: joker.name,
          multMultiplier: 1.5,
          currentChips,
          currentMult,
          message: `${joker.name} (Poly): ×1.5 Mult`
        });
      }
    }

    return {
      chips: currentChips,
      mult: currentMult,
      steps
    };
  }

  /**
   * Evaluates card-specific triggers from Jokers strictly in left-to-right order (index 0 to n-1).
   * (e.g. Greedy Joker, Wrathful Joker, Scary Face, Even Steven, Scholar, etc.)
   */
  evaluateCardTriggers(card, startChips, startMult, context = {}) {
    let currentChips = startChips;
    let currentMult = startMult;
    const steps = [];

    for (let j = 0; j < this.activeJokers.length; j++) {
      const joker = this.activeJokers[j];
      if (joker.debuffed) continue;

      const effectiveJoker = this.resolveEffectiveJoker(joker, j);
      if (effectiveJoker && typeof effectiveJoker.calculateCard === 'function') {
        const mod = effectiveJoker.calculateCard(card, context, joker, this.activeJokers, context.gameState);
        if (mod) {
          if (mod.chips) currentChips += mod.chips;
          if (mod.mult) currentMult += mod.mult;
          if (mod.multMultiplier) currentMult = Math.floor(currentMult * mod.multMultiplier);

          steps.push({
            type: 'JOKER_CARD_TRIGGER',
            jokerId: joker.instanceId || joker.id,
            cardId: card.id,
            jokerName: joker.name,
            jokerIndex: j,
            mod,
            currentChips,
            currentMult,
            message: `${joker.name}: ${mod.message}`
          });
        }
      }
    }

    return {
      chips: currentChips,
      mult: currentMult,
      steps
    };
  }

  /**
   * Resolves effective joker accounting for Blueprint & Brainstorm copying.
   *
   * BUG FIX #7: Matches the ScoreCalculator.resolveEffectiveJoker 1-hop chain fix.
   * Blueprint copying Brainstorm now correctly resolves to Brainstorm's target
   * (the leftmost non-copy Joker) instead of returning null.
   */
  resolveEffectiveJoker(joker, currentIndex) {
    if (joker.id === 'blueprint') {
      const target = this.activeJokers[currentIndex + 1];
      if (!target || target.debuffed) return null;

      if (target.id !== 'blueprint' && target.id !== 'brainstorm') {
        return target;
      }

      // BUG FIX #7: Blueprint→Brainstorm → resolve leftmost (1 hop only).
      if (target.id === 'brainstorm') {
        const brainstormTarget = this.activeJokers[0];
        if (
          brainstormTarget &&
          !brainstormTarget.debuffed &&
          brainstormTarget.id !== 'brainstorm' &&
          brainstormTarget.id !== 'blueprint' &&
          currentIndex !== 0
        ) {
          return brainstormTarget;
        }
      }
      return null;
    }
    if (joker.id === 'brainstorm') {
      const target = this.activeJokers[0];
      if (currentIndex !== 0 && target && !target.debuffed && target.id !== 'brainstorm') {
        return target;
      }
      return null;
    }
    return joker;
  }

  /**
   * Convenience calculation method delegating to ScoreCalculator
   */
  calculateProjectedScore(playedCards, handLevels = {}, context = {}) {
    return ScoreCalculator.preview(playedCards, this.activeJokers, handLevels, context);
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
