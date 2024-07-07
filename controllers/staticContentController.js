const Static = require('../models/staticContent_model')

module.exports = {
    // View Static Content is common for all user
    viewStatic: async (req, res) => {
        try {
            const type = req.query.type;
            const success = await Static.findOne(
                { type: type },
                { _id: 0, type: 1, title: 1, description: 1 }
            );

            console.log(success);
            if (!success) {
                return res.json({
                    responseCode: 404,
                    responseMessage: "Static content not found",
                    responseResult:"Not Found"
                });
            }

            return res.json({
                responseCode: 200,
                responseMessage: "Successfully fetched",
                responseResult: success,
            });
        } catch (error) {
            return res.status(500).json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                error: error.message,
            });
        }
    },

    // Update Static Content (Only for Admin) , here only update content of static content
    updateStatic: async (req, res) => {
        try {
            if (req.userType !== "ADMIN") {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unauthorized user"
                });
            }

            const updatedFields = {};
            if (req.body.type !== undefined) updatedFields.type = req.body.type;
            if (req.body.title !== undefined) updatedFields.title = req.body.title;
            if (req.body.description !== undefined) updatedFields.description = req.body.description;

            const success = await Static.findByIdAndUpdate(
                {_id:req.body.id},
                { $set: updatedFields },
                { new: true }
            );

            if (!success) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Updation problem in static content",
                    responseResult: "Not Update"
                });
            }

            return res.json({
                responseCode: 200,
                responseMessage: "Successfully updated",
                responseResult: success,
            });
        } catch (error) {
            return res.status(500).json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                error: error.message,
            });
        }
    },

    // Delete Static Content (Only for Admin)
    deleteStatic: async (req, res) => {
        try {
            if (req.userType !== "ADMIN") {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Unauthorized user",
                });
            }
            const isDelete = (req.body.status).toUpperCase();
            if(newState!=="DELETE"){
                return res.json({
                    responseCode: 400,
                    responseMessage: "Please a choose valid status",
                    responseResult: "Invalid",
                });
            }

            const success = await Static.findByIdAndDelete({_id:req.body.id});
            if (!success) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Static content not deleted.",
                    responseResult: "Not Deleted",
                });
            }
            return res.json({
                responseCode: 200,
                responseMessage: "Deleted successfully",
                responseResult: "Success",
                result: success,
            });
        } catch (error) {
            return res.status(500).json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                responseResult: "Error",
                error: error.message,
            });
        }
    },
    blockStatic: async (req, res) => {
        try {
            if (req.userType !== "ADMIN") {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Unauthorized user",
                });
            }
            const isDelete = (req.body.status).toUpperCase();
            if(newState!=="BLOCK"){
                return res.json({
                    responseCode: 400,
                    responseMessage: "Please a choose valid status",
                    responseResult: "Invalid",
                });
            }

            const success = await Static.findByIdAndUpdate({_id:req.body.id},{$set:{status:"BLOCK" 
            }},{new:true});
            if (!success) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Static content not blocked.",
                    responseResult: "Not Block",
                });
            }
            return res.json({
                responseCode: 200,
                responseMessage: "Block successfully",
                responseResult: "Success",
                result: success,
            });
        } catch (error) {
            return res.status(500).json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                responseResult: "Error",
                error: error.message,
            });
        }
    },

    // Create Static Content (Only for Admin)
    createStatic: async (req, res) => {
        try {
            if (req.userType !== "ADMIN") {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unauthorized user"
                });
            }

            const { type, title, description } = req.body;
            const success = Static.create({ type:type, title:title,description:description });

            return res.json({
                responseCode: 200,
                responseMessage: "Static content created successfully",
                responseResult: success,
            });
        } catch (error) {
            return res.status(500).json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                error: error.message,
            });
        }
    },

    // List Static Content according to active and block condition based.
    listStatic: async (req, res) => {
        try {
            if (req.userType !== "ADMIN") {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unauthorized user"
                });
            }
            const { page = 1, limit = 10, status } = req.body;
            let query = {};
            if (status) {
                query.status = status.toUpperCase();
            }
    
            const staticContents = await Static.find(query)
                .skip((page - 1) * limit)
                .limit(Number(limit));
    
            if (!staticContents || staticContents.length === 0) {
                return res.json({
                    responseCode: 404,
                    responseMessage: "No static content found",
                    responseResult: "Not found",
                });
            }
    
            return res.json({
                responseCode: 200,
                responseMessage: "Successfully fetched",
                responseResult: staticContents,
            });
        } catch (error) {
            return res.status(500).json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
                error: error.message,
            });
        }
    },
};
