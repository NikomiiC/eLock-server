const mongoose = require("mongoose");
const Feedback = mongoose.model('Feedback');
const {sendError} = require('../util/constants');
//note: test date
//let currentDate = new Date('2024-03-01T14:51:06.157Z');

let currentDate = new Date();

async function getFeedbacksSortByDescDates(user_id) {
    if (user_id === undefined) { //admin
        try {
            return await Feedback.find().sort({latest_update_datetime: -1});
            //return await Feedback.find().sort({user_com_datetime: -1});

        } catch (err) {
            console.log(err.message);
            sendError(err.message);
        }
    } else { // user
        try {
            return await Feedback.find({user_id: user_id}).sort({latest_update_datetime: -1});
            //return await Feedback.find().sort({user_com_datetime: -1});

        } catch (err) {
            console.log(err.message);
            sendError(err.message);
        }
    }

}

async function getFeedbacksSortByAscDates(user_id) {
    if (user_id === undefined) { //admin
        try {
            return await Feedback.find().sort({latest_update_datetime: 1});
            //return await Feedback.find().sort({user_com_datetime: -1});

        } catch (err) {
            console.log(err.message);
            sendError(err.message);
        }
    } else { //user
        try {
            return await Feedback.find({user_id: user_id}).sort({latest_update_datetime: 1});
            //return await Feedback.find().sort({user_com_datetime: -1});

        } catch (err) {
            console.log(err.message);
            sendError(err.message);
        }
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

async function updateStatus(feedback_id, status) {
    const feedback = await getFeedbackById(feedback_id);
    let new_feedback;
    if (!feedback) {
        sendError('Update status fail, invalid feedback');
    } else {
        try {
            new_feedback = await Feedback.findOneAndUpdate({_id: feedback_id}, {
                status: status,
                latest_update_datetime: new Date()
            }, {
                returnOriginal: false
            });
            return new_feedback;
        } catch (err) {
            sendError(err.message);
        }
    }
}

async function removeTransaction(trn_id) {
    try{
        return await Feedback.updateMany(
            {transaction_id: trn_id},
            {transaction_id : null}
        );
    }catch (err) {
        sendError(err.message);
    }
}

module.exports = {
    getFeedbacksSortByDescDates,
    getFeedbacksSortByAscDates,
    getFeedbacksSortByStatus,
    getFeedbacksSortByStatusAndDescDates,
    getFeedbacksSortByStatusAndAscDates,
    getFeedbackById,
    updateStatus,
    removeTransaction
}