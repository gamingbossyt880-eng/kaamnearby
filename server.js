const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./User");
const Job = require("./Job");
const Application = require("./Application");
const Profile = require("./Profile");
const app = express();
const PORT = process.env.PORT || 5000;
require("dotenv").config();

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

        const {
            name,
            email,
            password,
            role,
            deviceId
        } = req.body;


        // Check required fields

        if (!name || !email || !password || !role || !deviceId) {

            return res.status(400).json({
                message: "Please fill all fields"
            });

        }


        // Public users can only select these roles

        if (role !== "jobseeker" && role !== "employer") {

            return res.status(400).json({
                message: "Invalid account type"
            });

        }


        // Check email

        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }


        // Check device

        const existingDevice = await User.findOne({
            deviceId: deviceId
        });

        if (existingDevice) {

            return res.status(400).json({
                message:
                    "This device has already been used to create an account."
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user = new User({

            name: name,

            email: email,

            password: hashedPassword,

            role: role,

            deviceId: deviceId

        });


        // Save user

        await user.save();


        res.status(201).json({

            message: "Registration successful!"

        });


    } catch (error) {

        console.log("REGISTER ERROR:", error);

        res.status(500).json({

            message: "Server error"

        });

    }

});

       
// ===============================
// LOGIN API
// ===============================

// ===============================
// LOGIN API
// ===============================

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
        const user = await User.findOne({
            email: email
        });

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

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Login successful
        res.json({
            message: "Login successful!",
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        });

    } catch (error) {

        console.log("LOGIN ERROR:", error);

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
// ADMIN - GET ALL USERS
// ===============================

app.get("/api/admin/users", async (req, res) => {

    try {

        const users = await User.find()
            .select("-password")
            .sort({ _id: -1 });

        res.json(users);

    } catch (error) {

        console.log("ADMIN USERS ERROR:", error);

        res.status(500).json({
            message: "Unable to load users"
        });
    }

});
// ===============================
// CREATE ADMIN ACCOUNT
// ===============================

app.post("/api/create-admin", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "This email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();

        res.status(201).json({
            message: "Admin account created successfully!"
        });

    } catch (error) {

        console.log("CREATE ADMIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
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
// CREATE / UPDATE JOB SEEKER PROFILE
// ===============================

app.post("/api/profile", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            skills,
            experience,
            location,
            photo
        } = req.body;


        // Check required fields

        if (
            !name ||
            !email ||
            !phone ||
            !skills ||
            !experience ||
            !location ||
            !photo
        ) {

            return res.status(400).json({
                message:
                    "Please complete all profile details and upload a profile photo."
            });

        }


        // Check user

        const user = await User.findOne({
            email: email
        });


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        // Only Job Seeker

        if (user.role !== "jobseeker") {

            return res.status(403).json({
                message:
                    "Profile is only available for Job Seekers"
            });

        }


        // Create / Update Profile

        const profile =
            await Profile.findOneAndUpdate(

                {
                    email: email
                },

                {
                    name: name,
                    email: email,
                    phone: phone,
                    skills: skills,
                    experience: experience,
                    location: location,
                    photo: photo
                },

                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }

            );


        res.status(200).json({

            message:
                "Profile saved successfully!",

            profile:
                profile

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


        // ==========================================
        // EMPLOYER NOT ALLOWED
        // ==========================================

        if (user.role !== "jobseeker") {

            return res.status(403).json({

                message:
                    "Profile is only available for Job Seekers"

            });

        }


        // ==========================================
        // SAVE / UPDATE PROFILE
        // ==========================================

        const profile =
            await Profile.findOneAndUpdate(

                {
                    email: email
                },

                {
                    name: name,
                    email: email,
                    phone: phone,
                    skills: skills,
                    experience: experience,
                    location: location,
                    photo: photo
                },

                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }

            );


        // ==========================================
        // SUCCESS
        // ==========================================

        res.status(200).json({

            message:
                "Profile saved successfully!",

            profile:
                profile

        });


    } catch (error) {

        console.error(
            "SAVE PROFILE ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                error.message

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
// ADMIN - DELETE USER
// ===============================

app.delete("/api/admin/users/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                message: "Admin account cannot be deleted"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {

        console.log("DELETE USER ERROR:", error);

        res.status(500).json({
            message: "Unable to delete user"
        });

    }

});
// ===============================
// ADMIN - GET ALL JOBS
// ===============================

app.get("/api/admin/jobs", async (req, res) => {

    try {

        const jobs = await Job.find()
            .sort({ _id: -1 });

        res.json(jobs);

    } catch (error) {

        console.log("ADMIN JOBS ERROR:", error);

        res.status(500).json({
            message: "Unable to load jobs"
        });

    }

});
// ===============================
// ADMIN - CREATE USER
// ===============================

app.post("/api/admin/create-user", async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        if (role !== "jobseeker" && role !== "employer") {
            return res.status(400).json({
                message: "Invalid account type"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

       const user = new User({
    name: name,
    email: email,
    password: hashedPassword,
    role: role
    // No deviceId because admin created this account
});
        await user.save();

        res.status(201).json({
            message: "User account created successfully!"
        });

    } catch (error) {

        console.log("ADMIN CREATE USER ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});
// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
