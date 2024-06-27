const express = require('express');
// const auth=require('../middleware/userAuth')
const adminController = require('../controllers/adminController');
const adminRouter = express.Router();

// admin Auth routes
adminRouter.post('/signin', adminController.login)

// admin functionality routes

adminRouter.get('/viewFaculty',   adminController.faculty_By_Department)

adminRouter.put('/login/:id/status',   adminController.changeUserStatus)

adminRouter.get('/users/:id',   adminController.getUserById)

adminRouter.post('/create/user',   adminController.createUser)

adminRouter.get('/viewStudent',   adminController.student_By_Department)


module.exports=adminRouter;