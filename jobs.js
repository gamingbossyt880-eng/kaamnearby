document.addEventListener("DOMContentLoaded", async () => {

    const jobsContainer = document.getElementById("jobsContainer");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const locationInput = document.getElementById("locationInput");
    const clearBtn = document.getElementById("clearBtn");

    let jobs = [];
    let appliedJobIds = [];

    // ==========================================
    // CHECK LOGIN
    // ==========================================

    const applicantEmail =
        localStorage.getItem("userEmail");

    const applicantName =
        localStorage.getItem("userName");

    if (!applicantEmail) {

        jobsContainer.innerHTML =
            "<p>Please login first.</p>";

        return;
    }


    // ==========================================
    // LOAD JOBS
    // ==========================================

    async function loadJobs() {

        try {

            const response =
                await fetch(
                    "https://kaamnearby.onrender.com/api/jobs"
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load jobs"
                );

            }

            jobs =
                await response.json();


            // ==========================================
            // GET USER APPLICATIONS
            // ==========================================

            const applicationResponse =
                await fetch(
                    "https://kaamnearby.onrender.com/api/applications?email=" +
                    encodeURIComponent(
                        applicantEmail
                    )
                );


            if (applicationResponse.ok) {

                const applications =
                    await applicationResponse.json();


                appliedJobIds =
                    applications
                        .filter(
                            application =>
                                application.jobId
                        )
                        .map(
                            application =>
                                application.jobId._id
                        );

            }


            displayJobs(jobs);


        } catch (error) {

            console.error(
                "LOAD JOBS ERROR:",
                error
            );

            jobsContainer.innerHTML =
                "<p>Cannot connect to server.</p>";

        }

    }


    // ==========================================
    // DISPLAY JOBS
    // ==========================================

    function displayJobs(jobList) {

        jobsContainer.innerHTML = "";


        if (jobList.length === 0) {

            jobsContainer.innerHTML =
                "<p>No matching jobs found.</p>";

            return;
        }


        jobList.forEach((job) => {

            const jobCard =
                document.createElement("div");

            jobCard.className =
                "job-card";


            // ==========================================
            // CHECK ALREADY APPLIED
            // ==========================================

            const alreadyApplied =
                appliedJobIds.includes(
                    job._id
                );


            let applyButton;


            if (alreadyApplied) {

                applyButton = `
                    <button
                        class="apply-btn"
                        disabled>
                        Already Applied ✓
                    </button>
                `;

            } else {

                applyButton = `
                    <button
                        class="apply-btn"
                        data-job-id="${job._id}">
                        Apply Now
                    </button>
                `;

            }


            // ==========================================
            // JOB CARD
            // ==========================================

            jobCard.innerHTML = `

                <h2>
                    ${job.jobTitle || "Job"}
                </h2>

                <p>
                    <strong>Shop:</strong>
                    ${job.shopName || "Not provided"}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${job.location || "Not provided"}
                </p>

                <p>
                    <strong>Salary:</strong>
                    ${job.salary || "Not provided"}
                </p>

                <p>
                    <strong>Working Hours:</strong>
                    ${job.workingHours || "Not provided"}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${job.description || "No description"}
                </p>

                ${applyButton}

            `;


            jobsContainer.appendChild(
                jobCard
            );

        });


        // ==========================================
        // APPLY BUTTON
        // ==========================================

        document
            .querySelectorAll(
                ".apply-btn:not(:disabled)"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        const jobId =
                            button.getAttribute(
                                "data-job-id"
                            );


                        if (
                            !applicantName ||
                            !applicantEmail
                        ) {

                            alert(
                                "Please login first."
                            );

                            return;
                        }


                        // Disable button while submitting

                        button.disabled = true;

                        button.innerText =
                            "Applying...";


                        try {

                            const response =
                                await fetch(
                                    "https://kaamnearby.onrender.com/api/apply",
                                    {
                                        method: "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body:
                                            JSON.stringify({

                                                jobId:
                                                    jobId,

                                                applicantName:
                                                    applicantName,

                                                applicantEmail:
                                                    applicantEmail

                                            })
                                    }
                                );


                            const data =
                                await response.json();


                            if (response.ok) {

                                alert(
                                    "Application submitted successfully!"
                                );


                                // Add job to applied list

                                appliedJobIds.push(
                                    jobId
                                );


                                // Refresh cards

                                displayJobs(
                                    jobs
                                );


                            } else {

                                alert(
                                    data.message ||
                                    "Application failed"
                                );


                                button.disabled =
                                    false;

                                button.innerText =
                                    "Apply Now";

                            }


                        } catch (error) {

                            console.error(
                                "APPLY ERROR:",
                                error
                            );

                            alert(
                                "Cannot connect to server."
                            );


                            button.disabled =
                                false;

                            button.innerText =
                                "Apply Now";

                        }

                    }
                );

            });

    }


    // ==========================================
    // SEARCH JOBS
    // ==========================================

    function searchJobs() {

        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        const locationText =
            locationInput.value
                .toLowerCase()
                .trim();


        const filteredJobs =
            jobs.filter((job) => {


                const jobTitle =
                    (job.jobTitle || "")
                        .toLowerCase();


                const shopName =
                    (job.shopName || "")
                        .toLowerCase();


                const location =
                    (job.location || "")
                        .toLowerCase();


                const jobMatches =
                    !searchText ||
                    jobTitle.includes(
                        searchText
                    ) ||
                    shopName.includes(
                        searchText
                    );


                const locationMatches =
                    !locationText ||
                    location.includes(
                        locationText
                    );


                return (
                    jobMatches &&
                    locationMatches
                );

            });


        displayJobs(
            filteredJobs
        );

    }


    // ==========================================
    // SEARCH BUTTON
    // ==========================================

    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            searchJobs
        );

    }


    // ==========================================
    // CLEAR BUTTON
    // ==========================================

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            () => {

                searchInput.value =
                    "";

                locationInput.value =
                    "";

                displayJobs(
                    jobs
                );

            }
        );

    }


    // ==========================================
    // ENTER KEY
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener(
            "keypress",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    searchJobs();

                }

            }
        );

    }


    // ==========================================
    // START
    // ==========================================

    loadJobs();

});