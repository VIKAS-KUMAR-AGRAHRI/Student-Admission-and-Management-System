const users = require("../models/user_model");
const helper = require('../helper/common');
const bcrypt = require('bcrypt');
module.exports = {
    login: async (req, res) => {
        try {
            //login via email or mobile 
            const foundUser = await users.findOne({$and:[{$or: [{ email: req.body.email }, { mobile: req.body.mobile }] },{userType:{$in:["ADMIN","FACULTY"]}}]})

            if (!foundUser) {
                return res.json({ responseCode: 404, responseMessage: "Unauthorized user" })
            }            
            const isCorrectPassword = await bcrypt.compare(req.body.password, foundUser.pass)

            if (!isCorrectPassword) {
                return res.json({ responseCode: 401, responseMessage: "password does not matched",responseResult:'Not Match' })
            }
            console.log("id of founded user", foundUser._id)
            const data = {
                id: foundUser._id,
                email: foundUser.email,
                userType: foundUser.userType,
            };
            // console.log("login successfully user", oneuser);
            const tokenResponse = await helper.tokengenerate(data);
            if (tokenResponse == false) {
                return res.json({
                    responseCode: 500,
                    responseMessage: "Internal Server Error",
                    responseResult: "Token not generatd"
                })
            }
            console.log(tokenResponse, "this is token")
            return res.json({
                responseCode: 200,
                responseMessage: "Token generated successfully",
                Token: tokenResponse
            })
        }
        catch (error) {
            console.error(error)
            return res.json({ responseCode: 500, responseMessage: "Internal Server Error",Error: error})
        }
    }
}