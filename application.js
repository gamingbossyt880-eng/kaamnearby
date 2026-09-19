document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("applicationsContainer");

    // Get logged-in user information
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    // ===============================
    // CHECK LOGIN
    // ===============================

    if (!userEmail) {

        container.innerHTML =
            "<p>Please login first to see your applications.</p>";

        return;
    }


    try {

        // ===============================
        // GET USER APPLICATIONS
        // ===============================

        const response = await fetch(
            "https://kaamnearby.onrender.com/api/applications?email=" +
            encodeURIComponent(userEmail)
        );

        const applications = await response.json();


        if (!response.ok) {

            container.innerHTML =
                "<p>Unable to load applications.</p>";

            return;
        }


        if (applications.length === 0) {

            container.innerHTML =
                "<p>No applications found.</p>";

            return;
        }


        container.innerHTML = "";


        // ===============================
        // DISPLAY APPLICATIONS
        // ===============================

        applications.forEach((application) => {

            const card = document.createElement("div");

            card.className = "application-card";


            // Common application information
            let buttons = "";


            // ===============================
            // EMPLOYER BUTTONS
            // ===============================

            if (userRole === "employer") {

                buttons = `

                    <button
                        class="accept-btn"
                        data-id="${application._id}">

                        Accept

                    </button>

                    <button
                        class="reject-btn"
                        data-id="${application._id}">

                        Reject

                    </button>

                `;

            }


            // ===============================
            // APPLICATION CARD
            // ===============================

            card.innerHTML = `

                <h2>
                    ${application.jobId.jobTitle}
                </h2>

                <p>
                    <strong>Shop:</strong>
                    ${application.jobId.shopName}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${application.jobId.location}
                </p>

                <p>
                    <strong>Applicant Name:</strong>
                    ${application.applicantName}
                </p>

                <p>
                    <strong>Applicant Email:</strong>
                    ${application.applicantEmail}
                </p>

                <p>
                    <strong>Status:</strong>

                    <span
                        id="status-${application._id}"
                        class="status-badge ${application.status.toLowerCase()}">

                        ${application.status}

                    </span>

                </p>

                ${buttons}

                <hr>

            `;


            container.appendChild(card);

        });


        // ===============================
        // ACCEPT APPLICATION
        // ===============================

        document.querySelectorAll(".accept-btn").forEach((button) => {

            button.addEventListener("click", async () => {

                const applicationId =
                    button.getAttribute("data-id");


                try {

                    const response = await fetch(
                        `https://kaamnearby.onrender.com/api/applications/${applicationId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                status: "Accepted"
                            })
                        }
                    );


                    const data = await response.json();


                    if (response.ok) {

                        const statusElement =
                            document.getElementById(
                                `status-${applicationId}`
                            );


                        statusElement.innerText =
                            "Accepted";


                        statusElement.className =
                            "status-badge accepted";


                        alert(
                            "Application Accepted!"
                        );

                    } else {

                        alert(
                            data.message ||
                            "Failed to accept"
                        );

                    }

                } catch (error) {

                    console.error(
                        "Accept Error:",
                        error
                    );

                    alert("Server error");

                }

            });

        });


        // ===============================
        // REJECT APPLICATION
        // ===============================

        document.querySelectorAll(".reject-btn").forEach((button) => {

            button.addEventListener("click", async () => {

                const applicationId =
                    button.getAttribute("data-id");


                try {

                    const response = await fetch(
                        `https://kaamnearby.onrender.com/api/applications/${applicationId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                status: "Rejected"
                            })
                        }
                    );


                    const data = await response.json();


                    if (response.ok) {

                        const statusElement =
                            document.getElementById(
                                `status-${applicationId}`
                            );


                        statusElement.innerText =
                            "Rejected";


                        statusElement.className =
                            "status-badge rejected";


                        alert(
                            "Application Rejected!"
                        );

                    } else {

                        alert(
                            data.message ||
                            "Failed to reject"
                        );

                    }

                } catch (error) {

                    console.error(
                        "Reject Error:",
                        error
                    );

                    alert("Server error");

                }

            });

        });


    } catch (error) {

        console.error(
            "Error loading applications:",
            error
        );

        container.innerHTML =
            "<p>Cannot connect to server.</p>";

    }

});