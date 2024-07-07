const helper = require('../helper/common');
const Admission = require('../models/admission_model');
const usermodel = require("../models/user_model");
const bcrypt = require("bcrypt");
const QRCode = require('qrcode');
module.exports = {
    SignIn: async (req, res) => {
        try {
            //Here i am not checking student status because I want to separately check and inform the student.
            let oneuser = await usermodel.findOne({
                $or: [{ email: req.body.email }, { mobile: req.body.mobile }]
            });
            // console.log("check 1", oneuser)
            if (!oneuser) {
                // console.log("login unsuccessfullll...");
                return res.json({
                    responseCode: 404,
                    responseMessage: "User does not exist",
                });
            }
            console.log("check 2");
            //Status of user we will check here...
            if (oneuser.otpVarify == false) {
                return res.json({
                    responseCode: 403,
                    responseResult: "Unvarified",
                    responseMessage: "Varify your account by Otp varify",
                });
            }
            if (oneuser.statusCode != "ACTIVE") {
                return res.json({
                    responseCode: 403,
                    responseResult: "Blocked",
                    responseMessage: "CONTACT YOUR COLLEGE",
                });
            }
            const passwordMatch = bcrypt.compareSync(req.body.pass, oneuser.pass);
            if (!passwordMatch) {
                return res.json({
                    responseCode: 400,
                    responseResult: "Invalid",
                    responseMessage: "Password does not matched",
                });
            }

            // console.log("check 3")
            //creting payload to generate token...
            const data = {
                id: oneuser._id,
                email: oneuser.email,
                userType: oneuser.userType,
            };
            // console.log("login successfully user", oneuser);
            const tokenResponse = await helper.tokengenerate(data);
            if (tokenResponse == false) {
                return res.json({
                    responseCode: 500,
                    responseMessage: "Internal Server Error",
                    responseResult: "Token not generatd"
                })
            }
            console.log(tokenResponse, "this is token")
            return res.json({
                responseCode: 200,
                responseMessage: "Token generated successfully",
                Token: tokenResponse
            })


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
            //we check that from this mobile or email user exist or not .............
            const query = {$or: [{ mobile: req.body.mobile }, { email: req.body.email }]};
            const model = await usermodel.findOne(query);
            if (model) {
                // console.log("check 4")
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
          
            req.body.otp = helper.otpgeneration();
            // console.log(req.body.otp)
            req.body.otpTime = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
            req.body.pass = bcrypt.hashSync(req.body.pass, 10);

            // Send OTP mail
            helper.domail(req.body.email, "Otp verification", `Your otp is ${req.body.otp}`);


            const save = await usermodel.create(req.body);
            if (!save) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Error in SignUp",
                });
            }
            return res.status(200).json({
                responseCode: 200,
                responseMessage: "SignUp successfully",
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
            }
            if (userfind.otpVarify == true) {
                return res.json({
                    responseCode: 200,
                    responseResult: "Varified",
                    responseMessage: "Account already varified",
                });
            }
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
            }
            if (userfind.otpVarify == true) {
                return res.json({
                    responseCode: 200,
                    responseResult: "Varified",
                    responseMessage: "Account already varified",
                });
            }
            const otp = helper.otpgeneration();
            // Send OTP mail
            helper.domail(req.body.email, "Otp verification", `Your otp is ${otp}`);

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
            const user_id = req.userId;
            console.log("user id", user_id)
            if (!user_id) {
                return res.json({ responseCode: 400, responseMessage: "User ID is required" });

            }
            let deleteuser = await usermodel.updateOne(
                { _id: user_id },
                { statusCode: "DELETE" }
            );
            if (deleteuser) {
                console.log("deletion successfully....");
                return res.json({ responseCode: 200, responseResult: 'Success', responseMessage: "successfully user acount deleted" });
            }
            console.log("deletion unsuccessfully.........");
            return res.json({
                responseCode: 500,
                responseResult: 'Unsuccess',
                responseMessage: "User Accound not delete, Might be some error",
            });

        } catch (error) {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
    updateProfile: async (req, res) => {
        if (!req.userId) {
            return res.json({ responseCode: 400, responseMessage: "User ID is required" });
        }
        const { email, mobile, firstName, lastName } = req.body;
        if (!email && !mobile && !firstName && !lastName) {
            return res.json({
                responseCode: 400,
                responseMessage: "At least one field (email, mobile, first name, or last name) must be provided",
            });
        }
        // Create the update object dynamically

        const alreadyUser = await usermodel.findOne({ $and: [{ $or: [{ email: email }, { mobile: mobile }] }, { statusCode: 'ACTIVE' }] });
        if (alreadyUser) {
            if (alreadyUser.email == email) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Email already in used by someone",
                    responseResult: "Invalid"
                });
            }
            if (alreadyUser.mobile == email) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Mobile already in used by someone",
                    responseResult: "Invalid"
                });
            }

        }
        let updateFields = {};
        if (email) {
            updateFields.email = email;
        }
        if (mobile) {
            updateFields.mobile = mobile;
        }
        if (firstName) {
            updateFields.firstName = firstName;
        }
        if (lastName) {
            updateFields.lastName = lastName;
        }
        try {
            const updatedProfile = await usermodel.findOneAndUpdate(
                {
                    _id: req.userId,
                    userType: req.userType,
                    statusCode: 'ACTIVE'
                },
                { $set: updateFields },
                { new: true }
            );
            if (!updatedProfile) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "User not found or not active",
                    responseResult: "Invalid",
                });
            }
            return res.json({
                responseCode: 200,
                responseMessage: "Profile successfully updated",
                responseResult: updatedProfile,
            });
        } catch (error) {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
    //Here we update password on the basis of old password......................
    updatePassword: async (req, res) => {
        try {
            const user_id = req.userId;
            console.log("user id", user_id)
            if (!user_id) {
                return res.json({ responseCode: 400, responseMessage: "User ID is required", responseResult: "Required" });
            }

            // Check if old password matches
            const user = await usermodel.findById({ _id: user_id });
            if (!user) {
                return res.json({
                    responseCode: 404,
                    responseMessage: "User not found",
                    responseResult: "Invalid"
                });
            }
            const isMatch = bcrypt.compareSync(req.body.oldPass, user.pass);
            if (!isMatch) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Old password is incorrect",
                    responseResult: "Not Matched"
                });
            }
            if (req.body.pass !== req.body.cpass) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "New password and confirm password do not match",
                    responseResult: "Different"
                });
            }
            const encryptedpass = bcrypt.hashSync(req.body.pass, 10);
            const update = await usermodel.findByIdAndUpdate({ _id: user_id }, { $set: { pass: encryptedpass } });
            if (!update) {
                return res.json({
                    responseCode: 404,
                    responseMessage: "Password not updated",
                    responseResult: "Not Updated"
                });
            }
            return res.json({
                responseCode: 200,
                responseMessage: "Password updated successfully",
                responseResult: "Updated"
            });
        } catch (error) {
            console.error("Error updating password:", error);
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                responseResult: "Error"
            });
        }
    },


    Profile: async (req, res) => {
        try {
            if (!req.userId) {
                return res.json({ responseCode: 400, responseMessage: "User ID is required", responseResult: "Required" });
            }
            const profile = await usermodel.findOne({ _id: req.userId });
            return res.json({
                responseCode: 200,
                responseMessage: "successfully fetched",
                responseResult: profile,
            });
        } catch {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                responseResult: "Error"
            });
        }
    },
    admissionForm: async (req, res) => {
        try {
            // const user_id = req.userId;
            // console.log("user id", user_id)
            if (!req.userId) {
                return res.json({ responseCode: 400, responseMessage: "User ID is required" });

            }
            const existentCheck = await Admission.findOne({ user_id: req.userId })
            if (existentCheck) {
                return res.json({ responseCode: 201, responseMessage: 'Form Already Submitted', responseResult: "Pre_submitted" });
            }
            console.log("check 1 in admission form")
            const {
                fullName, dateOfBirth, gender, nationality, permanentAddress, email, phoneNumber, institutionName, completionYear, grades, examName, score, rank, program, preferredCourse, fatherName, motherName, guardianContactNumber
            } = req.body;
            const newAdmission = new Admission({
                user_id: req.userId,
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
            if (!savedAdmission) {
                return res.json({ responseCode: 500, responseMessage: "Form submission failed", responseResult: 'Failed' })
            }
            console.log("review your form", savedAdmission);
            return res.json({ responseCode: 201, responseMessage: "Request has been sent", review: savedAdmission })
        } catch (error) {
            console.error('Error creating admission:', error);
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" })
        }
    },
    formStatus: async (req, res) => {
        try {
            // console.log(req.userId)
            const user_id = req.userId;
            console.log("user id", user_id)
            if (!user_id) {
                return res.json({ responseCode: 400, responseMessage: "User ID is required" });

            }

            const admission = await Admission.findOne({ user_id: user_id });

            if (!admission) {
                return res.json({ responseCode: 404, responseMessage: "Admission form not found" });
            }

            return res.json({ responseCode: 200, responseMessage: "Admission form status fetched successfully", form_status: admission.form_status });
        } catch (error) {
            console.error('Error fetching admission form status:', error);
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" });
        }
    },
    generateQR: async (req, res) => {
        try {
            console.log("user id", req.userId)
            if (!req.userId) {
                return res.json({ responseCode: 400, responseMessage: "User ID is required", responseResult: "Required" });

            }
            const student = await usermodel.findOne({ _id: req.userId });

            if (!student) {
                return res.json({ responseCode: 404, responseMessage: "Student not found", responseResult: "Not Found" });
            }


            const studentDetails = {
                name: student.firstName + student.lastName,
                email: student.email,
                mobile: student.mobile,
            };

            // Generate QR code
            const qrData = JSON.stringify(studentDetails);

            QRCode.toBuffer(qrData, { type: 'image/png' }, (err, buffer) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    return res.status(500).json({ responseCode: 500, responseMessage: "Internal Server Error" });
                }

                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': buffer.length
                });
                res.end(buffer);
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" });
        }
    },
    Forget: async (req, res) => {
        try {
            const email = req.body.email;
            const search = await usermodel.findOne({ $and: [{ email: email }, { statusCode: { $ne: 'DELETE' } }] });
            console.log("it is working");
            if (!search) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Email does not Exist!",
                });
            }
            if (search.statusCode !== 'ACTIVE') {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Account Deactivated, Contact your college",
                    responseResult: "Deactivate"
                });
            }
            const data = {
                id: search.id,
                email: search.email,
                userType: search.userType,
            };
            const tokenResponse = await helper.tokengenerate(data);
            const link =
                "http://localhost:5500/student/resetPassword?token=" + tokenResponse;
            helper.domail(email, "Reset Your Password", `use this link ${link}`);

            return res.json({
                responseCode: 200,
                responseMessage: "Link Sent successfully",
                userid: search._id,
            });

        } catch {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
    //When any one will hit forgetPassword then one reset password mail will sent at their , then on click that 
    //url sent at mail resetPassword route will open . then below code will run
    Reset: async (req, res) => {
        try {
            const id = req.userId;
            console.log("user id", id)
            if (!id) {
                return res.json({ responseCode: 400, responseMessage: "User ID is required" });
            }
            const search = await usermodel.findById({ _id: id });
            if (!search) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Id is not valid!",
                    responseResult: "Invalid"
                });
            }
            if (req.body.pass === req.body.cpass) {
                req.body.pass = bcrypt.hashSync(req.body.pass, 10);
                const update = await usermodel.updateOne(
                    { _id: id },
                    { $set: { pass: req.body.pass } }
                );
                if (!update) {
                    return res.json({
                        responseCode: 500,
                        responseMessage: "Password Not updated",
                        responseResult: "Not Updated"
                    });
                }
                return res.json({
                    responseCode: 200,
                    responseMessage: "Password updated successfully",
                    responseResult: "Updated"
                });

            }

        } catch {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
};
