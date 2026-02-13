import { LitElement, html } from "lit";

const typeColors = {
  success: "bg-green-100 border-green-500 text-green-700",
  error: "bg-red-100 border-red-500 text-red-700",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
  info: "bg-blue-100 border-blue-500 text-blue-700",
};

// This is effectively a singleton, there's only one flash alert on the page.
// Setting it's message to a falsey value will hide the alert completely.
// For sample usage see htmx-config.js.
export class FlashAlert extends LitElement {
  static properties = {
    type: { type: String },
    message: { type: String },
    details: { type: String },
    expanded: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.type = "info";
    this.message = "";
    this.details = "";
    this.expanded = false;
  }

  // Use light DOM instead of shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "presentation");
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  expand() {
    this.expanded = true;
  }

  collapse() {
    this.expanded = false;
  }

  dismiss() {
    this.message = undefined;
  }

  _handleKeydown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.toggle();
    }
  }

  render() {
    // Hide if no message
    if (!this.message) {
      return html``;
    }

    const colors = typeColors[this.type] || typeColors.info;

    return html`
      <div class="flex flex-col border-l-4 mb-4 rounded-r ${colors}" role="alert" aria-live="polite">
        <div class="flex items-center justify-between py-3 px-4 gap-8">
          <div
            class="flex flex-grow items-center select-none hover:opacity-90 ${this.details ? "cursor-pointer" : ""}"
            @click="${this.details ? this.toggle : undefined}"
            @keydown="${this._handleKeydown}"
          >
            ${this.details
              ? html`
                  <span class="text-2xl mr-2 transition-transform duration-100 ${this.expanded ? "rotate-180" : ""}">▼</span>
                `
              : ""}
            ${this.message}
          </div>
          <button class="text-2xl pr-2" @click="${this.dismiss}">&times;</button>
        </div>
        ${this.details
          ? html`
              <div
                class="flex flex-col px-4 overflow-x-hidden overflow-y-auto transition-all duration-200 whitespace-pre-wrap ${this
                  .expanded
                  ? "max-h-[500px] pb-3"
                  : "max-h-0 py-0 overflow-hidden"}"
              >
                <div>${this.details}</div>
              </div>
            `
          : ""}
      </div>
    `;
  }
}

customElements.define("flash-alert", FlashAlert);
