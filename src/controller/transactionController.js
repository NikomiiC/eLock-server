const mongoose = require("mongoose");
const Transaction = mongoose.model('Locker');
const {sendError} = require('../util/constants');
const serviceUtil = require("./serviceController");
const feedbackController = require("./feedbackController");
const lockerController = require("./lockerController");
const userController = require("./userController");
const slotsController = require("./slotsController");
const moment = require('moment');

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
const OCCUPIED = 'Occupied';
const RELEASE = 'RELEASE';

let slot;
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
        //check if any trn with same locker_id with same slots using
        const overlapTrnLength = await getOverlapTransaction(doc.locker_id, doc.start_index, doc.end_index, doc.start_date, doc.end_date);
        if (overlapTrnLength) {
            sendError("Locker is occupied in current slot.");
        }
        const transaction = new Transaction(
            {
                user_id: doc.user_id,
                locker_id: doc.locker_id,
                pricing_id: doc.pricing_id,
                cost: doc.cost,
                create_datetime: currentDatetime,
                latest_update_datetime: currentDatetime,
                start_index: doc.start_index,
                end_index: doc.end_index,
                start_date: doc.start_date,
                end_date: doc.end_date
            }
        );
        await transaction.save();
        //update slots
        await slotsController.addSlot(doc.locker_id, doc.start_date, doc.end_date, doc.start_index, doc.end_index, slot);
        //update trn to user
        await userController.updateTransactionId(doc.user_id, transaction._id);
        //update
        return transaction;

    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getOverlapTransaction(locker_id, start_index, end_index, start_date, end_date) {
    /**
     * check slots, query by date
     */
        // if start_date and end_date are same date
    const sdate = new Date(start_date.split('T')[0]);
    const edate = new Date(end_date.split('T')[0]);
    let result = false;
    try {
        slot = await slotsController.getSlotsByDate(start_date, end_date, locker_id);
        if (slot.length === 0) {
            //no overlap can just add
            return result;
        }
        if (slot.length === 1) {
            // start date = end date
            //check slot
            for (let i = start_index; i <= end_index; i++) {
                if (slot.slots[i] === 1) {
                    result = true;
                    break;
                }
            }
        } else {
            //end_date not same date as start_date, slots sort by recordDate asc
            let innerResult = false;
            for (let s of slot) {
                if (new Date(s.recordDate.split('T')[0]).getTime() === sdate.getTime()) {
                    for (let i = start_index; i <= 24; i++) {
                        if (slot.slots[i] === 1) {
                            innerResult = true;
                            break;
                        }
                    }
                } else if (new Date(s.recordDate.split('T')[0]).getTime() === edate.getTime()) {
                    for (let i = 0; i <= end_index; i++) {
                        if (slot.slots[i] === 1) {
                            innerResult = true;
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i <= 24; i++) {
                        if (slot.slots[i] === 1) {
                            innerResult = true;
                            break;
                        }
                    }
                }
                if (innerResult === true) {
                    result = true;
                    break;
                }
            }

        }
        return result;
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
    // const overlapTransactions = await Transaction.find(
    //     {
    //         locker_id: locker_id,
    //         $or: [
    //             {status: ONGOING},
    //             {$and: [{start_datetime: {"$lt": end_datetime}}, {end_datetime: {"$gt": start_datetime}}]}
    //         ]
    //     }
    // );
    // return overlapTransactions.length;
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
    //action: modify, cancel, release ALL CAPS
    try {
        switch (action) {
            case MODIFY:
                if (isFieldsEmpty(doc)) {
                    sendError(`Missing fields, transaction = ${doc}`);
                } else {
                    //able to update
                    // check if changed locker_id
                    const old_trn = await Transaction.findById(trn_id);
                    if (old_trn.locker_id !== doc.locker_id) {
                        //check availability of new locker
                        const new_locker = lockerController.getLockerById(doc.locker_id);
                        if (new_locker.status !== VALID) {
                            sendError("Failed to update, locker is occupied");
                        } else {
                            //release old locker
                            await lockerController.updateStatus(old_trn.locker_id, VALID);
                            //set new locker
                            await lockerController.updateStatus(doc.locker_id, OCCUPIED);
                        }
                    }
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
                await lockerController.updateStatus(doc.locker_id, VALID);
                //remove trn_id in user
                await userController.removeTransactionId(doc.user_id, trn_id);
                return;

            case RELEASE:
                //release locker
                await lockerController.updateStatus(doc.locker_id, VALID);
                await lockerController.removeTransactionId(trn_id);
                return await Transaction.findOneAndUpdate(
                    {_id: trn_id},
                    {status: COMPLETED},
                    {returnOriginal: false}
                );
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
    const start_date = doc.start_date;
    const end_date = doc.end_date;

    return (serviceUtil.isStringValNullOrEmpty(user_id) ||
        serviceUtil.isStringValNullOrEmpty(locker_id) ||
        serviceUtil.isStringValNullOrEmpty(pricing_id) ||
        serviceUtil.isStringValNullOrEmpty(status) ||
        serviceUtil.isStringValNullOrEmpty(cost) ||
        serviceUtil.isStringValNullOrEmpty(create_datetime) ||
        serviceUtil.isStringValNullOrEmpty(latest_update_datetime) ||
        serviceUtil.isStringValNullOrEmpty(start_date) ||
        serviceUtil.isStringValNullOrEmpty(end_date));
}

async function updateTransactionByCurrentDatetime() {
    // if current date time >= start time  && <= end time, status change to Ongoing
    const currentDateTime = new Date();
    try {
        await Transaction.updateMany(
            {
                start_date: {"$lte": currentDateTime},
                end_date: {"$gte": currentDateTime}
            },
            {status: ONGOING}
        );
        const ongoingLockerList = await Transaction.find({status: ONGOING}, {_id: 1, locker_id: 1});
        // list of below
        // {
        //   "_id": {
        //     "$oid": "65f940684a467c8af8802b67"
        //   },
        //   "locker_id": {
        //     "$oid": "65f2a247f04502db5d4eb44c"
        //   }
        // }
        // update locker status and trn_id
        await lockerController.updateLockersStatusAndTrn(ongoingLockerList, OCCUPIED);
        // no auto release, only front end send release request then change status, use updateTransaction to release
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
    isLessThanTwoBookToday,
    updateTransaction,
    updateTransactionByCurrentDatetime
}