const BOOKS = [
  {
    id: "bk-101",
    title: "The Neon Archive",
    author: "Mila Rowan",
    label: "Sci-Fi",
    price: 8.99,
    poster: "./assets/posters/bk-101.svg"
  },
  {
    id: "bk-102",
    title: "Crimson Tides",
    author: "Aron Wells",
    label: "Thriller",
    price: 7.49,
    poster: "./assets/posters/bk-102.svg"
  },
  {
    id: "bk-103",
    title: "Momentum Blueprint",
    author: "Rina Shaw",
    label: "Business",
    price: 12.99,
    poster: "./assets/posters/bk-103.svg"
  },
  {
    id: "bk-104",
    title: "Letters Of Light",
    author: "Nora Keys",
    label: "Poetry",
    price: 6.99,
    poster: "./assets/posters/bk-104.svg"
  },
  {
    id: "bk-105",
    title: "Silent Harbor",
    author: "Jon Hales",
    label: "Mystery",
    price: 9.29,
    poster: "./assets/posters/bk-105.svg"
  },
  {
    id: "bk-106",
    title: "Skybound Hearts",
    author: "Ari Bloom",
    label: "Romance",
    price: 7.99,
    poster: "./assets/posters/bk-106.svg"
  },
  {
    id: "bk-107",
    title: "Code Of Giants",
    author: "Devon Pike",
    label: "Technology",
    price: 11.49,
    poster: "./assets/posters/bk-107.svg"
  },
  {
    id: "bk-108",
    title: "Mindful Minutes",
    author: "Eva Dean",
    label: "Self Growth",
    price: 5.99,
    poster: "./assets/posters/bk-108.svg"
  },
  {
    id: "bk-109",
    title: "Empire Of Dust",
    author: "Kian Soren",
    label: "Fantasy",
    price: 10.2,
    poster: "./assets/posters/bk-109.svg"
  },
  {
    id: "bk-110",
    title: "Atlas Of Habits",
    author: "Layla Hart",
    label: "Productivity",
    price: 8.49,
    poster: "./assets/posters/bk-110.svg"
  }
];

const CART_KEY = "rocoraft_cart_v1";

function byId(id) {
  return document.getElementById(id);
}

function findBook(id) {
  return BOOKS.find((book) => book.id === id);
}

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => findBook(item.id) && Number.isFinite(item.qty) && item.qty > 0);
  } catch (error) {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function cartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
  const count = cartCount();
  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = String(count);
  });
}

function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

function showToast(message) {
  let zone = document.querySelector(".toast-zone");
  if (!zone) {
    zone = document.createElement("div");
    zone.className = "toast-zone";
    document.body.appendChild(zone);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  zone.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 1800);
}

function addToCart(bookId) {
  const cart = readCart();
  const existing = cart.find((item) => item.id === bookId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: bookId, qty: 1 });
  }

  writeCart(cart);
  const book = findBook(bookId);
  showToast(book ? book.title + " added to cart" : "Book added to cart");
}

function updateQty(bookId, change) {
  const cart = readCart();
  const item = cart.find((entry) => entry.id === bookId);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    writeCart(cart.filter((entry) => entry.id !== bookId));
  } else {
    writeCart(cart);
  }

  renderCartPage();
}

function removeFromCart(bookId) {
  const cart = readCart().filter((item) => item.id !== bookId);
  writeCart(cart);
  renderCartPage();
}

function createBookCard(book) {
  return `
    <article class="book-card">
      <div class="book-cover-wrap">
        <img class="book-poster" src="${book.poster}" alt="${book.title} poster" loading="lazy" />
        <span class="book-badge">ROCORAFT GRAPHICAL</span>
      </div>
      <div class="book-body">
        <span class="label-pill">${book.label}</span>
        <h3>${book.title}</h3>
        <p class="meta">${book.author}</p>
        <div class="price-row">
          <strong>${formatMoney(book.price)}</strong>
          <button class="add-btn" data-add-cart="${book.id}">Add To Cart</button>
        </div>
      </div>
    </article>
  `;
}

function bindAddButtons(scope) {
  scope.querySelectorAll("[data-add-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.getAttribute("data-add-cart"));
    });
  });
}

function renderFeatured() {
  const grid = byId("featuredGrid");
  if (!grid) return;

  grid.innerHTML = BOOKS.slice(0, 4).map(createBookCard).join("");
  bindAddButtons(grid);
}

function renderBooksPage() {
  const grid = byId("booksGrid");
  const searchInput = byId("searchInput");
  const labelFilter = byId("labelFilter");
  const empty = byId("noBooks");
  if (!grid || !searchInput || !labelFilter || !empty) return;

  const labels = ["all", ...new Set(BOOKS.map((book) => book.label))];
  labelFilter.innerHTML = labels
    .map((label) => `<option value="${label}">${label === "all" ? "All Labels" : label}</option>`)
    .join("");

  const queryLabel = new URLSearchParams(window.location.search).get("label");
  if (queryLabel && labels.includes(queryLabel)) {
    labelFilter.value = queryLabel;
  }

  const paint = () => {
    const needle = searchInput.value.trim().toLowerCase();
    const selected = labelFilter.value;

    const filtered = BOOKS.filter((book) => {
      const labelMatch = selected === "all" || book.label === selected;
      const textMatch =
        !needle ||
        book.title.toLowerCase().includes(needle) ||
        book.author.toLowerCase().includes(needle) ||
        book.label.toLowerCase().includes(needle);
      return labelMatch && textMatch;
    });

    grid.innerHTML = filtered.map(createBookCard).join("");
    empty.classList.toggle("hidden", filtered.length > 0);
    bindAddButtons(grid);
  };

  searchInput.addEventListener("input", paint);
  labelFilter.addEventListener("change", paint);
  paint();
}

function renderLabelsPage() {
  const labelsGrid = byId("labelsGrid");
  const marquee = byId("labelMarquee");
  if (!labelsGrid || !marquee) return;

  const labelMap = BOOKS.reduce((map, book) => {
    map[book.label] = (map[book.label] || 0) + 1;
    return map;
  }, {});

  const labels = Object.keys(labelMap).sort((a, b) => a.localeCompare(b));

  labelsGrid.innerHTML = labels
    .map(
      (label) => `
        <article class="label-card">
          <h3>${label}</h3>
          <p>${labelMap[label]} books available in this label.</p>
          <a class="btn btn-ghost" href="./books.html?label=${encodeURIComponent(label)}">Open Label</a>
        </article>
      `
    )
    .join("");

  const pills = labels
    .concat(labels)
    .map((label) => `<span class="marquee-pill">${label}</span>`)
    .join("");
  marquee.innerHTML = pills;
}

function renderCartPage() {
  const cartList = byId("cartItems");
  const empty = byId("cartEmpty");
  const subtotalEl = byId("subtotalValue");
  const taxEl = byId("taxValue");
  const totalEl = byId("totalValue");

  if (!cartList || !empty || !subtotalEl || !taxEl || !totalEl) return;

  const cart = readCart();
  if (cart.length === 0) {
    cartList.innerHTML = "";
    empty.classList.remove("hidden");
    subtotalEl.textContent = "$0.00";
    taxEl.textContent = "$0.00";
    totalEl.textContent = "$0.00";
    return;
  }

  empty.classList.add("hidden");

  const rows = cart
    .map((item) => {
      const book = findBook(item.id);
      if (!book) return "";

      const lineTotal = book.price * item.qty;
      return `
        <article class="cart-item">
          <div class="cart-cover">
            <img src="${book.poster}" alt="${book.title} poster" loading="lazy" />
          </div>
          <div class="cart-info">
            <h3>${book.title}</h3>
            <p>${book.author} | ${book.label}</p>
            <div class="qty-controls">
              <button class="qty-btn" data-cart-action="dec" data-book-id="${book.id}">-</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" data-cart-action="inc" data-book-id="${book.id}">+</button>
            </div>
            <button class="remove-btn" data-cart-action="remove" data-book-id="${book.id}">Remove</button>
          </div>
          <div class="cart-right">
            <strong>${formatMoney(lineTotal)}</strong>
          </div>
        </article>
      `;
    })
    .join("");

  cartList.innerHTML = rows;

  const subtotal = cart.reduce((sum, item) => {
    const book = findBook(item.id);
    return book ? sum + item.qty * book.price : sum;
  }, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  subtotalEl.textContent = formatMoney(subtotal);
  taxEl.textContent = formatMoney(tax);
  totalEl.textContent = formatMoney(total);

  cartList.querySelectorAll("[data-cart-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-cart-action");
      const bookId = button.getAttribute("data-book-id");
      if (!bookId) return;

      if (action === "inc") updateQty(bookId, 1);
      if (action === "dec") updateQty(bookId, -1);
      if (action === "remove") removeFromCart(bookId);
    });
  });
}

function bindCheckout() {
  const form = byId("checkoutForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const cart = readCart();
    if (cart.length === 0) {
      showToast("Your cart is empty");
      return;
    }

    form.reset();
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCartPage();
    showToast("Order placed. Thank you for shopping at Rocoraft.");
  });
}

function initMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function initReveals() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((target) => observer.observe(target));
}

function updateYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });
}

function boot() {
  updateCartCount();
  updateYear();
  initMenu();
  initReveals();
  renderFeatured();
  renderBooksPage();
  renderLabelsPage();
  renderCartPage();
  bindCheckout();
}

window.addEventListener("DOMContentLoaded", boot);
