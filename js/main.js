/**
 * Quad Travels — site logic
 */

let config = {};
let packages = [];
let activeCity = "All";

async function init() {
  try {
    const [configRes, packagesRes] = await Promise.all([
      fetch("data/config.json"),
      fetch("data/packages.json"),
    ]);
    config = await configRes.json();
    packages = await packagesRes.json();
  } catch (err) {
    console.error("Failed to load site data:", err);
    document.getElementById("packagesGrid").innerHTML =
      '<p class="loading">Unable to load packages. Please refresh the page.</p>';
    return;
  }

  applyConfig();
  buildCityFilter();
  renderPackages();
  populatePackageSelect();
  setupEventListeners();
}


function applyConfig() {
  const { businessName, tagline, phone, whatsapp, email, address, hotelAddonNote, currencySymbol } = config;

  document.title = `${businessName} | Taxi Tours & Travel Packages`;

  const metaDesc = document.getElementById("metaDescription");
  if (metaDesc && tagline) {
    metaDesc.content = `${businessName} — ${tagline} Taxi tours and travel packages across India.`;
  }

  document.querySelectorAll("[data-logo]").forEach((el) => {
    const parts = businessName.trim().split(/\s+/);
    if (parts.length > 1) {
      const last = parts.pop();
      el.innerHTML = `${escapeHtml(parts.join(" "))} <span>${escapeHtml(last)}</span>`;
    } else {
      el.textContent = businessName;
    }
  });

  const copyrightName = document.getElementById("copyrightName");
  if (copyrightName) copyrightName.textContent = businessName;

  const heroTagline = document.getElementById("heroTagline");
  if (heroTagline && tagline) {
    heroTagline.textContent = `${tagline}. AC taxis, experienced drivers, and optional hotel stays — all in one place.`;
  }

  const footerTagline = document.getElementById("footerTagline");
  if (footerTagline && tagline) {
    footerTagline.textContent = `${tagline}. Taxi tours and travel packages across India. Hotel stays available on request.`;
  }

  const phoneInput = document.getElementById("phone");
  if (phoneInput && phone) phoneInput.placeholder = phone;

  const hotelNote = document.getElementById("hotelNote");
  if (hotelNote && hotelAddonNote) hotelNote.textContent = hotelAddonNote;

  const phoneEl = document.getElementById("contactPhone");
  if (phoneEl) {
    phoneEl.textContent = phone;
    phoneEl.href = `tel:${phone.replace(/\s/g, "")}`;
  }

  const waUrl = buildWhatsAppUrl("Hi! I'd like to know more about your travel packages.");
  const waEls = ["contactWhatsapp", "heroWhatsapp", "whatsappFloat"];
  waEls.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.href = waUrl;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
  });
  if (document.getElementById("contactWhatsapp")) {
    document.getElementById("contactWhatsapp").textContent = "Message us on WhatsApp";
  }

  const emailEl = document.getElementById("contactEmail");
  if (emailEl) {
    emailEl.textContent = email;
    emailEl.href = `mailto:${email}`;
  }

  const addressEl = document.getElementById("contactAddress");
  if (addressEl) addressEl.textContent = address;

  const jaipurPkg = packages.find((p) => p.id === "jaipur-pink");
  if (jaipurPkg) {
    const examplePrice = document.getElementById("exampleTaxiPrice");
    if (examplePrice) examplePrice.textContent = formatPrice(jaipurPkg.price, currencySymbol);
  }

  document.getElementById("year").textContent = new Date().getFullYear();
}

function normalizeWhatsAppNumber(number) {
  return String(number || "").replace(/\D/g, "");
}

function buildWhatsAppUrl(message) {
  const phone = normalizeWhatsAppNumber(config.whatsapp);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

function formatPrice(amount, symbol = "₹") {
  if (!amount || amount === 0) return "Custom quote";
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

function getCities() {
  const cities = [...new Set(packages.map((p) => p.city))];
  const order = ["Delhi", "Jaipur", "Agra", "Shimla", "Goa", "Custom"];
  return cities.sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function buildCityFilter() {
  const filterBar = document.getElementById("cityFilter");
  const cities = getCities();

  cities.forEach((city) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.city = city;
    btn.textContent = city;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.addEventListener("click", () => setActiveCity(city));
    filterBar.appendChild(btn);
  });
}

function setActiveCity(city) {
  activeCity = city;
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    const isActive = btn.dataset.city === city || (city === "All" && btn.dataset.city === "All");
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  renderPackages();
}

function renderPackages() {
  const grid = document.getElementById("packagesGrid");
  const filtered =
    activeCity === "All" ? packages : packages.filter((p) => p.city === activeCity);

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="loading">No packages found for this city.</p>';
    return;
  }

  grid.innerHTML = filtered.map((pkg) => createPackageCard(pkg)).join("");
}

function createPackageCard(pkg) {
  const symbol = config.currencySymbol || "₹";
  const priceHtml =
    pkg.price === 0
      ? `<span class="package-price custom">Custom quote<small>Contact us for pricing</small></span>`
      : `<span class="package-price">${formatPrice(pkg.price, symbol)}<small>per package · taxi only</small></span>`;

  const hotelBadge = pkg.hotelAvailable
    ? '<span class="hotel-tag-inline">🏨 Hotel add-on available</span>'
    : "";

  const popularBadge = pkg.popular ? '<span class="package-badge">Popular</span>' : "";

  const highlights = pkg.highlights
    .slice(0, 4)
    .map((h) => `<li>${escapeHtml(h)}</li>`)
    .join("");

  return `
    <article class="package-card" data-id="${pkg.id}">
      <div class="package-image">
        <img src="${pkg.image}" alt="${escapeHtml(pkg.title)}" loading="lazy" width="400" height="200">
        ${popularBadge}
      </div>
      <div class="package-body">
        <div class="package-meta">
          <span class="package-city">${escapeHtml(pkg.city)}</span>
          <span>·</span>
          <span>${escapeHtml(pkg.duration)}</span>
          <span>·</span>
          <span>${escapeHtml(pkg.vehicle)}</span>
        </div>
        <h3>${escapeHtml(pkg.title)}</h3>
        ${hotelBadge}
        <ul class="package-highlights">${highlights}</ul>
        <div class="package-footer">
          ${priceHtml}
          <button class="btn btn-primary btn-sm" data-book="${pkg.id}">Enquire</button>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function populatePackageSelect() {
  const select = document.getElementById("package");
  if (!select) return;

  packages.forEach((pkg) => {
    const opt = document.createElement("option");
    opt.value = pkg.id;
    opt.textContent = `${pkg.city} — ${pkg.title}`;
    select.appendChild(opt);
  });
}

function setupEventListeners() {
  // Mobile nav
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // City filter from footer links
  document.querySelectorAll("[data-city-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const city = link.dataset.cityLink;
      setActiveCity(city);
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.city === city);
        btn.setAttribute("aria-selected", btn.dataset.city === city ? "true" : "false");
      });
      document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Package enquire buttons (delegated)
  document.getElementById("packagesGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-book]");
    if (!btn) return;
    const pkg = packages.find((p) => p.id === btn.dataset.book);
    if (pkg) {
      prefillAndScrollToContact(pkg);
    }
  });

  // Contact form → WhatsApp
  document.getElementById("contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    sendWhatsAppEnquiry();
  });

  // Header shadow on scroll
  window.addEventListener("scroll", () => {
    document.getElementById("header")?.classList.toggle("scrolled", window.scrollY > 20);
  });
}

function prefillAndScrollToContact(pkg) {
  const select = document.getElementById("package");
  if (select) select.value = pkg.id;

  const hotelCheck = document.getElementById("needHotel");
  if (hotelCheck && pkg.hotelAvailable) hotelCheck.checked = true;

  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  document.getElementById("name")?.focus();
}

function sendWhatsAppEnquiry() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const packageId = document.getElementById("package").value;
  const travelDate = document.getElementById("travelDate").value;
  const travelers = document.getElementById("travelers").value;
  const needHotel = document.getElementById("needHotel").checked;
  const message = document.getElementById("message").value.trim();

  const selectedPkg = packages.find((p) => p.id === packageId);
  const pkgLine = selectedPkg
    ? `${selectedPkg.city} — ${selectedPkg.title}`
    : "Not specified";

  let text = `Hello ${config.businessName}! I'd like to enquire about a trip.\n\n`;
  text += `*Name:* ${name}\n`;
  text += `*Phone:* ${phone}\n`;
  text += `*Package:* ${pkgLine}\n`;
  if (travelDate) text += `*Travel date:* ${travelDate}\n`;
  text += `*Travelers:* ${travelers}\n`;
  text += `*Hotel needed:* ${needHotel ? "Yes (please share options & quote)" : "No"}\n`;
  if (message) text += `\n*Message:* ${message}`;

  window.open(buildWhatsAppUrl(text), "_blank", "noopener");
}

document.addEventListener("DOMContentLoaded", init);
