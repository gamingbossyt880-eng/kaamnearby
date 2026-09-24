document.addEventListener("DOMContentLoaded", async () => {

    const container =
        document.getElementById("applicationsContainer");

    const employerEmail =
        localStorage.getItem("userEmail");

    const token =
        localStorage.getItem("token");


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!employerEmail || !token) {

        container.innerHTML =
            "<p>Please login as Employer first.</p>";

        return;
    }


    try {

        // ==========================================
        // GET EMPLOYER APPLICATIONS
        // ==========================================

        const response =
            await fetch(
                "https://kaamnearby.onrender.com/api/applications?employerEmail=" +
                encodeURIComponent(employerEmail)
            );


        const applications =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                "<p>" +
                (applications.message ||
                    "Unable to load applications") +
                "</p>";

            return;
        }


        // ==========================================
        // NO APPLICATIONS
        // ==========================================

        if (
            !applications ||
            applications.length === 0
        ) {

            container.innerHTML =
                "<p>No applicants found.</p>";

            return;
        }


        // ==========================================
        // CLEAR CONTAINER
        // ==========================================

        container.innerHTML = "";


        // ==========================================
        // SHOW APPLICATIONS
        // ==========================================

        applications.forEach(
            (application) => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "application-card";


                const job =
                    application.jobId;


                const jobTitle =
                    job
                        ? job.jobTitle
                        : "Job";


                // ==================================
                // CARD
                // ==================================

                card.innerHTML = `

                    <h3>
                        ${application.applicantName}
                    </h3>

                    <p>
                        <strong>Email:</strong>
                        ${application.applicantEmail}
                    </p>

                    <p>
                        <strong>Job:</strong>
                        ${jobTitle}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${application.status}
                    </p>


                    <div class="application-buttons">

                        <button
                            class="view-profile-btn"
                            data-email="${application.applicantEmail}"
                            data-job-id="${job ? job._id : ""}"
                        >
                            👤 View Profile
                        </button>


                        <button
                            class="accept-btn"
                            data-id="${application._id}"
                        >
                            Accept
                        </button>


                        <button
                            class="reject-btn"
                            data-id="${application._id}"
                        >
                            Reject
                        </button>

                    </div>

                `;


                container.appendChild(card);

            }
        );


        // ==========================================
        // VIEW PROFILE BUTTON
        // ==========================================

        document
            .querySelectorAll(".view-profile-btn")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const email =
                            button.dataset.email;

                        const jobId =
                            button.dataset.jobId;


                        if (!email || !jobId) {

                            alert(
                                "Applicant information is missing."
                            );

                            return;
                        }


                        // Save temporarily
                        localStorage.setItem(
                            "viewApplicantEmail",
                            email
                        );

                        localStorage.setItem(
                            "viewApplicantJobId",
                            jobId
                        );


                        // Open profile page
                        window.location.href =
                            "applicantprofile.html";

                    }
                );

            });


        // ==========================================
        // ACCEPT BUTTON
        // ==========================================

        document
            .querySelectorAll(".accept-btn")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        await updateStatus(
                            button.dataset.id,
                            "Accepted"
                        );

                    }
                );

            });


        // ==========================================
        // REJECT BUTTON
        // ==========================================

        document
            .querySelectorAll(".reject-btn")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        await updateStatus(
                            button.dataset.id,
                            "Rejected"
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "APPLICATIONS ERROR:",
            error
        );

        container.innerHTML =
            "<p>Unable to connect to server.</p>";

    }


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    async function updateStatus(
        applicationId,
        status
    ) {

        try {

            const response =
                await fetch(
                    "https://kaamnearby.onrender.com/api/applications/" +
                    applicationId,
                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token

                        },

                        body: JSON.stringify({

                            status: status

                        })

                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                alert(
                    "Application " +
                    status.toLowerCase() +
                    " successfully!"
                );

                location.reload();

            } else {

                alert(
                    data.message ||
                    "Unable to update status"
                );

            }


        } catch (error) {

            console.error(
                "STATUS ERROR:",
                error
            );

            alert(
                "Server connection failed."
            );

        }

    }

});
