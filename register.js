const form = document.getElementById("registerForm");


// =====================================
// GET / CREATE DEVICE ID
// =====================================

function getDeviceId() {

    let deviceId = localStorage.getItem("kaamNearbyDeviceId");

    if (!deviceId) {

        deviceId =
            "device-" +
            crypto.randomUUID();

        localStorage.setItem(
            "kaamNearbyDeviceId",
            deviceId
        );
    }

    return deviceId;
}


// =====================================
// REGISTER
// =====================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const role =
        document.getElementById("role").value;


    // Get device ID
    const deviceId = getDeviceId();


    try {

        const response = await fetch(
            "https://kaamnearby.onrender.com/api/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    email: email,

                    password: password,

                    role: role,

                    deviceId: deviceId

                })
            }
        );


        const data = await response.json();


        if (response.ok) {

            alert(
                "Registration successful! Please login."
            );

            window.location.href =
                "login.html";

        } else {

            document.getElementById("message").innerText =
                data.message ||
                "Registration failed.";

        }


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        document.getElementById("message").innerText =
            "Backend connection failed.";

    }

});
