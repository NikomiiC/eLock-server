const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const userController = require("../controller/userController");
const lockerController = require("../controller/lockerController");
const jwt = require("jsonwebtoken");
const User = mongoose.model('User');
const router = express.Router();
router.use(requireAuth); // require user to sign in first

/**
 * CONSTANTS
 */
const USER = 'u';
const ADMIN = 'admin';
const CHG_PW = 'CHG_PW';

/**
 * Method GET
 */
router.get('/all_users', async (req, res) => {
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {

            //default by asc username
            const users = await userController.getAllUsers();
            res.send(resResult(0, `Successfully get users`, users));
        }
        else {
            return res.status(422).send(resResult(1, "User has no permission to create lockers."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all users ` + err.message));
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const user_id = req.params.id;
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            //default by asc username
            const user = await userController.getUserById(user_id);
            res.send(resResult(0, `Successfully get user`, user));
        }
        else{
            const user = await userController.getUserById(req.user._id);
            res.send(resResult(0, `Successfully get user`, user));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get user ` + err.message));
    }
});

router.post('/update_user', async (req, res) => {
    // pass username, gender and dob even not updating
    const params = req.body;
    try {
        //action: chg_pw, update ALL CAPS
        let user = await userController.updateUser(params, req.user._id);
        if(params.action === CHG_PW){
            const token = jwt.sign({userId: user._id}, 'MY_SECRET_KEY');
            res.send(resResult(0, 'Successfully change password', {token: token, user: user}));
        }
        else{
            res.send(resResult(0, 'Successfully update user', user));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

module.exports = router;