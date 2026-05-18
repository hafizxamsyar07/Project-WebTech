// Presentation note: File ini simpan helper function yang dikongsi seperti format harga, escape HTML, toast, dan show/hide element.
export function formatPrice(price) {
  return "RM" + Number(price || 0).toFixed(2);
}

export function parsePrice(value) {
  return Number(String(value || "0").replace(/[^\d.]/g, "")) || 0;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2000);
}

export function setElementText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

export function setVisible(element, shouldShow, display = "block") {
  if (element) element.style.display = shouldShow ? display : "none";
}
