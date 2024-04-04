const mongoose = require("mongoose");
const User = mongoose.model('User');
const {sendError} = require("../util/constants");
const {add} = require("nodemon/lib/rules"); //note: forget what use, keep it first

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
            {"$pull": {trn_list : trn_id}}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

module.exports = {
    getRole, updateFeedbackList, getUserByEmail,
    removeTransactionId
}
