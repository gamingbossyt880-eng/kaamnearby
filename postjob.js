document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("jobForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const employerEmail =
            localStorage.getItem("userEmail");

        if (!employerEmail) {

            message.innerText =
                "Please login as employer first.";

            return;
        }

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

            employerEmail: employerEmail
        };

        console.log("Sending job:", jobData);

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

            console.log("Server response:", data);

            if (response.ok) {

                message.innerText =
                    "Job posted successfully!";

                form.reset();

            } else {

                message.innerText =
                    data.message ||
                    "Failed to post job";

            }

        } catch (error) {

            console.error("POST JOB ERROR:", error);

            message.innerText =
                "Cannot connect to server.";

        }

    });

});