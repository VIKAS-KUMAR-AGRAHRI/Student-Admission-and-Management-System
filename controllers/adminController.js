const bcrypt = require('bcrypt');
const users = require("../models/user_model");
const { Student, Faculty } = require('../models/department_model');
const helper= require('../helper/common');
const Admission = require('../models/admission_model');

module.exports = {
    login: async (req, res) => {
        try {
            const { email, password, } = req.body

            if (!email || !password) {
                return res.json({ responseCode: 400, responseMessage: "Email and Password are required" })
            }
            const foundUser = await users.findOne({ $and: [{ $or: [{ email: email }, { mobile: req.body.mobile }] }, { userType: "ADMIN" }] })

            if (!foundUser) {
                return res.json({ responseCode: 401, responseMessage: "User not found" })
            }

            if (foundUser.userType !== "ADMIN") {
                return res.json({ responseCode: 404, responseMessage: "Unauthorized Access" })
            }

            const isCorrectPassword = await bcrypt.compare(password, foundUser.pass)

            if (!isCorrectPassword) {
                return res.json({ responseCode: 401, responseMessage: "password not matched" })
            }
            console.log("id of founded user", foundUser._id)
            const data = {
                id: foundUser.id,
                email: foundUser.email,
                userType: foundUser.userType,
            };
            // console.log("login successfully user", oneuser);
            const tokenResponse = helper.tokengenerate(data);
            return tokenResponse;
        }
        catch (error) {
            console.error(error)
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" })
        }
    },


    student_By_Department: async (req, res) => {
        // return res.json("ehelloekek");
        try {
            if (!req.user || !req.user.data.userType == "ADMIN") {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            const students = await Student.find({ department: req.body.department }).populate('user_id', 'firstName lastName email mobile');

            return res.json({ responseCode: 200, responseMessage: "All Students are fetched successfully", studentList: students })
        }
        catch (error) {
            console.error(error)
            res.json({ responseCode: 500, responseMessage: "Error in fetching Users" })
        }
    },

    faculty_By_Department: async (req, res) => {
        // return res.json("ehelloekek");
        try {
            if (!req.user || !req.user.data.userType == "ADMIN") {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const faculty = await Faculty.find({ department: req.body.department }).populate('user_id', 'firstName lastName email mobile');

            return res.json({ responseCode: 200, responseMessage: "All Faculty are fetched successfully", faculty })
        }
        catch (error) {
            console.error(error)
            res.json({ responseCode: 500, responseMessage: "Error in fetching Users" })
        }
    },
    all_Admission_Request: async (req, res) => {
        try {
            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
    
            const new_addmission = await Admission.find({ form_status: 'PENDING' })
                .skip(skip)
                .limit(limit);
            const totalAdmissions = await Admission.countDocuments({ form_status: 'PENDING' });
    
            return res.json({
                responseCode: 200,
                responseMessage: "All new admission requests fetched successfully",
                requestList:new_addmission,
                totalPages: Math.ceil(totalAdmissions / limit),
                currentPage: page
            });
        } catch (error) {
            console.error(error);
            res.json({ responseCode: 500, responseMessage: "Error in fetching Users" });
        }
    },    
    approved_Admission_Request:async(req,res)=>{
        try {
            if (!req.user || !req.user.data.userType == "ADMIN") {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            const new_addmission = await Admission.findByIdAndUpdate({user_id:req.body.id,form_status:'PENDING'},{$set:{form_status:'APPROVED'}});
            if(!new_addmission){
                return  res.json({ responseCode: 400, responseMessage: "check your given id"})
            }
            return res.json({ responseCode: 200, responseMessage: "Application approved successfuly", new_addmission })
        }
        catch (error) {
            console.error(error)
            res.json({ responseCode: 500, responseMessage: "Error in fetching Users" })
        }
    },
    changeUserStatus: async (req, res) => {
        try {
            const { id } = req.query;
            console.log(req.user.data.userType)
            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: 'Unauthorized, only admin are allowed to update or change the user status' });
            }

            if (!req.body.hasOwnProperty('statusCode')) {
                return res.json({ responseCode: 400, responseMessage: 'status not found' });
            }

            const newStatus = req.body.statusCode.toUpperCase();
            if (!['ACTIVE', 'BLOCK'].includes(newStatus)) {
                return res.json({ responseCode: 400, responseMessage: 'Invalid status, must be ACTIVE or BLOCK only' });
            }

            const foundUser = await users.findById({ _id: id });

            if (!foundUser) {
                return res.json({ responseCode: 404, responseMessage: 'User not found' });
            }

            if (foundUser.status === newStatus) {
                return res.json({ responseCode: 400, responseMessage: 'User already has the requested status' });
            }

            // foundUser.statusCode = newStatus;
            // await foundUser.save();
            await users.findByIdAndUpdate({_id:foundUser._id},{$set:{statusCode:newStatus}})
            return res.json({ responseCode: 200, responseMessage: `User status updated to ${newStatus}` });
        } catch (error) {
            console.error(error);
            return res.json({ responseCode: 500, responseMessage: 'Internal Server Error' });
        }
    },

    getUserById: async (req, res) => {
        const { id } = req.query
        try {

            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: 'Unauthorized' });
            }

            const user = await users.findOne({ _id: id, statusCode: "ACTIVE" })
            if (!user) {
                return res.json({ responseCode: 404, responseMessage: "not found" })
            }
            return res.json({ responseCode: 200, responseMessage: "User data fetched successfully", user })
        }
        catch (error) {
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" })
        }
    },

    createUser: async (req, res) => {
        const { firstName, lastName, email, phoneNo, isVerified, status, userType } = req.body

        try {

            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: 'Unauthorized' });
            }

            if (!firstName || !lastName || !email ) {
                return res.json({ responseCode: 400, responseMessage: "Please fill the required fields" })
            }

            const existingUser = await users.findOne({ $and: [{ email: email }, { statusCode: "ACTIVE" }] })

            if (existingUser) {
                return res.sjson({ responseCode: 400, responseMessage: 'Email already exists' });
            }
            const password=helper.generateRandomPassword();
            
            const newUser = new users({
                firstName: firstName,
                lastName: lastName,
                email: email,
                countryCode: "+91",
                mobile: phoneNo,
                pass: password,
                statusCode: status,
                userType: userType,
                otpVarify: isVerified,
            })
            if (newUser.userType == "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: "You are not authorized to create users with the ADMIN role" })
            }
            helper.domail(req.body.email, "password by college", `Your password is ${req.body.otp} , you can change this password via login in your account`);
            const savedUser = await newUser.save();
            return res.json({ responseCode: 200, responseMessage: "User created Successfully", savedUser })
        }
        catch (error) {
            console.error(error);
            res.json({ responseCode: 500, responseMessage: 'Internal Server Error' });
        }
    },

    getAdmin: async (req, res) => {

        try {
            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: 'Unauthorized, only admin are allowed to update or change the user status' });
            }

            const admin = await users.find({ $and: [{ userType: "ADMIN" }, { statusCode: "ACTIVE" }] })
            return res.json({ responseCode: 200, responseMessage: "Admin fetched successfully", admin })
        }
        catch (err) {
            console.error(err)
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" })
        }
    }

}
// module.exports=adminController;




