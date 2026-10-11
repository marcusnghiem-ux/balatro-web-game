/**
 * TooltipRenderer.js
 * High-fidelity dynamic hover tooltip and card inspection engine.
 * Displays pixel-perfect Balatro arcade inspection boxes with highlighted
 * scoring terms (+Mult in red, +Chips in blue, $ in gold), rarity banners,
 * editions, stickers, and live states (Loyalty Card countdown, Blueprint target).
 */

export class TooltipRenderer {
  constructor() {
    this.tooltipEl = null;
    this.activeTarget = null;
    this.visible = false;
    this.initElement();
  }

  initElement() {
    let el = document.getElementById('balatro-global-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'balatro-global-tooltip';
      el.className = 'balatro-tooltip-box hidden';
      document.body.appendChild(el);
    }
    this.tooltipEl = el;

    // Dismiss on outside touch
    window.addEventListener('pointerdown', (e) => {
      if (this.visible && !e.target.closest('[data-tooltip-id]') && !e.target.closest('#balatro-global-tooltip')) {
        this.hide();
      }
    });
  }

  /**
   * Formats text with authentic Balatro keyword highlights
   */
  highlightKeywords(text) {
    if (!text) return '';
    return text
      // Mult (e.g. +4 Mult, X4 Mult, ×1.5 Mult)
      .replace(/([+×xX]\s*[0-9]+(?:\.[0-9]+)?\s*Mult)/gi, '<span class="kw-mult">$1</span>')
      // Chips (e.g. +50 Chips, +300 Chips)
      .replace(/(\+[0-9]+\s*Chips)/gi, '<span class="kw-chips">$1</span>')
      // Money (e.g. $5, +$3, $10)
      .replace(/(\+?\$[0-9]+)/g, '<span class="kw-money">$1</span>')
      // Probabilities (e.g. 1 in 4 chance)
      .replace(/([0-9]+\s*in\s*[0-9]+)/gi, '<span class="kw-chance">$1</span>');
  }

  /**
   * Attaches tooltip listeners to an interactive card element
   * @param {HTMLElement} element
   * @param {Object} data - Card, Joker, Consumable, or Shop item definition
   */
  attach(element, data) {
    if (!element || !data) return;

    element.dataset.hasTooltip = 'true';

    element.addEventListener('pointerenter', (e) => {
      this.show(data, e.clientX, e.clientY, element);
    });

    element.addEventListener('pointermove', (e) => {
      if (this.visible) {
        this.updatePosition(e.clientX, e.clientY);
      }
    });

    element.addEventListener('pointerleave', () => {
      this.hide();
    });

    // Mobile tap support
    element.addEventListener('click', (e) => {
      if (!this.visible || this.activeTarget !== element) {
        this.show(data, e.clientX, e.clientY, element);
      }
    });
  }

  /**
   * Render and display the tooltip
   */
  show(data, clientX, clientY, targetEl) {
    if (!this.tooltipEl || !data) return;
    this.activeTarget = targetEl;

    const title = data.name || data.id || 'Card';
    const rarity = (data.rarity || 'common').toLowerCase();
    const type = data.type || (data.category === 'joker' ? 'Joker' : 'Card');
    const desc = data.description || '';

    // Rarity and Category Header
    let bannerClass = `rarity-${rarity}`;
    let bannerLabel = (data.rarity || type).toUpperCase();

    // Edition / Modifier Badges
    let badgesHtml = '';
    if (data.edition && data.edition !== 'normal') {
      const ed = data.edition.toLowerCase();
      const edNames = {
        foil: 'FOIL (+50 Chips)',
        holo: 'HOLOGRAPHIC (+10 Mult)',
        polychrome: 'POLYCHROME (×1.5 Mult)',
        negative: 'NEGATIVE (+1 Slot)'
      };
      badgesHtml += `<div class="tooltip-badge badge-edition badge-${ed}">${edNames[ed] || ed.toUpperCase()}</div>`;
    }

    if (data.isEternal) {
      badgesHtml += `<div class="tooltip-badge badge-eternal">ETERNAL (Cannot be sold)</div>`;
    }
    if (data.isPerishable) {
      const rndLeft = data.perishableRoundsLeft !== undefined ? data.perishableRoundsLeft : 5;
      badgesHtml += `<div class="tooltip-badge badge-perishable">PERISHABLE (${rndLeft} rounds left)</div>`;
    }
    if (data.isRental) {
      badgesHtml += `<div class="tooltip-badge badge-rental">RENTAL (Costs $3 / round)</div>`;
    }

    // Dynamic State Overlays (Loyalty Card, Blueprint, Brainstorm)
    let dynamicStatusHtml = '';
    if (data.id === 'loyalty_card') {
      const rem = data.handsRemaining !== undefined ? data.handsRemaining : 5;
      if (rem === 0) {
        dynamicStatusHtml = `<div class="tooltip-dynamic-status status-active">🔥 ACTIVE ON THIS HAND! (×4 Mult)</div>`;
      } else {
        dynamicStatusHtml = `<div class="tooltip-dynamic-status status-pending">⏱️ ${rem} hand${rem === 1 ? '' : 's'} remaining until ×4 Mult</div>`;
      }
    } else if (data.id === 'blueprint') {
      if (data.hasTarget && data.targetName) {
        dynamicStatusHtml = `<div class="tooltip-dynamic-status status-copying">🔗 Copying: <strong>${data.targetName}</strong></div>`;
      } else {
        dynamicStatusHtml = `<div class="tooltip-dynamic-status status-no-target">⚠️ [No target! Place to the left of another Joker]</div>`;
      }
    } else if (data.id === 'brainstorm') {
      if (data.hasTarget && data.targetName) {
        dynamicStatusHtml = `<div class="tooltip-dynamic-status status-copying">🔗 Copying: <strong>${data.targetName}</strong></div>`;
      } else {
        dynamicStatusHtml = `<div class="tooltip-dynamic-status status-no-target">⚠️ [No target! Place after leftmost Joker]</div>`;
      }
    }

    // Price tag if inside shop
    let priceHtml = '';
    if (data.finalCost || data.cost) {
      const price = data.finalCost || data.cost;
      priceHtml = `<div class="tooltip-price-tag">Cost: $${price}</div>`;
    } else if (data.sellValue !== undefined) {
      priceHtml = `<div class="tooltip-sell-tag">Sell: $${data.sellValue}</div>`;
    }

    this.tooltipEl.innerHTML = `
      <div class="tooltip-header">
        <span class="tooltip-title">${title}</span>
        <span class="tooltip-rarity-pill ${bannerClass}">${bannerLabel}</span>
      </div>
      ${badgesHtml ? `<div class="tooltip-badges-row">${badgesHtml}</div>` : ''}
      <div class="tooltip-body">${this.highlightKeywords(desc)}</div>
      ${dynamicStatusHtml}
      <div class="tooltip-footer">
        ${priceHtml}
        <span class="tooltip-category-tag">${type.toUpperCase()}</span>
      </div>
    `;

    this.tooltipEl.classList.remove('hidden');
    this.visible = true;

    this.updatePosition(clientX, clientY);
  }

  /**
   * Updates position and clamps safely inside the viewport
   */
  updatePosition(clientX, clientY) {
    if (!this.tooltipEl || !this.visible) return;

    const pad = 14;
    const rect = this.tooltipEl.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let x = clientX + 16;
    let y = clientY + 16;

    // Flip horizontally if overflow
    if (x + rect.width > winW - pad) {
      x = clientX - rect.width - 16;
    }
    // Flip vertically if overflow
    if (y + rect.height > winH - pad) {
      y = clientY - rect.height - 16;
    }

    // Edge clamping
    x = Math.max(pad, Math.min(x, winW - rect.width - pad));
    y = Math.max(pad, Math.min(y, winH - rect.height - pad));

    this.tooltipEl.style.left = `${Math.round(x)}px`;
    this.tooltipEl.style.top = `${Math.round(y)}px`;
  }

  hide() {
    if (this.tooltipEl) {
      this.tooltipEl.classList.add('hidden');
    }
    this.visible = false;
    this.activeTarget = null;
  }
}

export const tooltipRenderer = new TooltipRenderer();
