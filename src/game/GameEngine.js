/**
 * GameEngine.js
 * Central game state machine managing Blinds, Antes, Hands, Discards,
 * Deck cycling, Cash flow, Shop inventory, and win/loss states.
 */

import { Card, SUITS, RANKS, EDITIONS, ENHANCEMENTS } from './Card.js';
import { HandEvaluator, HAND_DEFINITIONS } from './HandEvaluator.js';
import { JokerSystem } from './JokerSystem.js';
import { ScoreCalculator } from './ScoreCalculator.js';
import { ScoringEngine } from './ScoringEngine.js';
import { ConsumableSystem } from './ConsumableSystem.js';
import { ShopEngine } from './ShopEngine.js';
import { DECKS, STAKES } from './DeckDefinitions.js';
import { unlockablesManager } from './UnlockablesSystem.js';
import { saveManager } from './SaveManager.js';
import { handLevelManager } from './HandLevelManager.js';
import { statsManager } from './StatsManager.js';

export const GAME_STATES = {
  TITLE: 'TITLE',
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
  { id: 'boss_hook', name: 'The Hook', desc: 'Discards 2 random cards per hand played', onHandPlayed: (game) => game.discardRandomCards(2), icon: '⚓', color: '#992d22', border: '#e74c3c' },
  { id: 'boss_ox', name: 'The Ox', desc: 'Playing your most played hand sets money to $0', icon: '🐂', color: '#784212', border: '#b9770e' },
  { id: 'boss_house', name: 'The House', desc: 'First hand is drawn face down', icon: '🏚️', color: '#1b2631', border: '#34495e' },
  { id: 'boss_wall', name: 'The Wall', desc: 'Extra large blind requirement (3.5x base chips)', isWall: true, icon: '🧱', color: '#3e4444', border: '#7f8c8d' },
  { id: 'boss_wheel', name: 'The Wheel', desc: '1 in 7 cards are drawn face down', icon: '🎡', color: '#196f3d', border: '#27ae60' },
  { id: 'boss_arm', name: 'The Arm', desc: 'Decrease level of played poker hand', onHandPlayed: (game, handName) => { if (game.handLevels[handName] > 1) game.handLevels[handName]--; }, icon: '🦾', color: '#935116', border: '#e59866' },
  { id: 'boss_fish', name: 'The Fish', desc: 'Cards drawn face down after each hand played', icon: '🐟', color: '#117864', border: '#16a085' },
  { id: 'boss_psychic', name: 'The Psychic', desc: 'Must play exactly 5 cards', minCardsPlayed: 5, icon: '👁️', color: '#5b2c6f', border: '#8e44ad' },
  { id: 'boss_goad', name: 'The Goad', desc: 'All Spades are debuffed', apply: (card) => card.suit === 'spades', icon: '♠️', color: '#212f3d', border: '#566573' },
  { id: 'boss_head', name: 'The Head', desc: 'All Hearts are debuffed', apply: (card) => card.suit === 'hearts', icon: '♥️', color: '#78281f', border: '#c0392b' },
  { id: 'boss_window', name: 'The Window', desc: 'All Diamonds are debuffed', apply: (card) => card.suit === 'diamonds', icon: '♦️', color: '#922b21', border: '#d98880' },
  { id: 'boss_club', name: 'The Club', desc: 'All Clubs are debuffed', apply: (card) => card.suit === 'clubs', icon: '♣️', color: '#145a32', border: '#2ecc71' },
  { id: 'boss_pillar', name: 'The Pillar', desc: 'Cards played previously this Ante are debuffed', icon: '🏛️', color: '#17202a', border: '#415b76' },
  { id: 'boss_eye', name: 'The Eye', desc: 'No repeat hand types this round', noRepeatHands: true, icon: '🧿', color: '#6c3483', border: '#bb8fce' },
  { id: 'boss_mouth', name: 'The Mouth', desc: 'Play only 1 hand type this round', singleHandType: true, icon: '👄', color: '#873600', border: '#dc7633' },
  { id: 'boss_plant', name: 'The Plant', desc: 'All face cards are debuffed', apply: (card) => ['J', 'Q', 'K'].includes(card.rank), icon: '🌿', color: '#1e8449', border: '#52be80' },
  { id: 'boss_serpent', name: 'The Serpent', desc: 'After Play or Discard, always draw 3 cards', icon: '🐍', color: '#0e6251', border: '#1abc9c' },
  { id: 'boss_water', name: 'The Water', desc: 'Start with 0 discards this round', startDiscards: 0, icon: '🌊', color: '#1f618d', border: '#5dade2' },
  { id: 'boss_needle', name: 'The Needle', desc: 'Play only 1 hand this round', maxHands: 1, icon: '🪡', color: '#4a235a', border: '#a569bd' },
  { id: 'boss_flint', name: 'The Flint', desc: 'Base Chips and Mult are halved', halfBase: true, icon: '🪵', color: '#b9770e', border: '#f39c12' },
  { id: 'boss_mark', name: 'The Mark', desc: 'All face cards are drawn face down', icon: '🎭', color: '#641e16', border: '#cd6155' }
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
    // BUG FIX #8: Pass game ref so JokerSystem can apply Turtle Bean hand-size bonus.
    this.jokerSystem = new JokerSystem(5, this);
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
    this.handLevelManager = handLevelManager;
    this.handLevelManager.attachGame(this);

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
    this.state = GAME_STATES.BLIND_SELECT;
    this.listeners = [];
    this.endlessMode = false;
    this.saveManager = saveManager;

    // Run seed and lifetime run statistics tracking
    this.seed = this.generateSeed();
    this.statsManager = statsManager;
    this.statsManager.reset(this.seed);
    this.stats = this.statsManager;
    this.handsPlayedThisRound = [];
    this.allowedHandType = null;

    this.initDeck();
    this.setupAnteBlinds();
  }

  generateSeed() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let s = '';
    for (let i = 0; i < 8; i++) {
      s += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return s;
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
    // Auto-save on meaningful state changes
    const autoSaveEvents = [
      'ROUND_STARTED', 'ROUND_WON', 'HAND_RESOLVED', 'DISCARDED',
      'SHOP_ITEM_BOUGHT', 'VOUCHER_BOUGHT', 'PACK_CARD_PICKED', 'PACK_SKIPPED',
      'SHOP_REROLLED', 'CONSUMABLE_USED', 'CONSUMABLE_SOLD', 'JOKER_SOLD',
      'BLIND_SKIPPED', 'ENDLESS_MODE_STARTED', 'BLIND_SELECTED'
    ];
    if (this.saveManager && autoSaveEvents.includes(event)) {
      this.saveManager.saveCurrentRun(this);
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
   * Start a brand new game run with specified Deck and Stake
   */
  startNewRun(deckId = 'deck_red', stakeId = 'stake_white') {
    this.selectedDeck = DECKS.find(d => d.id === deckId) || DECKS[0];
    this.selectedStake = STAKES.find(s => s.id === stakeId) || STAKES[0];

    this.ante = 1;
    this.blindIndex = 0;
    this.money = 4;
    this.maxHands = 4;
    this.handsLeft = 4;
    this.maxDiscards = 3;
    this.discardsLeft = 3;
    this.maxHandSize = 8;
    this.endlessMode = false;
    this.greenDeckActive = false;
    this.ghostDeckActive = false;
    this.anaglyphDeckActive = false;
    this.plasmaDeckActive = false;

    // BUG FIX #8: Pass game ref so JokerSystem can apply Turtle Bean hand-size bonus.
    this.jokerSystem = new JokerSystem(5, this);
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

    // Apply Deck Modifiers
    if (this.selectedDeck && this.selectedDeck.apply) {
      this.selectedDeck.apply(this);
    }

    // Apply Stake Modifiers
    if (this.selectedStake.discardPenalty) {
      this.maxDiscards = Math.max(1, this.maxDiscards - this.selectedStake.discardPenalty);
      this.discardsLeft = this.maxDiscards;
    }
    if (this.selectedStake.handSizePenalty) {
      this.maxHandSize = Math.max(5, this.maxHandSize - this.selectedStake.handSizePenalty);
    }

    this.seed = this.generateSeed();
    if (this.statsManager) {
      this.statsManager.reset(this.seed);
    }

    this.setupAnteBlinds();
    this.state = GAME_STATES.BLIND_SELECT;
    if (this.saveManager) this.saveManager.saveCurrentRun(this);
    this.notify('BLIND_SELECT_ENTERED');
  }

  /**
   * Resets the game to start a fresh run
   */
  reset() {
    this.startNewRun(
      this.selectedDeck ? this.selectedDeck.id : 'deck_red',
      this.selectedStake ? this.selectedStake.id : 'stake_white'
    );
  }

  /**
   * Returns base chip target for Ante, scaling exponentially beyond Ante 8
   */
  getAnteTargetBase(ante) {
    const baseAnteTargets = [300, 800, 2000, 5000, 11000, 20000, 35000, 50000];
    if (ante <= 8) return baseAnteTargets[ante - 1] || 300;
    
    // Official Balatro exponential curve for Endless Mode (Ante 9+)
    const endlessAnteTable = {
      9: 110000,
      10: 560000,
      11: 7200000,
      12: 300000000,
      13: 47000000000,
      14: 29000000000000,
      15: 77000000000000000,
      16: 860000000000000000000
    };
    if (endlessAnteTable[ante]) return endlessAnteTable[ante];
    return Math.floor(50000 * Math.pow(1.6, ante - 8) * Math.pow(ante - 7, 3.2));
  }

  /**
   * Configures all 3 blinds for current Ante, with unique individual colors per blind and boss!
   */
  setupAnteBlinds() {
    let anteBase = this.getAnteTargetBase(this.ante);

    if (this.selectedStake && this.selectedStake.scoreMultiplier) {
      anteBase = Math.floor(anteBase * this.selectedStake.scoreMultiplier);
    }
    if (this.plasmaDeckActive) {
      anteBase = Math.floor(anteBase * 2.0);
    }

    const boss = BOSS_MODIFIERS[Math.floor(Math.random() * BOSS_MODIFIERS.length)];
    // BUG FIX #6: The Wall multiplier is 3× per Balatro wiki, not 3.5×.
    const bossTarget = boss.isWall ? Math.floor(anteBase * 3.0) : Math.floor(anteBase * 2.0);

    const getRandomTag = () => SKIP_TAGS[Math.floor(Math.random() * SKIP_TAGS.length)];

    this.anteBlinds = [
      {
        index: 0,
        type: BLIND_TYPES.SMALL,
        name: 'Small Blind',
        color: '#0072b2',
        border: '#009dff',
        badgeColor: '#0072b2',
        target: Math.floor(anteBase * 1.0),
        reward: this.selectedStake?.noSmallBlindReward ? '$0' : '$$$+',
        rewardValue: this.selectedStake?.noSmallBlindReward ? 0 : 3,
        tag: getRandomTag(),
        status: this.blindIndex === 0 ? 'active' : (this.blindIndex > 0 ? 'defeated' : 'upcoming')
      },
      {
        index: 1,
        type: BLIND_TYPES.BIG,
        name: 'Big Blind',
        color: '#8c6d1f',
        border: '#f39c12',
        badgeColor: '#8c6d1f',
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
        color: boss.color || '#8b2626',
        border: boss.border || '#e74c3c',
        badgeColor: boss.color || '#8b2626',
        target: bossTarget,
        reward: '$$$$$+',
        rewardValue: 5,
        desc: boss.desc,
        icon: boss.icon || '⚓',
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
    // BUG FIX #4 & #5: Use maxHands / maxDiscards so Grabber & Wasteful Vouchers persist.
    this.handsLeft = this.maxHands || 4;
    this.discardsLeft = (this.activeBoss && this.activeBoss.startDiscards !== undefined)
      ? this.activeBoss.startDiscards
      : (this.maxDiscards || 3);

    this.handsPlayedThisRound = [];
    this.allowedHandType = null;
    if (this.stats) this.stats.roundsPlayed++;

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
   * Properly sets isFaceDown for boss blinds (The House, The Mark, The Wheel, The Fish)
   */
  drawToHandSize() {
    while (this.hand.length < this.maxHandSize && this.deck.length > 0) {
      const card = this.deck.pop();
      card.selected = false;

      // Handle boss blinds that draw cards face-down
      if (this.activeBoss) {
        if (this.activeBoss.name === 'The House' && this.handsPlayedThisRound.length === 0) {
          card.isFaceDown = true;
        } else if (this.activeBoss.name === 'The Mark' && card.isFaceCard()) {
          card.isFaceDown = true;
        } else if (this.activeBoss.name === 'The Wheel' && Math.random() < (1 / 7)) {
          card.isFaceDown = true;
        } else if (this.activeBoss.name === 'The Fish' && this.handsPlayedThisRound.length > 0) {
          card.isFaceDown = true;
        } else {
          card.isFaceDown = false;
        }
      } else {
        card.isFaceDown = false;
      }

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

    if (this.statsManager) {
      this.statsManager.recordCardsDiscarded(selected.length);
    }

    // Trigger on_discard hooks for Jokers (e.g. Castle, Ramen, Green Joker)
    this.jokerSystem.triggerDiscardDegradation(selected, this);
    for (const joker of this.jokerSystem.getJokers()) {
      if (typeof joker.onDiscard === 'function') {
        joker.onDiscard(selected, this, joker);
      }
    }

    // BUG FIX #17 (discard path): The Serpent forces exactly 3 cards drawn after each discard.
    if (this.activeBoss && this.activeBoss.id === 'boss_serpent') {
      const _origMax = this.maxHandSize;
      this.maxHandSize = Math.min(3, this.hand.length + this.deck.length);
      this.drawToHandSize();
      this.maxHandSize = _origMax;
    } else {
      this.drawToHandSize();
    }
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

    // Check Boss Blind restrictions
    let isHandDebuffed = false;
    let debuffMessage = '';

    // The Psychic: Must play exactly 5 cards
    if (this.activeBoss && this.activeBoss.name === 'The Psychic') {
      if (selected.length !== 5) {
        isHandDebuffed = true;
        debuffMessage = 'The Psychic: Must play exactly 5 cards!';
      }
    }

    const evalResult = HandEvaluator.evaluate(selected, this.handLevels);

    // The Eye: No repeat hand types this round
    if (this.activeBoss && this.activeBoss.name === 'The Eye') {
      if (this.handsPlayedThisRound && this.handsPlayedThisRound.includes(evalResult.handName)) {
        isHandDebuffed = true;
        debuffMessage = 'The Eye: No repeat hand types allowed!';
      }
    }

    // The Mouth: Play only 1 hand type this round
    if (this.activeBoss && this.activeBoss.name === 'The Mouth') {
      if (this.allowedHandType && this.allowedHandType !== evalResult.handName) {
        isHandDebuffed = true;
        debuffMessage = `The Mouth: Only ${this.allowedHandType} allowed!`;
      } else if (!this.allowedHandType) {
        this.allowedHandType = evalResult.handName;
      }
    }

    // The Ox: Playing most played hand sets money to $0
    if (this.activeBoss && this.activeBoss.name === 'The Ox') {
      let mostPlayed = 'High Card';
      let maxP = 0;
      for (const [h, count] of Object.entries(this.stats?.handPlayCounts || {})) {
        if (count > maxP) { maxP = count; mostPlayed = h; }
      }
      if (evalResult.handName === mostPlayed) {
        this.money = 0;
        this.notify('MONEY_RESET_BY_OX');
      }
    }

    this.handsPlayedThisRound.push(evalResult.handName);
    this.handsLeft--;
    this.state = GAME_STATES.SCORING;

    // Update run statistics
    if (this.stats) {
      this.stats.cardsPlayed += selected.length;
      this.stats.handPlayCounts[evalResult.handName] = (this.stats.handPlayCounts[evalResult.handName] || 0) + 1;
    }

    let scoringResult;
    if (isHandDebuffed) {
      scoringResult = {
        handName: evalResult.handName + ' (DEBUFFED)',
        level: evalResult.level,
        chips: 0,
        mult: 0,
        totalScore: 0,
        steps: [
          { type: 'INITIAL', handName: evalResult.handName, chips: 0, mult: 0, total: 0 },
          { type: 'DEBUFF', message: debuffMessage || 'Debuffed!', chips: 0, mult: 0, total: 0 }
        ]
      };
    } else {
      const heldCards = this.hand.filter(c => !c.selected);
      const context = {
        discardsLeft: this.discardsLeft,
        handsLeft: this.handsLeft,
        money: this.money,
        heldCards,
        gameState: this,
        activeJokers: this.jokerSystem.getJokers(),
        handsPlayedThisRound: [...(this.handsPlayedThisRound || [])],
        blindsSkipped: this.stats ? (this.stats.blindsSkipped || 0) : 0,
        plasmaDeckActive: Boolean(this.plasmaDeckActive),
        roundTarget: this.roundTarget,
        roundScore: this.roundScore
      };

      scoringResult = ScoreCalculator.generateScoringSequence(
        selected,
        heldCards,
        this.jokerSystem.getJokers(),
        this.handLevels,
        context
      );
    }

    // Determine Single-Hand Overflow status (meeting or exceeding roundTarget in one hand)
    const isSingleHandOverflow = Boolean(
      scoringResult.isSingleHandOverflow ||
      (scoringResult.finalScore >= this.roundTarget && this.roundTarget > 0)
    );

    this.notify('PLAY_STARTED', {
      scoringResult,
      playedCards: selected,
      isSingleHandOverflow
    });

    return scoringResult;
  }

  /**
   * Fast synchronous preview of the current hand score for HUD and fire overflow detection
   * @returns {Object} { handName, level, chips, mult, totalScore, isSingleHandOverflow }
   */
  calculateCurrentHandPreview() {
    const selected = this.getSelectedCards();
    if (selected.length === 0) {
      return {
        handName: 'Select Cards',
        level: 1,
        chips: 0,
        mult: 0,
        totalScore: 0,
        isSingleHandOverflow: false
      };
    }
    const heldCards = this.hand.filter(c => !c.selected);
    const context = {
      discardsLeft: this.discardsLeft,
      handsLeft: this.handsLeft,
      money: this.money,
      heldCards,
      gameState: this,
      activeJokers: this.jokerSystem.getJokers(),
      handsPlayedThisRound: [...(this.handsPlayedThisRound || [])],
      blindsSkipped: this.stats ? (this.stats.blindsSkipped || 0) : 0,
      plasmaDeckActive: Boolean(this.plasmaDeckActive),
      roundTarget: this.roundTarget,
      roundScore: this.roundScore
    };
    return ScoreCalculator.preview(
      selected,
      this.jokerSystem.getJokers(),
      this.handLevels,
      context
    );
  }

  /**
   * Finalizes the played hand score into the round score
   * Called after scoring animations complete
   * @param {number} scorePoints
   */
  commitScoredPoints(scorePoints) {
    const previousRoundScore = this.roundScore;
    const isSingleHandWin = previousRoundScore === 0 && scorePoints >= this.roundTarget;
    this.roundScore += scorePoints;

    // Track best hand score
    if (this.stats) {
      if (scorePoints > this.stats.bestHandScore) {
        this.stats.bestHandScore = scorePoints;
        const lastHand = this.handsPlayedThisRound[this.handsPlayedThisRound.length - 1];
        if (lastHand) this.stats.bestHandName = lastHand;
      }
    }

    // Discard played cards
    const played = this.getSelectedCards();
    this.hand = this.hand.filter(c => !c.selected);
    for (const card of played) {
      card.selected = false;
      this.discardPile.push(card);
    }

    // Trigger onHandPlayed hooks & degradation for Jokers (Ice Cream melting, Loyalty Card, Seltzer)
    const handDegradations = this.jokerSystem.triggerHandPlayedDegradation(this);
    if (handDegradations.length > 0) {
      this.notify('JOKER_DEGRADATION', handDegradations);
    }

    // BUG FIX #16: Invoke activeBoss.onHandPlayed hook (The Arm: degrade played hand level).
    if (this.activeBoss && typeof this.activeBoss.onHandPlayed === 'function') {
      const lastHandName = this.handsPlayedThisRound[this.handsPlayedThisRound.length - 1];
      this.activeBoss.onHandPlayed(this, lastHandName);
    }

    // Boss effect for 'The Hook': Discards 2 random cards per hand played
    if (this.activeBoss && this.activeBoss.name === 'The Hook') {
      this.discardRandomCards(2);
    }

    // Check Win / Loss / Next Hand
    if (this.roundScore >= this.roundTarget) {
      this.resolveRoundWin(isSingleHandWin);
    } else if (this.handsLeft <= 0) {
      this.resolveGameOver();
    } else {
      // BUG FIX #17: The Serpent forces exactly 3 cards drawn after each hand played.
      if (this.activeBoss && this.activeBoss.id === 'boss_serpent') {
        const _origMax = this.maxHandSize;
        this.maxHandSize = Math.min(3, this.hand.length + this.deck.length);
        this.drawToHandSize();
        this.maxHandSize = _origMax;
      } else {
        this.drawToHandSize();
      }
      this.applyBossDebuffs();
      this.state = GAME_STATES.SELECTING;
      this.notify('HAND_RESOLVED');
    }
  }


  /**
   * Round passed: calculate reward money and open Shop
   */
  resolveRoundWin(isSingleHandWin = false) {
    // BUG FIX #3: Green Deck uses a completely different economy formula:
    // $2 per remaining hand + $1 per remaining discard, no interest, no base reward.
    if (this.greenDeckActive) {
      const greenHandBonus = this.handsLeft * 2;
      const greenDiscardBonus = this.discardsLeft * 1;
      const totalEarned = greenHandBonus + greenDiscardBonus;
      this.money += totalEarned;

      // Joker end-of-round bonuses still apply (e.g. Golden Joker, Rocket)
      let endRoundJokerBonus = 0;
      for (const joker of this.jokerSystem.getJokers()) {
        if (typeof joker.onRoundEnd === 'function') {
          const bonus = joker.onRoundEnd({ money: this.money });
          if (bonus && bonus.money) endRoundJokerBonus += bonus.money;
        }
      }
      this.money += endRoundJokerBonus;

      // Rental Jokers: cost -$3 per round
      let rentalCost = 0;
      for (const joker of this.jokerSystem.getJokers()) {
        if (joker.isRental) rentalCost += 3;
      }
      this.money = Math.max(0, this.money - rentalCost);

      const roundDegradations = this.jokerSystem.triggerRoundEndDegradation(this);
      if (roundDegradations.length > 0) {
        this.notify('JOKER_DEGRADATION', roundDegradations);
      }

      if (this.anteBlinds && this.anteBlinds[this.blindIndex]) {
        this.anteBlinds[this.blindIndex].status = 'defeated';
      }

      this.state = GAME_STATES.ROUND_WON;
      this.notify('ROUND_WON', {
        baseReward: 0,
        handsBonus: greenHandBonus,
        interest: 0,
        goldCardBonus: 0,
        endRoundJokerBonus,
        rentalCost,
        totalEarned,
        isSingleHandWin
      });
    } else {
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

    // Automated destruction & degradation hooks (Gros Michel extinction, Popcorn, Perishable)
    const roundDegradations = this.jokerSystem.triggerRoundEndDegradation(this);
    if (roundDegradations.length > 0) {
      this.notify('JOKER_DEGRADATION', roundDegradations);
    }

    // Rental Jokers: cost -$3 per round
    let rentalCost = 0;
    for (const joker of this.jokerSystem.getJokers()) {
      if (joker.isRental) rentalCost += 3;
    }

    const totalEarned = Math.max(0, baseReward + handsBonus + interest + goldCardBonus + endRoundJokerBonus - rentalCost);
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
      rentalCost,
      totalEarned,
      isSingleHandWin
    });
    } // end non-Green-Deck branch

    // Advance blind progression
    if (this.blindIndex < 2) {
      this.blindIndex++;
      this.syncActiveBlindInfo();
      if (this.anteBlinds[this.blindIndex]) {
        this.anteBlinds[this.blindIndex].status = 'active';
      }
    } else {
      // Defeated Boss Blind!
      if (this.anaglyphDeckActive) {
        this.applySkipTag({ name: 'Double Tag', icon: '🏷️', desc: 'Gives a copy of the next selected Tag' });
      }

      if (this.ante >= this.maxAnte && !this.endlessMode) {
        unlockablesManager.recordWin(
          this.selectedDeck ? this.selectedDeck.id : 'deck_red',
          this.selectedStake ? this.selectedStake.id : 'stake_white'
        );
        if (this.saveManager) this.saveManager.clearActiveRun();
        this.state = GAME_STATES.VICTORY;
        this.notify('GAME_VICTORY', {
          ante: this.ante,
          roundScore: this.roundScore,
          money: this.money,
          deck: this.selectedDeck,
          stake: this.selectedStake
        });
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
   * Continues run into Endless Mode with exponential Ante 9+ scaling
   */
  continueEndlessMode() {
    this.endlessMode = true;
    this.ante = 9;
    this.blindIndex = 0;
    this.voucherBoughtThisAnte = false;
    this.setupAnteBlinds();
    this.state = GAME_STATES.SHOP;
    this.shopEngine.initShopForRound();
    if (this.saveManager) this.saveManager.saveCurrentRun(this);
    this.notify('ENDLESS_MODE_STARTED');
  }

  /**
   * Reorder active Jokers in top bar
   */
  reorderJokers(fromIndex, toIndex) {
    const success = this.jokerSystem.reorderJokers(fromIndex, toIndex);
    if (success) {
      this.notify('JOKER_REORDERED');
      if (this.saveManager) this.saveManager.saveCurrentRun(this);
    }
    return success;
  }

  /**
   * Reorder active Consumables in top bar
   */
  reorderConsumables(fromIndex, toIndex) {
    const success = this.consumableSystem.reorderConsumables(fromIndex, toIndex);
    if (success) {
      this.notify('CONSUMABLE_REORDERED');
      if (this.saveManager) this.saveManager.saveCurrentRun(this);
    }
    return success;
  }

  /**
   * Continue a previously saved run from localStorage
   */
  continueSavedRun() {
    if (!this.saveManager) return false;
    const loaded = this.saveManager.loadCurrentRun(this);
    if (loaded) {
      this.notify('RUN_LOADED');
      return true;
    }
    return false;
  }

  /**
   * Skip current Small or Big Blind (earns $0 money, awards Skip Tag, advances)
   */
  skipCurrentBlind() {
    // BUG FIX #11: Skipping is only valid from the pre-round blind selection screen.
    // Previously SELECTING was also allowed, letting players skip mid-round.
    if (this.state !== GAME_STATES.BLIND_SELECT) return false;
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
   * BUG FIX #13: Restricted to SHOP phase only (authentic Balatro behaviour).
   * Previously SELECTING was also permitted, allowing mid-round selling.
   */
  sellConsumable(index) {
    if (this.state !== GAME_STATES.SHOP) {
      return false;
    }
    const item = this.consumableSystem.removeConsumable(index);
    if (item) {
      this.money += item.sellValue || 1;
      this.notify('CONSUMABLE_SOLD', item);
      return true;
    }
    return false;
  }

  /**
   * Sell an active Joker for its sell value.
   * MID-ROUND SELLING LOCKOUT: Strictly restricted to the SHOP phase via the Buy/Sell Square.
   */
  sellJoker(jokerIndex) {
    if (this.state !== GAME_STATES.SHOP) {
      return false;
    }
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
    if (this.saveManager) this.saveManager.clearActiveRun();

    let defeated = {
      name: this.blindType || 'Small Blind',
      type: this.blindType || 'Small Blind',
      icon: '❂',
      color: '#0072b2',
      border: '#54b8ff'
    };

    if (this.blindType === 'Boss Blind' || this.activeBoss) {
      defeated = {
        name: this.activeBoss ? this.activeBoss.name : 'Boss Blind',
        type: 'Boss Blind',
        boss: this.activeBoss,
        icon: this.activeBoss?.icon || '⚓',
        color: this.activeBoss?.color || '#992d22',
        border: this.activeBoss?.border || '#e74c3c'
      };
    } else if (this.blindType === 'Big Blind') {
      defeated = {
        name: 'Big Blind',
        type: 'Big Blind',
        icon: '❂',
        color: '#d48806',
        border: '#f59e0b'
      };
    }

    if (this.statsManager) {
      this.statsManager.setAnte(this.ante);
      this.statsManager.setDefeatedBy(defeated);
    }

    this.notify('GAME_OVER', {
      ante: this.ante,
      finalScore: this.roundScore,
      targetScore: this.roundTarget,
      stats: this.statsManager ? this.statsManager.getSummary({ finalScore: this.roundScore, ante: this.ante, seed: this.seed }) : this.stats,
      seed: this.seed,
      defeatedBy: defeated
    });
  }
}


