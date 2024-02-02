const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {resResult} = require('../util/constants');
const User = mongoose.model('User');
const router = express.Router();

// router.post('/signup', (req, res) =>{
//     console.log(req.body);
//     res.send("sign up post");
// });


router.post('/signup', async (req, res) => {
    //note: only for creating user account, admin created

    const {email, password, username} = req.body;
    try {
        const user = new User({email, password, username});
        await user.save();
        //const token = jwt.sign({userId: user._id}, 'MY_SECRET_KEY');
        //resResult(0, '', {token});
        resResult(0, '', 'test');
        // res.send({token});
        res.send('test');

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});
// router.post('/signin', async (req, res) => {
//     const {email, password} = req.body;
//     if (!email || !password) {
//         return res.status(422).send({error: 'Must provide email and password'})
//     }
//     const user = await User.findOne({email: email});
//     if (!user) {
//         return res.status(422).send({error: 'Invalid password or email'})
//     }
//     try {
//         await user.comparePassword(password);
//         const token = jwt.sign({userId: user._id}, 'MY_SECRET_KEY');
//         resResult(1, '', {token});
//         res.send({token});
//     } catch (err) {
//         return res.status(422).send({error: 'Invalid password or email'});
//     }
// });


module.exports = router;