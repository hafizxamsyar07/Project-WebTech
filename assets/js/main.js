import { initAccessibilityPanel } from "./accessibility.js";
import { initCart } from "./cart.js";
import { initCatalog } from "./catalog.js";
import { initDetailPage } from "./detail.js";
import { initInvoicePage } from "./invoice.js";
import { initActiveNav, initSuggestionCloser } from "./nav.js";
import { initPromotionCarousel } from "./promotions.js";
import { initWishlist } from "./wishlist.js";

// Main bootstrap: semua page guna entry point yang sama, modul hanya aktif bila elemen page wujud.
document.addEventListener("DOMContentLoaded", async () => {
  initActiveNav();
  initSuggestionCloser();
  initAccessibilityPanel();
  initCart();
  initWishlist();
  initDetailPage();
  initInvoicePage();
  initPromotionCarousel();
  await initCatalog();
});
