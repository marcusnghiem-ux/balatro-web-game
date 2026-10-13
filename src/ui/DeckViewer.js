/**
 * DeckViewer.js
 * Comprehensive Deck Inspector Modal for Balatro.
 * Opened by clicking the red deck pile icon in the bottom right.
 * Features:
 * - Detailed breakdown of all remaining cards in the draw pile (grouped by suit/rank)
 * - Highlights enhancements (Bonus, Mult, Wild, Glass, Steel, Gold, Stone, Lucky) and editions (Foil, Holo, Polychrome)
 * - Lists active Vouchers held in the run
 * - Displays complete stats for poker hands (current levels, base chips/mult, and times played)
 */

import { HAND_DEFINITIONS } from '../game/HandEvaluator.js';

export class DeckViewer {
  /**
   * @param {import('../game/GameEngine.js').GameEngine} game
   * @param {import('./Renderer.js').Renderer} renderer
   */
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;
    this.modalEl = null;
    this.initModalDom();
  }

  initModalDom() {
    let el = document.getElementById('deck-viewer-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'deck-viewer-modal';
      el.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-3 sm:p-5 select-none';
      document.body.appendChild(el);
    }
    this.modalEl = el;

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });
  }

  show() {
    if (!this.modalEl) return;

    const remainingCards = [...(this.game.deck || [])].sort((a, b) => {
      if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
      return b.order - a.order;
    });

    const vouchers = this.game.activeVouchers || [];
    const handLevels = this.game.handLevels || {};
    const handPlayCounts = (this.game.stats && this.game.stats.handPlayCounts) || {};

    const suitCounts = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
    for (const c of remainingCards) {
      if (suitCounts[c.suit] !== undefined) suitCounts[c.suit]++;
    }

    this.modalEl.innerHTML = `
      <div class="deck-viewer-dialog max-w-4xl w-full bg-[#1b252b] border-4 border-[#e5a024] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-hidden my-auto text-white">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-slate-700/80 pb-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🎴</span>
            <div>
              <h2 class="font-pixel text-4xl text-[#f0ad28] tracking-wider leading-none">FULL DECK VIEW</h2>
              <span class="text-xs text-slate-400 font-bold">Remaining in Draw Pile: ${remainingCards.length} Cards</span>
            </div>
          </div>
          <button id="close-deck-viewer-btn" class="text-slate-400 hover:text-white font-bold text-3xl px-2 cursor-pointer transition">✕</button>
        </div>

        <!-- Quick Filter / Summary Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
          <div class="bg-[#141d22] border border-slate-700 p-2 rounded-xl flex items-center justify-between px-3">
            <span class="text-red-400 text-lg">♥ Hearts</span>
            <span class="font-pixel text-2xl text-white font-bold">${suitCounts.hearts}</span>
          </div>
          <div class="bg-[#141d22] border border-slate-700 p-2 rounded-xl flex items-center justify-between px-3">
            <span class="text-amber-400 text-lg">♦ Diamonds</span>
            <span class="font-pixel text-2xl text-white font-bold">${suitCounts.diamonds}</span>
          </div>
          <div class="bg-[#141d22] border border-slate-700 p-2 rounded-xl flex items-center justify-between px-3">
            <span class="text-emerald-400 text-lg">♣ Clubs</span>
            <span class="font-pixel text-2xl text-white font-bold">${suitCounts.clubs}</span>
          </div>
          <div class="bg-[#141d22] border border-slate-700 p-2 rounded-xl flex items-center justify-between px-3">
            <span class="text-blue-400 text-lg">♠ Spades</span>
            <span class="font-pixel text-2xl text-white font-bold">${suitCounts.spades}</span>
          </div>
        </div>

        <!-- Scrollable Content: 2 Columns (Left: Remaining Cards Grid, Right: Vouchers & Poker Hand Stats) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-1 min-h-[300px]">
          
          <!-- Left Column (Span 2): Draw Pile Cards -->
          <div class="lg:col-span-2 flex flex-col gap-2">
            <span class="text-xs font-black uppercase tracking-wider text-amber-300">Remaining Cards (${remainingCards.length})</span>
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2 bg-[#141d22] border border-slate-700/80 rounded-2xl min-h-[220px]">
              ${remainingCards.map(c => this.renderMiniCard(c)).join('')}
            </div>
          </div>

          <!-- Right Column: Vouchers & Hand Stats -->
          <div class="flex flex-col gap-3">
            <!-- Active Vouchers -->
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-black uppercase tracking-wider text-amber-300">Active Vouchers (${vouchers.length})</span>
              <div class="bg-[#141d22] border border-slate-700/80 rounded-2xl p-2.5 flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                ${vouchers.length === 0 ? '<span class="text-xs text-slate-500 italic p-1">No vouchers purchased yet.</span>' : ''}
                ${vouchers.map(v => `
                  <div class="flex items-center gap-2 p-1.5 bg-[#1b252b] border border-slate-700 rounded-xl">
                    <span class="text-xl">${v.icon || '🎟️'}</span>
                    <div class="flex flex-col leading-tight truncate">
                      <span class="font-pixel text-base text-amber-300 font-bold truncate">${v.name}</span>
                      <span class="text-[9px] text-slate-400 truncate">${v.description}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Poker Hand Levels -->
            <div class="flex flex-col gap-1.5 flex-1">
              <span class="text-xs font-black uppercase tracking-wider text-amber-300">Poker Hand Levels</span>
              <div class="bg-[#141d22] border border-slate-700/80 rounded-2xl p-2 flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
                ${Object.entries(HAND_DEFINITIONS).map(([name, def]) => {
                  const lvl = handLevels[name] || 1;
                  const plays = handPlayCounts[name] || 0;
                  const curChips = def.baseChips + (lvl - 1) * def.levelChips;
                  const curMult = def.baseMult + (lvl - 1) * def.levelMult;
                  return `
                    <div class="flex justify-between items-center px-2 py-1 bg-[#1b252b] border border-slate-700/60 rounded-xl text-xs">
                      <div class="flex flex-col leading-tight">
                        <span class="font-bold text-white">${name} <span class="text-[10px] text-slate-400">lvl.${lvl}</span></span>
                        <span class="text-[9px] text-slate-500">Played: ${plays} times</span>
                      </div>
                      <div class="flex items-center gap-1 font-pixel text-base">
                        <span class="text-[#009dff]">${curChips}</span>
                        <span class="text-slate-400">×</span>
                        <span class="text-[#fe5f55]">${curMult}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    this.modalEl.classList.remove('hidden');

    const closeBtn = document.getElementById('close-deck-viewer-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  renderMiniCard(card) {
    const suitSymbol = card.getSuitSymbol();
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitColor = isRed ? '#fe5f55' : '#009dff';
    const edBadge = card.edition && card.edition !== 'normal' ? `<span class="text-[7px] text-amber-300 font-bold uppercase">${card.edition.slice(0, 4)}</span>` : '';
    const enhBadge = card.enhancement && card.enhancement !== 'none' ? `<span class="text-[7px] text-purple-300 font-bold uppercase">${card.enhancement.slice(0, 4)}</span>` : '';

    return `
      <div class="mini-card bg-white text-slate-900 rounded-lg p-1 flex flex-col items-center justify-between border-2 border-slate-300 shadow min-h-[54px] select-none ${card.edition !== 'normal' ? 'ring-1 ring-amber-400' : ''}">
        <div class="flex items-center justify-between w-full leading-none">
          <span class="font-black text-xs" style="color: ${suitColor};">${card.rank}</span>
          <span class="text-[10px]" style="color: ${suitColor};">${suitSymbol}</span>
        </div>
        <div class="flex flex-col items-center leading-none">
          ${edBadge}
          ${enhBadge}
        </div>
        <div class="leading-none text-[8px] font-bold text-slate-500">
          +${card.baseChips}
        </div>
      </div>
    `;
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }
}
