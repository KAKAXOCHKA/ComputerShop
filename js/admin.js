/**
 * NEXCORE admin panel (PHP session + MySQL).
 */
function formatUsd(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(x);
}

function toast(msg) {
  let el = document.getElementById('admin-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'admin-toast';
    el.style.cssText =
      'position:fixed;bottom:24px;right:24px;z-index:9999;background:#111;border:1px solid #333;padding:14px 18px;font-size:13px;max-width:320px;transition:opacity .3s';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(window._admToast);
  window._admToast = setTimeout(() => {
    el.style.opacity = '0';
  }, 3200);
}

function adminPanel(name, el) {
  document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.aside-item').forEach((i) => i.classList.remove('active'));
  if (!el) el = document.querySelector('.aside-item[data-panel="' + name + '"]');
  const panel = document.getElementById('admin-' + name);
  if (panel) panel.classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'dashboard') loadDashboard();
  if (name === 'orders') loadOrders();
  if (name === 'products') loadProducts();
  if (name === 'custom') loadCustom();
}

function apiAdmin(action, extra = {}) {
  const fd = new FormData();
  fd.append('action', action);
  Object.keys(extra).forEach((k) => fd.append(k, extra[k]));
  return fetch('api/admin.php', { method: 'POST', body: fd, credentials: 'same-origin' }).then((r) => r.json());
}

function loadDashboard() {
  apiAdmin('get_stats').then((data) => {
    if (!data.success) return;
    const s = data.stats || {};
    document.getElementById('k-orders').textContent = s.total_orders ?? 0;
    document.getElementById('k-new').textContent = s.new_orders ?? 0;
    document.getElementById('k-products').textContent = s.total_products ?? 0;
    document.getElementById('k-custom').textContent = s.custom_requests ?? 0;
  });
  apiAdmin('get_orders').then((data) => {
    if (!data.success || !data.orders) return;
    const recent = data.orders.slice(0, 5);
    const host = document.getElementById('dash-recent');
    if (!recent.length) {
      host.innerHTML = '<p style="color:#555">No orders yet</p>';
      return;
    }
    host.innerHTML =
      '<div class="panel-title" style="font-size:22px;margin-bottom:12px">Recent orders</div>' +
      '<div class="table-wrap"><div class="tbl-head tbl-orders"><span>#</span><span>Customer</span><span>Product</span><span>Total</span><span>Status</span><span></span></div>' +
      recent.map(orderRowHtml).join('') +
      '</div>';
  });
}

function statusClass(st) {
  if (st === 'new') return 's-new';
  if (st === 'processing') return 's-work';
  if (st === 'shipped') return 's-ship';
  if (st === 'delivered') return 's-done';
  if (st === 'cancelled') return 's-new';
  return '';
}

function customStatusClass(st) {
  if (st === 'new') return 's-new';
  if (st === 'contacted') return 's-work';
  if (st === 'completed') return 's-done';
  return '';
}

function orderRowHtml(o) {
  const st = o.status || 'new';
  return `<div class="tbl-row tbl-orders">
    <span style="font-size:11px;color:var(--accent);font-weight:700">${o.order_number}</span>
    <span><strong>${o.name} ${o.surname}</strong><br><small style="color:var(--text3)">${o.email}</small></span>
    <span>${o.product_name || '—'}</span>
    <span>${formatUsd(o.total_price)}</span>
    <span><span class="status ${statusClass(st)}">${st}</span></span>
    <span>${orderActionsHtml(o)}</span>
  </div>`;
}

function orderActionsHtml(o) {
  const id = o.id;
  const st = o.status;
  const btns = [];
  if (st === 'new') btns.push(`<button type="button" class="tbl-btn" onclick="setOrderStatus(${id},'processing')">Processing</button>`);
  if (st === 'processing') btns.push(`<button type="button" class="tbl-btn" onclick="setOrderStatus(${id},'shipped')">Shipped</button>`);
  if (st === 'shipped') btns.push(`<button type="button" class="tbl-btn" onclick="setOrderStatus(${id},'delivered')">Delivered</button>`);
  btns.push(`<button type="button" class="tbl-btn" onclick="setOrderStatus(${id},'cancelled')">Cancel</button>`);
  return btns.join('');
}

function setOrderStatus(id, status) {
  apiAdmin('update_order_status', { id: String(id), status })
    .then((d) => {
      if (!d.success) {
        toast(d.message || 'Error');
        return;
      }
      toast('Status updated');
      loadOrders();
      loadDashboard();
    })
    .catch(() => toast('Network error'));
}

function loadOrders() {
  apiAdmin('get_orders').then((data) => {
    const t = document.getElementById('orders-tbody');
    if (!data.success || !data.orders) {
      t.innerHTML = '<div style="padding:24px;color:#555">No data</div>';
      return;
    }
    if (!data.orders.length) {
      t.innerHTML = '<div style="padding:24px;color:#555;text-align:center">No orders</div>';
      return;
    }
    t.innerHTML = data.orders.map(orderRowHtml).join('');
  });
}

function loadProducts() {
  apiAdmin('get_all_products').then((data) => {
    const t = document.getElementById('products-tbody');
    if (!data.success || !data.products) {
      t.innerHTML = '<div style="padding:24px;color:#555">No data</div>';
      return;
    }
    t.innerHTML = data.products
      .map(
        (p) => `<div class="tbl-row tbl-products">
      <span style="color:var(--text3);font-size:11px">${p.id}</span>
      <span><div style="display:flex;align-items:center;gap:10px">
        ${p.primary_image ? `<img src="${p.primary_image}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:2px">` : '<span>💻</span>'}
        <div><strong>${p.name}</strong><br><small style="color:var(--text3)">${p.cpu}</small></div>
      </div></span>
      <span>${formatUsd(p.price)}</span>
      <span style="color:var(--text2);font-size:12px">${p.type}</span>
      <span>${Number(p.visible) ? 'yes' : 'no'}</span>
      <span>
        <button type="button" class="tbl-btn" onclick="toggleProductVisible(${p.id}, ${Number(p.visible) ? 0 : 1})">${Number(p.visible) ? 'Hide' : 'Show'}</button>
        <button type="button" class="tbl-btn" onclick="deleteProduct(${p.id})" style="color:var(--accent)">Delete</button>
      </span>
    </div>`
      )
      .join('');
  });
}

function toggleProductVisible(id, vis) {
  const fd = new FormData();
  fd.append('action', 'set_visible');
  fd.append('id', String(id));
  fd.append('visible', String(vis));
  fetch('api/products.php', { method: 'POST', body: fd, credentials: 'same-origin' })
    .then((r) => r.json())
    .then((d) => {
      if (!d.success) {
        toast(d.message || 'Error');
        return;
      }
      toast('Visibility updated');
      loadProducts();
      loadDashboard();
    })
    .catch(() => toast('Network error'));
}

function deleteProduct(id) {
  if (!confirm('Delete product #' + id + '?')) return;
  const fd = new FormData();
  fd.append('action', 'delete_product');
  fd.append('id', String(id));
  fetch('api/products.php', { method: 'POST', body: fd, credentials: 'same-origin' })
    .then((r) => r.json())
    .then((d) => {
      if (!d.success) {
        toast(d.message || 'Error');
        return;
      }
      toast('Deleted');
      loadProducts();
      loadDashboard();
    })
    .catch(() => toast('Network error'));
}

function submitAddProduct() {
  const name = document.getElementById('ap-name').value.trim();
  const type = document.getElementById('ap-type').value;
  const price = parseFloat(document.getElementById('ap-price').value);
  const oldP = document.getElementById('ap-old').value.trim();
  const cpu = document.getElementById('ap-cpu').value.trim();
  const gpu = document.getElementById('ap-gpu').value.trim();
  const ram = document.getElementById('ap-ram').value.trim();
  const ssd = document.getElementById('ap-ssd').value.trim();
  const desc = document.getElementById('ap-desc').value.trim();
  const badge = document.getElementById('ap-badge').value;
  const img = document.getElementById('ap-image').value.trim();
  const msg = document.getElementById('ap-msg');
  msg.className = '';
  msg.textContent = '';
  if (!name || !type || !price || !cpu || !gpu || !ram || !ssd) {
    msg.textContent = 'Please fill in all required fields';
    msg.className = 'err';
    return;
  }
  const fd = new FormData();
  fd.append('action', 'add_product');
  fd.append('name', name);
  fd.append('type', type);
  fd.append('price', String(price));
  if (oldP) fd.append('old_price', oldP);
  fd.append('cpu', cpu);
  fd.append('gpu', gpu);
  fd.append('ram', ram);
  fd.append('storage', ssd);
  fd.append('description', desc);
  fd.append('badge', badge);
  if (img) fd.append('primary_image_url', img);
  fetch('api/products.php', { method: 'POST', body: fd, credentials: 'same-origin' })
    .then((r) => r.json())
    .then((d) => {
      if (!d.success) {
        msg.textContent = d.message || 'Error';
        msg.className = 'err';
        return;
      }
      msg.textContent = 'Saved';
      msg.className = 'ok';
      toast('Product added');
      loadProducts();
      loadDashboard();
    })
    .catch(() => {
      msg.textContent = 'Network error';
      msg.className = 'err';
    });
}

function loadCustom() {
  apiAdmin('get_custom_requests').then((data) => {
    const host = document.getElementById('custom-list');
    if (!data.success || !data.requests || !data.requests.length) {
      host.innerHTML = '<p style="color:#555;padding:24px">No requests</p>';
      return;
    }
    host.innerHTML = data.requests
      .map(
        (r) => `<div class="notif-item">
      <div style="font-size:22px">🛠️</div>
      <div style="flex:1">
        <strong>${r.name}</strong> · ${r.phone}<br>
        <small style="color:var(--text3)">${r.email}</small>
        ${r.budget ? `<div style="margin-top:6px">Budget: ${r.budget}</div>` : ''}
        ${r.description ? `<div style="margin-top:8px;color:var(--text2)">${r.description}</div>` : ''}
        <div style="margin-top:10px"><span class="status ${customStatusClass(r.status)}">${r.status}</span></div>
        <div style="margin-top:10px">
          <button type="button" class="tbl-btn" onclick="setCustomStatus(${r.id},'contacted')">Contacted</button>
          <button type="button" class="tbl-btn" onclick="setCustomStatus(${r.id},'completed')">Completed</button>
        </div>
      </div>
    </div>`
      )
      .join('');
  });
}

function setCustomStatus(id, status) {
  apiAdmin('update_custom_status', { id: String(id), status })
    .then((d) => {
      if (!d.success) {
        toast(d.message || 'Error');
        return;
      }
      toast('Request status updated');
      loadCustom();
      loadDashboard();
    })
    .catch(() => toast('Network error'));
}

function logoutAdmin() {
  fetch('api/auth.php', { method: 'POST', body: new URLSearchParams({ action: 'logout' }), credentials: 'same-origin' })
    .then(() => {
      location.href = 'index.html';
    })
    .catch(() => {
      location.href = 'index.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('api/check_auth.php', { credentials: 'same-origin' })
    .then((r) => r.json())
    .then((data) => {
      if (!data.success || !data.user || !data.user.is_admin) {
        location.href = 'index.html';
        return;
      }
      const u = data.user;
      document.getElementById('admin-name-label').textContent = (u.name || '') + ' ' + (u.surname || '');
      loadDashboard();
    })
    .catch(() => {
      location.href = 'index.html';
    });
});
