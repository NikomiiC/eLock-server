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


module.exports = {
    getRole
}
