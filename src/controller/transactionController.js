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

async function updateRemovedLockersIdToEmpty(locker_id_list) {
    try {
        //todo: haven't test till this part, so far no transaction
        return await Transaction.findOneAndUpdate(
            {locker_id: {$in: locker_id_list}, status: COMPLETED},
            {$unset: { locker_id: ""}, latest_update_datetime: new Date()},
            {returnOriginal: false}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

module.exports = {
    updateRemovedLockersIdToEmpty
}