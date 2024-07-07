const FAQ = require('../models/faq_model');

module.exports = {
    createFAQ: async (req, res) => {
        try {
            const { question, answer, role } = req.body;

            const add=await FAQ.create({ question:question, answer:answer, role:role })
            if(!add){
                return res.json({responseCode:201,responseResult:'Failed',responseMessage:"FAQ Not Added"});
            }
            return res.json({responseCode:201, responseMessage:"Created successfully",responseResult:add});
        } catch (error) {
            return res.json({ responseCode:500, error: 'Error creating FAQ' });
        }
    },
    getFAQsByRole: async (req, res) => {
        try {
            const role  = req.userType; //Here give which related you want faq show as ['ADMIN','STUDENT','FACULTY']
            const faqs = await FAQ.find({role: role });
            if(!faqs){
                return res.json({responseCode: 500, responseMessage: 'Data not found' });
            }
            return res.json({responseCode: 200,responseResult: faqs});
        } catch (error) {
            return res.json({responseCode:500, error: 'Error fetching FAQs' });
        }
    },
    updateFAQ: async (req, res) => {
        try {
            const id = req.params;
            const { question, answer, role } = req.body;
    
            
            const updateFields = {};
            if (question !== undefined) updateFields.question = question;
            if (answer !== undefined) updateFields.answer = answer;
            if (role !== undefined) updateFields.role = role;
    
            const updatedFAQ = await FAQ.findByIdAndUpdate({_id:id}, { $set: updateFields }, { new: true });
    
            if (!updatedFAQ) {
                return res.json({responseCode:404,error: 'FAQ not found' });
            }
            return res.json({responseCode:200,responseResult:updatedFAQ});
        } catch (error) {
            return res.json({responseCode:500,error: 'Error updating FAQ' });
        }
    },
    deleteFAQ: async (req, res) => {
        try {
            const id = req.params.id;
            const isDelete= await FAQ.findByIdAndDelete({_id:id});
            if(!isDelete){
                return res.json({responseCode:500, responseMessage:'Not deleted FAQ', isDelete:"No"});
            }
            return res.json({responseCode:200, responseResult: 'FAQ deleted' });
        } catch (error) {
            return res.json({responseCode:500, error: 'Error deleting FAQ' });
        }
    }
}
