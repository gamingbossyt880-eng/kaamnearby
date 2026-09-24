document.addEventListener("DOMContentLoaded", async () => {

    const jobsContainer =
        document.getElementById("jobsContainer");

    const searchInput =
        document.getElementById("searchInput");

    const searchBtn =
        document.getElementById("searchBtn");

    const locationInput =
        document.getElementById("locationInput");

    const clearBtn =
        document.getElementById("clearBtn");


    let jobs = [];

    let appliedJobIds = [];


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    const applicantEmail =
        localStorage.getItem("userEmail");

    const applicantName =
        localStorage.getItem("userName");

    const userRole =
        localStorage.getItem("userRole");


    if (!applicantEmail) {

        jobsContainer.innerHTML =
            "<p>Please login first.</p>";

        return;
    }


    // ==========================================
    // PROFILE STATUS
    // ==========================================

    let profileComplete = false;


    // ==========================================
    // CHECK JOB SEEKER PROFILE
    // ==========================================

    async function checkJobSeekerProfile() {

        // Profile requirement is ONLY for Job Seeker

        if (userRole !== "jobseeker") {
            return;
        }


        // Get profile interface elements

        const progressBar =
            document.getElementById(
                "profileProgressBar"
            );

        const progressText =
            document.getElementById(
                "profileProgressText"
            );

        const statusText =
            document.getElementById(
                "profileStatusText"
            );

        const button =
            document.getElementById(
                "profileButton"
            );

        const card =
            document.querySelector(
                ".profile-status-card"
            );


        // If profile interface is not present,
        // don't stop the jobs page

        if (
            !progressBar ||
            !progressText ||
            !statusText ||
            !button
        ) {

            console.log(
                "Profile status interface not found."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    "https://kaamnearby.onrender.com/api/profile?email=" +
                    encodeURIComponent(
                        applicantEmail
                    )
                );


            // ==========================================
            // PROFILE DOES NOT EXIST
            // ==========================================

            if (!response.ok) {

                profileComplete = false;


                progressBar.style.width =
                    "0%";


                progressText.innerText =
                    "0/7 Details Completed";


                statusText.innerText =
                    "Complete all required details before applying for jobs.";


                button.innerText =
                    "Complete Profile →";


                if (card) {

                    card.classList.remove(
                        "profile-complete"
                    );

                }


                return;
            }


            // ==========================================
            // GET PROFILE
            // ==========================================

            const profile =
                await response.json();


            let completed = 0;


            // ==========================================
            // NAME
            // ==========================================

            if (
                profile.name &&
                profile.name.trim() !== ""
            ) {

                completed++;

            }


            // ==========================================
            // EMAIL
            // ==========================================

            if (
                profile.email &&
                profile.email.trim() !== ""
            ) {

                completed++;

            }


            // ==========================================
            // PHONE
            // ==========================================

            if (
                profile.phone &&
                profile.phone.trim() !== ""
            ) {

                completed++;

            }


            // ==========================================
            // SKILLS
            // ==========================================

            if (
                profile.skills &&
                profile.skills.trim() !== ""
            ) {

                completed++;

            }


            // ==========================================
            // EXPERIENCE
            // ==========================================

            if (
                profile.experience &&
                profile.experience.trim() !== ""
            ) {

                completed++;

            }


            // ==========================================
            // LOCATION
            // ==========================================

            if (
                profile.location &&
                profile.location.trim() !== ""
            ) {

                completed++;

            }


            // ==========================================
            // PROFILE PHOTO
            // ==========================================

            if (
                profile.photo &&
                profile.photo.trim() !== ""
            ) {

                completed++;

            }


            // ==========================================
            // CALCULATE PERCENTAGE
            // ==========================================

            const percentage =
                (completed / 7) * 100;


            progressBar.style.width =
                percentage + "%";


            progressText.innerText =
                completed +
                "/7 Details Completed";


            // ==========================================
            // PROFILE COMPLETE
            // ==========================================

            if (completed === 7) {

                profileComplete = true;


                if (card) {

                    card.classList.add(
                        "profile-complete"
                    );

                }


                statusText.innerText =
                    "Your profile is complete. You can now apply for jobs.";


                button.innerText =
                    "View Profile →";

            }


            // ==========================================
            // PROFILE INCOMPLETE
            // ==========================================

            else {

                profileComplete = false;


                if (card) {

                    card.classList.remove(
                        "profile-complete"
                    );

                }


                statusText.innerText =
                    "Complete all required details before applying for jobs.";


                button.innerText =
                    "Complete Profile →";

            }


        } catch (error) {

            console.error(
                "PROFILE CHECK ERROR:",
                error
            );

        }

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


                        // ==========================================
                        // LOGIN CHECK
                        // ==========================================

                        if (
                            !applicantName ||
                            !applicantEmail
                        ) {

                            alert(
                                "Please login first."
                            );

                            return;

                        }


                        // ==========================================
                        // JOB SEEKER PROFILE CHECK
                        // ==========================================

                        if (
                            userRole === "jobseeker" &&
                            !profileComplete
                        ) {

                            const goToProfile =
                                confirm(
                                    "Please complete your profile before applying for a job.\n\n" +
                                    "Required details:\n" +
                                    "• Name\n" +
                                    "• Email\n" +
                                    "• Phone\n" +
                                    "• Skills\n" +
                                    "• Experience\n" +
                                    "• Location\n" +
                                    "• Profile Photo\n\n" +
                                    "Do you want to complete your profile now?"
                                );


                            if (goToProfile) {

                                window.location.href =
                                    "profile.html";

                            }


                            return;

                        }


                        // ==========================================
                        // DISABLE BUTTON
                        // ==========================================

                        button.disabled =
                            true;


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


                            // ==========================================
                            // APPLICATION SUCCESS
                            // ==========================================

                            if (response.ok) {

                                alert(
                                    "Application submitted successfully!"
                                );


                                appliedJobIds.push(
                                    jobId
                                );


                                displayJobs(
                                    jobs
                                );


                            }


                            // ==========================================
                            // APPLICATION ERROR
                            // ==========================================

                            else {

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

    await checkJobSeekerProfile();

    loadJobs();

});
