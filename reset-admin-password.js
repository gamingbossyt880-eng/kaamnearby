const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./module/models/User");

const MONGO_URI = process.env.MONGO_URI;

async function resetAdminPassword() {
    try {
        await mongoose.connect(MONGO_URI);

        console.log("MongoDB connected");

        const admin = await User.findOne({
            email: "heyyabhij29@gmail.com",
            role: "admin"
        });

        if (!admin) {
            console.log("Admin account not found");
            process.exit();
        }

        const newPassword = "Abhijain2007";

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;

        await admin.save();

        console.log("Admin password changed successfully!");

        await mongoose.disconnect();

    } catch (error) {
        console.error("ERROR:", error);
    }
}

resetAdminPassword();