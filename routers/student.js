const studentRouter=require('express').Router()
const studentcontroller = require('../controllers/studentController');
const faqcontroller=require('../controllers/faqController')
const verifyToken = require('../middleware/auth');
const staticContentController = require('../controllers/staticContentController');

studentRouter.post('/signin', studentcontroller.SignIn);
studentRouter.post('/signup', studentcontroller.SignUp);

studentRouter.post('/otpvarify', studentcontroller.otpVarify);
studentRouter.post('/resendotp',studentcontroller.resendOtp);

studentRouter.get('/profile', verifyToken.authMiddleware, studentcontroller.Profile);
studentRouter.post('/form',verifyToken.authMiddleware,studentcontroller.admissionForm)
studentRouter.post('/formStatus',verifyToken.authMiddleware,studentcontroller.formStatus);
studentRouter.post('/generateQr',verifyToken.authMiddleware,studentcontroller.generateQR);

studentRouter.delete('/deleteuser', verifyToken.authMiddleware,studentcontroller.deleteUser);
studentRouter.put('/updateProfile', verifyToken.authMiddleware,studentcontroller.updateProfile);

studentRouter.post('/forgetPassword',studentcontroller.Forget);
studentRouter.post('/resetPassword',verifyToken.authMiddleware,studentcontroller.Reset);

studentRouter.post('/updatePassword',studentcontroller.updatePassword);

//Route for get faq for student.........
studentRouter.get('/faqs', verifyToken.authMiddleware,faqcontroller.getFAQsByRole);

//static content related route
studentRouter.post('/view-static',staticContentController.viewStatic);

module.exports = studentRouter;
