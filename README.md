# Balatro Web Game Engine

A production-ready, web-based deck-building card game engine heavily inspired by **Balatro**, built with modern ES Modules, Vite, Tailwind CSS, HTML5 Canvas, and Web Audio API.

## Features

- **Mobile & iPad Touchscreen Ready**: Full support for pointer events (`pointerdown`, `pointermove`, `pointerup`), pointer capture, touch drag-and-drop to reorder, tap-to-select, and `touch-action: manipulation` preventing accidental mobile zoom.
- **Card Mechanics**: Hand size of 8 cards, select up to 5 cards, drag-to-reorder, and quick-sort by rank or suit.
- **Poker Scoring Engine**: Accurate evaluation of High Card, Pair, Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush, Royal Flush, and Five of a Kind. Hand level upgrades with scalable Base Chips × Multipliers.
- **Dynamic Joker System**: Extensible Joker hooks triggering on card scoring, hand evaluation, in-hand held cards, and round completion.
- **Retro CRT Aesthetic & VFX**: Hypnotic vortex canvas background, CRT scanlines, vignette, screen shake, floating score numbers, and iridescent card editions (Foil, Holographic, Polychrome).
- **Procedural Audio Synthesizer**: 100% synthetic sound effects (card deals, chip clinks, fiery mults, fanfare, cash register) using Web Audio API—zero external audio assets needed.
- **GitHub Pages Ready**: Out-of-the-box support for GitHub Pages with `base: '/balatro-web-game/'`.

---

## Project Structure

```
balatro-web-game/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── src/
│   ├── main.js
│   ├── style.css
│   ├── game/
│   │   ├── Card.js            # Card class with suit, rank, selected state, dragging mechanics
│   │   ├── HandEvaluator.js   # Poker hand scoring: Pair, Two Pair, Flush, Straight, etc.
│   │   ├── ScoringEngine.js   # Base Chips × Multipliers + Joker modifier calculations
│   │   ├── JokerSystem.js     # Active jokers array hooking into hand evaluations
│   │   └── GameEngine.js      # State machine: Draw, Play, Discard, Score, Shop, Game Over
│   └── ui/
│       ├── TouchController.js # Unified PointerEvents for iPad/mobile selection & reorder
│       └── Renderer.js        # DOM cards, score animations, chips/mult display, shop & audio
```

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18 or higher recommended) & npm

### Installation & Local Dev Server
```bash
# Navigate into the project folder
cd balatro-web-game

# Install dependencies
npm install

# Start Vite dev server with hot reload
npm run dev
```

### Running without Node.js (Python HTTP Server)
Because the codebase uses pure ES Modules and CDN utilities, you can also preview it directly using Python:
```bash
# From inside the balatro-web-game folder
python -m http.server 8080
```
Then navigate to `http://localhost:8080/index.html` in your browser.

---

## Deploying to GitHub Pages

### Method 1: Automated Script (`gh-pages`)
1. Create a GitHub repository named `balatro-web-game`.
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Balatro Web Game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/balatro-web-game.git
   git push -u origin main
   ```
3. Deploy to the `gh-pages` branch:
   ```bash
   npm run deploy
   ```
4. In your GitHub repository settings, go to **Settings > Pages**, set **Source** to `Deploy from a branch`, and select `gh-pages` / `(root)`.

### Method 2: GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
```
Your game will be live at `https://<your-username>.github.io/balatro-web-game/`.
