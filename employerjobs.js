document.addEventListener("DOMContentLoaded", () => {

    const container =
        document.getElementById("jobsContainer");

    if (!container) {
        console.error("jobsContainer not found");
        return;
    }

    const employerEmail =
        localStorage.getItem("userEmail");

    if (!employerEmail) {

        container.innerHTML = `
            <p>Please login again.</p>
            <a href="login.html">Login</a>
        `;

        return;
    }


    async function loadJobs() {

        try {

            container.innerHTML =
                "<p>Loading your jobs...</p>";

            const response =
                await fetch(
                    "http://localhost:5000/api/jobs"
                );

            if (!response.ok) {
                throw new Error("Failed to load jobs");
            }

            const jobs =
                await response.json();

            const myJobs =
                jobs.filter((job) => {

                    return (
                        job.employerEmail === employerEmail ||
                        job.email === employerEmail ||
                        job.postedBy === employerEmail
                    );

                });


            if (myJobs.length === 0) {

                container.innerHTML = `
                    <div class="empty-jobs">

                        <h2>No Jobs Posted Yet</h2>

                        <p>
                            You have not posted any job.
                        </p>

                        <a href="employer.html">
                            Post Your First Job
                        </a>

                    </div>
                `;

                return;
            }


            container.innerHTML = "";


            myJobs.forEach((job) => {

                const card =
                    document.createElement("div");

                card.className =
                    "job-card";


                card.innerHTML = `

                    <div class="job-card-content">

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

                    </div>


                    <div class="job-actions">

                        <button
                            class="view-applications-btn"
                            data-id="${job._id}">
                            View Applications
                        </button>

                        <button
                            class="edit-job-btn"
                            data-id="${job._id}">
                            Edit Job
                        </button>

                        <button
                            class="delete-job-btn"
                            data-id="${job._id}">
                            Delete Job
                        </button>

                    </div>

                `;


                container.appendChild(card);

            });


            // ===============================
            // VIEW APPLICATIONS
            // ===============================

            document
                .querySelectorAll(".view-applications-btn")
                .forEach((button) => {

                    button.addEventListener("click", () => {

                        const jobId =
                            button.getAttribute("data-id");

                        window.location.href =
                            "employerapplications.html?jobId=" +
                            encodeURIComponent(jobId);

                    });

                });


            // ===============================
            // EDIT JOB
            // ===============================

            document
                .querySelectorAll(".edit-job-btn")
                .forEach((button) => {

                    button.addEventListener("click", () => {

                        const jobId =
                            button.getAttribute("data-id");

                        window.location.href =
                            "editjob.html?jobId=" +
                            encodeURIComponent(jobId);

                    });

                });


            // ===============================
            // DELETE JOB
            // ===============================

            document
                .querySelectorAll(".delete-job-btn")
                .forEach((button) => {

                    button.addEventListener("click", async () => {

                        const jobId =
                            button.getAttribute("data-id");


                        const confirmDelete =
                            confirm(
                                "Are you sure you want to delete this job?"
                            );


                        if (!confirmDelete) {
                            return;
                        }


                        try {

                            const response =
                                await fetch(
                                    "http://localhost:5000/api/jobs/" +
                                    jobId,
                                    {
                                        method: "DELETE"
                                    }
                                );


                            const data =
                                await response.json();


                            if (response.ok) {

                                alert(
                                    "Job deleted successfully!"
                                );

                                loadJobs();

                            } else {

                                alert(
                                    data.message ||
                                    "Failed to delete job"
                                );

                            }

                        } catch (error) {

                            console.error(
                                "DELETE JOB ERROR:",
                                error
                            );

                            alert(
                                "Cannot connect to server."
                            );

                        }

                    });

                });


        } catch (error) {

            console.error(
                "LOAD JOBS ERROR:",
                error
            );

            container.innerHTML = `
                <p>
                    Cannot connect to server.
                </p>
            `;

        }

    }


    loadJobs();

});