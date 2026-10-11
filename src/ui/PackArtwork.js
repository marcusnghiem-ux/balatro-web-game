/**
 * PackArtwork.js
 * Authentic Balatro Booster Pack packaging and illustration engine.
 * Generates pixel-perfect sealed foil pouches matching game screenshots:
 * - Top & bottom corrugated metallic heat-seal crimp bars
 * - Specular diagonal foil sheen with reflective highlights
 * - Vibrant color palettes (Standard emerald, Arcana violet, Celestial sapphire, Buffoon scarlet, Spectral cyan)
 * - Stamped tier ribbons (JUMBO, MEGA)
 * - 3D arcade bubble typography with deep drop shadows
 * - Crisp vector emblems (4 Suits mandala, Tarot eye, Saturn rings, Jester bells, Spectral skull)
 */

export const PACK_EMBLEMS = {
  // Standard Pack: 4 Suits Mandala (Spades, Hearts, Diamonds, Clubs)
  standard: `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
      <circle cx="32" cy="32" r="28" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 2"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.8"/>
      <!-- Spades (Top) -->
      <path d="M 32 14 C 29 18 26 21 28 24 C 29 25 31 25 32 24 C 33 25 35 25 36 24 C 38 21 35 18 32 14 Z M 31 24 L 30 27 L 34 27 L 33 24 Z" fill="#ffffff"/>
      <!-- Hearts (Bottom) -->
      <path d="M 32 50 C 31 48 27 45 27 41 C 27 38 30 38 32 40 C 34 38 37 38 37 41 C 37 45 33 48 32 50 Z" fill="#fe5f55"/>
      <!-- Diamonds (Right) -->
      <polygon points="50,32 44,27 38,32 44,37" fill="#f59e0b"/>
      <!-- Clubs (Left) -->
      <g transform="translate(14, 27) scale(0.65)">
        <circle cx="16" cy="11" r="5" fill="#ffffff"/>
        <circle cx="11" cy="18" r="5" fill="#ffffff"/>
        <circle cx="21" cy="18" r="5" fill="#ffffff"/>
        <path d="M 14 18 L 13 25 L 19 25 L 18 18 Z" fill="#ffffff"/>
      </g>
      <!-- Center Star -->
      <polygon points="32,28 33,31 36,32 33,33 32,36 31,33 28,32 31,31" fill="#fef08a"/>
    </svg>
  `,

  // Arcana Pack: Mystic Tarot All-Seeing Eye & Crescent Moon
  tarot: `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
      <!-- Radiating Sunburst -->
      <g stroke="#fbcfe8" stroke-width="1" opacity="0.5">
        <line x1="32" y1="6" x2="32" y2="12"/>
        <line x1="32" y1="52" x2="32" y2="58"/>
        <line x1="6" y1="32" x2="12" y2="32"/>
        <line x1="52" y1="32" x2="58" y2="32"/>
        <line x1="14" y1="14" x2="18" y2="18"/>
        <line x1="46" y1="46" x2="50" y2="50"/>
        <line x1="50" y1="14" x2="46" y2="18"/>
        <line x1="14" y1="50" x2="18" y2="46"/>
      </g>
      <!-- Crescent Moon -->
      <path d="M 24 16 A 18 18 0 1 0 46 42 A 15 15 0 0 1 24 16 Z" fill="#fde047" opacity="0.85"/>
      <!-- Mystic Tarot Eye -->
      <path d="M 20 34 Q 32 22 44 34 Q 32 46 20 34 Z" fill="#ffffff" stroke="#3b0764" stroke-width="1.5"/>
      <circle cx="32" cy="34" r="5" fill="#9333ea"/>
      <circle cx="32" cy="34" r="2.5" fill="#fde047"/>
      <circle cx="33.5" cy="32.5" r="1" fill="#ffffff"/>
      <!-- Star Sparkles -->
      <polygon points="46,20 47,23 50,24 47,25 46,28 45,25 42,24 45,23" fill="#ffffff"/>
    </svg>
  `,

  // Celestial Pack: Ringed Cosmic Saturn & Galaxy
  planet: `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
      <!-- Stars in space -->
      <circle cx="14" cy="18" r="1" fill="#ffffff"/>
      <circle cx="48" cy="14" r="1.5" fill="#93c5fd"/>
      <circle cx="16" cy="46" r="1.2" fill="#ffffff"/>
      <circle cx="50" cy="48" r="1" fill="#ffffff"/>
      <!-- Outer planetary aura -->
      <circle cx="32" cy="32" r="18" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
      <!-- Planet Body Bands -->
      <ellipse cx="32" cy="32" rx="16" ry="16" fill="#2563eb"/>
      <path d="M 17 28 Q 32 34 47 28 A 16 16 0 0 1 47 36 Q 32 42 17 36 Z" fill="#3b82f6"/>
      <!-- Angled Planetary Rings -->
      <ellipse cx="32" cy="32" rx="27" ry="7" fill="none" stroke="#93c5fd" stroke-width="2.5" transform="rotate(-24, 32, 32)"/>
      <ellipse cx="32" cy="32" rx="23" ry="5.5" fill="none" stroke="#ffffff" stroke-width="1" transform="rotate(-24, 32, 32)" opacity="0.8"/>
      <!-- Light Reflection -->
      <ellipse cx="26" cy="24" rx="4" ry="2" fill="#ffffff" opacity="0.4" transform="rotate(-20, 26, 24)"/>
    </svg>
  `,

  // Buffoon Pack: Jimbo Bells & Laughing Jester Mask
  joker: `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
      <!-- Harlequin Diamond -->
      <polygon points="32,8 52,32 32,56 12,32" fill="rgba(0,0,0,0.3)" stroke="#fde047" stroke-width="1.5"/>
      <!-- Jester Tri-corn Cap -->
      <path d="M 22 26 C 16 12, 4 18, 10 28 Z" fill="#fe5f55" stroke="#ffffff" stroke-width="1"/>
      <path d="M 42 26 C 48 12, 60 18, 54 28 Z" fill="#009dff" stroke="#ffffff" stroke-width="1"/>
      <path d="M 24 24 C 30 8, 34 8, 40 24 Z" fill="#fde047" stroke="#ffffff" stroke-width="1"/>
      <!-- Golden Jingle Bells -->
      <circle cx="8" cy="26" r="3" fill="#fde047" stroke="#111" stroke-width="0.8"/>
      <circle cx="56" cy="26" r="3" fill="#fde047" stroke="#111" stroke-width="0.8"/>
      <circle cx="32" cy="9" r="3" fill="#ffffff" stroke="#111" stroke-width="0.8"/>
      <!-- Laughing Face -->
      <circle cx="32" cy="35" r="13" fill="#ffffff" stroke="#111" stroke-width="1.2"/>
      <circle cx="28" cy="33" r="1.8" fill="#111"/>
      <circle cx="36" cy="33" r="1.8" fill="#111"/>
      <ellipse cx="32" cy="36" rx="2" ry="1.5" fill="#fe5f55"/>
      <path d="M 26 39 Q 32 46 38 39" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,

  // Spectral Pack: Glowing Supernatural Skull & Ethereal Flames
  spectral: `
    <svg viewBox="0 0 64 64" class="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
      <!-- Ethereal Mist Aura -->
      <circle cx="32" cy="32" r="26" fill="rgba(6,182,212,0.15)"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#67e8f9" stroke-width="1" stroke-dasharray="2 3"/>
      <!-- Spectral Skull Head -->
      <path d="M 22 24 C 22 14, 42 14, 42 24 C 42 32, 38 36, 38 42 L 26 42 C 26 36, 22 32, 22 24 Z" fill="#cffafe" stroke="#ffffff" stroke-width="1.8"/>
      <!-- Eerie Glowing Eyes -->
      <ellipse cx="28" cy="24" rx="3.5" ry="4.5" fill="#083344"/>
      <ellipse cx="36" cy="24" rx="3.5" ry="4.5" fill="#083344"/>
      <circle cx="28" cy="23" r="1.5" fill="#22d3ee"/>
      <circle cx="36" cy="23" r="1.5" fill="#22d3ee"/>
      <!-- Nose Cavity -->
      <polygon points="32,29 30,33 34,33" fill="#083344"/>
      <!-- Teeth -->
      <path d="M 27 38 L 27 42 M 30 38 L 30 42 M 32 38 L 32 42 M 34 38 L 34 42 M 37 38 L 37 42" stroke="#083344" stroke-width="1.2"/>
      <!-- Ghost Flames -->
      <path d="M 32 10 Q 30 4 33 1 Q 36 6 32 10" fill="#22d3ee"/>
    </svg>
  `
};

export const PACK_THEMES = {
  standard: {
    baseClass: 'pack-theme-standard',
    bg: 'linear-gradient(180deg, #10b981 0%, #059669 45%, #047857 100%)',
    foilShine: 'rgba(167, 243, 208, 0.45)',
    titleColor: '#ffffff',
    subtitleColor: '#d1fae5',
    defaultName: 'STANDARD',
    pattern: 'radial-gradient(circle, rgba(255,255,255,0.15) 10%, transparent 11%) 0 0/10px 10px'
  },
  tarot: {
    baseClass: 'pack-theme-arcana',
    bg: 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 45%, #5b21b6 100%)',
    foilShine: 'rgba(233, 213, 255, 0.5)',
    titleColor: '#ffffff',
    subtitleColor: '#f3e8ff',
    defaultName: 'ARCANA',
    pattern: 'radial-gradient(circle, rgba(253,224,71,0.2) 12%, transparent 13%) 0 0/14px 14px'
  },
  planet: {
    baseClass: 'pack-theme-celestial',
    bg: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 45%, #1e40af 100%)',
    foilShine: 'rgba(191, 219, 254, 0.5)',
    titleColor: '#ffffff',
    subtitleColor: '#dbeafe',
    defaultName: 'CELESTIAL',
    pattern: 'radial-gradient(circle, rgba(255,255,255,0.2) 8%, transparent 9%) 0 0/12px 12px'
  },
  joker: {
    baseClass: 'pack-theme-buffoon',
    bg: 'linear-gradient(180deg, #ef4444 0%, #dc2626 45%, #991b1b 100%)',
    foilShine: 'rgba(254, 202, 202, 0.5)',
    titleColor: '#fef08a',
    subtitleColor: '#fee2e2',
    defaultName: 'BUFFOON',
    pattern: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 6px, transparent 6px, transparent 12px)'
  },
  spectral: {
    baseClass: 'pack-theme-spectral',
    bg: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 45%, #0e7490 100%)',
    foilShine: 'rgba(165, 243, 252, 0.55)',
    titleColor: '#ffffff',
    subtitleColor: '#cffafe',
    defaultName: 'SPECTRAL',
    pattern: 'radial-gradient(circle, rgba(255,255,255,0.25) 10%, transparent 11%) 0 0/10px 10px'
  }
};

/**
 * Renders complete authentic Balatro sealed Booster Pack HTML
 * @param {Object} pack
 * @param {Object} options
 * @returns {string} HTML string
 */
export function renderBoosterPackHtml(pack, options = {}) {
  if (!pack) return '';

  const packType = (pack.type || 'standard').toLowerCase();
  const theme = PACK_THEMES[packType] || PACK_THEMES.standard;
  const emblem = PACK_EMBLEMS[packType] || PACK_EMBLEMS.standard;

  // Determine tier (Normal, Jumbo, Mega)
  const size = pack.size || 3;
  const choices = pack.choices || 1;
  let tierLabel = '';
  if (pack.tier) {
    tierLabel = pack.tier.toUpperCase();
  } else if (size >= 5 || choices >= 2) {
    tierLabel = choices >= 2 ? 'MEGA' : 'JUMBO';
  } else if ((pack.name || '').toUpperCase().includes('JUMBO')) {
    tierLabel = 'JUMBO';
  } else if ((pack.name || '').toUpperCase().includes('MEGA')) {
    tierLabel = 'MEGA';
  }

  // Display Title
  const mainTitle = (pack.name || theme.defaultName)
    .toUpperCase()
    .replace(' PACK', '')
    .replace('JUMBO ', '')
    .replace('MEGA ', '');

  return `
    <div class="booster-foil-pouch ${theme.baseClass} relative flex flex-col justify-between items-center w-full h-full overflow-hidden select-none"
         style="background: ${theme.bg};">
      
      <!-- Top Corrugated Heat-Seal Metallic Crimp Bar -->
      <div class="pack-crimp-header w-full h-3 sm:h-3.5 flex items-center justify-around z-20 shrink-0">
        <div class="crimp-teeth-strip"></div>
      </div>

      <!-- Specular Diagonal Reflective Sheen Overlay -->
      <div class="pack-specular-glare pointer-events-none absolute inset-0 z-10"></div>
      
      <!-- Texture Dot / Diamond Grid Overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-25 z-0" style="background: ${theme.pattern};"></div>

      <!-- Main Pack Contents Zone -->
      <div class="pack-inner-body flex-1 w-full flex flex-col items-center justify-between px-1.5 py-1 z-10 relative">
        
        <!-- Top Tier Banner (e.g. JUMBO, MEGA) if present -->
        <div class="w-full flex items-center justify-center min-h-[16px]">
          ${tierLabel ? `
            <div class="pack-tier-ribbon font-pixel text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-900 bg-white px-2 py-0.2 rounded-sm shadow-md border border-slate-300">
              ${tierLabel}
            </div>
          ` : `
            <div class="pack-edition-pill font-pixel text-[8px] uppercase font-bold text-white/80 tracking-wider">
              SEALED PACK
            </div>
          `}
        </div>

        <!-- 3D Arcade Bubble Typography Title -->
        <div class="pack-title-block flex flex-col items-center justify-center text-center leading-none my-0.5">
          <div class="pack-title-primary font-pixel text-lg sm:text-xl font-black tracking-wider uppercase text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)]">
            ${mainTitle}
          </div>
          <div class="pack-title-secondary font-pixel text-sm sm:text-base font-black tracking-widest uppercase text-amber-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.85)]">
            PACK
          </div>
        </div>

        <!-- Center Crisp Vector Emblem Frame -->
        <div class="pack-emblem-frame w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center my-auto relative">
          <div class="emblem-halo absolute inset-0 rounded-full bg-white/20 blur-sm pointer-events-none"></div>
          ${emblem}
        </div>

        <!-- Bottom Pick Counter / Description -->
        <div class="pack-choice-badge w-full text-center">
          <div class="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-900 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm border border-black/20">
            CHOOSE ${choices} OF ${size}
          </div>
        </div>

      </div>

      <!-- Bottom Corrugated Heat-Seal Metallic Crimp Bar -->
      <div class="pack-crimp-footer w-full h-3 sm:h-3.5 flex items-center justify-around z-20 shrink-0">
        <div class="crimp-teeth-strip"></div>
      </div>

    </div>
  `;
}
