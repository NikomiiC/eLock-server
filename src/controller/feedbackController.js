const mongoose = require("mongoose");
const Feedback = mongoose.model('Feedback');
const {sendError} = require('../util/constants');
const userController = require('/userController');
//note: test date
//let currentDate = new Date('2024-03-01T14:51:06.157Z');

let currentDate = new Date();


async function getRole() {
    try{
        return await userController.getRole();
    }catch (err){
        console.log(err.message);
        sendError(err.message);
    }
}
async function getFeedbacksSortByDescDates() {
    try {
        return await Feedback.find().sort({user_com_datetime: -1});
        //return await Feedback.find().sort({user_com_datetime: -1});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getFeedbacksSortByAscDates() {
    try {
        return await Feedback.find().sort({user_com_datetime: 1});
        //return await Feedback.find().sort({user_com_datetime: -1});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getFeedbacksSortByStatus(statusFilter) {
    try {
        return await Feedback.find({ status: statusFilter});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getFeedbacksSortByStatusAndDescDates(statusFilter) {
    try {
        return await Feedback.find({ status: statusFilter}).sort({user_com_datetime: -1});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getFeedbacksSortByStatusAndAscDates(statusFilter) {
    try {
        return await Feedback.find({ status: statusFilter}).sort({user_com_datetime: 1});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

module.exports = {
    getFeedbacksSortByDescDates,
    getFeedbacksSortByAscDates,
    getFeedbacksSortByStatus,
    getFeedbacksSortByStatusAndDescDates,
    getFeedbacksSortByStatusAndAscDates,
    getRole
}