document.addEventListener("DOMContentLoaded", function () {
  var searchInput = document.getElementById("search-input");
  var categoryFilter = document.getElementById("category-filter");
  var sortFilter = document.getElementById("sort-filter");
  var availabilityFilter = document.getElementById("availability-filter");
  var productGrid = document.getElementById("product-grid");
  var noResults = document.getElementById("no-results");
  var resultsCount = document.getElementById("results-count");

  CATEGORIES.forEach(function (cat) {
    var opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  var params = new URLSearchParams(window.location.search);
  var preselectedCategory = params.get("category");
  if (preselectedCategory && CATEGORIES.indexOf(preselectedCategory) !== -1) {
    categoryFilter.value = preselectedCategory;
  }

  function renderProducts() {
    var query = searchInput.value;
    var category = categoryFilter.value;
    var sortBy = sortFilter.value;
    var avail = availabilityFilter.value;

    var filtered = searchProducts(query);
    if (category && category !== "all") {
      filtered = filtered.filter(function (p) { return p.category === category; });
    }
    filtered = filterAvailable(filtered, avail);
    filtered = sortProducts(filtered, sortBy);

    productGrid.innerHTML = "";
    if (filtered.length === 0) {
      noResults.style.display = "block";
      resultsCount.textContent = "0 products found";
    } else {
      noResults.style.display = "none";
      resultsCount.textContent = filtered.length + " product" + (filtered.length !== 1 ? "s" : "") + " found";
      filtered.forEach(function (p) {
        var card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML =
          '<div class="product-card-image">' +
            '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" onerror="this.style.display=\'none\'">' +
            (p.available ? "" : '<span class="product-card-badge">Out of Stock</span>') +
          '</div>' +
          '<div class="product-card-body">' +
            '<div class="product-card-category">' + p.category + '</div>' +
            '<h3 class="product-card-name">' + p.name + '</h3>' +
            '<div class="product-card-meta">' +
              '<span class="product-card-price">' + formatPrice(p.price) + '</span>' +
              '<span class="product-card-size">' + p.packSize + '</span>' +
            '</div>' +
            '<div class="product-card-availability ' + (p.available ? 'in-stock' : 'out-of-stock') + '">' +
              (p.available ? 'In Stock' : 'Out of Stock') +
            '</div>' +
            '<div class="product-card-actions">' +
              (p.available ?
                '<div class="quantity-control">' +
                  '<button type="button" onclick="changeQty(this,-1)" aria-label="Decrease quantity">-</button>' +
                  '<input type="number" value="1" min="1" max="999" aria-label="Quantity">' +
                  '<button type="button" onclick="changeQty(this,1)" aria-label="Increase quantity">+</button>' +
                '</div>' +
                '<button class="btn btn-primary btn-sm" onclick="addProductToCart(' + p.id + ',this)">Add to Order</button>'
                :
                '<button class="btn btn-sm btn-outline" disabled style="opacity:.5">Out of Stock</button>'
              ) +
              '<a href="product.html?id=' + p.id + '" class="btn btn-sm btn-outline">Details</a>' +
            '</div>' +
          '</div>';
        productGrid.appendChild(card);
      });
    }
  }

  searchInput.addEventListener("input", renderProducts);
  categoryFilter.addEventListener("change", renderProducts);
  sortFilter.addEventListener("change", renderProducts);
  availabilityFilter.addEventListener("change", renderProducts);

  renderProducts();

  document.addEventListener("productsLoaded", function() {
    renderProducts();
  });
});

function changeQty(btn, delta) {
  var input = btn.parentElement.querySelector("input");
  var val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(999, val + delta));
  input.value = val;
}

function addProductToCart(productId, btn) {
  var container = btn.closest(".product-card-actions");
  var qty = parseInt(container.querySelector("input").value) || 1;
  addToCart(productId, qty);
}
