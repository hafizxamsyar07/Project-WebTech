/*let cartCount = 0;

// CART
document.querySelectorAll(".buy-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    cartCount++;
    document.getElementById("cart-count").textContent = cartCount;
  });
});

// ADD TO CART
console.log("BOOK JS CONNECTED");
import { addToCart } from "./core/cart.js";
import { showToast } from "./core/ui.js";

/*document.querySelectorAll(".buy-btn").forEach(btn => {
  console.log("CLICK DETECTED");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const card = btn.closest(".book-card");

    const title = card.querySelector("h3").innerText;
    const priceText = card.querySelector(".price").innerText;
    const img = card.querySelector("img").src;

    const price = parseFloat(priceText.replace("RM", "").trim());

    const book = {
      title,
      price,
      img
    };

    addToCart(book);
    showToast("Added to cart 🛒");
  });
});*/
/*
// WISHLIST (SAVE IN LOCAL STORAGE)
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function toggleWishlist(button) {
  const card = button.closest(".book-card");

  const title = card.querySelector("h3").innerText;
  const img = card.querySelector("img").src;
  const price = card.querySelector(".price").innerText;

  let exists = wishlist.find(item => item.title === title);

  if (exists) {
    wishlist = wishlist.filter(item => item.title !== title);
    button.textContent = "🤍";
  } else {
    wishlist.push({ title, img, price });
    button.textContent = "❤️";
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// TOGGLE WISH BUTTON
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("wish-btn")) {
    e.stopPropagation();
    toggleWishlist(e.target);
  }
});

// SEARCH FILTER
document.getElementById("search").addEventListener("keyup", function () {
  let value = this.value.toLowerCase();
  let books = document.querySelectorAll(".book-card");

  books.forEach(book => {
    let title = book.dataset.title.toLowerCase();
    book.style.display = title.includes(value) ? "block" : "none";
  });
});
*/