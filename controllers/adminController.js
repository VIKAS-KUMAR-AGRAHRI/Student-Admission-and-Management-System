const bcrypt = require('bcrypt');
const users = require("../models/user_model");
const { Student, Faculty } = require('../models/department_model');
const helper = require('../helper/common');
const Admission = require('../models/admission_model');

module.exports = {
      student_By_Department: async (req, res) => {
        // return res.json("ehelloekek");
        try {
            if (!req.userId || !req.userType == "ADMIN") {
                return res.json({responseCode:400, message: 'Unauthorized' });
            }

            //to do this with the help of select statement of mongo..................
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
            if (!req.userId || req.userType !== "ADMIN") {
                return res.json({ responseCode:403,responseMessage: 'Unauthorized' });
            }

            const page = parseInt(req.query.page) || 1;
            const department = req.body.department;
            const limit = 5;
            const searchQuery = req.query.search;


            const skip = (page - 1) * limit;

            const query = { department };
            if (searchQuery) {
                query.$or = [
                    { 'user_id.firstName': { $regex: searchQuery, $options: 'i' } },
                    { 'user_id.lastName': { $regex: searchQuery, $options: 'i' } }
                ];
            }


            const facultyQuery = Faculty.find(query)
                .populate('user_id', 'firstName lastName email mobile')
                .skip(skip)
                .limit(limit);


            const faculty = await facultyQuery.exec();

            const totalCount = await Faculty.countDocuments(query);

            return res.json({
                responseCode: 200,
                responseMessage: "Faculty fetched successfully",
                faculty: faculty,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit)
            });
        } catch (error) {
            console.error(error);
            return res.json({ responseCode: 500, responseMessage: "Error in fetching faculty" });
        }
    },
    all_Admission_Request: async (req, res) => {
        try {
            if (!req.userId || req.userType !== "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: 'Unauthorized' });
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search;


            const query = { form_status: 'PENDING' };
            if (searchQuery) {
                query.$or = [
                    { 'user_id.firstName': { $regex: searchQuery, $options: 'i' } },
                    { 'user_id.lastName': { $regex: searchQuery, $options: 'i' } }
                ];
            }

            const admissionQuery = Admission.find(query).populate('user_id', 'firstName lastName').skip(skip).limit(limit);
            const admissionRequests = await admissionQuery.exec();
            const totalAdmissions = await Admission.countDocuments(query);

            return res.json({
                responseCode: 200,
                responseMessage: "All new admission requests fetched successfully",
                requestList: admissionRequests,
                totalPages: Math.ceil(totalAdmissions / limit),
                currentPage: page
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ responseCode: 500, responseMessage: "Error in fetching admission requests" });
        }
    },
    approved_Admission_Request: async (req, res) => {
        try {
            if (!req.userId || req.userType !== "ADMIN") {
                return res.json({responseCode:403, responseMessage: 'Unauthorized' });
            }
            const new_addmission = await Admission.findOneAndUpdate({ _id: req.body.id, form_status: 'PENDING' }, { $set: { form_status: 'APPROVED' } });
            if (!new_addmission) {
                return res.json({ responseCode: 400, responseMessage: "check your given id" })
            }
            const deparment_find = await Admission.findOne({ _id: req.body.id })
            //update the student schema and give reference id of whole details
            const preferredCourse = deparment_find.courseInfo.preferredCourse;
            // console.log("check3 ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",preferredCourse)
            //Here we allot a department and save in student schema
            const studentDepartmentset = await Student.create({ user_id: req.body.id, department: preferredCourse });
            if (!studentDepartmentset) {
                return res.json({ responseCode: 400, responseMessage: "Student not alloted in any deparment" })
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
            //we get user id, that user status we want to change
            const id = req.body.id;
            console.log(req.userType)
            if (!req.userId || req.userType !== "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: 'Unauthorized, only admin are allowed to update or change the user status' });
            }

            if (!req.body.statusCode) {
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

            if (foundUser.statusCode === newStatus) {
                return res.json({ responseCode: 400, responseMessage: 'User already has the requested status' });
            }


            const check =await users.findByIdAndUpdate({ _id: foundUser._id }, { $set: { statusCode: newStatus } })
            if (!check){
                return res.json({ responseCode:400, responseMessage: `User status not updated successfully` });
            }
            return res.json({ responseCode: 200, responseMessage: `User status updated to ${newStatus}` });
        } catch (error) {
            console.error(error);
            return res.json({ responseCode: 500, responseMessage: 'Internal Server Error' });
        }
    },

    getUserById: async (req, res) => {
        const id = req.body.id
        try {

            if (!req.userId || req.userType !== "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: 'Unauthorized' });
            }

            const user = await users.findOne({ _id: id, userType:{$ne:"ADMIN"}})
            if (!user) {
                return res.json({ responseCode: 404, responseMessage: "not found" })
            }
            return res.json({ responseCode: 200, responseMessage: "User data fetched successfully", responseResult:user })
        }
        catch (error) {
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" })
        }
    },

    createUser: async (req, res) => {
        const { firstName, lastName, email, mobile, countryCode, state, city, statusCode, userType, otpVarify, department } = req.body

        try {
            if (!req.userId || req.userType !== "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: 'Unauthorized' });
            }
            console.log(req.body)
            if (!firstName || !lastName || !email || !mobile || !userType || otpVarify === undefined || !department) {
                return res.json({ responseCode: 400, responseMessage: "Please fill the required fields" })
            }
            
            const existingUser = await users.findOne({ $and: [{$or:[{ email: email },{mobile: mobile}]},{ statusCode: "ACTIVE"}]} )

            if (existingUser) {
                if (existingUser.email==email) {
                    return res.json({ responseCode: 400, responseMessage: 'Email already exists' });
                }
                
                return res.json({ responseCode: 400, responseMessage: 'Mobile already exists' });
                
            }
            const genpassword = helper.generateRandomPassword();
            const password = bcrypt.hashSync(genpassword, 10);
            console.log("new user password is ", genpassword)
            const newUser = new users({
                firstName: firstName,
                lastName: lastName,
                email: email,
                mobile: mobile,
                countryCode: countryCode,
                state: state,
                city: city,
                pass: password,
                statusCode: statusCode,
                userType: userType,
                otpVarify: otpVarify,
            })
            if (newUser.userType == "ADMIN") {
                return res.json({ responseCode: 403, responseMessage: "Don't create user as a ADMIN" })
            }
            helper.domail(req.body.email, "password by college", `Your password is ${genpassword} , you can change this password via login in your account`);
            const insertUser = await users.create(newUser);
            if (!insertUser) {
                return res.json({ responseCode: 400, responseMessage: "There is some problem to creating user" })
            }
            const savedUser = await Faculty.create({ user_id: insertUser._id, department: department });
            return res.json({ responseCode: 200, responseMessage: "User created Successfully", savedUser })
        }
        catch (error) {
            console.error(error);
            res.json({ responseCode: 500, responseMessage: 'Internal Server Error' });
        }
    }

}




