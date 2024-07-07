const jwt = require("jsonwebtoken");
const User = require("../models/user_model"); // Adjust the path as needed
const secretKey = process.env.SECRET_KEY; // Replace with your actual secret key

module.exports = {
  authMiddleware: async (req, res, next) => {
    try {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
      ) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.query.token) {
        token = req.query.token;
      }
      if (!token) {
        return res
          .status(401)
          .json({ responseCode: 401, responseMessage: "No token provided" });
      }

      const decoded = jwt.verify(token, secretKey);
      const { id, email, userType } = decoded.data;
      const user = await User.findById({ _id: id });

      if (!user) {
        return res.json({
          responseCode: 404,
          responseMessage: "User not found",
        });
      }
      req.userId = user._id;
      req.userType = user.userType;
      req.email = user.email;
      // console.log(req.userId, req.userType, req.email, "Authenticated user");
      next();
    } catch (err) {
      // console.error(err);
      return res.json({
        responseCode: 401,
        responseMessage: "Failed to authenticate token",
      });
    }
  },
};
