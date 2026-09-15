document.addEventListener("DOMContentLoaded", async () => {

    const form =
        document.getElementById("profileForm");

    const message =
        document.getElementById("message");


    // ==========================================
    // GET LOGGED-IN USER
    // ==========================================

    const userName =
        localStorage.getItem("userName");

    const userEmail =
        localStorage.getItem("userEmail");


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!userEmail) {

        message.innerText =
            "Please login first.";

        return;
    }


    // ==========================================
    // SHOW LOGIN DATA
    // ==========================================

    document.getElementById("name").value =
        userName || "";

    document.getElementById("email").value =
        userEmail;


    // ==========================================
    // LOAD EXISTING PROFILE
    // ==========================================

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/profile?email=" +
                encodeURIComponent(userEmail)
            );


        if (response.ok) {

            const profile =
                await response.json();


            document.getElementById("name").value =
                profile.name || userName || "";


            document.getElementById("email").value =
                profile.email || userEmail;


            document.getElementById("phone").value =
                profile.phone || "";


            document.getElementById("skills").value =
                profile.skills || "";


            document.getElementById("experience").value =
                profile.experience || "";


            document.getElementById("location").value =
                profile.location || "";

        }


    } catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );

    }


    // ==========================================
    // SAVE PROFILE
    // ==========================================

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const profileData = {

                name:
                    document.getElementById("name")
                        .value.trim(),

                email:
                    document.getElementById("email")
                        .value.trim(),

                phone:
                    document.getElementById("phone")
                        .value.trim(),

                skills:
                    document.getElementById("skills")
                        .value.trim(),

                experience:
                    document.getElementById("experience")
                        .value.trim(),

                location:
                    document.getElementById("location")
                        .value.trim()

            };


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/profile",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    profileData
                                )
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    message.innerText =
                        "Profile saved successfully!";

                } else {

                    message.innerText =
                        data.message ||
                        "Failed to save profile";

                }


            } catch (error) {

                console.error(
                    "SAVE PROFILE ERROR:",
                    error
                );


                message.innerText =
                    "Cannot connect to server.";

            }

        }
    );

});