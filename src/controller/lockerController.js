const mongoose = require("mongoose");
const Locker = mongoose.model('Locker');
const {sendError} = require('../util/constants');


/**
 * CONSTANTS
 */
const OCCUPIED = 'Occupied';
const VALID = 'Valid';


async function getOccupiedLockersByIds(locker_id_list) {
    try {
        return await Locker.find(
            {_id: {$in: locker_id_list}, status : OCCUPIED}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function deleteLockersByIds(locker_id_list) {
    try {
        return await Locker.deleteMany(
            {_id: {$in: locker_id_list}, status : VALID}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function insertManyLockers(docs) {
    try {
        return await Locker.insertMany(docs);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLocatedLockersByIds(locker_id_list) {
    try {
        return await Locker.find(
            {_id: {$in: locker_id_list}, location_id : { $ne : null }}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}
module.exports = {
    getOccupiedLockersByIds,
    deleteLockersByIds,
    insertManyLockers,
    getLocatedLockersByIds
}