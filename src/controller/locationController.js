const mongoose = require("mongoose");
const Location = mongoose.model('Location');
const {sendError} = require('../util/constants');
//note: test date
//let currentDate = new Date('2024-03-01T14:51:06.157Z');

let currentDate = new Date();

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
        return await Location.findOne({postcode: postcode});
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
        return await Location.find({
            loc: {
                $near: {
                    $maxDistance: 1000,
                    $geometry: {
                        type: "Point",
                        coordinates: [lon, lat],
                    },
                }
            }
        });
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function addLockers(location_id, lockerList) {
    try {
        return await Location.findOneAndUpdate(
            {_id: location_id},
            {$push: {locker_list: {$each: lockerList}}},
            {returnOriginal: false}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

// async function getLocationsByAddressName(addressName) {
//     try {
//         return await Location.fuzzySearch({query: addressName, limit: 20});
//     } catch (err) {
//         console.log(err.message);
//         sendError(err.message);
//     }
// }

module.exports = {
    getAllLocations,
    getLocationById,
    getLocationByPostcode,
    getLocationsByArea,
    getLocationsByLonLat,
    addLockers
    //getLocationsByAddressName
}