const form = document.getElementById("registerForm");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {

        const response = await fetch("https://kaamnearby.onrender.com/api/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: role
            })
        });

        const data = await response.json();

        document.getElementById("message").innerText = data.message;

    } catch (error) {

        console.log(error);

        document.getElementById("message").innerText =
            "Backend connection failed.";

    }

});