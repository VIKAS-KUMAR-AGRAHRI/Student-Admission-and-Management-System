// controllers/facultyController.js
const { Student, Faculty } = require('../models/department_model');
const users = require("../models/user_model");
// const helper = require('../helper/common');
// const bcrypt = require('bcrypt');
module.exports = {
    getDepartmentStudents: async (req, res) => {
        const { page = 1, limit = 5, search = '' } = req.body;
        try {
            const facultyId = req.userId;
            const faculty = await Faculty.findOne({ user_id: facultyId });
            if (!faculty) {
                return res.json({ responseCode: 404, responseMessage: 'Faculty not found' });
            }
            const department = faculty.department;
            const studentQuery = {
                department: department
            };
            const studentIds = await Student.find(studentQuery)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .select('user_id')
                .lean();

            const userIds = studentIds.map(student => student.user_id);
            //This regex query for the search student from the user model or database with some pattern
            const userQuery = {
                _id: { $in: userIds },
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } }
                ]
            };
            //selecting only firstName , lastName , email and mobile.....................
            const users = await users.find(userQuery).select('firstName lastName email mobile');
            if(!users){
                return res.json({ responseCode: 500, responseMessage: "There is some error" });
            }
            const totalStudents = await Student.countDocuments(studentQuery);

            return res.json({
                responseCode: 200,
                responseMessage: "Students fetched successfully",
                students: users,
                totalPages: Math.ceil(totalStudents / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('Error fetching department students:', error);
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" });
        }
    },
    blockStudent: async (req, res) => {
        try {
            const studentId = req.body.id;

            if (!studentId) {
                return res.json({ responseCode: 400, responseMessage: "Student ID is required" });
            }
            const student = await users.findById({_id:studentId});
            if (!student) {
                return res.status(404).json({ responseCode: 404, responseMessage: "Student not found" });
            }
            student.statusCode = 'BLOCKED';
            await student.save();

            return res.json({ responseCode: 200, responseMessage: "Student blocked successfully" });
        } catch (error) {
            console.error('Error blocking student:', error);
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error" });
        }
    },

    profile: async (req, res) => {
        try {
            const profile = await usermodel.findOne({ $and:[{_id: req.userId },{statusCode:'ACTIVE'}]});
            if (!profile) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Data not found",
                });
            }
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
    updateProfile: async (req, res) => {
        const { email, mobile, firstName, lastName } = req.body;

        if (!email && !mobile && !firstName && !lastName) {
            return res.json({
                responseCode: 400,
                responseMessage: "At least one field (email, phone number, first name, or last name) must be provided",
            });
        }

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

        // Create the update object dynamically
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
                    status: 'ACTIVE'
                },
                { $set: updateFields },
                { new: true }
            );


            if (!updatedProfile) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "User not found or not active",
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



};
