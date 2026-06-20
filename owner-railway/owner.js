(function() {
  const authPanel = document.getElementById('authPanel');
  const loginForm = document.getElementById('loginForm');
  const ownerUsername = document.getElementById('ownerUsername');
  const ownerPassword = document.getElementById('ownerPassword');
  const rememberDeviceCheckbox = document.getElementById('rememberDevice');
  const authMessage = document.getElementById('authMessage');
  const logoutBtn = document.getElementById('logoutBtn');

  const mainDashboard = document.getElementById('mainDashboard');
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  const ordersTab = document.getElementById('ordersTab');
  const productsTab = document.getElementById('productsTab');
  const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
  const downloadBackupBtn = document.getElementById('downloadBackupBtn');
  const notificationBanner = document.getElementById('notificationBanner');
  const toastMessage = document.getElementById('toastMessage');
  const ordersUpdated = document.getElementById('ordersUpdated');
  const ordersTable = document.getElementById('ordersTable');
  const ordersMessage = document.getElementById('ordersMessage');
  const rememberedDevicesStatus = document.getElementById('rememberedDevicesStatus');

  const productForm = document.getElementById('productForm');
  const productCategory = document.getElementById('productCategory');
  const productName = document.getElementById('productName');
  const productDescription = document.getElementById('productDescription');
  const productImageFile = document.getElementById('productImageFile');
  const productImageUrl = document.getElementById('productImageUrl');
  const productsList = document.getElementById('productsList');
  const productsMessage = document.getElementById('productsMessage');

  const showAuth = () => {
    authPanel.classList.remove('hidden');
    mainDashboard.classList.add('hidden');
    logoutBtn.classList.add('hidden');
  };

  const showDashboard = () => {
    authPanel.classList.add('hidden');
    mainDashboard.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    activateTab('ordersTab');
    loadOrders();
    loadProducts();
  };

  const setMessage = (container, text, type = 'info') => {
    if (!container) return;
    container.innerHTML = text ? `<div class="message ${type === 'error' ? 'error' : type === 'success' ? 'success' : ''}">${text}</div>` : '';
  };

  let knownOrderIds = [];
  const showNotificationBanner = (message) => {
    if (!notificationBanner) return;
    notificationBanner.innerHTML = `<strong>${message}</strong>`;
    notificationBanner.classList.remove('hidden');
  };

  const hideNotificationBanner = () => {
    if (!notificationBanner) return;
    notificationBanner.classList.add('hidden');
  };

  const showToast = (message, duration = 5000) => {
    if (!toastMessage) return;
    toastMessage.textContent = message;
    toastMessage.classList.remove('hidden');
    window.setTimeout(() => {
      toastMessage.classList.add('hidden');
    }, duration);
  };

  const browserNotificationsSupported = 'Notification' in window && window.location.protocol !== 'file:';
  const notifyBrowser = (title, body) => {
    if (!browserNotificationsSupported) return false;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
      return true;
    }
    return false;
  };

  const requestNotificationPermission = async () => {
    if (!browserNotificationsSupported) {
      showToast('Browser notifications are not supported on this device. Order alerts will appear in the dashboard instead.');
      return;
    }
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        showToast('Notifications are blocked. New orders will still appear in the dashboard.', 8000);
      }
    } else if (Notification.permission === 'denied') {
      showToast('Notifications are denied in this browser. New orders will still appear in the dashboard.', 8000);
    }
  };

  const activateTab = (tabId) => {
    tabs.forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      const panel = document.getElementById(tab);
      if (tab === tabId) {
        btn.classList.add('active');
        if (panel) panel.classList.remove('hidden');
      } else {
        btn.classList.remove('active');
        if (panel) panel.classList.add('hidden');
      }
    });
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
  });

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    const json = await res.json().catch(() => ({ ok: false, error: 'Invalid JSON response' }));
    if (!res.ok) {
      throw new Error(json.error || `Request failed: ${res.status}`);
    }
    return json;
  };

  const tryAutoLoginWithSavedDevice = async () => {
    try {
      setMessage(authMessage, 'Checking saved device access...', 'info');
      const json = await fetchJson('/owner/login-device', { method: 'POST' });
      if (json.ok) {
        setMessage(authMessage, 'Welcome back. Direct device access granted.', 'success');
        showDashboard();
        return true;
      }
    } catch (err) {
      console.debug('Saved device access not available.', err);
    }
    return false;
  };

  const loginOwner = async (username, password, rememberDevice = false) => {
    return fetchJson('/owner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, rememberDevice })
    });
  };

  const loadRememberedDeviceCount = async () => {
    if (!rememberedDevicesStatus) return;
    try {
      const json = await fetchJson('/api/device-status');
      const count = parseInt(json.count, 10) || 0;
      rememberedDevicesStatus.textContent = count > 0
        ? `Saved device login is enabled on ${count} device${count === 1 ? '' : 's'}.`
        : 'No remembered devices are registered yet.';
    } catch (err) {
      rememberedDevicesStatus.textContent = 'Saved device login status unavailable.';
    }
  };

  const logoutOwner = async () => {
    try {
      await fetchJson('/owner/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout failed', err);
    }
    showAuth();
  };

  const renderOrders = (orders) => {
    if (!orders || orders.length === 0) {
      ordersTable.innerHTML = '<div class="message">No orders found.</div>';
      return;
    }

    const rows = orders.map(order => {
      const cells = Object.keys(order).map(key => `<td>${String(order[key] || '')}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const headers = Object.keys(orders[0]).map(key => `<th>${key}</th>`).join('');
    ordersTable.innerHTML = `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  };

  const loadOrders = async (isPoll = false) => {
    if (!isPoll) setMessage(ordersMessage, 'Loading orders...', 'info');
    try {
      const json = await fetchJson('/api/orders');
      if (!json.ok) throw new Error(json.error || 'Could not load orders');
      const orders = json.rows || [];
      renderOrders(orders);
      ordersUpdated.textContent = `Last refreshed: ${new Date().toLocaleString()}`;
      if (!isPoll) setMessage(ordersMessage, 'Orders loaded.', 'success');
      const currentOrderIds = orders.map(o => o.id).sort();
      if (knownOrderIds.length > 0) {
        const newOrders = currentOrderIds.filter(id => !knownOrderIds.includes(id));
        if (newOrders.length > 0) {
          const message = `New order received (${newOrders.length}).`;
          showNotificationBanner(message);
          const notified = notifyBrowser('Craveessa order', `${newOrders.length} new order(s) arrived.`);
          if (!notified) {
            showToast('New order received. Notifications are not available on this device.', 7000);
          }
        }
      }
      knownOrderIds = currentOrderIds;
    } catch (err) {
      if (!isPoll) setMessage(ordersMessage, `Unable to load orders: ${err.message}`, 'error');
      if (err.message.includes('Unauthorized')) {
        showAuth();
      }
    }
  };

  const renderProducts = (products) => {
    if (!products || products.length === 0) {
      productsList.innerHTML = '<div class="message">No products have been added yet.</div>';
      return;
    }

    productsList.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-image" style="background-image:url('${product.imageUrl || 'assets/cakefront.png'}')"></div>
        <div class="product-details">
          <h4>${product.name}</h4>
          <p><strong>Category:</strong> ${product.category || 'Uncategorized'}</p>
          <p>${product.description || 'No description provided.'}</p>
        </div>
        <div class="table-actions">
          <button class="btn btn-secondary" data-action="delete" data-id="${product.id}">Delete</button>
        </div>
      </div>
    `).join('');
  };

  const loadProducts = async () => {
    setMessage(productsMessage, 'Loading products...', 'info');
    try {
      const json = await fetchJson('/api/products');
      renderProducts(json.products || []);
      setMessage(productsMessage, 'Product catalog loaded.', 'success');
    } catch (err) {
      setMessage(productsMessage, `Unable to load products: ${err.message}`, 'error');
      if (err.message.includes('Unauthorized')) {
        showAuth();
      }
    }
  };

  const saveProduct = async (payload) => {
    return fetchJson('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('imageFile', file);
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const json = await res.json().catch(() => ({ ok: false, error: 'Invalid JSON response' }));
    if (!res.ok) {
      throw new Error(json.error || `Upload failed: ${res.status}`);
    }
    return json.imageUrl;
  };

  const deleteProduct = async (id) => {
    return fetchJson(`/api/products/${id}`, { method: 'DELETE' });
  };

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = ownerUsername.value.trim();
    const password = ownerPassword.value.trim();
    const rememberDevice = rememberDeviceCheckbox && rememberDeviceCheckbox.checked;
    setMessage(authMessage, 'Logging in...', 'info');
    try {
      const result = await loginOwner(username, password, rememberDevice);
      if (result.needs2fa) {
        setMessage(authMessage, 'Two-factor auth required. Please complete verification.', 'error');
        return;
      }
      setMessage(authMessage, 'Login successful.', 'success');
      ownerUsername.value = '';
      ownerPassword.value = '';
      if (rememberDeviceCheckbox) rememberDeviceCheckbox.checked = false;
      showDashboard();
      await loadRememberedDeviceCount();
    } catch (err) {
      setMessage(authMessage, `Login failed: ${err.message}`, 'error');
    }
  });

  logoutBtn.addEventListener('click', async () => { await logoutOwner(); });

  refreshOrdersBtn.addEventListener('click', () => {
    hideNotificationBanner();
    loadOrders();
  });

  const startOrderPolling = () => {
    setInterval(() => loadOrders(true), 30000);
  };

  if (downloadBackupBtn) {
    downloadBackupBtn.addEventListener('click', async () => {
      setMessage(ordersMessage, 'Preparing PDF backup...', 'info');
      try {
        const backup = await fetchJson('/api/backup');
        if (!window.jspdf || !window.jspdf.jsPDF) {
          throw new Error('PDF library not loaded');
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const padding = 40;
        let y = padding;
        const lineHeight = 18;
        const pageHeight = doc.internal.pageSize.height - padding;

        const addLine = (text, options = {}) => {
          if (y > pageHeight) {
            doc.addPage();
            y = padding;
          }
          doc.text(text, padding, y, options);
          y += lineHeight;
        };

        addLine('Craveessa Backup', { fontSize: 18 });
        addLine(`Generated: ${new Date().toLocaleString()}`);
        addLine(' ');

        addLine('Orders:', { fontStyle: 'bold' });
        if (!backup.submissions || backup.submissions.length === 0) {
          addLine('  No orders found.');
        } else {
          backup.submissions.forEach((order, index) => {
            addLine(`  Order #${index + 1}: ${order.fullName || '[No name]'}`);
            addLine(`    Phone: ${order.whatsappNumber || ''}`);
            addLine(`    Email: ${order.email || ''}`);
            addLine(`    Cake size: ${order.cakeSize || ''}`);
            addLine(`    Flavor: ${order.flavor || ''}`);
            addLine(`    Occasion: ${order.occasion || ''}`);
            addLine(`    Needed by: ${order.neededBy || ''}`);
            addLine(`    Delivery area: ${order.deliveryArea || ''}`);
            addLine(`    Discount code: ${order.discountCode || ''}`);
            addLine(`    Created at: ${order.createdAt || ''}`);
            addLine(`    Collected: ${order.collected ? 'Yes' : 'No'}`);
            addLine(' ');
          });
        }

        addLine('Products:', { fontStyle: 'bold' });
        if (!backup.products || backup.products.length === 0) {
          addLine('  No products found.');
        } else {
          backup.products.forEach((product, index) => {
            addLine(`  Product #${index + 1}: ${product.name || '[No name]'}`);
            addLine(`    Category: ${product.category || 'Uncategorized'}`);
            addLine(`    Description: ${product.description || ''}`);
            addLine(`    Image URL: ${product.imageUrl || ''}`);
            addLine(`    Created at: ${product.createdAt || ''}`);
            addLine(' ');
          });
        }

        const filename = `craveessa-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
        doc.save(filename);
        setMessage(ordersMessage, 'PDF backup download ready.', 'success');
      } catch (err) {
        setMessage(ordersMessage, `Backup failed: ${err.message}`, 'error');
      }
    });
  }

  productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      category: productCategory.value.trim(),
      name: productName.value.trim(),
      description: productDescription.value.trim()
    };
    const imageFile = productImageFile && productImageFile.files && productImageFile.files[0];
    if (imageFile) {
      try {
        payload.imageUrl = await uploadImage(imageFile);
      } catch (err) {
        setMessage(productsMessage, `Photo upload failed: ${err.message}`, 'error');
        return;
      }
    } else {
      payload.imageUrl = productImageUrl.value.trim();
    }
    if (!payload.category || !payload.name) {
      setMessage(productsMessage, 'Category and product name are required.', 'error');
      return;
    }
    setMessage(productsMessage, 'Saving product...', 'info');
    try {
      await saveProduct(payload);
      setMessage(productsMessage, 'Product saved successfully.', 'success');
      productForm.reset();
      loadProducts();
    } catch (err) {
      setMessage(productsMessage, `Save failed: ${err.message}`, 'error');
    }
  });

  productsList.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-action="delete"]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id || !confirm('Delete this product?')) return;
    setMessage(productsMessage, 'Deleting product...', 'info');
    try {
      await deleteProduct(id);
      setMessage(productsMessage, 'Product deleted.', 'success');
      loadProducts();
    } catch (err) {
      setMessage(productsMessage, `Delete failed: ${err.message}`, 'error');
    }
  });

  // Initial view: show login panel.
  if (rememberedDevicesStatus) {
    rememberedDevicesStatus.textContent = 'Saved device login status will appear after you log in.';
  }
  showAuth();
  requestNotificationPermission();
  const autoLoggedIn = await tryAutoLoginWithSavedDevice();
  if (autoLoggedIn) {
    await loadRememberedDeviceCount();
  }
  startOrderPolling();
})();
