// CTA内部は1480pxのPCデザインを固定し、全体に同じ倍率を適用。
const eventBanner = document.querySelector(".event-banner");
if (eventBanner) {
  const eventVisual = eventBanner.querySelector(".event-visual");
  const updateEventScale = () => {
    const readableMobile = eventBanner.classList.contains("event-banner--readable") && window.matchMedia("(max-width: 767px)").matches;
    eventVisual.style.transform = readableMobile ? "none" : `scale(${eventBanner.clientWidth / 1480})`;
  };
  updateEventScale();
  new ResizeObserver(updateEventScale).observe(eventBanner);
}
