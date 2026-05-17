let promoIndex = 0;
let promoTimer = null;

function showPromo(carousel, index) {
  const slides = [...carousel.querySelectorAll(".promo-slide")];
  const dots = [...carousel.querySelectorAll("[data-promo-dot]")];
  if (slides.length === 0) return;

  promoIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === promoIndex);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === promoIndex);
    dot.setAttribute("aria-current", dotIndex === promoIndex ? "true" : "false");
  });
}

function restartPromoTimer(carousel) {
  clearInterval(promoTimer);
  promoTimer = window.setInterval(() => showPromo(carousel, promoIndex + 1), 4500);
}

export function initPromotionCarousel() {
  const carousel = document.querySelector("[data-promo-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".promo-slide")];
  const dotsContainer = carousel.querySelector("[data-promo-dots]");

  dotsContainer.innerHTML = slides.map((_, index) => (
    `<button type="button" data-promo-dot="${index}" aria-label="Show promotion ${index + 1}"></button>`
  )).join("");

  carousel.querySelector("[data-promo-prev]").addEventListener("click", () => {
    showPromo(carousel, promoIndex - 1);
    restartPromoTimer(carousel);
  });

  carousel.querySelector("[data-promo-next]").addEventListener("click", () => {
    showPromo(carousel, promoIndex + 1);
    restartPromoTimer(carousel);
  });

  dotsContainer.addEventListener("click", event => {
    const dot = event.target.closest("[data-promo-dot]");
    if (!dot) return;

    showPromo(carousel, Number(dot.dataset.promoDot));
    restartPromoTimer(carousel);
  });

  showPromo(carousel, 0);
  restartPromoTimer(carousel);
}
