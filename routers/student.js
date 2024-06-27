const studentRouter=require('express').Router()
const studentcontroller = require('../controllers/studentController');
const verifyToken = require('../middleware/auth');

studentRouter.post('/signin', studentcontroller.SignIn);
studentRouter.post('/signup', studentcontroller.SignUp);

studentRouter.post('/otpvarify', studentcontroller.otpVarify);
studentRouter.post('/resendotp',studentcontroller.resendOtp);

// studentRouter.get('/profile', verifyToken.verifyToken, studentcontroller.Profile);
studentRouter.post('/form',verifyToken.authMiddleware,studentcontroller.admissionForm)

studentRouter.delete('/deleteuser', studentcontroller.deleteUser);
studentRouter.put('/updateuser', studentcontroller.updateUser);

studentRouter.post('/forgetPassword',studentcontroller.Forget);
studentRouter.post('/resetPassword',studentcontroller.Reset);

studentRouter.post('/updatePassword',studentcontroller.updatePassword);

module.exports = studentRouter;
