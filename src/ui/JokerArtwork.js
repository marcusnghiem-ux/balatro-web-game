/**
 * JokerArtwork.js
 * Pixel-perfect authentic Balatro Joker illustration and card rendering engine.
 * Renders the iconic Balatro card anatomy:
 * - Crisp white card stock
 * - Vertical pixel "JOKER" typography down both left and right margins
 * - Framed illustration viewport with custom SVG/vector artwork for famous Jokers
 * - Rich thematic fallback illustration for the complete 150-joker roster
 */

export const JOKER_ILLUSTRATIONS = {
  // Jimbo / Default Joker
  joker: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <circle cx="40" cy="42" r="22" fill="#f8d7da" stroke="#111" stroke-width="2"/>
      <!-- Jester Hat -->
      <path d="M 22 34 C 18 16, 2 24, 8 36 Z" fill="#fe5f55" stroke="#111" stroke-width="1.5"/>
      <path d="M 58 34 C 62 16, 78 24, 72 36 Z" fill="#009dff" stroke="#111" stroke-width="1.5"/>
      <path d="M 26 32 C 34 10, 46 10, 54 32 Z" fill="#f1c40f" stroke="#111" stroke-width="1.5"/>
      <circle cx="6" cy="35" r="3" fill="#f1c40f" stroke="#111" stroke-width="1"/>
      <circle cx="74" cy="35" r="3" fill="#f1c40f" stroke="#111" stroke-width="1"/>
      <circle cx="40" cy="11" r="3" fill="#ffffff" stroke="#111" stroke-width="1"/>
      <!-- Face -->
      <circle cx="34" cy="40" r="2.5" fill="#111"/>
      <circle cx="46" cy="40" r="2.5" fill="#111"/>
      <ellipse cx="40" cy="44" rx="3" ry="2" fill="#fe5f55"/>
      <path d="M 32 48 Q 40 56 48 48" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Ruffled Collar -->
      <path d="M 24 58 Q 32 64 40 58 Q 48 64 56 58 Q 40 68 24 58" fill="#ffffff" stroke="#111" stroke-width="1.5"/>
    </svg>
  `,

  // Blueprint (Cyan Technical Drafting Grid)
  blueprint: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <rect x="10" y="10" width="60" height="60" rx="4" fill="#0a3d62" stroke="#38bdf8" stroke-width="2"/>
      <!-- Grid -->
      <line x1="10" y1="25" x2="70" y2="25" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="10" y1="40" x2="70" y2="40" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="10" y1="55" x2="70" y2="55" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="25" y1="10" x2="25" y2="70" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="40" y1="10" x2="40" y2="70" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="55" y1="10" x2="55" y2="70" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4"/>
      <!-- Schematic Card Drawing -->
      <rect x="24" y="22" width="32" height="36" rx="3" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="3 2"/>
      <circle cx="40" cy="40" r="9" fill="none" stroke="#7dd3fc" stroke-width="2"/>
      <path d="M 40 31 L 40 49 M 31 40 L 49 40" stroke="#7dd3fc" stroke-width="1.5"/>
      <!-- Corner Markers -->
      <path d="M 14 18 L 14 14 L 18 14" stroke="#ffffff" stroke-width="1.5" fill="none"/>
      <path d="M 66 18 L 66 14 L 62 14" stroke="#ffffff" stroke-width="1.5" fill="none"/>
    </svg>
  `,

  // Brainstorm (Electric Cerebral Glow)
  brainstorm: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <circle cx="40" cy="40" r="30" fill="#1e102d"/>
      <!-- Electric Aura -->
      <circle cx="40" cy="40" r="26" fill="none" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8"/>
      <!-- Brain Lobes -->
      <path d="M 38 24 C 28 24, 20 32, 22 44 C 20 54, 30 60, 38 56 Z" fill="#ec4899" stroke="#ffffff" stroke-width="2"/>
      <path d="M 42 24 C 52 24, 60 32, 58 44 C 60 54, 50 60, 42 56 Z" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>
      <!-- Neural Gyri -->
      <path d="M 28 34 Q 34 36 32 44 Q 36 48 30 52" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M 52 34 Q 46 36 48 44 Q 44 48 50 52" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Synaptic Sparks -->
      <polygon points="40,16 42,22 48,20 44,25 47,30 41,26 40,32 38,26 32,29 36,24 32,20 38,22" fill="#fde047"/>
    </svg>
  `,

  // Bull Joker (Fierce Black Bull with Golden Horns)
  bull: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Golden Curved Horns -->
      <path d="M 24 38 C 14 30, 10 14, 22 8 C 22 18, 28 26, 32 32 Z" fill="#f59e0b" stroke="#111" stroke-width="2"/>
      <path d="M 56 38 C 66 30, 70 14, 58 8 C 58 18, 52 26, 48 32 Z" fill="#f59e0b" stroke="#111" stroke-width="2"/>
      <!-- Bull Head -->
      <path d="M 26 32 L 54 32 L 50 62 L 30 62 Z" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
      <polygon points="30,30 50,30 54,46 40,54 26,46" fill="#09090b"/>
      <!-- Fierce Red Eyes -->
      <ellipse cx="34" cy="40" rx="3.5" ry="2" fill="#ef4444" stroke="#991b1b" stroke-width="1"/>
      <ellipse cx="46" cy="40" rx="3.5" ry="2" fill="#ef4444" stroke="#991b1b" stroke-width="1"/>
      <!-- Golden Nose Ring -->
      <ellipse cx="40" cy="56" rx="6" ry="7" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
      <circle cx="36" cy="52" r="1.5" fill="#52525b"/>
      <circle cx="44" cy="52" r="1.5" fill="#52525b"/>
    </svg>
  `,

  // The Boot (Purple Western Cowboy Boot with Radiant Sunburst)
  the_boot: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Radiant Sunset Background -->
      <circle cx="40" cy="40" r="30" fill="#2e1065"/>
      <path d="M 40 40 L 20 15 M 40 40 L 40 10 M 40 40 L 60 15 M 40 40 L 70 30 M 40 40 L 10 30" stroke="#f472b6" stroke-width="1.5" opacity="0.4"/>
      <!-- Purple Neon Boot -->
      <path d="M 32 18 L 48 18 L 46 44 L 56 50 C 60 54, 62 60, 56 64 L 32 64 C 28 64, 26 58, 28 52 L 32 18 Z" fill="#9333ea" stroke="#ffffff" stroke-width="2"/>
      <!-- Western Inlay Stitching -->
      <path d="M 36 24 C 40 32, 40 38, 44 42" stroke="#fde047" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M 42 24 C 45 30, 46 36, 48 42" stroke="#f43f5e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- Boot Spur -->
      <polygon points="26,60 22,60 20,58 20,62 18,60" fill="#facc15" stroke="#111" stroke-width="1"/>
      <!-- Boot Pull Straps -->
      <path d="M 32 16 L 36 18 M 48 16 L 44 18" stroke="#ffffff" stroke-width="2"/>
    </svg>
  `,

  // Loyalty Card (Punched Coffee/Arcade Card)
  loyalty_card: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Punch Card Stock -->
      <rect x="12" y="16" width="56" height="48" rx="4" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
      <line x1="16" y1="28" x2="64" y2="28" stroke="#d97706" stroke-width="1.5" stroke-dasharray="2 2"/>
      <text x="40" y="24" font-size="7" font-weight="900" font-family="monospace" fill="#78350f" text-anchor="middle">LOYALTY PUNCH</text>
      <!-- 6 Punch Slots (2 rows of 3) -->
      <circle cx="24" cy="38" r="5" fill="#1e293b" stroke="#78350f" stroke-width="1.2"/>
      <circle cx="40" cy="38" r="5" fill="#1e293b" stroke="#78350f" stroke-width="1.2"/>
      <circle cx="56" cy="38" r="5" fill="#1e293b" stroke="#78350f" stroke-width="1.2"/>
      <circle cx="24" cy="52" r="5" fill="#1e293b" stroke="#78350f" stroke-width="1.2"/>
      <circle cx="40" cy="52" r="5" fill="#1e293b" stroke="#78350f" stroke-width="1.2"/>
      <!-- 6th Golden Punch / Star -->
      <circle cx="56" cy="52" r="5.5" fill="#dc2626" stroke="#b91c1c" stroke-width="1.5"/>
      <text x="56" y="55" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle">★</text>
    </svg>
  `,

  // Space Joker / Satellite (Orbital Probe with Planet Curvature)
  space_joker: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <rect x="8" y="8" width="64" height="64" rx="6" fill="#030712"/>
      <!-- Blue Earth Curvature -->
      <path d="M 8 56 C 24 50, 56 50, 72 56 L 72 72 L 8 72 Z" fill="#0284c7"/>
      <path d="M 12 58 C 30 53, 52 53, 68 58" stroke="#38bdf8" stroke-width="2" fill="none"/>
      <!-- Stars -->
      <circle cx="18" cy="18" r="1" fill="#ffffff"/>
      <circle cx="34" cy="14" r="1.5" fill="#fde047"/>
      <circle cx="62" cy="22" r="1" fill="#ffffff"/>
      <circle cx="58" cy="38" r="1" fill="#ffffff"/>
      <!-- Satellite Body & Solar Panels -->
      <rect x="36" y="28" width="10" height="12" rx="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="18" y="30" width="16" height="8" rx="1" fill="#3b82f6" stroke="#ffffff" stroke-width="1"/>
      <rect x="48" y="30" width="16" height="8" rx="1" fill="#3b82f6" stroke="#ffffff" stroke-width="1"/>
      <!-- Satellite Dish -->
      <path d="M 41 22 C 37 18, 45 18, 41 22" stroke="#ffffff" stroke-width="2" fill="none"/>
      <line x1="41" y1="28" x2="41" y2="22" stroke="#e2e8f0" stroke-width="1.5"/>
    </svg>
  `,

  // Golden Joker / Smiley Face (Radiating Golden Rays)
  golden_joker: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Golden Sunburst -->
      <circle cx="40" cy="40" r="30" fill="#d97706"/>
      <path d="M 40 40 L 40 6 M 40 40 L 64 16 M 40 40 L 74 40 M 40 40 L 64 64 M 40 40 L 40 74 M 40 40 L 16 64 M 40 40 L 6 40 M 40 40 L 16 16" stroke="#fef08a" stroke-width="3" opacity="0.6"/>
      <!-- Big Iconic Smiling Face -->
      <circle cx="40" cy="40" r="22" fill="#facc15" stroke="#111" stroke-width="2.5"/>
      <!-- Oval Eyes -->
      <ellipse cx="33" cy="35" rx="2.5" ry="4.5" fill="#111"/>
      <ellipse cx="47" cy="35" rx="2.5" ry="4.5" fill="#111"/>
      <!-- Wide Smile -->
      <path d="M 28 44 Q 40 56 52 44" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>
  `,

  // Popcorn (Classic Striped Cinema Popcorn Box)
  popcorn: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Striped Box -->
      <polygon points="26,36 54,36 48,68 32,68" fill="#ffffff" stroke="#111" stroke-width="2"/>
      <polygon points="30,36 36,36 34,68 31,68" fill="#ef4444"/>
      <polygon points="44,36 50,36 46,68 43,68" fill="#ef4444"/>
      <polygon points="37,36 43,36 40,68 37,68" fill="#ffffff"/>
      <!-- Fluffy Popcorn Kernels -->
      <circle cx="32" cy="32" r="6" fill="#fef08a" stroke="#111" stroke-width="1.5"/>
      <circle cx="42" cy="28" r="7" fill="#fde047" stroke="#111" stroke-width="1.5"/>
      <circle cx="50" cy="33" r="6" fill="#fef08a" stroke="#111" stroke-width="1.5"/>
      <circle cx="36" cy="22" r="5.5" fill="#ffffff" stroke="#111" stroke-width="1.5"/>
      <circle cx="46" cy="21" r="5" fill="#fef08a" stroke="#111" stroke-width="1.5"/>
      <circle cx="40" cy="33" r="4.5" fill="#fbbf24"/>
    </svg>
  `,

  // Ice Cream (3-Scoop Melting Waffle Cone)
  ice_cream: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Waffle Cone -->
      <polygon points="28,42 52,42 40,72" fill="#d97706" stroke="#111" stroke-width="2"/>
      <line x1="32" y1="48" x2="44" y2="64" stroke="#92400e" stroke-width="1.2"/>
      <line x1="48" y1="48" x2="36" y2="64" stroke="#92400e" stroke-width="1.2"/>
      <!-- Scoops -->
      <circle cx="40" cy="40" r="12" fill="#f43f5e" stroke="#111" stroke-width="1.8"/> <!-- Strawberry -->
      <circle cx="36" cy="28" r="11" fill="#34d399" stroke="#111" stroke-width="1.8"/> <!-- Mint -->
      <circle cx="44" cy="24" r="10" fill="#78350f" stroke="#111" stroke-width="1.8"/> <!-- Choc -->
      <!-- Cherry on Top -->
      <circle cx="44" cy="13" r="4.5" fill="#dc2626" stroke="#111" stroke-width="1.2"/>
      <path d="M 44 10 C 48 6, 52 8, 50 4" stroke="#15803d" stroke-width="1.5" fill="none"/>
    </svg>
  `,

  // Cavendish / Gros Michel (Bananas)
  gros_michel: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Bananas Bunch -->
      <path d="M 48 16 C 50 32, 44 54, 20 58 C 30 52, 38 42, 38 22 Z" fill="#facc15" stroke="#111" stroke-width="2"/>
      <path d="M 42 16 C 46 36, 40 58, 14 62 C 26 56, 32 44, 34 22 Z" fill="#fde047" stroke="#111" stroke-width="2"/>
      <path d="M 46 14 C 44 12, 50 12, 48 16" fill="#15803d" stroke="#111" stroke-width="1.5"/>
      <circle cx="15" cy="61" r="2" fill="#713f12"/>
      <circle cx="21" cy="57" r="2" fill="#713f12"/>
    </svg>
  `,
  cavendish: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Cavendish with Halo -->
      <ellipse cx="40" cy="14" rx="14" ry="4" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="2 2"/>
      <path d="M 48 20 C 50 36, 44 58, 20 62 C 30 56, 38 46, 38 26 Z" fill="#facc15" stroke="#111" stroke-width="2"/>
      <path d="M 42 20 C 46 40, 40 62, 14 66 C 26 60, 32 48, 34 26 Z" fill="#fde047" stroke="#111" stroke-width="2"/>
      <path d="M 46 18 C 44 16, 50 16, 48 20" fill="#15803d" stroke="#111" stroke-width="1.5"/>
    </svg>
  `,

  // Scary Face (Red Demon Mask with Horns)
  scary_face: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Mask Base -->
      <polygon points="40,16 58,26 52,60 40,70 28,60 22,26" fill="#dc2626" stroke="#111" stroke-width="2"/>
      <!-- Horns -->
      <path d="M 24 24 C 16 14, 18 8, 24 6 C 28 12, 28 18, 26 24 Z" fill="#f59e0b" stroke="#111" stroke-width="1.5"/>
      <path d="M 56 24 C 64 14, 62 8, 56 6 C 52 12, 52 18, 54 24 Z" fill="#f59e0b" stroke="#111" stroke-width="1.5"/>
      <!-- Angry Eyes -->
      <polygon points="30,34 38,38 32,40" fill="#fde047" stroke="#111" stroke-width="1.2"/>
      <polygon points="50,34 42,38 48,40" fill="#fde047" stroke="#111" stroke-width="1.2"/>
      <!-- Menacing Teeth -->
      <polygon points="32,54 36,48 40,54 44,48 48,54" fill="#ffffff" stroke="#111" stroke-width="1.2"/>
    </svg>
  `,

  // Fibonacci (Golden Ratio Nautilus Shell Spiral)
  fibonacci: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <circle cx="40" cy="40" r="30" fill="#1e1b4b"/>
      <!-- Golden Spiral -->
      <path d="M 40 40 A 4 4 0 0 1 44 44 A 8 8 0 0 1 36 52 A 16 16 0 0 1 20 36 A 28 28 0 0 1 48 8 A 34 34 0 0 1 68 42" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      <text x="32" y="24" font-size="8" font-weight="900" font-family="monospace" fill="#a5b4fc">1,1,2,3,5</text>
    </svg>
  `,

  // Stencil Joker (Pure jet-black silhouette from reference photo 3)
  stencil: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Pure White Canvas with Stark Pitch-Black Jester Silhouette -->
      <circle cx="40" cy="40" r="32" fill="#ffffff" stroke="#111" stroke-width="1.5"/>
      <circle cx="40" cy="42" r="16" fill="#111827"/>
      <!-- Jester Horns -->
      <path d="M 26 34 C 20 18, 6 24, 12 36 Z" fill="#111827"/>
      <path d="M 54 34 C 60 18, 74 24, 68 36 Z" fill="#111827"/>
      <path d="M 28 32 C 34 14, 46 14, 52 32 Z" fill="#111827"/>
      <!-- Bells Silhouette -->
      <circle cx="10" cy="35" r="3.5" fill="#111827"/>
      <circle cx="70" cy="35" r="3.5" fill="#111827"/>
      <circle cx="40" cy="15" r="3.5" fill="#111827"/>
      <!-- Negative Eye Cutouts -->
      <circle cx="35" cy="40" r="2.5" fill="#ffffff"/>
      <circle cx="45" cy="40" r="2.5" fill="#ffffff"/>
      <!-- Ruffled Collar Silhouette -->
      <path d="M 28 56 Q 34 62 40 56 Q 46 62 52 56 Q 40 66 28 56" fill="#111827"/>
    </svg>
  `,

  // Splash Joker (Water Splash ripples from reference photo 2)
  splash: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Water pool background -->
      <circle cx="40" cy="40" r="30" fill="#082f49"/>
      <!-- Concentric Splash Waves -->
      <ellipse cx="40" cy="58" rx="26" ry="10" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <ellipse cx="40" cy="58" rx="16" ry="6" fill="none" stroke="#bae6fd" stroke-width="1.5"/>
      <!-- Central Splash Geyser Crown -->
      <path d="M 34 56 C 30 42 22 36 20 24 C 26 30 30 38 34 46 C 36 34 38 20 40 12 C 42 20 44 34 46 46 C 50 38 54 30 60 24 C 58 36 50 42 46 56 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Water Spray Droplets -->
      <circle cx="24" cy="18" r="3" fill="#e0f2fe"/>
      <circle cx="56" cy="18" r="3" fill="#e0f2fe"/>
      <circle cx="40" cy="8" r="3.5" fill="#ffffff"/>
      <circle cx="16" cy="32" r="2" fill="#38bdf8"/>
      <circle cx="64" cy="32" r="2" fill="#38bdf8"/>
    </svg>
  `,

  // Ramen Joker (Steaming Bowl of Noodles from reference photo 2)
  ramen: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <!-- Magenta / Pink Background -->
      <circle cx="40" cy="40" r="30" fill="#831843"/>
      <!-- Steam Wisps -->
      <path d="M 32 18 Q 30 12 34 8" stroke="#fbcfe8" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 40 16 Q 44 10 40 6" stroke="#fbcfe8" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 48 18 Q 46 12 50 8" stroke="#fbcfe8" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Chopsticks -->
      <line x1="20" y1="12" x2="62" y2="40" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="24" y1="10" x2="64" y2="36" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Ceramic Bowl -->
      <ellipse cx="40" cy="42" rx="24" ry="12" fill="#b91c1c" stroke="#ffffff" stroke-width="2"/>
      <path d="M 16 42 C 16 62 26 66 40 66 C 54 66 64 62 64 42 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
      <ellipse cx="40" cy="65" rx="12" ry="3" fill="#e2e8f0"/>
      <!-- Savory Broth & Noodles -->
      <ellipse cx="40" cy="42" rx="21" ry="9" fill="#d97706"/>
      <path d="M 24 40 Q 32 46 40 40 Q 48 46 56 40" stroke="#fef08a" stroke-width="2.5" fill="none"/>
      <!-- Boiled Egg -->
      <ellipse cx="32" cy="40" rx="5" ry="4" fill="#ffffff"/>
      <circle cx="32" cy="40" r="2.5" fill="#f59e0b"/>
      <!-- Scallions -->
      <circle cx="46" cy="41" r="2" fill="#22c55e"/>
      <circle cx="50" cy="38" r="1.5" fill="#22c55e"/>
    </svg>
  `,

  // Card Sharp (Card Detective with Visor & Ace of Spades)
  card_sharp: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <circle cx="40" cy="40" r="30" fill="#14532d"/>
      <!-- Green Casino Visor -->
      <ellipse cx="40" cy="28" rx="22" ry="7" fill="#15803d" stroke="#86efac" stroke-width="1.5"/>
      <path d="M 18 28 C 18 36 28 40 40 40 C 52 40 62 36 62 28 Z" fill="#166534" opacity="0.8"/>
      <!-- Sharp Sleuth Eyes behind Visor -->
      <ellipse cx="33" cy="35" rx="3.5" ry="1.5" fill="#fef08a"/>
      <ellipse cx="47" cy="35" rx="3.5" ry="1.5" fill="#fef08a"/>
      <!-- Hand holding glowing Ace -->
      <rect x="30" y="44" width="20" height="26" rx="2" fill="#ffffff" stroke="#1e293b" stroke-width="1.5" transform="rotate(-12, 40, 56)"/>
      <path d="M 39 49 C 37 51 35 53 36 55 C 37 56 38 56 39 55 C 40 56 41 56 42 55 C 43 53 41 51 39 49 Z M 38 55 L 37 57 L 41 57 L 40 55 Z" fill="#1e293b"/>
    </svg>
  `,

  // Half Joker (Card neatly severed in half with jagged torn edge)
  half_joker: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <rect x="16" y="12" width="48" height="56" rx="4" fill="#0f172a"/>
      <!-- Left Half of Card Standing -->
      <path d="M 18 14 L 40 14 L 38 24 L 42 34 L 37 44 L 42 54 L 38 64 L 40 68 L 18 68 Z" fill="#ffffff" stroke="#fe5f55" stroke-width="2"/>
      <!-- Mini Jester on left half -->
      <circle cx="28" cy="36" r="8" fill="#f87171"/>
      <circle cx="26" cy="35" r="1.5" fill="#ffffff"/>
      <!-- Spark / Sever Glow -->
      <line x1="40" y1="10" x2="40" y2="72" stroke="#fde047" stroke-width="2" stroke-dasharray="3 3"/>
    </svg>
  `,

  // Superposition (Ace & Straight Warp Horizon)
  superposition: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <circle cx="40" cy="40" r="30" fill="#312e81"/>
      <!-- Cosmic Event Horizon -->
      <ellipse cx="40" cy="40" rx="26" ry="12" fill="none" stroke="#818cf8" stroke-width="2" transform="rotate(-30, 40, 40)"/>
      <ellipse cx="40" cy="40" rx="26" ry="12" fill="none" stroke="#c084fc" stroke-width="2" transform="rotate(30, 40, 40)"/>
      <circle cx="40" cy="40" r="10" fill="#4338ca" stroke="#ffffff" stroke-width="2"/>
      <text x="35" y="44" font-size="12" font-weight="900" font-family="monospace" fill="#ffffff">A</text>
    </svg>
  `,

  // Four Fingers (Gloved Hand with 4 Outstretched Fingers)
  four_fingers: `
    <svg viewBox="0 0 80 80" class="w-full h-full drop-shadow-md">
      <circle cx="40" cy="40" r="30" fill="#701a75"/>
      <!-- 4 Outstretched White Fingers -->
      <rect x="22" y="16" width="6" height="28" rx="3" fill="#ffffff" stroke="#111" stroke-width="1.5"/>
      <rect x="31" y="12" width="6" height="32" rx="3" fill="#ffffff" stroke="#111" stroke-width="1.5"/>
      <rect x="40" y="14" width="6" height="30" rx="3" fill="#ffffff" stroke="#111" stroke-width="1.5"/>
      <rect x="49" y="18" width="6" height="26" rx="3" fill="#ffffff" stroke="#111" stroke-width="1.5"/>
      <!-- Palm -->
      <path d="M 22 40 L 55 40 C 58 50 56 64 40 66 C 24 64 20 52 22 40 Z" fill="#ffffff" stroke="#111" stroke-width="1.5"/>
      <text x="36" y="58" font-size="12" font-weight="900" font-family="sans-serif" fill="#701a75">4</text>
    </svg>
  `
};

/**
 * Returns authentic pixel art illustration markup for any Joker.
 * Uses the official 150-Joker pixel art assets sourced from balatrowiki.org.
 */
export function getJokerIllustrationHtml(joker) {
  if (!joker) return '';
  const rawId = (joker.id || '').toLowerCase();
  const idMap = {
    'joker_stencil': 'stencil',
    'caino': 'canio'
  };
  const id = idMap[rawId] || rawId;
  const name = joker.name || 'Joker';
  
  return `
    <img 
      src="assets/jokers/${id}.png" 
      alt="${name}" 
      class="joker-illustration-img w-full h-full object-contain select-none pointer-events-none drop-shadow-md"
      loading="eager"
      onerror="this.onerror=null; this.src='assets/jokers/joker.png';"
    />
  `;
}

/**
 * Renders complete authentic Balatro Joker card face HTML
 * including side "JOKER" pixel typography ribbons!
 */
/**
 * Renders complete authentic Balatro Joker card face HTML with FULL-BLEED illustration.
 * Expands artwork to fill the face of the card between the iconic vertical JOKER ribbons!
 */
export function renderJokerCardFace(joker, options = {}) {
  const {
    badgeHtml = '',
    copyTargetHtml = ''
  } = options;

  const illustration = getJokerIllustrationHtml(joker);

  return `
    <!-- Authentic Full-Bleed Balatro Layout: Left Ribbon, Clean Art Canvas, Right Ribbon -->
    <div class="joker-body-grid w-full h-full flex items-stretch justify-between relative px-0.5 overflow-hidden">
      <!-- Left Vertical JOKER Ribbon (reading downwards) -->
      <div class="joker-side-label-left font-pixel text-[8px] sm:text-[9px] font-black text-slate-800 flex flex-col justify-between items-center select-none py-1 leading-none z-10 shrink-0">
        <span>J</span><span>O</span><span>K</span><span>E</span><span>R</span>
      </div>

      <!-- Center Clean Art Canvas (fills the entire card face) -->
      <div class="joker-fullbleed-canvas flex-1 relative flex items-center justify-center p-0.5 overflow-hidden mx-0.5">
        <div class="w-full h-full flex items-center justify-center relative">
          ${illustration}
        </div>
        ${badgeHtml}
        ${copyTargetHtml}
      </div>

      <!-- Right Vertical JOKER Ribbon (inverted 180° for authentic playing card rotational symmetry) -->
      <div class="joker-side-label-right font-pixel text-[8px] sm:text-[9px] font-black text-slate-800 flex flex-col justify-between items-center select-none py-1 leading-none z-10 shrink-0">
        <span>J</span><span>O</span><span>K</span><span>E</span><span>R</span>
      </div>
    </div>
  `;
}

