// Presentation note: File ini baca buku yang dipilih daripada localStorage dan render maklumat lengkap di detail page.
import { addBookToCart } from "./cart.js";
import { Store } from "./storage.js";

export function initDetailPage() {
  const title = document.getElementById("book-title");
  const price = document.getElementById("book-price");
  const image = document.getElementById("book-img");
  const addButton = document.getElementById("detail-add-cart");

  if (!title || !price || !image) return;

  const book = Store.getSelectedBook();
  if (!book) {
    title.textContent = "Book not selected";
    price.textContent = "Browse books to open a detail page.";
    return;
  }

  title.textContent = book.title;
  price.textContent = book.price;
  image.src = book.img || book.cover;
  image.alt = `${book.title} cover`;
  addButton?.addEventListener("click", () => addBookToCart(book));
}
