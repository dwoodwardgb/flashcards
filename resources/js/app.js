htmx.on('htmx:afterRequest', (event) => {
  const flash = event.detail.xhr.getResponseHeader('x-flash')
  if (flash) {
    try {
      const { type, message } = JSON.parse(flash)
      const flashEl = document.getElementById('htmx-flash')
      if (flashEl) {
        flashEl.innerText = message
        flashEl.classList.add(type)
        flashEl.hidden = false
      }
    } catch (e) {
      console.error(e)
    }
  }
})
