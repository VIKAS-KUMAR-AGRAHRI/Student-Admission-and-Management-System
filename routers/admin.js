const express = require('express');
const auth=require('../middleware/auth')
const adminController = require('../controllers/adminController');
const faqcontroller=require('../controllers/faqController')
const commonLoginController = require('../controllers/commonLoginController');
const staticContentController = require('../controllers/staticContentController');
const adminRouter = express.Router();

adminRouter.post('/signin', commonLoginController.login)

adminRouter.get('/viewFaculty',auth.authMiddleware,adminController.faculty_By_Department)
adminRouter.get('/viewStudent',auth.authMiddleware,adminController.student_By_Department)
adminRouter.get('/allAdmission',auth.authMiddleware,adminController.all_Admission_Request)
adminRouter.get('/approvedAdmission',auth.authMiddleware,adminController.approved_Admission_Request);

adminRouter.put('/userStatus',auth.authMiddleware,adminController.changeUserStatus)
adminRouter.get('/user',auth.authMiddleware,adminController.getUserById)
adminRouter.post('/create/user',auth.authMiddleware,adminController.createUser)

// Routes for admin FAQs
adminRouter.post('/create-faqs',  auth.authMiddleware,faqcontroller.createFAQ);
adminRouter.get('/faqs',  auth.authMiddleware,faqcontroller.getFAQsByRole);
adminRouter.put('/updatefaqs/:id', auth.authMiddleware, faqcontroller.updateFAQ);
adminRouter.delete('/faqs/:id', auth.authMiddleware, faqcontroller.deleteFAQ);


//Route for update privacy policy, aboutUs, Terms and Conditions.
adminRouter.post('/view-static',staticContentController.viewStatic);

adminRouter.put('/update-static',auth.authMiddleware,staticContentController.updateStatic);
adminRouter.put('/create-static',auth.authMiddleware,staticContentController.createStatic);
adminRouter.put('/delete-static',auth.authMiddleware,staticContentController.deleteStatic);
adminRouter.post('/block-static',auth.authMiddleware,staticContentController.blockStatic);
adminRouter.put('/list-static',auth.authMiddleware,staticContentController.listStatic);

module.exports=adminRouter;