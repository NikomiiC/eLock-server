const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {resResult} = require('../util/constants');
const User = mongoose.model('User');
const Token = mongoose.model('Token');
const router = express.Router();
const sendEmail = require('../util/sendEmail');


router.post('/signup', async (req, res) => {
    //note: only for creating user account, admin created

    const {email, password, username} = req.body;
    try {
        const user = new User({email, password, username});
        await user.save();

        //email verification
        const signup_token = jwt.sign({
                data: 'Token Data'
            }, 'ourSecretKey'
        );
        let verification_token = await new Token({
            userId: user._id,
            token: signup_token,
        }).save();
        //email, subject, text
        const message = `Hi There! You have recently visited eLockHub and register with your email. Please follow the given link to verify your email.
        
		https://elock-server.onrender.com/verify/${user._id}/${verification_token.token}`;
        //const message = `${process.env.BASE_URL}/user/verify/${user.id}/${token.token}`;

        await sendEmail(email, "Verify Email", message);
        //const token = jwt.sign({userId: user._id}, 'MY_SECRET_KEY');
        res.send(resResult(0, "An Email sent to your account please verify",{}));

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.get("/verify/:id/:token", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(400).send("Invalid link");

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link");

        await User.findOneAndUpdate({ _id: user._id},
            {verified: true });
        //await Token.deleteOne({_id: token._id});
        await Token.findByIdAndDelete(token._id);

        res.send("Email verified successfully.");
    } catch (error) {
        return res.status(400).send(resResult(1, err.message));
    }
});

router.post('/signin', async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(422).send({error: 'Must provide email and password'});
    }
    const user = await User.findOne({email: email});
    if (!user) {
        return res.status(422).send({error: 'Invalid password or email'});
    }
    if(!user.verified){
        return res.status(422).send({error: 'Please verify your email.'});
    }
    try {
        await user.comparePassword(password);
        const token = jwt.sign({userId: user._id}, 'MY_SECRET_KEY');

        resResult(0, '', {token, user});
        res.send({token: token, user: user});
    } catch (err) {
        return res.status(422).send({error: 'Invalid password or email'});
    }
});


module.exports = router;