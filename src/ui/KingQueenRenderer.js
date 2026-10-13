/**
 * KingQueenRenderer.js
 * Procedural retro pixel-art court card renderer for Kings, Queens, and Jacks.
 * Provides authentic Balatro face card anatomy:
 * - Distinct multi-tiered crowns and golden tiaras with jewel insets
 * - Detailed hair, mustache, and beard shading
 * - Rich royal color palettes (crimson velvet robes, gold brocade trim, royal blue accents)
 * - Sharp, clean corner suit/rank indexes (K, Q, J)
 * - Double-ended mirrored court card symmetry with decorative dividing bar
 */

export class KingQueenRenderer {
  /**
   * Generates high-fidelity SVG court card illustration
   * @param {'K'|'Q'|'J'} rank 
   * @param {'hearts'|'diamonds'|'clubs'|'spades'} suit 
   * @returns {string} SVG HTML string
   */
  static getFaceCardSvg(rank, suit) {
    const isRed = suit === 'hearts' || suit === 'diamonds';
    const primaryRobe = isRed ? '#b91c1c' : '#1d4ed8';       // Rich crimson or royal blue
    const secondaryRobe = isRed ? '#dc2626' : '#2563eb';     // Vibrant highlight
    const goldTrim = '#f59e0b';                              // Gold trim / jewelry
    const goldHighlight = '#fde047';                         // Bright gold
    const jewelRed = '#ef4444';                              // Ruby
    const jewelBlue = '#38bdf8';                             // Sapphire
    const jewelGreen = '#10b981';                            // Emerald
    const hairKing = '#451a03';                              // Deep chestnut brown beard
    const hairQueen = '#7c2d12';                             // Auburn royal curls
    const skinTone = '#ffedd5';                              // Royal fair skin
    const skinShadow = '#fed7aa';                            // Skin contour
    const outline = '#0f172a';                               // Dark arcade ink outline

    if (rank === 'K') {
      return `
        <svg viewBox="0 0 68 96" class="w-full h-full select-none pointer-events-none drop-shadow-sm" shape-rendering="crispEdges">
          <!-- Card Interior Parchment Frame -->
          <rect x="2" y="2" width="64" height="92" rx="3" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="1"/>
          <rect x="5" y="5" width="58" height="86" fill="none" stroke="${goldTrim}" stroke-width="0.8" opacity="0.6"/>

          <!-- Top Half: King -->
          <g id="king-top">
            <!-- 5-Point Imperial Crown -->
            <path d="M 19 15 L 22 7 L 28 12 L 34 5 L 40 12 L 46 7 L 49 15 Z" fill="${goldTrim}" stroke="${outline}" stroke-width="1.2"/>
            <!-- Crown Jewels -->
            <rect x="33" y="6" width="2" height="3" fill="${jewelRed}"/>
            <circle cx="22" cy="8" r="1.2" fill="${jewelBlue}"/>
            <circle cx="46" cy="8" r="1.2" fill="${jewelBlue}"/>
            <circle cx="28" cy="12" r="1" fill="${jewelGreen}"/>
            <circle cx="40" cy="12" r="1" fill="${jewelGreen}"/>
            <!-- Crown Band with Gold Pearls -->
            <rect x="20" y="14" width="28" height="2.5" fill="${goldHighlight}" stroke="${outline}" stroke-width="0.8"/>

            <!-- Hair, Face, and Royal Beard -->
            <!-- Side Hair Waves -->
            <path d="M 20 16 C 17 22, 18 28, 22 28" stroke="${hairKing}" stroke-width="3" fill="none"/>
            <path d="M 48 16 C 51 22, 50 28, 46 28" stroke="${hairKing}" stroke-width="3" fill="none"/>
            <!-- Face -->
            <rect x="23" y="16" width="22" height="13" rx="2" fill="${skinTone}" stroke="${outline}" stroke-width="0.8"/>
            <rect x="25" y="23" width="18" height="3" fill="${skinShadow}" opacity="0.4"/>
            <!-- Regal Brows and Eyes -->
            <line x1="26" y1="20" x2="30" y2="20" stroke="${outline}" stroke-width="1.2"/>
            <line x1="38" y1="20" x2="42" y2="20" stroke="${outline}" stroke-width="1.2"/>
            <rect x="27.5" y="21" width="1.8" height="1.8" fill="${outline}"/>
            <rect x="38.5" y="21" width="1.8" height="1.8" fill="${outline}"/>
            <!-- Nose -->
            <path d="M 34 20 L 34 24 L 32.5 24" stroke="${outline}" stroke-width="0.8" fill="none"/>
            <!-- Mustache & Pointed Beard -->
            <path d="M 27 25 Q 34 28 41 25" stroke="${hairKing}" stroke-width="2.2" fill="none"/>
            <polygon points="26,27 42,27 34,35" fill="${hairKing}" stroke="${outline}" stroke-width="0.8"/>

            <!-- Robes & Ermine Mantle -->
            <path d="M 14 29 L 54 29 L 50 47 L 18 47 Z" fill="${primaryRobe}" stroke="${outline}" stroke-width="1.2"/>
            <!-- Gold Trim Borders on Robes -->
            <line x1="14" y1="29" x2="18" y2="47" stroke="${goldTrim}" stroke-width="1.5"/>
            <line x1="54" y1="29" x2="50" y2="47" stroke="${goldTrim}" stroke-width="1.5"/>
            <!-- Center Brocade Sash -->
            <rect x="31" y="29" width="6" height="18" fill="${secondaryRobe}" stroke="${outline}" stroke-width="0.8"/>
            <line x1="34" y1="29" x2="34" y2="47" stroke="${goldHighlight}" stroke-width="1.2" stroke-dasharray="2 1"/>

            <!-- Ermine Collar with Tail Flecks -->
            <path d="M 20 28 Q 34 32 48 28" stroke="#ffffff" stroke-width="3" fill="none"/>
            <rect x="26" y="29" width="1.2" height="2" fill="${outline}"/>
            <rect x="34" y="30" width="1.2" height="2" fill="${outline}"/>
            <rect x="41" y="29" width="1.2" height="2" fill="${outline}"/>

            <!-- Royal Scepter -->
            <line x1="50" y1="18" x2="52" y2="47" stroke="${goldTrim}" stroke-width="2.2"/>
            <circle cx="50" cy="18" r="3.2" fill="${goldHighlight}" stroke="${outline}" stroke-width="1"/>
            <circle cx="50" cy="18" r="1.5" fill="${jewelRed}"/>
            <!-- Scepter Cross Top -->
            <line x1="50" y1="13" x2="50" y2="16" stroke="${goldTrim}" stroke-width="1.5"/>
            <line x1="48.5" y1="14.5" x2="51.5" y2="14.5" stroke="${goldTrim}" stroke-width="1.5"/>
          </g>

          <!-- Ornamental Midline Divider -->
          <line x1="6" y1="48" x2="62" y2="48" stroke="${goldTrim}" stroke-width="1.2"/>
          <circle cx="34" cy="48" r="3" fill="#fdfbf7" stroke="${goldTrim}" stroke-width="1"/>
          <circle cx="34" cy="48" r="1.2" fill="${primaryRobe}"/>

          <!-- Bottom Half: Mirrored King -->
          <use href="#king-top" transform="rotate(180 34 48)" />
        </svg>
      `;
    }

    if (rank === 'Q') {
      return `
        <svg viewBox="0 0 68 96" class="w-full h-full select-none pointer-events-none drop-shadow-sm" shape-rendering="crispEdges">
          <!-- Card Interior Frame -->
          <rect x="2" y="2" width="64" height="92" rx="3" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="1"/>
          <rect x="5" y="5" width="58" height="86" fill="none" stroke="${goldTrim}" stroke-width="0.8" opacity="0.6"/>

          <!-- Top Half: Queen -->
          <g id="queen-top">
            <!-- Elegant 5-Point Tiara with Pearls -->
            <path d="M 21 16 L 24 9 L 29 13 L 34 7 L 39 13 L 44 9 L 47 16 Z" fill="${goldTrim}" stroke="${outline}" stroke-width="1.2"/>
            <circle cx="34" cy="7" r="1.8" fill="#ffffff" stroke="${outline}" stroke-width="0.8"/>
            <circle cx="24" cy="9" r="1.2" fill="#ffffff"/>
            <circle cx="44" cy="9" r="1.2" fill="#ffffff"/>
            <circle cx="29" cy="13" r="1" fill="${jewelRed}"/>
            <circle cx="39" cy="13" r="1" fill="${jewelBlue}"/>
            <!-- Gold Tiara Base -->
            <rect x="22" y="15" width="24" height="2" fill="${goldHighlight}" stroke="${outline}" stroke-width="0.6"/>

            <!-- Flowing Royal Curls -->
            <path d="M 20 17 Q 16 26 21 31" stroke="${hairQueen}" stroke-width="3.2" fill="none"/>
            <path d="M 48 17 Q 52 26 47 31" stroke="${hairQueen}" stroke-width="3.2" fill="none"/>
            <path d="M 18 24 Q 15 31 19 35" stroke="${hairQueen}" stroke-width="2.2" fill="none"/>
            <path d="M 50 24 Q 53 31 49 35" stroke="${hairQueen}" stroke-width="2.2" fill="none"/>

            <!-- Face and Features -->
            <rect x="23" y="16" width="22" height="14" rx="3" fill="${skinTone}" stroke="${outline}" stroke-width="0.8"/>
            <!-- Elegant Eyes and Eyelashes -->
            <line x1="26" y1="21" x2="30" y2="21" stroke="${outline}" stroke-width="1.2"/>
            <line x1="38" y1="21" x2="42" y2="21" stroke="${outline}" stroke-width="1.2"/>
            <circle cx="28" cy="22.5" r="1.2" fill="${outline}"/>
            <circle cx="40" cy="22.5" r="1.2" fill="${outline}"/>
            <!-- Gentle Nose & Ruby Lips -->
            <path d="M 34 22 L 34 25 L 33 25" stroke="${outline}" stroke-width="0.6" fill="none"/>
            <path d="M 32 27.5 Q 34 29 36 27.5" stroke="${jewelRed}" stroke-width="1.4" fill="none"/>

            <!-- Damask Robes & Bodice -->
            <path d="M 15 31 L 53 31 L 49 47 L 19 47 Z" fill="${primaryRobe}" stroke="${outline}" stroke-width="1.2"/>
            <!-- Rich Accent Scarf -->
            <polygon points="26,31 42,31 34,42" fill="${secondaryRobe}" stroke="${outline}" stroke-width="0.8"/>
            <!-- Golden Floral Brooch -->
            <circle cx="34" cy="35" r="3" fill="${goldHighlight}" stroke="${outline}" stroke-width="0.8"/>
            <circle cx="34" cy="35" r="1.3" fill="${jewelRed}"/>

            <!-- Floral Scepter -->
            <line x1="48" y1="23" x2="50" y2="47" stroke="${jewelGreen}" stroke-width="2"/>
            <!-- Golden Flower Blossom Head -->
            <circle cx="48" cy="23" r="3" fill="${goldHighlight}" stroke="${outline}" stroke-width="0.8"/>
            <circle cx="48" cy="23" r="1.2" fill="${jewelRed}"/>
            <circle cx="46" cy="21" r="1" fill="${goldTrim}"/>
            <circle cx="50" cy="21" r="1" fill="${goldTrim}"/>
          </g>

          <!-- Ornamental Midline Divider -->
          <line x1="6" y1="48" x2="62" y2="48" stroke="${goldTrim}" stroke-width="1.2"/>
          <circle cx="34" cy="48" r="3" fill="#fdfbf7" stroke="${goldTrim}" stroke-width="1"/>
          <circle cx="34" cy="48" r="1.2" fill="${primaryRobe}"/>

          <!-- Bottom Half: Mirrored Queen -->
          <use href="#queen-top" transform="rotate(180 34 48)" />
        </svg>
      `;
    }

    // Default Jack
    return `
      <svg viewBox="0 0 68 96" class="w-full h-full select-none pointer-events-none drop-shadow-sm" shape-rendering="crispEdges">
        <rect x="2" y="2" width="64" height="92" rx="3" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="5" y="5" width="58" height="86" fill="none" stroke="${goldTrim}" stroke-width="0.8" opacity="0.6"/>

        <g id="jack-top">
          <!-- Feathered Beret Cap -->
          <path d="M 21 16 Q 34 7 47 16 Z" fill="${primaryRobe}" stroke="${outline}" stroke-width="1.2"/>
          <path d="M 43 11 Q 54 4 51 18" stroke="${goldHighlight}" stroke-width="2.5" fill="none"/>
          <circle cx="43" cy="12" r="1.5" fill="${jewelRed}"/>

          <!-- Face -->
          <rect x="24" y="16" width="20" height="13" rx="2" fill="${skinTone}" stroke="${outline}" stroke-width="0.8"/>
          <line x1="27" y1="20" x2="31" y2="20" stroke="${outline}" stroke-width="1.2"/>
          <line x1="37" y1="20" x2="41" y2="20" stroke="${outline}" stroke-width="1.2"/>
          <rect x="28.5" y="21" width="1.5" height="1.5" fill="${outline}"/>
          <rect x="38.5" y="21" width="1.5" height="1.5" fill="${outline}"/>

          <!-- Doublet Tunic with Diagonal Sash -->
          <path d="M 16 29 L 52 29 L 48 47 L 20 47 Z" fill="#1e293b" stroke="${outline}" stroke-width="1.2"/>
          <line x1="18" y1="31" x2="46" y2="45" stroke="${goldTrim}" stroke-width="3"/>
          <line x1="18" y1="31" x2="46" y2="45" stroke="${secondaryRobe}" stroke-width="1.2"/>

          <!-- Halberd Poleaxe -->
          <line x1="50" y1="15" x2="52" y2="47" stroke="#64748b" stroke-width="2"/>
          <polygon points="50,15 47,19 53,19" fill="#94a3b8" stroke="${outline}" stroke-width="1"/>
        </g>

        <line x1="6" y1="48" x2="62" y2="48" stroke="${goldTrim}" stroke-width="1.2"/>
        <circle cx="34" cy="48" r="3" fill="#fdfbf7" stroke="${goldTrim}" stroke-width="1"/>
        <circle cx="34" cy="48" r="1.2" fill="${primaryRobe}"/>

        <use href="#jack-top" transform="rotate(180 34 48)" />
      </svg>
    `;
  }
}
