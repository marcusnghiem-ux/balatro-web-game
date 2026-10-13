/**
 * ScoringEngine.js
 * Backward-compatible wrapper delegating to authentic sequential ScoreCalculator.
 */

import { ScoreCalculator } from './ScoreCalculator.js';

export { ScoreCalculator };

export class ScoringEngine {
  /**
   * Fast synchronous preview of the current hand score for the HUD
   */
  static preview(cards, activeJokers = [], handLevels = {}, context = {}) {
    return ScoreCalculator.preview(cards, activeJokers, handLevels, context);
  }

  /**
   * Generates full step-by-step sequential scoring execution sequence
   */
  static generateScoringSequence(playedCards, remainingHand = [], activeJokers = [], handLevels = {}, context = {}) {
    return ScoreCalculator.generateScoringSequence(playedCards, remainingHand, activeJokers, handLevels, context);
  }

  /**
   * Resolves effective joker accounting for Blueprint & Brainstorm
   */
  static resolveEffectiveJoker(joker, activeJokers, currentIndex) {
    return ScoreCalculator.resolveEffectiveJoker(joker, activeJokers, currentIndex);
  }
}
