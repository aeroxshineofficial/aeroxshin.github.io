document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var productId = parseInt(params.get("id"));
  var detail = document.getElementById("product-detail");
  var breadcrumbName = document.getElementById("breadcrumb-name");
  var productTitle = document.getElementById("product-title");

  if (!productId) {
    detail.innerHTML = '<div class="no-results"><h3>Product not found</h3><p>Please return to the <a href="products.html" style="color:var(--primary)">products page</a>.</p></div>';
    return;
  }

  var product = getProductById(productId);
  if (!product) {
    detail.innerHTML = '<div class="no-results"><h3>Product not found</h3><p>The product you are looking for does not exist or has been removed.</p><a href="products.html" class="btn btn-primary mt-2">Browse Products</a></div>';
    return;
  }

  document.title = product.name + " - AeroXshine";
  breadcrumbName.textContent = product.name;
  productTitle.textContent = product.name;

  var featuresHtml = "";
  if (product.features && product.features.length > 0) {
    featuresHtml = '<div class="features"><h3>Features</h3>';
    product.features.forEach(function (f) {
      featuresHtml += '<span class="feature-tag">' + f + '</span>';
    });
    featuresHtml += '</div>';
  }

  detail.innerHTML =
    '<div class="product-detail-image">' +
      '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.style.display=\'none\'">' +
    '</div>' +
    '<div class="product-detail-info">' +
      '<div class="category">' + product.category + '</div>' +
      '<h1>' + product.name + '</h1>' +
      '<div class="price">' + formatPrice(product.price) + '</div>' +
      '<div class="pack-size">Pack Size: ' + product.packSize + '</div>' +
      '<div class="availability" style="color:' + (product.available ? 'var(--success)' : 'var(--danger)') + '">' +
        (product.available ? 'In Stock' : 'Out of Stock') +
      '</div>' +
      '<div class="description">' + product.description + '</div>' +
      featuresHtml +
      '<div class="product-detail-add">' +
        (product.available ?
          '<div class="quantity-control">' +
            '<button type="button" onclick="changeDetailQty(-1)" aria-label="Decrease quantity">-</button>' +
            '<input type="number" id="detail-qty" value="1" min="1" max="999" aria-label="Quantity">' +
            '<button type="button" onclick="changeDetailQty(1)" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<button class="btn btn-primary" onclick="addDetailToCart(' + product.id + ')">Add to Order</button>'
          :
          '<button class="btn btn-outline" disabled style="opacity:.5">Out of Stock</button>'
        ) +
        '<a href="cart.html" class="btn btn-outline">View Order</a>' +
      '</div>' +
    '</div>';
});

function changeDetailQty(delta) {
  var input = document.getElementById("detail-qty");
  if (!input) return;
  var val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(999, val + delta));
  input.value = val;
}

function addDetailToCart(productId) {
  var input = document.getElementById("detail-qty");
  var qty = parseInt(input.value) || 1;
  addToCart(productId, qty);
}
