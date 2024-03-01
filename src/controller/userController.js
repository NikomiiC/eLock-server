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
    const user = await User.findById(uid);
    if (!user) {
        sendError('User is invalid.');
    }
    try {
        await User.updateOne(
            {'_id': uid},
            {
                "$push": {
                    "feedback_list":
                        {"postId": fid}
                }
            },
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}


module.exports = {
    getRole, updateFeedbackList
}
