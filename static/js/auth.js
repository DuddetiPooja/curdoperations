const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed");
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));

            alert("Login successful!");

            window.location.href = "/products.html";

        } catch (error) {
            console.error(error);
            alert("Unable to connect to server.");
        }
    });
}


if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username =
            document.getElementById("register-username").value.trim();

        const email =
            document.getElementById("register-email").value.trim();

        const password =
            document.getElementById("register-password").value;

        const confirmPassword =
            document.getElementById("register-confirm-password").value;


        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }


        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Registration failed");
                return;
            }

            alert("Registration successful!");

            window.location.href = "/login.html";

        } catch (error) {
            console.error(error);
            alert("Unable to connect to server.");
        }
    });
}