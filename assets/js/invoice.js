import { Store } from "./storage.js";
import { escapeHtml, formatPrice } from "./utils.js";

function getTrackingStatus(order) {
  return [
    { label: "Order placed", detail: order.orderDateTime, done: true },
    { label: "Payment confirmed", detail: order.paymentMethod, done: true },
    { label: "Packed", detail: "Preparing books for shipment", done: true },
    { label: "Shipped", detail: order.tracking.carrier + " " + order.tracking.number, done: false },
    { label: "Delivered", detail: order.tracking.estimatedDelivery, done: false }
  ];
}

function renderInvoiceItems(items) {
  return items.map(item => `
    <tr>
      <td>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.sku)}</span>
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>${item.qty}</td>
      <td>${formatPrice(item.subtotal)}</td>
    </tr>
  `).join("");
}

function renderTracking(order) {
  return getTrackingStatus(order).map(status => `
    <li class="${status.done ? "done" : ""}">
      <span></span>
      <div>
        <strong>${escapeHtml(status.label)}</strong>
        <small>${escapeHtml(status.detail)}</small>
      </div>
    </li>
  `).join("");
}

function getSelectedOrder() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order");
  const placed = params.get("placed") === "true";
  const history = Store.getOrderHistory();
  const selectedOrder = orderId ? Store.getOrderById(orderId) : null;

  return {
    history,
    order: selectedOrder || history[0] || Store.getLastOrder(),
    placed
  };
}

function renderPurchaseHistory(history, activeOrderId) {
  if (!history.length) {
    return `
      <div class="invoice-card history-card">
        <h2>Purchase History</h2>
        <p>No previous purchases yet.</p>
      </div>
    `;
  }

  return `
    <div class="invoice-card history-card">
      <div class="invoice-card-heading history-heading">
        <h2>Purchase History</h2>
        <div class="history-tools">
          <span>${history.length} order${history.length === 1 ? "" : "s"}</span>
          <button type="button" class="history-clear-btn" id="clearHistoryButton" aria-label="Clear purchase history">Bin</button>
        </div>
      </div>
      <div class="history-list">
        ${history.map(order => `
          <a class="history-item ${order.orderId === activeOrderId ? "active" : ""}" href="invoice.html?order=${encodeURIComponent(order.orderId)}">
            <span>
              <strong>${escapeHtml(order.orderId)}</strong>
              <small>${escapeHtml(order.orderDate)} - ${order.items.length} item${order.items.length === 1 ? "" : "s"}</small>
            </span>
            <b>${formatPrice(order.total)}</b>
          </a>
        `).join("")}
      </div>
    </div>
  `;
}

function renderOrderConfirmation(order, placed) {
  if (!placed) return "";

  return `
    <div class="order-confirmation" role="status">
      <strong>Thank you for your purchase!</strong>
      <span>Your order ${escapeHtml(order.orderId)} has been placed successfully. A receipt has been sent to your email.</span>
    </div>
  `;
}

export function initInvoicePage() {
  const container = document.getElementById("invoiceContent");
  if (!container) return;

  const { history, order, placed } = getSelectedOrder();
  if (!order) return;

  container.innerHTML = `
    ${renderOrderConfirmation(order, placed)}

    <section class="invoice-header">
      <div>
        <span class="invoice-label">Invoice</span>
        <h1>Order ${escapeHtml(order.orderId)}</h1>
        <p>Placed on ${escapeHtml(order.orderDate)} at ${escapeHtml(order.orderTime)}</p>
      </div>
      <div class="invoice-status">
        <strong>${escapeHtml(order.paymentStatus)}</strong>
        <span>${escapeHtml(order.fulfillmentStatus)}</span>
      </div>
    </section>

    <section class="invoice-grid">
      <div class="invoice-main">
        <div class="invoice-card">
          <div class="invoice-card-heading">
            <h2>Order Items</h2>
            <span>${order.items.length} item${order.items.length === 1 ? "" : "s"}</span>
          </div>
          <div class="invoice-table-wrap">
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>${renderInvoiceItems(order.items)}</tbody>
            </table>
          </div>
        </div>

        <div class="invoice-card">
          <div class="invoice-card-heading">
            <h2>Tracking Details</h2>
            <span>${escapeHtml(order.tracking.carrier)}</span>
          </div>
          <div class="tracking-box">
            <div>
              <strong>${escapeHtml(order.tracking.number)}</strong>
              <span>Estimated delivery: ${escapeHtml(order.tracking.estimatedDelivery)}</span>
            </div>
            <a href="invoice.html">Track shipment</a>
          </div>
          <ol class="tracking-steps">${renderTracking(order)}</ol>
        </div>
      </div>

      <aside class="invoice-side">
        ${renderPurchaseHistory(history, order.orderId)}

        <div class="invoice-card">
          <h2>Payment Summary</h2>
          <div class="invoice-totals">
            <p><span>Subtotal</span><strong>${formatPrice(order.subtotal)}</strong></p>
            <p><span>Shipping</span><strong>${formatPrice(order.shippingFee)}</strong></p>
            ${order.discount ? `<p><span>Discount${order.voucherCode ? ` (${escapeHtml(order.voucherCode)})` : ""}</span><strong>-${formatPrice(order.discount)}</strong></p>` : ""}
            <p class="grand-total"><span>Total</span><strong>${formatPrice(order.total)}</strong></p>
          </div>
        </div>

        <div class="invoice-card address-card">
          <h2>Billing Address</h2>
          <p><strong>Payment Status:</strong> ${escapeHtml(order.paymentStatus)}</p>
          <p>${escapeHtml(order.customerName)}</p>
          <p>${escapeHtml(order.customerPhone)}</p>
          <p>${escapeHtml(order.customerEmail)}</p>
          <p>${escapeHtml(order.customerAddress)}</p>
        </div>

        <div class="invoice-card address-card">
          <h2>Shipping Address</h2>
          <p><strong>Fulfillment Status:</strong> ${escapeHtml(order.fulfillmentStatus)}</p>
          <p>${escapeHtml(order.customerName)}</p>
          <p>${escapeHtml(order.customerAddress)}</p>
          <p>Malaysia</p>
        </div>
      </aside>
    </section>
  `;

  document.getElementById("clearHistoryButton")?.addEventListener("click", () => {
    if (!window.confirm("Clear all purchase history? This cannot be undone.")) return;
    Store.clearOrderHistory();
    window.location.href = "invoice.html";
  });
}
