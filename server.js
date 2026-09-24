require("dotenv").config();

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


// =====================================================
// CORS
// =====================================================

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


// =====================================================
// JSON DATA
// 5 MB limit because profile photo is sent as Base64
// =====================================================

app.use(express.json({
    limit: "5mb"
}));
// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

function verifyToken(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                message: "Login required"
            });

        }

        const token =
            authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({
                message: "Token missing"
            });

        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

}

// =====================================================
// MONGODB CONNECTION
// =====================================================

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        console.error(
            "MongoDB Connection Error:",
            error.message
        );
    });


// =====================================================
// TEST API
// =====================================================

app.get("/api/test", (req, res) => {

    res.json({
        message: "Frontend and Backend are connected!"
    });

});


// =====================================================
// REGISTER USER
// =====================================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role,
            deviceId
        } = req.body;


        if (!name || !email || !password || !role || !deviceId) {

            return res.status(400).json({
                message: "Please fill all fields"
            });

        }


        // Only normal users can register
        if (
            role !== "jobseeker" &&
            role !== "employer"
        ) {

            return res.status(400).json({
                message: "Invalid account type"
            });

        }


        // Check email
        const existingUser =
            await User.findOne({
                email: email
            });


        if (existingUser) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }


        // Check device
        const existingDevice =
            await User.findOne({
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


        await user.save();


        res.status(201).json({

            message: "Registration successful!"

        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error",
            error: error.message

        });

    }

});


// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        // Find user
        const user =
            await User.findOne({
                email: email
            });


        if (!user) {

            return res.status(400).json({

                message: "User not found"

            });

        }


        // Check password
        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordCorrect) {

            return res.status(400).json({

                message: "Wrong password"

            });

        }


        // Create token
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


        res.json({

            message: "Login successful!",

            name: user.name,

            email: user.email,

            role: user.role,

            token: token

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error"

        });

    }

});


// =====================================================
// GET ALL JOBS
// =====================================================

app.get("/api/jobs", async (req, res) => {

    try {

        const jobs =
            await Job.find();

        res.status(200).json(jobs);

    } catch (error) {

        console.error(
            "GET JOBS ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error",
            error: error.message

        });

    }

});


// =====================================================
// POST JOB
// =====================================================

app.post("/api/jobs", async (req, res) => {

    try {

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


        res.status(201).json({

            message: "Job posted successfully!",

            job: job

        });


    } catch (error) {

        console.error(
            "POST JOB ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error",
            error: error.message

        });

    }

});


// =====================================================
// GET SINGLE JOB
// =====================================================

app.get("/api/jobs/:id", async (req, res) => {

    try {

        const job =
            await Job.findById(
                req.params.id
            );


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


// =====================================================
// UPDATE JOB
// =====================================================

app.put("/api/jobs/:id", async (req, res) => {

    try {

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

                req.params.id,

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

            message:
                "Job updated successfully!",

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


// =====================================================
// DELETE JOB
// =====================================================

app.delete("/api/jobs/:id", async (req, res) => {

    try {

        const jobId =
            req.params.id;


        const deletedJob =
            await Job.findByIdAndDelete(
                jobId
            );


        if (!deletedJob) {

            return res.status(404).json({

                message: "Job not found"

            });

        }


        // Delete applications of this job
        await Application.deleteMany({

            jobId: jobId

        });


        res.status(200).json({

            message:
                "Job deleted successfully!"

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


// =====================================================
// GET EMPLOYER JOBS
// =====================================================

app.get("/api/employer/jobs", async (req, res) => {

    try {

        const email =
            req.query.email;


        if (!email) {

            return res.status(400).json({

                message:
                    "Employer email is required"

            });

        }


        const jobs =
            await Job.find({

                employerEmail: email

            });


        res.status(200).json(jobs);


    } catch (error) {

        console.error(
            "EMPLOYER JOBS ERROR:",
            error
        );

        res.status(500).json({

            message: "Server error",
            error: error.message

        });

    }

});


// =====================================================
// APPLY FOR JOB
// =====================================================

app.post("/api/apply", async (req, res) => {

    try {

        const {
            jobId,
            applicantName,
            applicantEmail
        } = req.body;


        if (
            !jobId ||
            !applicantName ||
            !applicantEmail
        ) {

            return res.status(400).json({

                message:
                    "All fields are required"

            });

        }


        // Check job
        const job =
            await Job.findById(
                jobId
            );


        if (!job) {

            return res.status(404).json({

                message:
                    "Job not found"

            });

        }


        // Check Job Seeker profile
        const profile =
            await Profile.findOne({

                email: applicantEmail

            });


        if (!profile) {

            return res.status(400).json({

                message:
                    "Please complete your profile before applying."

            });

        }


        // Photo is compulsory
        if (
            !profile.name ||
            !profile.email ||
            !profile.phone ||
            !profile.skills ||
            !profile.experience ||
            !profile.location ||
            !profile.photo
        ) {

            return res.status(400).json({

                message:
                    "Please complete all profile details and upload your profile photo before applying."

            });

        }


        // Check duplicate application
        const existingApplication =
            await Application.findOne({

                jobId: jobId,

                applicantEmail:
                    applicantEmail

            });


        if (existingApplication) {

            return res.status(400).json({

                message:
                    "You have already applied for this job."

            });

        }


        // Create application
        const application =
            new Application({

                jobId: jobId,

                applicantName:
                    applicantName,

                applicantEmail:
                    applicantEmail

            });


        await application.save();


        res.status(201).json({

            message:
                "Application submitted successfully!",

            application:
                application

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


// =====================================================
// GET APPLICATIONS
// =====================================================

app.get("/api/applications", async (req, res) => {

    try {

        const email =
            req.query.email;

        const employerEmail =
            req.query.employerEmail;


        // ---------------------------------------------
        // JOB SEEKER APPLICATIONS
        // ---------------------------------------------

        if (email) {

            const applications =
                await Application.find({

                    applicantEmail:
                        email

                }).populate("jobId");


            return res.status(200).json(
                applications
            );

        }


        // ---------------------------------------------
        // EMPLOYER APPLICATIONS
        // ---------------------------------------------

        if (employerEmail) {

            const jobs =
                await Job.find({

                    employerEmail:
                        employerEmail

                });


            const jobIds =
                jobs.map(
                    job => job._id
                );


            const applications =
                await Application.find({

                    jobId: {
                        $in: jobIds
                    }

                }).populate("jobId");


            return res.status(200).json(
                applications
            );

        }


        return res.status(400).json({

            message:
                "Email is required"

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


// =====================================================
// GET APPLICATIONS FOR ONE JOB
// =====================================================

app.get(
    "/api/applications/job/:jobId",
    async (req, res) => {

        try {

            const applications =
                await Application.find({

                    jobId:
                        req.params.jobId

                }).populate("jobId");


            res.status(200).json(
                applications
            );


        } catch (error) {

            console.error(
                "JOB APPLICATIONS ERROR:",
                error
            );

            res.status(500).json({

                message: "Server error",
                error: error.message

            });

        }

    }
);


// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

app.put(
    "/api/applications/:id",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            if (
                !status ||
                ![
                    "Pending",
                    "Accepted",
                    "Rejected"
                ].includes(status)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid application status"

                });

            }


            const application =
                await Application.findByIdAndUpdate(

                    req.params.id,

                    {
                        status: status
                    },

                    {
                        new: true
                    }

                );


            if (!application) {

                return res.status(404).json({

                    message:
                        "Application not found"

                });

            }


            res.status(200).json({

                message:
                    "Application status updated successfully",

                application:
                    application

            });


        } catch (error) {

            console.error(
                "UPDATE APPLICATION ERROR:",
                error
            );

            res.status(500).json({

                message: "Server error",
                error: error.message

            });

        }

    }
);


// =====================================================
// CREATE / UPDATE JOB SEEKER PROFILE
// =====================================================

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


        // All 7 fields required
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
        const user =
            await User.findOne({

                email: email

            });


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        // Only Job Seeker
        if (
            user.role !== "jobseeker"
        ) {

            return res.status(403).json({

                message:
                    "Profile is only available for Job Seekers"

            });

        }


        // Create / Update profile
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

// =====================================================
// GET JOB SEEKER PROFILE
// =====================================================

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


        res.status(200).json({

            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            skills: profile.skills,
            experience: profile.experience,
            location: profile.location,
            photo: profile.photo

        });


    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

});

// =====================================================
// ADMIN - GET ALL USERS
// =====================================================

app.get("/api/admin/users", async (req, res) => {

    try {

        const users =
            await User.find()
                .select("-password")
                .sort({
                    _id: -1
                });


        res.status(200).json(
            users
        );


    } catch (error) {

        console.error(
            "ADMIN USERS ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Unable to load users"

        });

    }

});
// =====================================================
// EMPLOYER VIEW APPLICANT PROFILE
// ONLY EMPLOYER WHO OWNS THE JOB CAN VIEW IT
// =====================================================

app.get(
    "/api/employer/applicant-profile",
    verifyToken,
    async (req, res) => {

        try {

            // -----------------------------------------
            // ONLY EMPLOYER
            // -----------------------------------------

            if (req.user.role !== "employer") {

                return res.status(403).json({
                    message:
                        "Only employers can view applicant profiles"
                });

            }


            const jobId =
                req.query.jobId;

            const applicantEmail =
                req.query.email;


            if (!jobId || !applicantEmail) {

                return res.status(400).json({
                    message:
                        "Job ID and applicant email are required"
                });

            }


            // -----------------------------------------
            // CHECK JOB
            // -----------------------------------------

            const job =
                await Job.findById(jobId);


            if (!job) {

                return res.status(404).json({
                    message: "Job not found"
                });

            }


            // -----------------------------------------
            // CHECK JOB OWNER
            // -----------------------------------------

            if (
                job.employerEmail !== req.user.email
            ) {

                return res.status(403).json({
                    message:
                        "You are not allowed to view applicants for this job"
                });

            }


            // -----------------------------------------
            // CHECK APPLICATION
            // -----------------------------------------

            const application =
                await Application.findOne({

                    jobId: jobId,

                    applicantEmail:
                        applicantEmail

                });


            if (!application) {

                return res.status(403).json({
                    message:
                        "This applicant has not applied for your job"
                });

            }


            // -----------------------------------------
            // GET APPLICANT PROFILE
            // -----------------------------------------

            const profile =
                await Profile.findOne({

                    email: applicantEmail

                });


            if (!profile) {

                return res.status(404).json({
                    message:
                        "Applicant profile not found"
                });

            }


            // -----------------------------------------
            // SEND PROFILE
            // -----------------------------------------

            res.status(200).json({

                name: profile.name,

                email: profile.email,

                phone: profile.phone,

                skills: profile.skills,

                experience: profile.experience,

                location: profile.location,

                photo: profile.photo

            });


        } catch (error) {

            console.error(
                "EMPLOYER APPLICANT PROFILE ERROR:",
                error
            );

            res.status(500).json({

                message: "Server error"

            });

        }

    }
);


// =====================================================
// ADMIN - GET ALL JOBS
// =====================================================

app.get("/api/admin/jobs", async (req, res) => {

    try {

        const jobs =
            await Job.find()
                .sort({
                    _id: -1
                });


        res.status(200).json(
            jobs
        );


    } catch (error) {

        console.error(
            "ADMIN JOBS ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Unable to load jobs"

        });

    }

});


// =====================================================
// CREATE ADMIN ACCOUNT
// =====================================================

app.post("/api/create-admin", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Please fill all fields"

            });

        }


        const existingUser =
            await User.findOne({
                email: email
            });


        if (existingUser) {

            return res.status(400).json({

                message:
                    "This email is already registered"

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const admin =
            new User({

                name: name,

                email: email,

                password:
                    hashedPassword,

                role: "admin"

            });


        await admin.save();


        res.status(201).json({

            message:
                "Admin account created successfully!"

        });


    } catch (error) {

        console.error(
            "CREATE ADMIN ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Server error"

        });

    }

});


// =====================================================
// ADMIN - CREATE USER
// =====================================================

app.post(
    "/api/admin/create-user",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password,
                role
            } = req.body;


            if (
                !name ||
                !email ||
                !password ||
                !role
            ) {

                return res.status(400).json({

                    message:
                        "Please fill all fields"

                });

            }


            if (
                role !== "jobseeker" &&
                role !== "employer"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid account type"

                });

            }


            const existingUser =
                await User.findOne({
                    email: email
                });


            if (existingUser) {

                return res.status(400).json({

                    message:
                        "Email already registered"

                });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            const user =
                new User({

                    name: name,

                    email: email,

                    password:
                        hashedPassword,

                    role: role

                });


            await user.save();


            res.status(201).json({

                message:
                    "User account created successfully!"

            });


        } catch (error) {

            console.error(
                "ADMIN CREATE USER ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Server error"

            });

        }

    }
);


// =====================================================
// ADMIN - DELETE USER
// =====================================================

app.delete(
    "/api/admin/users/:id",
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    message:
                        "User not found"

                });

            }


            if (
                user.role === "admin"
            ) {

                return res.status(403).json({

                    message:
                        "Admin account cannot be deleted"

                });

            }


            await User.findByIdAndDelete(
                req.params.id
            );


            res.status(200).json({

                message:
                    "User deleted successfully"

            });


        } catch (error) {

            console.error(
                "DELETE USER ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to delete user"

            });

        }

    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
