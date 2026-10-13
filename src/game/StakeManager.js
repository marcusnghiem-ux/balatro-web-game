/**
 * StakeManager.js
 * Manages difficulty stake progression (8 official Balatro Stakes) per deck,
 * visual status dots, procedural casino chip rendering, array clamping/bounds logic,
 * and persistent unlock tracking.
 */

import { STAKES } from './DeckDefinitions.js';

const STORAGE_KEY = 'balatro_deck_stake_progress';

export class StakeManager {
  constructor() {
    this.stakes = STAKES;
    this.progress = this.loadProgress();
    this.selectedStakeIndex = 0;
  }

  loadProgress() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('StakeManager: Failed to read from localStorage', e);
    }
    // Default: Red Deck has White Stake unlocked; all decks start with White Stake (index 0)
    return {
      deck_red: 0
    };
  }

  saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('StakeManager: Failed to write to localStorage', e);
    }
  }

  /**
   * Check if a stake index (0-7) is unlocked for a given deck
   */
  isStakeUnlocked(deckId, stakeIndex) {
    if (stakeIndex === 0) return true; // White stake is always unlocked
    const maxUnlocked = (this.progress && this.progress[deckId] !== undefined)
      ? this.progress[deckId]
      : 0;
    return stakeIndex <= maxUnlocked;
  }

  /**
   * Return the highest unlocked stake index (0-7) for a deck
   */
  getMaxUnlockedIndex(deckId) {
    if (!this.progress || this.progress[deckId] === undefined) return 0;
    return Math.max(0, Math.min(7, this.progress[deckId]));
  }

  /**
   * Record a win on a stake for a deck, unlocking the next stake
   */
  recordWin(deckId, stakeIndex) {
    const cur = (this.progress && this.progress[deckId] !== undefined)
      ? this.progress[deckId]
      : 0;
    if (stakeIndex >= cur && stakeIndex < 7) {
      this.progress[deckId] = stakeIndex + 1;
      this.saveProgress();
      return true;
    }
    return false;
  }

  /**
   * Clamps an index safely between 0 and 7
   */
  clampIndex(index) {
    if (typeof index !== 'number' || isNaN(index)) return 0;
    return Math.max(0, Math.min(index, this.stakes.length - 1));
  }

  /**
   * Get previous stake index with bounds clamping or safe wrapping
   * Default: bounds clamping (stops at 0)
   */
  getPrevIndex(currentIndex, allowWrap = false) {
    const clamped = this.clampIndex(currentIndex);
    if (allowWrap) {
      return (clamped - 1 + this.stakes.length) % this.stakes.length;
    }
    return Math.max(0, clamped - 1);
  }

  /**
   * Get next stake index with bounds clamping or safe wrapping
   * Default: bounds clamping (stops at 7)
   */
  getNextIndex(currentIndex, allowWrap = false) {
    const clamped = this.clampIndex(currentIndex);
    if (allowWrap) {
      return (clamped + 1) % this.stakes.length;
    }
    return Math.min(this.stakes.length - 1, clamped + 1);
  }

  /**
   * Cleanly cycles backward through the 8 distinct difficulty stakes
   */
  cyclePrev(currentIndex) {
    const clamped = this.clampIndex(currentIndex);
    return (clamped - 1 + this.stakes.length) % this.stakes.length;
  }

  /**
   * Cleanly cycles forward through the 8 distinct difficulty stakes
   */
  cycleNext(currentIndex) {
    const clamped = this.clampIndex(currentIndex);
    return (clamped + 1) % this.stakes.length;
  }

  /**
   * Bounds check helpers
   */
  canGoPrev(currentIndex) {
    return this.clampIndex(currentIndex) > 0;
  }

  canGoNext(currentIndex) {
    return this.clampIndex(currentIndex) < this.stakes.length - 1;
  }

  getStakeByIndex(index) {
    const clamped = this.clampIndex(index);
    return this.stakes[clamped] || this.stakes[0];
  }

  getStakeCount() {
    return this.stakes.length;
  }

  getStakes() {
    return this.stakes;
  }

  /**
   * Generates a high-fidelity, authentic Balatro poker chip SVG
   * Displays distinct stake colors, casino radial edge stripes, inner circular groove,
   * center insignia, and a frosted lock badge when locked.
   */
  generateChipSvg(stake, isUnlocked = true) {
    const color = stake ? (stake.color || '#ecf0f1') : '#ecf0f1';
    // BUG FIX #15: Guard stake.id — was accessed raw in SVG template, throwing TypeError when stake=null.
    const stakeId = stake ? (stake.id || 'default') : 'default';
    const isGold = stake && stake.id === 'stake_gold';
    const isBlack = stake && stake.id === 'stake_black';
    const isWhite = stake && stake.id === 'stake_white';

    // Stripe colors contrasting with chip body
    const stripeColor = isWhite ? '#94a3b8' : (isBlack ? '#f59e0b' : '#ffffff');
    const centerIcon = isGold ? '👑' : '❂';

    return `
      <svg class="w-full h-full" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));">
        <defs>
          <radialGradient id="chip-grad-${stakeId}" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
            <stop offset="60%" stop-color="${color}"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
          </radialGradient>
        </defs>
        <!-- Outer Chip Body -->
        <circle cx="22" cy="22" r="21" fill="url(#chip-grad-${stakeId})" stroke="#0f172a" stroke-width="1.5"/>
        
        <!-- Edge Casino Notches (8 Radial Stripes) -->
        <g stroke="${stripeColor}" stroke-width="3" stroke-linecap="round" opacity="0.9">
          <line x1="22" y1="1.5" x2="22" y2="5.5" />
          <line x1="22" y1="38.5" x2="22" y2="42.5" />
          <line x1="1.5" y1="22" x2="5.5" y2="22" />
          <line x1="38.5" y1="22" x2="42.5" y2="22" />
          <line x1="7.5" y1="7.5" x2="10.5" y2="10.5" />
          <line x1="33.5" y1="33.5" x2="36.5" y2="36.5" />
          <line x1="7.5" y1="36.5" x2="10.5" y2="33.5" />
          <line x1="33.5" y1="10.5" x2="36.5" y2="7.5" />
        </g>

        <!-- Inner Groove Ring -->
        <circle cx="22" cy="22" r="15" fill="none" stroke="#ffffff" stroke-dasharray="2 2" stroke-width="0.8" opacity="0.6"/>

        <!-- Center Inset Ring -->
        <circle cx="22" cy="22" r="11" fill="${isWhite ? '#f1f5f9' : '#0f172a'}" stroke="${stripeColor}" stroke-width="1.2" />

        <!-- Center Insignia / Symbol -->
        <text x="22" y="${isGold ? '25' : '26'}" font-size="${isGold ? '11' : '13'}" font-weight="900" fill="${isWhite ? '#0f172a' : (isGold ? '#fef08a' : '#ffffff')}" text-anchor="middle" font-family="'Courier New', monospace">${centerIcon}</text>

        ${!isUnlocked ? `
          <!-- Frosted Dark Overlay for Locked Stakes -->
          <circle cx="22" cy="22" r="21" fill="#090d16" fill-opacity="0.65" />
          <rect x="14" y="14" width="16" height="16" rx="4" fill="#1e293b" fill-opacity="0.9" stroke="#f59e0b" stroke-width="1"/>
          <text x="22" y="26" font-size="10" text-anchor="middle">🔒</text>
        ` : ''}
      </svg>
    `;
  }

  /**
   * Generates HTML for the 8 visual status dots for the current deck and selected stake
   * Lightly shaded/hollow for unlocked/playable stakes, darkly shaded/solid with lock icons for locked stakes.
   * Both unlocked and locked states dynamically render an active focus halo when selected.
   */
  generateStatusDotsHtml(deckId, selectedStakeIndex) {
    const maxUnlocked = (this.progress && this.progress[deckId] !== undefined)
      ? this.progress[deckId]
      : 0;

    return Array.from({ length: 8 }, (_, i) => {
      const isUnlocked = i <= maxUnlocked;
      const isSelected = i === selectedStakeIndex;
      const stake = this.stakes[i];
      const color = stake ? stake.color : '#ecf0f1';

      if (isUnlocked) {
        // Lightly shaded / hollow border for unlocked/playable stakes
        const activeGlow = isSelected
          ? `box-shadow: 0 0 10px #ffffff, 0 0 14px ${color}; transform: scale(1.35); border: 2.5px solid #ffffff;`
          : 'border: 1.5px solid rgba(255,255,255,0.75); opacity: 0.85;';

        return `
          <div class="stake-status-dot w-3.5 h-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-md select-none"
               data-stake-index="${i}"
               data-unlocked="true"
               style="background-color: ${color}ee; ${activeGlow}"
               title="${stake ? stake.name : ''} (Unlocked - Click to select)">
          </div>
        `;
      } else {
        // Darkly shaded / solid with lock icon for locked stakes
        // CRITICAL FIX: When selected, apply clear warning halo so current selection is 100% visible
        const activeLockedGlow = isSelected
          ? 'box-shadow: 0 0 10px #f59e0b, 0 0 14px rgba(245, 158, 11, 0.6); transform: scale(1.3); border: 2px solid #fbbf24; opacity: 1;'
          : 'border: 1px solid rgba(71, 85, 105, 0.8); opacity: 0.45;';

        return `
          <div class="stake-status-dot w-3.5 h-3.5 rounded-full bg-slate-900 flex items-center justify-center transition-all cursor-pointer select-none"
               data-stake-index="${i}"
               data-unlocked="false"
               style="${activeLockedGlow}"
               title="${stake ? stake.name : ''} (Locked - Defeat previous stake to unlock)">
            <span class="text-[7px] leading-none text-slate-300">🔒</span>
          </div>
        `;
      }
    }).join('');
  }
}

export const stakeManager = new StakeManager();
