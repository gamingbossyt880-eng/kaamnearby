document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // GET EMPLOYER LOGIN DATA
    // ==========================================

    const token =
        localStorage.getItem("token");

    const employerRole =
        localStorage.getItem("userRole");


    // ==========================================
    // GET SELECTED APPLICANT DATA
    // ==========================================

    const applicantEmail =
        localStorage.getItem(
            "viewApplicantEmail"
        );

    const jobId =
        localStorage.getItem(
            "viewApplicantJobId"
        );


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (
        !token ||
        employerRole !== "employer"
    ) {

        alert(
            "Only logged-in employers can view applicant profiles."
        );

        window.location.href =
            "login.html";

        return;
    }


    // ==========================================
    // CHECK APPLICANT DATA
    // ==========================================

    if (
        !applicantEmail ||
        !jobId
    ) {

        alert(
            "Applicant information not found."
        );

        window.location.href =
            "employerapplications.html";

        return;
    }


    // ==========================================
    // HTML ELEMENTS
    // ==========================================

    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    const profilePhone =
        document.getElementById(
            "profilePhone"
        );

    const profileSkills =
        document.getElementById(
            "profileSkills"
        );

    const profileExperience =
        document.getElementById(
            "profileExperience"
        );

    const profileLocation =
        document.getElementById(
            "profileLocation"
        );

    const profilePhoto =
        document.getElementById(
            "profilePhoto"
        );

    const message =
        document.getElementById(
            "profileMessage"
        );


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    try {

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


        // ==========================================
        // ACCESS DENIED / ERROR
        // ==========================================

        if (!response.ok) {

            message.innerText =
                data.message ||
                "Unable to view profile.";

            message.style.color =
                "red";

            return;
        }


        // ==========================================
        // SHOW PROFILE DATA
        // ==========================================

        profileName.innerText =
            data.name || "Not available";


        profileEmail.innerText =
            data.email || "Not available";


        profilePhone.innerText =
            data.phone || "Not available";


        profileSkills.innerText =
            data.skills || "Not available";


        profileExperience.innerText =
            data.experience || "Not available";


        profileLocation.innerText =
            data.location || "Not available";


        // ==========================================
        // SHOW PHOTO
        // ==========================================

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
            "Unable to connect to server.";

        message.style.color =
            "red";

    }

});
