const mongoose = require("mongoose");
const Transaction = mongoose.model('Locker');
const {sendError} = require('../util/constants');
const serviceUtil = require("../controller/serviceController");

/**
 * CONSTANTS
 */
const COMPLETED = 'Completed';
const BOOKED = 'Booked';
const ONGOING = 'Ongoing';
const REMOVED = 'Removed';

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
                user_id : doc.user_id,
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

module.exports = {
    updateRemovedLockersIdToEmpty,
    getUncompletedTransactionByPricingId,
    removePricingId,
    getAllTransactions,
    getAllUserTransactions,
    updateFeedbackId,
    createTransaction,
    isLessThanTwoBookToday
}