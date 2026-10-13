/**
 * RunInfoModal.js
 * Lead UI/UX Engineer implementation of authentic Balatro Run Info Modal.
 * Matches reference screenshots 20261012_133112_HDR.jpg and 20261012_133118_HDR.jpg:
 *
 * 1. TAB NAVIGATION & ARCHITECTURE:
 *    - Left: Vertical bright arcade orange "Back" action bar.
 *    - Center: Dark slate/charcoal console box with rounded arcade borders.
 *    - Right: 4 vertically stacked crimson red tabs (Poker Hands, Blinds, Vouchers, Stake)
 *      with active indicator triangle arrow.
 *
 * 2. POKER HANDS TAB PARITY:
 *    - Lists all 9 poker hands in authentic order (Straight Flush down to High Card).
 *    - Level pill (`lvl. 1`), hand name, dual score capsule (`[Chips] ✕ [Mult]`),
 *      and usage counter (`# 0`).
 *    - Real-time reactivity when Planet cards upgrade hand levels.
 *
 * 3. STAKE & MODIFIERS TAB PARITY:
 *    - Displays active Stake card with casino chip icon, title, and rule description.
 *    - "Also applied" panel listing all cumulative previous stake constraints with
 *      color-coded status dots (green, red, etc.).
 */

import { handLevelManager } from '../game/HandLevelManager.js';
import { STAKES } from '../game/DeckDefinitions.js';

export const STAKE_RULES = [
  {
    index: 0,
    id: 'stake_white',
    name: 'White Stake',
    color: '#ecf0f1',
    dotColor: '#ffffff',
    ruleText: 'Base Difficulty',
    highlightWords: ['Base Difficulty'],
    subText: 'Default gameplay rules'
  },
  {
    index: 1,
    id: 'stake_red',
    name: 'Red Stake',
    color: '#e74c3c',
    dotColor: '#ef4444',
    ruleText: 'Small Blind gives no reward money',
    highlightWords: ['Small Blind'],
    subText: 'Defeating Small Blind yields $0 cash'
  },
  {
    index: 2,
    id: 'stake_green',
    name: 'Green Stake',
    color: '#2ecc71',
    dotColor: '#22c55e',
    ruleText: 'Required score scales faster for each Ante',
    highlightWords: ['Ante'],
    subText: 'Blind target multipliers increase more aggressively'
  },
  {
    index: 3,
    id: 'stake_black',
    name: 'Black Stake',
    color: '#2c3e50',
    dotColor: '#475569',
    ruleText: 'Shop can have Eternal Jokers',
    highlightWords: ['Eternal Jokers'],
    subText: "(Can't be sold or destroyed)"
  },
  {
    index: 4,
    id: 'stake_blue',
    name: 'Blue Stake',
    color: '#3498db',
    dotColor: '#3b82f6',
    ruleText: '-1 Discard per round',
    highlightWords: ['-1 Discard'],
    subText: 'Starts with 1 fewer discard each round'
  },
  {
    index: 5,
    id: 'stake_purple',
    name: 'Purple Stake',
    color: '#9b59b6',
    dotColor: '#a855f7',
    ruleText: 'Required score scales even faster',
    highlightWords: ['scales even faster'],
    subText: 'Further amplifies Ante scaling targets'
  },
  {
    index: 6,
    id: 'stake_orange',
    name: 'Orange Stake',
    color: '#e67e22',
    dotColor: '#f97316',
    ruleText: 'Booster Packs cost $1 more per Ante',
    highlightWords: ['Booster Packs'],
    subText: 'Pack costs inflate by +$1 each Ante passed'
  },
  {
    index: 7,
    id: 'stake_gold',
    name: 'Gold Stake',
    color: '#f1c40f',
    dotColor: '#eab308',
    ruleText: '-1 Hand size',
    highlightWords: ['-1 Hand size'],
    subText: 'Player hand capacity reduced by 1 card'
  }
];

export class RunInfoModal {
  /**
   * @param {import('../game/GameEngine.js').GameEngine} game
   * @param {import('./Renderer.js').Renderer} renderer
   */
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;

    this.modalEl = document.getElementById('run-info-modal');
    this.activeTab = 'poker_hands'; // 'poker_hands' | 'blinds' | 'vouchers' | 'stake'

    // Synchronize hand level manager
    handLevelManager.attachGame(this.game);

    this.init();
  }

  init() {
    if (!this.modalEl) return;

    // Background overlay click to close
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    // Escape key to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modalEl.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  /**
   * Shows the modal and renders active tab content
   * @param {string} [initialTab='poker_hands']
   */
  show(initialTab = null) {
    if (!this.modalEl) return;

    if (initialTab) {
      this.activeTab = initialTab;
    }

    handLevelManager.attachGame(this.game);
    this.renderModalStructure();

    this.modalEl.classList.remove('hidden');
    if (this.renderer && typeof this.renderer.playSound === 'function') {
      this.renderer.playSound('card_slide');
    }
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
    if (this.renderer && typeof this.renderer.playSound === 'function') {
      this.renderer.playSound('card_slide');
    }
  }

  /**
   * Builds the entire 3-part layout:
   * [Left Orange Back Bar] [Center Dark Slate Console] [Right 4 Stacked Red Tabs]
   */
  renderModalStructure() {
    this.modalEl.innerHTML = `
      <div class="run-info-wrapper flex items-stretch max-w-4xl w-full h-[580px] max-h-[92vh] select-none filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] animate-fade-in">
        
        <!-- 1. LEFT ORANGE ACTION BAR ("Back" Button) -->
        <button id="run-info-back-bar-btn"
                class="run-info-back-bar shrink-0 w-16 sm:w-20 bg-gradient-to-b from-[#f59e0b] via-[#ea580c] to-[#d97706] hover:brightness-110 active:brightness-95 border-3 border-r-0 border-[#fef08a] rounded-l-3xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-xl group">
          <div class="flex flex-col items-center gap-2 transform -rotate-90 sm:rotate-0">
            <span class="text-xl sm:text-2xl text-slate-950 font-black group-hover:-translate-x-1 transition-transform">◀</span>
            <span class="font-pixel text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
              Back
            </span>
          </div>
        </button>

        <!-- 2. CENTER DARK SLATE ARCADE CONSOLE -->
        <div class="run-info-console flex-1 bg-[#1c2628] border-3 border-[#37474a] flex flex-col justify-between p-3.5 sm:p-5 relative overflow-hidden shadow-2xl">
          
          <!-- Tab Body Content -->
          <div id="run-info-tab-content" class="flex-1 flex flex-col overflow-y-auto pr-1">
            ${this.renderActiveTabContent()}
          </div>

          <!-- Bottom Footer Info -->
          <div class="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-pixel">
            <span class="text-amber-300">Ante ${this.game?.ante || 1}/8</span>
            <span class="text-slate-500 uppercase tracking-wider">Balatro Run Database</span>
            <span class="text-[#009dff]">$${this.game?.money || 0}</span>
          </div>
        </div>

        <!-- 3. RIGHT 4 VERTICALLY STACKED RED TABS -->
        <div class="run-info-tabs-column shrink-0 flex flex-col justify-start gap-2.5 py-4 -ml-0.5">
          ${this.renderTabButtonsHtml()}
        </div>

      </div>
    `;

    this.bindInternalEvents();
  }

  /**
   * Generates HTML for the 4 interactive vertical tabs
   */
  renderTabButtonsHtml() {
    const tabs = [
      { id: 'poker_hands', label: 'Poker Hands' },
      { id: 'blinds',      label: 'Blinds' },
      { id: 'vouchers',    label: 'Vouchers' },
      { id: 'stake',       label: 'Stake' }
    ];

    return tabs.map(t => {
      const isActive = this.activeTab === t.id;
      return `
        <button class="run-info-tab-btn relative px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-r-2xl border-2 border-l-0 transition-all cursor-pointer font-pixel text-xs sm:text-sm uppercase font-bold tracking-wider text-left flex items-center ${
          isActive
            ? 'active-tab bg-[#ff4d40] border-[#ff9d94] text-white shadow-[0_0_15px_rgba(254,95,85,0.7)] translate-x-1.5 z-10'
            : 'bg-[#b91c1c] hover:bg-[#dc2626] border-[#ef4444]/60 text-white/80'
        }" data-tab="${t.id}">
          ${isActive ? '<span class="active-arrow text-amber-300 font-black mr-1 sm:mr-1.5 text-sm">◀</span>' : ''}
          <span class="truncate">${t.label}</span>
        </button>
      `;
    }).join('');
  }

  /**
   * Dispatches active tab content generator
   */
  renderActiveTabContent() {
    switch (this.activeTab) {
      case 'poker_hands':
        return this.renderPokerHandsTab();
      case 'blinds':
        return this.renderBlindsTab();
      case 'vouchers':
        return this.renderVouchersTab();
      case 'stake':
        return this.renderStakeTab();
      default:
        return this.renderPokerHandsTab();
    }
  }

  /**
   * TAB 1: POKER HANDS (Exact match to reference photo 20261012_133112_HDR.jpg)
   * Displays every poker hand row with level pill, hand name, dual chip/mult readout, and usage counter.
   */
  renderPokerHandsTab() {
    const hands = handLevelManager.getAllHandsList();

    return `
      <div class="flex flex-col gap-1.5 sm:gap-2 my-auto">
        ${hands.map(hand => {
          const isUpgraded = hand.level > 1;
          return `
            <div class="run-info-hand-row bg-[#d1d5db] hover:bg-[#e2e8f0] transition-colors rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between text-slate-900 border border-slate-300/80 shadow-sm">
              
              <!-- 1. Left Level Badge (White Capsule Pill) -->
              <div class="shrink-0 bg-white text-slate-900 font-pixel text-xs sm:text-sm font-black px-2.5 sm:px-3 py-0.5 rounded-full border border-slate-300 shadow-inner flex items-center justify-center min-w-[54px]">
                <span class="${isUpgraded ? 'text-amber-600 font-black' : ''}">lvl.${hand.level}</span>
              </div>

              <!-- 2. Hand Title (Center Bold Sans) -->
              <div class="flex-1 px-2 text-center truncate font-sans font-black text-xs sm:text-base text-slate-900 tracking-tight">
                ${hand.handName}
              </div>

              <!-- 3. Dual Chips x Mult Score Readout -->
              <div class="shrink-0 flex items-center gap-1 font-pixel text-sm sm:text-base">
                <div class="bg-[#009dff] text-white font-black px-2.5 sm:px-3.5 py-0.5 rounded-full border border-[#54b8ff] shadow min-w-[42px] sm:min-w-[50px] text-center leading-none">
                  ${hand.chips}
                </div>
                <span class="text-[#fe5f55] font-black text-xs sm:text-sm px-0.5 leading-none">✕</span>
                <div class="bg-[#fe5f55] text-white font-black px-2.5 sm:px-3.5 py-0.5 rounded-full border border-[#ff8d85] shadow min-w-[32px] sm:min-w-[40px] text-center leading-none">
                  ${hand.mult}
                </div>
              </div>

              <!-- 4. Right Usage Counter Badge (Dark Capsule Pill) -->
              <div class="shrink-0 ml-1.5 sm:ml-2.5 bg-[#1e293b] text-slate-100 font-pixel text-xs sm:text-sm px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-700 shadow-inner min-w-[38px] justify-center">
                <span class="text-slate-400 font-sans text-[10px] font-bold">#</span>
                <span class="font-bold ${hand.timesPlayed > 0 ? 'text-amber-300' : 'text-slate-200'}">${hand.timesPlayed}</span>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * TAB 2: BLINDS
   * Displays the Ante overview with 3 column cards (Small, Big, Boss).
   */
  renderBlindsTab() {
    const ante = this.game?.ante || 1;
    const anteBlinds = this.game?.anteBlinds || [
      { name: 'Small Blind', target: 300, reward: 3, status: 'active' },
      { name: 'Big Blind', target: 450, reward: 4, status: 'upcoming' },
      { name: 'Boss Blind', target: 600, reward: 5, status: 'upcoming' }
    ];

    const boss = this.game?.activeBoss || {
      name: 'The Hook',
      icon: '⚓',
      desc: 'Discards 2 random cards per hand played'
    };

    return `
      <div class="flex flex-col gap-3 my-auto">
        <div class="text-center font-pixel text-xl sm:text-2xl text-amber-300 mb-1">
          ANTE ${ante} BLIND SCHEDULE
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <!-- Small Blind -->
          <div class="bg-[#12181a] border-2 border-[#304044] rounded-2xl p-3 flex flex-col justify-between items-center text-center shadow-lg">
            <div class="font-pixel text-lg text-amber-400 uppercase font-bold">Small Blind</div>
            <div class="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl my-2">❂</div>
            <div class="text-xs text-slate-400 uppercase font-black">Score at least</div>
            <div class="font-pixel text-2xl text-[#fe5f55] font-black">${anteBlinds[0]?.target?.toLocaleString() || 300}</div>
            <div class="text-xs text-emerald-400 font-bold mt-1">Reward: $$$</div>
            <span class="text-[10px] font-bold uppercase mt-2 px-2 py-0.5 rounded ${anteBlinds[0]?.status === 'defeated' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-300'}">
              ${anteBlinds[0]?.status || 'Active'}
            </span>
          </div>

          <!-- Big Blind -->
          <div class="bg-[#12181a] border-2 border-[#304044] rounded-2xl p-3 flex flex-col justify-between items-center text-center shadow-lg">
            <div class="font-pixel text-lg text-amber-300 uppercase font-bold">Big Blind</div>
            <div class="w-12 h-12 rounded-full bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center text-2xl my-2">❂</div>
            <div class="text-xs text-slate-400 uppercase font-black">Score at least</div>
            <div class="font-pixel text-2xl text-[#fe5f55] font-black">${anteBlinds[1]?.target?.toLocaleString() || 450}</div>
            <div class="text-xs text-emerald-400 font-bold mt-1">Reward: $$$$</div>
            <span class="text-[10px] font-bold uppercase mt-2 px-2 py-0.5 rounded ${anteBlinds[1]?.status === 'defeated' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-300'}">
              ${anteBlinds[1]?.status || 'Upcoming'}
            </span>
          </div>

          <!-- Boss Blind -->
          <div class="bg-[#1a1215] border-2 border-[#8b2626] rounded-2xl p-3 flex flex-col justify-between items-center text-center shadow-lg">
            <div class="font-pixel text-lg text-red-400 uppercase font-bold truncate w-full">${boss.name}</div>
            <div class="w-12 h-12 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-2xl my-2">${boss.icon}</div>
            <div class="text-[11px] text-slate-300 font-bold leading-tight px-1 min-h-[32px] flex items-center">${boss.desc}</div>
            <div class="font-pixel text-2xl text-[#fe5f55] font-black mt-1">${anteBlinds[2]?.target?.toLocaleString() || 600}</div>
            <div class="text-xs text-emerald-400 font-bold mt-0.5">Reward: $$$$$</div>
            <span class="text-[10px] font-bold uppercase mt-2 px-2 py-0.5 rounded ${anteBlinds[2]?.status === 'defeated' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}">
              ${anteBlinds[2]?.status || 'Upcoming'}
            </span>
          </div>

        </div>
      </div>
    `;
  }

  /**
   * TAB 3: VOUCHERS
   * Displays all active run Vouchers redeemed from the Shop.
   */
  renderVouchersTab() {
    const vouchers = this.game?.activeVouchers || [];

    if (vouchers.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center text-center my-auto p-6 gap-3">
          <div class="text-5xl opacity-40">🎟️</div>
          <h3 class="font-pixel text-2xl text-amber-300">No Vouchers Redeemed Yet</h3>
          <p class="text-xs text-slate-400 max-w-md font-medium">
            Vouchers are permanent passive game buffs available in the Shop after clearing each round.
            They provide persistent upgrades such as extra hands, discards, and shop discounts.
          </p>
        </div>
      `;
    }

    return `
      <div class="flex flex-col gap-2 my-auto">
        <h3 class="font-pixel text-xl text-amber-300 text-center mb-1">Active Run Vouchers</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${vouchers.map(v => `
            <div class="bg-[#12181a] border border-amber-500/40 rounded-xl p-3 flex items-center gap-3 shadow">
              <span class="text-3xl">🎟️</span>
              <div class="flex flex-col">
                <span class="font-pixel text-lg text-amber-300">${v.name || v}</span>
                <span class="text-xs text-slate-300 font-medium">${v.desc || 'Permanent run modifier active'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * TAB 4: STAKE & MODIFIERS (Exact match to reference photo 20261012_133118_HDR.jpg)
   * Displays the current active Stake card with casino chip, rule description,
   * and the "Also applied" panel with color-coded status dots (red, green, etc.).
   */
  renderStakeTab() {
    // Current active stake index (default: Black Stake [index 3] matching screenshot, or selected stake)
    let stakeIndex = 3;
    if (this.game && typeof this.game.stakeIndex === 'number') {
      stakeIndex = this.game.stakeIndex;
    } else if (this.game && this.game.currentStake && typeof this.game.currentStake.index === 'number') {
      stakeIndex = this.game.currentStake.index;
    }

    const currentRule = STAKE_RULES[stakeIndex] || STAKE_RULES[3];
    const previousRules = STAKE_RULES.slice(1, stakeIndex).reverse(); // Modifiers applied from earlier stakes

    return `
      <div class="flex flex-col items-center justify-center my-auto gap-4 px-2">
        
        <!-- Main Active Stake Card (Centered rounded arcade panel) -->
        <div class="run-info-stake-main-card bg-[#11181c] border-2 border-[#263539] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 max-w-lg w-full shadow-2xl">
          
          <!-- Left: Modifier Rule Text -->
          <div class="flex flex-col justify-center flex-1">
            <div class="font-sans font-black text-sm sm:text-base text-slate-100 leading-tight">
              ${this.highlightKeywords(currentRule.ruleText, currentRule.highlightWords)}
            </div>
            ${currentRule.subText ? `
              <span class="text-slate-400 font-bold text-xs mt-0.5">
                ${currentRule.subText}
              </span>
            ` : ''}
          </div>

          <!-- Right: Visual Casino Chip & Title -->
          <div class="flex items-center gap-2.5 shrink-0">
            <div class="font-pixel text-xl sm:text-2xl text-white font-bold tracking-wide">
              ${currentRule.name}
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              ${this.generateStakeChipSvg(currentRule)}
            </div>
          </div>

        </div>

        <!-- "Also applied" Panel (Previous Stakes Cumulative Modifiers with Status Dots) -->
        ${previousRules.length > 0 ? `
          <div class="flex flex-col items-center gap-2 max-w-lg w-full">
            <div class="text-slate-400 font-pixel text-xs sm:text-sm uppercase tracking-wider text-center">
              Also applied
            </div>

            <!-- Horizontal / Grid Stack of Cumulative Modifier Cards -->
            <div class="grid grid-cols-${Math.min(3, previousRules.length)} gap-2.5 w-full">
              ${previousRules.map(rule => `
                <div class="bg-[#faf8f5] text-slate-900 rounded-xl p-2.5 flex flex-col items-center text-center justify-between min-h-[95px] border border-slate-300 shadow-md">
                  
                  <!-- Color-Coded Status Dot (Top) -->
                  <div class="w-3.5 h-3.5 rounded-full shadow-md mb-1.5"
                       style="background-color: ${rule.dotColor}; border: 1.5px solid rgba(0,0,0,0.25);">
                  </div>

                  <!-- Modifier Text with Gold/Amber Highlights -->
                  <div class="font-sans font-black text-[11px] sm:text-xs leading-tight text-slate-900 my-auto">
                    ${this.highlightKeywords(rule.ruleText, rule.highlightWords)}
                  </div>

                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="text-slate-400 font-pixel text-xs text-center">
            White Stake is the base difficulty. No additional modifiers applied.
          </div>
        `}

      </div>
    `;
  }

  /**
   * Highlights target keywords with authentic Balatro gold text styling
   */
  highlightKeywords(text, keywords = []) {
    let result = text;
    keywords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      result = result.replace(regex, '<span class="text-[#f59e0b] font-black">$1</span>');
    });
    return result;
  }

  /**
   * Generates authentic casino chip SVG for the stake icon
   */
  generateStakeChipSvg(rule) {
    const color = rule.color || '#2c3e50';
    const isBlack = rule.id === 'stake_black';
    const isGold = rule.id === 'stake_gold';
    const stripeColor = isBlack ? '#f59e0b' : '#ffffff';

    return `
      <svg class="w-full h-full" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6));">
        <circle cx="22" cy="22" r="21" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
        <g stroke="${stripeColor}" stroke-width="3" stroke-linecap="round" opacity="0.9">
          <line x1="22" y1="1.5" x2="22" y2="5.5" />
          <line x1="22" y1="38.5" x2="22" y2="42.5" />
          <line x1="1.5" y1="22" x2="5.5" y2="22" />
          <line x1="38.5" y1="22" x2="42.5" y2="22" />
        </g>
        <circle cx="22" cy="22" r="14" fill="none" stroke="#ffffff" stroke-dasharray="2 2" stroke-width="0.8" opacity="0.6"/>
        <circle cx="22" cy="22" r="10" fill="#0f172a" stroke="${stripeColor}" stroke-width="1.2" />
        <text x="22" y="26" font-size="11" font-weight="900" fill="${isGold ? '#fef08a' : '#ffffff'}" text-anchor="middle" font-family="'Courier New', monospace">❂</text>
      </svg>
    `;
  }

  /**
   * Binds event listeners inside the freshly rendered modal
   */
  bindInternalEvents() {
    // Left Back Button Bar
    const backBtn = this.modalEl.querySelector('#run-info-back-bar-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.hide());
    }

    // Right Tab Buttons
    const tabBtns = this.modalEl.querySelectorAll('.run-info-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        if (targetTab && targetTab !== this.activeTab) {
          this.activeTab = targetTab;
          if (this.renderer && typeof this.renderer.playSound === 'function') {
            this.renderer.playSound('card_select');
          }
          this.renderModalStructure();
        }
      });
    });
  }
}
