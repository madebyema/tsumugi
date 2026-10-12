/* 仮の予約候補。公開時はこの設定だけを差し替える。 */
const reservationOptions = {
  firstDate: "2026-10-12", days: 14,
  times: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
  people: [1, 2, 3, 4, 5, 6],
};
const reservationForm = document.querySelector(".reservation-form");
const dateSelect = document.querySelector("#visit-date");
const dateFormat = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", timeZone: "UTC" });
for (let index = 0; index < reservationOptions.days; index++) {
  const date = new Date(`${reservationOptions.firstDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + index);
  dateSelect.add(new Option(dateFormat.format(date), date.toISOString().slice(0, 10)));
}
reservationOptions.times.forEach((time) => document.querySelector("#visit-time").add(new Option(time, time)));
reservationOptions.people.forEach((count) => document.querySelector("#visitor-count").add(new Option(`${count}名`, count)));
// HTMLにform要素を置かず、確認ボタンだけで画面を切り替える。
const reservationReview = document.querySelector(".reservation-review");
function focusReservationElement(element) {
  element.focus({ preventScroll: true });
  const headerHeight = document.querySelector(".site-header").getBoundingClientRect().height;
  window.scrollTo({ top: Math.max(0, window.scrollY + element.getBoundingClientRect().top - headerHeight - 24), behavior: "instant" });
}
const confirmButton = document.querySelector(".reservation-confirm-button");
confirmButton.addEventListener("click", () => {
  const requiredFields = [...reservationForm.querySelectorAll("[required]")];
  requiredFields.forEach(validateField);
  const firstInvalid = requiredFields.find((field) => !field.validity.valid);
  if (firstInvalid) { focusReservationElement(firstInvalid); return; }
  reservationReview.querySelectorAll("[data-review]").forEach((output) => {
    const field = reservationForm.querySelector(`[name="${output.dataset.review}"]`);
    const value = field.tagName === "SELECT" && field.value ? field.selectedOptions[0].textContent : field.value.trim();
    output.textContent = value || "なし";
  });
  reservationForm.hidden = true;
  reservationReview.hidden = false;
  window.ScrollTrigger?.refresh();
  focusReservationElement(document.querySelector("#reservation-review-title"));
});
document.querySelector(".reservation-back-button").addEventListener("click", () => {
  reservationReview.hidden = true;
  reservationForm.hidden = false;
  window.ScrollTrigger?.refresh();
  focusReservationElement(document.querySelector("#visitor-name"));
});
function validateField(field) {
  const error = field.closest(".form-field").querySelector(".field-error");
  if (!error) return;
  const invalid = !field.validity.valid;
  field.setAttribute("aria-invalid", String(invalid));
  error.textContent = !invalid ? "" : field.validity.valueMissing ? "入力・選択してください。" : field.type === "email" ? "メールアドレスの形式を確認してください。" : field.type === "tel" ? "電話番号を10〜20文字の数字・半角の記号（+、-、括弧）で入力してください。" : "入力内容を確認してください。";
}
reservationForm.querySelectorAll("[required]").forEach((field) => {
  const error = field.closest(".form-field").querySelector(".field-error");
  error.id = `${field.id}-error`;
  field.setAttribute("aria-describedby", [field.getAttribute("aria-describedby"), error.id].filter(Boolean).join(" "));
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => { if (field.hasAttribute("aria-invalid")) validateField(field); });
  field.addEventListener("change", () => validateField(field));
  field.addEventListener("invalid", () => validateField(field));
});

/* 既存ページと同じ、軽い移動・約1秒のフェード。 */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const reveal = (element) => gsap.timeline({ defaults: { duration: 1, ease: "power2.out" }, scrollTrigger: { trigger: element, start: "top 90%", once: true } });
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".section-heading").forEach((heading) => reveal(heading).from(heading.children, { autoAlpha: 0, y: 14, stagger: .1 }));
    const openHouseCard = document.querySelector(".open-house-card");
    reveal(openHouseCard).from(openHouseCard, { opacity: 0, y: 20 });
    reveal(document.querySelector(".visit-benefits"))
      .from(".visit-benefits > h2", { autoAlpha: 0, y: 8 })
      .from(".visit-benefit", { opacity: 0, y: 12 }, "-=.65");
    // フォーム項目は常時表示。見出しのみ上の共通フェードを適用する。
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

// 初期化が完了した場合のみ操作を許可する。読み込み失敗時はHTMLの無効状態を維持。
confirmButton.disabled = false;
confirmButton.removeAttribute("aria-describedby");
document.querySelector("#reservation-unavailable").hidden = true;
