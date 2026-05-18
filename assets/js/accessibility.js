let currentFontSize = 100;
let isLightMode = false;

const tools = [
  ["increase", "Increase Text"],
  ["decrease", "Decrease Text"],
  ["contrast", "Contrast"],
  ["light", "Light Mode"],
  ["underline", "Underline"],
  ["font", "Readable"],
  ["grayscale", "Grayscale"],
  ["negative", "Negative"]
];

function applyAccessibilityAction(action) {
  if (action === "increase") currentFontSize += 10;
  if (action === "decrease") currentFontSize = Math.max(80, currentFontSize - 10);

  if (action === "increase" || action === "decrease") {
    document.body.style.fontSize = currentFontSize + "%";
    return;
  }

  if (action === "light") {
  isLightMode = !isLightMode;
  document.body.classList.toggle("light-mode");

  const btn = document.querySelector('[data-accessibility="light"]');
  if (btn) {
    btn.textContent = isLightMode ? "Dark Mode" : "Light Mode";
  }

  return;
  }

  const classMap = {
    grayscale: "grayscale",
    contrast: "high-contrast",
    negative: "negative",
    light: "light-mode",
    underline: "underline-links",
    font: "readable-font"
  };

  
  if (classMap[action]) document.body.classList.toggle(classMap[action]);
}

function resetAccessibility() {
  currentFontSize = 100;
  document.body.style.fontSize = "100%";
  document.body.classList.remove(
    "grayscale",
    "high-contrast",
    "negative",
    "light-mode",
    "underline-links",
    "readable-font"
  );
}

export function initAccessibilityPanel() {
  const toggle = document.createElement("button");
  toggle.id = "accessibility-toggle";
  toggle.className = "accessibility-tab";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Open accessibility tools");
  toggle.textContent = "A";

  const panel = document.createElement("div");
  panel.id = "accessibility-panel";
  panel.className = "accessibility-panel";
  panel.innerHTML = `
    <div class="accessibility-panel-header">
      <strong>Accessibility</strong>
      <button type="button" class="accessibility-close" aria-label="Close accessibility tools">x</button>
    </div>
    <div class="accessibility-grid">
      ${tools.map(([action, label]) => (
        `<button type="button" data-accessibility="${action}">${label}</button>`
      )).join("")}
    </div>
    <button type="button" class="accessibility-reset">Reset Settings</button>
  `;

  document.body.append(toggle, panel);

  toggle.addEventListener("click", event => {
    event.stopPropagation();
    panel.classList.toggle("show");
  });

  panel.querySelector(".accessibility-close").addEventListener("click", () => {
    panel.classList.remove("show");
  });

  panel.addEventListener("click", event => {
    const toolButton = event.target.closest("[data-accessibility]");
    if (toolButton) applyAccessibilityAction(toolButton.dataset.accessibility);
    if (event.target.closest(".accessibility-reset")) resetAccessibility();
  });

  document.addEventListener("click", event => {
    if (!panel.contains(event.target) && !toggle.contains(event.target)) {
      panel.classList.remove("show");
    }
  });
}
