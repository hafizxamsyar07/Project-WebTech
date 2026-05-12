
console.log("Website ready!");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

//CART FUNCTION
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  loadCartPage();
}

function addToCart(button, event) {
  event.stopPropagation();

  const bookCard = button.parentElement;
  const img = bookCard.querySelector("img").src;
  const title = bookCard.querySelector("h3").innerText;
  const priceElement = bookCard.querySelector(".price");
  const priceText = priceElement.innerText;
  const price = parseInt(priceText.replace("RM", "").trim())

  let existing = cart.find(item => item.title === title);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ title: title, price: price, qty: 1, img: img });
  }

  showToast("Added to cart 🛒");
  saveCart();
  renderCart();
}


function openBook(event, card) {
  const title = card.querySelector("h3").innerText;
  const price = card.querySelector(".price").innerText;
  const img = card.querySelector("img").src;

  const book = {
    title,
    price,
    img
  };

  localStorage.setItem("selectedBook", JSON.stringify(book));

  window.location.href = "detail.html";
}

function increaseQty(title) {
  let item = cart.find(i => i.title === title);
  if (item) item.qty++;

  saveCart();
  loadCartPage();
}

function decreaseQty(title) {
  let item = cart.find(i => i.title === title);

  if (item) {
    item.qty--;
    if (item.qty <= 0) {
      removeItem(title);
      return;
    }
  }

  saveCart();
  loadCartPage();
}

function removeItem(title) {
  cart = cart.filter(item => item.title !== title);

  saveCart();
  loadCartPage();
}

//Smart Search
function smartSearch() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const box = document.getElementById("suggestionBox");

  const trending = document.getElementById("trendingSection");
  const recommended = document.getElementById("recommendedSection");
  const categorySection = document.getElementById("categorySection");
  const sortWrapper = document.getElementById("sortWrapper");

  const cards = document.querySelectorAll("#categoryBooks .book-card");

  box.innerHTML = "";

  const isSearching = input !== "";

  // =========================
  // 🔥 RESET STATE (NO SEARCH)
  // =========================
  if (input === "") {
  cards.forEach(card => {
    card.style.display = "block";

    // 🔥 RESET HIGHLIGHT
    const titleElement = card.querySelector("h3");
    titleElement.innerHTML = titleElement.innerText;
  });

  trending.style.display = "block";
  recommended.style.display = "block";
  categorySection.style.display = "block";

  box.innerHTML = ""; // clear suggestion

  return;
}

  // =========================
  // 🔥 SEARCH STATE
  // =========================
  trending.style.display = "none";
  recommended.style.display = "none";
  categorySection.style.display = "none";

  let matches = [];

  const suggestionBox = document.getElementById("suggestionBox");

  cards.forEach(card => {
    const titleElement = card.querySelector("h3");
    const title = titleElement.innerText.toLowerCase();

    if (title.includes(input)) {
      card.style.display = "block";
      matches.push(card.querySelector("h3").innerText);
      titleElement.innerHTML = highlightText(titleElement.innerText, input);
    } else {
      card.style.display = "none";
      titleElement.innerHTML = titleElement.innerText;
    }
  });

  if (matches.length === 0) {
    suggestionBox.innerHTML = `
    <div class="suggestion-item">
      ❌ No books found for "${input}"
    </div>
  `;
  }

  // =========================
  // 🔥 SUGGESTIONS
  // =========================
  matches.forEach(title => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerText = title;

    div.onclick = () => selectBook(title);

    box.appendChild(div);
  });
}

  // Search Book Page
  const searchInput = document.getElementById("bookSearch");

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    const books = document.querySelectorAll("#categoryBooks .book-card");

    books.forEach(card => {
      const titleElement = card.querySelector("h3");
      const title = titleElement.innerText;

      if (title.toLowerCase().includes(keyword)) {
        card.style.display = "block";

        const regex = new RegExp(`(${keyword})`, "gi");
        titleElement.innerHTML = title.replace(regex, `<span class="highlight">$1</span>`);
      } else {
        card.style.display = "none";
        titleElement.innerHTML = title;
      }
    });
  });
}

function selectBook(title) {
  const cards = document.querySelectorAll(".book-card");

  cards.forEach(card => {
    const bookTitle = card.querySelector("h3").innerText;

    if (bookTitle === title) {
      card.click(); // ini auto trigger openBook
    }
  });

  document.getElementById("searchInput").value = title;
  document.getElementById("suggestionBox").innerHTML = "";
}

function toggleSortMenu() {
  const menu = document.getElementById("sortMenu");
  menu.classList.toggle("show");
}

function sortBooks(type) {
  const container = document.getElementById("categoryBooks");
  const cards = Array.from(container.querySelectorAll(".book-card"));

  let sorted = [...cards];

  if (type === "az") {
    sorted.sort((a, b) =>
      a.querySelector("h3").innerText.localeCompare(
        b.querySelector("h3").innerText
      )
    );
  }

  else if (type === "za") {
    sorted.sort((a, b) =>
      b.querySelector("h3").innerText.localeCompare(
        a.querySelector("h3").innerText
      )
    );
  }

  else if (type === "rating") {
    sorted.sort((a, b) => {
      return (parseFloat(b.dataset.rating) || 0) - (parseFloat(a.dataset.rating) || 0);
    });
  }

  else if (type === "popular") {
    sorted.sort((a, b) => {
      return (parseInt(b.dataset.sold) || 0) - (parseInt(a.dataset.sold) || 0);
    });
  }

  container.innerHTML = "";
  sorted.forEach(card => container.appendChild(card));
}


  // =========================
  // 🔥 WISHLIST
  // =========================
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function toggleWishlist(button) {
  const card = button.closest(".book-card");

  const title = card.querySelector("h3").innerText;
  const price = card.querySelector(".price").innerText;
  const img = card.querySelector("img").src;

  let exists = wishlist.find(item => item.title === title);

  if (exists) {
    wishlist = wishlist.filter(item => item.title !== title);
    button.innerText = "🤍";
  } else {
    wishlist.push({ title, price, img });
    button.innerText = "❤️";
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  console.log("Wishlist:", wishlist);
}


// RENDER WISHLIST PAGE
function renderWishlistPage() {
  const container = document.getElementById("wishlist-container");

  if (!container) return;

  container.innerHTML = "";

  if (wishlist.length === 0) {
    container.innerHTML = "<p>No items in wishlist</p>";
    return;
  }

  wishlist.forEach(item => {
    const div = document.createElement("div");
    div.className = "wishlist-card";

    div.innerHTML = `
      <img src="${item.img}" />
      <h3>${item.title}</h3>
      <p>${item.price}</p>
      <button onclick="removeFromWishlistPage('${item.title}')">Remove</button>
    `;

    container.appendChild(div);
  });
}

// REMOVE WISHLIST
function removeFromWishlistPage(title) {
  wishlist = wishlist.filter(item => item.title !== title);

  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  renderWishlistPage();
}

const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-links a").forEach(link => {
  const linkPage = link.getAttribute("href");

  if (linkPage === "" && linkPage === "index.html") {
    link.classList.add("active");
  } else if (linkPage === currentPage) {
    link.classList.add("active");
  }
});

function loadDetail() {
  const book = JSON.parse(localStorage.getItem("selectedBook"));

  if (!book) return;

  document.getElementById("book-title").innerText = book.title;
  document.getElementById("book-price").innerText = book.price;
  document.getElementById("book-img").src = book.img;
}

function addToCartFromDetail() {
  const book = JSON.parse(localStorage.getItem("selectedBook"));

  const price = parseInt(book.price.replace("RM", ""));

  let existing = cart.find(item => item.title === book.title);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      title: book.title,
      price: price,
      qty: 1,
      img: book.img
    });
  }

  saveCart();
  showToast("Added to cart 🛒");
}

function loadCartPage() {
  const container = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("cart-total");
  const checkoutTotal = document.getElementById("checkout-total");
  const cartCount = document.getElementById("cart-count");

  if (!container) return;

  container.innerHTML = "";
  let total = 0;
  let itemCount = 0;

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart">Your cart is empty. Add some books to start checkout.</div>`;
  }

  cart.forEach(item => {
    total += item.price * item.qty;
    itemCount += item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
  <img src="${item.img}" />

  <div class="cart-info">
    <h3>${item.title}</h3>
    <p class="price">RM${item.price}</p>

    <div class="qty-control">
      <button onclick="decreaseQty('${item.title}')">-</button>
      <span>${item.qty}</span>
      <button onclick="increaseQty('${item.title}')">+</button>
    </div>
  </div>

  <div class="cart-right">
    <p class="subtotal">RM${item.price * item.qty}</p>
    <button class="remove-btn" onclick="removeItem('${item.title}')">Remove</button>
  </div>
`;

    container.appendChild(div);
  });

  if (totalDisplay) totalDisplay.innerText = "RM" + total;
  if (checkoutTotal) checkoutTotal.innerText = "RM" + total;
  if (cartCount) cartCount.innerText = itemCount + (itemCount === 1 ? " item" : " items");
}

loadCartPage();

function placeOrder() {
  const name = document.getElementById("checkout-name").value.trim();
  const phone = document.getElementById("checkout-phone").value.trim();
  const address = document.getElementById("checkout-address").value.trim();
  const payment = document.getElementById("checkout-payment").value;

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!name || !phone || !address) {
    alert("Please fill in your name, phone number, and address.");
    return;
  }

  alert("Order placed successfully! Payment method: " + payment);

  cart = [];
  saveCart();
  loadCartPage();

  document.getElementById("checkout-name").value = "";
  document.getElementById("checkout-phone").value = "";
  document.getElementById("checkout-address").value = "";
}

//ACCESSIBILITY
let currentFontSize = 100;

// toggle panel
const toggleBtn = document.querySelector(".accessibility-tab");
const panel = document.querySelector(".accessibility-panel");

toggleBtn.addEventListener("click", () => {
  panel.classList.toggle("show");
});

document.addEventListener("click", function (e) {
  const isClickInside = panel.contains(e.target) || toggleBtn.contains(e.target);

  if (!isClickInside) {
    panel.classList.remove("show");
  }
});

function increaseText() {
  currentFontSize += 10;
  document.body.style.fontSize = currentFontSize + "%";
}

function decreaseText() {
  currentFontSize -= 10;
  document.body.style.fontSize = currentFontSize + "%";
}

function toggleGrayscale() {
  document.body.classList.toggle("grayscale");
}

function toggleContrast() {
  document.body.classList.toggle("high-contrast");
}

function toggleNegative() {
  document.body.classList.toggle("negative");
}

function toggleLight() {
  document.body.classList.toggle("light-bg");
}

function toggleUnderline() {
  document.body.classList.toggle("underline-links");
}

function toggleFont() {
  document.body.classList.toggle("readable-font");
}

function resetAccessibility() {
  document.body.classList.remove(
    "grayscale",
    "high-contrast",
    "negative",
    "light-bg",
    "underline-links",
    "readable-font"
  );

  document.body.style.fontSize = "100%";
}

//sort by genre
function filterGenre(genre) {
  const cards = document.querySelectorAll("#categoryBooks .book-card");
  const buttons = document.querySelectorAll(".genre-box button");

  // filter
  cards.forEach(card => {
    const cardGenre = card.getAttribute("data-genre");

    if (genre === "all" || cardGenre === genre) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  // highlight button
  buttons.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
}

function getBookPrice(card) {
  const priceText = card.querySelector(".price")?.innerText || "RM0";
  return parseFloat(priceText.replace("RM", "").trim()) || 0;
}

function getBookTitle(card) {
  return card.querySelector("h3")?.innerText.trim() || "";
}

function prepareBookSortData(cards) {
  cards.forEach((card, index) => {
    if (!card.dataset.originalIndex) card.dataset.originalIndex = index;
    if (!card.dataset.sold) card.dataset.sold = String(120 - index * 3);
    if (!card.dataset.date) card.dataset.date = String(20260101 + index);
  });
}

function sortBookPage(type) {
  const container = document.getElementById("categoryBooks");
  if (!container) return;

  const cards = Array.from(container.querySelectorAll(".book-card"));
  prepareBookSortData(cards);

  const sorted = [...cards].sort((a, b) => {
    if (type === "best-selling") return Number(b.dataset.sold) - Number(a.dataset.sold);
    if (type === "az") return getBookTitle(a).localeCompare(getBookTitle(b));
    if (type === "za") return getBookTitle(b).localeCompare(getBookTitle(a));
    if (type === "price-low") return getBookPrice(a) - getBookPrice(b);
    if (type === "price-high") return getBookPrice(b) - getBookPrice(a);
    if (type === "date-old") return Number(a.dataset.date) - Number(b.dataset.date);
    if (type === "date-new") return Number(b.dataset.date) - Number(a.dataset.date);
    return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
  });

  sorted.forEach(card => container.appendChild(card));
}

function smartSearch() {
  const searchInput = document.getElementById("searchInput");
  const box = document.getElementById("suggestionBox");
  const trending = document.getElementById("trendingSection");
  const recommended = document.getElementById("recommendedSection");
  const categorySection = document.getElementById("categorySection");
  const cards = document.querySelectorAll("#categoryBooks .book-card");

  if (!searchInput || !box) return;

  const input = searchInput.value.trim().toLowerCase();
  box.innerHTML = "";

  if (input === "") {
    cards.forEach(card => {
      card.style.display = "block";
      const titleElement = card.querySelector("h3");
      titleElement.innerHTML = titleElement.innerText;
    });

    if (trending) trending.style.display = "block";
    if (recommended) recommended.style.display = "block";
    if (categorySection) categorySection.style.display = "block";
    return;
  }

  if (trending) trending.style.display = "none";
  if (recommended) recommended.style.display = "none";
  if (categorySection) categorySection.style.display = "none";

  const matches = [];

  cards.forEach(card => {
    const titleElement = card.querySelector("h3");
    const title = titleElement.innerText;
    const searchableTitle = title.toLowerCase();
    const genre = card.getAttribute("data-genre") || "book";
    const price = card.querySelector(".price").innerText;
    const img = card.querySelector("img").src;

    if (searchableTitle.includes(input)) {
      card.style.display = "block";
      titleElement.innerHTML = highlightText(title, input);
      matches.push({ title, genre, price, img });
    } else {
      card.style.display = "none";
      titleElement.innerHTML = title;
    }
  });

  if (matches.length === 0) {
    box.innerHTML = `
      <div class="suggestion-item no-result">
        No books found for "${input}"
      </div>
    `;
    return;
  }

  matches.slice(0, 6).forEach(book => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `
      <img src="${book.img}" alt="${book.title}">
      <div>
        <strong>${highlightText(book.title, input)}</strong>
        <span>${book.genre} - ${book.price}</span>
      </div>
    `;

    div.onclick = () => selectBook(book.title);
    box.appendChild(div);
  });
}

const featuredBooks = [];

let featuredIndex = 0;

function showFeaturedBook(index) {
  const wrapper = document.getElementById("featuredBook");
  const img = document.getElementById("featured-img");
  const label = document.getElementById("featured-label");
  const title = document.getElementById("featured-title");
  const price = document.getElementById("featured-price");
  const dots = document.querySelectorAll(".featured-dots button");

  if (!wrapper || !img || !label || !title || !price) return;

  const book = featuredBooks[index];
  if (!book) return;
  wrapper.classList.add("is-changing");

  setTimeout(() => {
    img.src = book.img;
    label.innerText = book.label;
    title.innerText = book.title;
    price.innerText = book.price;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });

    wrapper.classList.remove("is-changing");
  }, 250);
}

function startFeaturedSlider() {
  if (!document.getElementById("featuredBook")) return;

  document.querySelectorAll(".featured-dots button").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      featuredIndex = index;
      showFeaturedBook(featuredIndex);
    });
  });

  setInterval(() => {
    if (featuredBooks.length === 0) return;
    featuredIndex = (featuredIndex + 1) % featuredBooks.length;
    showFeaturedBook(featuredIndex);
  }, 3000);
}

startFeaturedSlider();


const input = document.getElementById("searchInput");

if (input) {
  input.addEventListener("input", smartSearch);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      smartSearch();
    }
  });
}

function highlightText(text, keyword) {
  return text;
}

let catalogBooks = [];
let currentBookSort = "featured";
let currentBookCategory = "all";

async function loadBooksFromSource() {
  let jsonBooks = [];
  let apiBooks = [];

  try {
    const response = await fetch("books.json");
    if (!response.ok) throw new Error("JSON not found");
    const books = await response.json();
    jsonBooks = books.map(normalizeJsonBook);
  } catch (error) {
    jsonBooks = [];
  }

  try {
    apiBooks = await loadBooksFromApi();
  } catch (error) {
    apiBooks = [];
  }

  const merged = [...jsonBooks, ...apiBooks];
  const unique = [];
  const seen = new Set();

  merged.forEach((book, index) => {
    const key = book.title.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    unique.push({ ...book, originalIndex: index });
  });

  return unique;
}

async function loadBooksFromApi() {
  const response = await fetch("https://openlibrary.org/search.json?q=popular%20books&limit=12");
  const data = await response.json();

  return data.docs.slice(0, 12).map((book, index) => ({
    title: book.title || "Untitled Book",
    author: book.author_name?.[0] || "Unknown Author",
    category: book.subject?.[0] || "General",
    price: 25 + index * 3,
    rating: Math.max(4, 5 - index * 0.05).toFixed(1),
    sold: 180 - index * 8,
    date: String(book.first_publish_year || 2024) + "-01-01",
    cover: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"
  }));
}

function normalizeJsonBook(book, index) {
  return {
    title: book.title,
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

function formatPrice(price) {
  return "RM" + Number(price).toFixed(2);
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.dataset.genre = book.category.toLowerCase();
  card.dataset.sold = book.sold;
  card.dataset.rating = book.rating;
  card.dataset.date = book.date.replaceAll("-", "");
  card.dataset.originalIndex = book.originalIndex;
  card.onclick = event => openBook(event, card);

  card.innerHTML = `
    <div class="card-top">
      <button class="wish-btn" onclick="toggleWishlist(this); event.stopPropagation();">♡</button>
    </div>
    <img src="${book.cover}" alt="${book.title}">
    <h3>${book.title}</h3>
    <p class="price">${formatPrice(book.price)}</p>
    <p class="publisher">${book.author}</p>
    <p class="stock">${book.category}</p>
    <div class="meta">
      <span class="rating">${book.rating} rating</span>
      <span class="sold">${book.sold} sold</span>
    </div>
    <button onclick="addToCart(this, event)">Add to Cart</button>
  `;

  return card;
}

function renderBookCards(container, books) {
  if (!container) return;
  container.innerHTML = "";
  books.forEach(book => container.appendChild(createBookCard(book)));
}

function renderHomeFromCatalog() {
  renderBookCards(document.getElementById("trendingBooks"), [...catalogBooks].sort((a, b) => b.sold - a.sold).slice(0, 8));
  renderBookCards(document.getElementById("recommendedBooks"), [...catalogBooks].sort((a, b) => b.rating - a.rating).slice(0, 6));
  renderBookCards(document.getElementById("categoryBooks"), catalogBooks);
  renderPopularCategories();
  setupFeaturedFromCatalog();
}

function renderBooksPageFromCatalog() {
  populateBookCategoryFilter();
  renderBooksRecommendation();
  sortBookPage(currentBookSort);
}

function populateBookCategoryFilter() {
  const select = document.getElementById("bookCategorySelect");
  if (!select) return;

  const categories = [...new Set(catalogBooks.map(book => book.category))].sort();
  select.innerHTML = `<option value="all">All categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.innerText = category;
    select.appendChild(option);
  });
}

function renderBooksRecommendation() {
  const container = document.getElementById("booksRecommendation");
  if (!container) return;

  const recommended = [...catalogBooks]
    .sort((a, b) => (b.rating * 100 + b.sold) - (a.rating * 100 + a.sold))
    .slice(0, 6);

  renderBookCards(container, recommended);
}

function renderPopularCategories() {
  const container = document.getElementById("popularCategories");
  if (!container) return;

  const groups = {};
  catalogBooks.forEach(book => {
    groups[book.category] = groups[book.category] || [];
    groups[book.category].push(book);
  });

  container.innerHTML = "";

  Object.entries(groups).slice(0, 8).forEach(([category, books]) => {
    const card = document.createElement("a");
    card.href = "books.html";
    card.className = "popular-category-card";
    card.innerHTML = `
      <h3>${category}</h3>
      <div class="category-covers">
        ${books.slice(0, 3).map(book => `<img src="${book.cover}" alt="${book.title}">`).join("")}
      </div>
    `;
    container.appendChild(card);
  });
}

function setupFeaturedFromCatalog() {
  const wrapper = document.getElementById("featuredBook");
  const dots = document.getElementById("featured-dots");
  if (!wrapper || !dots || catalogBooks.length === 0) return;

  featuredBooks.length = 0;
  catalogBooks.slice(0, 3).forEach(book => {
    featuredBooks.push({
      label: "Featured Pick",
      title: book.title,
      price: formatPrice(book.price),
      img: book.cover
    });
  });

  dots.innerHTML = featuredBooks.map((_, index) => (
    `<button class="${index === 0 ? "active" : ""}" type="button" aria-label="Featured book ${index + 1}"></button>`
  )).join("");

  dots.querySelectorAll("button").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      featuredIndex = index;
      showFeaturedBook(featuredIndex);
    });
  });

  featuredIndex = 0;
  showFeaturedBook(0);
}

function applyBookSearch(keyword, scopeSelector) {
  const books = document.querySelectorAll(scopeSelector);
  const value = keyword.trim().toLowerCase();

  books.forEach(card => {
    const title = card.querySelector("h3")?.innerText.toLowerCase() || "";
    const author = card.querySelector(".publisher")?.innerText.toLowerCase() || "";
    const category = card.querySelector(".stock")?.innerText.toLowerCase() || "";
    card.style.display = title.includes(value) || author.includes(value) || category.includes(value) ? "block" : "none";
  });
}

function sortBookPage(type) {
  currentBookSort = type || currentBookSort;
  const container = document.getElementById("categoryBooks");
  if (!container || catalogBooks.length === 0) return;

  const filtered = currentBookCategory === "all"
    ? [...catalogBooks]
    : catalogBooks.filter(book => book.category === currentBookCategory);

  const sorted = filtered.sort((a, b) => {
    if (currentBookSort === "best-selling") return b.sold - a.sold;
    if (currentBookSort === "az") return a.title.localeCompare(b.title);
    if (currentBookSort === "za") return b.title.localeCompare(a.title);
    if (currentBookSort === "price-low") return a.price - b.price;
    if (currentBookSort === "price-high") return b.price - a.price;
    if (currentBookSort === "date-old") return new Date(a.date) - new Date(b.date);
    if (currentBookSort === "date-new") return new Date(b.date) - new Date(a.date);
    if (currentBookSort === "relevant") return b.rating - a.rating;
    return a.originalIndex - b.originalIndex;
  });

  renderBookCards(container, sorted);
}

function filterBookPage(category) {
  currentBookCategory = category || "all";
  sortBookPage(currentBookSort);

  const bookSearch = document.getElementById("bookSearch");
  if (bookSearch && bookSearch.value.trim()) {
    applyBookSearch(bookSearch.value, "#categoryBooks .book-card");
  }
}

function smartSearch() {
  const input = document.getElementById("searchInput");
  const box = document.getElementById("suggestionBox");
  if (!input || !box) return;

  const value = input.value.trim().toLowerCase();
  box.innerHTML = "";
  applyBookSearch(value, "#categoryBooks .book-card");

  if (!value) {
    document.getElementById("trendingSection").style.display = "block";
    document.getElementById("recommendedSection").style.display = "block";
    document.getElementById("categorySection").style.display = "block";
    document.getElementById("categoryBooks").style.display = "none";
    return;
  }

  document.getElementById("trendingSection").style.display = "none";
  document.getElementById("recommendedSection").style.display = "none";
  document.getElementById("categorySection").style.display = "none";
  document.getElementById("categoryBooks").style.display = "grid";

  const matches = catalogBooks.filter(book =>
    book.title.toLowerCase().includes(value) ||
    book.author.toLowerCase().includes(value) ||
    book.category.toLowerCase().includes(value)
  );

  if (matches.length === 0) {
    box.innerHTML = `<div class="suggestion-item no-result">No books found for "${value}"</div>`;
    return;
  }

  matches.slice(0, 6).forEach(book => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <div>
        <strong>${book.title}</strong>
        <span>${book.category} - ${formatPrice(book.price)}</span>
      </div>
    `;
    div.onclick = () => selectBook(book.title);
    box.appendChild(div);
  });
}

async function initBookCatalog() {
  catalogBooks = await loadBooksFromSource();

  if (document.body.classList.contains("home-body")) {
    renderHomeFromCatalog();
  }

  if (document.getElementById("bookSortSelect")) {
    renderBooksPageFromCatalog();
  }

  const homeSearch = document.getElementById("searchInput");
  if (homeSearch) homeSearch.addEventListener("input", smartSearch);

  const bookSearch = document.getElementById("bookSearch");
  if (bookSearch) {
    bookSearch.addEventListener("input", () => {
      applyBookSearch(bookSearch.value, "#categoryBooks .book-card");
    });
  }
}

initBookCatalog();

document.addEventListener("DOMContentLoaded", () => {
  const sortWrapper = document.getElementById("sortWrapper");
  if (sortWrapper) {
    sortWrapper.style.display = "block";
  }
});

