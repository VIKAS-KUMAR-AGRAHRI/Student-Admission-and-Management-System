const helper = require('../helper/common');
const Admission = require('../models/admission_model');
const usermodel = require("../models/user_model");
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const secretKey = "secretkey";

module.exports = {
    SignIn: async (req, res) => {
        try {
            let oneuser = await usermodel.findOne({
                $or: [{ email: req.body.email }, { mobile: req.body.mobile }]
            });
            console.log("check 1",oneuser)
            if (!oneuser) {
                // console.log("login unsuccessfullll...");
                return res.json({
                    responseCode: 404,
                    responseMessage: "User does not exist",
                });
            }
            console.log("check 2")
            if (oneuser.statusCode != "ACTIVE") {
                return res.json({
                    responseCode: 404,
                    responseResult: "BLOCKED",
                    responseMessage: "CONTACT YOUR COLLEGE",
                });
            }
            const passwordMatch = bcrypt.compareSync(req.body.pass, oneuser.pass);

            if (passwordMatch) {
                console.log("check 3")
                const data = {
                    id: oneuser.id,
                    email: oneuser.email,
                    userType: oneuser.userType,
                };
                // console.log("login successfully user", oneuser);
                const tokenResponse = await helper.tokengenerate(data);
                if(tokenResponse==false){
                    return res.json({
                        responseCode:500,
                        responseMessage:"Internal Server Error",
                        responseResult:"Token not generatd"
                    })
                }
                console.log(tokenResponse,"this is token")
                return res.json({
                    responseCode:200,
                    responseMessage:"Token generated successfully",
                    Token:tokenResponse
                })
            } else {
                return res.json({
                    responseCode: 401,
                    responseMessage: "Invalid email or password",
                });
            }

        } catch (error) {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                responseResult: error,
            });
        }
    },
    SignUp: async (req, res) => {
        try {
            console.log(req.body);
            console.log("check 1")
            //we check that from this mobile or email user exist or not .............
            const query = {
                $and: [
                    { $or: [{ mobile: req.body.mobile }, { email: req.body.email }] },
                    { statusCode: { $ne: "DELETE" } },
                ],
            };
            console.log("check 2")
            const model = await usermodel.findOne(query);
            console.log("check 3",model)
            if (model) {
                console.log("check 4")
                if (req.body.email == model.email) {
                    return res.json({
                        responseCode: 404,
                        responseMessage: "Email already exists",
                    });
                }
                if (req.body.mobile == model.mobile) {
                    return res.json({
                        responseCode: 404,
                        responseMessage: "Mobile number already exists",
                    });
                }
            }
            // Generate OTP and hash password
            console.log("check 4")
            req.body.otp = helper.otpgeneration();
            console.log(req.body.otp)
            req.body.otpTime = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
            req.body.pass = bcrypt.hashSync(req.body.pass, 10);

            // Send OTP mail
            helper.domail(req.body.email, "Otp verification", `Your otp is ${req.body.otp}`);


            const save = await usermodel.create(req.body);
            return res.status(200).json({
                responseCode: 200,
                responseMessage: "Signup successfully",
                responseResult: save,
            });
        }
        catch (error) {
            return res.status(500).json({
                responseCode: 500,
                responseMessage: "Something went wrong",
                responseResult: error,
            });
        }
    },
    otpVarify: async (req, res) => {
        try {
            const userfind = await usermodel.findOne({
                $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
            });
            if (!userfind) {
                return res.json({
                    responseCode: 404,
                    responseMessage: "User does not Exist!",
                });
            } else {
                const curTime = Date.now();
                if (curTime > userfind.otpTime) {
                    return res.json({
                        responseCode: 400,
                        responseMessage: "OTP Expired",
                    });
                    //here we give New otp generation resend functionality
                } else {
                    // console.log((Number(req.body.otp))===(Number(userfind.otp)));
                    if (Number(req.body.otp) == Number(userfind.otp)) {
                        //then do otpVarify status True in the database
                        const update = await usermodel.findByIdAndUpdate(
                            { _id: userfind._id },
                            { $set: { otpVarify: true } },
                            { new: true }
                        );
                        if (update) {
                            return res.json({
                                responseCode: 200,
                                responseMessage: "OTP successfully verify.",
                            });
                        }
                        // res.send('hello from matched');
                    } else {
                        //Otherwise provided otp not matched to generated otp
                        //And give Resend option to resend otp at the gmail
                        return res.json({
                            responseCode: 400,
                            responseMessage: "OTP does not matched",
                        });
                    }
                }
            }
        } catch {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error!",
            });
        }
    },

    resendOtp: async (req, res) => {
        try {
            const userfind = await usermodel.findOne({
                $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
            });
            if (!userfind) {
                return res.json({
                    responseCode: 404,
                    responseMessage: "User does not Exist!",
                });
            } else {
                const otp = otpgeneration.otpgeneration();
                const info = domail(
                    req.body.email,
                    "Otp verification",
                    `Your otp is ${otp}`
                );
                const otpTime = Date.now() + 10 * 50 * 1000;
                const update = await usermodel.findByIdAndUpdate(
                    { _id: userfind._id },
                    { $set: { otp: otp, otpTime: otpTime } }
                );
                return res.json({
                    responseCode: 200,
                    responseMessage: "Again Otp send successfully",
                    responseResult: update,
                });
            }
        } catch {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error!",
            });
        }
    },

    deleteUser: async (req, res) => {
        //This module related to soft deletetion of user..................................................................
        try {
            let deleteuser = await usermodel.updateOne(
                { _id: req.query._id },
                { statusCode: "DELETE" }
            );
            if (deleteuser) {
                console.log("deletion successfully....");
                return res.json({ responseCode: 200, responseMessage: "successfulll" });
            } else {
                console.log("deletion unsuccessfullll");
                return res.json({
                    responseCode: 500,
                    responseMessage: "there is something error.",
                });
            }
        } catch (error) {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },

    updateUser: async (req, res) => {
        const newdata = { firstName: req.query.name };
        const filter = { mobile: req.query.mobile };
        let search = await usermodel.findOneAndUpdate(filter, newdata, {
            new: true,
        });
        if (search) {
            return res.json({
                responseCode: 200,
                responseMessage: `user ${search.firstName} data updated successfully`,
            });
        } else {
            return res.json({
                responseCode: 500,
                responseMessage: "there is some error in updating data of user data",
            });
        }
    },

    updatePassword: async (req, res) => {
        try {
            const query = {
                $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
            };
            const search = await usermodel.findOne(query);
            console.log(search);
            if (!search) {
                return res.json({
                    responseCode: 404,
                    responseMessage: "Data Not Found",
                });
            }
            if (req.body.pass === req.body.cpass) {
                console.log("check 1");
                const encryptedpass = req.body.pass;
                const update = await usermodel.updateOne(
                    { _id: search._id },
                    { $set: { pass: encryptedpass } }
                );
                console.log("check 2");
                if (!update) {
                    return res.json({
                        responseCode: 404,
                        responseMessage: "Password Not updated",
                    });
                }

                return res.json({
                    responseCode: 200,
                    responseMessage: "Password updated successfull",
                });
            } else {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Password and Confirm Password does not matched",
                });
            }
        } catch (error) {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },

    Profile: async (req, res) => {
        try {
            const profile = await usermodel.findOne({ _id: req.user.data.id });
            return res.json({
                responseCode: 200,
                responseMessage: "successfully fetched",
                responseResult: profile,
            });
        } catch {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
    admissionForm: async (req, res) => {
        try {
            console.log("check 1 in admission form")
            const {
                user_id, fullName, dateOfBirth, gender, nationality, permanentAddress, email, phoneNumber, institutionName, completionYear, grades, examName, score, rank, program, preferredCourse, fatherName, motherName, guardianContactNumber
            } = req.body;
            const newAdmission = new Admission({
                user_id,
                personalInfo: {
                    fullName,
                    dateOfBirth,
                    gender,
                    nationality
                },
                contactInfo: {
                    permanentAddress,
                    email,
                    phoneNumber
                },
                academicInfo: {
                    previouseCollege: {
                        institutionName,
                        completionYear,
                        grades
                    },
                    entranceExam: {
                        examName,
                        score,
                        rank
                    }
                },
                courseInfo: {
                    program,
                    preferredCourse
                },
                guardianInfo: {
                    fatherName,
                    motherName,
                    guardianContactNumber
                }
            });
            const savedAdmission = await newAdmission.save();
            console.log("review your form", savedAdmission)
            return res.json({ responseCode: 201, responseMessage: "Request has been sent", review: savedAdmission })
        } catch (error) {
            console.error('Error creating admission:', error);
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" })
        }
    },
    Forget: async (req, res) => {
        try {
            const email = req.body.email;
            const search = await usermodel.findOne({ email: email });
            console.log("it is working");
            if (!search) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Email does not Exist!",
                });
            } else {
                const link =
                    "http://localhost:4500/user/resetPassword?id=" + search._id;
                const info = domail(
                    email,
                    "Reset Your Password",
                    `use this link ${link}`
                );
                return res.json({
                    responseCode: 200,
                    responseMessage: "Link Sent successfully",
                    userid: search._id,
                });
            }
        } catch {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
    Reset: async (req, res) => {
        try {
            const id = req.body.id;
            const search = await usermodel.findById({ _id: id });
            if (!search) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Id is not valid!",
                });
            } else {
                if (req.body.pass === req.body.cpass) {
                    req.body.pass = bcrypt.hashSync(req.body.pass, 10);
                    const update = await usermodel.updateOne(
                        { _id: id },
                        { $set: { pass: req.body.pass } }
                    );
                    if (!update) {
                        return res.json({
                            responseCode: 400,
                            responseMessage: "Password Not updated",
                        });
                    } else {
                        return res.json({
                            responseCode: 200,
                            responseMessage: "Password updated successfully",
                        });
                    }
                }
            }
        } catch {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
};
