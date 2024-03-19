const mongoose = require("mongoose");
const Locker = mongoose.model('Locker');
const {sendError} = require('../util/constants');
const serviceUtil = require("../controller/serviceController");

/**
 * CONSTANTS
 */
const OCCUPIED = 'Occupied';
const VALID = 'Valid';
const SMALL = 'Small';
const MEDIUM = 'Medium';
const LARGE = 'Large';
const ENUM_STATUS = ['Occupied', 'Valid'];
const ENUM_SIZE = ['Small', 'Medium', 'Large'];

async function getOccupiedLockersByIds(locker_id_list) {
    try {
        return await Locker.find(
            {_id: {$in: locker_id_list}, status: OCCUPIED}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function deleteLockersByIds(locker_id_list) {
    try {
        return await Locker.deleteMany(
            {_id: {$in: locker_id_list}, status: VALID}
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
            {_id: {$in: locker_id_list}, location_id: {$ne: null}}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function updateLocationByIds(location_id, locker_id_list) {
    try {
        //updateMany dont return updated docs, have to do another query
        return await Locker.updateMany(
            {_id: {$in: locker_id_list}},
            {location_id: location_id}
        );
        // return await Locker.find(
        //     {_id: {$in: locker_id_list}}
        // )
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function removeLocationByIds(locker_id_list) {
    try {
        return await Locker.updateMany(
            {_id: {$in: locker_id_list}},
            {$unset: {location_id: ""}}
        );

        // return await Locker.find(
        //     {_id: {$in: locker_id_list}}
        // )
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLockerByTransactionId(trn_id) {
    try {
        return await Locker.find({trn_id: trn_id});
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLockerById(id) {
    try {
        return await Locker.findById(id);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function updateStatus(locker_id, status) {
    const locker = await getLockerById(locker_id);
    let new_locker;
    if (!locker) {
        sendError('Update status fail, invalid feedback');
    } else {
        try {
            new_locker = await Locker.findOneAndUpdate({_id: locker_id}, {
                status: status,
            }, {
                returnOriginal: false
            });
            return new_locker;
        } catch (err) {
            sendError(err.message);
        }
    }
}

async function getAllLockers() {
    try {
        return await Locker.find();
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLockersByLocationId(location_id, status, size) {
    /**
     * default return order by valid first then occupied, size: s - m - l
     * 1. have status no size
     * 2. no status have size
     * 3. have status have size
     */

    let m, add_status, add_size, s, result;

    try {
        m = {"$match": {$and: [{"status": {"$in": ENUM_STATUS}}, {"size": {"$in": ENUM_SIZE}}]}};
        add_status = {"$addFields": {"__status_order": {"$indexOfArray": [ENUM_STATUS, "$status"]}}};
        add_size = {"$addFields": {"__size_order": {"$indexOfArray": [ENUM_SIZE, "$size"]}}};

        if ((serviceUtil.isStringValNullOrEmpty(status) && serviceUtil.isStringValNullOrEmpty(size)) || (!serviceUtil.isStringValNullOrEmpty(status) && serviceUtil.isStringValNullOrEmpty(size) && status === VALID)) {
            s = {"$sort": {"__status_order": -1, "__size_order": 1}};
        }
        else if(!serviceUtil.isStringValNullOrEmpty(status) && serviceUtil.isStringValNullOrEmpty(size) && status === OCCUPIED){
            m = {"$match": {$and: [{"status": status}, {"size": {"$in": ENUM_SIZE}}]}};
            s = {"$sort": {"__size_order": 1}};
        }
        else if(serviceUtil.isStringValNullOrEmpty(status) && !serviceUtil.isStringValNullOrEmpty(size)){
            s = {"$sort": {"__status_order": -1}};
            m = {"$match": {$and: [{"status": {"$in": ENUM_STATUS}}, {"size": size}]}};
        }
        else{
            m = {"$match": {$and: [{"status": status}, {"size": size}]}};
            s = {"$sort": {"__status_order": -1, "__size_order": 1}};
        }
        result = await Locker.aggregate([m, add_status, add_size, s]);
        console.log(result);

        return result;
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}


module.exports = {
    getOccupiedLockersByIds,
    deleteLockersByIds,
    insertManyLockers,
    getLocatedLockersByIds,
    updateLocationByIds,
    removeLocationByIds,
    updateStatus,
    getAllLockers,
    getLockerById,
    getLockersByLocationId,
    getLockerByTransactionId
}