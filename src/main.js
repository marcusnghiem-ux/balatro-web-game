/**
 * main.js
 * Application entry point for Balatro Roguelike Card Game Engine.
 * Boots GameEngine, initializes Renderer & TouchController, and wires reactive loops.
 */

import { GameEngine, GAME_STATES } from './game/GameEngine.js';
import { Renderer } from './ui/Renderer.js';
import { TouchController } from './ui/TouchController.js';

window.addEventListener('DOMContentLoaded', () => {
  // DEPLOYMENT FIX: Deregister any stale service workers so new deployments
  // are never blocked by a cached SW serving old asset hashes.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(sw => sw.unregister());
    });
  }

  // Log build timestamp to DevTools so you can instantly verify a fresh deployment
  // eslint-disable-next-line no-undef
  const buildTime = (typeof __BUILD_TIME__ !== 'undefined') ? __BUILD_TIME__ : 'dev';
  console.log(`%c🃏 Balatro Web — Build: ${buildTime}`, 'color:#f59e0b;font-weight:bold');
  // 1. Initialize core state machine
  const game = new GameEngine();

  // 2. Initialize renderer and presentation layer
  const renderer = new Renderer(game);

  // 3. Initialize pointer controller for Touch, iPad, Stylus, and Mouse
  const playerHandEl = document.getElementById('player-hand');
  const touchController = new TouchController(
    game,
    playerHandEl,
    (soundType) => renderer.playSound(soundType)
  );

  // 4. Wire GameEngine state notifications to Renderer
  game.subscribe((event, data) => {
    switch (event) {
      case 'ROUND_STARTED':
        renderer.shouldAnimateDeal = true;
        renderer.render();
        break;

      case 'HAND_RESOLVED':
        renderer.playSound('card_slide');
        renderer.render();
        break;

      case 'DISCARDED':
      case 'HAND_SORTED':
        renderer.playSound('card_slide');
        renderer.render();
        break;

      case 'JOKER_SOLD':
      case 'CONSUMABLE_SOLD':
        renderer.playSound('cash');
        renderer.render();
        break;

      case 'CONSUMABLE_USED':
        renderer.playSound('win');
        renderer.render();
        break;

      case 'PACK_CARD_PICKED':
        renderer.playSound('card_select');
        renderer.render();
        break;

      case 'PACK_SKIPPED':
        renderer.playSound('card_slide');
        renderer.render();
        break;

      case 'SELECTION_CHANGED':
      case 'HAND_REORDERED':
      case 'JOKER_REORDERED':
      case 'CONSUMABLE_REORDERED':
      case 'RUN_LOADED':
      case 'HAND_RENDER_NEEDED':
      case 'JOKER_BOUGHT':
      case 'SHOP_ITEM_BOUGHT':
      case 'VOUCHER_BOUGHT':
        renderer.render();
        break;

      case 'ENDLESS_MODE_STARTED':
        renderer.render();
        renderer.renderShop();
        break;

      case 'MAX_SELECTION_REACHED':
        renderer.playSound('card_deselect');
        // Visual shake feedback on hand
        playerHandEl.classList.add('screen-shake');
        setTimeout(() => playerHandEl.classList.remove('screen-shake'), 300);
        break;

      case 'PLAY_STARTED':
        renderer.playScoringSequence(data.scoringResult, data.playedCards);
        break;

      case 'ROUND_WON':
        renderer.playSound('win');
        renderer.render();
        // Give a brief moment before opening shop
        setTimeout(() => {
          renderer.renderShop();
        }, 600);
        break;

      case 'GAME_OVER':
        renderer.showGameOver(data);
        break;

      case 'GAME_VICTORY':
        renderer.showVictory(data);
        break;

      default:
        renderer.render();
        break;
    }
  });

  // 5. Start at authentic Title Screen (matching Photo 1)
  game.state = GAME_STATES.TITLE;
  renderer.render();

  console.log('%c🃏 Balatro Web Game Engine Initialized', 'color: #f0b02f; font-weight: bold; font-size: 14px;');
});
