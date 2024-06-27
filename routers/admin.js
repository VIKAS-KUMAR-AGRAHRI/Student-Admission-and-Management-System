const express = require('express');
const auth=require('../middleware/userAuth')
const adminController = require('../controllers/adminController');
const adminRouter = express.Router();

// admin Auth routes
adminRouter.post('/signin', adminController.login)

// admin functionality routes

adminRouter.get('/viewFaculty', auth.verifyToken, adminController.faculty_By_Department)

adminRouter.put('/login/:id/status', auth.verifyToken, adminController.changeUserStatus)

adminRouter.get('/users/:id', auth.verifyToken, adminController.getUserById)

adminRouter.post('/create/user', auth.verifyToken, adminController.createUser)

adminRouter.get('/viewStudent', auth.verifyToken, adminController.student_By_Department)


module.exports=adminRouter;