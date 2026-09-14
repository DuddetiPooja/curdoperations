const cartContainer = document.getElementById("cart-container");
const cartSummary = document.getElementById("cart-summary");

function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function displayCart() {
    const cart = getCart();

    if (!cart.length) {
        cartContainer.innerHTML = `
            <div class="empty">
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart.</p>
                <br>
                <a href="/products.html" class="primary-btn">
                    Continue Shopping
                </a>
            </div>
        `;

        cartSummary.innerHTML = "";
        updateCartCount();
        return;
    }

    cartContainer.innerHTML = cart.map((product, index) => `
        <div class="product-card">

            <div>
                <div class="product-image">
                    🛍️
                </div>

                <h3>${escapeHtml(product.name)}</h3>

                <p>
                    ${escapeHtml(
                        product.description || "No description"
                    )}
                </p>

                <div class="product-meta">

                    <span class="badge">
                        ${escapeHtml(product.category)}
                    </span>

                    <span class="price">
                        ₹${Number(product.price).toFixed(2)}
                    </span>

                </div>
            </div>

            <div class="product-actions">

                <button
                    class="outline-btn"
                    onclick="removeFromCart(${index})">
                    Remove
                </button>

            </div>

        </div>
    `).join("");

    calculateTotal(cart);
    updateCartCount();
}

function calculateTotal(cart) {
    const total = cart.reduce(
        (sum, product) =>
            sum + Number(product.price || 0),
        0
    );

    cartSummary.innerHTML = `
        <div class="stat-card">

            <span>Total Items</span>

            <strong>
                ${cart.length}
            </strong>

        </div>

        <div class="stat-card">

            <span>Total Price</span>

            <strong>
                ₹${total.toFixed(2)}
            </strong>

        </div>

        <button
            class="primary-btn"
            onclick="checkout()">
            Proceed to Checkout
        </button>
    `;
}

function removeFromCart(index) {
    const cart = getCart();

    cart.splice(index, 1);

    saveCart(cart);

    displayCart();
}

function checkout() {
    const cart = getCart();

    if (!cart.length) {
        alert("Your cart is empty.");
        return;
    }

    alert("Checkout feature will be added soon.");
}

function updateCartCount() {
    const cart = getCart();

    const cartCount =
        document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

displayCart();
updateCartCount();