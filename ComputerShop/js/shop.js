// Globals
let currentUser = null;
let currentOrderProduct = null;
let orderData = {};
let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProducts();
});

function checkAuth() {
    updateNavigation();
    fetch('api/check_auth.php')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.user) {
                currentUser = data.user;
            }
            updateNavigation();
        })
        .catch(() => updateNavigation());
}

function updateNavigation() {
    const loginBtn = document.getElementById('nav-login');
    const adminBtn = document.getElementById('nav-admin');
    const logoutBtn = document.getElementById('nav-logout');
    if (!loginBtn) return;

    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        adminBtn.style.display = currentUser.is_admin ? 'block' : 'none';
        logoutBtn.textContent = 'Log out (' + currentUser.name + ')';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        adminBtn.style.display = 'none';
    }
}

function showLoginPage() {
    window.location.href = 'index.html#login';
}

function showAdminPage() {
    if (!currentUser || !currentUser.is_admin) {
        showToast('Access denied');
        return;
    }
    window.location.href = 'admin.html';
}

function logout() {
    fetch('api/auth.php', {
        method: 'POST',
        body: new URLSearchParams({ action: 'logout' })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentUser = null;
            updateNavigation();
            showToast('You have been logged out');
        }
    });
}

// Load catalog from API
function loadProducts(filters = {}) {
    const formData = new FormData();
    formData.append('action', 'get_products');
    if (filters.search) formData.append('search', filters.search);
    if (filters.type) formData.append('type', filters.type);
    if (filters.gpu) formData.append('gpu', filters.gpu);
    if (filters.price_min) formData.append('price_min', filters.price_min);
    if (filters.price_max) formData.append('price_max', filters.price_max);

    fetch('api/products.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            let products = [];
            if (data.data && data.data.products) {
                products = data.data.products;
            } else if (data.products) {
                products = data.products;
            }
            
            allProducts = products;
            displayProducts(products);
            updateResultsCount(products.length);
        } else {
            console.error('API error:', data.message);
            showToast(data.message || 'Failed to load products');
            displayProducts([]); // Show empty state
        }
    })
    .catch(error => {
        console.error('Load products error:', error);
        showToast('Failed to load products');
        displayProducts([]); // Show empty state
    });
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('search-grid');
    const noResults = document.getElementById('search-empty');
    const countElement = document.getElementById('search-count');

    if (!container) return;
    
    // Ensure products is an array
    if (!Array.isArray(products)) {
        products = [];
    }
    
    if (products.length === 0) {
        container.style.display = 'none';
        if (noResults) noResults.classList.remove('hidden');
        if (countElement) countElement.textContent = '0 products';
        return;
    }

    container.style.display = 'grid';
    if (noResults) noResults.classList.add('hidden');
    
    const word = products.length === 1 ? 'product' : 'products';
    if (countElement) countElement.textContent = `${products.length} ${word}`;

    container.innerHTML = products.map(product => `
        <div class="pc-card" onclick="openOrderModal(${product.id})">
            <div class="pc-card-img">
                ${product.primary_image ? 
                    `<img src="${product.primary_image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` :
                    `<div style="font-size:80px;">💻</div>`
                }
                ${product.badge ? `<div class="pc-card-badge badge-${product.badge === 'new' ? 'new' : product.badge === 'hot' ? 'hot' : 'sale'}">${product.badge === 'new' ? 'NEW' : product.badge === 'hot' ? 'HOT' : 'SALE'}</div>` : ''}
                <div class="pc-img-glow"></div>
            </div>
            <div class="pc-card-series">${product.type}</div>
            <div class="pc-card-body">
                <div class="pc-card-name">${product.name}</div>
                <div class="pc-specs-list">
                    <div class="spec-row">
                        <span class="spec-key">Processor</span>
                        <span class="spec-val">${product.cpu}</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-key">Graphics</span>
                        <span class="spec-val">${product.gpu}</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-key">RAM</span>
                        <span class="spec-val">${product.ram}</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-key">Storage</span>
                        <span class="spec-val">${product.storage}</span>
                    </div>
                </div>
                <div class="pc-card-footer">
                    <div class="pc-price-block">
                        ${product.old_price ? `<div class="pc-price-old">${formatPrice(product.old_price)}</div>` : ''}
                        <div class="pc-price">${formatPrice(product.price)}</div>
                    </div>
                    <button class="pc-buy-btn" onclick="event.stopPropagation(); openOrderModal(${product.id})">
                        Buy
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Results label next to filters
function updateResultsCount(count) {
    const countElement = document.getElementById('search-count');
    if (!countElement) return;
    const word = count === 1 ? 'product' : 'products';
    countElement.textContent = `${count} ${word}`;
}

// Apply filters
function applyFilters() {
    const filters = {
        search: document.getElementById('search-text')?.value || '',
        type: document.getElementById('f-type')?.value || '',
        gpu: document.getElementById('f-gpu')?.value || '',
        price_min: document.getElementById('f-min')?.value || '',
        price_max: document.getElementById('f-max')?.value || ''
    };
    loadProducts(filters);
}

// Reset filters
function resetSearch() {
    document.getElementById('search-text').value = '';
    document.getElementById('f-type').value = '';
    document.getElementById('f-gpu').value = '';
    document.getElementById('f-min').value = '';
    document.getElementById('f-max').value = '';
    loadProducts();
}

// Format price (USD as stored in DB)
function formatPrice(price) {
    const n = Number(price);
    if (Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    }).format(n);
}

function resetOrderModalUi() {
    const o1 = document.getElementById('o-step1');
    const o2 = document.getElementById('o-step2');
    const o3 = document.getElementById('o-step3');
    if (o1) { o1.style.display = 'block'; o1.classList.remove('hidden'); }
    if (o2) { o2.classList.add('hidden'); o2.classList.remove('active'); }
    if (o3) { o3.classList.add('hidden'); o3.classList.remove('active'); }
    const err1 = document.getElementById('o-err1');
    if (err1) { err1.classList.add('hidden'); err1.textContent = ''; }
}

// Order modal
function openOrderModal(productId) {
    fetch('api/products.php', {
        method: 'POST',
        body: new URLSearchParams({ action: 'get_product', id: productId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Handle both old and new API response formats
            const product = data.data?.product || data.product;
            if (!product) {
                showToast('Product not found');
                return;
            }
            
            currentOrderProduct = product;
            resetOrderModalUi();
            
            const primary = product.images && product.images.length
                ? (product.images.find((i) => parseInt(i.is_primary, 10) === 1) || product.images[0])
                : null;
            const productImage = primary
                ? `<img src="${primary.image_url}" alt="${product.name}" style="width:60px;height:60px;object-fit:cover;border-radius:2px;">`
                : `<div class="order-pc-icon">💻</div>`;
            
            document.getElementById('o-pc-box').innerHTML = `
                ${productImage}
                <div style="flex:1;">
                    <div class="order-pc-name">${product.name}</div>
                    <div class="order-pc-price">${formatPrice(product.price)}</div>
                </div>
            `;
            document.getElementById('o-total-price').textContent = formatPrice(product.price);
            document.getElementById('overlay').classList.add('active');
            showOrderStep(1);
        } else {
            showToast(data.message || 'Failed to load product');
        }
    })
    .catch(error => {
        console.error('Open order modal error:', error);
        showToast('Failed to load product');
    });
}

function closeOrderModal() {
    document.getElementById('overlay').classList.remove('active');
    currentOrderProduct = null;
    orderData = {};
}

function showOrderStep(step) {
    document.querySelectorAll('.order-step').forEach(s => s.classList.remove('active'));
    document.getElementById('o-step' + step).classList.add('active');
    if (step === 1) {
        document.getElementById('o-step1').style.display = 'block';
        document.getElementById('modal-step-label').textContent = 'Step 1 of 2';
    } else if (step === 2) {
        document.getElementById('o-step1').style.display = 'none';
        document.getElementById('o-step2').classList.remove('hidden');
        document.getElementById('modal-step-label').textContent = 'Step 2 of 2';
    } else if (step === 3) {
        document.getElementById('o-step1').style.display = 'none';
        document.getElementById('o-step2').classList.add('hidden');
        document.getElementById('o-step3').classList.remove('hidden');
        document.getElementById('modal-step-label').textContent = 'Done!';
    }
}

function orderNext() {
    const name = document.getElementById('o-name').value.trim();
    const surname = document.getElementById('o-sname').value.trim();
    const email = document.getElementById('o-email').value.trim();
    const phone = document.getElementById('o-phone').value.trim();
    const address = document.getElementById('o-addr').value.trim();
    
    if (!name || !surname || !email || !phone || !address) {
        document.getElementById('o-err1').textContent = 'Please fill all fields';
        document.getElementById('o-err1').classList.remove('hidden');
        return;
    }
    
    document.getElementById('o-err1').classList.add('hidden');
    orderData = { name, surname, email, phone, address };
    showOrderStep(2);
}

function orderPay() {
    const formData = new FormData();
    formData.append('action', 'create_order');
    formData.append('product_id', currentOrderProduct.id);
    formData.append('name', orderData.name);
    formData.append('surname', orderData.surname);
    formData.append('email', orderData.email);
    formData.append('phone', orderData.phone);
    formData.append('address', orderData.address);

    fetch('api/orders.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const num = data.order_number || '';
            document.getElementById('s-order-id').textContent = num.indexOf('#') === 0 ? num : '#' + num;
            document.getElementById('s-details').innerHTML = `
                <div class="success-detail-row">
                    <span class="sdk">Product:</span>
                    <span class="sdv">${currentOrderProduct.name}</span>
                </div>
                <div class="success-detail-row">
                    <span class="sdk">Total:</span>
                    <span class="sdv">${formatPrice(currentOrderProduct.price)}</span>
                </div>
                <div class="success-detail-row">
                    <span class="sdk">Address:</span>
                    <span class="sdv">${orderData.address}</span>
                </div>
            `;
            showOrderStep(3);
            let msg = 'Order placed successfully!';
            if (data.email_sent === false) {
                msg += ' (confirmation email could not be sent; check server mail settings.)';
            }
            showToast(msg);
        } else {
            showToast('Failed to place order');
        }
    })
    .catch(error => {
        console.error('Order error:', error);
        showToast('Failed to place order');
    });
}

function overlayClose(event) {
    if (event.target.id === 'overlay') {
        closeOrderModal();
    }
}

function fmtCard(input) {
    let value = input.value.replace(/\s/g, '');
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formatted;
    document.getElementById('card-display').textContent = formatted || '•••• •••• •••• ••••';
}

// Toast
function showToast(message) {
    const span = document.getElementById('toast-text');
    const toast = document.getElementById('toast');
    if (span) span.textContent = message;
    else if (toast) toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}