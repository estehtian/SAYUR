const products = [
  { id: 'bayam', name: 'Bayam Hijau', category: 'Daun', weight: '1 ikat · ±250g', price: 6000, emoji: '🥬', badge: 'Panen hari ini', bg: '#dcebc8' },
  { id: 'kangkung', name: 'Kangkung', category: 'Daun', weight: '1 ikat · ±250g', price: 5000, emoji: '🌿', badge: 'Favorit', bg: '#d8e9d8' },
  { id: 'tomat', name: 'Tomat Merah', category: 'Buah', weight: '500g · 4–5 buah', price: 12000, emoji: '🍅', badge: 'Lokal', bg: '#f3ddd1' },
  { id: 'wortel', name: 'Wortel', category: 'Umbi', weight: '500g · 3–4 buah', price: 10000, emoji: '🥕', badge: 'Manis alami', bg: '#f5e5c9' },
  { id: 'brokoli', name: 'Brokoli', category: 'Buah', weight: '1 bonggol · ±300g', price: 18000, emoji: '🥦', badge: 'Kaya nutrisi', bg: '#dcebd8' },
  { id: 'jagung', name: 'Jagung Manis', category: 'Buah', weight: '2 buah · ukuran besar', price: 14000, emoji: '🌽', badge: 'Manis', bg: '#f2e9c9' },
  { id: 'terong', name: 'Terong Ungu', category: 'Buah', weight: '500g · 2–3 buah', price: 9000, emoji: '🍆', badge: 'Segar', bg: '#e8dff0' },
  { id: 'kentang', name: 'Kentang Dieng', category: 'Umbi', weight: '1kg · ukuran sedang', price: 22000, emoji: '🥔', badge: 'Dari petani', bg: '#eae4d7' }
];
const storageKey = 'sayursegar-cart-v1';
let cart = loadCart();
let activeCategory = 'Semua';
let toastTimer;
const rupiah = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return new Map(Object.entries(saved).filter(([id, quantity]) => products.some((product) => product.id === id) && Number.isInteger(quantity) && quantity > 0));
  } catch { return new Map(); }
}
function saveCart() {
  try { localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(cart))); } catch { /* Storage may be unavailable in private browsing. */ }
}
function renderProducts() {
  const grid = document.querySelector('#daftar-produk');
  if (!grid) return;
  const search = document.querySelector('#search-input');
  const query = search ? search.value.trim().toLocaleLowerCase('id') : '';
  const limit = Number(grid.dataset.limit) || Infinity;
  const visible = products.filter((product) => (activeCategory === 'Semua' || product.category === activeCategory) && product.name.toLocaleLowerCase('id').includes(query)).slice(0, limit);
  if (!visible.length) {
    grid.innerHTML = '<p class="empty-state">Sayuran tidak ditemukan. Coba kata pencarian lain, ya.</p>';
    return;
  }
  grid.innerHTML = visible.map((product) => `
    <article class="product-card"><div class="product-image" style="--product-bg:${product.bg}"><span class="product-badge">${product.badge}</span><span role="img" aria-label="${product.name}">${product.emoji}</span></div>
      <div class="product-info"><p class="product-category">${product.category === 'Umbi' ? 'Umbi & lainnya' : `Sayur ${product.category.toLowerCase()}`}</p><h3 class="product-title">${product.name}</h3><p class="product-weight">${product.weight}</p><div class="product-bottom"><strong>${rupiah(product.price)}</strong><button class="add-button" data-add="${product.id}" aria-label="Tambah ${product.name} ke keranjang">+</button></div></div></article>`).join('');
}
function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function renderCart() {
  const countNode = document.querySelector('#cart-count');
  if (!countNode) return;
  const items = [...cart.entries()];
  const count = items.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = items.reduce((sum, [id, quantity]) => sum + products.find((product) => product.id === id).price * quantity, 0);
  countNode.textContent = count;
  const totalNode = document.querySelector('#cart-total');
  if (totalNode) totalNode.textContent = rupiah(total);
  const cartItems = document.querySelector('#cart-items');
  if (!cartItems) return;
  cartItems.innerHTML = items.length ? items.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `<div class="cart-row"><span class="cart-product-emoji" aria-hidden="true">${product.emoji}</span><div class="cart-product-info"><strong>${product.name}</strong><small>${rupiah(product.price)} · ${product.weight}</small></div><div class="quantity-control"><button data-quantity="${id}" data-change="-1" aria-label="Kurangi ${product.name}">−</button><span>${quantity}</span><button data-quantity="${id}" data-change="1" aria-label="Tambah ${product.name}">+</button></div></div>`;
  }).join('') : '<p class="cart-empty">Keranjang masih kosong.<br>Yuk, pilih sayuran segar favoritmu! ✳</p>';
}
function setDrawer(open) {
  const drawer = document.querySelector('#cart-drawer');
  const backdrop = document.querySelector('#drawer-backdrop');
  if (!drawer || !backdrop) return;
  drawer.classList.toggle('open', open);
  backdrop.classList.toggle('show', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) drawer.querySelector('[data-close-cart]').focus();
  else document.querySelector('[data-open-cart]')?.focus();
}
function installBranding() {
  const logoPath = 'assets/B%26D-Jaya.png';
  document.querySelectorAll('.brand').forEach((brand) => {
    if (brand.querySelector('.site-logo')) return;
    brand.classList.add('brand-with-logo');
    brand.innerHTML = `<img class="site-logo" src="${logoPath}" alt="Logo B&D Jaya"><span class="brand-copy">sayur<span>segar</span></span>`;
    brand.setAttribute('aria-label', 'SayurSegar — Beranda');
  });
  const style = document.createElement('style');
  style.textContent = `
    :root{--accent-neon:#b8f36b;--glass-line:rgba(255,255,255,.12)}
    html{scroll-behavior:smooth;scroll-padding-top:90px}
    body{background-image:radial-gradient(ellipse at 92% 5%,rgba(184,243,107,.075),transparent 30%),radial-gradient(ellipse at 0% 40%,rgba(16,37,29,.035),transparent 35%)}
    .topline{letter-spacing:.11em;background:#0b1913}
    .site-header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.91);backdrop-filter:blur(18px);border-bottom:1px solid rgba(16,37,29,.09);box-shadow:0 8px 30px rgba(13,34,24,.045)}
    .brand-with-logo{gap:10px}.site-logo{width:45px;height:45px;object-fit:contain;border-radius:12px;box-shadow:0 0 0 1px rgba(16,37,29,.1),0 5px 18px rgba(16,37,29,.12)}
    .brand-copy{font-family:Manrope,sans-serif;font-weight:800;letter-spacing:-.055em}.brand-copy span{color:#7d9b55}
    .main-nav a{transition:color .2s ease,background .2s ease}.main-nav a:hover,.main-nav a.active{color:#4d722e}
    .button,.button-lime,.cart-button,.add-button,.checkout-button{transition:transform .2s ease,box-shadow .2s ease,filter .2s ease}.button:hover,.button-lime:hover,.cart-button:hover,.add-button:hover,.checkout-button:hover{transform:translateY(-2px);filter:saturate(1.08);box-shadow:0 10px 24px rgba(16,37,29,.14)}
    .hero,.page-hero{position:relative}.hero:after,.page-hero:after{content:'';position:absolute;inset:10% 0 auto auto;width:230px;height:230px;pointer-events:none;background:radial-gradient(circle,rgba(184,243,107,.13),transparent 70%);filter:blur(12px)}
    .product-card,.partner-card,.steps-grid article,.recipe-card,.about-card{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}.product-card:hover,.partner-card:hover,.steps-grid article:hover,.recipe-card:hover,.about-card:hover{transform:translateY(-5px);box-shadow:0 22px 50px rgba(18,39,28,.12);border-color:rgba(125,155,85,.35)}
    .product-image{overflow:hidden}.product-image>span[role=img]{display:inline-block;transition:transform .35s ease}.product-card:hover .product-image>span[role=img]{transform:scale(1.12) rotate(-5deg)}
    .section-head h2,.page-hero h1,.hero h1{letter-spacing:-.045em}.eyebrow{letter-spacing:.13em}
    .site-footer{position:relative;overflow:hidden}.site-footer:before{content:'';position:absolute;inset:0 auto 0 0;width:4px;background:linear-gradient(180deg,var(--accent-neon),transparent)}
    .site-footer .site-logo{width:52px;height:52px}.site-footer .brand-copy{color:#fff}.site-footer .brand-copy span{color:var(--accent-neon)}
    .site-footer .footer-main{align-items:center}.site-footer .footer-main>p{max-width:260px}
    .cart-drawer{z-index:40}.drawer-backdrop{z-index:39}.toast{z-index:50}
    @media(max-width:600px){.site-logo{width:38px;height:38px}.brand-with-logo{gap:7px}.site-footer .footer-main{align-items:flex-start}.site-footer .site-logo{width:44px;height:44px}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.product-card,.partner-card,.steps-grid article,.recipe-card,.about-card,.button,.button-lime,.cart-button,.add-button,.checkout-button{transition:none}}
  `;
  document.head.append(style);
}

document.querySelectorAll('.category-chip').forEach((button) => button.addEventListener('click', () => {
  document.querySelector('.category-chip.active')?.classList.remove('active');
  button.classList.add('active');
  activeCategory = button.dataset.category;
  renderProducts();
}));
document.querySelector('#search-input')?.addEventListener('input', renderProducts);
document.querySelector('#daftar-produk')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.add);
  if (!product) return;
  cart.set(product.id, (cart.get(product.id) || 0) + 1);
  saveCart(); renderCart(); showToast(`${product.name} ditambahkan ke keranjang`);
});
document.querySelector('#cart-items')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-quantity]');
  if (!button) return;
  const id = button.dataset.quantity;
  const next = (cart.get(id) || 0) + Number(button.dataset.change);
  if (next <= 0) cart.delete(id); else cart.set(id, next);
  saveCart(); renderCart();
});
document.querySelectorAll('[data-open-cart]').forEach((button) => button.addEventListener('click', () => setDrawer(true)));
document.querySelectorAll('[data-close-cart]').forEach((button) => button.addEventListener('click', () => setDrawer(false)));
document.querySelector('#drawer-backdrop')?.addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && document.querySelector('#cart-drawer')?.classList.contains('open')) setDrawer(false); });
document.querySelector('#checkout-button')?.addEventListener('click', () => showToast(cart.size ? 'Terima kasih! Pemesanan online segera hadir.' : 'Keranjangmu masih kosong. Pilih sayuran dulu, ya!'));
document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
installBranding();
renderProducts(); renderCart();