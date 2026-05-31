/**
 * NEXCORE SHOP - Orders Page
 * Handle customer order viewing and tracking
 */

let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

/**
 * Check authentication status
 */
function checkAuth() {
    fetch('api/check_auth.php')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.user) {
                currentUser = data.user;
                updateNavigation();
                loadMyOrders();
            } else {
                showTrackOrderSection();
            }
        })
        .catch(err => {
            console.error('Auth check error:', err);
            showTrackOrderSection();
        });
}

/**
 * Update navigation based on auth status
 */
function updateNavigation() {
    const authBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (currentUser) {
        authBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        authBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const trackForm = document.getElementById('track-order-form');
    if (trackForm) {
        trackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            trackOrder();
        });
    }
}

/**
 * Show track order section for guests
 */
function showTrackOrderSection() {
    document.getElementById('track-order-section').classList.remove('hidden');
    document.getElementById('orders-list-section').classList.add('hidden');
}

/**
 * Load orders for logged-in user
 */
function loadMyOrders() {
    document.getElementById('track-order-section').classList.add('hidden');
    document.getElementById('orders-list-section').classList.remove('hidden');

    fetch('api/user_orders.php', {
        method: 'POST',
        body: new URLSearchParams({ action: 'get_my_orders' })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.data.orders) {
            displayOrders(data.data.orders);
        } else {
            showNoOrders();
        }
    })
    .catch(err => {
        console.error('Load orders error:', err);
        showToast('Failed to load orders');
    });
}

/**
 * Display orders grid
 */
function displayOrders(orders) {
    const grid = document.getElementById('orders-grid');
    const noOrders = document.getElementById('no-orders');

    if (orders.length === 0) {
        grid.innerHTML = '';
        noOrders.classList.remove('hidden');
        return;
    }

    noOrders.classList.add('hidden');
    
    grid.innerHTML = orders.map(order => `
        <div class="order-card" onclick="viewOrderDetails(${order.id})">
            <div class="order-image">
                <img src="${order.product_image || 'https://via.placeholder.com/200'}" alt="${order.product_name}">
            </div>
            <div class="order-info">
                <div class="order-number">${order.order_number}</div>
                <div class="order-product">${order.product_name}</div>
                <div class="order-date">${formatDate(order.created_at)}</div>
            </div>
            <div class="order-status">
                <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span>
            </div>
            <div class="order-price">$${formatPrice(order.total_price)}</div>
        </div>
    `).join('');
}

/**
 * Show no orders message
 */
function showNoOrders() {
    document.getElementById('orders-grid').innerHTML = '';
    document.getElementById('no-orders').classList.remove('hidden');
}

/**
 * Track order by number (for guests)
 */
function trackOrder() {
    const orderNumber = document.getElementById('track-number').value.trim();
    const email = document.getElementById('track-email').value.trim();

    if (!orderNumber || !email) {
        showToast('Please enter order number and email');
        return;
    }

    fetch('api/user_orders.php', {
        method: 'POST',
        body: new URLSearchParams({
            action: 'get_order_by_number',
            order_number: orderNumber,
            email: email
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.data.order) {
            displayTrackedOrder(data.data.order);
        } else {
            showToast(data.message || 'Order not found');
        }
    })
    .catch(err => {
        console.error('Track order error:', err);
        showToast('Failed to track order');
    });
}

/**
 * Display tracked order result
 */
function displayTrackedOrder(order) {
    const result = document.getElementById('track-result');
    result.classList.remove('hidden');
    result.innerHTML = `
        <div class="tracked-order">
            <h4>Order Found!</h4>
            <div class="tracked-order-details">
                <div><strong>Order Number:</strong> ${order.order_number}</div>
                <div><strong>Product:</strong> ${order.product_name}</div>
                <div><strong>Status:</strong> <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></div>
                <div><strong>Total:</strong> $${formatPrice(order.total_price)}</div>
                <div><strong>Date:</strong> ${formatDate(order.created_at)}</div>
            </div>
        </div>
    `;
}

/**
 * View order details in modal
 */
function viewOrderDetails(orderId) {
    fetch('api/user_orders.php', {
        method: 'POST',
        body: new URLSearchParams({
            action: 'get_order_details',
            order_id: orderId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.data.order) {
            showOrderModal(data.data.order);
        } else {
            showToast(data.message || 'Failed to load order details');
        }
    })
    .catch(err => {
        console.error('View order error:', err);
        showToast('Failed to load order details');
    });
}

/**
 * Show order details modal
 */
function showOrderModal(order) {
    const modal = document.getElementById('order-modal');
    const details = document.getElementById('order-details');

    details.innerHTML = `
        <div class="order-detail-grid">
            <div class="order-detail-images">
                ${order.product_images && order.product_images.length > 0 ? 
                    `<img src="${order.product_images[0]}" alt="${order.product_name}" class="order-detail-main-image">` :
                    `<div class="order-detail-placeholder">No Image</div>`
                }
            </div>
            <div class="order-detail-info">
                <h4>${order.product_name}</h4>
                <div class="order-detail-specs">
                    <div><strong>Processor:</strong> ${order.cpu}</div>
                    <div><strong>Graphics:</strong> ${order.gpu}</div>
                    <div><strong>RAM:</strong> ${order.ram}</div>
                    <div><strong>Storage:</strong> ${order.storage}</div>
                </div>
                <div class="order-detail-price">$${formatPrice(order.total_price)}</div>
            </div>
        </div>
        <div class="order-detail-section">
            <h5>Order Information</h5>
            <div class="order-detail-row"><span>Order Number:</span><strong>${order.order_number}</strong></div>
            <div class="order-detail-row"><span>Status:</span><span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></div>
            <div class="order-detail-row"><span>Date:</span><span>${formatDate(order.created_at)}</span></div>
        </div>
        <div class="order-detail-section">
            <h5>Shipping Information</h5>
            <div class="order-detail-row"><span>Name:</span><span>${order.name} ${order.surname}</span></div>
            <div class="order-detail-row"><span>Email:</span><span>${order.email}</span></div>
            <div class="order-detail-row"><span>Phone:</span><span>${order.phone}</span></div>
            <div class="order-detail-row"><span>Address:</span><span>${order.address}</span></div>
        </div>
    `;

    modal.classList.remove('hidden');
}

/**
 * Close order modal
 */
function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

/**
 * Logout
 */
function logout() {
    fetch('api/auth.php', {
        method: 'POST',
        body: new URLSearchParams({ action: 'logout' })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentUser = null;
            location.reload();
        }
    });
}

/**
 * Format price
 */
function formatPrice(price) {
    // Convert RUB to USD (approximate rate: 1 USD = 90 RUB)
    const priceUSD = Math.round(price / 90);
    return new Intl.NumberFormat('en-US').format(priceUSD);
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Get status label
 */
function getStatusLabel(status) {
    const labels = {
        'new': 'New Order',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return labels[status] || status;
}

/**
 * Show toast notification
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
