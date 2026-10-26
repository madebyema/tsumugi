/* 動きを弱くする場合はこの設定値、削除する場合は該当setup関数を変更。 */
const motionSettings = {
  revealDuration: 1,
  textDistance: 14,
  photoScale: 1.025,
  triggerStart: "top 90%",
  heroHold: 4,
  heroFade: 1.8,
};

async function setupIntro() {
  const screen = document.querySelector(".loading-screen");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!window.gsap || reducedMotion.matches) return;
  let firstVisit = true;
  try { firstVisit = sessionStorage.getItem("tsumugi-intro-seen") !== "1"; } catch { /* ストレージ無効でも表示可能。 */ }
  if (firstVisit) screen.hidden = false;
  const heroImage = document.querySelector(".hero-media img");
  // 画像が遅くてもローディングを永久に残さない。
  await Promise.race([heroImage.decode().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1200))]);
  if (reducedMotion.matches) { screen.hidden = true; return; }
  const intro = gsap.timeline({ defaults: { ease: "power2.out" } });
  const cancelIntro = () => {
    if (!reducedMotion.matches) return;
    intro.kill();
    screen.hidden = true;
    gsap.set([heroImage, ...document.querySelectorAll(".hero-title > span, .hero-description")], { clearProps: "all" });
  };
  reducedMotion.addEventListener("change", cancelIntro);
  if (firstVisit) {
    intro.to(".loading-brand", { opacity: 1, duration: .55 })
      .to(".loading-brand", { opacity: 0, duration: .4 }, "+=.3")
      .to(screen, { opacity: 0, duration: .4, onComplete: () => { screen.hidden = true; } });
    try { sessionStorage.setItem("tsumugi-intro-seen", "1"); } catch { /* 任意の補助機能。 */ }
  }
  intro.fromTo(heroImage, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1.4 }, firstVisit ? "-=.2" : 0)
    .fromTo(".hero-title > span, .hero-description", { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: .18, duration: 1.1 }, "-=.8")
    .eventCallback("onComplete", () => {
      gsap.set([heroImage, ...document.querySelectorAll(".hero-title > span, .hero-description")], { clearProps: "all" });
      reducedMotion.removeEventListener("change", cancelIntro);
      setupHeroSlideshow();
    });
}

// 初回演出の完了後に開始。前の画像を不透明のまま残し、次の画像を重ねる。
async function setupHeroSlideshow() {
  const slides = [...document.querySelectorAll(".hero-slide")];
  await Promise.all(slides.map((slide) => slide.decode().catch(() => {})));
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    let current = 0;
    let transition;
    let timer;
    let stopped = false;
    const schedule = () => {
      if (!stopped && !document.hidden) timer = gsap.delayedCall(motionSettings.heroHold, advance);
    };
    const advance = () => {
      const previous = slides[current];
      current = (current + 1) % slides.length;
      const next = slides[current];
      gsap.set(previous, { opacity: 1, zIndex: 0 });
      gsap.set(next, { opacity: 0, zIndex: 1 });
      transition = gsap.to(next, { opacity: 1, duration: motionSettings.heroFade, ease: "sine.inOut", onComplete: () => {
        gsap.set(previous, { opacity: 0 });
        schedule();
      } });
    };
    const visibility = () => {
      if (document.hidden) { timer?.kill(); transition?.pause(); }
      else if (transition?.isActive() || transition?.paused()) transition.resume();
      else schedule();
    };
    document.addEventListener("visibilitychange", visibility);
    schedule();
    return () => {
      stopped = true;
      timer?.kill(); transition?.kill();
      document.removeEventListener("visibilitychange", visibility);
      gsap.set(slides, { clearProps: "opacity,zIndex" });
    };
  });
}

function setupScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // 設定変更時にも、GSAPがスタイルとScrollTriggerを自動的に復元。
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    setupHeroScroll();
    setupSectionHeadings();
    setupConceptMotion();
    setupWorksMotion();
    setupPerformanceMotion();
    setupVoiceMotion();
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

function sectionTimeline(element) {
  return gsap.timeline({
    defaults: { duration: motionSettings.revealDuration, ease: "power2.out" },
    scrollTrigger: { trigger: element, start: motionSettings.triggerStart, once: true },
  });
}

function setupHeroScroll() {
  gsap.to(".hero-media", {
    opacity: .08, y: -12, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .5 },
  });
}

function setupSectionHeadings() {
  document.querySelectorAll(".section-heading").forEach((heading) => {
    const intro = heading.nextElementSibling;
    const timeline = sectionTimeline(heading);
    timeline.from(heading.children, { autoAlpha: 0, y: motionSettings.textDistance, stagger: .1 });
    if (!heading.closest(".event") && intro?.classList.contains("section-intro")) timeline.from(intro, { autoAlpha: 0, y: 8 }, "-=.65");
  });
}

function setupConceptMotion() {
  sectionTimeline(document.querySelector(".concept-content"))
    .from(".concept-content h3", { autoAlpha: 0, y: 10 })
    .from(".concept-copy p", { autoAlpha: 0, y: 8, stagger: .15 }, "-=.65")
    .from(".concept-family", { opacity: 0, duration: 1.2 }, "-=.9");
}

function setupWorksMotion() {
  // PCのみ線画と説明をまとめる。幅の変更時はGSAPが設定を切り替える。
  gsap.matchMedia().add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (context) => {
    const desktop = context.conditions.desktop;
    document.querySelectorAll(".work-card").forEach((card, index) => {
      const timeline = sectionTimeline(card)
        .from(card.querySelector(".work-photo"), { autoAlpha: 0, duration: 1.15 })
        .from(card.querySelector(".work-photo img"), { scale: motionSettings.photoScale, duration: 1.3 }, "<");
      if (desktop) {
        const decorations = document.querySelectorAll(`.works [data-work-index="${index}"]`);
        timeline.from([card.querySelector(".work-heading"), card.querySelector(".work-copy"), ...decorations], { autoAlpha: 0, y: 10 }, 0);
      } else {
        timeline.from(card.querySelector(".work-heading"), { autoAlpha: 0, y: 10 }, 0)
          .from(card.querySelector(".work-copy"), { autoAlpha: 0, y: 8 }, 0);
      }
    });
  });
}

function setupPerformanceMotion() {
  document.querySelectorAll(".performance-row").forEach((row, index) => {
    // 番号・見出し・本文・等級説明・線画を、1つのTweenで同時に表示。
    const decorations = document.querySelectorAll(`.performance [data-performance-index="${index}"]`);
    const contentGroup = [row.querySelector(".performance-content"), ...decorations];
    sectionTimeline(row).from(row.querySelector(".performance-photo"), { autoAlpha: 0, x: index === 1 ? 8 : -8, duration: 1.2 })
      .from(contentGroup, { autoAlpha: 0, y: 8 }, 0);
  });
}

function setupVoiceMotion() {
  document.querySelectorAll(".voice-story").forEach((story) => {
    sectionTimeline(story)
      .from(story.querySelector(".voice-category"), { autoAlpha: 0, y: 8 })
      .from(story.querySelector(".voice-card"), { autoAlpha: 0, y: 10, duration: 1.1 }, "-=.8")
      .from(story.querySelector(".voice-photo img"), { scale: 1.02, duration: 1.3 }, "<");
  });
}

setupIntro();
setupScrollAnimations();
