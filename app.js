const products = [
  { id: 'bayam', name: 'Bayam Hijau', category: 'Daun', weight: '1 ikat · ±250g', price: 6000, emoji: '🥬', badge: 'Panen hari ini', bg: '#edf3df' },
  { id: 'kangkung', name: 'Kangkung', category: 'Daun', weight: '1 ikat · ±250g', price: 5000, emoji: '🌿', badge: 'Favorit', bg: '#eef2e5' },
  { id: 'tomat', name: 'Tomat Merah', category: 'Buah', weight: '500g · 4–5 buah', price: 12000, emoji: '🍅', badge: 'Lokal', bg: '#f8ece5' },
  { id: 'wortel', name: 'Wortel', category: 'Umbi', weight: '500g · 3–4 buah', price: 10000, emoji: '🥕', badge: 'Manis alami', bg: '#f8efe2' },
  { id: 'brokoli', name: 'Brokoli', category: 'Buah', weight: '1 bonggol · ±300g', price: 18000, emoji: '🥦', badge: 'Kaya nutrisi', bg: '#eaf1e4' },
  { id: 'jagung', name: 'Jagung Manis', category: 'Buah', weight: '2 buah · ukuran besar', price: 14000, emoji: '🌽', badge: 'Manis', bg: '#f6f1dc' },
  { id: 'terong', name: 'Terong Ungu', category: 'Buah', weight: '500g · 2–3 buah', price: 9000, emoji: '🍆', badge: 'Segar', bg: '#f0eaf2' },
  { id: 'kentang', name: 'Kentang Dieng', category: 'Umbi', weight: '1kg · ukuran sedang', price: 22000, emoji: '🥔', badge: 'Dari petani', bg: '#f1eee5' }
];

const cart = new Map();
const grid = document.querySelector('#daftar-produk');
const searchInput = document.querySelector('#search-input');
const cartDrawer = document.querySelector('#cart-drawer');
const backdrop = document.querySelector('#drawer-backdrop');
const toast = document.querySelector('#toast');
let activeCategory = 'Semua';
let toastTimer;

const rupiah = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase('id');
  const visible = products.filter((product) => {
    const matchesCategory = activeCategory === 'Semua' || product.category === activeCategory;
    return matchesCategory && product.name.toLocaleLowerCase('id').includes(query);
  });

  if (!visible.length) {
    grid.innerHTML = '<p class="empty-state">Sayuran tidak ditemukan. Coba kata pencarian lain, ya.</p>';
    return;
  }

  grid.innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-image" style="--product-bg:${product.bg}">
        <span class="product-badge">${product.badge}</span>
        <span role="img" aria-label="${product.name}">${product.emoji}</span>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category === 'Umbi' ? 'Umbi & lainnya' : `Sayur ${product.category.toLowerCase()}`}</p>
        <div class="product-title-row"><h3 class="product-title">${product.name}</h3></div>
        <p class="product-weight">${product.weight}</p>
        <div class="product-bottom"><span class="product-price">${rupiah(product.price)} <small>/ produk</small></span><button class="add-button" data-add="${product.id}" aria-label="Tambah ${product.name} ke keranjang">+</button></div>
      </div>
    </article>`).join('');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function renderCart() {
  const items = [...cart.entries()];
  const count = items.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = items.reduce((sum, [id, quantity]) => sum + products.find((product) => product.id === id).price * quantity, 0);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#cart-total').textContent = rupiah(total);
  const cartItems = document.querySelector('#cart-items');
  cartItems.innerHTML = items.length ? items.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `<div class="cart-row"><span class="cart-product-emoji" aria-hidden="true">${product.emoji}</span><div class="cart-product-info"><strong>${product.name}</strong><small>${rupiah(product.price)} / produk</small></div><div class="quantity-control"><button data-quantity="${id}" data-change="-1" aria-label="Kurangi ${product.name}">−</button><span>${quantity}</span><button data-quantity="${id}" data-change="1" aria-label="Tambah ${product.name}">+</button></div></div>`;
  }).join('') : '<p class="cart-empty">Keranjang masih kosong.<br>Yuk, pilih sayuran segar favoritmu! 🥬</p>';
}

function setDrawer(open) {
  cartDrawer.classList.toggle('open', open);
  backdrop.classList.toggle('show', open);
  cartDrawer.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) document.querySelector('#close-cart').focus();
}

document.querySelectorAll('.category-chip').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.category-chip.active').classList.remove('active');
    button.classList.add('active');
    activeCategory = button.dataset.category;
    renderProducts();
  });
});

searchInput.addEventListener('input', renderProducts);
grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.add);
  cart.set(product.id, (cart.get(product.id) || 0) + 1);
  renderCart();
  showToast(`${product.name} ditambahkan ke keranjang`);
});

document.querySelector('#cart-items').addEventListener('click', (event) => {
  const button = event.target.closest('[data-quantity]');
  if (!button) return;
  const id = button.dataset.quantity;
  const next = (cart.get(id) || 0) + Number(button.dataset.change);
  if (next <= 0) cart.delete(id); else cart.set(id, next);
  renderCart();
});

document.querySelector('#cart-button').addEventListener('click', () => setDrawer(true));
document.querySelector('#close-cart').addEventListener('click', () => setDrawer(false));
backdrop.addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cartDrawer.classList.contains('open')) setDrawer(false);
});
document.querySelector('#checkout-button').addEventListener('click', () => {
  if (cart.size === 0) {
    showToast('Keranjangmu masih kosong. Pilih sayuran dulu, yuk!');
    return;
  }
  showToast('Terima kasih! Pemesanan online segera hadir.');
});
document.querySelector('#year').textContent = new Date().getFullYear();

renderProducts();
renderCart();
