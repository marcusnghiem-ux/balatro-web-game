/**
 * GameEngine.js
 * Central game state machine managing Blinds, Antes, Hands, Discards,
 * Deck cycling, Cash flow, Shop inventory, and win/loss states.
 */

import { Card, SUITS, RANKS, EDITIONS, ENHANCEMENTS } from './Card.js';
import { HandEvaluator, HAND_DEFINITIONS } from './HandEvaluator.js';
import { JokerSystem } from './JokerSystem.js';
import { ScoringEngine } from './ScoringEngine.js';
import { ConsumableSystem } from './ConsumableSystem.js';
import { ShopEngine } from './ShopEngine.js';

export const GAME_STATES = {
  BLIND_SELECT: 'BLIND_SELECT',
  SELECTING: 'SELECTING',
  SCORING: 'SCORING',
  ROUND_WON: 'ROUND_WON',
  SHOP: 'SHOP',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY'
};

export const BLIND_TYPES = {
  SMALL: 'Small Blind',
  BIG: 'Big Blind',
  BOSS: 'Boss Blind'
};

export const BOSS_MODIFIERS = [
  { name: 'The Hook', desc: 'Discards 2 random cards per hand played', onHandPlayed: (game) => game.discardRandomCards(2), icon: '⚓' },
  { name: 'The Psychic', desc: 'Must play 5 cards', minCardsPlayed: 5, icon: '👁️' },
  { name: 'The Goad', desc: 'All Spades are debuffed', apply: (card) => card.suit === 'spades', icon: '♠️' },
  { name: 'The Head', desc: 'All Hearts are debuffed', apply: (card) => card.suit === 'hearts', icon: '♥️' },
  { name: 'The Window', desc: 'All Diamonds are debuffed', apply: (card) => card.suit === 'diamonds', icon: '♦️' },
  { name: 'The Club', desc: 'All Clubs are debuffed', apply: (card) => card.suit === 'clubs', icon: '♣️' },
  { name: 'The Wall', desc: 'Extra large blind requirement', isWall: true, icon: '🧱' },
  { name: 'The Water', desc: 'Start with 0 discards this round', startDiscards: 0, icon: '🌊' }
];

export const SKIP_TAGS = [
  { name: 'D6 Tag', icon: '🎲', desc: 'Next shop rerolls start at $0', effect: 'FREE_REROLLS' },
  { name: 'Coupon Tag', icon: '🏷️', desc: 'Items in next shop are 50% off', effect: 'FREE_SHOP' },
  { name: 'Polychrome Tag', icon: '✨', desc: 'Next shop Joker has Polychrome edition', effect: 'POLY_JOKER' },
  { name: 'Holo Tag', icon: '🌟', desc: 'Next shop Joker has Holographic edition', effect: 'HOLO_JOKER' },
  { name: 'Foil Tag', icon: '🪙', desc: 'Next shop Joker has Foil edition', effect: 'FOIL_JOKER' },
  { name: 'Standard Tag', icon: '🎴', desc: 'Next shop has a free Standard Pack', effect: 'FREE_STANDARD' },
  { name: 'Charm Tag', icon: '🃏', desc: 'Next shop has a free Arcana Pack', effect: 'FREE_ARCANA' },
  { name: 'Economy Tag', icon: '💰', desc: 'Gain +$10 Cash immediately', effect: 'ECONOMY' }
];

export class GameEngine {
  constructor() {
    this.jokerSystem = new JokerSystem(5);
    this.consumableSystem = new ConsumableSystem(2);
    this.shopEngine = new ShopEngine(this);
    this.shopCardSlots = 2;
    this.activeVouchers = [];
    this.voucherBoughtThisAnte = false;
    this.activeSkipTags = [];

    this.handLevels = {};
    for (const handName of Object.keys(HAND_DEFINITIONS)) {
      this.handLevels[handName] = 1;
    }

    this.ante = 1;
    this.maxAnte = 8;
    this.blindIndex = 0; // 0: Small, 1: Big, 2: Boss
    this.blindType = BLIND_TYPES.SMALL;
    this.activeBoss = null;
    this.anteBlinds = [];

    this.roundTarget = 300;
    this.roundScore = 0;
    this.handsLeft = 4;
    this.discardsLeft = 3;
    this.money = 4;

    this.deck = [];
    this.hand = [];
    this.discardPile = [];
    this.maxHandSize = 8;

    this.state = GAME_STATES.BLIND_SELECT;
    this.listeners = [];

    this.initDeck();
    this.setupAnteBlinds();
  }

  /**
   * Register a state change listener
   * @param {Function} fn
   */
  subscribe(fn) {
    this.listeners.push(fn);
  }

  /**
   * Notify all listeners of a state change
   */
  notify(event, data) {
    for (const listener of this.listeners) {
      listener(event, data, this);
    }
  }

  /**
   * Initializes standard 52-card deck
   */
  initDeck() {
    this.deck = [];
    for (const suit of Object.values(SUITS)) {
      for (const rank of RANKS) {
        this.deck.push(new Card(suit, rank));
      }
    }
    this.shuffle(this.deck);
  }

  /**
   * Shuffle array in-place
   */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Start a brand new game run
   */
  startNewRun() {
    this.ante = 1;
    this.blindIndex = 0;
    this.money = 4;
    this.jokerSystem = new JokerSystem(5);
    this.consumableSystem = new ConsumableSystem(2);
    this.shopCardSlots = 2;
    this.activeVouchers = [];
    this.voucherBoughtThisAnte = false;
    this.discountMultiplier = 1;
    this.activeSkipTags = [];

    for (const handName of Object.keys(HAND_DEFINITIONS)) {
      this.handLevels[handName] = 1;
    }

    this.initDeck();
    this.setupAnteBlinds();
    this.state = GAME_STATES.BLIND_SELECT;
    this.notify('BLIND_SELECT_ENTERED');
  }

  /**
   * Configures all 3 blinds for the current Ante (Small, Big, and Boss Blind)
   * Targets match official Balatro numbers (e.g. Ante 1: 300/450/600, Ante 2: 800/1200/1600)
   */
  setupAnteBlinds() {
    const baseAnteTargets = [300, 800, 2000, 5000, 11000, 20000, 35000, 50000];
    const anteBase = baseAnteTargets[Math.min(this.ante - 1, baseAnteTargets.length - 1)] || 50000;

    const boss = BOSS_MODIFIERS[Math.floor(Math.random() * BOSS_MODIFIERS.length)];
    const bossTarget = boss.isWall ? Math.floor(anteBase * 3.5) : Math.floor(anteBase * 2.0);

    const getRandomTag = () => SKIP_TAGS[Math.floor(Math.random() * SKIP_TAGS.length)];

    this.anteBlinds = [
      {
        index: 0,
        type: BLIND_TYPES.SMALL,
        name: 'Small Blind',
        target: Math.floor(anteBase * 1.0),
        reward: '$$$+',
        rewardValue: 3,
        tag: getRandomTag(),
        status: this.blindIndex === 0 ? 'active' : (this.blindIndex > 0 ? 'defeated' : 'upcoming')
      },
      {
        index: 1,
        type: BLIND_TYPES.BIG,
        name: 'Big Blind',
        target: Math.floor(anteBase * 1.5),
        reward: '$$$$+',
        rewardValue: 4,
        tag: getRandomTag(),
        status: this.blindIndex === 1 ? 'active' : (this.blindIndex > 1 ? 'defeated' : 'upcoming')
      },
      {
        index: 2,
        type: BLIND_TYPES.BOSS,
        name: boss.name,
        target: bossTarget,
        reward: '$$$$$+',
        rewardValue: 5,
        desc: boss.desc,
        bossObj: boss,
        status: this.blindIndex === 2 ? 'active' : 'upcoming'
      }
    ];

    this.syncActiveBlindInfo();
  }

  syncActiveBlindInfo() {
    if (!this.anteBlinds || this.anteBlinds.length <= this.blindIndex) return;
    const current = this.anteBlinds[this.blindIndex];
    this.blindType = current.type;
    this.roundTarget = current.target;
    if (current.type === BLIND_TYPES.BOSS) {
      this.activeBoss = current.bossObj;
    } else {
      this.activeBoss = null;
    }
  }

  /**
   * Discards random cards from hand (Boss debuff for 'The Hook')
   */
  discardRandomCards(count = 2) {
    if (this.hand.length === 0) return;
    const toDiscard = Math.min(count, this.hand.length);
    for (let i = 0; i < toDiscard; i++) {
      const idx = Math.floor(Math.random() * this.hand.length);
      const card = this.hand.splice(idx, 1)[0];
      card.selected = false;
      this.discardPile.push(card);
    }
    this.notify('HOOK_DISCARDED', { count: toDiscard });
  }

  /**
   * Starts playing the current active blind (moves from BLIND_SELECT to SELECTING)
   */
  selectActiveBlind() {
    this.syncActiveBlindInfo();
    this.startRound();
    return true;
  }

  /**
   * Starts a new round/blind
   */
  startRound() {
    this.roundScore = 0;
    this.handsLeft = 4;
    this.discardsLeft = (this.activeBoss && this.activeBoss.startDiscards !== undefined) 
      ? this.activeBoss.startDiscards 
      : 3;

    // Shuffle discard back into deck
    this.deck.push(...this.discardPile, ...this.hand);
    this.discardPile = [];
    this.hand = [];
    this.shuffle(this.deck);

    this.drawToHandSize();
    this.applyBossDebuffs();
    this.state = GAME_STATES.SELECTING;
    this.notify('ROUND_STARTED');
  }

  /**
   * Draw cards from deck until hand is full, keeping them sorted by rank
   */
  drawToHandSize() {
    while (this.hand.length < this.maxHandSize && this.deck.length > 0) {
      const card = this.deck.pop();
      card.selected = false;
      this.hand.push(card);
    }
    // Automatically sort hand cards in order of rank (high to low)
    this.hand.sort((a, b) => b.order - a.order);
  }

  /**
   * Apply any active Boss debuffs to cards in hand
   */
  applyBossDebuffs() {
    if (!this.activeBoss || !this.activeBoss.apply) {
      for (const card of this.hand) card.debuffed = false;
      return;
    }
    for (const card of this.hand) {
      card.debuffed = this.activeBoss.apply(card);
    }
  }

  /**
   * Get currently selected cards
   * @returns {Card[]}
   */
  getSelectedCards() {
    return this.hand.filter(c => c.selected);
  }

  /**
   * Toggle selection of a card by ID
   * @param {string} cardId
   * @returns {boolean} whether card is selected
   */
  toggleCardSelection(cardId) {
    if (this.state !== GAME_STATES.SELECTING) return false;

    const card = this.hand.find(c => c.id === cardId);
    if (!card) return false;

    const currentlySelected = this.getSelectedCards();
    if (!card.selected && currentlySelected.length >= 5) {
      this.notify('MAX_SELECTION_REACHED');
      return false;
    }

    card.toggleSelect();
    this.notify('SELECTION_CHANGED');
    return card.selected;
  }

  /**
   * Reorder cards within the hand
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  reorderHand(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.hand.length || toIndex < 0 || toIndex >= this.hand.length) return;
    const [moved] = this.hand.splice(fromIndex, 1);
    this.hand.splice(toIndex, 0, moved);
    this.notify('HAND_REORDERED');
  }

  /**
   * Sort player hand by rank (high to low)
   */
  sortHandByRank() {
    this.hand.sort((a, b) => b.order - a.order);
    this.notify('HAND_SORTED');
  }

  /**
   * Sort player hand by suit
   */
  sortHandBySuit() {
    const suitOrder = { spades: 4, hearts: 3, clubs: 2, diamonds: 1 };
    this.hand.sort((a, b) => {
      const suitDiff = (suitOrder[b.suit] || 0) - (suitOrder[a.suit] || 0);
      return suitDiff !== 0 ? suitDiff : b.order - a.order;
    });
    this.notify('HAND_SORTED');
  }

  /**
   * Discards up to 5 selected cards and draws replacements
   */
  discardSelected() {
    if (this.state !== GAME_STATES.SELECTING) return false;
    if (this.discardsLeft <= 0) return false;

    const selected = this.getSelectedCards();
    if (selected.length === 0) return false;

    this.discardsLeft--;

    // Move to discard pile
    this.hand = this.hand.filter(c => !c.selected);
    for (const card of selected) {
      card.selected = false;
      this.discardPile.push(card);
    }

    this.drawToHandSize();
    this.applyBossDebuffs();
    this.notify('DISCARDED', { discardedCount: selected.length });
    return true;
  }

  /**
   * Initiates scoring sequence for selected cards
   * @returns {Object|null} scoring sequence details
   */
  playSelected() {
    if (this.state !== GAME_STATES.SELECTING) return null;
    if (this.handsLeft <= 0) return null;

    const selected = this.getSelectedCards();
    if (selected.length === 0 || selected.length > 5) return null;

    this.handsLeft--;
    this.state = GAME_STATES.SCORING;

    const heldCards = this.hand.filter(c => !c.selected);
    const context = {
      discardsLeft: this.discardsLeft,
      handsLeft: this.handsLeft,
      money: this.money
    };

    const scoringResult = ScoringEngine.generateScoringSequence(
      selected,
      heldCards,
      this.jokerSystem.getJokers(),
      this.handLevels,
      context
    );

    this.notify('PLAY_STARTED', {
      scoringResult,
      playedCards: selected
    });

    return scoringResult;
  }

  /**
   * Finalizes the played hand score into the round score
   * Called after scoring animations complete
   * @param {number} scorePoints
   */
  /**
   * Finalizes the played hand score into the round score
   * Called after scoring animations complete
   * @param {number} scorePoints
   */
  commitScoredPoints(scorePoints) {
    this.roundScore += scorePoints;

    // Discard played cards
    const played = this.getSelectedCards();
    this.hand = this.hand.filter(c => !c.selected);
    for (const card of played) {
      card.selected = false;
      this.discardPile.push(card);
    }

    // Boss effect for 'The Hook': Discards 2 random cards per hand played
    if (this.activeBoss && this.activeBoss.name === 'The Hook') {
      this.discardRandomCards(2);
    }

    // Check Win / Loss / Next Hand
    if (this.roundScore >= this.roundTarget) {
      this.resolveRoundWin();
    } else if (this.handsLeft <= 0) {
      this.resolveGameOver();
    } else {
      this.drawToHandSize();
      this.applyBossDebuffs();
      this.state = GAME_STATES.SELECTING;
      this.notify('HAND_RESOLVED');
    }
  }

  /**
   * Round passed: calculate reward money and open Shop
   */
  resolveRoundWin() {
    // Exact user rule: +4 coins base per round
    const baseReward = 4;
    // Any non-used plays = +1 coin each
    const handsBonus = this.handsLeft;
    // Interest bar: every 5 coins held = +1 coin interest, capping at 50 coins (max +$10 interest)
    const eligibleMoney = Math.min(50, Math.max(0, this.money));
    const interest = Math.floor(eligibleMoney / 5);

    // Gold Card mutations in hand: +$3 each at round end
    let goldCardBonus = 0;
    for (const card of this.hand) {
      if (card.enhancement === ENHANCEMENTS.GOLD && !card.debuffed) {
        goldCardBonus += 3;
      }
    }

    let endRoundJokerBonus = 0;
    for (const joker of this.jokerSystem.getJokers()) {
      if (typeof joker.onRoundEnd === 'function') {
        const bonus = joker.onRoundEnd({ money: this.money });
        if (bonus && bonus.money) endRoundJokerBonus += bonus.money;
      }
    }

    const totalEarned = baseReward + handsBonus + interest + goldCardBonus + endRoundJokerBonus;
    this.money += totalEarned;

    if (this.anteBlinds && this.anteBlinds[this.blindIndex]) {
      this.anteBlinds[this.blindIndex].status = 'defeated';
    }

    this.state = GAME_STATES.ROUND_WON;
    this.notify('ROUND_WON', {
      baseReward,
      handsBonus,
      interest,
      goldCardBonus,
      endRoundJokerBonus,
      totalEarned
    });

    // Advance blind progression
    if (this.blindIndex < 2) {
      this.blindIndex++;
      this.syncActiveBlindInfo();
      if (this.anteBlinds[this.blindIndex]) {
        this.anteBlinds[this.blindIndex].status = 'active';
      }
    } else {
      // Defeated Boss Blind!
      if (this.ante >= this.maxAnte) {
        this.state = GAME_STATES.VICTORY;
        this.notify('GAME_VICTORY');
        return;
      }
      this.ante++;
      this.blindIndex = 0;
      this.voucherBoughtThisAnte = false; // Reset voucher for new Ante
      this.setupAnteBlinds();
    }

    this.shopEngine.initShopForRound();
  }

  /**
   * Skip current Small or Big Blind (earns $0 money, awards Skip Tag, advances)
   */
  skipCurrentBlind() {
    if (this.state !== GAME_STATES.BLIND_SELECT && this.state !== GAME_STATES.SELECTING) return false;
    if (this.blindType === BLIND_TYPES.BOSS || this.blindIndex >= 2) {
      return false; // Boss blinds cannot be skipped!
    }

    const skippedBlind = this.anteBlinds[this.blindIndex];
    if (skippedBlind) {
      skippedBlind.status = 'skipped';
      if (skippedBlind.tag) {
        this.applySkipTag(skippedBlind.tag);
      }
    }

    this.roundScore = 0;
    this.blindIndex++;
    this.syncActiveBlindInfo();

    if (this.anteBlinds[this.blindIndex]) {
      this.anteBlinds[this.blindIndex].status = 'active';
    }

    this.state = GAME_STATES.BLIND_SELECT;
    this.notify('BLIND_SKIPPED', {
      skippedBlind: skippedBlind ? skippedBlind.name : 'Blind',
      tag: skippedBlind ? skippedBlind.tag : null
    });
    return true;
  }

  applySkipTag(tag) {
    if (!tag) return;
    this.activeSkipTags.push(tag);
    if (tag.effect === 'ECONOMY') {
      this.money += 10;
    }
  }

  startNextRoundFromShop() {
    this.state = GAME_STATES.BLIND_SELECT;
    this.notify('BLIND_SELECT_ENTERED');
  }

  /**
   * Returns current interest progress towards $50 cap (+1 per $5, max +$10)
   */
  getInterestInfo() {
    const cappedMoney = Math.min(50, Math.max(0, this.money));
    const currentInterest = Math.floor(cappedMoney / 5);
    const nextThreshold = Math.min(50, (currentInterest + 1) * 5);
    return {
      currentInterest,
      maxInterest: 10,
      cappedMoney,
      nextThreshold,
      percent: (cappedMoney / 50) * 100
    };
  }

  /**
   * Buy an item from the Top Shelf
   */
  buyShopCard(index) {
    const res = this.shopEngine.buyShopCard(index);
    if (res.success) {
      this.notify('SHOP_ITEM_BOUGHT', res);
    }
    return res;
  }

  /**
   * Buy the active Ante Voucher
   */
  buyVoucher() {
    const res = this.shopEngine.buyVoucher();
    if (res.success) {
      this.notify('VOUCHER_BOUGHT', res);
    }
    return res;
  }

  /**
   * Buy & open a Booster Pack
   */
  buyBoosterPack(index) {
    const res = this.shopEngine.buyBoosterPack(index);
    if (res.success) {
      this.notify('PACK_OPENED_MODAL', res);
    }
    return res;
  }

  /**
   * Pick card from open booster pack
   */
  pickPackCard(index) {
    const res = this.shopEngine.pickPackCard(index);
    if (res.success) {
      this.notify('PACK_CARD_PICKED', res);
    }
    return res;
  }

  /**
   * Skip remaining booster pack choices
   */
  skipPack() {
    const res = this.shopEngine.skipPack();
    this.notify('PACK_SKIPPED', res);
    return res;
  }

  /**
   * Reroll Top Shelf items
   */
  rerollShop() {
    const res = this.shopEngine.rerollShop();
    if (res.success) {
      this.notify('SHOP_REROLLED', res);
    }
    return res;
  }

  /**
   * Use a consumable from the top-right consumable bar
   */
  useConsumable(index) {
    const res = this.consumableSystem.useConsumable(index, this);
    if (res.success) {
      this.notify('CONSUMABLE_USED', res);
    }
    return res;
  }

  /**
   * Sell a consumable from the top-right consumable bar
   */
  sellConsumable(index) {
    const item = this.consumableSystem.removeConsumable(index);
    if (item) {
      this.money += item.sellValue || 1;
      this.notify('CONSUMABLE_SOLD', item);
      return true;
    }
    return false;
  }

  /**
   * Sell an active Joker for half its value
   */
  sellJoker(jokerIndex) {
    const jokers = this.jokerSystem.getJokers();
    if (jokerIndex < 0 || jokerIndex >= jokers.length) return false;

    const sold = this.jokerSystem.removeJoker(jokerIndex);
    if (sold) {
      this.money += sold.sellValue;
      this.notify('JOKER_SOLD', sold);
      return true;
    }
    return false;
  }


  /**
   * Round failed
   */
  resolveGameOver() {
    this.state = GAME_STATES.GAME_OVER;
    this.notify('GAME_OVER', {
      ante: this.ante,
      finalScore: this.roundScore,
      targetScore: this.roundTarget
    });
  }
}

