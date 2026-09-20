let products = [], config = {}, current = "Todos";
let cart = {}; // { productId: quantity }
let modalProduct = null;
let modalQty = 1;
let selectedSeller = 1;

const $ = s => document.querySelector(s);

function getUnitPrice(totalQty) {
  if (totalQty <= 0) return 35;
  if (totalQty === 1) return 35;
  if (totalQty <= 6) return 32;
  if (totalQty <= 10) return 30;
  return 28;
}

function getTotalQty() {
  return Object.values(cart).reduce((s, q) => s + q, 0);
}

function formatMoney(v) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

function saveCart() {
  try { localStorage.setItem("techne_cart", JSON.stringify(cart)); } catch(e) {}
}

function loadCart() {
  try {
    const raw = localStorage.getItem("techne_cart");
    if (raw) cart = JSON.parse(raw) || {};
  } catch(e) { cart = {}; }
}

async function start() {
  try {
    [products, config] = await Promise.all([
      fetch("products.json?" + Date.now()).then(r => r.json()),
      fetch("config.json?" + Date.now()).then(r => r.json())
    ]);
    loadCart();
    applyConfig();
    buildFilters();
    render();
    updateCartUI();
  } catch (e) {
    $("#catalog").innerHTML = "<p>Não foi possível carregar o catálogo.</p>";
  }
}

function applyConfig() {
  $("#store-name").textContent = config.storeName || "Techne";
  $("#subtitle").textContent = config.subtitle || "";
  document.title = (config.storeName || "Techne") + " · Canecas";
  const primary = config.primaryColor || "#FB675B";
  document.documentElement.style.setProperty("--coral", primary);
  document.documentElement.style.setProperty("--pink", primary);
  if (config.secondaryColor) {
    document.documentElement.style.setProperty("--teal", config.secondaryColor);
  }
  $("#year").textContent = new Date().getFullYear();
  // Seller buttons labels
  const s1 = config.seller1Name || "Vendedor 1";
  const s2 = config.seller2Name || "Vendedor 2";
  $("#seller1-btn").textContent = s1;
  $("#seller2-btn").textContent = s2;
}

function buildFilters() {
  const themes = ["Todos", ...new Set(products.map(p => p.theme).filter(Boolean))];
  $("#filters").innerHTML = themes.map(t =>
    `<button class="filter ${t === "Todos" ? "active" : ""}" data-theme="${esc(t)}">${esc(t)}</button>`
  ).join("");
  document.querySelectorAll(".filter").forEach(b => {
    b.onclick = () => {
      current = b.dataset.theme;
      document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      render();
    };
  });
}

function render() {
  const list = current === "Todos" ? products : products.filter(p => p.theme === current);
  $("#empty").hidden = !!list.length;
  $("#catalog").innerHTML = list.map(p =>
    `<article class="card" data-id="${esc(p.id)}">
      <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
      <div class="card-body">
        <h3>${esc(p.title)}</h3>
        <span class="tag">${esc(p.theme || "")}</span>
      </div>
    </article>`
  ).join("");
  document.querySelectorAll(".card").forEach(c => {
    c.onclick = () => openProduct(products.find(p => p.id === c.dataset.id));
  });
}

function openProduct(p) {
  if (!p) return;
  modalProduct = p;
  modalQty = 1;
  $("#modal-img").src = p.image;
  $("#modal-img").alt = p.title;
  $("#modal-title").textContent = p.title;
  $("#modal-theme").textContent = p.theme || "";
  $("#modal-description").textContent = p.description || "";
  $("#modal-qty").textContent = "1";
  $("#modal").hidden = false;
}

function closeModal() {
  $("#modal").hidden = true;
  modalProduct = null;
}

function closeCart() {
  $("#cart-modal").hidden = true;
}

function addToCart() {
  if (!modalProduct) return;
  const id = modalProduct.id;
  cart[id] = (cart[id] || 0) + modalQty;
  saveCart();
  updateCartUI();
  closeModal();
  // small feedback
  const fab = $("#cart-fab");
  fab.style.transform = "scale(1.2)";
  setTimeout(() => fab.style.transform = "", 200);
}

function changeCartQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const totalQty = getTotalQty();
  const unit = getUnitPrice(totalQty);
  const total = totalQty * unit;

  // FAB count
  const countEl = $("#cart-count");
  if (totalQty > 0) {
    countEl.hidden = false;
    countEl.textContent = totalQty;
  } else {
    countEl.hidden = true;
  }

  // Cart items
  const itemsEl = $("#cart-items");
  const emptyEl = $("#cart-empty");
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    itemsEl.innerHTML = "";
    emptyEl.hidden = false;
    $("#send-whatsapp").disabled = true;
  } else {
    emptyEl.hidden = true;
    $("#send-whatsapp").disabled = false;
    itemsEl.innerHTML = ids.map(id => {
      const p = products.find(x => x.id === id);
      if (!p) return "";
      const q = cart[id];
      return `<div class="cart-item">
        <img src="${esc(p.image)}" alt="">
        <div>
          <h4>${esc(p.title)}</h4>
          <div class="theme">${esc(p.theme || "")}</div>
        </div>
        <div class="cart-item-qty">
          <button type="button" data-id="${esc(id)}" data-delta="-1">−</button>
          <span>${q}</span>
          <button type="button" data-id="${esc(id)}" data-delta="1">+</button>
        </div>
      </div>`;
    }).join("");
    itemsEl.querySelectorAll("button[data-id]").forEach(btn => {
      btn.onclick = () => changeCartQty(btn.dataset.id, parseInt(btn.dataset.delta, 10));
    });
  }

  $("#cart-total-value").textContent = formatMoney(total);
  if (totalQty > 0) {
    $("#unit-price-info").textContent = `Preço unitário atual: ${formatMoney(unit)} (${totalQty} un.)`;
  } else {
    $("#unit-price-info").textContent = "";
  }
}

function openCart() {
  updateCartUI();
  $("#cart-modal").hidden = false;
}

function sendWhatsApp() {
  const totalQty = getTotalQty();
  if (totalQty === 0) return;
  const unit = getUnitPrice(totalQty);
  const total = totalQty * unit;

  let lines = ["Olá! Gostaria de fazer um pedido de canecas:", ""];
  Object.keys(cart).forEach(id => {
    const p = products.find(x => x.id === id);
    if (p) lines.push(`• ${p.title} (${p.theme || ""}) — ${cart[id]} un.`);
  });
  lines.push("");
  lines.push(`Quantidade total: ${totalQty}`);
  lines.push(`Preço unitário: ${formatMoney(unit)}`);
  lines.push(`Total: ${formatMoney(total)}`);
  lines.push("");
  lines.push("Poderia me ajudar com a encomenda?");

  const text = encodeURIComponent(lines.join("\n"));
  const number = selectedSeller === 1
    ? (config.whatsapp1 || "").replace(/\D/g, "")
    : (config.whatsapp2 || "").replace(/\D/g, "");

  if (!number) {
    alert("Número do WhatsApp do vendedor não configurado.");
    return;
  }
  window.open(`https://wa.me/${number}?text=${text}`, "_blank");
}

// Events
$(".close").onclick = closeModal;
$("#cart-close").onclick = closeCart;
$("#modal").onclick = e => { if (e.target.id === "modal") closeModal(); };
$("#cart-modal").onclick = e => { if (e.target.id === "cart-modal") closeCart(); };
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal();
    closeCart();
  }
});

$("#modal-minus").onclick = () => {
  if (modalQty > 1) {
    modalQty--;
    $("#modal-qty").textContent = modalQty;
  }
};
$("#modal-plus").onclick = () => {
  modalQty++;
  $("#modal-qty").textContent = modalQty;
};
$("#modal-add").onclick = addToCart;

$("#cart-fab").onclick = openCart;

document.querySelectorAll(".seller-btn").forEach(btn => {
  btn.onclick = () => {
    selectedSeller = parseInt(btn.dataset.seller, 10);
    document.querySelectorAll(".seller-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

$("#send-whatsapp").onclick = sendWhatsApp;

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])
  );
}

start();
