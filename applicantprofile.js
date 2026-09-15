document.addEventListener("DOMContentLoaded", async () => {

    const container =
        document.getElementById("profileContainer");

    const urlParams =
        new URLSearchParams(window.location.search);

    const email =
        urlParams.get("email");

    if (!email) {

        container.innerHTML =
            "<p>Applicant email not found.</p>";

        return;
    }

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/profile?email=" +
                encodeURIComponent(email)
            );

        const profile =
            await response.json();

        if (!response.ok) {

            container.innerHTML =
                "<p>Profile not found.</p>";

            return;
        }

        container.innerHTML = `

            <div class="job-card">

                <h2>${profile.name || "Not provided"}</h2>

                <p>
                    <strong>Email:</strong>
                    ${profile.email || "Not provided"}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${profile.phone || "Not provided"}
                </p>

                <p>
                    <strong>Skills:</strong>
                    ${profile.skills || "Not provided"}
                </p>

                <p>
                    <strong>Experience:</strong>
                    ${profile.experience || "Not provided"}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${profile.location || "Not provided"}
                </p>

                <br>

                <button onclick="contactApplicant('${profile.email}')">
                    Contact Applicant
                </button>

            </div>

        `;

    } catch (error) {

        console.error(
            "PROFILE ERROR:",
            error
        );

        container.innerHTML =
            "<p>Cannot connect to server.</p>";
    }

});


function contactApplicant(email) {

    window.location.href =
        "mailto:" +
        email +
        "?subject=Job Opportunity - Kaam Nearby";

}