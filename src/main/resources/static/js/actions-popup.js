import { LitElement, html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

/**
 * Creates a debounced version of a function.
 * @template {(...args: any[]) => void} T
 * @param {T} fn - The function to debounce
 * @param {number} ms - Delay in milliseconds
 * @returns {T} Debounced function
 */
function debounce(fn, ms) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timeoutId;
  return /** @type {T} */ (
    function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    }
  );
}

/**
 * A popup component that shows content above a trigger button on desktop,
 * or as a bottom sheet on mobile.
 * Uses the Popover API to render in the top layer (avoids overflow clipping).
 *
 * Usage:
 * <actions-popup>
 *   <span data-trigger-content>Click me</span>
 *   <div data-popup-content>Popup content here</div>
 * </actions-popup>
 *
 * The component renders a button around the data-trigger-content.
 */
export class ActionsPopup extends LitElement {
  static properties = {
    open: { type: Boolean, state: true },
  };

  /** @type {Element | null} */
  _triggerContent = null;

  /** @type {Element | null} */
  _popupContent = null;

  /** @type {string} */
  _popoverId = `actions-popup-${Math.random().toString(36).substring(2, 11)}`;

  /** @type {import('lit/directives/ref.js').Ref<HTMLButtonElement>} */
  _buttonRef = createRef();

  /** @type {import('lit/directives/ref.js').Ref<HTMLDivElement>} */
  _popoverRef = createRef();

  /** @type {() => void} */
  _debouncedPositionPopover = debounce(() => this._positionPopover(), 200);

  // Use light DOM instead of shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    // Query and detach children BEFORE super.connectedCallback() triggers first render
    this._triggerContent = this.querySelector("[data-trigger-content]");
    this._popupContent = this.querySelector("[data-popup-content]");

    // Remove from DOM so render() can place them declaratively
    // NOTE: this removes their event listeners, which breaks HTMX, so we need to re-attach them after render()
    this._triggerContent?.remove();
    this._popupContent?.remove();

    super.connectedCallback();

    this._positionPopover();

    // Listen for resize to reposition (e.g., device rotation)
    // window.addEventListener("resize", this._debouncedPositionPopover);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // window.removeEventListener("resize", this._debouncedPositionPopover);
  }

  /**
   * Check if we're on a mobile viewport.
   * @returns {boolean}
   */
  _isMobile() {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  /**
   * Position the popover above the trigger button on desktop,
   * or as a bottom sheet on mobile.
   */
  _positionPopover() {
    const popover = this._popoverRef.value;
    if (!popover) return;

    if (this._isMobile()) {
      // Bottom sheet: fixed to bottom, full width
      popover.style.position = "fixed";
      popover.style.bottom = "0";
      popover.style.left = "0";
      popover.style.right = "0";
      popover.style.top = "auto";
    } else {
      // Desktop: position above button, centered horizontally
      const button = this._buttonRef.value;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();

      const top = rect.top - popoverRect.height - 8; // 8px gap
      const left = rect.left + rect.width / 2 - popoverRect.width / 2;

      popover.style.position = "";
      popover.style.bottom = "";
      popover.style.right = "";
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
    }
  }

  /** @param {ToggleEvent} e */
  _handleToggle(e) {
    this.open = e.newState === "open";
    if (this.open) {
      this._positionPopover();
      // Position after the popover is shown (so we can measure it)
      // requestAnimationFrame(() => this._positionPopover());
    }
  }

  firstUpdated() {
    // Re-process HTMX attributes after Lit has rendered the content
    if (window.htmx && this._popupContent) {
      htmx.process(this._popupContent);
    }
  }

  render() {
    const popoverClasses = this._isMobile()
      ? "bg-white border shadow-lg p-3 m-0 w-full rounded-t-lg rounded-b-none"
      : "bg-white border rounded-lg shadow-lg p-3 m-0";

    return html`
      <button
        ${ref(this._buttonRef)}
        type="button"
        popovertarget="${this._popoverId}"
        aria-haspopup="true"
        aria-expanded="${this.open}"
        class="h-full"
      >
        ${this._triggerContent}
      </button>
      <div ${ref(this._popoverRef)} id="${this._popoverId}" popover @toggle="${this._handleToggle}" class="${popoverClasses}">
        ${this._popupContent}
      </div>
    `;
  }
}

customElements.define("actions-popup", ActionsPopup);
