
const AVAILABLE_SIZES = ["38", "39", "40", "41", "42", "43"];
const ITEMS_PER_PAGE = 8;

let currentProducts = [];
let filteredProducts = [];
let currentContainerId = null;
let currentContainerElement = null;
let currentSearchQuery = "";
let pendingCartProduct = null;

document.addEventListener("DOMContentLoaded", () => {
  ensureSizePickerModal();
  fetchProductsForCurrentPage();
});

async function fetchProductsForCurrentPage() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error("Failed to fetch products");

    const products = await response.json();

    const bestsellerGrid = document.getElementById("bestsellerGrid");
    if (bestsellerGrid) {
      const bestsellItems = products.filter(p => {
        const t = (p.tag || "").toLowerCase();
        return t.includes('bestseller') || t.includes('best seller');
      }).reverse();
      setupProductListing(bestsellerGrid, bestsellItems);
      return;
    }

    const trendingGrid = document.getElementById("trendingGrid");
    if (trendingGrid) {
      const trendingItems = products.filter(p => (p.tag || "").toLowerCase().includes('trending')).reverse();
      setupProductListing(trendingGrid, trendingItems);
      return;
    }

    const exclusiveGrid = document.getElementById("exclusiveGrid");
    if (exclusiveGrid) {
      const exclusiveItems = products.filter(p => {
        const t = (p.tag || "").toLowerCase();
        return t.includes('độc quyền') || t.includes('exclusive');
      }).reverse();
      setupProductListing(exclusiveGrid, exclusiveItems);
      return;
    }

    const searchGrid = document.getElementById("searchGrid");
    if (searchGrid) {
      setupProductListing(searchGrid, products.slice().reverse());
      return;
    }

    const saleGrid = document.getElementById("saleGrid");
    if (saleGrid) {
      const saleItems = products.filter(p => (p.tag || "").toLowerCase().includes('sale')).reverse();
      setupProductListing(saleGrid, saleItems);
      return;
    }

    const categoryGrid = document.getElementById("categoryGrid");
    if (categoryGrid) {
      const brand = categoryGrid.getAttribute("data-brand");
      const type = categoryGrid.getAttribute("data-type");

      let listing = products;

      if (brand) {
        listing = products.filter((product) => {
          const b = (product.brand || "").toLowerCase();
          const c = (product.category || "").toLowerCase();
          const target = brand.toLowerCase();
          return b === target || c === target;
        });
      } else if (type) {
        listing = products.filter((product) => {
          const cat = (product.category || "").toLowerCase();
          const name = normalizeSearchText(product.name || "");

          // 1. Ưu tiên kiểm tra theo danh mục đã chọn trong Admin
          if (type === "sport" && cat === "bóng đá") return true;
          if (type === "running" && cat === "chạy bộ") return true;
          if (type === "casual" && cat === "casual") return true;

          // 2. Dự phòng bằng từ khóa trong tên (giữ lại logic cũ)
          const isSport = /bong da|cau long|pickleball|tennis|tf|club|academy|predator|f50|phantom|mercurial|alpha|morelia|gate sky|wave claw|wave fang|wave drive|wave medal|wave dimension|sky blaster|dribble|vapor lite|hyperwarp/.test(name);
          const isRunning = /chay bo|run|nitro|pureboost|galaxy|duramo|ultrarun|response|speed|deviate|velocity|darter|reflect lite|fast|vomero|quest|downshifter|revolution|metcon|invincible|wave mujin/.test(name);

          if (type === "sport") return isSport && !isRunning;
          if (type === "running") return isRunning;
          if (type === "casual") return !isSport && !isRunning;
          return true;
        });
      }

      setupProductListing(categoryGrid, listing);
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
  }
}

function setupProductListing(container, productsSet) {
  currentProducts = Array.isArray(productsSet) ? productsSet.slice() : [];
  filteredProducts = currentProducts.slice();
  currentContainerId = container.id;
  currentContainerElement = container;
  currentSearchQuery = "";

  const query = new URLSearchParams(window.location.search).get("q");
  if (query) {
    performSearch(query);
    return;
  }

  renderProductCards(container, filteredProducts, 1);
}

function normalizeSearchText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasFourCharConsecutiveMatch(candidateWord, queryWord) {
  if (!candidateWord || !queryWord) return false;
  if (queryWord.length < 4) return false;

  for (let i = 0; i <= queryWord.length - 4; i++) {
    const chunk = queryWord.slice(i, i + 4);
    if (candidateWord.includes(chunk)) {
      return true;
    }
  }

  return false;
}

function strictIncludes(candidate, query) {
  const normalizedCandidate = normalizeSearchText(candidate);
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) return true;
  if (!normalizedCandidate) return false;
  if (normalizedQuery.length >= 4 && normalizedCandidate.includes(normalizedQuery)) return true;

  const candidateWords = normalizedCandidate.split(" ").filter(Boolean);
  const queryWords = normalizedQuery.split(" ").filter(Boolean);

  return queryWords.every((queryWord) => {
    if (queryWord.length < 4) return false;

    return candidateWords.some((candidateWord) => {
      return hasFourCharConsecutiveMatch(candidateWord, queryWord);
    });
  });
}

function productMatchesSearch(product, query) {
  const searchableText = [
    product.name,
    product.category,
    product.description
  ]
    .filter(Boolean)
    .join(" ");

  return strictIncludes(searchableText, query);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateListingHeading() {
  const searchTitle = document.getElementById("searchTitle");
  const searchSummary = document.getElementById("searchSummary");
  if (!searchTitle && !searchSummary) return;

  if (searchTitle) {
    searchTitle.textContent = currentSearchQuery
      ? `Kết quả tìm kiếm cho "${currentSearchQuery}"`
      : "Tất cả sản phẩm";
  }
  // Fix đoạn tìm kiếm summary để hiển thị số lượng sản phẩm tìm được hoặc thông báo không tìm thấy nếu có truy vấn nhưng không có kết quả nào
  if (searchSummary) {
    if (currentSearchQuery && normalizeSearchText(currentSearchQuery).length < 5) {
      searchSummary.textContent = "";
      return;
    }

    if (currentSearchQuery && filteredProducts.length === 0) {
      searchSummary.textContent = `Không tìm thấy sản phẩm nào cho từ khóa "${currentSearchQuery}".`;
      return;
    }

    searchSummary.textContent = currentSearchQuery
      ? `Tìm thấy ${filteredProducts.length} sản phẩm gần đúng với từ khóa.`
      : `Hiển thị ${filteredProducts.length} sản phẩm.`;
  }
}

function renderProductCards(container, productsSet, page = 1) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const itemsToShow = productsSet.slice(start, end);

  if (!itemsToShow.length) {
    container.innerHTML =
      '<p class="col-span-full text-center text-gray-500 py-10">Không tìm thấy sản phẩm.</p>';
    renderPagination(container, 0, 1);
    updateListingHeading();
    return;
  }

  let html = "";

  itemsToShow.forEach((product) => {
    const priceFmt = product.price
      ? Number(product.price).toLocaleString("vi-VN") + " đ"
      : "Liên hệ";
    const image = product.image || "https://via.placeholder.com/300x300";
    const orderUrl = `order.html?name=${encodeURIComponent(product.name)}&price=${encodeURIComponent(
      product.price
    )}&image=${encodeURIComponent(image)}`;
    const safeName = escapeHtml(product.name || "");
    const safeBrand = escapeHtml(product.brand || "Brand");
    const safeImage = escapeHtml(image);
    const safeOrderUrl = escapeHtml(orderUrl);

    html += `
      <div class="js-product-card bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group cursor-pointer" data-order-url="${safeOrderUrl}">
        <div class="relative overflow-hidden h-64 bg-gray-100 flex items-center justify-center">
          <img src="${safeImage}" alt="${safeName}" class="object-cover w-full h-full group-hover:scale-105 transition duration-500">
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button
              type="button"
              class="js-open-size-picker bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transform translate-y-4 group-hover:translate-y-0 transition"
              data-id="${escapeHtml(product._id || "")}"
              data-name="${safeName}"
              data-price="${Number(product.price) || 0}"
              data-image="${safeImage}"
              data-order-url="${safeOrderUrl}">
              Thêm vào giỏ
            </button>
          </div>
        </div>
        <div class="p-4">
          <p class="text-xs text-blue-500 font-semibold mb-1 uppercase tracking-wider">${safeBrand}</p>
          <h3 class="font-bold text-gray-800 text-lg mb-2 truncate" title="${safeName}">${safeName}</h3>
          
          <div class="flex flex-col">
            ${(currentContainerId === "saleGrid" && product.originalPrice > 0)
        ? `<p class="text-gray-400 line-through text-xs">${Number(product.originalPrice).toLocaleString("vi-VN")} đ</p>`
        : ""
      }
            <p class="text-red-600 font-bold text-lg">${priceFmt}</p>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  bindProductCardInteractions(container);
  renderPagination(container, productsSet.length, page);
  updateListingHeading();
}

function renderPagination(container, totalItems, page) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  let paginationDiv = document.getElementById("dynamic-pagination");
  if (!paginationDiv) {
    paginationDiv = document.createElement("div");
    paginationDiv.id = "dynamic-pagination";
    paginationDiv.className = "w-full flex justify-center gap-2 mt-8 col-span-full";
    container.parentElement.insertBefore(paginationDiv, container.nextSibling);
  }

  if (totalPages <= 1) {
    paginationDiv.innerHTML = "";
    return;
  }

  let html = "";

  const prevClass =
    page > 1
      ? "bg-white border text-blue-600 hover:bg-gray-100 cursor-pointer"
      : "bg-gray-100 border text-gray-400 cursor-not-allowed";
  html += `<button ${page > 1 ? `onclick="window.changePage(${page - 1})"` : "disabled"
    } class="px-4 py-2 rounded font-bold transition ${prevClass}">&larr;</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === page) {
      html += `<button class="px-4 py-2 bg-blue-600 text-white rounded font-bold transition">${i}</button>`;
    } else {
      html += `<button onclick="window.changePage(${i})" class="px-4 py-2 bg-white border text-blue-600 rounded font-bold hover:bg-gray-100 transition">${i}</button>`;
    }
  }

  const nextClass =
    page < totalPages
      ? "bg-white border text-blue-600 hover:bg-gray-100 cursor-pointer"
      : "bg-gray-100 border text-gray-400 cursor-not-allowed";
  html += `<button ${page < totalPages ? `onclick="window.changePage(${page + 1})"` : "disabled"
    } class="px-4 py-2 rounded font-bold transition ${nextClass}">&rarr;</button>`;

  paginationDiv.innerHTML = html;
}

function bindProductCardInteractions(container) {
  container.querySelectorAll(".js-product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const orderUrl = card.dataset.orderUrl;
      if (orderUrl) {
        window.location.href = orderUrl;
      }
    });
  });

  container.querySelectorAll(".js-open-size-picker").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openSizePicker({
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price) || 0,
        image: button.dataset.image || "",
        orderUrl: button.dataset.orderUrl || ""
      });
    });
  });
}

function ensureSizePickerModal() {
  if (document.getElementById("sizePickerModal")) return;

  const modal = document.createElement("div");
  modal.id = "sizePickerModal";
  modal.className = "hidden fixed inset-0 bg-black/50 z-[120] items-center justify-center px-4";
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-gray-900">Chọn size trước khi thêm vào giỏ</h3>
          <p class="text-sm text-gray-500 mt-1" id="sizePickerProductName"></p>
        </div>
        <button type="button" id="closeSizePickerBtn" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>

      <div class="mt-5">
        <p class="text-sm font-medium text-gray-700 mb-3">Size có sẵn</p>
        <div id="sizePickerOptions" class="flex flex-wrap gap-2"></div>
        <p id="sizePickerError" class="text-sm text-red-500 mt-3 hidden">Vui lòng chọn size trước khi thêm vào giỏ hàng.</p>
      </div>

      <div class="mt-6 flex gap-3">
        <button type="button" id="goToDetailBtn" class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Xem chi tiết</button>
        <button type="button" id="confirmSizeBtn" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Thêm vào giỏ</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const optionsContainer = modal.querySelector("#sizePickerOptions");
  AVAILABLE_SIZES.forEach((size) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "js-size-option px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-600";
    button.dataset.size = size;
    button.textContent = size;
    button.addEventListener("click", () => {
      modal.querySelectorAll(".js-size-option").forEach((option) => {
        option.classList.remove("bg-blue-600", "text-white", "border-blue-600");
        option.classList.add("border-gray-300");
      });

      button.classList.remove("border-gray-300");
      button.classList.add("bg-blue-600", "text-white", "border-blue-600");

      if (pendingCartProduct) {
        pendingCartProduct.selectedSize = size;
      }
      modal.querySelector("#sizePickerError").classList.add("hidden");
    });
    optionsContainer.appendChild(button);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeSizePicker();
  });

  modal.querySelector("#closeSizePickerBtn").addEventListener("click", closeSizePicker);
  modal.querySelector("#goToDetailBtn").addEventListener("click", () => {
    if (pendingCartProduct?.orderUrl) {
      window.location.href = pendingCartProduct.orderUrl;
    }
  });
  modal.querySelector("#confirmSizeBtn").addEventListener("click", confirmSizeSelection);
}

function openSizePicker(product) {
  if (!window.authUtils?.requireLogin?.("Xin vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.")) {
    return;
  }

  pendingCartProduct = {
    ...product,
    selectedSize: ""
  };

  const modal = document.getElementById("sizePickerModal");
  modal.querySelector("#sizePickerProductName").textContent = product.name || "";
  modal.querySelector("#sizePickerError").classList.add("hidden");
  modal.querySelectorAll(".js-size-option").forEach((option) => {
    option.classList.remove("bg-blue-600", "text-white", "border-blue-600");
    option.classList.add("border-gray-300");
  });
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeSizePicker() {
  const modal = document.getElementById("sizePickerModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pendingCartProduct = null;
}

function confirmSizeSelection() {
  if (!window.authUtils?.requireLogin?.("Xin vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.")) {
    closeSizePicker();
    return;
  }

  if (!pendingCartProduct?.selectedSize) {
    document.getElementById("sizePickerError")?.classList.remove("hidden");
    return;
  }

  const currentCart = window.cartUtils?.getCartItems?.() || [];
  window.cartUtils?.saveCartItems?.([
    ...currentCart,
    {
      id: pendingCartProduct.id,
      name: pendingCartProduct.name,
      image: pendingCartProduct.image,
      price: pendingCartProduct.price,
      quantity: 1,
      size: pendingCartProduct.selectedSize
    }
  ]);
  window.cartUtils?.updateCartBadge?.();
  alert(`Đã thêm "${pendingCartProduct.name}" size ${pendingCartProduct.selectedSize} vào giỏ hàng!`);
  closeSizePicker();
}

function performSearch(query) {
  const safeQuery = String(query || "").trim();

  if (!currentContainerElement) {
    window.location.href = `search.html?q=${encodeURIComponent(safeQuery)}`;
    return;
  }

  currentSearchQuery = safeQuery;
  filteredProducts = safeQuery
    ? currentProducts.filter((product) => productMatchesSearch(product, safeQuery))
    : currentProducts.slice();

  const searchInput = document.querySelector('.custom-navbar input[type="text"]');
  if (searchInput) {
    searchInput.value = safeQuery;
  }

  renderProductCards(currentContainerElement, filteredProducts, 1);
}

window.changePage = function (page) {
  const container = document.getElementById(currentContainerId);
  if (!container) return;

  renderProductCards(container, filteredProducts, page);
  container.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.productSearch = {
  performSearch
};
