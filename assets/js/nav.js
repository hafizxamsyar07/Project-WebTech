export function initActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach(link => {
    const linkPage = link.getAttribute("href");
    link.classList.toggle("active", linkPage === currentPage);
  });
}

export function initSuggestionCloser() {
  document.addEventListener("click", event => {
    const searchBox = event.target.closest(".search-box");
    const suggestionBox = document.getElementById("suggestionBox");
    if (!searchBox && suggestionBox) suggestionBox.innerHTML = "";
  });
}
