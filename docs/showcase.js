(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector("[data-showcase]");

  if (hero) {
    const stage = hero.querySelector(".showcase-stage");
    const scenes = [...stage.querySelectorAll(".scene")];
    const controls = hero.querySelector(".scene-controls");
    const buttons = [...controls.querySelectorAll("button")];
    let active = 0;
    let touchStart;

    function show(index) {
      const next = (index + scenes.length) % scenes.length;
      if (next === active) return;
      scenes[active].hidden = true;
      scenes[active].classList.remove("is-entering");
      buttons[active].setAttribute("aria-pressed", "false");
      active = next;
      scenes[active].hidden = false;
      scenes[active].classList.add("is-entering");
      buttons[active].setAttribute("aria-pressed", "true");
    }

    controls.hidden = false;
    buttons.forEach((button, index) => button.addEventListener("click", () => show(index)));
    controls.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      show(active + (event.key === "ArrowLeft" ? 1 : -1));
      buttons[active].focus();
    });
    stage.addEventListener("touchstart", event => {
      touchStart = event.touches.length === 1 ? event.touches[0] : null;
    }, {passive:true});
    stage.addEventListener("touchcancel", () => { touchStart = null; });
    stage.addEventListener("touchend", event => {
      if (!touchStart) return;
      const dx = event.changedTouches[0].clientX - touchStart.clientX;
      const dy = event.changedTouches[0].clientY - touchStart.clientY;
      touchStart = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) show(active + (dx > 0 ? 1 : -1));
    }, {passive:true});

    stage.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      hero.style.setProperty("--pointer-x", (x * 16) + "px");
      hero.style.setProperty("--pointer-y", (y * 12) + "px");
    });
    stage.addEventListener("pointerleave", () => {
      hero.style.removeProperty("--pointer-x");
      hero.style.removeProperty("--pointer-y");
    });
  }

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("motion-reveal");
        observer.unobserve(entry.target);
      }
    }, {threshold:.12});
    document.querySelectorAll(".department, .card, .repair-strip, .repair-content dl").forEach(el => observer.observe(el));
  }
})();
