document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // CHECK LOGIN + EMPLOYER ROLE
    // ==============================

    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    // Not logged in
    if (!userEmail) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }

    // Logged in but NOT employer
    if (userRole !== "employer") {

        alert("Only employers can post jobs.");

        window.location.href = "jobseeker.html";

        return;
    }


    // ==============================
    // JOB FORM
    // ==============================

    const form = document.getElementById("jobForm");
    const message = document.getElementById("message");


    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        const jobData = {

            jobTitle:
                document.getElementById("jobTitle").value.trim(),

            shopName:
                document.getElementById("shopName").value.trim(),

            location:
                document.getElementById("location").value.trim(),

            salary:
                document.getElementById("salary").value.trim(),

            workingHours:
                document.getElementById("workingHours").value.trim(),

            description:
                document.getElementById("description").value.trim(),

            employerEmail: userEmail
        };


        try {

            const response = await fetch(
                "https://kaamnearby.onrender.com/api/jobs",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(jobData)
                }
            );


            const data = await response.json();


            if (response.ok) {

                message.innerText =
                    "Job posted successfully!";

                form.reset();

            } else {

                message.innerText =
                    data.message || "Failed to post job";

            }


        } catch (error) {

            console.error("POST JOB ERROR:", error);

            message.innerText =
                "Cannot connect to server.";

        }

    });

});
