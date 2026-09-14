function displayProducts(productList) {
    const container = document.querySelector('.product-grid'); // or getElementById(...)

    if (!container) {
        console.error('Product grid container not found');
        return;
    }

    if (!productList || productList.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }

    container.innerHTML = productList.map(product => `
        <div class="product-card">
            <div class="product-image">
                📦
            </div>

            <h3>${escapeHtml(product.name)}</h3>

            <p>${escapeHtml(product.description || "No description")}</p>

            <div class="product-meta">
                <span class="badge">${escapeHtml(product.category)}</span>
                <span class="price">₹${product.price}</span>
            </div>

            <div class="product-actions">
                <button class="primary-btn" onclick="viewProduct(${product.id})">
                    View
                </button>
            </div>
        </div>
    `).join('');
}