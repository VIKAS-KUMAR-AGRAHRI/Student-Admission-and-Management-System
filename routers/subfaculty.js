const facultyRouter = require('express').Router();
const auth = require('../middleware/auth');
const facultyController = require('../controllers/faculityController');
const faqcontroller=require('../controllers/faqController')
const commonLoginController = require('../controllers/commonLoginController');
const staticContentController = require('../controllers/staticContentController');

facultyRouter.post('/signin', commonLoginController.login);
facultyRouter.post('/profile', auth.authMiddleware, facultyController.profile);
facultyRouter.post('/update', auth.authMiddleware, facultyController.updateProfile);

facultyRouter.get('/department-students', auth.authMiddleware, facultyController.getDepartmentStudents);
facultyRouter.post('/block-student', auth.authMiddleware, facultyController.blockStudent);

// Routes for faculty faq's
facultyRouter.post('/create-faqs',  auth.authMiddleware,faqcontroller.createFAQ);
facultyRouter.get('/faqs',  auth.authMiddleware,faqcontroller.getFAQsByRole);
facultyRouter.put('/updatefaqs/:id', auth.authMiddleware, faqcontroller.updateFAQ);
facultyRouter.delete('/faqs/:id', auth.authMiddleware, faqcontroller.deleteFAQ);

//static content related route
facultyRouter.post('/view-static',staticContentController.viewStatic);

module.exports = facultyRouter;
