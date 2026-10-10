/**
 * main.js
 * Application entry point for Balatro Roguelike Card Game Engine.
 * Boots GameEngine, initializes Renderer & TouchController, and wires reactive loops.
 */

import { GameEngine } from './game/GameEngine.js';
import { Renderer } from './ui/Renderer.js';
import { TouchController } from './ui/TouchController.js';

window.addEventListener('DOMContentLoaded', () => {
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
      case 'SELECTION_CHANGED':
      case 'HAND_REORDERED':
      case 'HAND_SORTED':
      case 'DISCARDED':
      case 'HAND_RESOLVED':
      case 'HAND_RENDER_NEEDED':
      case 'JOKER_BOUGHT':
      case 'JOKER_SOLD':
      case 'CONSUMABLE_USED':
      case 'CONSUMABLE_SOLD':
      case 'SHOP_ITEM_BOUGHT':
      case 'VOUCHER_BOUGHT':
      case 'PACK_CARD_PICKED':
      case 'PACK_SKIPPED':
        renderer.render();
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
        renderer.showVictory();
        break;

      default:
        renderer.render();
        break;
    }
  });

  // 5. Start the first run
  game.startNewRun();
  renderer.render();

  console.log('%c🃏 Balatro Web Game Engine Initialized', 'color: #f0b02f; font-weight: bold; font-size: 14px;');
});
