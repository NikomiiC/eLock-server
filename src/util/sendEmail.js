const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const sendEmail = async (email, subject, text) => {
    try {
        console.log(process.env.SERVICE, process.env.ELOCK, process.env.PASS);
        const transporter = nodemailer.createTransport({
            //host: process.env.HOST,
            service: process.env.SERVICE,
            // port: 465,
            // secure: true,
            auth: {
                user: process.env.ELOCK,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.log("Email not sent");
        console.log(error);
    }
};

module.exports = sendEmail;