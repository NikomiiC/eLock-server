const mongoose = require("mongoose");
const Feedback = mongoose.model('Feedback');
const {sendError} = require('../util/constants');
const userController = require('/userController');
//note: test date
//let currentDate = new Date('2024-03-01T14:51:06.157Z');

let currentDate = new Date();

async function getFeedbacksSortByDescDates() {
    try {
        return await Feedback.find().sort({latest_update_datetime: -1});
        //return await Feedback.find().sort({user_com_datetime: -1});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getFeedbacksSortByAscDates() {
    try {
        return await Feedback.find().sort({latest_update_datetime: 1});
        //return await Feedback.find().sort({user_com_datetime: -1});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getFeedbacksSortByStatus(statusFilter) {
    try {
        return await Feedback.find({status: statusFilter});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getFeedbacksSortByStatusAndDescDates(user_id, statusFilter) {
    if (user_id === null || user_id === undefined) {
        //admin use, to retrieve all feedbacks
        try {
            return await Feedback.find({status: statusFilter}).sort({latest_update_datetime: -1});

        } catch (err) {
            console.log(err.message);
            sendError(err.message);
        }
    } else {
        //user use, to retrieve all feedbacks by user_id, default desc by dates not allow user to sort by dates
        try {
            return await Feedback.find({status: statusFilter, user_id: user_id}).sort({latest_update_datetime: -1});

        } catch (err) {
            console.log(err.message);
            sendError(err.message);
        }
    }
}

async function getFeedbacksSortByStatusAndAscDates(statusFilter) {
    try {
        return await Feedback.find({status: statusFilter}).sort({latest_update_datetime: 1});

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getFeedbackById(id) {
    try {
        return await Feedback.findById(id);
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
    getFeedbackById
}