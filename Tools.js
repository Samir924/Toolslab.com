// ==========================================
// 1. CONFIGURATION
// ==========================================
const WHATSAPP_NUMBER = "9825484216"; 
const CURRENCY = "Rs. ";
const ADMIN_USER = "samir";
const ADMIN_PASS = "Samir123@!";

let currentCategory = 'All';
let searchQuery = '';
let editingProductId = null; 
let isRegisterMode = true; 

// ==========================================
// 2. DATABASES
// ==========================================
let products = JSON.parse(localStorage.getItem('premiumStoreDataV5')) || [
  { id: 1, name: "Netflix Premium (4K)", category: "OTT Services", price: 500, oldPrice: 800, img: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80", inStock: true, hasOffer: true, isFlash: true, tiers: "1 Month: 500, 3 Months: 1400" },
  { id: 2, name: "NordVPN Premium", category: "VPN Services", price: 300, oldPrice: 500, img: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=400&q=80", inStock: true, hasOffer: false, isFlash: false, tiers: "1 Month: 300, 1 Year: 2500" },
  { id: 3, name: "1TB Cloud Storage", category: "Cloud Storage", price: 300, oldPrice: null, img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80", inStock: true, hasOffer: false, isFlash: false, tiers: "1 Month: 300, 1 Year: 3000" },
  { id: 4, name: "ChatGPT Plus (GPT-4)", category: "AI Tools", price: 2500, oldPrice: 3000, img: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg", inStock: true, hasOffer: true, isFlash: true, tiers: "1 Month: 2500, 3 Months: 7000" }
];

let customCategories = JSON.parse(localStorage.getItem('premiumStoreCatsV5')) || [
  "OTT Services", "AI Tools", "Cloud Storage", "Academic Tools", "Graphic Software", "VPN Services", "Learning"
];

let customers = JSON.parse(localStorage.getItem('premiumStoreCustomers')) || [];
let activeCustomer = JSON.parse(localStorage.getItem('premiumStoreActiveCustomer')) || null;

function saveToStorage() { localStorage.setItem('premiumStoreDataV5', JSON.stringify(products)); }
function saveCategories() { localStorage.setItem('premiumStoreCatsV5', JSON.stringify(customCategories)); }
function saveCustomers() { localStorage.setItem('premiumStoreCustomers', JSON.stringify(customers)); }
function saveActiveCustomer() { localStorage.setItem('premiumStoreActiveCustomer', JSON.stringify(activeCustomer)); }


// ==========================================
// 3. PAGE NAVIGATION LOGIC (FIXED)
// ==========================================
function navigatePublic(pageId) {
  // Hide all sections explicitly
  document.getElementById('public-main-content').style.display = 'none';
  document.getElementById('refund-page').style.display = 'none';
  document.getElementById('terms-page').style.display = 'none';
  document.getElementById('support-page').style.display = 'none';

  // Show the requested section smoothly
  if (pageId === 'home') {
    document.getElementById('public-main-content').style.display = 'block';
  } else {
    document.getElementById(pageId + '-page').style.display = 'block';
  }

  // Make sure we are in the store view (not admin panel)
  document.getElementById('admin-view').classList.remove('active-view');
  document.getElementById('store-view').classList.add('active-view');

  // Scroll smoothly to the very top of the page
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==========================================
// 4. CUSTOMER AUTHENTICATION LOGIC
// ==========================================
function updateCustomerUI() {
  const profileArea = document.getElementById('user-profile-area');
  if (activeCustomer) {
    profileArea.innerHTML = `
      <div class="user-badge">
        👋 Welcome, ${activeCustomer.name} 
        <button onclick="logoutCustomer()">(Logout)</button>
      </div>`;
  } else {
    profileArea.innerHTML = `
      <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white;" onclick="showCustomerModal()">👤 Sign In / Register</button>
    `;
  }
}

function showCustomerModal() { document.getElementById('customer-modal').classList.remove('hidden'); }
function hideCustomerModal() { document.getElementById('customer-modal').classList.add('hidden'); document.getElementById('customer-auth-form').reset(); }

function toggleCustomerMode() {
  isRegisterMode = !isRegisterMode;
  document.getElementById('cust-modal-title').innerText = isRegisterMode ? "Create Account" : "Welcome Back";
  document.getElementById('cust-modal-desc').innerText = isRegisterMode ? "Sign up to get faster checkouts and exclusive deals!" : "Log in to your Premium Store account.";
  document.getElementById('cust-submit-btn').innerText = isRegisterMode ? "Register Account" : "Log In";
  document.getElementById('cust-toggle-text').innerText = isRegisterMode ? "Already have an account?" : "Don't have an account?";
}

function handleCustomerAuth(event) {
  event.preventDefault();
  const name = document.getElementById('cust-name').value.trim();
  const pass = document.getElementById('cust-pass').value.trim();

  if (isRegisterMode) {
    if (customers.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      showToast("❌ Username already taken.");
      return;
    }
    const newCust = { name, pass };
    customers.push(newCust);
    saveCustomers();
    activeCustomer = newCust;
    showToast("🎉 Account Created!");
  } else {
    const found = customers.find(c => c.name.toLowerCase() === name.toLowerCase() && c.pass === pass);
    if (found) {
      activeCustomer = found;
      showToast(`Welcome back, ${found.name}!`);
    } else {

  updateCustomerUI();
  hideCustomerModal();
}

function logoutCustomer() {
  activeCustomer = null;
  saveActiveCustomer();
  updateCustomerUI();
  showToast("Logged out successfully.");
}

// ==========================================
// 5. STOREFRONT & CATEGORY LOGIC
// ==========================================
function renderStoreCategories() {
  const menu = document.getElementById('category-menu');
  menu.innerHTML = `<button class="cat-btn ${currentCategory === 'All' ? 'active' : ''}" onclick="filterCategory('All')">All</button>`;
  customCategories.forEach(cat => {
    menu.innerHTML += `<button class="cat-btn ${currentCategory === cat ? 'active' : ''}" onclick="filterCategory('${cat}')">${cat}</button>`;
  });
}

function filterCategory(cat) {
  currentCategory = cat;
  document.getElementById('current-category-title').innerText = cat === 'All' ? 'All Deals' : `${cat} Products`;
  renderStoreCategories();
  renderStore();
}

function handleSearch() {
  searchQuery = document.getElementById('search-input').value.toLowerCase();
  renderStore();
}

function renderStore() {
  const grid = document.getElementById('product-grid');
  const banner = document.getElementById('flash-banner');
  const marquee = document.getElementById('marquee-text');
  
  grid.innerHTML = ''; marquee.innerHTML = '';
  let hasFlashSales = false;

  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery);
    const matchesCategory = currentCategory === 'All' || product.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  filteredProducts.sort((a, b) => {
    if (a.inStock === false && b.inStock !== false) return 1;
    if (a.inStock !== false && b.inStock === false) return -1;
    if (a.hasOffer && !b.hasOffer) return -1;
    if (!a.hasOffer && b.hasOffer) return 1;
    return 0;
  });

  if (filteredProducts.length === 0) {
    grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color:#666;">No products found.</p>`;
  }

  filteredProducts.forEach(product => {
    if (product.isFlash && product.inStock !== false) {
      hasFlashSales = true;
      marquee.innerHTML += `<span>⚡ FLASH SALE: Get ${product.name} starting at just ${CURRENCY}${product.price}! ⚡</span>`;
    }

    const isAvailable = product.inStock !== false; 
    let badgeHtml = '';
    if (!isAvailable) badgeHtml = `<span class="badge badge-out">Out of Stock</span>`;
    else if (product.hasOffer) badgeHtml = `<span class="badge badge-offer">🔥 Special Offer</span>`;

    let priceHtml = `<div class="price-container">`;
    if (product.oldPrice && product.oldPrice > product.price) {
      priceHtml += `<span class="old-price">${CURRENCY}${product.oldPrice}</span>`;
    }
    priceHtml += `<span class="current-price">${CURRENCY}${product.price}</span></div>`;

    let dropdownHtml = '';
    if (product.tiers && product.tiers.trim() !== '') {
      const options = product.tiers.split(',');
      dropdownHtml = `<select class="tier-select" id="tier-${product.id}">`;
      options.forEach(opt => { dropdownHtml += `<option value="${opt.trim()}">${opt.trim()}</option>`; });
      dropdownHtml += `</select>`;
    }

    const card = document.createElement('div');
    card.className = `product-card fade-in ${!isAvailable ? 'card-out-of-stock' : ''}`;
    
    const buttonHtml = isAvailable 
      ? `<button class="btn btn-success w-100" onclick="buyOnWhatsApp(${product.id})">Buy on WhatsApp</button>`
      : `<button class="btn btn-disabled w-100" disabled>Out of Stock</button>`;

    card.innerHTML = `
      ${badgeHtml}
      <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
      <div class="product-info">
        <h3>${product.name}</h3>
        ${priceHtml}
        ${dropdownHtml}
        ${buttonHtml}
      </div>
    `;
    grid.appendChild(card);
  });

  if (hasFlashSales) banner.classList.remove('hidden');
  else banner.classList.add('hidden');
}

function buyOnWhatsApp(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const tierSelect = document.getElementById(`tier-${productId}`);
  let purchaseDetails = `${CURRENCY}${product.price}`;
  if (tierSelect) purchaseDetails = tierSelect.value;

  let greeting = "Hello!";
  if (activeCustomer) {
    greeting = `Hello, I am ${activeCustomer.name}.`;
  }

  const textMessage = `${greeting} I am interested in buying *${product.name}*.\nPlan: *${purchaseDetails}*.\nIs it available?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textMessage)}`, '_blank');
}

function contactSupport() {
  let greeting = "Hello Premium Store Support!";
  if (activeCustomer) greeting = `Hello Support, this is ${activeCustomer.name}.`;
  const textMessage = `${greeting} I need some help.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textMessage)}`, '_blank');
}

// ==========================================
// 6. ADMIN SECURITY LOGIC
// ==========================================
function showLoginModal() { document.getElementById('login-modal').classList.remove('hidden'); }
function hideLoginModal() { document.getElementById('login-modal').classList.add('hidden'); document.getElementById('login-form').reset(); }

document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const userTyped = document.getElementById('login-user').value.trim();
  const passTyped = document.getElementById('login-pass').value.trim();

  if (userTyped.toLowerCase() === ADMIN_USER.toLowerCase() && passTyped === ADMIN_PASS) {
    hideLoginModal();
    document.getElementById('store-view').classList.remove('active-view');
    document.getElementById('admin-view').classList.add('active-view');
    renderAdminPanel();
    showToast("Admin Login Successful!");
  } else { showToast("❌ Incorrect username or password."); }
});

function logoutAdmin() {
  document.getElementById('admin-view').classList.remove('active-view');
  document.getElementById('store-view').classList.add('active-view');
  navigatePublic('home'); // Send them back to the storefront view
  showToast("Admin Logged out.");
}

// ==========================================
// 7. ADMIN CONTROL PANEL LOGIC
// ==========================================
function renderAdminPanel() {
  renderAdminTable();
  renderAdminCategoryManager();
}

function renderAdminCategoryManager() {
  const list = document.getElementById('admin-category-list');
  const addDropdown = document.getElementById('new-category');
  list.innerHTML = ''; addDropdown.innerHTML = '';

  customCategories.forEach(cat => {
    list.innerHTML += `<div class="admin-cat-tag">${cat} <button type="button" onclick="deleteCategory('${cat}')">×</button></div>`;
    addDropdown.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

function addNewCategory(event) {
  event.preventDefault();
  const input = document.getElementById('new-category-name');
  const val = input.value.trim();
  if(val && !customCategories.includes(val)) {
    customCategories.push(val);
    saveCategories(); renderAdminCategoryManager(); renderStoreCategories();
    input.value = ''; showToast("🏷️ Category Added!");
  }
}

function deleteCategory(cat) {
  if (confirm(`Delete the "${cat}" category?`)) {
    customCategories = customCategories.filter(c => c !== cat);
    products.forEach(p => { if (p.category === cat) p.category = ''; });
    saveToStorage(); saveCategories();
    if (currentCategory === cat) filterCategory('All');
    renderAdminCategoryManager(); renderStoreCategories(); renderAdminTable();
    showToast("🗑️ Category Deleted.");
  }
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';
  products.forEach(product => {
    const isAvailable = product.inStock !== false;
    tbody.innerHTML += `
      <tr>
        <td>
          <strong>${product.name}</strong><br>
          <span style="font-size:11px; background:#eee; padding:2px 6px; border-radius:4px;">${product.category || 'None'}</span><br>
          <small>${CURRENCY}${product.price}</small>
        </td>
        <td>
          <label style="cursor:pointer; font-size:14px;">
            <input type="checkbox" ${isAvailable ? 'checked' : ''} onchange="toggleStock(${product.id}, this.checked)"> In Stock
          </label>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-warning" style="padding: 5px 10px;" onclick="openEditModal(${product.id})">Edit</button>
            <button class="btn btn-danger" style="padding: 5px 10px;" onclick="deleteProduct(${product.id})">Delete</button>
          </div>
        </td>
      </tr>`;
  });
}

function addNewProduct(event) {
  event.preventDefault(); 
  let imgInput = document.getElementById('new-image').value;
  if (imgInput && !imgInput.startsWith('http')) imgInput = 'https://' + imgInput;
  const oldPriceVal = document.getElementById('new-old-price').value;

  const newProduct = {
    id: Date.now(), 
    name: document.getElementById('new-name').value,
    category: document.getElementById('new-category').value, 
    price: parseFloat(document.getElementById('new-price').value),
    oldPrice: oldPriceVal ? parseFloat(oldPriceVal) : null,
    tiers: document.getElementById('new-tiers').value,
    img: imgInput,
    hasOffer: document.getElementById('new-offer').checked,
    isFlash: document.getElementById('new-flash').checked,
    inStock: true 
  };
  
  products.unshift(newProduct);
  saveToStorage(); renderAdminTable(); renderStore(); 
  document.getElementById('add-product-form').reset(); 
  showToast("✅ Product Published!");
}

function openEditModal(id) {
  const product = products.find(p => p.id === id);
  if(!product) return;
  editingProductId = id;

  const editDropdown = document.getElementById('edit-category');
  editDropdown.innerHTML = '';
  customCategories.forEach(cat => {
    editDropdown.innerHTML += `<option value="${cat}" ${product.category === cat ? 'selected' : ''}>${cat}</option>`;
  });

  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-old-price').value = product.oldPrice || '';
  document.getElementById('edit-tiers').value = product.tiers || '';
  document.getElementById('edit-image').value = product.img;
  document.getElementById('edit-offer').checked = product.hasOffer;
  document.getElementById('edit-flash').checked = product.isFlash;

  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  editingProductId = null;
}

function saveEditedProduct(event) {
  event.preventDefault();
  const product = products.find(p => p.id === editingProductId);
  if(!product) return;

  let imgInput = document.getElementById('edit-image').value;
  if (imgInput && !imgInput.startsWith('http')) imgInput = 'https://' + imgInput;
  const oldPriceVal = document.getElementById('edit-old-price').value;

  product.name = document.getElementById('edit-name').value;
  product.category = document.getElementById('edit-category').value;
  product.price = parseFloat(document.getElementById('edit-price').value);
  product.oldPrice = oldPriceVal ? parseFloat(oldPriceVal) : null;
  product.tiers = document.getElementById('edit-tiers').value;
  product.img = imgInput;
  product.hasOffer = document.getElementById('edit-offer').checked;
  product.isFlash = document.getElementById('edit-flash').checked;

  saveToStorage(); renderAdminTable(); renderStore(); closeEditModal();
  showToast("✏️ Product Updated!");
}

function toggleStock(id, isChecked) {
  const product = products.find(p => p.id === id);
  if (product) { product.inStock = isChecked; saveToStorage(); renderStore(); }
}

function deleteProduct(id) {
  if (confirm("Delete this item?")) {
    products = products.filter(p => p.id !== id);
    saveToStorage(); renderAdminTable(); renderStore();
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message; toast.classList.remove('hidden');
  setTimeout(() => { toast.classList.add('hidden'); }, 3000);
}

// ==========================================
// 8. WARM WELCOME LOGIC (FIXED)
// ==========================================
function closeWelcomeModal() {
  document.getElementById('welcome-modal').classList.add('hidden');
}

// This runs exactly 1.5 seconds after you load or refresh the page
setTimeout(() => {
  const welcomeModal = document.getElementById('welcome-modal');
  const welcomeBox = document.getElementById('welcome-content-box');
  
  welcomeModal.classList.remove('hidden');
  welcomeBox.classList.add('pop-in'); // Adds the bounce effect
}, 1500);


// START THE APP
updateCustomerUI();
renderStoreCategories();
renderStore();

