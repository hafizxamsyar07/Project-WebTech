let cartCount = 0;

// CART
document.querySelectorAll(".buy-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    cartCount++;
    document.getElementById("cart-count").textContent = cartCount;
  });
});

// WISHLIST (SAVE IN LOCAL STORAGE)
document.querySelectorAll(".wish-btn").forEach((btn, index) => {
  let saved = localStorage.getItem("wish-" + index);

  if (saved === "true") {
    btn.textContent = "❤️";
  }

  btn.addEventListener("click", () => {
    if (btn.textContent === "🤍") {
      btn.textContent = "❤️";
      localStorage.setItem("wish-" + index, true);
    } else {
      btn.textContent = "🤍";
      localStorage.setItem("wish-" + index, false);
    }
  });
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