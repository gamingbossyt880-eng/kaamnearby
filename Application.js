const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({

    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },

    applicantName: {
        type: String,
        required: true
    },

    applicantEmail: {
        type: String,
        required: true
    },

    appliedAt: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Accepted",
            "Rejected"
        ],
        default: "Pending"
    }

});

const Application =
    mongoose.model(
        "Application",
        applicationSchema
    );

module.exports = Application;
