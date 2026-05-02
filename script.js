console.log("Website ready!");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(button, event) {
event.stopPropagation();

  const bookCard = button.parentElement;
  const img = bookCard.querySelector("img").src;
  const title = bookCard.querySelector("h3").innerText;
  const priceElement = bookCard.querySelector(".price");
  const priceText = priceElement.innerText;
  const price = parseInt(priceText.replace("RM","").trim())

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


function searchBooks() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".book-card");

  cards.forEach(card => {
    const title = card.querySelector("h3").innerText.toLowerCase();

    if (title.includes(input)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

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

  const price = parseInt(book.price.replace("RM",""));

  let existing = cart.find(item => item.title === book.title);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      title: book.title,
      price: price,
      qty: 1,
      img : book.img
    });
  }

  saveCart();
  showToast("Added to cart 🛒");
}

function loadCartPage() {
  const container = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("cart-total");

  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

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

  totalDisplay.innerText = "Total: RM" + total;
}

loadCartPage();

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

//accessibility
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
  const cards = document.querySelectorAll(".book-card");
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
