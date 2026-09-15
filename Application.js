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
        default: "Pending"
    }

});

module.exports = mongoose.model("Application", applicationSchema);