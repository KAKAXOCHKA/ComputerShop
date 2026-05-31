/**
 * NEXCORE home: showcase from API, auth, custom build request.
 */
let showcaseIndex = 0;
let showcaseProducts = [];
let showcaseAutoplayInterval = null;

function formatUsd(price) {
  const n = Number(price);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function parseProductsPayload(data) {
  if (data.data && data.data.products) return data.data.products;
  if (data.products) return data.products;
  return [];
}

function loadShowcaseProducts() {
  fetch('api/products.php', {
    method: 'POST',
    body: new URLSearchParams({ action: 'get_products' }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) return;
      const products = parseProductsPayload(data);
      showcaseProducts = products.slice(0, 6);
      renderShowcase();
      if (showcaseProducts.length) startShowcaseAutoplay();
    })
    .catch((err) => console.error('Failed to load products:', err));
}

function renderShowcase() {
  const track = document.getElementById('showcase-track');
  if (!track || showcaseProducts.length === 0) return;

  track.innerHTML = showcaseProducts
    .map(
      (product, index) => `
    <div class="showcase-card" style="animation-delay:${index * 0.1}s">
      <div class="showcase-img">
        ${
          product.primary_image
            ? `<img src="${product.primary_image}" alt="" style="width:100%;height:100%;object-fit:cover;">`
            : '<div class="showcase-pc-icon">💻</div>'
        }
        ${
          product.badge
            ? `<div class="showcase-badge">${
                product.badge === 'new' ? 'New' : product.badge === 'hot' ? 'Hot' : 'Sale'
              }</div>`
            : ''
        }
      </div>
      <div class="showcase-body">
        <div class="showcase-type">${product.type}</div>
        <div class="showcase-name">${product.name}</div>
        <div class="showcase-specs">
          <div class="showcase-spec"><span class="showcase-spec-key">Processor</span><span class="showcase-spec-val">${product.cpu}</span></div>
          <div class="showcase-spec"><span class="showcase-spec-key">Graphics Card</span><span class="showcase-spec-val">${product.gpu}</span></div>
          <div class="showcase-spec"><span class="showcase-spec-key">RAM</span><span class="showcase-spec-val">${product.ram}</span></div>
          <div class="showcase-spec"><span class="showcase-spec-key">Storage</span><span class="showcase-spec-val">${product.storage}</span></div>
        </div>
        <div class="showcase-price">${formatUsd(product.price)}</div>
      </div>
    </div>
  `
    )
    .join('');
}

function showcaseSlide(direction) {
  const track = document.getElementById('showcase-track');
  if (!track) return;

  showcaseIndex += direction;
  if (showcaseIndex < 0) {
    showcaseIndex = Math.max(0, showcaseProducts.length - 3);
  } else if (showcaseIndex > showcaseProducts.length - 3) {
    showcaseIndex = 0;
  }

  const offset = showcaseIndex * (420 + 32);
  track.style.transform = `translateX(-${offset}px)`;
}

function startShowcaseAutoplay() {
  if (showcaseAutoplayInterval) clearInterval(showcaseAutoplayInterval);
  showcaseAutoplayInterval = setInterval(() => showcaseSlide(1), 5000);
}

function stopShowcaseAutoplay() {
  if (showcaseAutoplayInterval) {
    clearInterval(showcaseAutoplayInterval);
    showcaseAutoplayInterval = null;
  }
}

function refreshNavFromServer() {
  fetch('api/check_auth.php')
    .then((r) => r.json())
    .then((data) => {
      const u = data.success && data.user ? data.user : null;
      document.getElementById('auth-btn')?.classList.toggle('hidden', !!u);
      document.getElementById('logout-btn')?.classList.toggle('hidden', !u);
      document.getElementById('admin-btn')?.classList.toggle('hidden', !(u && u.is_admin));
    })
    .catch(() => {});
}

function showPage(name) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  const el = document.getElementById('page-' + name);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
  refreshNavFromServer();
}

function scrollToCustom() {
  showPage('home');
  setTimeout(() => document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' }), 100);
}

function doLogin() {
  const email = document.getElementById('l-email').value.trim().toLowerCase();
  const pass = document.getElementById('l-pass').value;
  const err = document.getElementById('l-err');
  err.classList.add('hidden');
  if (!email || !pass) {
    err.textContent = 'Please fill in all fields';
    err.classList.remove('hidden');
    return;
  }
  const fd = new FormData();
  fd.append('action', 'login');
  fd.append('email', email);
  fd.append('password', pass);
  fetch('api/auth.php', { method: 'POST', body: fd })
    .then((r) => r.json())
    .then((data) => {
      if (!data.success) {
        err.textContent = data.message || 'Invalid email or password';
        err.classList.remove('hidden');
        return;
      }
      const u = data.user;
      if (u && u.is_admin) {
        window.location.href = 'admin.html';
        return;
      }
      refreshNavFromServer();
      showPage('home');
      toast('Welcome, ' + u.name + '!');
    })
    .catch(() => {
      err.textContent = 'Could not reach the server';
      err.classList.remove('hidden');
    });
}

function doRegister() {
  const name = document.getElementById('r-name').value.trim();
  const sname = document.getElementById('r-sname').value.trim();
  const email = document.getElementById('r-email').value.trim().toLowerCase();
  const phone = document.getElementById('r-phone').value.trim();
  const pass = document.getElementById('r-pass').value;
  const pass2 = document.getElementById('r-pass2').value;
  const err = document.getElementById('r-err');
  const ok = document.getElementById('r-ok');
  err.classList.add('hidden');
  ok.classList.add('hidden');
  if (!name || !sname || !email || !pass) {
    err.textContent = 'Please fill in all required fields';
    err.classList.remove('hidden');
    return;
  }
  if (pass.length < 8) {
    err.textContent = 'Password must be at least 8 characters';
    err.classList.remove('hidden');
    return;
  }
  if (pass !== pass2) {
    err.textContent = 'Passwords do not match';
    err.classList.remove('hidden');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    err.textContent = 'Invalid email address';
    err.classList.remove('hidden');
    return;
  }
  const fd = new FormData();
  fd.append('action', 'register');
  fd.append('name', name);
  fd.append('surname', sname);
  fd.append('email', email);
  fd.append('phone', phone);
  fd.append('password', pass);
  fetch('api/auth.php', { method: 'POST', body: fd })
    .then((r) => r.json())
    .then((data) => {
      if (!data.success) {
        err.textContent = data.message || 'Registration failed';
        err.classList.remove('hidden');
        return;
      }
      ok.textContent = 'Account created! Signing you in...';
      ok.classList.remove('hidden');
      const fd2 = new FormData();
      fd2.append('action', 'login');
      fd2.append('email', email);
      fd2.append('password', pass);
      setTimeout(() => {
        fetch('api/auth.php', { method: 'POST', body: fd2 })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              refreshNavFromServer();
              showPage('home');
              toast('Welcome, ' + name + '!');
            }
          });
      }, 800);
    })
    .catch(() => {
      err.textContent = 'Could not reach the server';
      err.classList.remove('hidden');
    });
}

function logout() {
  fetch('api/auth.php', { method: 'POST', body: new URLSearchParams({ action: 'logout' }) })
    .then((r) => r.json())
    .catch(() => {});
  refreshNavFromServer();
  showPage('home');
  toast('You have been logged out');
}

function showForgotPassword() {
  const block = document.getElementById('forgot-block');
  const isHidden = block.classList.contains('hidden');
  block.classList.toggle('hidden', !isHidden);
  if (!isHidden) return;
  document.getElementById('fp-err').classList.add('hidden');
  document.getElementById('fp-ok').classList.add('hidden');
  document.getElementById('fp-email').value = '';
}

function doForgotPassword() {
  const email = document.getElementById('fp-email').value.trim().toLowerCase();
  const err = document.getElementById('fp-err');
  const ok = document.getElementById('fp-ok');
  err.classList.add('hidden');
  ok.classList.add('hidden');
  if (!email) {
    err.textContent = 'Please enter your email';
    err.classList.remove('hidden');
    return;
  }
  const fd = new FormData();
  fd.append('action', 'forgot_password');
  fd.append('email', email);
  fetch('api/auth.php', { method: 'POST', body: fd })
    .then((r) => r.json())
    .then((data) => {
      if (!data.success) {
        err.textContent = data.message || 'No account with this email';
        err.classList.remove('hidden');
        return;
      }
      ok.innerHTML =
        'Your new temporary password: <strong style="color:var(--accent);letter-spacing:.08em">' +
        data.new_password +
        '</strong><br><span style="font-size:12px;color:var(--text3)">Sign in and change it in account settings when you can.</span>';
      ok.classList.remove('hidden');
    })
    .catch(() => {
      err.textContent = 'Could not reach the server';
      err.classList.remove('hidden');
    });
}

function submitCustom(e) {
  e.preventDefault();
  const fd = new FormData();
  fd.append('action', 'add_custom_request');
  fd.append('name', document.getElementById('c-name').value.trim());
  fd.append('phone', document.getElementById('c-phone').value.trim());
  fd.append('email', document.getElementById('c-email').value.trim());
  fd.append('budget', document.getElementById('c-budget').value);
  fd.append('description', document.getElementById('c-desc').value.trim());
  fetch('api/custom.php', { method: 'POST', body: fd })
    .then((r) => r.json())
    .then((data) => {
      if (!data.success) {
        toast(data.message || 'Something went wrong');
        return;
      }
      e.target.reset();
      toast('Request sent. We will get back to you within an hour.');
    })
    .catch(() => toast('Could not reach the server'));
}

function toast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-text').textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.classList.remove('show'), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.showcase-slider');
  if (slider) {
    slider.addEventListener('mouseenter', stopShowcaseAutoplay);
    slider.addEventListener('mouseleave', () => {
      if (showcaseProducts.length) startShowcaseAutoplay();
    });
  }
  loadShowcaseProducts();
  refreshNavFromServer();
});
