document.addEventListener("DOMContentLoaded", () => {

    const container =
        document.getElementById("applicationsContainer");

    // ==========================================
    // GET JOB ID FROM URL
    // ==========================================

    const urlParams =
        new URLSearchParams(window.location.search);

    const jobId =
        urlParams.get("jobId");

    console.log("Job ID:", jobId);


    if (!container) {
        console.error("applicationsContainer not found");
        return;
    }


    if (!jobId) {

        container.innerHTML =
            "<p>Job ID not found.</p>";

        return;
    }


    // ==========================================
    // LOAD APPLICANTS
    // ==========================================

    async function loadApplicants() {

        try {

            console.log(
                "Loading applications for Job ID:",
                jobId
            );


            const response = await fetch(
                "http://localhost:5000/api/applications/job/" +
                encodeURIComponent(jobId)
            );


            const applications =
                await response.json();


            console.log(
                "Applications:",
                applications
            );


            if (!response.ok) {

                container.innerHTML =
                    "<p>Unable to load applicants.</p>";

                return;
            }


            if (
                !Array.isArray(applications) ||
                applications.length === 0
            ) {

                container.innerHTML =
                    "<p>No applicants for this job yet.</p>";

                return;
            }


            container.innerHTML = "";


            // ==========================================
            // DISPLAY APPLICANTS
            // ==========================================

            applications.forEach((application) => {

                const card =
                    document.createElement("div");

                card.className =
                    "application-card";


                // Job information

                const job =
                    application.jobId;


                const jobTitle =
                    job && typeof job === "object"
                        ? job.jobTitle
                        : "Job not available";


                const shopName =
                    job && typeof job === "object"
                        ? job.shopName
                        : "Not available";


                const location =
                    job && typeof job === "object"
                        ? job.location
                        : "Not available";


                // ==========================================
                // APPLICANT CARD
                // ==========================================

                card.innerHTML = `

                    <h2>
                        ${application.applicantName || "No Name"}
                    </h2>


                    <p>
                        <strong>Email:</strong>
                        ${application.applicantEmail || "Not provided"}
                    </p>


                    <p>
                        <strong>Applied For:</strong>
                        ${jobTitle}
                    </p>


                    <p>
                        <strong>Shop:</strong>
                        ${shopName}
                    </p>


                    <p>
                        <strong>Location:</strong>
                        ${location}
                    </p>


                    <p>
                        <strong>Phone:</strong>

                        <span class="phone">
                            Loading...
                        </span>
                    </p>


                    <p>
                        <strong>Skills:</strong>

                        <span class="skills">
                            Loading...
                        </span>
                    </p>


                    <p>
                        <strong>Experience:</strong>

                        <span class="experience">
                            Loading...
                        </span>
                    </p>


                    <p>
                        <strong>Status:</strong>

                        <span id="status-${application._id}">
                            ${application.status || "Pending"}
                        </span>
                    </p>


                    <button
                        class="view-profile-btn"
                        data-email="${application.applicantEmail}">
                        View Profile
                    </button>


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


                    <hr>

                `;


                container.appendChild(card);


                // Load profile

                loadApplicantProfile(
                    application.applicantEmail,
                    card
                );

            });


            // ==========================================
            // VIEW PROFILE
            // ==========================================

            document
                .querySelectorAll(".view-profile-btn")
                .forEach((button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            const email =
                                button.getAttribute(
                                    "data-email"
                                );


                            window.location.href =
                                "applicantprofile.html?email=" +
                                encodeURIComponent(email);

                        }
                    );

                });


            // ==========================================
            // ACCEPT
            // ==========================================

            document
                .querySelectorAll(".accept-btn")
                .forEach((button) => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const applicationId =
                                button.getAttribute(
                                    "data-id"
                                );


                            await updateStatus(
                                applicationId,
                                "Accepted"
                            );

                        }
                    );

                });


            // ==========================================
            // REJECT
            // ==========================================

            document
                .querySelectorAll(".reject-btn")
                .forEach((button) => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const applicationId =
                                button.getAttribute(
                                    "data-id"
                                );


                            await updateStatus(
                                applicationId,
                                "Rejected"
                            );

                        }
                    );

                });

        } catch (error) {

            console.error(
                "LOAD APPLICANTS ERROR:",
                error
            );


            container.innerHTML =
                "<p>Cannot connect to server.</p>";

        }

    }


    // ==========================================
    // LOAD APPLICANT PROFILE
    // ==========================================

    async function loadApplicantProfile(
        email,
        card
    ) {

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/profile?email=" +
                    encodeURIComponent(email)
                );


            if (!response.ok) {

                card.querySelector(
                    ".phone"
                ).innerText =
                    "Not provided";


                card.querySelector(
                    ".skills"
                ).innerText =
                    "Not provided";


                card.querySelector(
                    ".experience"
                ).innerText =
                    "Not provided";


                return;
            }


            const profile =
                await response.json();


            console.log(
                "Applicant profile:",
                profile
            );


            card.querySelector(
                ".phone"
            ).innerText =
                profile.phone || "Not provided";


            card.querySelector(
                ".skills"
            ).innerText =
                profile.skills || "Not provided";


            card.querySelector(
                ".experience"
            ).innerText =
                profile.experience || "Not provided";


        } catch (error) {

            console.error(
                "PROFILE ERROR:",
                error
            );


            card.querySelector(
                ".phone"
            ).innerText =
                "Not available";


            card.querySelector(
                ".skills"
            ).innerText =
                "Not available";


            card.querySelector(
                ".experience"
            ).innerText =
                "Not available";

        }

    }


    // ==========================================
    // UPDATE APPLICATION STATUS
    // ==========================================

    async function updateStatus(
        applicationId,
        newStatus
    ) {

        try {

            console.log(
                "Updating:",
                applicationId,
                newStatus
            );


            const response =
                await fetch(
                    "http://localhost:5000/api/applications/" +
                    applicationId,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                const statusElement =
                    document.getElementById(
                        "status-" +
                        applicationId
                    );


                if (statusElement) {

                    statusElement.innerText =
                        newStatus;

                }


                alert(
                    "Application " +
                    newStatus +
                    " successfully!"
                );


            } else {

                alert(
                    data.message ||
                    "Failed to update application"
                );

            }


        } catch (error) {

            console.error(
                "UPDATE STATUS ERROR:",
                error
            );


            alert(
                "Server error while updating application"
            );

        }

    }


    // ==========================================
    // START
    // ==========================================

    loadApplicants();

});