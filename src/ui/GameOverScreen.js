/**
 * GameOverScreen.js
 * Pixel-perfect implementation of Balatro Game Over summary screen
 * matching reference photo 20261012_132855_HDR.jpg with 100% fidelity:
 *
 * 1. HEADER: Bold red pixel-art "GAME OVER" title.
 * 2. UPPER ROWS: Full-width metallic bars:
 *    - "Best Hand" with red pill, white poker chip icon (❂) & score (e.g., 35,252,100).
 *    - "Most Played Hand" with dark pill & play count (e.g., Four of a Kind (15)).
 * 3. LEFT COLUMN:
 *    - "Cards Played" [219] (Blue pill)
 *    - "Cards Discarded" [389] (Red pill)
 *    - "Cards Purchased" [107] (Amber pill)
 *    - "Times Rerolled" [25] (Green pill)
 *    - "New Discoveries" [0] (Dark pill)
 *    - "Seed" [ALEEB] (Orange-red pill) paired with blue "Copy" button below
 * 4. RIGHT COLUMN:
 *    - "Ante" [12] (Dark pill with amber text)
 *    - "Round" [37] (Dark pill with amber text)
 *    - "Defeated By" Card with circular Blind badge (e.g. Small Blind circular chip)
 * 5. ACTION BUTTONS: Vertically stacked "New Run" (top) and "Main Menu" (bottom).
 */

import { statsManager } from '../game/StatsManager.js';

export class GameOverScreen {
  /**
   * @param {import('../game/GameEngine.js').GameEngine} game
   * @param {import('./Renderer.js').Renderer} renderer
   */
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;
    this.modalEl = document.getElementById('game-over-modal');
  }

  /**
   * Displays the Game Over summary screen
   * @param {Object} [data]
   */
  show(data = {}) {
    if (!this.modalEl) return;

    // Retrieve active or fallback stats summary
    const engineStats = (this.game && this.game.statsManager)
      ? this.game.statsManager.getSummary(data)
      : statsManager.getSummary(data);

    // Merge any explicit overrides passed from event payload
    const bestHandScore = data.finalScore !== undefined && data.finalScore > engineStats.bestHandScore
      ? data.finalScore
      : engineStats.bestHandScore;
    const bestScoreFormatted = (bestHandScore || 0).toLocaleString();

    const mostPlayedHand = engineStats.mostPlayedHandName || 'High Card';
    const mostPlayedCount = engineStats.mostPlayedHandCount || 1;

    const cardsPlayed = engineStats.cardsPlayed !== undefined ? engineStats.cardsPlayed : 0;
    const cardsDiscarded = engineStats.cardsDiscarded !== undefined ? engineStats.cardsDiscarded : 0;
    const cardsPurchased = engineStats.cardsPurchased !== undefined ? engineStats.cardsPurchased : 0;
    const timesRerolled = engineStats.timesRerolled !== undefined ? engineStats.timesRerolled : 0;
    const newDiscoveries = engineStats.newDiscoveries !== undefined ? engineStats.newDiscoveries : 0;

    const anteReached = (data.ante !== undefined) ? data.ante : (this.game.ante || engineStats.anteReached || 1);
    const roundReached = engineStats.roundsPlayed || (this.game.roundIndex || 1);
    const seed = (data.seed || this.game.seed || engineStats.seed || 'ALEEB').toUpperCase();

    // Resolve Defeated By blind information
    const defeatedInfo = this.resolveDefeatedBy(data);

    this.modalEl.innerHTML = `
      <div class="balatro-game-over-dialog">
        <!-- 1. Header: GAME OVER -->
        <div class="balatro-game-over-header">
          <h1 class="balatro-game-over-title">GAME OVER</h1>
        </div>

        <!-- 2. Dark Frame Container for Summary Metrics -->
        <div class="balatro-game-over-body">
          
          <!-- Best Hand Row (Full Width) -->
          <div class="balatro-stat-bar full-width">
            <span class="balatro-stat-label">Best Hand</span>
            <div class="balatro-pill pill-red">
              <span class="balatro-chip-icon">❂</span>
              <span class="balatro-pill-text">${bestScoreFormatted}</span>
            </div>
          </div>

          <!-- Most Played Hand Row (Full Width) -->
          <div class="balatro-stat-bar full-width">
            <span class="balatro-stat-label">Most Played Hand</span>
            <div class="balatro-pill pill-dark">
              <span class="balatro-pill-text">${mostPlayedHand} (${mostPlayedCount})</span>
            </div>
          </div>

          <!-- Dual Column Metrics Grid -->
          <div class="balatro-game-over-columns">
            
            <!-- Left Column: Statistics & Seed -->
            <div class="balatro-stats-col-left">
              <!-- Cards Played -->
              <div class="balatro-stat-bar">
                <span class="balatro-stat-label">Cards Played</span>
                <div class="balatro-pill pill-blue">
                  <span class="balatro-pill-text">${cardsPlayed}</span>
                </div>
              </div>

              <!-- Cards Discarded -->
              <div class="balatro-stat-bar">
                <span class="balatro-stat-label">Cards Discarded</span>
                <div class="balatro-pill pill-red">
                  <span class="balatro-pill-text">${cardsDiscarded}</span>
                </div>
              </div>

              <!-- Cards Purchased -->
              <div class="balatro-stat-bar">
                <span class="balatro-stat-label">Cards Purchased</span>
                <div class="balatro-pill pill-amber">
                  <span class="balatro-pill-text">${cardsPurchased}</span>
                </div>
              </div>

              <!-- Times Rerolled -->
              <div class="balatro-stat-bar">
                <span class="balatro-stat-label">Times Rerolled</span>
                <div class="balatro-pill pill-green">
                  <span class="balatro-pill-text">${timesRerolled}</span>
                </div>
              </div>

              <!-- New Discoveries -->
              <div class="balatro-stat-bar">
                <span class="balatro-stat-label">New Discoveries</span>
                <div class="balatro-pill pill-dark">
                  <span class="balatro-pill-text">${newDiscoveries}</span>
                </div>
              </div>

              <!-- Seed Row -->
              <div class="balatro-stat-bar">
                <span class="balatro-stat-label">Seed</span>
                <div class="balatro-pill pill-orange">
                  <span class="balatro-pill-text">${seed}</span>
                </div>
              </div>

              <!-- Copy Button (Centered under Seed) -->
              <div class="balatro-copy-seed-container">
                <button id="game-over-copy-seed-btn" class="balatro-copy-btn" title="Copy run seed to clipboard">
                  Copy
                </button>
              </div>
            </div>

            <!-- Right Column: Ante, Round, and Defeated By -->
            <div class="balatro-stats-col-right">
              <!-- Ante -->
              <div class="balatro-stat-bar">
                <span class="balatro-stat-label">Ante</span>
                <div class="balatro-pill pill-dark">
                  <span class="balatro-pill-text text-amber">${anteReached}</span>
                </div>
              </div>

              <!-- Round -->
              <div class="balatro-stat-bar">
                <span class="balatro-stat-label">Round</span>
                <div class="balatro-pill pill-dark">
                  <span class="balatro-pill-text text-amber">${roundReached}</span>
                </div>
              </div>

              <!-- Defeated By Card -->
              <div class="balatro-defeated-by-card">
                <div class="balatro-defeated-by-header">
                  Defeated By
                </div>
                <div class="balatro-defeated-by-content">
                  <span class="balatro-defeated-name">${defeatedInfo.name}</span>
                  <div class="balatro-blind-circular-badge ${defeatedInfo.badgeClass}" style="${defeatedInfo.badgeStyle || ''}">
                    <div class="balatro-blind-badge-inner">
                      <span class="blind-badge-line1">${defeatedInfo.line1}</span>
                      <span class="blind-badge-line2">${defeatedInfo.line2}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        <!-- 3. Vertically Stacked Action Buttons -->
        <div class="balatro-game-over-actions">
          <button id="game-over-new-run-btn" class="balatro-arcade-action-btn">
            New Run
          </button>
          <button id="game-over-main-menu-btn" class="balatro-arcade-action-btn">
            Main Menu
          </button>
        </div>

      </div>
    `;

    // Ensure modal visibility
    this.modalEl.classList.remove('hidden');

    // 1. Wire Copy Seed button
    const copyBtn = document.getElementById('game-over-copy-seed-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(seed).then(() => {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 1500);
        }).catch(() => {
          // Fallback if clipboard API is blocked in iframe/permission
          const textarea = document.createElement('textarea');
          textarea.value = seed;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 1500);
        });
      });
    }

    // 2. Wire New Run action button
    const newRunBtn = document.getElementById('game-over-new-run-btn');
    if (newRunBtn) {
      newRunBtn.addEventListener('click', () => {
        this.modalEl.classList.add('hidden');
        if (this.game && typeof this.game.reset === 'function') {
          this.game.reset();
        }
        if (this.renderer && typeof this.renderer.render === 'function') {
          this.renderer.render();
        }
      });
    }

    // 3. Wire Main Menu action button
    const mainMenuBtn = document.getElementById('game-over-main-menu-btn');
    if (mainMenuBtn) {
      mainMenuBtn.addEventListener('click', () => {
        this.modalEl.classList.add('hidden');
        if (this.renderer && typeof this.renderer.showTitleScreen === 'function') {
          this.renderer.showTitleScreen();
        }
      });
    }
  }

  /**
   * Resolves badge visuals for the defeat cause
   * @param {Object} [data]
   * @returns {{ name: string, line1: string, line2: string, badgeClass: string, badgeStyle?: string }}
   */
  resolveDefeatedBy(data = {}) {
    const blindType = data.defeatedBy?.type || (this.game && this.game.blindType) || 'Small Blind';
    const activeBoss = data.defeatedBy?.boss || (this.game && this.game.activeBoss);

    if (blindType === 'Boss Blind' || activeBoss) {
      const bossName = activeBoss ? activeBoss.name : 'Boss Blind';
      return {
        name: bossName,
        line1: 'BOSS',
        line2: 'BLIND',
        badgeClass: 'blind-badge-boss',
        badgeStyle: activeBoss?.color ? `background: radial-gradient(circle at 35% 35%, ${activeBoss.color}, #500d0d);` : ''
      };
    }

    if (blindType === 'Big Blind') {
      return {
        name: 'Big Blind',
        line1: 'BIG',
        line2: 'BLIND',
        badgeClass: 'blind-badge-big'
      };
    }

    return {
      name: 'Small Blind',
      line1: 'SMALL',
      line2: 'BLIND',
      badgeClass: 'blind-badge-small'
    };
  }
}
