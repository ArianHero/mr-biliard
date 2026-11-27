(() => {
  "use strict";
  const legacy = document.querySelector(".legacy-contact");
  if (legacy && location.hash === "#installation") {
    location.replace(legacy.href);
    return;
  }

  const toggle = document.querySelector(".menutoggle");
  const menu = document.getElementById("main-nav");
  if (toggle && menu) {
    const container = toggle.closest(".nav");
    function setMenu(open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("opened", open);
    }
    toggle.hidden = false;
    container.classList.add("menu-ready");
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("click", event => {
      if (!container.contains(event.target)) setMenu(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    matchMedia("(min-width:701px)").addEventListener("change", () => setMenu(false));
  }

  const gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    const slides = Array.from(gallery.querySelectorAll(".slide"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let active = 0;
    let timer;
    function rotate() {
      slides[active].classList.remove("current");
      slides[active].setAttribute("aria-hidden", "true");
      active = (active + 1) % slides.length;
      slides[active].classList.add("current");
      slides[active].setAttribute("aria-hidden", "false");
    }
    function schedule() {
      clearInterval(timer);
      if (slides.length > 1 && !document.hidden && !motion.matches) {
        timer = setInterval(rotate, 5000);
      }
    }
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", schedule);
    schedule();
  }

  const draft = document.querySelector("[data-draft]");
  if (draft) {
    const fields = [...draft.querySelectorAll(".field input,.field select,.field textarea")];
    const phone = draft.querySelector('[name="phone"]');
    const button = draft.querySelector("[data-copy]");
    const output = draft.querySelector(".draft-output");
    const feedback = draft.querySelector(".draft-feedback");
    button.hidden = false;
    draft.addEventListener("input", () => {
      phone.setCustomValidity("");
      output.hidden = true;
      feedback.textContent = "";
    });
    button.addEventListener("click", async () => {
      const digits = phone.value.replace(/[۰-۹]/g, ch => "۰۱۲۳۴۵۶۷۸۹".indexOf(ch))
        .replace(/[٠-٩]/g, ch => "٠١٢٣٤٥٦٧٨٩".indexOf(ch)).replace(/[\s()-]/g, "");
      phone.setCustomValidity(digits && !/^\+?[0-9]{8,15}$/.test(digits) ? "شماره تماس معتبر وارد کنید." : "");
      for (const field of fields) if (!field.reportValidity()) return;
      const lines = fields.filter(field => field.value.trim()).map(field => {
        const value = field.tagName === "SELECT" ? field.selectedOptions[0].text : field.value.trim();
        return field.labels[0].textContent + " " + value;
      });
      output.value = lines.join("\n");
      try {
        await navigator.clipboard.writeText(output.value);
        feedback.textContent = "متن درخواست کپی شد.";
      } catch {
        output.hidden = false;
        output.focus();
        output.select();
        feedback.textContent = "متن درخواست آماده است. متن انتخاب‌شده را کپی کنید.";
      }
    });
  }

  const viewer = document.querySelector("model-viewer");
  if (viewer) {
    const fallback = () => {
      viewer.hidden = true;
      document.querySelector("[data-model-controls]").hidden = true;
      document.querySelector("[data-model-error]").hidden = false;
    };
    viewer.addEventListener("error", fallback, {once: true});
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      if (context) {
        context.getExtension("WEBGL_lose_context")?.loseContext();
        const module = document.createElement("script");
        module.type = "module";
        module.src = viewer.dataset.module;
        module.onerror = fallback;
        document.head.append(module);
      } else {
        fallback();
      }
    } catch {
      fallback();
    }
  }

  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      }
    }, {threshold: 0.06});
    document.querySelectorAll(".table-feature,.equipment-feature,.service-title,.product-card,.availability").forEach(element => {
      if (element.getBoundingClientRect().top < innerHeight) return;
      element.classList.add("reveal-ready");
      observer.observe(element);
    });
  }
})();
