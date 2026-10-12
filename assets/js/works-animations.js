/* TOPと同じ速度・イージング。EVENT CTAは常時表示を維持する。 */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const settings = { duration: 1, ease: "power2.out", distance: 8, start: "top 90%" };
  const timelineFor = (element) => gsap.timeline({
    defaults: { duration: settings.duration, ease: settings.ease },
    scrollTrigger: { trigger: element, start: settings.start, once: true },
  });
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".section-heading").forEach((heading) => {
      const intro = heading.nextElementSibling;
      const timeline = timelineFor(heading).from(heading.children, { autoAlpha: 0, y: 14, stagger: .1 });
      if (intro?.classList.contains("section-intro")) timeline.from(intro, { autoAlpha: 0, y: settings.distance }, "-=.65");
    });
    timelineFor(document.querySelector(".lifestyle-feature"))
      .from(".lifestyle-photo", { autoAlpha: 0, duration: 1.2 })
      .from(".lifestyle-catch", { autoAlpha: 0, y: settings.distance }, "-=.8")
      .from(".lifestyle-card", { autoAlpha: 0, y: 10, duration: 1.1 }, "-=.65");
    document.querySelectorAll(".point-item").forEach((item, index) => {
      timelineFor(item)
        .from(item.querySelector(".point-photo"), { autoAlpha: 0, x: index === 1 ? 8 : -8, duration: 1.2 })
        .from([item.querySelector(".point-number"), item.querySelector(".point-label"), item.querySelector("h3")], { autoAlpha: 0, y: settings.distance }, "-=.85")
        .from(item.querySelector(".point-description"), { autoAlpha: 0, y: settings.distance }, "-=.7");
    });
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
})();
