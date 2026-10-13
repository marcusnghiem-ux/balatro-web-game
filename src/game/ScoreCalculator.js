/**
 * ScoreCalculator.js
 * Lead Systems and Gameplay Engineer implementation of authentic Balatro scoring engine.
 *
 * Implements:
 * 1. STRICT SCORING ORDER OF OPERATIONS:
 *    - Step A (Base Cards): Calculate and sum up base chips of the evaluated poker hand type
 *      plus individual chip values of each scored card, card enhancements, editions, and card triggers.
 *    - Step B (Joker Sequential Processing): Iterate through active Jokers array strictly
 *      from left to right (index 0 to n-1). Each Joker sequentially adds flat chips, adds flat multipliers (+Mult),
 *      or multiplies the current multiplier (xMult).
 *      Ordering strictly matters (e.g., a +Mult Joker placed before an xMult Joker scales exponentially).
 * 2. FIRE EFFECT SINGLE-HAND OVERFLOW TRIGGER:
 *    - Calculates whether the projected single-hand score meets or exceeds the required Blind score.
 *    - Flags `isSingleHandOverflow` to dynamically activate the red-orange flame particle effect
 *      around the score counter display.
 */

import { HandEvaluator } from './HandEvaluator.js';
import { EDITIONS, ENHANCEMENTS } from './Card.js';

export class ScoreCalculator {
  /**
   * Fast synchronous preview calculation for HUD display
   * @param {Array<import('./Card.js').Card>} cards Selected cards
   * @param {Array<Object>} [activeJokers=[]] Currently held active Jokers
   * @param {Object} [handLevels={}] Hand level upgrade state
   * @param {Object} [context={}] Game state context (roundTarget, money, etc.)
   * @returns {Object} { handName, level, chips, mult, totalScore, isSingleHandOverflow }
   */
  static preview(cards, activeJokers = [], handLevels = {}, context = {}) {
    if (!cards || cards.length === 0) {
      return {
        handName: 'Select Cards',
        level: 1,
        chips: 0,
        mult: 0,
        totalScore: 0,
        isSingleHandOverflow: false
      };
    }

    const evalResult = HandEvaluator.evaluate(cards, handLevels);
    let chips = evalResult.baseChips;
    let mult = evalResult.baseMult;

    // STEP A: Base Cards and Card Modifiers (Left to Right in scoring cards)
    for (const card of evalResult.scoringCards) {
      if (card.debuffed) continue;
      chips += card.baseChips;

      // Card Enhancements
      if (card.enhancement === ENHANCEMENTS.BONUS) chips += 30;
      if (card.enhancement === ENHANCEMENTS.MULT) mult += 4;
      if (card.enhancement === ENHANCEMENTS.STONE) chips += 50;
      if (card.enhancement === ENHANCEMENTS.GLASS) mult = Math.floor(mult * 2);

      // Card Editions
      if (card.edition === EDITIONS.FOIL || card.edition === 'foil') chips += 50;
      if (card.edition === EDITIONS.HOLO || card.edition === 'holo' || card.edition === 'holographic') mult += 10;
      if (card.edition === EDITIONS.POLYCHROME || card.edition === 'polychrome') mult = Math.floor(mult * 1.5);

      // Card-specific Joker triggers (evaluated left to right: index 0 to n-1)
      for (let j = 0; j < activeJokers.length; j++) {
        const joker = activeJokers[j];
        if (joker.debuffed) continue;
        const effectiveJoker = this.resolveEffectiveJoker(joker, activeJokers, j);
        if (effectiveJoker && typeof effectiveJoker.calculateCard === 'function') {
          const mod = effectiveJoker.calculateCard(card, context, joker, activeJokers, context.gameState);
          if (mod) {
            if (mod.chips) chips += mod.chips;
            if (mod.mult) mult += mod.mult;
            if (mod.multMultiplier) mult = Math.floor(mult * mod.multMultiplier);
          }
        }
      }
    }

    // Held-in-hand cards (e.g. Steel cards)
    const heldCards = context.heldCards || [];
    for (const held of heldCards) {
      if (held.enhancement === ENHANCEMENTS.STEEL && !held.debuffed) {
        mult = Math.floor(mult * 1.5);
      }
    }

    // STEP B: Strict Sequential Joker Processing (Left to Right: Index 0 to n-1)
    // Order strictly matters: A +Mult Joker before an xMult Joker results in much higher score!
    for (let i = 0; i < activeJokers.length; i++) {
      const joker = activeJokers[i];
      if (joker.debuffed) continue;

      const effectiveJoker = this.resolveEffectiveJoker(joker, activeJokers, i);
      if (!effectiveJoker) continue;

      // 1. Hand Synergy Hook (e.g. Jolly Joker, Crazy Joker, The Duo)
      if (typeof effectiveJoker.calculateHand === 'function') {
        const mod = effectiveJoker.calculateHand(evalResult, context, joker, activeJokers, context.gameState);
        if (mod) {
          if (mod.chips) chips += mod.chips;
          if (mod.mult) mult += mod.mult;
          if (mod.multMultiplier) mult = Math.floor(mult * mod.multMultiplier);
        }
      }

      // 2. General Independent Synergy Hook (e.g. Gros Michel, Cavendish, Banner, Abstract)
      if (typeof effectiveJoker.calculateGeneral === 'function') {
        const mod = effectiveJoker.calculateGeneral(context, joker, activeJokers, context.gameState);
        if (mod) {
          if (mod.chips) chips += mod.chips;
          if (mod.mult) mult += mod.mult;
          if (mod.multMultiplier) mult = Math.floor(mult * mod.multMultiplier);
        }
      }

      // 3. Joker Self-Editions (Foil, Holo, Polychrome on Joker card)
      if (joker.edition === EDITIONS.FOIL || joker.edition === 'foil') chips += 50;
      if (joker.edition === EDITIONS.HOLO || joker.edition === 'holo' || joker.edition === 'holographic') mult += 10;
      if (joker.edition === EDITIONS.POLYCHROME || joker.edition === 'polychrome') mult = Math.floor(mult * 1.5);
    }

    // Plasma Deck balance check
    let totalScore = chips * mult;
    if (context && context.plasmaDeckActive) {
      const balanced = Math.floor((chips + mult) / 2);
      totalScore = balanced * balanced;
    }

    // FIRE EFFECT SINGLE-HAND OVERFLOW TRIGGER
    // Triggers if this single played hand's projected score meets or exceeds the round target
    const roundTarget = context.roundTarget !== undefined
      ? context.roundTarget
      : (context.gameState ? context.gameState.roundTarget : 300);

    const isSingleHandOverflow = totalScore >= roundTarget && roundTarget > 0;

    return {
      handName: evalResult.handName,
      level: evalResult.level,
      chips,
      mult,
      totalScore,
      isSingleHandOverflow
    };
  }

  /**
   * Generates step-by-step sequential animation execution trace
   * @param {Array<import('./Card.js').Card>} playedCards
   * @param {Array<import('./Card.js').Card>} remainingHand
   * @param {Array<Object>} activeJokers
   * @param {Object} handLevels
   * @param {Object} context
   * @returns {Object} { evaluation, steps, finalChips, finalMult, finalScore, isSingleHandOverflow }
   */
  static generateScoringSequence(playedCards, remainingHand = [], activeJokers = [], handLevels = {}, context = {}) {
    const evalResult = HandEvaluator.evaluate(playedCards, handLevels);
    const steps = [];

    let currentChips = evalResult.baseChips;
    let currentMult = evalResult.baseMult;

    // Hand announcement step
    steps.push({
      type: 'INIT_HAND',
      handName: evalResult.handName,
      level: evalResult.level,
      chips: currentChips,
      mult: currentMult,
      message: `${evalResult.handName} (Lv. ${evalResult.level})`
    });

    // STEP A: Base Cards and Card Modifiers (Left to Right)
    for (let i = 0; i < evalResult.scoringCards.length; i++) {
      const card = evalResult.scoringCards[i];

      if (card.debuffed) {
        steps.push({
          type: 'CARD_DEBUFFED',
          cardId: card.id,
          message: 'Debuffed!'
        });
        continue;
      }

      // Base card rank chips
      currentChips += card.baseChips;
      steps.push({
        type: 'CARD_CHIPS',
        cardId: card.id,
        chipsAdded: card.baseChips,
        currentChips,
        currentMult,
        message: `+${card.baseChips} Chips`
      });

      // Enhancements
      if (card.enhancement === ENHANCEMENTS.BONUS) {
        currentChips += 30;
        steps.push({
          type: 'CARD_ENHANCEMENT',
          cardId: card.id,
          chipsAdded: 30,
          currentChips,
          currentMult,
          message: '+30 Bonus Chips'
        });
      }
      if (card.enhancement === ENHANCEMENTS.MULT) {
        currentMult += 4;
        steps.push({
          type: 'CARD_ENHANCEMENT',
          cardId: card.id,
          multAdded: 4,
          currentChips,
          currentMult,
          message: '+4 Mult'
        });
      }
      if (card.enhancement === ENHANCEMENTS.STONE) {
        currentChips += 50;
        steps.push({
          type: 'CARD_ENHANCEMENT',
          cardId: card.id,
          chipsAdded: 50,
          currentChips,
          currentMult,
          message: '+50 Stone Chips'
        });
      }
      if (card.enhancement === ENHANCEMENTS.GLASS) {
        currentMult = Math.floor(currentMult * 2);
        const willShatter = Math.random() < 0.25;
        steps.push({
          type: 'CARD_ENHANCEMENT',
          cardId: card.id,
          multMultiplier: 2,
          currentChips,
          currentMult,
          message: 'Glass Card: ×2 Mult',
          shatters: willShatter
        });
      }
      if (card.enhancement === ENHANCEMENTS.LUCKY) {
        if (Math.random() < 0.20) {
          currentMult += 20;
          steps.push({
            type: 'CARD_ENHANCEMENT',
            cardId: card.id,
            multAdded: 20,
            currentChips,
            currentMult,
            message: 'Lucky: +20 Mult!'
          });
        }
        if (Math.random() < 0.067) {
          steps.push({
            type: 'LUCKY_CASH',
            cardId: card.id,
            cashAdded: 20,
            message: 'Lucky: +$20 Cash!'
          });
        }
      }

      // Card Editions
      if (card.edition === EDITIONS.FOIL || card.edition === 'foil') {
        currentChips += 50;
        steps.push({
          type: 'CARD_EDITION',
          cardId: card.id,
          chipsAdded: 50,
          currentChips,
          currentMult,
          message: '+50 Foil Chips'
        });
      }
      if (card.edition === EDITIONS.HOLO || card.edition === 'holo' || card.edition === 'holographic') {
        currentMult += 10;
        steps.push({
          type: 'CARD_EDITION',
          cardId: card.id,
          multAdded: 10,
          currentChips,
          currentMult,
          message: '+10 Holo Mult'
        });
      }
      if (card.edition === EDITIONS.POLYCHROME || card.edition === 'polychrome') {
        currentMult = Math.floor(currentMult * 1.5);
        steps.push({
          type: 'CARD_EDITION',
          cardId: card.id,
          multMultiplier: 1.5,
          currentChips,
          currentMult,
          message: '×1.5 Poly Mult'
        });
      }

      // Card-specific Jokers (processed strictly left to right: index 0 to n-1)
      for (let j = 0; j < activeJokers.length; j++) {
        const joker = activeJokers[j];
        if (joker.debuffed) continue;
        const effectiveJoker = this.resolveEffectiveJoker(joker, activeJokers, j);
        if (effectiveJoker && typeof effectiveJoker.calculateCard === 'function') {
          const mod = effectiveJoker.calculateCard(card, context, joker, activeJokers, context.gameState);
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
    }

    // Held-in-hand abilities (e.g. Steel cards)
    for (const heldCard of remainingHand) {
      if (heldCard.enhancement === ENHANCEMENTS.STEEL && !heldCard.debuffed) {
        currentMult = Math.floor(currentMult * 1.5);
        steps.push({
          type: 'HELD_CARD_TRIGGER',
          cardId: heldCard.id,
          multMultiplier: 1.5,
          currentChips,
          currentMult,
          message: 'Steel Card: ×1.5 Mult'
        });
      }
    }

    // STEP B: Strict Sequential Joker Processing (Index 0 to n-1, Left to Right)
    // Order strictly matters: Jokers are processed sequentially as arranged on the board.
    for (let i = 0; i < activeJokers.length; i++) {
      const joker = activeJokers[i];
      if (joker.debuffed) continue;

      const effectiveJoker = this.resolveEffectiveJoker(joker, activeJokers, i);
      if (!effectiveJoker) continue;

      // 1. Hand Synergy Hook
      if (typeof effectiveJoker.calculateHand === 'function') {
        const mod = effectiveJoker.calculateHand(evalResult, context, joker, activeJokers, context.gameState);
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

      // 2. General Synergy Hook
      if (typeof effectiveJoker.calculateGeneral === 'function') {
        const mod = effectiveJoker.calculateGeneral(context, joker, activeJokers, context.gameState);
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
      if (joker.edition === EDITIONS.FOIL || joker.edition === 'foil') {
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
      if (joker.edition === EDITIONS.HOLO || joker.edition === 'holo' || joker.edition === 'holographic') {
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
      if (joker.edition === EDITIONS.POLYCHROME || joker.edition === 'polychrome') {
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

    // Step 5: Final Score and Plasma Deck balance
    let finalScore = currentChips * currentMult;
    if (context && context.plasmaDeckActive) {
      const balanced = Math.floor((currentChips + currentMult) / 2);
      finalScore = balanced * balanced;
      steps.push({
        type: 'PLASMA_BALANCE',
        chips: balanced,
        mult: balanced,
        finalScore,
        message: `Plasma Deck: Balanced to ${balanced} × ${balanced} = ${finalScore.toLocaleString()}`
      });
    } else {
      steps.push({
        type: 'FINAL_SCORE',
        chips: currentChips,
        mult: currentMult,
        finalScore,
        message: `${currentChips} × ${currentMult} = ${finalScore.toLocaleString()}`
      });
    }

    // FIRE EFFECT SINGLE-HAND OVERFLOW TRIGGER
    // Triggers if this single played hand's score meets or exceeds the Blind target
    const roundTarget = context.roundTarget !== undefined
      ? context.roundTarget
      : (context.gameState ? context.gameState.roundTarget : 300);

    const isSingleHandOverflow = finalScore >= roundTarget && roundTarget > 0;

    return {
      evaluation: evalResult,
      steps,
      finalChips: currentChips,
      finalMult: currentMult,
      finalScore,
      isSingleHandOverflow
    };
  }

  /**
   * Resolves Blueprint and Brainstorm copying logic
   * Blueprint: Copies ability of Joker to the right (index + 1)
   * Brainstorm: Copies ability of leftmost Joker (index 0)
   *
   * BUG FIX #2: Blueprint → Brainstorm chain now resolves correctly.
   * Previously Blueprint copying a Brainstorm returned null (Brainstorm has no
   * own ability). Now we resolve one hop further through Brainstorm's own rule
   * (copy leftmost non-Brainstorm Joker), capped at 1 hop to prevent cycles.
   *
   * @param {Object} joker Current joker
   * @param {Array<Object>} activeJokers Array of currently active jokers
   * @param {number} currentIndex Current slot index
   * @returns {Object|null} The resolved effective joker
   */
  static resolveEffectiveJoker(joker, activeJokers, currentIndex) {
    if (joker.id === 'blueprint') {
      const target = activeJokers[currentIndex + 1];
      if (!target || target.debuffed) return null;

      // Direct non-copy target → return it
      if (target.id !== 'blueprint' && target.id !== 'brainstorm') {
        return target;
      }

      // BUG FIX #2: Blueprint's target is Brainstorm → chain one hop.
      // Brainstorm copies leftmost Joker (index 0). Resolve that, but only if
      // it isn't another copy-Joker (prevent circular chains).
      if (target.id === 'brainstorm') {
        const brainstormTarget = activeJokers[0];
        if (
          brainstormTarget &&
          !brainstormTarget.debuffed &&
          brainstormTarget.id !== 'brainstorm' &&
          brainstormTarget.id !== 'blueprint' &&
          currentIndex !== 0 // Don't copy self
        ) {
          return brainstormTarget;
        }
      }

      return null;
    }

    if (joker.id === 'brainstorm') {
      const target = activeJokers[0];
      if (currentIndex !== 0 && target && !target.debuffed && target.id !== 'brainstorm') {
        return target;
      }
      return null;
    }

    return joker;
  }
}
