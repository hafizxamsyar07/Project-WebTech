import { CONFIG } from "./config.js";
import { addBookToCart } from "./cart.js";
import { Store } from "./storage.js";
import { isWishlisted, toggleWishlistBook } from "./wishlist.js";
import { escapeHtml, formatPrice, setElementText, setVisible } from "./utils.js";

let catalogBooks = [];
let currentBookSort = "featured";
let currentBookCategory = "all";
let searchRequestId = 0;
let searchDebounceTimer = null;

const fallbackBooks = [
  { title: "The Midnight Library", author: "Matt Haig", category: "Fiction", price: 42.9, rating: 4.8, sold: 148, date: "2026-01-15", cover: "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg" },
  { title: "Atomic Habits", author: "James Clear", category: "Non-Fiction", price: 55, rating: 4.9, sold: 260, date: "2026-01-22", cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" },
  { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", price: 39.9, rating: 4.7, sold: 96, date: "2025-11-10", cover: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg" },
  { title: "Wonder", author: "R. J. Palacio", category: "Children", price: 31.5, rating: 4.8, sold: 132, date: "2025-12-08", cover: "https://covers.openlibrary.org/b/isbn/9780375869020-L.jpg" },
  { title: "The Hobbit", author: "J. R. R. Tolkien", category: "Young Adults", price: 46, rating: 4.9, sold: 187, date: "2026-02-03", cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg" },
  { title: "Dune", author: "Frank Herbert", category: "Fiction", price: 49.9, rating: 4.6, sold: 156, date: "2026-02-12", cover: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg" }
];

function normalizeBook(book, index) {
  return {
    title: book.title || "Untitled Book",
    author: book.author || "Unknown Author",
    category: book.category || "General",
    price: Number(book.price) || 0,
    rating: Number(book.rating) || 4.5,
    sold: Number(book.sold) || 0,
    date: book.date || "2026-01-01",
    cover: book.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    originalIndex: index
  };
}

function normalizeApiBook(book, index) {
  const firstPublishYear = book.first_publish_year || 2024;
  const cover = book.cover_i
    ? `${CONFIG.openLibraryCoverUrl}/${book.cover_i}-L.jpg`
    : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c";

  return {
    title: book.title || "Untitled Book",
    author: book.author_name?.[0] || "Unknown Author",
    category: book.subject?.[0] || "General",
    price: 28 + (index % 12) * 3.5,
    rating: Number((4.1 + (index % 8) * 0.1).toFixed(1)),
    sold: Math.max(20, 180 - index * 7),
    date: `${firstPublishYear}-01-01`,
    cover,
    originalIndex: catalogBooks.length + index,
    source: "Open Library"
  };
}

async function loadBooksFromSource() {
  let jsonBooks = [];

  try {
    const response = await fetch(CONFIG.catalogPath);
    if (!response.ok) throw new Error("Catalog JSON not found");
    const books = await response.json();
    jsonBooks = books.map(normalizeBook);
  } catch (error) {
    console.warn("Using fallback catalog:", error);
    jsonBooks = fallbackBooks.map(normalizeBook);
  }

  try {
    const apiBooks = await loadBooksFromApi("popular books");
    return dedupeBooks([...jsonBooks, ...apiBooks]).map((book, index) => ({
      ...book,
      originalIndex: index
    }));
  } catch (error) {
    console.warn("API catalog unavailable, showing JSON catalog only:", error);
    return dedupeBooks(jsonBooks);
  }
}

async function loadBooksFromApi(keyword) {
  const value = keyword.trim();
  if (value.length < 2) return [];

  const url = new URL(CONFIG.openLibrarySearchUrl);
  url.searchParams.set("q", value);
  url.searchParams.set("limit", "12");
  url.searchParams.set("fields", "title,author_name,subject,cover_i,first_publish_year");

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Open Library search failed");
    const data = await response.json();
    return (data.docs || []).map(normalizeApiBook);
  } finally {
    window.clearTimeout(timeout);
  }
}

async function getSearchBooks(keyword) {
  const localMatches = catalogBooks.filter(book => {
    const searchText = `${book.title} ${book.author} ${book.category}`.toLowerCase();
    return searchText.includes(keyword.toLowerCase());
  });

  try {
    const apiMatches = await loadBooksFromApi(keyword);
    return dedupeBooks([...localMatches, ...apiMatches]);
  } catch (error) {
    console.warn("API search unavailable, showing JSON catalog results:", error);
    return localMatches;
  }
}

function dedupeBooks(books) {
  const seenTitles = new Set();
  return books.filter(book => {
    const key = book.title.toLowerCase();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
}

function findBookByTitle(title, source = catalogBooks) {
  const book = source.find(item => item.title === title);
  if (book && !catalogBooks.some(item => item.title === book.title)) {
    catalogBooks = dedupeBooks([...catalogBooks, book]);
  }
  if (book) return book;
  return catalogBooks.find(book => book.title === title);
}

function saveBookForDetail(book) {
  Store.saveSelectedBook({
    title: book.title,
    price: formatPrice(book.price),
    img: book.cover,
    author: book.author,
    category: book.category
  });
}

function openBookDetail(book) {
  saveBookForDetail(book);
  window.location.href = "detail.html";
}

function createBookCard(book) {
  const saved = isWishlisted(book.title);

  return `
    <article class="book-card" data-title="${escapeHtml(book.title)}">
      <div class="card-top">
        <button class="wish-btn ${saved ? "saved" : ""}" type="button" data-book-action="wishlist">
          ${saved ? "Saved" : "Save"}
        </button>
      </div>
      <img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)} cover">
      <h3>${escapeHtml(book.title)}</h3>
      <p class="price">${formatPrice(book.price)}</p>
      <p class="publisher">${escapeHtml(book.author)}</p>
      <p class="stock">${escapeHtml(book.category)}</p>
      <div class="meta">
        <span>${book.rating} rating</span>
        <span>${book.sold} sold</span>
        ${book.source ? `<span>${escapeHtml(book.source)}</span>` : ""}
      </div>
      <button type="button" data-book-action="cart">Add to Cart</button>
    </article>
  `;
}

function renderBookCards(container, books) {
  if (!container) return;
  container.innerHTML = books.map(createBookCard).join("");
}

function renderHomePage() {
  renderBookCards(document.getElementById("trendingBooks"), [...catalogBooks].sort((a, b) => b.sold - a.sold).slice(0, 8));
  renderBookCards(document.getElementById("recommendedBooks"), [...catalogBooks].sort((a, b) => b.rating - a.rating).slice(0, 6));
  renderBookCards(document.getElementById("categoryBooks"), catalogBooks);
  renderPopularCategories();
}

function populateBookCategoryFilter() {
  const select = document.getElementById("bookCategorySelect");
  if (!select) return;

  const categories = [...new Set(catalogBooks.map(book => book.category))].sort();
  select.innerHTML = `<option value="all">All categories</option>`;
  categories.forEach(category => {
    select.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`);
  });
  select.value = currentBookCategory;
}

function getBooksForCurrentCategory() {
  return currentBookCategory === "all"
    ? [...catalogBooks]
    : catalogBooks.filter(book => book.category === currentBookCategory);
}

function getSortedBooks(books) {
  return [...books].sort((a, b) => {
    if (currentBookSort === "best-selling") return b.sold - a.sold;
    if (currentBookSort === "az") return a.title.localeCompare(b.title);
    if (currentBookSort === "za") return b.title.localeCompare(a.title);
    if (currentBookSort === "price-low") return a.price - b.price;
    if (currentBookSort === "price-high") return b.price - a.price;
    if (currentBookSort === "date-old") return new Date(a.date) - new Date(b.date);
    if (currentBookSort === "date-new") return new Date(b.date) - new Date(a.date);
    return a.originalIndex - b.originalIndex;
  });
}

function updateBooksPageText(visibleCount) {
  const categoryText = currentBookCategory === "all" ? "all categories" : currentBookCategory;

  setElementText("booksPageTitle", currentBookCategory === "all"
    ? "Find books that match your mood."
    : `${currentBookCategory} books picked for you.`);
  setElementText("booksPageSubtitle", "Use smart search, category filters, and sorting to narrow the collection quickly.");
  setElementText("totalBooksCount", catalogBooks.length);
  setElementText("bookResultHeading", currentBookCategory === "all" ? "All Books" : currentBookCategory);
  setElementText("bookResultCount", `Showing ${visibleCount} book${visibleCount === 1 ? "" : "s"} in ${categoryText}`);
}

function renderBooksRecommendation(books = getBooksForCurrentCategory()) {
  const source = books.length ? books : catalogBooks;
  const recommended = [...source]
    .sort((a, b) => (b.rating * 100 + b.sold) - (a.rating * 100 + a.sold))
    .slice(0, 6);

  renderBookCards(document.getElementById("booksRecommendation"), recommended);
}

function renderFilteredBookPage() {
  const container = document.getElementById("categoryBooks");
  if (!container) return;

  const keyword = (document.getElementById("bookSearch")?.value || "").trim().toLowerCase();
  const categoryBooks = getBooksForCurrentCategory();
  const filtered = categoryBooks.filter(book => {
    const searchText = `${book.title} ${book.author} ${book.category}`.toLowerCase();
    return searchText.includes(keyword);
  });
  const sorted = getSortedBooks(filtered);

  renderBookCards(container, sorted);
  renderBooksRecommendation(categoryBooks);
  updateBooksPageText(sorted.length);

  const emptyState = document.getElementById("bookEmptyState");
  if (emptyState) emptyState.hidden = sorted.length !== 0;
}

function renderBooksPage() {
  applyInitialBookCategory();
  populateBookCategoryFilter();
  renderFilteredBookPage();
}

function renderPopularCategories() {
  const container = document.getElementById("popularCategories");
  if (!container) return;

  const groups = catalogBooks.reduce((result, book) => {
    result[book.category] = result[book.category] || [];
    result[book.category].push(book);
    return result;
  }, {});

  container.innerHTML = Object.entries(groups).slice(0, 8).map(([category, books]) => `
    <a class="popular-category-card" href="books.html?category=${encodeURIComponent(category)}">
      <h3>${escapeHtml(category)}</h3>
      <div class="category-covers">
        ${books.slice(0, 3).map(book => `<img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)} cover">`).join("")}
      </div>
    </a>
  `).join("");
}

function buildSuggestions(input, box, books, onSelect) {
  const value = input.trim().toLowerCase();
  box.innerHTML = "";
  if (!value) return;

  const matches = books.filter(book => {
    const searchText = `${book.title} ${book.author} ${book.category}`.toLowerCase();
    return searchText.includes(value);
  });

  if (matches.length === 0) {
    box.innerHTML = `<div class="suggestion-item no-result">No books found for "${escapeHtml(input)}"</div>`;
    return;
  }

  box.innerHTML = matches.slice(0, 6).map(book => `
    <button class="suggestion-item" type="button" data-suggestion-title="${escapeHtml(book.title)}">
      <img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)} cover">
      <span>
        <strong>${escapeHtml(book.title)}</strong>
        <small>${escapeHtml(book.author)} - ${escapeHtml(book.category)} - ${formatPrice(book.price)}${book.source ? " - API" : ""}</small>
      </span>
    </button>
  `).join("");

  box.querySelectorAll("[data-suggestion-title]").forEach(item => {
    item.addEventListener("click", () => onSelect(item.dataset.suggestionTitle));
  });
}

function setSearchLoading(box, message = "Searching JSON catalog and book API...") {
  if (!box) return;
  box.innerHTML = `<div class="suggestion-item no-result">${message}</div>`;
}

async function runHomeSearch() {
  const input = document.getElementById("searchInput");
  const box = document.getElementById("suggestionBox");
  const searchResults = document.getElementById("categoryBooks");
  if (!input || !box || !searchResults) return;

  const requestId = ++searchRequestId;
  const value = input.value.trim();

  setVisible(document.getElementById("trendingSection"), !value);
  setVisible(document.getElementById("recommendedSection"), !value);
  setVisible(document.getElementById("categorySection"), !value);
  setVisible(searchResults, Boolean(value), "grid");

  if (!value) {
    searchResults.innerHTML = "";
    box.innerHTML = "";
    return;
  }

  setSearchLoading(box);
  const matches = await getSearchBooks(value);
  if (requestId !== searchRequestId) return;

  renderBookCards(searchResults, matches);
  buildSuggestions(input.value, box, matches, title => {
    const book = findBookByTitle(title, matches);
    if (book) openBookDetail(book);
  });
}

async function runBookPageSearch() {
  const input = document.getElementById("bookSearch");
  const box = document.getElementById("suggestionBox");
  if (!input || !box) return;

  const requestId = ++searchRequestId;
  const value = input.value.trim();

  if (!value) {
    box.innerHTML = "";
    renderFilteredBookPage();
    return;
  }

  setSearchLoading(box);
  const matches = await getSearchBooks(value);
  if (requestId !== searchRequestId) return;

  const container = document.getElementById("categoryBooks");
  renderBookCards(container, getSortedBooks(matches));
  updateBooksPageText(matches.length);

  const emptyState = document.getElementById("bookEmptyState");
  if (emptyState) emptyState.hidden = matches.length !== 0;

  buildSuggestions(input.value, box, matches, title => {
    input.value = title;
    box.innerHTML = "";
    const selected = findBookByTitle(title, matches);
    if (selected) renderBookCards(container, [selected]);
  });
}

function debounceSearch(callback) {
  window.clearTimeout(searchDebounceTimer);
  searchDebounceTimer = window.setTimeout(callback, 350);
}

function updateBookCategoryUrl() {
  if (!document.body.classList.contains("books-body")) return;

  const url = new URL(window.location.href);
  if (currentBookCategory === "all") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", currentBookCategory);
  }
  window.history.replaceState({}, "", url);
}

function applyInitialBookCategory() {
  const category = new URLSearchParams(window.location.search).get("category");
  if (category && catalogBooks.some(book => book.category === category)) {
    currentBookCategory = category;
  }
}

function clearBookFilters() {
  currentBookCategory = "all";
  currentBookSort = "featured";

  const categorySelect = document.getElementById("bookCategorySelect");
  const sortSelect = document.getElementById("bookSortSelect");
  const search = document.getElementById("bookSearch");
  const box = document.getElementById("suggestionBox");

  if (categorySelect) categorySelect.value = "all";
  if (sortSelect) sortSelect.value = "featured";
  if (search) search.value = "";
  if (box) box.innerHTML = "";

  updateBookCategoryUrl();
  renderFilteredBookPage();
}

function initCatalogEvents() {
  document.addEventListener("click", event => {
    const actionButton = event.target.closest("[data-book-action]");
    const card = event.target.closest(".book-card");
    if (!card) return;

    const book = findBookByTitle(card.dataset.title);
    if (!book) return;

    if (actionButton?.dataset.bookAction === "cart") {
      addBookToCart(book);
      return;
    }

    if (actionButton?.dataset.bookAction === "wishlist") {
      const saved = toggleWishlistBook({
        title: book.title,
        price: formatPrice(book.price),
        img: book.cover
      });
      actionButton.textContent = saved ? "Saved" : "Save";
      actionButton.classList.toggle("saved", saved);
      return;
    }

    openBookDetail(book);
  });

  document.getElementById("searchInput")?.addEventListener("input", () => debounceSearch(runHomeSearch));
  document.getElementById("homeSearchButton")?.addEventListener("click", runHomeSearch);
  document.getElementById("searchInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      runHomeSearch();
    }
  });
  document.getElementById("bookSearch")?.addEventListener("input", () => debounceSearch(runBookPageSearch));
  document.getElementById("bookSearchButton")?.addEventListener("click", runBookPageSearch);
  document.getElementById("bookSearch")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      runBookPageSearch();
    }
  });

  document.getElementById("bookCategorySelect")?.addEventListener("change", event => {
    currentBookCategory = event.target.value || "all";
    updateBookCategoryUrl();
    renderFilteredBookPage();
  });

  document.getElementById("bookSortSelect")?.addEventListener("change", event => {
    currentBookSort = event.target.value || "featured";
    renderFilteredBookPage();
  });

  document.getElementById("clearBookFilters")?.addEventListener("click", clearBookFilters);
  document.getElementById("emptyClearBookFilters")?.addEventListener("click", clearBookFilters);
}

export async function initCatalog() {
  if (!document.querySelector(".book-card, #trendingBooks, #categoryBooks, #popularCategories")) {
    return;
  }

  catalogBooks = await loadBooksFromSource();
  initCatalogEvents();

  if (document.body.classList.contains("home-body")) renderHomePage();
  if (document.body.classList.contains("books-body")) renderBooksPage();
}
