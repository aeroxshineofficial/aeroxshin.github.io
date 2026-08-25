/* ===== CONFIGURATION - EDIT HERE ===== */
const siteConfig = {
  brandName: "AeroXshine",
  tagline: "CHAMAK, HAR KONE MEIN.",
  positioning: "Premium Cleaning Solutions",
  phone: "7004104042",
  whatsapp: "917004104042",
  email: "aeroxshineofficial@gmail.com",
  location: "Patna, Bihar",
  instagram: "aeroxshineofficial",
  facebook: "aeroxshineofficial",
  youtube: "AeroXshine Official"
};

const SITE_NAME = siteConfig.brandName;
const WHATSAPP_NUMBER = siteConfig.whatsapp;
const COMPANY_PHONE = "+" + siteConfig.phone.slice(0,2) + " " + siteConfig.phone;
const COMPANY_EMAIL = siteConfig.email;
const COMPANY_ADDRESS = siteConfig.location;

const INSTAGRAM_URL = "https://instagram.com/" + siteConfig.instagram;
const FACEBOOK_URL = "https://facebook.com/" + siteConfig.facebook;
const YOUTUBE_URL = "https://youtube.com/@" + siteConfig.youtube.replace(/\s/g, "");

/* ===== CART HELPERS ===== */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("aeroxshine_cart")) || [];
  } catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem("aeroxshine_cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, qty) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty: qty });
  }
  saveCart(cart);
  showToast("Product added to order");
}

function updateCartQty(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem("aeroxshine_cart");
  updateCartBadge();
}

function getCartTotalItems() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll(".cart-badge");
  const total = getCartTotalItems();
  badges.forEach(badge => {
    badge.textContent = total;
    badge.style.display = total > 0 ? "flex" : "none";
  });
}

/* ===== PRODUCT HELPERS ===== */
function getProductById(id) {
  return products.find(p => p.id === id);
}

function getProductsByCategory(category) {
  if (!category || category === "all") return products;
  return products.filter(p => p.category === category);
}

function searchProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
}

function sortProducts(list, sortBy) {
  const sorted = [...list];
  switch (sortBy) {
    case "price-low": return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-high": return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "name-az": return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-za": return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default: return sorted;
  }
}

function filterAvailable(list, showAvailable) {
  if (showAvailable === "all") return list;
  return list.filter(p => showAvailable === "available" ? p.available : !p.available);
}

/* ===== FORMATTING ===== */
function formatPrice(price) {
  if (!price && price !== 0) return "Price on request";
  return "\u20B9" + Number(price).toLocaleString("en-IN");
}

/* ===== HEADER RENDERING ===== */
function renderHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isActive = (page) => currentPage === page ? "active" : "";

  header.innerHTML = `
    <div class="container header-inner">
      <a href="index.html" class="logo" aria-label="${SITE_NAME} Home">
        <img src="assets/images/logo.png" alt="${SITE_NAME}" height="50">
      </a>

      <nav class="nav-desktop" aria-label="Main navigation">
        <a href="index.html" class="${isActive("index.html")}">Home</a>
        <a href="products.html" class="${isActive("products.html")}">Products</a>
        <a href="about.html" class="${isActive("about.html")}">About</a>
        <a href="contact.html" class="${isActive("contact.html")}">Contact</a>
        <a href="cart.html" class="cart-link ${isActive("cart.html")}" aria-label="Order Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Order
          <span class="cart-badge" style="display:none">0</span>
        </a>
        <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="whatsapp-header-btn" aria-label="Order on WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
          WhatsApp
        </a>
      </nav>

      <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>

    <nav class="nav-mobile" id="nav-mobile" aria-label="Mobile navigation">
      <a href="index.html" class="${isActive("index.html")}">Home</a>
      <a href="products.html" class="${isActive("products.html")}">Products</a>
      <a href="about.html" class="${isActive("about.html")}">About</a>
      <a href="contact.html" class="${isActive("contact.html")}">Contact</a>
      <a href="cart.html" class="${isActive("cart.html")}">Order</a>
      <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="mobile-whatsapp">Order on WhatsApp</a>
    </nav>
  `;

  const toggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("nav-mobile");
  toggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    toggle.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  mobileNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  updateCartBadge();
}

/* ===== FOOTER RENDERING ===== */
function renderFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>${siteConfig.brandName}</h4>
          <p style="color:var(--primary-light);font-weight:600;margin-bottom:4px">${siteConfig.positioning}</p>
          <p style="font-style:italic;margin-bottom:8px">"${siteConfig.tagline}"</p>
          <p>Premium cleaning products for a cleaner, fresher and healthier environment.</p>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="products.html">Products</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="cart.html">Order</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="tel:+91${siteConfig.phone}">${siteConfig.phone}</a></li>
            <li><a href="mailto:${siteConfig.email}">${siteConfig.email}</a></li>
            <li>${siteConfig.location}</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Follow Us</h4>
          <ul>
            <li><a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="${YOUTUBE_URL}" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${siteConfig.brandName}. All Rights Reserved.</p>
      </div>
    </div>
  `;
}

/* ===== HERO SLIDER ===== */
function initHeroSlider() {
  const slider = document.getElementById("hero-slider");
  if (!slider) return;

  const track = document.getElementById("slider-track");
  const slides = track.querySelectorAll(".slide");
  const dotsContainer = document.getElementById("slider-dots");
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");
  const total = slides.length;
  if (total === 0) return;

  let current = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 4500;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  // Build dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.setAttribute("role", "button");
    dot.setAttribute("aria-label", "Go to slide " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  }
  const dots = dotsContainer.querySelectorAll(".dot");

  function updatePosition(animate) {
    if (animate) {
      track.classList.remove("dragging");
    } else {
      track.classList.add("dragging");
    }
    currentTranslate = -current * slider.offsetWidth;
    prevTranslate = currentTranslate;
    track.style.transform = "translateX(" + currentTranslate + "px)";
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function goTo(index) {
    current = (index + total) % total;
    updatePosition(true);
    resetAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(next, AUTOPLAY_DELAY);
  }
  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // Touch / mouse drag for swipe
  function getPositionX(e) {
    return e.type.indexOf("mouse") !== -1 ? e.pageX : e.touches[0].clientX;
  }

  function dragStart(e) {
    isDragging = true;
    startX = getPositionX(e);
    track.classList.add("dragging");
    stopAutoplay();
  }

  function dragMove(e) {
    if (!isDragging) return;
    var x = getPositionX(e);
    var diff = x - startX;
    currentTranslate = prevTranslate + diff;
    track.style.transform = "translateX(" + currentTranslate + "px)";
  }

  function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    var movedBy = currentTranslate - prevTranslate;
    var threshold = slider.offsetWidth * 0.2;
    if (movedBy < -threshold) {
      goTo(current + 1);
    } else if (movedBy > threshold) {
      goTo(current - 1);
    } else {
      updatePosition(true);
    }
    resetAutoplay();
  }

  // Touch events
  slider.addEventListener("touchstart", dragStart, { passive: true });
  slider.addEventListener("touchmove", dragMove, { passive: true });
  slider.addEventListener("touchend", dragEnd);

  // Mouse events
  slider.addEventListener("mousedown", dragStart);
  slider.addEventListener("mousemove", dragMove);
  slider.addEventListener("mouseup", dragEnd);
  slider.addEventListener("mouseleave", () => { if (isDragging) dragEnd(); });

  // Prevent links during drag
  slider.addEventListener("click", (e) => {
    if (Math.abs(currentTranslate - prevTranslate) > 5) e.preventDefault();
  });

  // Recalc on resize
  window.addEventListener("resize", () => updatePosition(false));

  // Start
  updatePosition(true);
  startAutoplay();
}

/* ===== TOAST ===== */
function showToast(message) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity .3s";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  initHeroSlider();
});
