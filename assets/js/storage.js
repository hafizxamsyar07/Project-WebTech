const CART_KEY = "cart";
const WISHLIST_KEY = "wishlist";
const SELECTED_BOOK_KEY = "selectedBook";
const LAST_ORDER_KEY = "lastOrder";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Storage layer: semua localStorage access dikumpulkan di sini.
export const Store = {
  getCart: () => readJson(CART_KEY, []),
  saveCart: cart => writeJson(CART_KEY, cart),
  getWishlist: () => readJson(WISHLIST_KEY, []),
  saveWishlist: wishlist => writeJson(WISHLIST_KEY, wishlist),
  getSelectedBook: () => readJson(SELECTED_BOOK_KEY, null),
  saveSelectedBook: book => writeJson(SELECTED_BOOK_KEY, book),
  getLastOrder: () => readJson(LAST_ORDER_KEY, null),
  saveLastOrder: order => writeJson(LAST_ORDER_KEY, order)
};
