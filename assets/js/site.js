/* 下層ページ完成後は、ここにURLを設定するだけで各ボタン・ナビを接続できます。 */
const isWorksPage = document.body.classList.contains("works-page");
const isEventPage = document.body.classList.contains("event-page");
const isSubpage = isWorksPage || isEventPage;
const siteRoutes = {
  top: isSubpage ? "./" : "#top",
  concept: isSubpage ? "index.html#concept" : "#concept",
  works: "works.html",
  performance: isSubpage ? "index.html#performance" : "#performance",
  voice: isSubpage ? "index.html#voice" : "#voice",
  event: "event.html",
  "work-lifestyle": "works.html",
  "work-design": null,
  "work-performance": null,
  reservation: isEventPage ? "#reservation" : "event.html#reservation",
};

function setupPageLinks() {
  const notice = document.querySelector(".page-notice");
  document.querySelectorAll("[data-route]").forEach((element) => {
    const destination = siteRoutes[element.dataset.route];
    if (destination) {
      if (element.tagName === "A") element.href = destination;
      else {
        const link = document.createElement("a");
        link.className = element.className;
        link.dataset.route = element.dataset.route;
        link.href = destination;
        link.innerHTML = element.innerHTML;
        element.replaceWith(link);
      }
    } else {
      element.setAttribute("aria-haspopup", "dialog");
      element.addEventListener("click", () => notice.showModal());
    }
  });
  document.querySelector("[data-close-notice]").addEventListener("click", () => notice.close());
  notice.addEventListener("click", (event) => {
    const bounds = notice.getBoundingClientRect();
    if (event.target === notice && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) notice.close();
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  const header = document.querySelector(".site-header");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let menuTween;

  function setMenuOpen(open, returnFocus = false) {
    menuTween?.kill();
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    menu.inert = !open;
    if (open) menu.hidden = false;
    if (window.gsap && !reducedMotion.matches) {
      menuTween = gsap.fromTo(menu, { opacity: open ? 0 : 1, y: open ? -8 : 0 }, {
        opacity: open ? 1 : 0, y: open ? 0 : -8, duration: .32, ease: "power2.out",
        onComplete: () => {
          if (!open) menu.hidden = true;
          gsap.set(menu, { clearProps: "opacity,transform" });
        },
      });
    } else {
      menu.hidden = !open;
      menu.style.removeProperty("opacity");
      menu.style.removeProperty("transform");
    }
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => setMenuOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) setMenuOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target) && toggle.getAttribute("aria-expanded") === "true") setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    if (event.key === "Escape") { setMenuOpen(false, true); return; }
    if (event.key !== "Tab") return;
    const controls = [toggle, ...menu.querySelectorAll("a, button")];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

setupPageLinks();
setupMobileMenu();
