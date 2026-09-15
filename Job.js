const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({

    jobTitle: {
        type: String,
        required: true
    },

    shopName: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    salary: {
        type: String,
        required: true
    },

    workingHours: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    // Employer who posted this job
    employerEmail: {
        type: String,
        required: true
    }

});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;