
console.log("Website ready!");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const EMAILJS_SERVICE_ID = "service_t7dplie";
const EMAILJS_TEMPLATE_ID = "template_51biafn";
const EMAILJS_PUBLIC_KEY = "lGjEsl-33gcenlZFr";
const OWNER_EMAIL = "hafizamsyar146@gmail.com";

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

  const searchInput = document.getElementById("searchInput") || document.getElementById("bookSearch");
  const suggestionBox = document.getElementById("suggestionBox");
  if (searchInput) searchInput.value = title;
  if (suggestionBox) suggestionBox.innerHTML = "";
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
  const count = document.getElementById("wishlist-count");
  const helper = document.getElementById("wishlist-helper");

  if (!container) return;

  container.innerHTML = "";
  if (count) count.innerText = wishlist.length;
  if (helper) {
    helper.innerText = wishlist.length === 0
      ? "Your saved books will appear below."
      : `${wishlist.length} saved book${wishlist.length === 1 ? "" : "s"} ready to review.`;
  }

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="wishlist-empty">
        <strong>No saved books yet</strong>
        <span>Browse the collection and tap the heart button on any book you like.</span>
        <a href="books.html">Browse Books</a>
      </div>
    `;
    return;
  }

  wishlist.forEach(item => {
    const div = document.createElement("div");
    div.className = "wishlist-card";
    div.onclick = () => openBookFromWishlist(item);

    div.innerHTML = `
      <img src="${item.img}" />
      <div class="wishlist-card-content">
        <h3>${item.title}</h3>
        <p class="price">${item.price}</p>
        <div class="wishlist-actions">
          <button class="add-cart-btn" onclick="addWishlistItemToCart('${item.title}'); event.stopPropagation();">Add to Cart</button>
          <button class="remove-btn" onclick="removeFromWishlistPage('${item.title}'); event.stopPropagation();">Remove</button>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function openBookFromWishlist(item) {
  localStorage.setItem("selectedBook", JSON.stringify({
    title: item.title,
    price: item.price,
    img: item.img
  }));
  window.location.href = "detail.html";
}

function addWishlistItemToCart(title) {
  const item = wishlist.find(book => book.title === title);
  if (!item) return;

  const price = parseFloat(String(item.price).replace("RM", "").trim()) || 0;
  const existing = cart.find(cartItem => cartItem.title === item.title);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      title: item.title,
      price,
      qty: 1,
      img: item.img
    });
  }

  saveCart();
  showToast("Added to cart");
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

async function placeOrder() {
  const name = document.getElementById("checkout-name").value.trim();
  const phone = document.getElementById("checkout-phone").value.trim();
  const email = document.getElementById("checkout-email").value.trim();
  const address = document.getElementById("checkout-address").value.trim();
  const payment = document.getElementById("checkout-payment").value;

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!name || !phone || !email || !address) {
    alert("Please fill in your name, phone number, email, and address.");
    return;
  }

  const order = buildOrderReceipt(name, phone, email, address, payment);
  console.log("Order receipt data:", order);

  try {
    await sendOrderReceipt(order);
    alert("Order placed successfully! Receipt has been sent to " + email);
  } catch (error) {
    console.error("EmailJS error:", error);
    alert("Order placed successfully, but the receipt email could not be sent. Please check EmailJS setup.");
  }

  cart = [];
  saveCart();
  loadCartPage();

  document.getElementById("checkout-name").value = "";
  document.getElementById("checkout-phone").value = "";
  document.getElementById("checkout-email").value = "";
  document.getElementById("checkout-address").value = "";
}

function buildOrderReceipt(name, phone, email, address, payment) {
  const now = new Date();
  const items = cart.map(item => ({
    title: item.title,
    qty: item.qty,
    price: item.price,
    subtotal: item.price * item.qty
  }));
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    orderId: "SBS-" + Date.now(),
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    customerAddress: address,
    paymentMethod: payment,
    ownerEmail: OWNER_EMAIL,
    orderDate: now.toLocaleDateString("en-MY"),
    orderTime: now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }),
    orderDateTime: now.toLocaleString("en-MY"),
    items,
    itemsText: items.map(item => `${item.title} x${item.qty} - RM${item.subtotal.toFixed(2)}`).join("\n"),
    total,
    totalText: "RM" + total.toFixed(2)
  };
}

function getEmailJsClient() {
  if (!window.emailjs) return null;
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  return emailjs;
}

async function sendOrderReceipt(order) {
  const client = getEmailJsClient();
  if (!client) throw new Error("EmailJS library is not loaded.");

  const templateParams = {
    order_id: order.orderId,
    customer_email: order.customerEmail,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    payment_method: order.paymentMethod,
    order_items: order.itemsText,
    items: order.itemsText,
    time: order.orderTime,
    order_time: order.orderTime,
    date: order.orderDate,
    order_date: order.orderDate,
    order_datetime: order.orderDateTime,
    total: order.totalText,
    order_total: order.totalText,
    total_amount: order.totalText,
    owner_email: order.ownerEmail,
    reply_to: order.customerEmail
  };

  return Promise.all([
    client.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      ...templateParams,
      to_email: order.customerEmail,
      recipient_type: "Customer receipt"
    }),
    client.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      ...templateParams,
      to_email: order.ownerEmail,
      recipient_type: "Owner order notification"
    })
  ]);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

//ACCESSIBILITY
let currentFontSize = 100;

function setupAccessibilityPanel() {
  if (!document.getElementById("accessibility-toggle")) {
    const toggle = document.createElement("button");
    toggle.id = "accessibility-toggle";
    toggle.className = "accessibility-tab";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open accessibility tools");
    toggle.innerText = "A";
    document.body.appendChild(toggle);
  }

  let panel = document.getElementById("accessibility-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "accessibility-panel";
    panel.className = "accessibility-panel";
    document.body.appendChild(panel);
  }

  if (!panel.querySelector(".accessibility-panel-header")) {
    panel.innerHTML = `
      <div class="accessibility-panel-header">
        <strong>Accessibility</strong>
        <button type="button" class="accessibility-close" aria-label="Close accessibility tools">x</button>
      </div>
      <div class="accessibility-grid">
        <button type="button" onclick="increaseText()">Increase Text</button>
        <button type="button" onclick="decreaseText()">Decrease text</button>
        <button type="button" onclick="toggleContrast()">Contrast</button>
        <button type="button" onclick="toggleLight()">Light</button>
        <button type="button" onclick="toggleUnderline()">Underline</button>
        <button type="button" onclick="toggleFont()">Readable</button>
        <button type="button" onclick="toggleGrayscale()">Grayscale</button>
        <button type="button" onclick="toggleNegative()">Negative</button>
      </div>
      <button type="button" class="accessibility-reset" onclick="resetAccessibility()">Reset settings</button>
    `;
  }

  const toggleBtn = document.getElementById("accessibility-toggle");
  toggleBtn.innerText = "A";
  const closeBtn = panel.querySelector(".accessibility-close");

  toggleBtn.addEventListener("click", event => {
    event.stopPropagation();
    panel.classList.toggle("show");
  });

  closeBtn.addEventListener("click", () => panel.classList.remove("show"));

  document.addEventListener("click", event => {
    const isClickInside = panel.contains(event.target) || toggleBtn.contains(event.target);
    if (!isClickInside) panel.classList.remove("show");
  });
}

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

let catalogBooks = []; //Collect All Books
let currentBookSort = "featured";
let currentBookCategory = "all";
const fallbackBooks = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "Fiction",
    price: 42.9,
    rating: 4.8,
    sold: 148,
    date: "2026-01-15",
    cover: "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Non-Fiction",
    price: 55.0,
    rating: 4.9,
    sold: 260,
    date: "2026-01-22",
    cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg"
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    price: 39.9,
    rating: 4.7,
    sold: 96,
    date: "2025-11-10",
    cover: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg"
  },
  {
    title: "Wonder",
    author: "R. J. Palacio",
    category: "Children",
    price: 31.5,
    rating: 4.8,
    sold: 132,
    date: "2025-12-08",
    cover: "https://covers.openlibrary.org/b/isbn/9780375869020-L.jpg"
  },
  {
    title: "The Hobbit",
    author: "J. R. R. Tolkien",
    category: "Young Adults",
    price: 46.0,
    rating: 4.9,
    sold: 187,
    date: "2026-02-03",
    cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg"
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    category: "Fiction",
    price: 49.9,
    rating: 4.6,
    sold: 156,
    date: "2026-02-12",
    cover: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg"
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Business",
    price: 58.0,
    rating: 4.7,
    sold: 218,
    date: "2026-03-01",
    cover: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg"
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "Business",
    price: 38.9,
    rating: 4.5,
    sold: 201,
    date: "2025-10-19",
    cover: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg"
  },
  {
    title: "Diary of a Wimpy Kid",
    author: "Jeff Kinney",
    category: "Children",
    price: 29.9,
    rating: 4.6,
    sold: 165,
    date: "2026-03-14",
    cover: "https://covers.openlibrary.org/b/isbn/9780810993136-L.jpg"
  },
  {
    title: "The Lightning Thief",
    author: "Rick Riordan",
    category: "Young Adults",
    price: 34.9,
    rating: 4.7,
    sold: 174,
    date: "2026-01-05",
    cover: "https://covers.openlibrary.org/b/isbn/9780786838653-L.jpg"
  },
  {
    title: "Maus",
    author: "Art Spiegelman",
    category: "Graphic Novel & Comics",
    price: 44.0,
    rating: 4.8,
    sold: 84,
    date: "2025-09-18",
    cover: "https://covers.openlibrary.org/b/isbn/9780679406419-L.jpg"
  },
  {
    title: "The Montessori Method",
    author: "Maria Montessori",
    category: "Montessori",
    price: 36.5,
    rating: 4.4,
    sold: 62,
    date: "2025-08-21",
    cover: "https://covers.openlibrary.org/b/isbn/9780805209228-L.jpg"
  }
];

//Fetch data dari json & Api
async function loadBooksFromSource() {
  let jsonBooks = [];
  let apiBooks = [];

  try {
    const response = await fetch("books.json");
    if (!response.ok) throw new Error("JSON not found");
    const books = await response.json(); //tukar json kepada object javascript
    jsonBooks = books.map(normalizeJsonBook);  //map() => loop semua item dlm books
  } catch (error) {
    jsonBooks = fallbackBooks.map(normalizeJsonBook); //guna data backup kalau fetch local file gagal
  }

  if (jsonBooks.length === 0) {
    try {
      apiBooks = await loadBooksFromApi();
    } catch (error) {
      apiBooks = [];
    }
  }

  const merged = [...jsonBooks, ...apiBooks];
  const unique = [];  // collect only unique data
  const seen = new Set(); // simpan unique value

  merged.forEach((book, index) => {
    const key = book.title.toLowerCase();   // id untuk setiap data
    if (seen.has(key)) return; // kalau duplicate akan skip
    seen.add(key);  // add key dlm set() kalau belum ada
    unique.push({ ...book, originalIndex: index });   // masuk dlm unique array
  });

  return unique;
}

// Ambil Data Dari API 
async function loadBooksFromApi() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  const response = await fetch("https://openlibrary.org/search.json?q=popular%20books&limit=12", {
    signal: controller.signal
  });
  clearTimeout(timeout);
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
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` //template literals
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

// Create Book Card Dynamically
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
  container.innerHTML = ""; // kosongkan container
  books.forEach(book => container.appendChild(createBookCard(book)));
}

// Render Books
function renderHomeFromCatalog() {
  renderBookCards(document.getElementById("trendingBooks"), [...catalogBooks].sort((a, b) => b.sold - a.sold).slice(0, 8));
  renderBookCards(document.getElementById("recommendedBooks"), [...catalogBooks].sort((a, b) => b.rating - a.rating).slice(0, 6));
  renderBookCards(document.getElementById("categoryBooks"), catalogBooks);
  renderPopularCategories();  //
  setupFeaturedFromCatalog(); //slid
}

function renderBooksPageFromCatalog() {
  applyInitialBookCategory();
  populateBookCategoryFilter();
  renderBooksRecommendation();
  renderFilteredBookPage();
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

  select.value = currentBookCategory;
}

function getBooksForCurrentCategory() {
  return currentBookCategory === "all"
    ? [...catalogBooks]
    : catalogBooks.filter(book => book.category === currentBookCategory);
}

function getBookSearchValue() {
  return (document.getElementById("bookSearch")?.value || "").trim().toLowerCase();
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
  const title = document.getElementById("booksPageTitle");
  const subtitle = document.getElementById("booksPageSubtitle");
  const total = document.getElementById("totalBooksCount");
  const heading = document.getElementById("bookResultHeading");
  const count = document.getElementById("bookResultCount");
  const categoryText = currentBookCategory === "all" ? "all categories" : currentBookCategory;

  if (title) title.innerText = currentBookCategory === "all"
    ? "Find books that match your mood."
    : `${currentBookCategory} books picked for you.`;
  if (subtitle) subtitle.innerText = "Use smart search, category filters, and sorting to narrow the collection quickly.";
  if (total) total.innerText = catalogBooks.length;
  if (heading) heading.innerText = currentBookCategory === "all" ? "All Books" : currentBookCategory;
  if (count) count.innerText = `Showing ${visibleCount} book${visibleCount === 1 ? "" : "s"} in ${categoryText}`;
}

function renderBooksRecommendation(books = getBooksForCurrentCategory()) {
  const container = document.getElementById("booksRecommendation");
  if (!container) return;

  const source = books.length ? books : catalogBooks;
  const recommended = [...source]
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

    // object to array
  Object.entries(groups).slice(0, 8).forEach(([category, books]) => {
    const card = document.createElement("a");
    card.href = `books.html?category=${encodeURIComponent(category)}`;
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

function renderFilteredBookPage() {
  const container = document.getElementById("categoryBooks");
  if (!container || catalogBooks.length === 0) return;

  const keyword = getBookSearchValue();
  const categoryBooks = getBooksForCurrentCategory();
  const filtered = categoryBooks.filter(book => {
    const haystack = `${book.title} ${book.author} ${book.category}`.toLowerCase();
    return haystack.includes(keyword);
  });
  const sorted = getSortedBooks(filtered);
  const emptyState = document.getElementById("bookEmptyState");

  renderBookCards(container, sorted);
  renderBooksRecommendation(categoryBooks);
  updateBooksPageText(sorted.length);

  if (emptyState) emptyState.hidden = sorted.length !== 0;
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
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  if (category && catalogBooks.some(book => book.category === category)) {
    currentBookCategory = category;
  }
}

function sortBookPage(type) {
  currentBookSort = type || currentBookSort;
  renderFilteredBookPage();
}

function filterBookPage(category) {
  currentBookCategory = category || "all";
  updateBookCategoryUrl();
  renderFilteredBookPage();
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

function buildSmartSuggestions(input, box, scope = "books") {
  if (!box) return;

  const value = input.trim().toLowerCase();
  box.innerHTML = "";

  if (!value) return;

  const source = scope === "books" ? getBooksForCurrentCategory() : catalogBooks;
  const matches = source.filter(book =>
    book.title.toLowerCase().includes(value) ||
    book.author.toLowerCase().includes(value) ||
    book.category.toLowerCase().includes(value)
  );

  if (matches.length === 0) {
    box.innerHTML = `<div class="suggestion-item no-result">No books found for "${input}"</div>`;
    return;
  }

  matches.slice(0, 6).forEach(book => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <div>
        <strong>${highlightText(book.title, input)}</strong>
        <span>${book.author} - ${book.category} - ${formatPrice(book.price)}</span>
      </div>
    `;
    div.onclick = () => {
      const search = document.getElementById(scope === "books" ? "bookSearch" : "searchInput");
      if (search) search.value = book.title;
      box.innerHTML = "";
      if (scope === "books") {
        renderFilteredBookPage();
      } else {
        selectBook(book.title);
      }
    };
    box.appendChild(div);
  });
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

function smartBookPageSearch() {
  const input = document.getElementById("bookSearch");
  const box = document.getElementById("suggestionBox");
  if (!input || !box) return;

  renderFilteredBookPage();
  buildSmartSuggestions(input.value, box, "books");
}

// Display book Card
async function initBookCatalog() {
  catalogBooks = await loadBooksFromSource();

  if (document.body.classList.contains("home-body")) {
    renderHomeFromCatalog();
  }

   if (document.body.classList.contains("books-body")) {
    renderBooksPageFromCatalog();
  }

  const homeSearch = document.getElementById("searchInput");
  if (homeSearch) homeSearch.addEventListener("input", smartSearch);

  const bookSearch = document.getElementById("bookSearch");
  if (bookSearch) {
    bookSearch.addEventListener("input", smartBookPageSearch);
    bookSearch.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        smartBookPageSearch();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initBookCatalog);

document.addEventListener("DOMContentLoaded", () => {
  setupAccessibilityPanel();

  if (document.getElementById("wishlist-container")) {
    renderWishlistPage();
  }

  const sortWrapper = document.getElementById("sortWrapper");
  if (sortWrapper) {
    sortWrapper.style.display = "block";
  }

  document.addEventListener("click", event => {
    const searchBox = event.target.closest(".search-box");
    const suggestionBox = document.getElementById("suggestionBox");
    if (!searchBox && suggestionBox) suggestionBox.innerHTML = "";
  });
});

