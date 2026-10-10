/**
 * ScoringEngine.js
 * Implements Balatro's exact scoring algorithm (Chips × Mult) with an event-driven
 * step sequence generator for rich UI animations, sound hooks, and tactile pops.
 */

import { HandEvaluator } from './HandEvaluator.js';
import { EDITIONS, ENHANCEMENTS } from './Card.js';

export class ScoringEngine {
  /**
   * Fast synchronous preview of the current hand score for the HUD
   * @param {Card[]} cards - Selected cards
   * @param {Object[]} activeJokers - Currently held jokers
   * @param {Object} handLevels - Hand level state
   * @param {Object} context - Game context (discardsLeft, money, etc.)
   * @returns {Object} { handName, chips, mult, totalScore }
   */
  static preview(cards, activeJokers = [], handLevels = {}, context = {}) {
    if (!cards || cards.length === 0) {
      return { handName: '', chips: 0, mult: 0, totalScore: 0 };
    }

    const evalResult = HandEvaluator.evaluate(cards, handLevels);
    let chips = evalResult.baseChips;
    let mult = evalResult.baseMult;

    // Card scoring
    for (const card of evalResult.scoringCards) {
      if (card.debuffed) continue;
      chips += card.baseChips;

      if (card.enhancement === ENHANCEMENTS.BONUS) chips += 30;
      if (card.enhancement === ENHANCEMENTS.MULT) mult += 4;
      if (card.enhancement === ENHANCEMENTS.STONE) chips += 50;
      if (card.enhancement === ENHANCEMENTS.GLASS) mult = Math.floor(mult * 2);
      if (card.edition === EDITIONS.FOIL) chips += 50;
      if (card.edition === EDITIONS.HOLO) mult += 10;
      if (card.edition === EDITIONS.POLYCHROME) mult = Math.floor(mult * 1.5);

      // Card-specific jokers
      for (const joker of activeJokers) {
        if (typeof joker.calculateCard === 'function') {
          const mod = joker.calculateCard(card, context);
          if (mod) {
            if (mod.chips) chips += mod.chips;
            if (mod.mult) mult += mod.mult;
            if (mod.multMultiplier) mult = Math.floor(mult * mod.multMultiplier);
          }
        }
      }
    }

    // Jokers general and hand calculations
    for (const joker of activeJokers) {
      if (typeof joker.calculateHand === 'function') {
        const mod = joker.calculateHand(evalResult, context);
        if (mod) {
          if (mod.chips) chips += mod.chips;
          if (mod.mult) mult += mod.mult;
          if (mod.multMultiplier) mult = Math.floor(mult * mod.multMultiplier);
        }
      }

      if (typeof joker.calculateGeneral === 'function') {
        const mod = joker.calculateGeneral(context);
        if (mod) {
          if (mod.chips) chips += mod.chips;
          if (mod.mult) mult += mod.mult;
          if (mod.multMultiplier) mult = Math.floor(mult * mod.multMultiplier);
        }
      }
    }

    return {
      handName: evalResult.handName,
      level: evalResult.level,
      chips,
      mult,
      totalScore: chips * mult
    };
  }

  /**
   * Generates full step-by-step execution timeline for animations and audio
   * @param {Card[]} playedCards - The cards played by the user
   * @param {Card[]} remainingHand - Cards still held in hand (for Steel cards)
   * @param {Object[]} activeJokers - Active Jokers
   * @param {Object} handLevels - Hand level dictionary
   * @param {Object} context - Game context
   * @returns {Object} { evaluation, steps, finalChips, finalMult, finalScore }
   */
  static generateScoringSequence(playedCards, remainingHand = [], activeJokers = [], handLevels = {}, context = {}) {
    const evalResult = HandEvaluator.evaluate(playedCards, handLevels);
    const steps = [];

    let currentChips = evalResult.baseChips;
    let currentMult = evalResult.baseMult;

    // Step 1: Base Hand announcement
    steps.push({
      type: 'INIT_HAND',
      handName: evalResult.handName,
      level: evalResult.level,
      chips: currentChips,
      mult: currentMult,
      message: `${evalResult.handName} (Lv. ${evalResult.level})`
    });

    // Step 2: Individual Card Scoring (left to right)
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

      // Base card chips
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

      // Editions
      if (card.edition === EDITIONS.FOIL) {
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
      if (card.edition === EDITIONS.HOLO) {
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
      if (card.edition === EDITIONS.POLYCHROME) {
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

      // Card-specific jokers
      for (const joker of activeJokers) {
        if (typeof joker.calculateCard === 'function') {
          const mod = joker.calculateCard(card, context);
          if (mod) {
            if (mod.chips) currentChips += mod.chips;
            if (mod.mult) currentMult += mod.mult;
            if (mod.multMultiplier) currentMult = Math.floor(currentMult * mod.multMultiplier);

            steps.push({
              type: 'JOKER_CARD_TRIGGER',
              jokerId: joker.instanceId || joker.id,
              cardId: card.id,
              jokerName: joker.name,
              mod,
              currentChips,
              currentMult,
              message: `${joker.name}: ${mod.message}`
            });
          }
        }
      }
    }

    // Step 3: Held-in-hand card abilities (e.g. Steel cards)
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

    // Step 4: Joker Hand & General Hooks (left to right)
    for (const joker of activeJokers) {
      // Hand synergy
      if (typeof joker.calculateHand === 'function') {
        const mod = joker.calculateHand(evalResult, context);
        if (mod) {
          if (mod.chips) currentChips += mod.chips;
          if (mod.mult) currentMult += mod.mult;
          if (mod.multMultiplier) currentMult = Math.floor(currentMult * mod.multMultiplier);

          steps.push({
            type: 'JOKER_TRIGGER',
            jokerId: joker.instanceId || joker.id,
            jokerName: joker.name,
            mod,
            currentChips,
            currentMult,
            message: `${joker.name}: ${mod.message}`
          });
        }
      }

      // General synergy
      if (typeof joker.calculateGeneral === 'function') {
        const mod = joker.calculateGeneral(context);
        if (mod) {
          if (mod.chips) currentChips += mod.chips;
          if (mod.mult) currentMult += mod.mult;
          if (mod.multMultiplier) currentMult = Math.floor(currentMult * mod.multMultiplier);

          steps.push({
            type: 'JOKER_TRIGGER',
            jokerId: joker.instanceId || joker.id,
            jokerName: joker.name,
            mod,
            currentChips,
            currentMult,
            message: `${joker.name}: ${mod.message}`
          });
        }
      }
    }

    // Final total
    const finalScore = currentChips * currentMult;
    steps.push({
      type: 'FINAL_SCORE',
      chips: currentChips,
      mult: currentMult,
      finalScore,
      message: `${currentChips} × ${currentMult} = ${finalScore.toLocaleString()}`
    });

    return {
      evaluation: evalResult,
      steps,
      finalChips: currentChips,
      finalMult: currentMult,
      finalScore
    };
  }
}
