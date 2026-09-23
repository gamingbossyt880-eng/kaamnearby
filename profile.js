document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("profileForm");
    const message = document.getElementById("message");

    // ==========================================
    // GET LOGGED-IN USER
    // ==========================================

    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!userEmail) {

        message.innerText = "Please login first.";
        message.style.color = "red";

        return;
    }


    // ==========================================
    // ONLY JOB SEEKER
    // ==========================================

    if (userRole !== "jobseeker") {

        message.innerText =
            "Profile is only available for Job Seekers.";

        message.style.color = "red";

        if (form) {
            form.style.display = "none";
        }

        return;
    }


    // ==========================================
    // PHOTO ELEMENTS
    // ==========================================

    const photoInput =
        document.getElementById("photo");

    const photoPreview =
        document.getElementById("profilePhotoPreview");

    const photoPlaceholder =
        document.getElementById("photoPlaceholder");


    // Selected photo
    let photoData = "";


    // ==========================================
    // SHOW USER DATA
    // ==========================================

    document.getElementById("name").value =
        userName || "";

    document.getElementById("email").value =
        userEmail;


    // ==========================================
    // SHOW PHOTO PREVIEW
    // ==========================================

    function showPhotoPreview(photo) {

        if (!photoPreview || !photo) {
            return;
        }

        photoPreview.src = photo;

        photoPreview.style.display = "block";


        if (photoPlaceholder) {

            photoPlaceholder.style.display =
                "none";

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


                if (!file) {
                    return;
                }


                // Check image
                if (!file.type.startsWith("image/")) {

                    alert(
                        "Please select an image file."
                    );

                    photoInput.value = "";

                    return;
                }


                // ==================================
                // READ IMAGE
                // ==================================

                const reader =
                    new FileReader();


                reader.onload = function () {

                    const img =
                        new Image();


                    img.onload = function () {

                        // ==================================
                        // CREATE CANVAS
                        // ==================================

                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );


                        // Maximum size
                        const maxWidth = 800;
                        const maxHeight = 800;


                        let width =
                            img.width;

                        let height =
                            img.height;


                        // Resize large photo
                        if (
                            width > maxWidth ||
                            height > maxHeight
                        ) {

                            const ratio =
                                Math.min(
                                    maxWidth / width,
                                    maxHeight / height
                                );


                            width =
                                Math.round(
                                    width * ratio
                                );

                            height =
                                Math.round(
                                    height * ratio
                                );

                        }


                        canvas.width = width;
                        canvas.height = height;


                        // Draw image
                        ctx.drawImage(
                            img,
                            0,
                            0,
                            width,
                            height
                        );


                        // ==================================
                        // COMPRESS PHOTO
                        // ==================================

                        let quality = 0.8;

                        const maxSize =
                            200 * 1024;


                        function compressPhoto() {

                            const compressedPhoto =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    quality
                                );


                            const sizeInBytes =
                                Math.round(
                                    (compressedPhoto.length * 3) / 4
                                );


                            console.log(
                                "Photo size:",
                                Math.round(
                                    sizeInBytes / 1024
                                ),
                                "KB"
                            );


                            // Reduce quality
                            if (
                                sizeInBytes > maxSize &&
                                quality > 0.2
                            ) {

                                quality -= 0.1;

                                compressPhoto();

                                return;
                            }


                            // Still too large
                            if (
                                sizeInBytes > maxSize
                            ) {

                                alert(
                                    "Photo is too large. Please choose another photo."
                                );

                                photoInput.value = "";

                                return;
                            }


                            // ==================================
                            // SAVE PHOTO
                            // ==================================

                            photoData =
                                compressedPhoto;


                            // ==================================
                            // SHOW PHOTO IMMEDIATELY
                            // ==================================

                            showPhotoPreview(
                                photoData
                            );


                            console.log(
                                "Photo ready!"
                            );

                        }


                        compressPhoto();

                    };


                    img.src =
                        reader.result;

                };


                reader.readAsDataURL(file);

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
                encodeURIComponent(userEmail)
            );


        if (response.ok) {

            const profile =
                await response.json();


            // Name
            document.getElementById("name").value =
                profile.name ||
                userName ||
                "";


            // Email
            document.getElementById("email").value =
                profile.email ||
                userEmail;


            // Phone
            document.getElementById("phone").value =
                profile.phone ||
                "";


            // Skills
            document.getElementById("skills").value =
                profile.skills ||
                "";


            // Experience
            document.getElementById("experience").value =
                profile.experience ||
                "";


            // Location
            document.getElementById("location").value =
                profile.location ||
                "";


            // Existing photo
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


    // ==========================================
    // SAVE PROFILE
    // ==========================================

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


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
            // CHECK ALL 7 FIELDS
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

                name: name,

                email: email,

                phone: phone,

                skills: skills,

                experience: experience,

                location: location,

                photo: photoData

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


                    // Keep photo visible
                    showPhotoPreview(
                        photoData
                    );

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
