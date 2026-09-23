document.addEventListener("DOMContentLoaded", async () => {

    const form =
        document.getElementById("profileForm");

    const message =
        document.getElementById("message");


    // ==========================================
    // GET LOGGED-IN USER
    // ==========================================

    const userName =
        localStorage.getItem("userName");

    const userEmail =
        localStorage.getItem("userEmail");

    const userRole =
        localStorage.getItem("userRole");


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!userEmail) {

        message.innerText =
            "Please login first.";

        message.style.color =
            "red";

        return;
    }


    // ==========================================
    // ONLY JOB SEEKER
    // ==========================================

    if (userRole !== "jobseeker") {

        message.innerText =
            "Profile is only available for Job Seekers.";

        message.style.color =
            "red";

        if (form) {

            form.style.display =
                "none";

        }

        return;
    }


    // ==========================================
    // PHOTO ELEMENTS
    // ==========================================

    const photoInput =
        document.getElementById("photo");

    const photoPreview =
        document.getElementById(
            "profilePhotoPreview"
        );

    const photoPlaceholder =
        document.getElementById(
            "photoPlaceholder"
        );


    // This will contain the selected photo
    let photoData = "";


    // ==========================================
    // SHOW LOGIN DATA
    // ==========================================

    document.getElementById("name").value =
        userName || "";

    document.getElementById("email").value =
        userEmail;


    // ==========================================
    // PHOTO PREVIEW FUNCTION
    // ==========================================

    function showPhotoPreview(photo) {

        if (
            photoPreview &&
            photo
        ) {

            photoPreview.src =
                photo;

            photoPreview.style.display =
                "block";


            if (photoPlaceholder) {

                photoPlaceholder.style.display =
                    "none";

            }

        }

    }


    // ==========================================
    // SELECT PHOTO
    // ==========================================

    if (photoInput) {

        photoInput.addEventListener(
            "change",
            (event) => {

                const file =
                    event.target.files[0];


                // No file selected

                if (!file) {

                    return;

                }


                // ==================================
                // CHECK IMAGE TYPE
                // ==================================

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select an image file."
                    );

                    photoInput.value =
                        "";

                    return;

                }


                // ==================================
// CHECK IMAGE SIZE
// Maximum 200 KB
// ==================================

const maxPhotoSize =
    200 * 1024;


if (file.size > maxPhotoSize) {

    alert(
        "Photo size should be less than 200 KB."
    );

    photoInput.value = "";

    return;

}


                // ==================================
                // READ IMAGE
                // ==================================

                const reader =
                    new FileReader();


                reader.onload =
                    function () {

                        photoData =
                            reader.result;


                        // Show selected photo

                        showPhotoPreview(
                            photoData
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    // ==========================================
    // LOAD EXISTING PROFILE
    // ==========================================

    try {

        const response =
            await fetch(
                "https://kaamnearby.onrender.com/api/profile?email=" +
                encodeURIComponent(
                    userEmail
                )
            );


        if (response.ok) {

            const profile =
                await response.json();


            // ==================================
            // LOAD TEXT DATA
            // ==================================

            document.getElementById(
                "name"
            ).value =
                profile.name ||
                userName ||
                "";


            document.getElementById(
                "email"
            ).value =
                profile.email ||
                userEmail;


            document.getElementById(
                "phone"
            ).value =
                profile.phone ||
                "";


            document.getElementById(
                "skills"
            ).value =
                profile.skills ||
                "";


            document.getElementById(
                "experience"
            ).value =
                profile.experience ||
                "";


            document.getElementById(
                "location"
            ).value =
                profile.location ||
                "";


            // ==================================
            // LOAD SAVED PHOTO
            // ==================================

            if (
                profile.photo &&
                profile.photo.trim() !== ""
            ) {

                photoData =
                    profile.photo;


                showPhotoPreview(
                    profile.photo
                );

            }

        }


    } catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );

    }


    try {

    message.innerText = "Saving profile...";
    message.style.color = "#2563eb";

    const response = await fetch(
        "https://kaamnearby.onrender.com/api/profile",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(profileData)
        }
    );

    // Response ko pehle text ke form mein read karo
    const responseText = await response.text();

    console.log("SERVER STATUS:", response.status);
    console.log("SERVER RESPONSE:", responseText);

    let data = {};

    try {
        data = JSON.parse(responseText);
    } catch (jsonError) {
        console.error(
            "SERVER DID NOT RETURN JSON:",
            responseText
        );
    }

    if (response.ok) {

        message.innerText =
            data.message ||
            "Profile saved successfully!";

        message.style.color = "green";

        if (photoData && photoPreview) {
            showPhotoPreview(photoData);
        }

    } else {

        message.innerText =
            data.message ||
            "Server error: " + response.status;

        message.style.color = "red";

        console.error(
            "PROFILE SAVE FAILED:",
            responseText
        );
    }

} catch (error) {

    console.error(
        "SAVE PROFILE ERROR:",
        error
    );

    message.innerText =
        "Cannot connect to server. Check Render backend.";

    message.style.color = "red";
}


            // ==================================
            // GET VALUES
            // ==================================

            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const skills =
                document.getElementById(
                    "skills"
                ).value.trim();


            const experience =
                document.getElementById(
                    "experience"
                ).value.trim();


            const location =
                document.getElementById(
                    "location"
                ).value.trim();


            // ==================================
            // CHECK ALL REQUIRED FIELDS
            // ==================================

            if (
                !name ||
                !email ||
                !phone ||
                !skills ||
                !experience ||
                !location ||
                !photoData
            ) {

                message.innerText =
                    "Please complete all profile details and upload a profile photo.";

                message.style.color =
                    "red";

                return;

            }


            // ==================================
            // PROFILE DATA
            // ==================================

            const profileData = {

                name:
                    name,

                email:
                    email,

                phone:
                    phone,

                skills:
                    skills,

                experience:
                    experience,

                location:
                    location,

                photo:
                    photoData

            };


            // ==================================
            // SAVE TO BACKEND
            // ==================================

            try {

                message.innerText =
                    "Saving profile...";

                message.style.color =
                    "#2563eb";


                const response =
                    await fetch(
                        "https://kaamnearby.onrender.com/api/profile",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    profileData
                                )
                        }
                    );


                const data =
                    await response.json();


                // ==================================
                // SUCCESS
                // ==================================

                if (response.ok) {

                    message.innerText =
                        "Profile saved successfully!";

                    message.style.color =
                        "green";


                    // Make sure latest photo
                    // remains visible

                    if (
                        photoData &&
                        photoPreview
                    ) {

                        showPhotoPreview(
                            photoData
                        );

                    }


                } else {

                    message.innerText =
                        data.message ||
                        "Failed to save profile";

                    message.style.color =
                        "red";

                }


            } catch (error) {

                console.error(
                    "SAVE PROFILE ERROR:",
                    error
                );


                message.innerText =
                    "Cannot connect to server.";

                message.style.color =
                    "red";

            }

        }
    );

});
