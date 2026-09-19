document.addEventListener("DOMContentLoaded", async () => {

    const form =
        document.getElementById("editJobForm");

    const message =
        document.getElementById("message");


    // ==========================================
    // GET JOB ID FROM URL
    // ==========================================

    const urlParams =
        new URLSearchParams(window.location.search);

    const jobId =
        urlParams.get("jobId");


    if (!jobId) {

        message.innerText =
            "Job ID not found.";

        return;
    }


    // ==========================================
    // LOAD JOB
    // ==========================================

    try {

        const response =
            await fetch(
                "https://kaamnearby.onrender.com/api/jobs/" +
                encodeURIComponent(jobId)
            );


        const job =
            await response.json();


        if (!response.ok) {

            message.innerText =
                job.message ||
                "Unable to load job.";

            return;
        }


        // Fill form

        document.getElementById("jobTitle").value =
            job.jobTitle || "";

        document.getElementById("shopName").value =
            job.shopName || "";

        document.getElementById("location").value =
            job.location || "";

        document.getElementById("salary").value =
            job.salary || "";

        document.getElementById("workingHours").value =
            job.workingHours || "";

        document.getElementById("description").value =
            job.description || "";


    } catch (error) {

        console.error(
            "LOAD JOB ERROR:",
            error
        );

        message.innerText =
            "Cannot connect to server.";

        return;
    }


    // ==========================================
    // UPDATE JOB
    // ==========================================

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const updatedJob = {

                jobTitle:
                    document.getElementById("jobTitle")
                        .value.trim(),

                shopName:
                    document.getElementById("shopName")
                        .value.trim(),

                location:
                    document.getElementById("location")
                        .value.trim(),

                salary:
                    document.getElementById("salary")
                        .value.trim(),

                workingHours:
                    document.getElementById("workingHours")
                        .value.trim(),

                description:
                    document.getElementById("description")
                        .value.trim()

            };


            try {

                const response =
                    await fetch(
                        "https://kaamnearby.onrender.com/api/jobs/" +
                        encodeURIComponent(jobId),
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(updatedJob)
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    message.innerText =
                        "Job updated successfully!";

                } else {

                    message.innerText =
                        data.message ||
                        "Failed to update job";

                }


            } catch (error) {

                console.error(
                    "UPDATE JOB ERROR:",
                    error
                );

                message.innerText =
                    "Cannot connect to server.";

            }

        }
    );

});