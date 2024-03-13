const mongoose = require("mongoose");
const Transaction = mongoose.model('Locker');
const {sendError} = require('../util/constants');


/**
 * CONSTANTS
 */
const COMPLETED = 'Completed';
const BOOKED = 'Booked';
const ONGOING = 'Ongoing';
const REMOVED = 'Removed';

async function updateRemovedLockersIdToNull(locker_id_list) {
    try {
        return await Transaction.findOneAndUpdate(
            {locker_id: {$in: locker_id_list}, status: COMPLETED},
            {locker_id: REMOVED, latest_update_datetime: new Date()},
            {returnOriginal: false}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

module.exports = {
    updateRemovedLockersIdToNull
}