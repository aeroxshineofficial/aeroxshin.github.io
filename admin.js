/* ============================================================
   ADMIN PANEL - AeroXshine
   Firebase Auth + Firestore
   ============================================================ */

(function () {
  "use strict";

  /* ---------- CONSTANTS ---------- */
  var CATEGORIES = [
    "Bathroom & Toilet Cleaning",
    "Glass & Surface Cleaning",
    "Hand Hygiene",
    "Kitchen Cleaning",
    "Floor Cleaning",
    "Floor & Surface Disinfection",
    "Laundry Care"
  ];
  var STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
  var PRODUCTS_PER_PAGE = 10;
  var ORDERS_PER_PAGE = 15;

  /* ---------- STATE ---------- */
  var allProducts = [];
  var allOrders = [];
  var currentPage = "dashboard";
  var productPage = 1;
  var orderPage = 1;
  var editingProductId = null;
  var selectedImageUrl = null;
  var confirmCallback = null;

  /* ---------- DOM HELPERS ---------- */
  function $(id) { return document.getElementById(id); }
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return document.querySelectorAll(sel); }

  /* ---------- TOAST ---------- */
  function showToast(message, type) {
    type = type || "info";
    var container = $("toast-container");
    var toast = document.createElement("div");
    toast.className = "toast " + type;
    var icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    toast.innerHTML = (icons[type] || icons.info) + '<span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transition = "opacity .3s";
      setTimeout(function () { toast.remove(); }, 300);
    }, 3500);
  }

  /* ---------- LOADING ---------- */
  function showLoading(text) {
    $("loading-text").textContent = text || "Loading...";
    $("loading-overlay").classList.add("active");
  }
  function hideLoading() {
    $("loading-overlay").classList.remove("active");
  }

  /* ---------- AUTH ---------- */
  var currentUser = null;

  function initAuth() {
    if (!FirebaseServicesReady) {
      $("login-error").textContent = "Firebase is not configured. Please set up firebase-config.js.";
      $("login-error").style.display = "block";
      return;
    }

    auth.onAuthStateChanged(function (user) {
      if (user) {
        currentUser = user;
        showAdminView(user);
      } else {
        currentUser = null;
        showLoginView();
      }
    });
  }

  function showLoginView() {
    $("login-view").style.display = "";
    $("admin-view").classList.remove("active");
    $("admin-email").textContent = "";
  }

  function showAdminView(user) {
    $("login-view").style.display = "none";
    $("admin-email").textContent = user.email || "admin";

    user.getIdTokenResult(true)
      .then(function(tokenResult) {
        if (tokenResult.claims.admin === true) {
          $("admin-view").classList.add("active");
          loadAllData();
        } else {
          $("login-view").style.display = "";
          $("admin-view").classList.remove("active");
          $("login-error").innerHTML = "Access denied. Your account does not have admin privileges.<br><br>" +
            "<strong>To fix this:</strong><br>" +
            "1. Run: <code>node scripts/setup-admin.js set-claim " + user.uid + "</code><br>" +
            "2. Sign out and sign back in.<br><br>" +
            "<small style='color:var(--admin-text-muted)'>UID: " + user.uid + "</small>";
          $("login-error").style.display = "block";
          auth.signOut();
        }
      })
      .catch(function() {
        $("login-view").style.display = "";
        $("admin-view").classList.remove("active");
        $("login-error").textContent = "Could not verify admin privileges. Please try again.";
        $("login-error").style.display = "block";
      });
  }

  function handleLogin(e) {
    e.preventDefault();
    var email = $("lg-email").value.trim();
    var pass = $("lg-pass").value;
    var valid = true;

    if (!email || !email.includes("@")) {
      $("lg-email-group").classList.add("has-error");
      valid = false;
    } else {
      $("lg-email-group").classList.remove("has-error");
    }
    if (!pass) {
      $("lg-pass-group").classList.add("has-error");
      valid = false;
    } else {
      $("lg-pass-group").classList.remove("has-error");
    }
    if (!valid) return;

    $("login-btn").disabled = true;
    $("login-btn").textContent = "Signing in...";
    $("login-error").style.display = "none";

    auth.signInWithEmailAndPassword(email, pass)
      .then(function () {
        $("login-form").reset();
      })
      .catch(function (err) {
        var msg = "Login failed. ";
        var code = err.code || "";
        if (code === "auth/user-not-found" || code === "auth/invalid-credential") msg += "Invalid email or password.";
        else if (code === "auth/wrong-password" || code === "auth/invalid-credential") msg += "Invalid email or password.";
        else if (code === "auth/invalid-email") msg += "Invalid email address.";
        else if (code === "auth/too-many-requests") msg += "Too many attempts. Try again later.";
        else if (code === "auth/network-request-failed") msg += "Network error. Check your connection.";
        else msg += "Login failed. Please try again.";
        $("login-error").textContent = msg;
        $("login-error").style.display = "block";
      })
      .finally(function () {
        $("login-btn").disabled = false;
        $("login-btn").textContent = "Sign In";
      });
  }

  function handleLogout() {
    if (!confirm("Are you sure you want to sign out?")) return;
    auth.signOut().then(function () {
      showToast("Signed out successfully", "success");
    });
  }

  function handleForgotPassword() {
    var email = $("lg-email").value.trim();
    if (!email) {
      $("login-success").style.display = "none";
      $("login-error").textContent = "Enter your email above, then click Forgot Password.";
      $("login-error").style.display = "block";
      return;
    }
    auth.sendPasswordResetEmail(email)
      .then(function () {
        $("login-error").style.display = "none";
        $("login-success").textContent = "Password reset email sent to " + email;
        $("login-success").style.display = "block";
      })
      .catch(function (err) {
        $("login-success").style.display = "none";
        $("login-error").textContent = "Could not send reset email. Check your email address.";
        $("login-error").style.display = "block";
      });
  }

  /* ---------- DATA LOADING ---------- */
  function loadAllData() {
    showLoading("Loading data...");
    Promise.all([loadProducts(), loadOrders()])
      .then(function () {
        hideLoading();
        renderDashboard();
        renderProductsTable();
        renderOrdersTable();
        populateCategoryFilters();
      })
      .catch(function (err) {
        hideLoading();
        console.error("Data loading error:", err);
        showToast("Error loading data", "error");
      });
  }

  function loadProducts() {
    return db.collection("products").orderBy("createdAt", "desc").get()
      .then(function (snap) {
        allProducts = [];
        snap.forEach(function (doc) {
          allProducts.push(Object.assign({ _id: doc.id }, doc.data()));
        });
      })
      .catch(function (err) {
        // Fallback: try without orderBy if index is missing
        return db.collection("products").get()
          .then(function (snap) {
            allProducts = [];
            snap.forEach(function (doc) {
              allProducts.push(Object.assign({ _id: doc.id }, doc.data()));
            });
          })
          .catch(function (err2) {
            console.error("Failed to load products:", err2.code, err2.message);
            if (err2.code === "permission-denied") {
              showToast("Cannot load products. Check your admin permissions.", "error");
            }
            allProducts = [];
          });
      });
  }

  function loadOrders() {
    return db.collection("orders").orderBy("createdAt", "desc").get()
      .then(function (snap) {
        allOrders = [];
        snap.forEach(function (doc) {
          allOrders.push(Object.assign({ _id: doc.id }, doc.data()));
        });
      })
      .catch(function (err) {
        // Fallback: try without orderBy if index is missing
        return db.collection("orders").get()
          .then(function (snap) {
            allOrders = [];
            snap.forEach(function (doc) {
              allOrders.push(Object.assign({ _id: doc.id }, doc.data()));
            });
          })
          .catch(function (err2) {
            console.error("Failed to load orders:", err2.code, err2.message);
            if (err2.code === "permission-denied") {
              showToast("Cannot load orders. Check your admin permissions.", "error");
            }
            allOrders = [];
          });
      });
  }

  /* ---------- DASHBOARD ---------- */
  function renderDashboard() {
    $("stat-total-products").textContent = allProducts.length;
    $("stat-active-products").textContent = allProducts.filter(function (p) { return p.available; }).length;
    $("stat-total-orders").textContent = allOrders.length;
    $("stat-pending-orders").textContent = allOrders.filter(function (o) { return o.status === "Pending"; }).length;

    var list = $("recent-orders-list");
    var recent = allOrders.slice(0, 5);
    if (recent.length === 0) {
      list.innerHTML = '<li class="empty-state" style="padding:32px"><p>No orders yet</p></li>';
      return;
    }
    list.innerHTML = recent.map(function (o) {
      var date = o.createdAt ? new Date(o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt).toLocaleDateString("en-IN") : "N/A";
      var items = (o.items || []).map(function (i) { return i.name + " x" + i.qty; }).join(", ");
      var statusClass = getStatusBadgeClass(o.status);
      return '<li class="recent-order-item">' +
        '<div class="recent-order-info">' +
          '<div class="name">' + escHtml(o.customerName || "Unknown") + '</div>' +
          '<div class="meta">' + escHtml(items.substring(0, 50)) + (items.length > 50 ? "..." : "") + ' &middot; ' + date + '</div>' +
        '</div>' +
        '<span class="badge ' + statusClass + '">' + escHtml(o.status || "Pending") + '</span>' +
      '</li>';
    }).join("");
  }

  /* ---------- PRODUCTS TABLE ---------- */
  function getFilteredProducts() {
    var search = $("product-search").value.toLowerCase().trim();
    var cat = $("product-category-filter").value;
    var status = $("product-status-filter").value;

    return allProducts.filter(function (p) {
      var matchSearch = !search ||
        (p.name && p.name.toLowerCase().indexOf(search) !== -1) ||
        (p.category && p.category.toLowerCase().indexOf(search) !== -1) ||
        (p.sku && p.sku.toLowerCase().indexOf(search) !== -1) ||
        (p.description && p.description.toLowerCase().indexOf(search) !== -1);
      var matchCat = cat === "all" || p.category === cat;
      var matchStatus = status === "all" ||
        (status === "active" && p.available) ||
        (status === "inactive" && !p.available);
      return matchSearch && matchCat && matchStatus;
    });
  }

  function renderProductsTable() {
    var filtered = getFilteredProducts();
    var tbody = $("products-tbody");
    var empty = $("products-empty");

    if (filtered.length === 0) {
      tbody.innerHTML = "";
      empty.style.display = "";
      $("products-table").style.display = "none";
      return;
    }

    empty.style.display = "none";
    $("products-table").style.display = "";

    var start = (productPage - 1) * PRODUCTS_PER_PAGE;
    var pageItems = filtered.slice(start, start + PRODUCTS_PER_PAGE);

    tbody.innerHTML = pageItems.map(function (p) {
      var price = p.price ? "\u20B9" + Number(p.price).toLocaleString("en-IN") : "Price on request";
      var discountPrice = p.discountPrice ? '<br><small style="text-decoration:line-through;color:var(--admin-text-muted)">' + "\u20B9" + Number(p.discountPrice).toLocaleString("en-IN") + '</small>' : '';
      var statusBadge = p.available
        ? '<span class="badge badge-success">Active</span>'
        : '<span class="badge badge-danger">Inactive</span>';
      var img = p.image ? '<img class="product-thumb" src="' + escAttr(p.image) + '" alt="" onerror="this.style.display=\'none\'">' : '<div class="product-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--admin-text-muted)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';

      return '<tr>' +
        '<td><div class="product-cell">' + img + '<div><div class="product-name">' + escHtml(p.name) + '</div>' + (p.sku ? '<div class="product-sku">' + escHtml(p.sku) + '</div>' : '') + '</div></div></td>' +
        '<td><span class="category-tag">' + escHtml(p.category || "Uncategorized") + '</span></td>' +
        '<td>' + price + discountPrice + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td><div class="action-btns">' +
          '<button class="btn-icon" title="Edit" onclick="App.editProduct(\'' + p._id + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
          '<button class="btn-icon danger" title="Delete" onclick="App.confirmDeleteProduct(\'' + p._id + '\',\'' + escAttr(p.name) + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '</div></td>' +
      '</tr>';
    }).join("");

    renderPagination("products", filtered.length, productPage, PRODUCTS_PER_PAGE, function (p) {
      productPage = p;
      renderProductsTable();
    });
  }

  function renderPagination(type, total, current, perPage, callback) {
    var existing = document.querySelector("#section-" + type + " .pagination");
    if (existing) existing.remove();

    var pages = Math.ceil(total / perPage);
    if (pages <= 1) return;

    var nav = document.createElement("div");
    nav.className = "pagination";

    var prevBtn = document.createElement("button");
    prevBtn.textContent = "\u00AB Prev";
    prevBtn.disabled = current <= 1;
    prevBtn.onclick = function () { callback(current - 1); };
    nav.appendChild(prevBtn);

    for (var i = 1; i <= pages; i++) {
      (function (page) {
        var btn = document.createElement("button");
        btn.textContent = page;
        if (page === current) btn.className = "active";
        btn.onclick = function () { callback(page); };
        nav.appendChild(btn);
      })(i);
    }

    var nextBtn = document.createElement("button");
    nextBtn.textContent = "Next \u00BB";
    nextBtn.disabled = current >= pages;
    nextBtn.onclick = function () { callback(current + 1); };
    nav.appendChild(nextBtn);

    document.querySelector("#section-" + type + " .panel").appendChild(nav);
  }

  /* ---------- ORDERS TABLE ---------- */
  function getFilteredOrders() {
    var search = $("order-search").value.toLowerCase().trim();
    var status = $("order-status-filter").value;
    var dateFilter = $("order-date-filter").value;

    return allOrders.filter(function (o) {
      var matchSearch = !search ||
        (o.customerName && o.customerName.toLowerCase().indexOf(search) !== -1) ||
        (o.phone && o.phone.indexOf(search) !== -1) ||
        (o._id && o._id.toLowerCase().indexOf(search) !== -1) ||
        (o.whatsapp && o.whatsapp.indexOf(search) !== -1);
      var matchStatus = status === "all" || o.status === status;
      var matchDate = true;
      if (dateFilter && o.createdAt) {
        var oDate = new Date(o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt);
        matchDate = oDate.toISOString().slice(0, 10) === dateFilter;
      }
      return matchSearch && matchStatus && matchDate;
    });
  }

  function renderOrdersTable() {
    var filtered = getFilteredOrders();
    var tbody = $("orders-tbody");
    var empty = $("orders-empty");

    if (filtered.length === 0) {
      tbody.innerHTML = "";
      empty.style.display = "";
      $("orders-table").style.display = "none";
      return;
    }

    empty.style.display = "none";
    $("orders-table").style.display = "";

    var start = (orderPage - 1) * ORDERS_PER_PAGE;
    var pageItems = filtered.slice(start, start + ORDERS_PER_PAGE);

    tbody.innerHTML = pageItems.map(function (o) {
      var date = o.createdAt ? new Date(o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt).toLocaleDateString("en-IN") : "N/A";
      var items = (o.items || []).map(function (i) { return escHtml(i.name) + " x" + i.qty; }).join(", ");
      var amount = o.totalAmount ? "\u20B9" + Number(o.totalAmount).toLocaleString("en-IN") : "-";
      var shortId = o._id ? o._id.substring(0, 8).toUpperCase() : "N/A";
      var statusClass = getStatusBadgeClass(o.status);

      var statusOptions = STATUSES.map(function (s) {
        return '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + s + '</option>';
      }).join("");

      return '<tr>' +
        '<td><strong>#' + shortId + '</strong></td>' +
        '<td>' + escHtml(o.customerName || "N/A") + (o.clinic ? '<br><small style="color:var(--admin-text-muted)">' + escHtml(o.clinic) + '</small>' : '') + '</td>' +
        '<td>' + escHtml(o.phone || "N/A") + '</td>' +
        '<td style="max-width:200px"><small>' + items.substring(0, 60) + (items.length > 60 ? "..." : "") + '</small></td>' +
        '<td>' + amount + '</td>' +
        '<td><small>' + date + '</small></td>' +
        '<td><select class="status-select" onchange="App.updateOrderStatus(\'' + o._id + '\',this.value)">' + statusOptions + '</select></td>' +
        '<td><div class="action-btns">' +
          '<button class="btn-icon" title="View Details" onclick="App.viewOrder(\'' + o._id + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
          '<button class="btn-icon danger" title="Delete" onclick="App.confirmDeleteOrder(\'' + o._id + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '</div></td>' +
      '</tr>';
    }).join("");

    renderPagination("orders", filtered.length, orderPage, ORDERS_PER_PAGE, function (p) {
      orderPage = p;
      renderOrdersTable();
    });
  }

  /* ---------- PRODUCT MODAL ---------- */
  function openProductModal(productId) {
    editingProductId = productId || null;
    selectedImageUrl = null;

    // Populate category dropdown
    var catSelect = $("pf-category");
    catSelect.innerHTML = '<option value="">Select category</option>';
    CATEGORIES.forEach(function (c) {
      catSelect.innerHTML += '<option value="' + escAttr(c) + '">' + escHtml(c) + '</option>';
    });

    if (productId) {
      $("product-modal-title").textContent = "Edit Product";
      $("product-save-btn").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Update Product';

      var product = allProducts.find(function (p) { return p._id === productId; });
      if (product) {
        $("pf-name").value = product.name || "";
        $("pf-category").value = product.category || "";
        $("pf-sku").value = product.sku || "";
        $("pf-description").value = product.description || "";
        $("pf-price").value = product.price || "";
        $("pf-discount-price").value = product.discountPrice || "";
        $("pf-pack-size").value = product.packSize || "";
        $("pf-features").value = (product.features || []).join(", ");
        $("pf-available").checked = product.available !== false;

        if (product.image) {
          selectedImageUrl = product.image;
          $("pf-image-url").value = product.image;
          $("image-preview").src = product.image;
          $("image-preview-container").style.display = "inline-block";
        }
      }
    } else {
      $("product-modal-title").textContent = "Add Product";
      $("product-save-btn").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Product';
      $("product-form").reset();
      $("pf-available").checked = true;
      $("image-preview-container").style.display = "none";
    }

    clearFormErrors();
    $("product-modal").classList.add("active");
  }

  function closeProductModal() {
    $("product-modal").classList.remove("active");
    editingProductId = null;
    selectedImageUrl = null;
  }

  function removeImage() {
    selectedImageUrl = null;
    $("image-preview").src = "";
    $("image-preview-container").style.display = "none";
    $("pf-image-url").value = "";
  }

  function saveProduct() {
    var name = $("pf-name").value.trim();
    var category = $("pf-category").value;
    var description = $("pf-description").value.trim();

    var valid = true;
    if (!name) { $("pf-name-group").classList.add("has-error"); valid = false; } else { $("pf-name-group").classList.remove("has-error"); }
    if (!category) { $("pf-category-group").classList.add("has-error"); valid = false; } else { $("pf-category-group").classList.remove("has-error"); }
    if (!description) { $("pf-desc-group").classList.add("has-error"); valid = false; } else { $("pf-desc-group").classList.remove("has-error"); }
    if (!valid) return;

    // ── Pre-save auth verification ──
    if (!FirebaseServicesReady || !db) {
      showToast("Firebase is not connected. Please refresh the page.", "error");
      return;
    }

    if (!currentUser) {
      showToast("Please log in as administrator to add products.", "error");
      return;
    }

    // Force-refresh the ID token to get the latest custom claims
    currentUser.getIdTokenResult(true)
      .then(function (tokenResult) {
        if (!tokenResult.claims.admin) {
          showToast("Your account does not have admin privileges. Please contact the system administrator.", "error");
          console.error("Auth: User", currentUser.uid, "does not have admin claim. Claims:", tokenResult.claims);
          return null;
        }

        // Auth verified — proceed with save
        return performProductSave(name, category, description);
      })
      .catch(function (err) {
        console.error("Auth verification failed:", err);
        showToast("Could not verify admin permissions. Please sign out and sign back in, then try again.", "error");
      });
  }

  function performProductSave(name, category, description) {
    var featuresStr = $("pf-features").value.trim();
    var features = featuresStr ? featuresStr.split(",").map(function (f) { return f.trim(); }).filter(Boolean) : [];

    var imageUrl = $("pf-image-url").value.trim() || selectedImageUrl || "";

    var productData = {
      name: name,
      category: category,
      sku: $("pf-sku").value.trim(),
      description: description,
      price: $("pf-price").value ? Number($("pf-price").value) : null,
      discountPrice: $("pf-discount-price").value ? Number($("pf-discount-price").value) : null,
      packSize: $("pf-pack-size").value.trim() || "Standard",
      features: features,
      available: $("pf-available").checked,
      image: imageUrl,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    showLoading(editingProductId ? "Updating product..." : "Saving product...");

    var savePromise;
    if (editingProductId) {
      savePromise = db.collection("products").doc(editingProductId).update(productData);
    } else {
      productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      savePromise = db.collection("products").add(productData);
    }

    return savePromise
      .then(function () {
        hideLoading();
        closeProductModal();
        showToast(editingProductId ? "Product updated successfully" : "Product added successfully", "success");
        return loadProducts();
      })
      .then(function () {
        renderProductsTable();
        renderDashboard();
      })
      .catch(function (err) {
        hideLoading();
        // Detailed error logging for debugging
        console.error("=== PRODUCT SAVE FAILED ===");
        console.error("Error code:", err.code || "N/A");
        console.error("Error message:", err.message || err);
        console.error("User UID:", currentUser ? currentUser.uid : "NOT LOGGED IN");
        console.error("User email:", currentUser ? currentUser.email : "N/A");
        console.error("Editing product ID:", editingProductId || "(new product)");
        console.error("Firestore project:", firebaseConfig.projectId);

        // User-friendly message based on error type
        var userMsg = "Unable to save product. ";
        if (err.code === "permission-denied") {
          userMsg += "Permission denied. ";
          if (!currentUser) {
            userMsg += "You are not logged in. Please sign in as administrator.";
          } else {
            userMsg += "Your account may not have the required admin permissions. " +
              "Please sign out, sign back in, and try again. " +
              "If the problem persists, contact the system administrator to verify your admin access.";
          }
        } else if (err.code === "unauthenticated") {
          userMsg += "You are not authenticated. Please sign in again.";
        } else if (err.code === "unavailable") {
          userMsg += "Firestore is temporarily unavailable. Please try again in a moment.";
        } else {
          userMsg += "An unexpected error occurred. Check the browser console for details.";
        }
        showToast(userMsg, "error");
      });
  }

  function editProduct(productId) {
    openProductModal(productId);
  }

  function confirmDeleteProduct(productId, productName) {
    $("confirm-modal-title").textContent = "Delete Product";
    $("confirm-text").textContent = "Delete \"" + productName + "\"?";
    $("confirm-subtext").textContent = "This will permanently remove the product. This action cannot be undone.";
    $("confirm-action-btn").textContent = "Delete";
    $("confirm-action-btn").className = "btn btn-danger";
    confirmCallback = function () {
      // Verify auth before delete
      if (!currentUser) {
        showToast("Please log in as administrator to delete products.", "error");
        closeConfirmModal();
        return;
      }
      showLoading("Deleting product...");
      db.collection("products").doc(productId).delete()
        .then(function () {
          hideLoading();
          closeConfirmModal();
          showToast("Product deleted", "success");
          return loadProducts();
        })
        .then(function () {
          renderProductsTable();
          renderDashboard();
        })
        .catch(function (err) {
          hideLoading();
          console.error("Product delete failed:", err.code, err.message);
          if (err.code === "permission-denied") {
            showToast("Permission denied. Please ensure you are signed in as administrator.", "error");
          } else {
            showToast("Delete failed: " + err.message, "error");
          }
        });
    };
    $("confirm-modal").classList.add("active");
  }

  /* ---------- ORDER OPERATIONS ---------- */
  function updateOrderStatus(orderId, newStatus) {
    if (!currentUser) {
      showToast("Please log in as administrator.", "error");
      renderOrdersTable();
      return;
    }
    db.collection("orders").doc(orderId).update({ status: newStatus })
      .then(function () {
        showToast("Order status updated to " + newStatus, "success");
        var order = allOrders.find(function (o) { return o._id === orderId; });
        if (order) order.status = newStatus;
        renderDashboard();
      })
      .catch(function (err) {
        console.error("Order status update failed:", err.code, err.message);
        showToast("Failed to update status. Please check your admin permissions.", "error");
        renderOrdersTable();
      });
  }

  function viewOrder(orderId) {
    var order = allOrders.find(function (o) { return o._id === orderId; });
    if (!order) return;

    var date = order.createdAt ? new Date(order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleString("en-IN") : "N/A";
    var shortId = order._id ? order._id.substring(0, 8).toUpperCase() : "N/A";

    var itemsHtml = (order.items || []).map(function (item, idx) {
      var subtotal = item.price ? "\u20B9" + (item.price * item.qty).toLocaleString("en-IN") : "-";
      return '<tr>' +
        '<td>' + (idx + 1) + '</td>' +
        '<td>' + escHtml(item.name) + '</td>' +
        '<td>' + (item.sku || "-") + '</td>' +
        '<td>' + item.qty + '</td>' +
        '<td>' + (item.price ? "\u20B9" + item.price.toLocaleString("en-IN") : "-") + '</td>' +
        '<td>' + subtotal + '</td>' +
      '</tr>';
    }).join("");

    var html = '<div style="margin-bottom:20px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<h3 style="font-size:1rem;font-weight:700">Order #' + shortId + '</h3>' +
        '<span class="badge ' + getStatusBadgeClass(order.status) + '">' + escHtml(order.status || "Pending") + '</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.9rem">' +
        '<div><strong>Customer:</strong> ' + escHtml(order.customerName || "N/A") + '</div>' +
        '<div><strong>Phone:</strong> ' + escHtml(order.phone || "N/A") + '</div>' +
        '<div><strong>Business:</strong> ' + escHtml(order.clinic || "N/A") + '</div>' +
        '<div><strong>WhatsApp:</strong> ' + escHtml(order.whatsapp || "N/A") + '</div>' +
        '<div style="grid-column:1/-1"><strong>Address:</strong> ' + escHtml(order.address || "") + (order.city ? ", " + escHtml(order.city) : "") + (order.state ? ", " + escHtml(order.state) : "") + (order.pincode ? " - " + escHtml(order.pincode) : "") + '</div>' +
      '</div>' +
    '</div>';

    if (order.items && order.items.length > 0) {
      html += '<div style="margin-bottom:16px">' +
        '<h4 style="font-size:.9rem;font-weight:700;margin-bottom:8px">Items</h4>' +
        '<table class="admin-table" style="font-size:.85rem">' +
          '<thead><tr><th>#</th><th>Product</th><th>SKU</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>' +
          '<tbody>' + itemsHtml + '</tbody>' +
        '</table>' +
      '</div>';
    }

    if (order.notes) {
      html += '<div style="margin-bottom:16px"><strong>Notes:</strong> ' + escHtml(order.notes) + '</div>';
    }

    html += '<div style="font-size:.85rem;color:var(--admin-text-muted)">Order Date: ' + date + '</div>';

    $("order-detail-content").innerHTML = html;
    $("order-detail-modal").classList.add("active");
  }

  function confirmDeleteOrder(orderId) {
    $("confirm-modal-title").textContent = "Delete Order";
    $("confirm-text").textContent = "Delete this order?";
    $("confirm-subtext").textContent = "This will permanently remove the order record. This action cannot be undone.";
    $("confirm-action-btn").textContent = "Delete Order";
    $("confirm-action-btn").className = "btn btn-danger";
    confirmCallback = function () {
      if (!currentUser) {
        showToast("Please log in as administrator.", "error");
        closeConfirmModal();
        return;
      }
      showLoading("Deleting order...");
      db.collection("orders").doc(orderId).delete()
        .then(function () {
          hideLoading();
          closeConfirmModal();
          showToast("Order deleted", "success");
          return loadOrders();
        })
        .then(function () {
          renderOrdersTable();
          renderDashboard();
        })
        .catch(function (err) {
          hideLoading();
          console.error("Order delete failed:", err.code, err.message);
          showToast("Delete failed. Please check your admin permissions.", "error");
        });
    };
    $("confirm-modal").classList.add("active");
  }

  /* ---------- CONFIRM MODAL ---------- */
  function closeConfirmModal() {
    $("confirm-modal").classList.remove("active");
    confirmCallback = null;
  }

  function executeConfirm() {
    if (typeof confirmCallback === "function") {
      confirmCallback();
    }
  }

  /* ---------- CATEGORY FILTERS ---------- */
  function populateCategoryFilters() {
    var catFilter = $("product-category-filter");
    catFilter.innerHTML = '<option value="all">All Categories</option>';
    CATEGORIES.forEach(function (c) {
      catFilter.innerHTML += '<option value="' + escAttr(c) + '">' + escHtml(c) + '</option>';
    });
  }

  /* ---------- SECTION SWITCHING ---------- */
  function switchSection(section) {
    currentPage = section;
    qsa(".admin-section").forEach(function (el) { el.style.display = "none"; });
    qsa(".sidebar-nav-item").forEach(function (el) { el.classList.remove("active"); });

    var sectionEl = $("section-" + section);
    if (sectionEl) sectionEl.style.display = "";

    var navItem = document.querySelector('.sidebar-nav-item[data-section="' + section + '"]');
    if (navItem) navItem.classList.add("active");

    var titles = { dashboard: "Dashboard", products: "Product Management", orders: "Order Management" };
    $("topbar-title").textContent = titles[section] || "Dashboard";

    // Close mobile sidebar
    $("sidebar").classList.remove("open");
    $("sidebar-overlay").classList.remove("active");
  }

  /* ---------- SIDEBAR MOBILE ---------- */
  function toggleMobileSidebar() {
    $("sidebar").classList.toggle("open");
    $("sidebar-overlay").classList.toggle("active");
  }

  /* ---------- HELPERS ---------- */
  function escHtml(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escAttr(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case "Pending": return "badge-warning";
      case "Confirmed": return "badge-info";
      case "Processing": return "badge-purple";
      case "Shipped": return "badge-info";
      case "Delivered": return "badge-success";
      case "Cancelled": return "badge-danger";
      default: return "badge-warning";
    }
  }

  function clearFormErrors() {
    qsa(".form-group.has-error").forEach(function (el) { el.classList.remove("has-error"); });
  }

  /* ---------- PUBLIC API ---------- */
  window.App = {
    switchSection: switchSection,
    openProductModal: openProductModal,
    closeProductModal: closeProductModal,
    saveProduct: saveProduct,
    editProduct: editProduct,
    confirmDeleteProduct: confirmDeleteProduct,
    removeImage: removeImage,
    updateOrderStatus: updateOrderStatus,
    viewOrder: viewOrder,
    confirmDeleteOrder: confirmDeleteOrder,
    closeConfirmModal: closeConfirmModal
  };

  /* ---------- INIT ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    // Auth
    $("login-form").addEventListener("submit", handleLogin);
    $("logout-btn").addEventListener("click", handleLogout);
    $("forgot-password-link").addEventListener("click", function (e) {
      e.preventDefault();
      handleForgotPassword();
    });

    // Sidebar navigation
    qsa(".sidebar-nav-item[data-section]").forEach(function (item) {
      item.addEventListener("click", function () {
        switchSection(this.getAttribute("data-section"));
      });
    });

    // Mobile menu
    $("mobile-menu-btn").addEventListener("click", toggleMobileSidebar);
    $("sidebar-overlay").addEventListener("click", toggleMobileSidebar);

    // Product filters
    $("product-search").addEventListener("input", function () { productPage = 1; renderProductsTable(); });
    $("product-category-filter").addEventListener("change", function () { productPage = 1; renderProductsTable(); });
    $("product-status-filter").addEventListener("change", function () { productPage = 1; renderProductsTable(); });

    // Order filters
    $("order-search").addEventListener("input", function () { orderPage = 1; renderOrdersTable(); });
    $("order-status-filter").addEventListener("change", function () { orderPage = 1; renderOrdersTable(); });
    $("order-date-filter").addEventListener("change", function () { orderPage = 1; renderOrdersTable(); });

    // Image URL preview
    $("pf-image-url").addEventListener("input", function () {
      var url = $("pf-image-url").value.trim();
      if (url) {
        selectedImageUrl = url;
        $("image-preview").src = url;
        $("image-preview-container").style.display = "inline-block";
      } else {
        selectedImageUrl = null;
        $("image-preview").src = "";
        $("image-preview-container").style.display = "none";
      }
    });

    // Confirm modal
    $("confirm-action-btn").addEventListener("click", executeConfirm);

    // Refresh permissions button
    $("refresh-permissions-btn").addEventListener("click", function () {
      if (!currentUser) {
        showToast("Not signed in.", "error");
        return;
      }
      showToast("Refreshing permissions...", "info");
      currentUser.getIdTokenResult(true)
        .then(function (tokenResult) {
          if (tokenResult.claims.admin) {
            showToast("Admin permissions verified. You have full access.", "success");
          } else {
            showToast("Your account does not have admin privileges. Run: node scripts/setup-admin.js set-claim " + currentUser.uid, "error");
          }
        })
        .catch(function (err) {
          console.error("Token refresh failed:", err);
          showToast("Failed to refresh permissions. Please sign out and sign back in.", "error");
        });
    });

    // Close modals on overlay click
    $("product-modal").addEventListener("click", function (e) { if (e.target === this) closeProductModal(); });
    $("confirm-modal").addEventListener("click", function (e) { if (e.target === this) closeConfirmModal(); });
    $("order-detail-modal").addEventListener("click", function (e) { if (e.target === this) this.classList.remove("active"); });

    // Initialize auth
    initAuth();
  });

})();
