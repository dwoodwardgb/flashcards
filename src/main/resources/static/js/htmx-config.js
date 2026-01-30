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

document.body.addEventListener("htmx:beforeSwap", function (event) {
  if (event.detail.xhr.status === 204) {
    // Swap content even when the response is empty
    event.detail.shouldSwap = true;
  }
});

// Handle flash messages from HX-Trigger header
document.body.addEventListener("flash", function (event) {
  const flash = event.detail;
  const flashDiv = document.getElementById("flash");
  if (flashDiv) {
    flashDiv.textContent = flash.message;
    flashDiv.dataset.type = flash.type;
  }
});
