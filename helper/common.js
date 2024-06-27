const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
module.exports = {

    domail: async (email, subject, msg) => {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                    user: "mobiloitte.node@gmail.com",
                    pass: "wdbakhorlxmmqrhg",
                },
            });
            await transporter.sendMail({
                from: "mobiloitte.node@gmail.com",
                to: email, // list of receivers
                subject: subject, // Subject line
                text: msg,
            }).catch((er) => {
                console.log(er)
            });
        }
        catch (err) {
            console.log(err)
        }
    },
    //otp generation code are written here.............................................................

    otpgeneration: () => {
        // Generate a random 6-digit number
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp.toString(); // Convert to string
    },
    generateRandomPassword:() => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    },
    //otp generation code end here.......................................
    tokengenerate:async(data)=>{
        try{
        jwt.sign({ data }, secretKey, { expiresIn: "300s" }, (err, token) => {
            return res.json({
              responseCode: 200,
              responseMessage: "Successfully login",
              token: token,
            });
          });
        }catch{
             //there is some error in generating token ..................................................
             return res.json({
                responseCode: 500,
                responseMessage: "Try again login",
                responseResult:"Internal Server Error"
              });
        }
    }

    ,


}