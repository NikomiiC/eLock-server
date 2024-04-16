const mongoose = require("mongoose");
const User = mongoose.model('User');
const {sendError} = require("../util/constants");
const {add} = require("nodemon/lib/rules"); //note: forget what use, keep it first
const serviceUtil = require("./serviceController");

/**
 * CONSTANTS
 */

const CHG_PW = 'CHG_PW';
const UPDATE = 'UPDATE';

async function getRole(req) {
    let user;
    try {
        user = await User.findOne({_id: req.user._id});
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
    return user.role;
}

async function updateFeedbackList(uid, fid) {
    try {
        const user = await User.findById(uid);
        if (!user) {
            sendError('User is invalid.');
        }
        await User.updateOne(
            {'_id': uid},
            {
                "$push": {
                    "feedback_list": fid
                }
            },
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getUserByEmail(email) {
    try {
        return await User.findOne({email: email});
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function removeTransactionId(user_id, trn_id) {
    try {
        return await User.updateOne(
            {_id: user_id},
            {"$pull": {trn_list: trn_id}}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function updateTransactionId(user_id, trn_id) {
    try {
        return await User.updateOne(
            {_id: user_id},
            {"$push": {trn_list: trn_id}}
        )
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getAllUsers() {
    try {
        return await User.find().sort({username: 1});
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getUserById(user_id) {
    try {
        return await User.findById(user_id);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function updateUser(params, uid) {
    try {
        //action: chg_pw, update ALL CAPS
        const action = params.action;
        const doc = params.doc;
        const old_password = doc.old_password;
        const new_password = doc.new_password
        const username = doc.username;
        const gender = doc.gender;
        const dob = doc.dob;
        let updated_user;

        switch (action) {
            case CHG_PW:
                if (serviceUtil.isStringValNullOrEmpty(old_password) || serviceUtil.isStringValNullOrEmpty(new_password)) {
                    sendError("Must provide old password and new password");
                }
                const user = User.findById(uid);
                await user.comparePassword(old_password);
                return await User.findOneAndUpdate(
                    {_id: uid},
                    {password: new_password},
                    {returnOriginal: false}
                );
                //break;
            case UPDATE:
                if (serviceUtil.isStringValNullOrEmpty(username) ||
                    serviceUtil.isStringValNullOrEmpty(gender) ||
                    serviceUtil.isStringValNullOrEmpty(dob)) {

                    return await User.findOneAndUpdate(
                        {_id: uid},
                        {
                            username: username,
                            gender: gender,
                            dob: dob
                        },
                        {returnOriginal: false}
                    );
                }
                //break;
            default:
                sendError("No action matched.");
                break;
        }
        return updated_user;
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

module.exports = {
    getRole, updateFeedbackList, getUserByEmail,
    removeTransactionId,
    updateTransactionId,
    getAllUsers,
    getUserById,
    updateUser
}
