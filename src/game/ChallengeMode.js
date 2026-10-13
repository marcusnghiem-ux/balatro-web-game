/**
 * ChallengeMode.js
 * Challenges mode framework for Balatro.
 * Provides custom rule sets, deck modifications, and starting item loads.
 */

export const CHALLENGES = [
  {
    id: 'challenge_omen',
    name: 'The Omen Globe',
    icon: '🔮',
    description: 'All Booster Packs in shop are Spectral Packs. Start with Telescope & Cartomancer.',
    apply: (game) => {
      game.startingVouchers = ['Telescope', 'Cartomancer'];
      game.shopEngine.forceSpectralPacks = true;
    }
  },
  {
    id: 'challenge_inflation',
    name: 'Inflation',
    icon: '📈',
    description: 'Every time you buy any item from the shop, all shop costs increase permanently by $1.',
    apply: (game) => {
      game.inflationActive = true;
      game.inflationCounter = 0;
    }
  },
  {
    id: 'challenge_bram_poker',
    name: 'Bram Poker',
    icon: '♠️',
    description: 'Must play exactly 5 cards each hand. Discarding cards costs $1 each time.',
    apply: (game) => {
      game.exactFiveCardsRequired = true;
      game.discardsCostMoney = 1;
    }
  },
  {
    id: 'challenge_city_never_sleeps',
    name: 'City That Never Sleeps',
    icon: '🌃',
    description: 'Shop always has 4 Card slots, but earning Interest is permanently disabled.',
    apply: (game) => {
      game.shopCardSlots = 4;
      game.disableInterest = true;
    }
  },
  {
    id: 'challenge_non_perishable',
    name: 'Non-Perishable',
    icon: '🥫',
    description: 'Every single Joker obtained is Eternal (cannot be sold). Discards reduced to 2.',
    apply: (game) => {
      game.allJokersEternal = true;
      game.maxDiscards = 2;
      game.discardsLeft = 2;
    }
  }
];

export class ChallengeMode {
  constructor() {
    this.challenges = CHALLENGES;
    this.activeChallenge = null;
  }

  getChallengeList() {
    return this.challenges;
  }

  selectChallenge(id) {
    this.activeChallenge = this.challenges.find(c => c.id === id) || null;
    return this.activeChallenge;
  }

  applyActiveChallenge(game) {
    if (!this.activeChallenge) return;
    this.activeChallenge.apply(game);
  }
}

export const challengeMode = new ChallengeMode();
