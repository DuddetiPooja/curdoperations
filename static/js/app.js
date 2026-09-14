function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

    const cartCount =
        document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}


function getLoggedInUser() {

    return JSON.parse(
        localStorage.getItem("user") || "null"
    );
}


function logoutUser() {

    localStorage.removeItem("user");

    window.location.href = "/login.html";
}


document.addEventListener("DOMContentLoaded", function () {

    updateCartCount();

});