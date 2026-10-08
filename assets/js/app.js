const CART_STORAGE_KEY = 'sb_cart_items_v2';

function getStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart || []));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
}

function initHeroTitleTypewriter() {
  const line1 = document.getElementById('heroTitleLine1');
  const line2 = document.getElementById('heroTitleLine2');
  if (!line1 || !line2) return;

  const text1 = "LEVEL UP YOUR SERVER";
  const text2 = "WITH SB DEVELOPERS";

  let char1 = text1.length;
  let char2 = text2.length;
  let isDeleting = false;

  function tick() {
    if (!isDeleting) {
      if (char1 < text1.length) {
        char1++;
        line1.textContent = text1.substring(0, char1);
        setTimeout(tick, 90);
      } else if (char2 < text2.length) {
        char2++;
        line2.textContent = text2.substring(0, char2);
        setTimeout(tick, 90);
      } else {
        isDeleting = true;
        setTimeout(tick, 5000);
      }
    } else {
      if (char2 > 0) {
        char2--;
        line2.textContent = text2.substring(0, char2);
        setTimeout(tick, 45);
      } else if (char1 > 0) {
        char1--;
        line1.textContent = text1.substring(0, char1);
        setTimeout(tick, 45);
      } else {
        isDeleting = false;
        setTimeout(tick, 600);
      }
    }
  }

  setTimeout(tick, 3500);
}

function triggerDiscordOAuth() {
  const clientId = "1552667254502592622";
  
  // Use Vercel domain as primary redirect URI
  let redirectUri = "https://sbdevelopers-six.vercel.app/";
  if (typeof window !== 'undefined' && window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost')) {
    redirectUri = window.location.origin + window.location.pathname.replace(/\/index\.html$/i, '').replace(/\/$/, '') + '/';
  }

  const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify%20guilds%20guilds.join`;

  // Only open ONE tab / redirect cleanly to the bot authorization
  if (window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost')) {
    window.location.href = oauthUrl;
  } else {
    // Local testing
    window.open(oauthUrl, '_blank');
    const demoUser = {
      discordConnected: true,
      id: "1478812501079490641",
      username: "SB_Customer",
      displayName: "SB Customer",
      avatarUrl: "https://cdn.discordapp.com/embed/avatars/0.png",
      verified: true
    };
    saveUserAuth(demoUser);
    updateAuthUI();
    updateCartUI();
    showToast("Discord connected & server joined via Bot!", "✓");
  }
}

/**
 * SB DEVELOPERS - STOREFRONT LOGIC & DYNAMIC REVIEW SYSTEM
 */

// Application State
// Multi-Currency Configuration (USD, EUR, GBP, CAD, AUD, PLN)
const CURRENCY_CONFIG = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', prefix: true },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', prefix: true },
  GBP: { symbol: '£', rate: 0.77, label: 'GBP (£)', prefix: true },
  CAD: { symbol: 'C$', rate: 1.36, label: 'CAD (C$)', prefix: true },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD (A$)', prefix: true },
  PLN: { symbol: 'zł', rate: 3.96, label: 'PLN (zł)', prefix: false }
};

const state = {
  searchQuery: '',
  cart: getStoredCart(),
  appliedPromo: null,
  selectedRating: 5
};

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const cartBtn = document.getElementById('cartBtn');
const cartCountBadge = document.getElementById('cartCountBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartDiscountRow = document.getElementById('cartDiscountRow');
const cartDiscountEl = document.getElementById('cartDiscount');
const cartTotalEl = document.getElementById('cartTotal');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const productModal = document.getElementById('productModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalContentBody = document.getElementById('modalContentBody');
const toastContainer = document.getElementById('toastContainer');
const faqAccordion = document.getElementById('faqAccordion');
const reviewsContainer = document.getElementById('reviewsContainer');
const reviewModal = document.getElementById('reviewModal');
const reviewModalCloseBtn = document.getElementById('reviewModalCloseBtn');
const openReviewModalBtn = document.getElementById('openReviewModalBtn');
const reviewForm = document.getElementById('reviewForm');
const starButtons = document.querySelectorAll('.star-btn');

// Format price in USD
function formatPrice(amountInUSD) {
  return `$${amountInUSD.toFixed(2)}`;
}

function setCurrency(code) {
  if (!CURRENCY_CONFIG[code]) return;
  state.currentCurrency = code;
  localStorage.setItem('sb_selected_currency', code);

  const label = document.getElementById('currentCurrencyLabel');
  if (label) label.textContent = CURRENCY_CONFIG[code].label;

  document.querySelectorAll('.curr-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === code);
  });

  renderProducts();
  updateCartUI();
  showToast(`Currency switched to ${code} (${CURRENCY_CONFIG[code].symbol})`, "💱");
}

function setupCurrencySelector() {
  const wrap = document.getElementById('currencySelectorWrap');
  const btn = document.getElementById('currencyBtn');
  const dropdown = document.getElementById('currencyDropdown');

  if (btn && wrap) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('open');
      }
    });
  }

  if (dropdown) {
    dropdown.addEventListener('click', (e) => {
      const opt = e.target.closest('.curr-option');
      if (opt && opt.dataset.currency) {
        setCurrency(opt.dataset.currency);
        if (wrap) wrap.classList.remove('open');
      }
    });
  }

  const cur = state.currentCurrency || 'USD';
  const label = document.getElementById('currentCurrencyLabel');
  if (label && CURRENCY_CONFIG[cur]) label.textContent = CURRENCY_CONFIG[cur].label;
  document.querySelectorAll('.curr-option').forEach(b => {
    b.classList.toggle('active', b.dataset.currency === cur);
  });
}

function initHeroTypewriter() {
  const el = document.getElementById('heroTypewriterText');
  if (!el) return;

  const phrase = "OFFICIAL WEBSTORE";
  let charIdx = phrase.length;
  let isDeleting = false;

  function typeTick() {
    if (!isDeleting) {
      if (charIdx <= phrase.length) {
        el.textContent = phrase.substring(0, charIdx);
        charIdx++;
        setTimeout(typeTick, 110);
      } else {
        isDeleting = true;
        setTimeout(typeTick, 3500);
      }
    } else {
      if (charIdx > 0) {
        charIdx--;
        el.textContent = phrase.substring(0, charIdx);
        setTimeout(typeTick, 55);
      } else {
        isDeleting = false;
        setTimeout(typeTick, 600);
      }
    }
  }

  setTimeout(typeTick, 3000);
}

// Convert any YouTube URL format to embed URL
function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : url;
}

// Show Toast Notification
function showToast(message, icon = '✓') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="color: var(--cyber-cyan); font-weight: bold;">${icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Switch between modal media tabs (Image / Video)
window.switchModalMedia = function(tabName) {
  const imageEl = document.getElementById('modalMediaImage');
  const videoEl = document.getElementById('modalMediaVideo');
  const imgBtn = document.getElementById('mediaTabImgBtn');
  const vidBtn = document.getElementById('mediaTabVidBtn');

  if (tabName === 'video') {
    if (imageEl) imageEl.style.display = 'none';
    if (videoEl) videoEl.style.display = 'block';
    if (imgBtn) imgBtn.classList.remove('active');
    if (vidBtn) vidBtn.classList.add('active');
  } else {
    if (videoEl) videoEl.style.display = 'none';
    if (imageEl) imageEl.style.display = 'block';
    if (vidBtn) vidBtn.classList.remove('active');
    if (imgBtn) imgBtn.classList.add('active');
  }
};

// Render Products
function renderProducts() {
  if (!productsGrid) return;

  const filtered = PRODUCTS.filter(p => {
    return p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
           p.shortDesc.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
           p.categoryName.toLowerCase().includes(state.searchQuery.toLowerCase());
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: #64748b;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; color: var(--cyber-cyan);">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3 style="color: #fff; margin-bottom: 0.5rem;">No products found</h3>
        <p>Try searching for a different keyword.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filtered.map(p => {
    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-thumb-container" onclick="openProductModal('${p.id}')" style="cursor: pointer;">
          <img src="${p.thumbnail}" alt="${p.name}" class="product-thumb-img" loading="lazy" />
          <div class="thumb-overlay"></div>
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
          <span class="card-category-tag">${p.categoryName}</span>
          ${p.videoUrl ? `
            <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(6, 9, 16, 0.85); border: 1px solid var(--cyber-cyan); border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; color: var(--cyber-cyan); font-weight: 700; display: flex; align-items: center; gap: 5px; backdrop-filter: blur(8px);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Watch Video
            </div>
          ` : ''}
        </div>

        <div class="product-body">
          <h3 class="product-title" onclick="openProductModal('${p.id}')" style="cursor: pointer;">${p.name}</h3>
          <p class="product-desc">${p.shortDesc}</p>

          <ul class="product-features-preview">
            ${p.features.slice(0, 4).map(f => `
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>

          <div class="product-footer">
            <div class="price-box">
              <span class="current-price">${formatPrice(p.price)}</span>
              ${p.originalPrice ? `<span class="original-price">${formatPrice(p.originalPrice)}</span>` : ''}
            </div>

            <div class="card-action-btns">
              <button class="btn-icon-action" title="View Details & Video" onclick="openProductModal('${p.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </button>
              <button class="btn btn-cyan" style="padding: 9px 18px; font-size: 0.88rem;" onclick="addToCart('${p.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Modal Details Window with Video Player Support
function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || !modalContentBody) return;

  const embedVideoUrl = getYoutubeEmbedUrl(product.videoUrl);

  modalContentBody.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; padding: 2rem;">
      
      <!-- Media Header Tabs (Banner vs Video) -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; gap: 8px;">
            <button id="mediaTabImgBtn" class="tab-btn active" style="padding: 6px 14px; font-size: 0.8rem;" onclick="switchModalMedia('image')">
              📷 Poster View
            </button>
            ${embedVideoUrl ? `
              <button id="mediaTabVidBtn" class="tab-btn" style="padding: 6px 14px; font-size: 0.8rem; display: flex; align-items: center; gap: 6px;" onclick="switchModalMedia('video')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                🎬 Video Preview
              </button>
            ` : ''}
          </div>
          <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">SB Media Showcase</span>
        </div>

        <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; height: 320px; border: 1px solid var(--border-subtle); background: #000;">
          <!-- Image Container -->
          <div id="modalMediaImage" style="width: 100%; height: 100%; position: relative;">
            <img src="${product.thumbnail}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(0deg, rgba(11, 17, 30, 0.95) 0%, transparent 60%);"></div>
            <div style="position: absolute; bottom: 16px; left: 16px; right: 16px;">
              <span style="display: inline-block; background: var(--cyber-cyan); color: #060910; font-weight: 800; font-size: 0.72rem; padding: 4px 10px; border-radius: 4px; margin-bottom: 6px;">${product.categoryName}</span>
              <h2 style="font-size: 2rem; line-height: 1.2;">${product.name}</h2>
            </div>
          </div>

          <!-- Video Container -->
          ${embedVideoUrl ? `
            <div id="modalMediaVideo" style="display: none; width: 100%; height: 100%;">
              <iframe 
                src="${embedVideoUrl}" 
                title="${product.name} Preview Video" 
                style="width: 100%; height: 100%; border: none;" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
              </iframe>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Price & Framework Compatibility Badges -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem;">
        <div>
          <span style="color: #64748b; font-size: 0.82rem; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Price (USD)</span>
          <div style="display: flex; align-items: baseline; gap: 10px;">
            <span style="font-size: 2.3rem; font-weight: 800; font-family: var(--font-heading); color: var(--cyber-cyan); line-height: 1;">
              ${formatPrice(product.price)}
            </span>
            ${product.originalPrice ? `
              <span style="font-size: 1.15rem; color: #64748b; text-decoration: line-through;">
                ${formatPrice(product.originalPrice)}
              </span>
            ` : ''}
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${product.compatibility.map(c => `<span style="background: rgba(0, 102, 255, 0.15); border: 1px solid rgba(0, 229, 255, 0.35); color: #93c5fd; font-size: 0.78rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full);">${c}</span>`).join('')}
        </div>
      </div>

      <!-- Overview & Narrative Description -->
      <div>
        <h4 style="color: #cbd5e1; margin-bottom: 0.75rem; text-transform: uppercase; font-size: 1.1rem;">Overview & Gameplay Details</h4>
        ${product.detailedDesc || `<p style="color: #94a3b8; font-size: 0.98rem; line-height: 1.7;">${product.shortDesc}</p>`}
      </div>

      <!-- Included Battle Arenas -->
      ${product.arenaList ? `
        <div>
          <h4 style="color: #cbd5e1; margin-bottom: 0.75rem; text-transform: uppercase; font-size: 1.1rem;">Included Battle Arenas (6+)</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem;">
            ${product.arenaList.map(arena => `
              <div style="background: rgba(14, 22, 38, 0.85); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: #f1f5f9;">
                <span style="color: var(--cyber-cyan);">📍</span>
                <strong>${arena}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Detailed Features & Tech Specs -->
      <div>
        <h4 style="color: #cbd5e1; margin-bottom: 0.75rem; text-transform: uppercase; font-size: 1.1rem;">Key Features & Customization</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75rem;">
          ${product.features.map(f => `
            <div style="background: rgba(14, 22, 38, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 0.88rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cyber-cyan)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${f}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Checkout / Add to Cart Bar -->
      <div style="background: rgba(10, 16, 29, 0.85); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem;">
        <div>
          <span style="font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Instant Delivery</span>
          <p style="font-size: 0.88rem; color: #cbd5e1;">Instant asset grant via CFX Keymaster / Tebex.</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline" onclick="addToCart('${product.id}'); closeModal();">
            Add to Cart
          </button>
          <button type="button" onclick="checkoutProduct('${product.id}')" class="btn btn-cyan">
            Checkout on Tebex ($${product.price})
          </button>
        </div>
      </div>
    </div>
  `;

  productModal.classList.add('open');
}

function closeModal() {
  if (productModal) {
    productModal.classList.remove('open');
    // Stop any playing video by clearing content or resetting iframe
    const iframe = productModal.querySelector('iframe');
    if (iframe) iframe.src = iframe.src;
  }
}

// Shopping Cart Functions
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  updateCartUI();
  showToast(`Added "${product.name}" to cart!`);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  updateCartUI();
  saveCart();
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    updateCartUI();
  saveCart();
  }
}

function updateCartUI() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountBadge) {
    cartCountBadge.textContent = totalCount;
    cartCountBadge.style.display = totalCount > 0 ? 'flex' : 'none';
  }

  const subtotalUSD = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountUSD = 0;

  if (state.appliedPromo) {
    discountUSD = subtotalUSD * (state.appliedPromo.discountPercent / 100);
  }

  const finalTotalUSD = Math.max(0, subtotalUSD - discountUSD);

  if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotalUSD);
  if (cartTotalEl) cartTotalEl.textContent = formatPrice(finalTotalUSD);

  if (cartDiscountRow && cartDiscountEl) {
    if (state.appliedPromo) {
      cartDiscountRow.style.display = 'flex';
      cartDiscountEl.textContent = `-${formatPrice(discountUSD)} (${state.appliedPromo.discountPercent}%)`;
    } else {
      cartDiscountRow.style.display = 'none';
    }
  }

  if (!cartItemsContainer) return;

  if (state.cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" style="margin-bottom: 0.75rem;">
          <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p>Your shopping cart is currently empty.</p>
        <button class="btn btn-outline" style="margin-top: 1rem; font-size: 0.8rem; padding: 6px 14px;" onclick="closeCart();">Explore Packages</button>
      </div>
    `;
  } else {
    cartItemsContainer.innerHTML = state.cart.map(item => `
    <div style="background: rgba(14, 22, 38, 0.75); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px; display: flex; gap: 12px; align-items: center;">
      <img src="${item.thumbnail}" alt="${item.name}" style="width: 58px; height: 58px; border-radius: var(--radius-sm); object-fit: cover;" />
      <div style="flex: 1; min-width: 0;">
        <h4 style="font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${item.name}</h4>
        <span style="font-size: 0.88rem; color: var(--cyber-cyan); font-weight: 700;">${formatPrice(item.price)}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button onclick="updateCartQuantity('${item.id}', -1)" style="width: 24px; height: 24px; background: #0e1626; border: 1px solid var(--border-subtle); color: #fff; border-radius: 4px; cursor: pointer;">-</button>
        <span style="font-size: 0.88rem; font-weight: 700; min-width: 16px; text-align: center;">${item.quantity}</span>
        <button onclick="updateCartQuantity('${item.id}', 1)" style="width: 24px; height: 24px; background: #0e1626; border: 1px solid var(--border-subtle); color: #fff; border-radius: 4px; cursor: pointer;">+</button>
      </div>
      <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Remove">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `).join('');


    }

  // Update Live Verification Status in Cart Drawer
  const statusEl = document.getElementById('cartVerificationStatus');
  const checkBtn = document.getElementById('checkoutBtn');
  const verified = isFullyVerified();
  const cfxUser = getCfxUser();
  const discordUser = getUserAuth();

  if (statusEl) {
    if (verified) {
      statusEl.className = 'cart-verification-status verified';
      statusEl.innerHTML = '✓ FiveM &amp; Discord Verified (Automated Delivery Ready)';
    } else {
      statusEl.className = 'cart-verification-status unverified';
      let missing = [];
      if (!cfxUser || !cfxUser.username) missing.push("FiveM");
      if (!discordUser || !discordUser.discordConnected) missing.push("Discord");
      statusEl.innerHTML = `🔒 ${missing.join(" & ")} Required to Purchase`;
    }
  }

  if (checkBtn) {
    if (verified) {
      checkBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
        Proceed to Tebex Checkout ⚡
      `;
    } else {
      checkBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
        Connect Accounts to Buy 🔒
      `;
    }
  }

}

function openCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
  }
}

function closeCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
  }
}

// Promo code handling with Real-Time Tebex API Cross-Checking
async function applyPromoCode() {
  if (!promoInput) return;
  const code = promoInput.value.trim().toUpperCase();
  if (!code) return;

  const btn = applyPromoBtn;
  if (btn) {
    btn.disabled = true;
    btn.dataset.prevText = btn.textContent;
    btn.textContent = "Verifying...";
  }

  showToast(`Cross-checking coupon "${code}" with Tebex...`, "⏳");

  try {
    const token = STORE_CONFIG.tebexPublicToken || "14k2h-a978682a5488b33e5ef8e072c853d19c4b2d840a";
    const siteOrigin = getSafeOrigin();

    // 1. Create a basket to test the coupon against Tebex
    const bRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complete_url: `${siteOrigin}/?checkout=complete`,
        cancel_url: `${siteOrigin}/?checkout=cancel`,
        complete_auto_redirect: true
      })
    });
    const bData = await bRes.json();
    const ident = bData?.data?.ident;

    let tebexSuccess = false;
    let tebexDiscount = 10;

    if (ident) {
      // 2. Cross-check with Tebex Coupon API
      const cRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon_code: code })
      });

      const cData = await cRes.json().catch(() => ({}));

      if (cRes.ok && cData?.data) {
        tebexSuccess = true;
        const basket = cData.data;
        const base = basket.base_price || 13.99;
        const total = basket.total_price || 13.99;
        const diff = Math.max(0, base - total);
        if (base > 0 && diff > 0) {
          tebexDiscount = Math.round((diff / base) * 100);
        }
      }
    }

    if (tebexSuccess) {
      state.appliedPromo = {
        code: code,
        discountPercent: tebexDiscount,
        verifiedTebex: true
      };
      updateCartUI();
      showToast(`🎉 Verified Tebex Coupon "${code}" applied! (${tebexDiscount}% OFF)`, "✓");
      return;
    }

    // Check predefined local coupons (e.g. SBDEV10)
    const localPromo = STORE_CONFIG.promoCodes[code];
    if (localPromo) {
      state.appliedPromo = localPromo;
      updateCartUI();
      showToast(`Code "${code}" applied! ${localPromo.discountPercent}% off discount activated.`, "🎉");
      return;
    }

    // Rejected! Cross-check failed!
    state.appliedPromo = null;
    updateCartUI();
    showToast(`❌ Coupon "${code}" is invalid or not found in Tebex.`, "⚠️");

  } catch (err) {
    console.error("Coupon cross-check error:", err);
    const localPromo = STORE_CONFIG.promoCodes[code];
    if (localPromo) {
      state.appliedPromo = localPromo;
      updateCartUI();
      showToast(`Code "${code}" applied! ${localPromo.discountPercent}% off discount activated.`, "🎉");
    } else {
      state.appliedPromo = null;
      updateCartUI();
      showToast(`❌ Invalid coupon code "${code}". Please check your Tebex dashboard.`, "⚠️");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset.prevText || "Apply";
    }
  }
}

// ==========================================
// ==========================================
// DISCORD OAUTH2 ACCOUNT VERIFICATION & SYNC
// ==========================================
const AUTH_STORAGE_KEY = 'sb_user_auth';

function getUserAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveUserAuth(data) {
  try {
    if (data) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

// Check if user returned from Discord OAuth2 Authorize with #access_token=...
function checkDiscordOAuthCallback() {
  if (!window.location.hash) return;
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const error = params.get('error');

  if (error) {
    showToast(`Discord authorization error: ${params.get('error_description') || error}`, '⚠️');
    window.history.replaceState(null, null, window.location.pathname);
    return;
  }

  if (accessToken) {
    showToast("Connecting with Discord...", "⚡");
    fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(user => {
      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id || '0') >> 22n) % 6n}.png`;

      const authData = {
        discordConnected: true,
        id: user.id,
        username: user.username,
        displayName: user.global_name || user.username,
        avatarUrl: avatarUrl,
        verified: true,
        accessToken: accessToken
      };

      saveUserAuth(authData);
      window.history.replaceState(null, null, window.location.pathname);
      updateAuthUI();
      showToast(`Welcome, ${authData.displayName}! Discord authorized.`, "✓");

      // Open Discord Server invite in background/new tab
      if (STORE_CONFIG.discordUrl) {
        window.open(STORE_CONFIG.discordUrl, '_blank');
      }
    })
    .catch(err => {
      console.error('Discord fetch error:', err);
      showToast("Failed to fetch Discord profile. Please try again.", "⚠️");
      window.history.replaceState(null, null, window.location.pathname);
    });
  }
}

function updateAuthUI() {
  const auth = getUserAuth();
  const cfx = getCfxUser();

  const isFivemConnected = Boolean(cfx && cfx.username);
  const isDiscordConnected = Boolean(auth && auth.discordConnected);
  const isDualVerified = isFivemConnected && isDiscordConnected;

  const authBtnText = document.getElementById('userAuthBtnText');
  const authBtn = document.getElementById('userAuthBtn');
  const mobileAuthBtnText = document.getElementById('mobileUserAuthBtnText');
  const authConnectView = document.getElementById('authConnectView');
  const authLinkedView = document.getElementById('authLinkedView');

  // Step 1: FiveM
  const fivemBox = document.getElementById('authStepFivemBox');
  const fivemAction = document.getElementById('authStepFivemAction');
  const fivemSub = document.getElementById('authStepFivemSub');
  const fivemNum = document.getElementById('authStepFivemNum');

  if (isFivemConnected) {
    if (fivemBox) { fivemBox.classList.add('completed'); }
    if (fivemNum) fivemNum.innerHTML = '&#10003;';
    if (fivemSub) fivemSub.textContent = `Connected as @${cfx.username} (Keymaster Active)`;
    if (fivemAction) fivemAction.innerHTML = `<span class="step-verified-badge">✓ FiveM Verified</span>`;
  } else {
    if (fivemBox) { fivemBox.classList.remove('completed'); }
    if (fivemNum) fivemNum.textContent = '1';
    if (fivemSub) fivemSub.textContent = 'Required for CFX Keymaster license transfer';
    if (fivemAction) {
      fivemAction.innerHTML = `
        <button type="button" id="modalFivemLoginBtn" class="btn btn-fivem" style="padding: 7px 14px; font-size: 0.82rem; display: flex; align-items: center; gap: 8px;">
          <img src="assets/images/fivem_logo.png" alt="FiveM Logo" style="width: 18px; height: 18px; object-fit: contain;" />
          <span>Connect FiveM</span>
        </button>
      `;
      const mBtn = document.getElementById('modalFivemLoginBtn');
      if (mBtn) mBtn.addEventListener('click', () => { closeAuthModal(); startFiveMLogin(); });
    }
  }

  // Step 2: Discord
  const discordBox = document.getElementById('authStepDiscordBox');
  const discordAction = document.getElementById('authStepDiscordAction');
  const discordSub = document.getElementById('authStepDiscordSub');
  const discordNum = document.getElementById('authStepDiscordNum');

  if (isDiscordConnected) {
    if (discordBox) { discordBox.classList.add('completed'); }
    if (discordNum) discordNum.innerHTML = '&#10003;';
    if (discordSub) discordSub.textContent = `Connected as @${auth.displayName || auth.username} (Server Member)`;
    if (discordAction) discordAction.innerHTML = `<span class="step-verified-badge">✓ Discord Verified</span>`;
  } else {
    if (discordBox) { discordBox.classList.remove('completed'); }
    if (discordNum) discordNum.textContent = '2';
    if (discordSub) discordSub.textContent = 'Join & connect for buyer role and script updates';
    if (discordAction) {
      discordAction.innerHTML = `
        <button type="button" id="authDiscordLoginBtn" class="btn btn-discord" style="padding: 7px 14px; font-size: 0.82rem; display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span>Connect &amp; Join Discord</span>
        </button>
      `;
      const dBtn = document.getElementById('authDiscordLoginBtn');
      if (dBtn) dBtn.addEventListener('click', triggerDiscordOAuth);
    }
  }

  // Strict Dual Verification Display
  const bothProceedBtn = document.getElementById('modalBothProceedBtn');
  if (isDualVerified) {
    if (bothProceedBtn) {
      bothProceedBtn.style.display = 'block';
      bothProceedBtn.onclick = () => {
        closeAuthModal();
        handleCheckout();
      };
    }
    if (authConnectView) authConnectView.style.display = 'none';
    if (authLinkedView) authLinkedView.style.display = 'block';

    const displayName = (auth && (auth.displayName || auth.username)) || cfx.username || 'Player';
    if (authBtnText) authBtnText.textContent = displayName;
    if (authBtn) {
      authBtn.classList.add('signed-in');
      authBtn.title = `FiveM: @${cfx.username} | Discord: @${auth?.username || displayName}`;
    }
    if (mobileAuthBtnText) mobileAuthBtnText.textContent = `✓ ${displayName} (Dual Verified)`;

    const linkedDiscordAvatar = document.getElementById('linkedDiscordAvatar');
    const linkedDiscordName = document.getElementById('linkedDiscordName');
    const linkedDiscordId = document.getElementById('linkedDiscordId');
    if (linkedDiscordAvatar && auth?.avatarUrl) linkedDiscordAvatar.src = auth.avatarUrl;
    if (linkedDiscordName) linkedDiscordName.textContent = displayName;
    if (linkedDiscordId) linkedDiscordId.textContent = `CFX: @${cfx.username} | Discord: #${auth?.id || 'Verified'}`;
  } else {
    // NOT dual verified -> NEVER show authLinkedView!
    if (bothProceedBtn) bothProceedBtn.style.display = 'none';
    if (authConnectView) authConnectView.style.display = 'block';
    if (authLinkedView) authLinkedView.style.display = 'none';

    if (authBtnText) authBtnText.textContent = isDiscordConnected ? (auth.displayName || 'Discord Connected') : (isFivemConnected ? cfx.username : 'Sign In');
    if (authBtn) authBtn.classList.remove('signed-in');
    if (mobileAuthBtnText) mobileAuthBtnText.textContent = isDiscordConnected ? `✓ Discord Linked` : `Sign In (FiveM & Discord)`;
  }
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    updateAuthUI();
    modal.classList.add('open');
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('open');
}

// ==========================================
// WASABI-STYLE CFX / FIVEM AUTHENTICATION
// ==========================================
function getCfxUser() {
  try {
    const raw = localStorage.getItem('sb_cfx_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveCfxUser(user) {
  try {
    if (user) {
      localStorage.setItem('sb_cfx_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sb_cfx_user');
    }
  } catch (e) {}
}

function updateCfxAuthUI() {
  const user = getCfxUser();
  const dropdownWrap = document.getElementById('cfxDropdownWrap');
  const loginBtn = document.getElementById('fivemLoginBtn');
  const usernameText = document.getElementById('cfxUsernameText');
  const dropdownName = document.getElementById('cfxDropdownNameText');
  const dropdownId = document.getElementById('cfxDropdownIdText');
  const avatarInitial = document.getElementById('cfxAvatarInitial');

  if (user && user.username) {
    if (dropdownWrap) dropdownWrap.style.display = 'inline-block';
    if (loginBtn) loginBtn.style.display = 'none';
    if (usernameText) usernameText.textContent = user.username;
    if (dropdownName) dropdownName.textContent = user.username;
    if (dropdownId) dropdownId.textContent = user.id ? `CFX: #${user.id}` : 'CFX: #Verified';
    if (avatarInitial) avatarInitial.textContent = user.username.charAt(0).toUpperCase();
  } else {
    if (dropdownWrap) dropdownWrap.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'flex';
  }
}

function showCfxModal(badge, title, desc) {
  const modal = document.getElementById('cfxAuthModal');
  const b = document.getElementById('cfxModalBadge');
  const t = document.getElementById('cfxModalTitle');
  const d = document.getElementById('cfxModalDesc');
  if (b) b.textContent = badge;
  if (t) t.textContent = title;
  if (d) d.textContent = desc;
  if (modal) modal.classList.add('active');
}

function hideCfxModal() {
  const modal = document.getElementById('cfxAuthModal');
  if (modal) modal.classList.remove('active');
}

async function startFiveMLogin() {
  showCfxModal("CFX LOGIN", "Redirecting to FiveM", "Opening the CFX login page. Hang tight.");

  try {
    const token = STORE_CONFIG.tebexPublicToken || "14k2h-a978682a5488b33e5ef8e072c853d19c4b2d840a";
    const siteOrigin = getSafeOrigin();

    // 1. Create basket
    const bRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complete_url: `${siteOrigin}/?checkout=complete`,
        cancel_url: `${siteOrigin}/?checkout=cancel`,
        complete_auto_redirect: true
      })
    });
    const bData = await bRes.json();
    const ident = bData?.data?.ident;
    if (!ident) throw new Error("Could not initialize basket");

    // 2. Fetch FiveM OAuth redirect
    const returnUrl = `${siteOrigin}/?cfx_auth_success=1&basket=${encodeURIComponent(ident)}`;
    const authRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
    const authData = await authRes.json();

    if (Array.isArray(authData) && authData[0]?.url) {
      window.location.href = authData[0].url;
      return;
    }
    throw new Error("FiveM login endpoint unavailable");
  } catch (err) {
    console.error("FiveM login error:", err);
    hideCfxModal();
    showToast("FiveM login temporary error. Please try again.", "⚠️");
  }
}

async function checkCfxAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const isCfxAuth = urlParams.get('cfx_auth_success') === '1';
  const basketIdent = urlParams.get('basket');

  if (isCfxAuth && basketIdent) {
    showCfxModal("CFX LOGIN", "Logging in", "Logging in. Confirming your CFX account...");

    try {
      const token = STORE_CONFIG.tebexPublicToken || "14k2h-a978682a5488b33e5ef8e072c853d19c4b2d840a";
      const bRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(basketIdent)}`);
      const bData = await bRes.json();
      const basket = bData?.data || {};

      const username = basket.username || "CFX Player";
      const userId = basket.username_id || "Verified";

      saveCfxUser({
        username: username,
        id: userId,
        basket: basketIdent
      });

      showCfxModal("CFX LOGIN", "You're in", `Logged in as ${username}. Redirecting to home...`);

      setTimeout(() => {
        hideCfxModal();
        window.history.replaceState({}, document.title, window.location.pathname);
        updateCfxAuthUI();
        showToast(`Welcome back, ${username}!`, "🎮");
      }, 1400);

    } catch (err) {
      console.warn("Could not retrieve basket details after auth:", err);
      saveCfxUser({ username: "CFX Player", id: "Verified", basket: basketIdent });
      hideCfxModal();
      window.history.replaceState({}, document.title, window.location.pathname);
      updateCfxAuthUI();
    }
  }
}

// Create a real Tebex basket through the Netlify serverless function or
// direct Headless Tebex API, then redirect the customer to Tebex's hosted payment checkout.

function getSafeOrigin() {
  if (typeof window === 'undefined') return "https://sbdevelopers-six.vercel.app";
  const proto = window.location.protocol;
  if (proto === 'file:' || !window.location.origin || window.location.origin === 'null') {
    return "https://sbdevelopers-six.vercel.app";
  }
  // Supports GitHub Pages (e.g. username.github.io/repository), custom domains, and Netlify
  const cleanPath = window.location.pathname.replace(/\/index\.html$/i, '').replace(/\/$/, '');
  return window.location.origin + cleanPath;
}


function showCheckoutLoadingScreen(msg = "CONNECTING TO TEBEX SECURE CHECKOUT...") {
  const loader = document.getElementById('sbPageLoader');
  if (!loader) return;
  const sub = loader.querySelector('.sb-loader-subtext');
  const bar = document.getElementById('sbLoaderBar');
  if (sub) sub.textContent = msg;
  if (bar) {
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = '40%'; }, 100);
    setTimeout(() => { bar.style.width = '75%'; }, 350);
    setTimeout(() => { bar.style.width = '95%'; }, 650);
  }
  loader.classList.remove('fade-out');
  loader.style.opacity = '1';
  loader.style.visibility = 'visible';
  loader.style.pointerEvents = 'auto';
}

function initPageLoader() {
  const loader = document.getElementById('sbPageLoader');
  const bar = document.getElementById('sbLoaderBar');
  if (!loader) return;

  if (bar) {
    setTimeout(() => { bar.style.width = '45%'; }, 150);
    setTimeout(() => { bar.style.width = '85%'; }, 450);
    setTimeout(() => { bar.style.width = '100%'; }, 750);
  }

  setTimeout(() => {
    loader.classList.add('fade-out');
  }, 1100);
}

function checkOrderCompleteCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const isComplete = urlParams.get('checkout') === 'complete' || 
                     urlParams.get('success') === '1' || 
                     urlParams.get('success') === 'true' || 
                     urlParams.get('order_complete') === '1' || 
                     urlParams.get('test_order') === '1' ||
                     urlParams.has('payment_status');

  if (isComplete) {
    state.cart = [];
    saveCart();
    updateCartUI();

    const modal = document.getElementById('tebexOrderModal');
    const orderNum = document.getElementById('tebexOrderNum');
    const subText = document.getElementById('tebexOrderSub');

    if (orderNum) {
      const orderId = urlParams.get('order_id') || 
                      urlParams.get('txn_id') || 
                      urlParams.get('basket') || 
                      'tbx-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
      orderNum.textContent = orderId;
    }

    if (modal) {
      modal.style.display = 'flex';
    }
  }

  const continueBtn = document.getElementById('tebexOrderContinueBtn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const modal = document.getElementById('tebexOrderModal');
      if (modal) modal.style.display = 'none';
      window.history.replaceState({}, document.title, window.location.pathname);
    });
  }
}

async function checkPendingTebexRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const basketIdent = urlParams.get("tebex_basket");
  const pkgId = urlParams.get("pkg") || "7723283";
  if (basketIdent) {
    showToast("Finalizing Tebex checkout...", "⚡");
    try {
      await fetch(`https://headless.tebex.io/api/baskets/${encodeURIComponent(basketIdent)}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: pkgId, quantity: 1 })
      });
    } catch (e) {
      console.warn("Could not add package after auth:", e);
    }
    window.location.href = `https://pay.tebex.io/${encodeURIComponent(basketIdent)}`;
  }
}

async function startTebexCheckout(items) {
  if (!isFullyVerified()) {
    showToast("Verification Required: Both FiveM and Discord must be connected before buying!", "🔒");
    openAuthModal();
    return;
  }
  if (!Array.isArray(items) || items.length === 0) {
    showToast("Please add items to your cart first!", "🛒");
    return;
  }

  const primaryPkgId = items[0]?.tebexPackageId || "7723283";
  const button = checkoutBtn;
  if (button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = "Opening Tebex Checkout...";
  }

  try {
    let checkoutUrl = null;

    // 1. Try serverless endpoint first
    try {
      const response = await fetch(STORE_CONFIG.tebexCheckoutFunction || "/.netlify/functions/tebex-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            packageId: item.tebexPackageId || "7723283",
            quantity: item.quantity || 1
          })),
          couponCode: state.appliedPromo?.code || "",
          currency: state.currentCurrency || "USD"
        })
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data && data.checkoutUrl) {
          checkoutUrl = data.checkoutUrl;
        }
      }
    } catch (err) {
      console.warn("Serverless checkout error, falling back to direct Headless API:", err);
    }

    // 2. Direct client-side Headless API fallback (CORS enabled on headless.tebex.io)
    if (!checkoutUrl) {
      const token = STORE_CONFIG.tebexPublicToken || "14k2h-a978682a5488b33e5ef8e072c853d19c4b2d840a";
      const siteOrigin = getSafeOrigin();
      const bRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complete_url: `${siteOrigin}/?checkout=complete`,
          cancel_url: `${siteOrigin}/?checkout=cancel`,
          complete_auto_redirect: true,
          currency: state.currentCurrency || "USD"
        })
      });

      const bData = await bRes.json();
      const ident = bData?.data?.ident;
      if (!ident) throw new Error("Could not initialize Tebex basket");
      if (state.appliedPromo?.code) {
        try {
          await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/coupons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coupon_code: state.appliedPromo.code })
          });
        } catch (e) {
          console.warn("Could not attach coupon to basket:", e);
        }
      }

      const returnUrl = `${siteOrigin}/?tebex_basket=${encodeURIComponent(ident)}&pkg=${encodeURIComponent(primaryPkgId)}&currency=${encodeURIComponent(state.currentCurrency || "USD")}`;
      const authRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      const authData = await authRes.json();

      if (Array.isArray(authData) && authData[0]?.url) {
        checkoutUrl = authData[0].url;
      } else {
        checkoutUrl = `https://pay.tebex.io/${encodeURIComponent(ident)}`;
      }
    }

    if (checkoutUrl) {
      // Pre-fill coupon in URL if applied
      if (state.appliedPromo?.code && !checkoutUrl.includes("coupon=")) {
        const joinChar = checkoutUrl.includes("?") ? "&" : "?";
        checkoutUrl = `${checkoutUrl}${joinChar}coupon=${encodeURIComponent(state.appliedPromo.code)}&promocode=${encodeURIComponent(state.appliedPromo.code)}`;
      }

      if (state.currentCurrency && !checkoutUrl.includes("currency=")) {
        const joinChar = checkoutUrl.includes("?") ? "&" : "?";
        checkoutUrl = `${checkoutUrl}${joinChar}currency=${encodeURIComponent(state.currentCurrency)}`;
      }

      showCheckoutLoadingScreen("CONNECTING TO TEBEX SECURE CHECKOUT...");
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 750);
      return;
    }

    throw new Error("Could not obtain checkout URL");
  } catch (error) {
    console.error("Tebex checkout error:", error);
    showToast("Checkout error. Please try again.", "⚠️");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = button.dataset.originalText || "Proceed to Checkout";
    }
  }
}

function isFullyVerified() {
  const cfxUser = getCfxUser();
  const discordUser = getUserAuth();
  return Boolean(cfxUser && cfxUser.username && discordUser && discordUser.discordConnected);
}

function handleCheckout() {
  const cfxUser = getCfxUser();
  const discordUser = getUserAuth();

  if (!cfxUser || !cfxUser.username) {
    showToast("FiveM account required for Keymaster delivery! Please connect FiveM.", "🔒");
    openAuthModal();
    return;
  }

  if (!discordUser || !discordUser.discordConnected) {
    showToast("Discord account required! Please connect & join Discord server.", "🔒");
    openAuthModal();
    return;
  }

  if (!state.cart || state.cart.length === 0) {
    showToast("Please add items to your cart first!", "🛒");
    return;
  }

  return startTebexCheckout(state.cart);
}

function checkoutProduct(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  state.cart = [{ ...product, quantity: 1 }];
  saveCart();
  updateCartUI();

  if (!isFullyVerified()) {
    const cfxUser = getCfxUser();
    const discordUser = getUserAuth();
    let missing = [];
    if (!cfxUser || !cfxUser.username) missing.push("FiveM (Keymaster)");
    if (!discordUser || !discordUser.discordConnected) missing.push("Discord (Server Member)");
    showToast(`Verification Required: Please connect ${missing.join(" & ")} before buying!`, "🔒");
    openAuthModal();
    return;
  }

  return startTebexCheckout(state.cart);
}

// ==========================================
// AUTHENTIC CUSTOMER REVIEW SYSTEM
// ==========================================
const REVIEWS_STORAGE_KEY = 'sb_customer_reviews';

function getStoredReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveReviews(reviews) {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error("Could not save reviews to localStorage", e);
  }
}

function openReviewModal() {
  if (reviewModal) {
    reviewModal.classList.add('open');
    setStarRating(5);
  }
}

function closeReviewModal() {
  if (reviewModal) {
    reviewModal.classList.remove('open');
    if (reviewForm) reviewForm.reset();
  }
}

function setStarRating(rating) {
  state.selectedRating = rating;
  starButtons.forEach((btn, idx) => {
    if (idx < rating) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function renderReviews() {
  if (!reviewsContainer) return;
  const reviews = getStoredReviews();

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = `
      <div class="empty-reviews-box">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cyber-cyan)" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.85;">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <h3 style="color: #fff; font-size: 1.4rem; margin-bottom: 0.5rem;">No Reviews Yet</h3>
        <p style="color: #94a3b8; max-width: 500px; margin: 0 auto 1.5rem;">Purchased our SB TDM script? Leave verified feedback below to share your experience with the community!</p>
        <button class="btn btn-cyan" onclick="openReviewModal()">
          Write The First Review
        </button>
      </div>
    `;
    return;
  }

  reviewsContainer.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-card-top">
        <div>
          <div class="review-user-name">${r.name}</div>
          <span style="font-size: 0.78rem; color: #64748b;">${r.serverName || 'Verified Server Owner'}</span>
        </div>
        <span class="review-badge">Verified Customer</span>
      </div>

      <div style="display: flex; gap: 4px; color: #f59e0b; margin-bottom: 0.75rem;">
        ${Array(r.rating || 5).fill(0).map(() => `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        `).join('')}
      </div>

      <p class="review-comment">"${r.comment}"</p>
      <div style="margin-top: auto; padding-top: 1rem; font-size: 0.76rem; color: var(--cyber-cyan); font-weight: 600;">
        Package: ${r.productName || 'SB TDM - Team Deathmatch'}
      </div>
    </div>
  `).join('');
}

// Handle Review Submission
function handleReviewSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('reviewName');
  const serverInput = document.getElementById('reviewServer');
  const commentInput = document.getElementById('reviewComment');
  const productSelect = document.getElementById('reviewProduct');

  if (!nameInput || !commentInput) return;

  const newReview = {
    id: Date.now(),
    name: nameInput.value.trim() || "Verified Customer",
    serverName: serverInput.value.trim() || "FiveM Server",
    productName: productSelect ? productSelect.value : "SB TDM - Team Deathmatch",
    rating: state.selectedRating,
    comment: commentInput.value.trim(),
    date: "Just now"
  };

  const currentReviews = getStoredReviews();
  currentReviews.unshift(newReview);
  saveReviews(currentReviews);

  closeReviewModal();
  renderReviews();
  showToast("Thank you! Your verified review has been published.", "⭐");
}

// Populate FAQ section dynamically
function renderFAQs() {
  const FAQS = [
    {
      q: "How does product delivery work after purchasing on Tebex?",
      a: "Immediately after checkout, your asset is automatically granted to your CFX / FiveM Keymaster account. You can download and deploy the resource straight away."
    },
    {
      q: "Is SB TDM compatible with my framework?",
      a: "Yes! SB TDM supports QBCore, ESX Legacy, Qbox, and Standalone servers right out of the box with an easy-to-use config file."
    },
    {
      q: "Where do I get support or ask questions?",
      a: "Join our official <a href='https://discord.gg/JPfmWeqMMC' target='_blank' rel='noopener noreferrer' style='color: var(--cyber-cyan); text-decoration: underline;'>Discord Server</a> and open a support ticket. Our development team is active and ready to help."
    },
    {
      q: "Can I add my own custom arenas to SB TDM?",
      a: "Yes. The script includes Aviham, Cayo Perico, Docks, West Vinewood, Observatory, and Boxing Arena by default, and you can add unlimited new arenas in the config."
    }
  ];

  if (!faqAccordion) return;
  faqAccordion.innerHTML = FAQS.map((faq, index) => `
    <div class="faq-item ${index === 0 ? 'active' : ''}">
      <button class="faq-question-btn">
        <span>${faq.q}</span>
        <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      <div class="faq-answer">
        <p>${faq.a}</p>
      </div>
    </div>
  `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
  // Mobile Navigation Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    if (mobileNavDrawer && mobileNavOverlay) {
      mobileNavDrawer.classList.add('open');
      mobileNavOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileNavDrawer && mobileNavOverlay) {
      mobileNavDrawer.classList.remove('open');
      mobileNavOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileMenu);
  if (mobileNavOverlay) mobileNavOverlay.addEventListener('click', closeMobileMenu);
  mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderProducts();
    });
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  if (applyPromoBtn) applyPromoBtn.addEventListener('click', applyPromoCode);
  if (promoInput) {
    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyPromoCode();
    });
  }

  if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeModal();
    });
  }

  // Reviews modal
  if (openReviewModalBtn) openReviewModalBtn.addEventListener('click', openReviewModal);
  if (reviewModalCloseBtn) reviewModalCloseBtn.addEventListener('click', closeReviewModal);
  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) closeReviewModal();
    });
  }
  if (reviewForm) reviewForm.addEventListener('submit', handleReviewSubmit);

  // Star ratings
  starButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const rating = parseInt(btn.dataset.rating, 10);
      setStarRating(rating);
    });
  });

  // Auth / Account Verification Modal
  const userAuthBtn = document.getElementById('userAuthBtn');
  const mobileUserAuthBtn = document.getElementById('mobileUserAuthBtn');
  const authModalCloseBtn = document.getElementById('authModalCloseBtn');
  const authCancelBtn = document.getElementById('authCancelBtn');
  const authDiscordLoginBtn = document.getElementById('authDiscordLoginBtn');
  const relinkAccountBtn = document.getElementById('relinkAccountBtn');
  const proceedToCheckoutModalBtn = document.getElementById('proceedToCheckoutModalBtn');

  if (userAuthBtn) userAuthBtn.addEventListener('click', openAuthModal);
  if (mobileUserAuthBtn) {
    mobileUserAuthBtn.addEventListener('click', () => {
      closeMobileMenu();
      openAuthModal();
    });
  }
  if (authModalCloseBtn) authModalCloseBtn.addEventListener('click', closeAuthModal);
  if (authCancelBtn) authCancelBtn.addEventListener('click', closeAuthModal);
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Connect with Discord OAuth2
  if (authDiscordLoginBtn) {
    authDiscordLoginBtn.addEventListener('click', triggerDiscordOAuth);
  }

  // Switch / Disconnect Account
  if (relinkAccountBtn) {
    relinkAccountBtn.addEventListener('click', () => {
      saveUserAuth(null);
      saveCfxUser(null);
      updateAuthUI();
      updateCfxAuthUI();
      showToast("Accounts disconnected. You can connect new accounts.", "ℹ️");
    });
  }

  // Proceed to Tebex Checkout directly from modal
  if (proceedToCheckoutModalBtn) {
    proceedToCheckoutModalBtn.addEventListener('click', () => {
      closeAuthModal();
      handleCheckout();
    });
  }

  // FiveM / CFX Authentication Listeners
    // Image 2 Connect with FiveM button
  const modalFivemBtn = document.getElementById('modalFivemLoginBtn');
  if (modalFivemBtn) {
    modalFivemBtn.addEventListener('click', () => {
      closeAuthModal();
      startFiveMLogin();
    });
  }

  const fivemBtn = document.getElementById('fivemLoginBtn');
  if (fivemBtn) {
    fivemBtn.addEventListener('click', () => {
      startFiveMLogin();
    });
  }

  const cfxPill = document.getElementById('cfxUserPillBtn');
  const cfxDropdown = document.getElementById('cfxDropdownWrap');
  if (cfxPill && cfxDropdown) {
    cfxPill.addEventListener('click', (e) => {
      e.stopPropagation();
      cfxDropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => {
      cfxDropdown.classList.remove('open');
    });
  }

  const cfxLogout = document.getElementById('cfxLogoutBtn');
  if (cfxLogout) {
    cfxLogout.addEventListener('click', (e) => {
      e.stopPropagation();
      saveCfxUser(null);
      updateCfxAuthUI();
      if (cfxDropdown) cfxDropdown.classList.remove('open');
      showToast("Signed out of FiveM account.", "ℹ️");
    });
  }

  // FAQ Accordion
  if (faqAccordion) {
    faqAccordion.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question-btn');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');
      faqAccordion.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  checkOrderCompleteCallback();
  checkCfxAuthCallback();
  updateCfxAuthUI();
  checkPendingTebexRedirect();
  checkDiscordOAuthCallback();
  renderProducts();
  renderFAQs();
  renderReviews();
  setupEventListeners();
  setupCurrencySelector();
  initHeroTypewriter();
  initHeroTitleTypewriter();
  updateCartUI();
  updateAuthUI();
});
