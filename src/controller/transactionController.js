const mongoose = require("mongoose");
const Transaction = mongoose.model('Locker');
const {sendError} = require('../util/constants');
const serviceUtil = require("./serviceController");
const feedbackController = require("./feedbackController");
const lockerController = require("./lockerController");
const userController = require("./userController");

/**
 * CONSTANTS
 */
const COMPLETED = 'Completed';
const BOOKED = 'Booked';
const ONGOING = 'Ongoing';
const REMOVED = 'Removed';
const MODIFY = 'MODIFY';
const CANCEL = 'CANCEL';
const VALID = 'Valid';

async function updateRemovedLockersIdToEmpty(locker_id_list) {
    try {
        //todo: haven't test till this part, so far no transaction
        return await Transaction.findOneAndUpdate(
            {locker_id: {$in: locker_id_list}, status: COMPLETED},
            {$unset: {locker_id: ""}, latest_update_datetime: new Date()},
            {returnOriginal: false}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getUncompletedTransactionByPricingId(pricing_id) {
    try {
        return await Transaction.find(
            {pricing_id: pricing_id}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function removePricingId(pricing_id) {
    try {
        return await Transaction.updateMany(
            {pricing_id: pricing_id},
            {pricing_id: ""},
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getAllTransactions(status) {
    try {
        if (serviceUtil.isStringValNullOrEmpty(status)) {
            return await Transaction.find().sort({latest_update_datetime: -1});
        } else {
            return await Transaction.find({status: status}).sort({latest_update_datetime: -1});
        }

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getAllUserTransactions(user_id, status) {
    // status default order: Ongoing, Booked, Completed
    // sort by latest_update_datetime
    let m, add_status, s;
    try {
        m = {"$match": {user_id: new mongoose.Types.ObjectId(user_id)}};
        add_status = {
            $addFields: {
                __status_order: {
                    $switch: {
                        branches: [
                            {case: {$eq: ['$status', ONGOING]}, then: 0},
                            {case: {$eq: ['$status', BOOKED]}, then: 1},
                            {case: {$eq: ['$status', COMPLETED]}, then: 2}
                        ],
                        default: 3,
                    },
                }
            },
        };
        s = {"$sort": {latest_update_datetime: -1}};

        if (!serviceUtil.isStringValNullOrEmpty(status)) {
            m = {"$match": {$and: [{status: status}, {user_id: new mongoose.Types.ObjectId(user_id)}]}};
            return await Transaction.aggregate(
                [m, add_status, s]
            );
        } else {
            return await Transaction.find(
                {user_id: user_id, status: status}
            ).sort({latest_update_datetime: -1});
        }

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function updateFeedbackId(trn_id, feedback_id) {
    try {
        const transaction = await Transaction.findById(trn_id);
        if (!transaction) {
            sendError('Transaction is invalid.');
        }
        await Transaction.updateOne(
            {'_id': trn_id},
            {
                "$push": {
                    "feedback_list": feedback_id
                }
            },
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function createTransaction(doc) {
    try {
        const currentDatetime = new Date();
        const transaction = new Transaction(
            {
                user_id: doc.user_id,
                locker_id: doc.locker_id,
                pricing_id: doc.pricing_id,
                cost: doc.cost,
                create_datetime: currentDatetime,
                latest_update_datetime: currentDatetime,
                start_datetime: doc.start_datetime,
                end_datetime: doc.end_datetime
            }
        );
        await transaction.save();
        return transaction;

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function isLessThanTwoBookToday(uid) {
    const previousDay = new Date();
    previousDay.setDate(previousDay.getDate() - 1);
    try {
        // 2 book per day
        const trns = await Transaction.find(
            {
                user_id: uid,
                create_datetime: {gte: previousDay}
            }
        );
        return (trns.length < 2);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function updateTransaction(action, doc, trn_id) {
    //action: modify, cancel, chg_ps, ALL CAPS
    try {
        switch (action) {
            case MODIFY:
                if (isFieldsEmpty(doc)) {
                    sendError(`Missing fields, transaction = ${doc}`);
                } else {
                    //able to update
                    return await Transaction.findOneAndUpdate(
                        {_id: trn_id},
                        doc,
                        {returnOriginal: false}
                    );
                }
                break;
            case CANCEL:
                //delete transaction
                await Transaction.deleteOne({_id: trn_id});
                //delete trn_id in feedback if any
                await feedbackController.removeTransaction(trn_id);
                //remove trn_id in locker if any, and update locker status to valid
                await lockerController.removeTransactionId(trn_id);
                await lockerController.updateStatus(doc.loc, VALID);
                //remove trn_id in user
                await userController.removeTransactionId(doc.user_id, trn_id);
                return;
            default:
                sendError("No action matched.");
                break;
        }
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

function isFieldsEmpty(doc) {
    const user_id = doc.user_id;
    const locker_id = doc.locker_id;
    const pricing_id = doc.pricing_id;
    const status = doc.status;
    const cost = doc.cost;
    const create_datetime = doc.create_datetime;
    const latest_update_datetime = doc.latest_update_datetime;
    const start_datetime = doc.start_datetime;
    const end_datetime = doc.end_datetime;

    return (serviceUtil.isStringValNullOrEmpty(user_id) ||
        serviceUtil.isStringValNullOrEmpty(locker_id) ||
        serviceUtil.isStringValNullOrEmpty(pricing_id) ||
        serviceUtil.isStringValNullOrEmpty(status) ||
        serviceUtil.isStringValNullOrEmpty(cost) ||
        serviceUtil.isStringValNullOrEmpty(create_datetime) ||
        serviceUtil.isStringValNullOrEmpty(latest_update_datetime) ||
        serviceUtil.isStringValNullOrEmpty(start_datetime) ||
        serviceUtil.isStringValNullOrEmpty(end_datetime));
}

module.exports = {
    updateRemovedLockersIdToEmpty,
    getUncompletedTransactionByPricingId,
    removePricingId,
    getAllTransactions,
    getAllUserTransactions,
    updateFeedbackId,
    createTransaction,
    isLessThanTwoBookToday,
    updateTransaction
}