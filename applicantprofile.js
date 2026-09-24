document.addEventListener("DOMContentLoaded", async () => {

    const message =
        document.getElementById("profileMessage");

    const employerRole =
        localStorage.getItem("userRole");

    const token =
        localStorage.getItem("token");

    const applicantEmail =
        localStorage.getItem("viewApplicantEmail");

    const jobId =
        localStorage.getItem("viewApplicantJobId");


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (
        employerRole !== "employer" ||
        !token
    ) {

        message.innerText =
            "Please login as an employer first.";

        message.style.color = "red";

        return;
    }


    // ==========================================
    // APPLICANT DATA CHECK
    // ==========================================

    if (
        !applicantEmail ||
        !jobId
    ) {

        message.innerText =
            "Applicant information not found.";

        message.style.color = "red";

        return;
    }


    try {

        message.innerText =
            "Loading applicant profile...";

        message.style.color =
            "#2563eb";


        // ==========================================
        // SECURE APPLICANT PROFILE API
        // ==========================================

        const response =
            await fetch(
                "https://kaamnearby.onrender.com/api/employer/applicant-profile?jobId=" +
                encodeURIComponent(jobId) +
                "&email=" +
                encodeURIComponent(applicantEmail),
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.innerText =
                data.message ||
                "Unable to load applicant profile.";

            message.style.color =
                "red";

            return;
        }


        // ==========================================
        // SHOW PROFILE
        // ==========================================

        document.getElementById(
            "profileName"
        ).innerText =
            data.name || "Not available";


        document.getElementById(
            "profileEmail"
        ).innerText =
            data.email || "Not available";


        document.getElementById(
            "profilePhone"
        ).innerText =
            data.phone || "Not available";


        document.getElementById(
            "profileSkills"
        ).innerText =
            data.skills || "Not available";


        document.getElementById(
            "profileExperience"
        ).innerText =
            data.experience || "Not available";


        document.getElementById(
            "profileLocation"
        ).innerText =
            data.location || "Not available";


        // ==========================================
        // SHOW PROFILE PHOTO
        // ==========================================

        const profilePhoto =
            document.getElementById(
                "profilePhoto"
            );


        if (
            data.photo &&
            data.photo.trim() !== ""
        ) {

            profilePhoto.src =
                data.photo;

            profilePhoto.style.display =
                "block";

        } else {

            profilePhoto.style.display =
                "none";
        }


        message.innerText =
            "Applicant profile loaded successfully.";

        message.style.color =
            "green";


    } catch (error) {

        console.error(
            "APPLICANT PROFILE ERROR:",
            error
        );

        message.innerText =
            "Cannot connect to server.";

        message.style.color =
            "red";
    }

});
