(function () {
  "use strict";

  // Read CSRF token from cookie
  function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Configure HTMX to include CSRF token in all requests
  document.body.addEventListener("htmx:configRequest", function (event) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      event.detail.headers["X-XSRF-TOKEN"] = csrfToken;
    }
  });

  function dispatchFlashEvent(type, message, details) {
    const e = new Event("flash");
    e.detail = { type, message, details };
    document.body.dispatchEvent(e);
  }

  // Handle non-200 responses and update the flash
  document.body.addEventListener("htmx:beforeSwap", function (event) {
    const status = event.detail.xhr.status;
    if (status === 204) {
      // Swap content even when the response is empty
      event.detail.shouldSwap = true;
    } else if (status >= 400 || status < 200) {
      let statusText = "";
      let details = "";
      try {
        const body = JSON.parse(event.detail.xhr.response);
        statusText = body?.error;
        console.error(body);
        details = JSON.stringify(body, null, 2);
      } catch {}
      let message = `${status}`;
      if (statusText) {
        message += `: ${statusText}`;
      }
      dispatchFlashEvent("error", message, details);
    }
  });

  /** @type {import('./flash-alert.js').FlashAlert | null} */
  const flash = document.getElementById("flash");
  document.body.addEventListener("flash", function (event) {
    if (flash) {
      flash.type = event.detail.type;
      flash.message = event.detail.message;
      flash.details = event.detail.details;
    }
  });
})();
