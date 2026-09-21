const form = document.getElementById("loginForm");


form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("https://kaamnearby.onrender.com/api/login", {

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

            if (response.ok) {

    console.log("LOGIN DATA:", data);

    localStorage.setItem("userName", data.name);
    localStorage.setItem("userEmail", data.email);
    localStorage.setItem("userRole", data.role);

    alert(
        "Login data saved!\nName: " +
        data.name +
        "\nEmail: " +
        data.email +
        "\nRole: " +
        data.role
    );

            // Check user role
           if (data.role === "jobseeker") {
    window.location.href = "jobseeker.html";

} else if (data.role === "employer") {
    window.location.href = "employer.html";

} else if (data.role === "admin") {
    window.location.href = "admin.html";
}

        } else {

            document.getElementById("message").innerText =
                data.message;

        }

    } catch (error) {

        console.log(error);

        document.getElementById("message").innerText =
            "Backend connection failed.";

    }

});
