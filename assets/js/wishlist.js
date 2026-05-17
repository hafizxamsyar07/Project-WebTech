import { addBookToCart } from "./cart.js";
import { Store } from "./storage.js";
import { escapeHtml, parsePrice, showToast } from "./utils.js";

export function isWishlisted(title) {
  return Store.getWishlist().some(item => item.title === title);
}

export function toggleWishlistBook(book) {
  let wishlist = Store.getWishlist();
  const exists = wishlist.some(item => item.title === book.title);

  wishlist = exists
    ? wishlist.filter(item => item.title !== book.title)
    : [...wishlist, {
      title: book.title,
      price: book.price,
      img: book.img || book.cover
    }];

  Store.saveWishlist(wishlist);
  renderWishlistPage();
  showToast(exists ? "Removed from wishlist" : "Added to wishlist");
  return !exists;
}

function openWishlistBook(item) {
  Store.saveSelectedBook({
    title: item.title,
    price: item.price,
    img: item.img
  });
  window.location.href = "detail.html";
}

function moveWishlistBookToCart(title) {
  const item = Store.getWishlist().find(book => book.title === title);
  if (!item) return;

  addBookToCart({
    title: item.title,
    price: parsePrice(item.price),
    img: item.img
  });
}

function removeWishlistBook(title) {
  Store.saveWishlist(Store.getWishlist().filter(item => item.title !== title));
  renderWishlistPage();
}

export function renderWishlistPage() {
  const container = document.getElementById("wishlist-container");
  if (!container) return;

  const wishlist = Store.getWishlist();
  const helper = document.getElementById("wishlist-helper");
  const count = document.getElementById("wishlist-count");

  if (count) count.textContent = wishlist.length;
  if (helper) {
    helper.textContent = wishlist.length
      ? `${wishlist.length} saved book${wishlist.length === 1 ? "" : "s"} ready to review.`
      : "Your saved books will appear below.";
  }

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="wishlist-empty">
        <strong>No saved books yet</strong>
        <span>Browse the collection and tap Save on any book you like.</span>
        <a href="books.html">Browse Books</a>
      </div>
    `;
    return;
  }

  container.innerHTML = wishlist.map(item => `
    <article class="wishlist-card" data-title="${escapeHtml(item.title)}">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)} cover">
      <div class="wishlist-card-content">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="price">${escapeHtml(item.price)}</p>
        <div class="wishlist-actions">
          <button class="add-cart-btn" type="button" data-wishlist-action="cart">Add to Cart</button>
          <button class="remove-btn" type="button" data-wishlist-action="remove">Remove</button>
        </div>
      </div>
    </article>
  `).join("");
}

export function initWishlist() {
  renderWishlistPage();

  document.getElementById("wishlist-container")?.addEventListener("click", event => {
    const card = event.target.closest(".wishlist-card");
    if (!card) return;

    const actionButton = event.target.closest("[data-wishlist-action]");
    const title = card.dataset.title;

    if (!actionButton) {
      openWishlistBook(Store.getWishlist().find(item => item.title === title));
      return;
    }

    const action = actionButton.dataset.wishlistAction;
    if (action === "cart") moveWishlistBookToCart(title);
    if (action === "remove") removeWishlistBook(title);
  });
}
