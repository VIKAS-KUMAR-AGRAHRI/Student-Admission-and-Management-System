const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const userSignup = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: Number,
        required: true,
        unique: true,
    },

    countryCode: {
        type: String,
        required: true,
    },
    state: {
        type: String
    },
    city: {
        type: String,
    },
    pass: {
        type: String,
        required: true,
    },
    statusCode: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    userType: {
        type: String,
        enum: ['STUDENT', 'ADMIN', 'FACULTY'],
        default: 'STUDENT',
    },
    otp: {
        type: Number
    },
    otpTime: {
        type: Number
    },
    otpVarify: {
        type: Boolean,
        enum: [true, false],
        default: false
    }
});
const usermodel = mongoose.model("user", userSignup);
module.exports = usermodel;
