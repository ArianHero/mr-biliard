(() => {
  const oldContact = document.querySelector(".legacy-contact");
  if (oldContact && location.hash === "#installation") {
    location.replace(oldContact.href);
    return;
  }

  const loader = document.querySelector(".loading");
  if (loader && document.readyState !== "complete") {
    const timer = setTimeout(() => { loader.hidden = false; }, 420);
    const done = () => { clearTimeout(timer); loader.hidden = true; };
    window.addEventListener("load", done, {once: true});
    window.addEventListener("pageshow", done, {once: true});
    setTimeout(done, 2400);
  }

  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;
  const frame = gallery.querySelector(".gallery-frame");
  const photos = [...frame.querySelectorAll("img")];
  const controls = gallery.querySelector(".gallery-controls");
  const buttons = [...controls.querySelectorAll("button")];
  const caption = gallery.querySelector(".gallery-caption");
  let active = 0;
  let start;
  function select(index) {
    active = (index + photos.length) % photos.length;
    photos.forEach((photo, n) => {
      photo.hidden = n !== active;
      buttons[n].setAttribute("aria-pressed", String(n === active));
    });
    caption.textContent = buttons[active].dataset.caption;
  }
  controls.hidden = false;
  buttons.forEach((button, index) => button.addEventListener("click", () => select(index)));
  controls.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    select(active + (event.key === "ArrowLeft" ? 1 : -1));
    buttons[active].focus();
  });
  frame.addEventListener("touchstart", event => {
    start = event.touches.length === 1 ? event.touches[0] : null;
  }, {passive: true});
  frame.addEventListener("touchcancel", () => { start = null; });
  frame.addEventListener("touchend", event => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.clientX;
    const dy = event.changedTouches[0].clientY - start.clientY;
    start = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > 1.5 * Math.abs(dy)) select(active + (dx > 0 ? 1 : -1));
  }, {passive: true});
})();
