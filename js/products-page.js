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

  function buildSizeSelector(p) {
    if (!p.sizes || p.sizes.length === 0) return "";
    var html = '<div class="size-selector" onclick="event.preventDefault();event.stopPropagation()">';
    p.sizes.forEach(function(s, i) {
      html += '<button type="button" class="size-option' + (i === 0 ? ' active' : '') + '" data-size="' + s + '" onclick="event.preventDefault();event.stopPropagation();selectSize(this)">' + s + '</button>';
    });
    html += '</div>';
    return html;
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
        var limitedFeatures = (p.features || []).slice(0, 3);
        var card = document.createElement("a");
        card.href = "product.html?id=" + p.id;
        card.className = "showcase-card";
        card.innerHTML =
          '<div class="showcase-card-inner">' +
            '<div class="showcase-card-image">' +
              '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" onerror="this.style.display=\'none\'">' +
            '</div>' +
            '<div class="showcase-card-content">' +
              '<span class="showcase-card-category">' + p.category + '</span>' +
              '<h3 class="showcase-card-name">' + p.name + '</h3>' +
              '<p class="showcase-card-desc">' + p.description + '</p>' +
              '<div class="showcase-card-features">' +
                limitedFeatures.map(function(f) { return '<span class="feature-chip">' + f + '</span>'; }).join('') +
              '</div>' +
              buildSizeSelector(p) +
              '<div class="showcase-card-actions">' +
                (p.available ?
                  '<div class="quantity-control-modern" onclick="event.preventDefault()">' +
                    '<button type="button" onclick="event.preventDefault();changeQty(this,-1)" aria-label="Decrease quantity">-</button>' +
                    '<input type="number" value="1" min="1" max="999" aria-label="Quantity" onclick="event.preventDefault()">' +
                    '<button type="button" onclick="event.preventDefault();changeQty(this,1)" aria-label="Increase quantity">+</button>' +
                  '</div>' +
                  '<button class="btn btn-primary btn-sm btn-add-cart" onclick="event.preventDefault();addProductToCart(' + p.id + ',this)">Add to Order</button>'
                  :
                  '<button class="btn btn-sm btn-outline" disabled style="opacity:.5;flex:1" onclick="event.preventDefault()">Out of Stock</button>'
                ) +
              '</div>' +
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

function selectSize(btn) {
  var container = btn.closest('.size-selector');
  container.querySelectorAll('.size-option').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function changeQty(btn, delta) {
  var input = btn.parentElement.querySelector("input");
  var val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(999, val + delta));
  input.value = val;
}

function addProductToCart(productId, btn) {
  var container = btn.closest(".showcase-card-actions");
  var qty = parseInt(container.querySelector("input").value) || 1;
  var sizeSelector = btn.closest(".showcase-card-inner").querySelector(".size-selector");
  var selectedSize = "";
  if (sizeSelector) {
    var activeBtn = sizeSelector.querySelector(".size-option.active");
    if (activeBtn) selectedSize = activeBtn.getAttribute("data-size");
  }
  addToCart(productId, qty, selectedSize);
}
