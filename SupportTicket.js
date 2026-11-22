
const mongoose = require("mongoose");

// Support Ticket Schema
const supportTicketSchema = new mongoose.Schema({

    ticketNumber: {
        type: String,
        unique: true,
        default: function () {
            return "TKT-" + Date.now() + "-" +
                Math.floor(1000 + Math.random() * 9000);
        }
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    userName: {
        type: String,
        required: true
    },

    userEmail: {
        type: String,
        required: true
    },

    userRole: {
        type: String,
        enum: ["jobseeker", "employer"],
        required: true
    },

    category: {
        type: String,
        enum: [
            "Login & Account",
            "Job Posting",
            "Job Application",
            "Profile",
            "Website Issue",
            "Other"
        ],
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "In Progress", "Resolved"],
        default: "Pending"
    },

    replies: [
        {
            senderName: String,
            senderRole: String,
            message: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

}, {
    timestamps: true
});

// Create Model
const SupportTicket = mongoose.model(
    "SupportTicket",
    supportTicketSchema
);

module.exports = SupportTicket;
