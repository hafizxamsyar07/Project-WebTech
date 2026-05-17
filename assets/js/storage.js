const CART_KEY = "cart";
const WISHLIST_KEY = "wishlist";
const SELECTED_BOOK_KEY = "selectedBook";
const LAST_ORDER_KEY = "lastOrder";
const ORDER_HISTORY_KEY = "orderHistory";

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
  getOrderHistory: () => {
    const history = readJson(ORDER_HISTORY_KEY, []);
    const lastOrder = readJson(LAST_ORDER_KEY, null);

    if (!lastOrder || history.some(order => order.orderId === lastOrder.orderId)) {
      return history;
    }

    return [lastOrder, ...history];
  },
  getOrderById: orderId => Store.getOrderHistory().find(order => order.orderId === orderId) || null,
  saveLastOrder: order => {
    const history = Store.getOrderHistory().filter(item => item.orderId !== order.orderId);
    writeJson(LAST_ORDER_KEY, order);
    writeJson(ORDER_HISTORY_KEY, [order, ...history]);
  }
};
