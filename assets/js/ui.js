// Presentation note: File ini simpan interaksi UI umum yang bukan milik satu page sahaja, contohnya back-to-top button dan helper layout.

export function initBackToTopButton() {
  const button = document.getElementById("backToTopButton");
  if (!button) return;

  const toggleButton = () => {
    button.classList.toggle("show", window.scrollY > 420);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggleButton, { passive: true });
  toggleButton();
}
