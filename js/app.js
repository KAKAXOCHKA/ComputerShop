// Global state (legacy single-page bundle; main site uses index-page.js / shop.js / admin.js)
let currentUser = null;
let currentOrderProduct = null;
let orderData = {};

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProducts();
    setupEventListeners();
});

function checkAuth() {
    fetch('api/check_auth.php')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.user) {
                currentUser = data.user;
                updateNavigation();
                if (data.user.is_admin) {
                    loadAdminData();
                }
            }
        });
}

function updateNavigation() {
    const loginBtn = document.getElementById('nav-login');
    const adminBtn = document.getElementById('nav-admin');
    const logoutBtn = document.getElementById('nav-logout');

    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        if (currentUser.is_admin) {
            adminBtn.style.display = 'block';
        }
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        adminBtn.style.display = 'none';
    }
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const pageElement = document.getElementById('page-' + pageName);
    if (pageElement) {
        pageElement.classList.add('active');
        window.scrollTo(0, 0);
    }

    if (pageName === 'admin') {
        if (!currentUser || !currentUser.is_admin) {
            showPage('login');
            showToast('Access denied');
            return;
        }
        loadAdminData();
    }
}

window.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.substring(1);
    if (hash === 'login') {
        showPage('login');
    } else if (hash === 'register') {
        showPage('register');
    } else if (hash === 'admin') {
        showPage('admin');
    }
});

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
            const homeContainer = document.getElementById('home-products');
            if (homeContainer) {
                displayProducts(data.products, 'home-products', 6);
            }
        }
    });
}

function displayProducts(products, containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const displayProducts = limit ? products.slice(0, limit) : products;

    if (displayProducts.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-gray);">No products found</p>';
        return;
    }

    container.innerHTML = displayProducts.map(product => `
        <div class="product-card">
            <div class="product-name">${product.name}</div>
            <div class="product-type">${product.type}</div>
            <div class="product-specs">
                <div>💻 ${product.cpu}</div>
                <div>🎮 ${product.gpu}</div>
                <div>🧠 ${product.ram}</div>
                <div>💾 ${product.storage}</div>
            </div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <a href="shop.html" class="btn btn-primary product-btn">
                View in shop
            </a>
        </div>
    `).join('');
}

function applyFilters() {
    /* Used on shop page in other bundles */
}

function resetFilters() {
    /* Used on shop page in other bundles */
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function scrollToCustom() {
    const customSection = document.getElementById('custom');
    if (customSection) {
        customSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = 'index.html#custom';
    }
}

function setupEventListeners() {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        formData.append('action', 'login');

        fetch('api/auth.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                updateNavigation();
                showToast('Signed in successfully');
                showPage('home');
            } else {
                document.getElementById('login-error').textContent = data.message;
            }
        });
    });

    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        formData.append('action', 'register');

        fetch('api/auth.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('register-success').textContent = 'Registration successful. Please sign in.';
                setTimeout(() => showPage('login'), 2000);
            } else {
                document.getElementById('register-error').textContent = data.message;
            }
        });
    });

    document.getElementById('custom-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        formData.append('action', 'add_custom_request');

        fetch('api/custom.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('Request sent. We will contact you soon.');
                this.reset();
            } else {
                showToast('Failed to send request');
            }
        });
    });

    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            formData.append('action', 'add_product');

            fetch('api/products.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('add-product-msg').textContent = 'Product added successfully.';
                    this.reset();
                    loadAdminData();
                } else {
                    showToast('Failed to add product');
                }
            });
        });
    }
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
            showPage('home');
            showToast('You have been signed out');
        }
    });
}

function openOrderModal(productId) {
    window.location.href = 'shop.html';
}

function closeOrderModal() {
    /* Implemented in shop.js */
}

function showOrderStep(step) {
    /* Implemented in shop.js */
}

function orderNextStep() {
    /* Implemented in shop.js */
}

function completeOrder() {
    /* Implemented in shop.js */
}

function showAdminPanel(panelName) {
    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById('admin-' + panelName).classList.add('active');

    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function loadAdminData() {
    fetch('api/admin.php?action=get_stats')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('stat-orders').textContent = data.stats.total_orders;
                document.getElementById('stat-new-orders').textContent = data.stats.new_orders;
                document.getElementById('stat-products').textContent = data.stats.total_products;
                document.getElementById('stat-custom').textContent = data.stats.custom_requests;

                if (data.stats.new_orders > 0) {
                    document.getElementById('orders-badge').textContent = data.stats.new_orders;
                    document.getElementById('orders-badge').style.display = 'inline';
                }
                if (data.stats.custom_requests > 0) {
                    document.getElementById('custom-badge').textContent = data.stats.custom_requests;
                    document.getElementById('custom-badge').style.display = 'inline';
                }
            }
        });

    loadOrders();
    loadAdminProducts();
    loadCustomRequests();
}

function loadOrders() {
    fetch('api/admin.php?action=get_orders')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const container = document.getElementById('orders-list');
                if (data.orders.length === 0) {
                    container.innerHTML = '<p>No orders yet</p>';
                    return;
                }

                container.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.orders.map(order => `
                                <tr>
                                    <td>#${order.order_number}</td>
                                    <td>${order.name} ${order.surname}</td>
                                    <td>${order.product_name}</td>
                                    <td>${order.phone}</td>
                                    <td>${order.address}</td>
                                    <td>${formatPrice(order.total_price)}</td>
                                    <td>${new Date(order.created_at).toLocaleDateString('en-US')}</td>
                                    <td><span style="color: var(--success)">New</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        });
}

function loadAdminProducts() {
    fetch('api/admin.php?action=get_all_products')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const container = document.getElementById('products-list');
                if (data.products.length === 0) {
                    container.innerHTML = '<p>No products yet</p>';
                    return;
                }

                container.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.products.map(product => `
                                <tr>
                                    <td>${product.id}</td>
                                    <td>${product.name}</td>
                                    <td>${product.type}</td>
                                    <td>${formatPrice(product.price)}</td>
                                    <td>
                                        <button class="btn btn-outline" onclick="deleteProduct(${product.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        });
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    fetch('api/products.php', {
        method: 'POST',
        body: new URLSearchParams({ action: 'delete_product', id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('Product deleted');
            loadAdminProducts();
            loadProducts();
        }
    });
}

function loadCustomRequests() {
    fetch('api/admin.php?action=get_custom_requests')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const container = document.getElementById('custom-requests-list');
                if (data.requests.length === 0) {
                    container.innerHTML = '<p>No build requests yet</p>';
                    return;
                }

                container.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Description</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.requests.map(req => `
                                <tr>
                                    <td>${req.name} ${req.surname}</td>
                                    <td>${req.phone}</td>
                                    <td>${req.email}</td>
                                    <td>${req.description || '-'}</td>
                                    <td>${new Date(req.created_at).toLocaleDateString('en-US')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
