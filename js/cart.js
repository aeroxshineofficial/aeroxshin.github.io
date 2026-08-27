document.addEventListener("DOMContentLoaded", function () {
  renderCart();
});

function renderCart() {
  var container = document.getElementById("cart-content");
  var cart = getCart();

  if (cart.length === 0) {
    container.innerHTML =
      '<div class="cart-empty">' +
        '<h2>Your order cart is empty</h2>' +
        '<p>Browse our products and add items to your order.</p>' +
        '<a href="products.html" class="btn btn-primary">Browse Products</a>' +
      '</div>';
    return;
  }

  var totalQty = 0;
  var totalPrice = 0;
  var hasPrice = false;
  var itemsHtml = "";

  cart.forEach(function (item) {
    var product = getProductById(item.id);
    if (!product) return;
    var subtotal = product.price ? product.price * item.qty : null;
    if (subtotal) { totalPrice += subtotal; hasPrice = true; }
    totalQty += item.qty;

    itemsHtml +=
      '<div class="cart-item" id="cart-item-' + product.id + '">' +
        '<div class="cart-item-image">' +
          '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.style.display=\'none\'">' +
        '</div>' +
        '<div class="cart-item-details">' +
          '<div class="cart-item-name">' + product.name + '</div>' +
          '<div class="cart-item-meta">' + product.packSize + (product.price ? ' &middot; ' + formatPrice(product.price) + ' each' : '') + '</div>' +
          '<div class="cart-item-actions">' +
            '<div class="quantity-control">' +
              '<button type="button" onclick="updateCartItem(' + product.id + ',-1)" aria-label="Decrease quantity">-</button>' +
              '<input type="number" value="' + item.qty + '" min="1" max="999" onchange="setCartItemQty(' + product.id + ',this.value)" aria-label="Quantity">' +
              '<button type="button" onclick="updateCartItem(' + product.id + ',1)" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button class="cart-item-remove" onclick="removeCartItem(' + product.id + ')">Remove</button>' +
            (subtotal ? '<span class="cart-item-subtotal">' + formatPrice(subtotal) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
  });

  container.innerHTML =
    '<div class="cart-items">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
        '<h2 style="font-size:1.2rem;font-weight:700">Your Order Items</h2>' +
        '<button class="btn btn-sm btn-outline" onclick="clearCartAndReload()" style="color:var(--danger);border-color:var(--danger)">Clear All</button>' +
      '</div>' +
      itemsHtml +
    '</div>' +
    '<div class="cart-summary">' +
      '<h2>Order Summary</h2>' +
      '<div class="cart-summary-row"><span>Total Items</span><span>' + totalQty + '</span></div>' +
      (hasPrice ? '<div class="cart-summary-row total"><span>Estimated Total</span><span>' + formatPrice(totalPrice) + '</span></div>' : '') +
      '<div class="cart-summary-actions">' +
        '<a href="products.html" class="btn btn-outline">Continue Shopping</a>' +
      '</div>' +
    '</div>' +
    '<div class="customer-form" id="customer-form">' +
      '<h2>Customer Details</h2>' +
      '<form id="order-form" onsubmit="return false;">' +
        '<div class="form-grid">' +
          '<div class="form-row-2">' +
            '<div class="form-group" id="fg-name">' +
              '<label for="c-name">Full Name *</label>' +
              '<input type="text" id="c-name" placeholder="Your full name">' +
              '<div class="error-msg">Please enter your full name</div>' +
            '</div>' +
            '<div class="form-group" id="fg-clinic">' +
              '<label for="c-clinic">Clinic / Hospital / Business Name *</label>' +
              '<input type="text" id="c-clinic" placeholder="Business name">' +
              '<div class="error-msg">Please enter your business name</div>' +
            '</div>' +
          '</div>' +
          '<div class="form-row-2">' +
            '<div class="form-group" id="fg-mobile">' +
              '<label for="c-mobile">Mobile Number *</label>' +
              '<input type="tel" id="c-mobile" placeholder="98XXXXXXXX">' +
              '<div class="error-msg">Please enter your mobile number</div>' +
            '</div>' +
            '<div class="form-group" id="fg-whatsapp">' +
              '<label for="c-whatsapp">WhatsApp Number</label>' +
              '<input type="tel" id="c-whatsapp" placeholder="98XXXXXXXX (if different from mobile)">' +
            '</div>' +
          '</div>' +
          '<div class="form-group" id="fg-address">' +
            '<label for="c-address">Full Address *</label>' +
            '<input type="text" id="c-address" placeholder="Street address, locality">' +
            '<div class="error-msg">Please enter your address</div>' +
          '</div>' +
          '<div class="form-row-2">' +
            '<div class="form-group" id="fg-city">' +
              '<label for="c-city">City *</label>' +
              '<input type="text" id="c-city" placeholder="Patna">' +
              '<div class="error-msg">Please enter your city</div>' +
            '</div>' +
            '<div class="form-group" id="fg-state">' +
              '<label for="c-state">State</label>' +
              '<input type="text" id="c-state" placeholder="Bihar">' +
            '</div>' +
          '</div>' +
          '<div class="form-group" id="fg-pincode">' +
            '<label for="c-pincode">Pincode *</label>' +
            '<input type="text" id="c-pincode" placeholder="800001" maxlength="6">' +
            '<div class="error-msg">Please enter your pincode</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="c-notes">Additional Notes</label>' +
            '<textarea id="c-notes" placeholder="Any special requirements or delivery instructions..."></textarea>' +
          '</div>' +
        '</div>' +
      '</form>' +
    '</div>' +
    '<div class="whatsapp-order-btn">' +
      '<button class="btn btn-whatsapp btn-block" style="padding:16px;font-size:1.05rem" onclick="sendWhatsAppOrder()">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>' +
        'Send Order on WhatsApp' +
      '</button>' +
      '<p style="text-align:center;margin-top:12px;font-size:.85rem;color:var(--text-muted)">Your order details will be sent via WhatsApp. You can review and edit the message before sending.</p>' +
    '</div>';
}

function updateCartItem(productId, delta) {
  var cart = getCart();
  var item = cart.find(function (i) { return i.id === productId; });
  if (item) {
    var newQty = item.qty + delta;
    if (newQty < 1) {
      removeFromCart(productId);
    } else {
      updateCartQty(productId, newQty);
    }
    renderCart();
  }
}

function setCartItemQty(productId, val) {
  var qty = parseInt(val) || 1;
  qty = Math.max(1, qty);
  updateCartQty(productId, qty);
  renderCart();
}

function removeCartItem(productId) {
  removeFromCart(productId);
  renderCart();
  showToast("Product removed from order");
}

function clearCartAndReload() {
  if (confirm("Are you sure you want to clear all items from your order?")) {
    clearCart();
    renderCart();
  }
}

function validateForm() {
  var valid = true;
  var fields = [
    { id: "c-name", group: "fg-name" },
    { id: "c-clinic", group: "fg-clinic" },
    { id: "c-mobile", group: "fg-mobile" },
    { id: "c-address", group: "fg-address" },
    { id: "c-city", group: "fg-city" },
    { id: "c-pincode", group: "fg-pincode" }
  ];

  fields.forEach(function (f) {
    var input = document.getElementById(f.id);
    var group = document.getElementById(f.group);
    if (!input.value.trim()) {
      group.classList.add("has-error");
      valid = false;
    } else {
      group.classList.remove("has-error");
    }
  });

  return valid;
}

function sendWhatsAppOrder() {
  if (!validateForm()) {
    showToast("Please fill in all required fields");
    document.getElementById("customer-form").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  var cart = getCart();
  if (cart.length === 0) {
    showToast("Please add at least one product to your order");
    return;
  }

  var name = document.getElementById("c-name").value.trim();
  var clinic = document.getElementById("c-clinic").value.trim();
  var mobile = document.getElementById("c-mobile").value.trim();
  var whatsapp = document.getElementById("c-whatsapp").value.trim();
  var address = document.getElementById("c-address").value.trim();
  var city = document.getElementById("c-city").value.trim();
  var state = document.getElementById("c-state").value.trim();
  var pincode = document.getElementById("c-pincode").value.trim();
  var notes = document.getElementById("c-notes").value.trim();

  var totalQty = 0;
  var totalPrice = 0;
  var hasPrice = false;
  var productLines = "";

  cart.forEach(function (item, index) {
    var product = getProductById(item.id);
    if (!product) return;
    var subtotal = product.price ? product.price * item.qty : null;
    if (subtotal) { totalPrice += subtotal; hasPrice = true; }
    totalQty += item.qty;

    productLines += (index + 1) + ". " + product.name + "\n";
    productLines += "   Quantity: " + item.qty + "\n";
    productLines += "   Pack Size: " + product.packSize + "\n";
    if (product.price) {
      productLines += "   Price: " + formatPrice(product.price) + "\n";
      productLines += "   Subtotal: " + formatPrice(subtotal) + "\n";
    }
    productLines += "\n";
  });

  var message = "AEROXSHINE - NEW PRODUCT ORDER\n";
  message += "==============================\n\n";
  message += "CUSTOMER DETAILS\n";
  message += "Name: " + name + "\n";
  message += "Clinic / Hospital / Business: " + clinic + "\n";
  message += "Mobile: " + mobile + "\n";
  if (whatsapp) message += "WhatsApp: " + whatsapp + "\n";
  message += "Address: " + address + "\n";
  message += "City: " + city + "\n";
  if (state) message += "State: " + state + "\n";
  message += "Pincode: " + pincode + "\n\n";
  message += "ORDER DETAILS\n";
  message += "-------------\n\n";
  message += productLines;
  message += "Total Quantity: " + totalQty + "\n";
  if (hasPrice) message += "Estimated Total: " + formatPrice(totalPrice) + "\n\n";
  else message += "\n";

  if (notes) {
    message += "Additional Notes:\n" + notes + "\n\n";
  }

  message += "Please confirm product availability, final pricing and delivery details.\n\n";
  message += "Thank you.\n";
  message += siteConfig.brandName + "\n";
  message += siteConfig.positioning;

  var orderItems = cart.map(function(item) {
    var product = getProductById(item.id);
    if (!product) return null;
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku || "",
      qty: item.qty,
      price: product.price || null
    };
  }).filter(Boolean);

  saveOrderToFirestore({
    customerName: name,
    clinic: clinic,
    phone: mobile,
    whatsapp: whatsapp,
    address: address,
    city: city,
    state: state,
    pincode: pincode,
    notes: notes,
    items: orderItems,
    totalQty: totalQty,
    totalAmount: hasPrice ? totalPrice : null
  });

  var waUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  window.open(waUrl, "_blank", "noopener,noreferrer");
}
