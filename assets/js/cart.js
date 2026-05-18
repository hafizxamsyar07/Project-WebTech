// Presentation note: File ini urus shopping cart, kuantiti item, voucher, checkout form, validation, dan rekod order.
import { CONFIG } from "./config.js";
import { Store } from "./storage.js";
import { escapeHtml, formatPrice, parsePrice, showToast } from "./utils.js";

const SHIPPING_FEE = 15;
const VOUCHERS = {
  BOOK10: {
    label: "10% off books",
    getDiscount: ({ subtotal }) => subtotal * 0.1
  },
  MAY20: {
    label: "RM20 off orders RM100+",
    getDiscount: ({ subtotal }) => subtotal >= 100 ? 20 : 0,
    error: "MAY20 requires a minimum subtotal of RM100."
  },
  FREESHIP: {
    label: "Free delivery",
    getDiscount: ({ shippingFee }) => shippingFee
  }
};

let appliedVoucher = null;

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getAppliedVoucherSummary(subtotal, shippingFee) {
  if (!appliedVoucher) {
    return { code: "", label: "", discount: 0 };
  }

  const voucher = VOUCHERS[appliedVoucher];
  const discount = Math.min(subtotal + shippingFee, voucher.getDiscount({ subtotal, shippingFee }));

  return {
    code: appliedVoucher,
    label: voucher.label,
    discount
  };
}

function setVoucherMessage(message, type = "") {
  const messageElement = document.getElementById("voucher-message");
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.className = type;
}

// Public helper digunakan oleh catalog, detail, dan wishlist.
export function addBookToCart(book) {
  const cart = Store.getCart();
  const title = book.title;
  const existing = cart.find(item => item.title === title);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      title,
      price: parsePrice(book.price),
      qty: 1,
      img: book.img || book.cover
    });
  }

  Store.saveCart(cart);
  renderCartPage();
  showToast("Added to cart");
}

function updateCartItem(title, change) {
  const cart = Store.getCart()
    .map(item => item.title === title ? { ...item, qty: item.qty + change } : item)
    .filter(item => item.qty > 0);

  Store.saveCart(cart);
  renderCartPage();
}

function removeCartItem(title) {
  Store.saveCart(Store.getCart().filter(item => item.title !== title));
  renderCartPage();
}

function renderCartItem(item) {
  const subtotal = item.price * item.qty;

  return `
    <article class="cart-item">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)} cover">
      <div class="cart-info">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="price">${formatPrice(item.price)}</p>
        <div class="qty-control" aria-label="Quantity controls">
          <button type="button" data-cart-action="decrease" data-title="${escapeHtml(item.title)}">-</button>
          <span>${item.qty}</span>
          <button type="button" data-cart-action="increase" data-title="${escapeHtml(item.title)}">+</button>
        </div>
      </div>
      <div class="cart-right">
        <p class="subtotal">${formatPrice(subtotal)}</p>
        <button class="remove-btn" type="button" data-cart-action="remove" data-title="${escapeHtml(item.title)}">Remove</button>
      </div>
    </article>
  `;
}

export function renderCartPage() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const cart = Store.getCart();
  if (cart.length === 0) appliedVoucher = null;

  const subtotal = getCartTotal(cart);
  const shippingFee = cart.length ? SHIPPING_FEE : 0;
  const voucherSummary = getAppliedVoucherSummary(subtotal, shippingFee);
  const total = Math.max(0, subtotal + shippingFee - voucherSummary.discount);
  const itemCount = getCartCount(cart);
  const discountRow = document.getElementById("discount-row");

  container.innerHTML = cart.length
    ? cart.map(renderCartItem).join("")
    : `
      <div class="empty-cart">
        <strong>Your cart is empty</strong>
        <span>Add a few books and your checkout summary will appear here.</span>
        <a href="books.html">Browse Books</a>
      </div>
    `;

  document.getElementById("cart-total").textContent = formatPrice(subtotal);
  document.getElementById("delivery-fee").textContent = formatPrice(shippingFee);
  document.getElementById("discount-total").textContent = "-" + formatPrice(voucherSummary.discount);
  if (discountRow) discountRow.hidden = voucherSummary.discount <= 0;
  document.getElementById("checkout-total").textContent = formatPrice(total);
  document.getElementById("cart-count").textContent = itemCount + (itemCount === 1 ? " item" : " items");
}

function buildOrderReceipt(form) {
  const now = new Date();
  const items = Store.getCart().map(item => ({
    title: item.title,
    sku: "SBS-" + item.title.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase(),
    qty: item.qty,
    price: item.price,
    subtotal: item.price * item.qty
  }));
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = SHIPPING_FEE;
  const voucherSummary = getAppliedVoucherSummary(subtotal, shippingFee);
  const discount = voucherSummary.discount;
  const total = Math.max(0, subtotal + shippingFee - discount);
  const estimatedDelivery = new Date(now);
  estimatedDelivery.setDate(now.getDate() + 3);

  return {
    orderId: "SBS-" + Date.now(),
    ...form,
    ownerEmail: CONFIG.emailJs.ownerEmail,
    paymentStatus: form.paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
    fulfillmentStatus: "Processing",
    orderDate: now.toLocaleDateString("en-MY"),
    orderTime: now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }),
    orderDateTime: now.toLocaleString("en-MY"),
    items,
    itemsText: items.map(item => `${item.title} x${item.qty} - ${formatPrice(item.subtotal)}`).join("\n"),
    subtotal,
    shippingFee,
    discount,
    voucherCode: voucherSummary.code,
    voucherLabel: voucherSummary.label,
    total,
    totalText: formatPrice(total),
    tracking: {
      carrier: "DHL eCommerce APAC",
      number: "MYNVY" + Date.now().toString().slice(-6),
      estimatedDelivery: estimatedDelivery.toLocaleDateString("en-MY", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    }
  };
}

function applyVoucher() {
  const input = document.getElementById("voucher-code");
  const code = input?.value.trim().toUpperCase();
  const cart = Store.getCart();
  const subtotal = getCartTotal(cart);
  const shippingFee = cart.length ? SHIPPING_FEE : 0;

  if (!code) {
    appliedVoucher = null;
    renderCartPage();
    setVoucherMessage("Voucher removed. Available: BOOK10, MAY20, FREESHIP");
    return;
  }

  if (!VOUCHERS[code]) {
    appliedVoucher = null;
    renderCartPage();
    setVoucherMessage("Invalid voucher code. Try BOOK10, MAY20, or FREESHIP.", "error");
    return;
  }

  const discount = VOUCHERS[code].getDiscount({ subtotal, shippingFee });
  if (discount <= 0) {
    appliedVoucher = null;
    renderCartPage();
    setVoucherMessage(VOUCHERS[code].error || "This voucher cannot be applied to this order.", "error");
    return;
  }

  appliedVoucher = code;
  renderCartPage();
  setVoucherMessage(`${code} applied: ${VOUCHERS[code].label}.`, "success");
}

function getCheckoutForm() {
  return {
    customerName: document.getElementById("checkout-name")?.value.trim(),
    customerPhone: document.getElementById("checkout-phone")?.value.trim(),
    customerEmail: document.getElementById("checkout-email")?.value.trim(),
    customerAddress: document.getElementById("checkout-address")?.value.trim(),
    paymentMethod: document.getElementById("checkout-payment")?.value
  };
}

function getEmailJsClient() {
  if (!window.emailjs) return null;
  window.emailjs.init({ publicKey: CONFIG.emailJs.publicKey });
  return window.emailjs;
}

async function sendOrderReceipt(order) {
  const client = getEmailJsClient();
  if (!client) throw new Error("EmailJS library is not loaded.");

  const params = {
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
    client.send(CONFIG.emailJs.serviceId, CONFIG.emailJs.templateId, {
      ...params,
      to_email: order.customerEmail,
      recipient_type: "Customer receipt"
    }),
    client.send(CONFIG.emailJs.serviceId, CONFIG.emailJs.templateId, {
      ...params,
      to_email: order.ownerEmail,
      recipient_type: "Owner order notification"
    })
  ]);
}

async function placeOrder() {
  const cart = Store.getCart();
  const form = getCheckoutForm();

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!form.customerName || !form.customerPhone || !form.customerEmail || !form.customerAddress) {
    alert("Please fill in your name, phone number, email, and address.");
    return;
  }

  const order = buildOrderReceipt(form);
  Store.saveLastOrder(order);

  try {
    await sendOrderReceipt(order);
  } catch (error) {
    console.error("EmailJS error:", error);
  }

  Store.saveCart([]);
  renderCartPage();
  window.location.href = "invoice.html?order=" + encodeURIComponent(order.orderId) + "&placed=true";
}

export function initCart() {
  renderCartPage();

  document.getElementById("cart-items")?.addEventListener("click", event => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const title = button.dataset.title;
    const action = button.dataset.cartAction;

    if (action === "increase") updateCartItem(title, 1);
    if (action === "decrease") updateCartItem(title, -1);
    if (action === "remove") removeCartItem(title);
  });

  document.getElementById("place-order-button")?.addEventListener("click", placeOrder);
  document.getElementById("apply-voucher-button")?.addEventListener("click", applyVoucher);
  document.getElementById("voucher-code")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyVoucher();
    }
  });
}
