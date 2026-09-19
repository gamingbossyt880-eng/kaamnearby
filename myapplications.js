document.addEventListener("DOMContentLoaded", async () => {

    const container =
        document.getElementById("applicationsContainer");

    const email =
        localStorage.getItem("userEmail");

    if (!email) {

        container.innerHTML =
            "<p>Please login first.</p>";

        return;
    }

    try {

        const response = await fetch(
            "https://kaamnearby.onrender.com/api/applications?email=" +
            encodeURIComponent(email)
        );

        const applications =
            await response.json();

        if (!response.ok) {

            container.innerHTML =
                "<p>Unable to load applications.</p>";

            return;
        }

        container.innerHTML = "";

        if (applications.length === 0) {

            container.innerHTML =
                "<p>You have not applied for any job yet.</p>";

            return;
        }

        applications.forEach((application) => {

            const job = application.jobId;

            const card =
                document.createElement("div");

            card.className = "job-card";

            let status = application.status || "Pending";

            card.innerHTML = `

                <h2>
                    ${job ? job.jobTitle : "Job"}
                </h2>

                <p>
                    <strong>Shop:</strong>
                    ${job ? job.shopName : "Not available"}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${job ? job.location : "Not available"}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${status}
                </p>

            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(
            "APPLICATION ERROR:",
            error
        );

        container.innerHTML =
            "<p>Cannot connect to server.</p>";
    }

});