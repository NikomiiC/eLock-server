const mongoose = require("mongoose");
const Location = mongoose.model('Location');
const {sendError} = require('../util/constants');
const lockerController = require('./lockerController');
//const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');
//note: test date
//let currentDate = new Date('2024-03-01T14:51:06.157Z');


const UPDATE_LOCATION_ID = 'UPDATE_LOCATION_ID';
const ADD_LOCKERS_TO_LOCATION = 'ADD_LOCKERS_TO_LOCATION';

async function getAllLocations() {
    try {
        return await Location.find();
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLocationById(id) {
    try {
        return await Location.findById(id);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLocationByPostcode(postcode) {
    try {
        return await Location.find({postcode: postcode});
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLocationsByArea(area) {
    try {
        return await Location.find({area: area});
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLocationsByLonLat(lon, lat) {
    try {
        return await Location.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
                    distanceField: "dist.calculated",
                    maxDistance: 5000,//meter
                    //query: { category: "Parks" },
                    includeLocs: "dist.location",
                    spherical: true
                }
            },
            //{ $limit: 5 }
        ])
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function addLockers(location_id, lockerList, passInFuncName) {
    try {
        //check if lockers has been linked with other location
        //check if locker is occupied
        const locatedLockers = await lockerController.getLocatedLockersByIds(lockerList);
        const occupiedLockers = await lockerController.getOccupiedLockersByIds(lockerList);
        if(passInFuncName === ADD_LOCKERS_TO_LOCATION){
            if ((locatedLockers === undefined || locatedLockers.length === 0) && (occupiedLockers === undefined || occupiedLockers.length === 0)) {
                return await Location.findOneAndUpdate(
                    {_id: location_id},
                    {$push: {locker_list: {$each: lockerList}}},//{$each: lockerList}
                    {returnOriginal: false}
                );
            } else {
                sendError(`Lockers has been assigned to a location or in use, locatedLockers: ${locatedLockers}, occupiedLockers : ${occupiedLockers}`);
            }
        }
        else{ //UPDATE_LOCATION_ID
            if (occupiedLockers === undefined || occupiedLockers.length === 0) {
                return await Location.findOneAndUpdate(
                    {_id: location_id},
                    {$push: {locker_list: {$each: lockerList}}},//{$each: lockerList}
                    {returnOriginal: false}
                );
            } else {
                sendError(`Lockers in use, occupiedLockers : ${occupiedLockers}`);
            }
        }



    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getLocationsByAddressName(addressName) {
    try {
        return await Location.fuzzySearch(addressName);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function deleteLocationById(location_id) {
    try {
        return await Location.deleteOne(
            {_id: location_id}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function removeLockersById(location_id, locker_list) {
    try {
        return await Location.findOneAndUpdate(
            {_id: location_id},
            {"$pull": {locker_list: {$in: locker_list}}},
            {returnOriginal: false}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function isDuplicatePostcode(postcode) {
    try {
        const location = await Location.find(
            {postcode: postcode}
        );
        return (location.length !== 0);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

module.exports = {
    getAllLocations,
    getLocationById,
    getLocationByPostcode,
    getLocationsByArea,
    getLocationsByLonLat,
    addLockers,
    deleteLocationById,
    removeLockersById,
    isDuplicatePostcode,
    getLocationsByAddressName
}