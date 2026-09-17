const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./User");
const Job = require("./Job");
const Application = require("./Application");
const Profile = require("./Profile");
const app = express();
const PORT = 5000;
require("dotenv").config();

app.use(express.json());

// ===============================
// CORS
// ===============================

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    next();
});

// Read JSON data
app.use(express.json());


// ===============================
// MONGODB CONNECTION
// ===============================

// ================================
// MONGODB CONNECTION
// ================================

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error.message);
    });
// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        message: "Frontend and Backend are connected!"
    });
});


// ===============================
// REGISTER USER
// ===============================

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password, role } = req.body;


        // Check empty fields
        if (!name || !email || !password || !role) {

            return res.status(400).json({
                message: "Please fill all fields"
            });

        }


        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create user
        const user = new User({

            name: name,
            email: email,
            password: hashedPassword,
            role: role

        });


        // Save user
        await user.save();


        res.status(201).json({

            message: "Registration successful!"

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Server error"

        });

    }

});
// Login API
app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check empty fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Wrong password"
            });
        }

        // Login successful
        res.json({
    message: "Login successful!",
    name: user.name,
    email: user.email,
    role: user.role
});

    } catch (error) {

        console.log("Login Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});
app.get("/api/jobs", async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/jobs", async (req, res) => {

    try {

        console.log("Job received:", req.body);

        const {
    jobTitle,
    shopName,
    location,
    salary,
    workingHours,
    description,
    employerEmail
} = req.body;

        if (
    !jobTitle ||
    !shopName ||
    !location ||
    !salary ||
    !workingHours ||
    !description ||
    !employerEmail
) {
    return res.status(400).json({
        message: "Please fill all fields"
    });
}

        const job = new Job({

    jobTitle: jobTitle,
    shopName: shopName,
    location: location,
    salary: salary,
    workingHours: workingHours,
    description: description,

    employerEmail: employerEmail
});

        await job.save();

        console.log("Job saved successfully!");

        res.status(201).json({
            message: "Job posted successfully!",
            job: job
        });

    } catch (error) {

        console.error("POST JOB ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});
// ===============================
// APPLY FOR JOB
// ===============================

app.post("/api/apply", async (req, res) => {

    try {

        const {
            jobId,
            applicantName,
            applicantEmail
        } = req.body;


        // Check required data
        if (!jobId || !applicantName || !applicantEmail) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        // Check if already applied
        const existingApplication =
            await Application.findOne({
                jobId: jobId,
                applicantEmail: applicantEmail
            });


        if (existingApplication) {

            return res.status(400).json({
                message: "You have already applied for this job."
            });

        }


        // Create new application
        const application = new Application({

            jobId: jobId,
            applicantName: applicantName,
            applicantEmail: applicantEmail

        });


        await application.save();


        res.status(201).json({

            message: "Application submitted successfully!",

            application: application

        });


    } catch (error) {

        console.error(
            "APPLY JOB ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error",

            error: error.message

        });

    }

});
// ===============================
// GET EMPLOYER'S JOBS
// ===============================

app.get("/api/employer/jobs", async (req, res) => {

    try {

        const email = req.query.email;

        if (!email) {
            return res.status(400).json({
                message: "Employer email is required"
            });
        }

        const jobs = await Job.find({
            employerEmail: email
        });

        res.status(200).json(jobs);

    } catch (error) {

        console.error("EMPLOYER JOBS ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});
// ===============================
// GET APPLICATIONS API
// ===============================

app.get("/api/applications", async (req, res) => {

    try {

        const email = req.query.email;
        const employerEmail = req.query.employerEmail;

        // ===============================
        // JOBSEEKER APPLICATIONS
        // ===============================

        if (email) {

            const applications = await Application.find({
                applicantEmail: email
            }).populate("jobId");

            return res.status(200).json(applications);
        }


        // ===============================
        // EMPLOYER APPLICATIONS
        // ===============================

        if (employerEmail) {

            // Find jobs posted by this employer
            const jobs = await Job.find({
                employerEmail: employerEmail
            });

            // Get job IDs
            const jobIds = jobs.map(job => job._id);

            // Find applications for those jobs
            const applications = await Application.find({
                jobId: { $in: jobIds }
            }).populate("jobId");

            return res.status(200).json(applications);
        }


        // ===============================
        // NO EMAIL
        // ===============================

        return res.status(400).json({
            message: "Email is required"
        });


    } catch (error) {

        console.error(
            "GET APPLICATIONS ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});
// ===============================
// GET APPLICATIONS FOR ONE JOB
// ===============================

app.get("/api/applications/job/:jobId", async (req, res) => {

    try {

        const jobId = req.params.jobId;

        console.log("Loading applications for Job ID:", jobId);

        const applications = await Application.find({
            jobId: jobId
        }).populate("jobId");

        res.status(200).json(applications);

    } catch (error) {

        console.error("JOB APPLICATIONS ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});
// ===============================
// CREATE / UPDATE PROFILE
// ===============================

app.post("/api/profile", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            skills,
            experience,
            location
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !skills ||
            !experience ||
            !location
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        const profile = await Profile.findOneAndUpdate(
            { email: email },

            {
                name: name,
                email: email,
                phone: phone,
                skills: skills,
                experience: experience,
                location: location
            },

            {
                new: true,
                upsert: true
            }
        );

        res.status(200).json({

            message: "Profile saved successfully!",

            profile: profile

        });

    } catch (error) {

        console.error(
            "SAVE PROFILE ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error",

            error: error.message

        });

    }

});


// ===============================
// GET PROFILE
// ===============================

app.get("/api/profile", async (req, res) => {

    try {

        const email = req.query.email;


        if (!email) {

            return res.status(400).json({
                message: "Email is required"
            });

        }


        const profile =
            await Profile.findOne({
                email: email
            });


        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });

        }


        res.status(200).json(profile);


    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error",

            error: error.message

        });

    }

});
// ===============================
// UPDATE APPLICATION STATUS
// ===============================

app.put("/api/applications/:id", async (req, res) => {

    try {

        const applicationId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        const application = await Application.findByIdAndUpdate(
            applicationId,
            { status: status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: "Application status updated successfully",
            application: application
        });

    } catch (error) {

        console.error("UPDATE APPLICATION ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});

// ===============================
// ACCEPT / REJECT APPLICATION
// ===============================

app.put("/api/applications/:id", async (req, res) => {

    try {

        const { status } = req.body;

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.json({
            message: "Application status updated successfully",
            application: application
        });

    } catch (error) {

        console.error("Update Application Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});
// ===============================
// GET EMPLOYER JOBS
// ===============================

app.get("/api/employer/jobs", async (req, res) => {

    try {

        const email = req.query.email;

        if (!email) {
            return res.status(400).json({
                message: "Employer email is required"
            });
        }

        const jobs = await Job.find({
            employerEmail: email
        });

        res.status(200).json(jobs);

    } catch (error) {

        console.error("GET EMPLOYER JOBS ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});
app.get("/api/profile", async (req, res) => {

    try {

        const email = req.query.email;

        if (!email) {

            return res.status(400).json({
                message: "Email is required"
            });

        }

        const profile = await Profile.findOne({
            email: email
        });

        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });

        }

        res.status(200).json(profile);

    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});
// ==========================================
// DELETE JOB
// ==========================================

app.delete("/api/jobs/:id", async (req, res) => {

    try {

        const jobId = req.params.id;

        const deletedJob =
            await Job.findByIdAndDelete(jobId);

        if (!deletedJob) {

            return res.status(404).json({
                message: "Job not found"
            });

        }

        // Delete applications belonging to this job
        await Application.deleteMany({
            jobId: jobId
        });

        res.status(200).json({
            message: "Job deleted successfully!"
        });

    } catch (error) {

        console.error(
            "DELETE JOB ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});
// ==========================================
// GET SINGLE JOB
// ==========================================

app.get("/api/jobs/:id", async (req, res) => {

    try {

        const jobId = req.params.id;

        const job = await Job.findById(jobId);

        if (!job) {

            return res.status(404).json({
                message: "Job not found"
            });

        }

        res.status(200).json(job);

    } catch (error) {

        console.error(
            "GET SINGLE JOB ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});


// ==========================================
// UPDATE JOB
// ==========================================

app.put("/api/jobs/:id", async (req, res) => {

    try {

        const jobId = req.params.id;

        const {
            jobTitle,
            shopName,
            location,
            salary,
            workingHours,
            description
        } = req.body;


        if (
            !jobTitle ||
            !shopName ||
            !location ||
            !salary ||
            !workingHours ||
            !description
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        const updatedJob =
            await Job.findByIdAndUpdate(

                jobId,

                {
                    jobTitle: jobTitle,
                    shopName: shopName,
                    location: location,
                    salary: salary,
                    workingHours: workingHours,
                    description: description
                },

                {
                    new: true
                }

            );


        if (!updatedJob) {

            return res.status(404).json({
                message: "Job not found"
            });

        }


        res.status(200).json({

            message: "Job updated successfully!",

            job: updatedJob

        });

    } catch (error) {

        console.error(
            "UPDATE JOB ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error",

            error: error.message

        });

    }

});
// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});
