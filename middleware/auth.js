const secretKey = process.env.SECRET_KEY; // Replace with your actual secret key
const jwt = require('jsonwebtoken');
const User = require('../models/user_model'); // Adjust the path as needed

module.exports={
authMiddleware:async(req, res, next) => {
        // Get the Authorization header from the request
    const authHeader = req.headers['authorization'];

    // Extract the token from 'Bearer <token>' format
    const token = authHeader.split(' ')[1];


        if (!token) {
            return res.status(401).json({
                responseCode: 401,
                responseMessage: 'No token provided'
            });
        }

        try {
            const decoded = jwt.verify(token, secretKey);
            const { id, email, userType } = decoded.data;

            // Fetch user from the database
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    responseCode: 404,
                    responseMessage: 'User not found'
                });
            }
            if (user.userType !== userType || user.email !== email) {
                return res.status(403).json({
                    responseCode: 403,
                    responseMessage: 'User credentials not authorized'
                });
            }
            req.userId = user.id;
            req.userType = user.userType;
            req.email = user.email;

            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                responseCode: 401,
                responseMessage: 'Failed to authenticate token'
            });
        }
    }

}
