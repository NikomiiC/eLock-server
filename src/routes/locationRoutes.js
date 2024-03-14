const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const locationController = require("../controller/locationController");
const userController = require("../controller/userController");
const serviceUtil = require("../controller/serviceController")
const feedbackController = require("../controller/feedbackController");
const lockerController = require("../controller/lockerController");
const transactionController = require("../controller/transactionController");
const Location = mongoose.model('Location');
const router = express.Router();
router.use(requireAuth); // require user to sign in first


/**
 * CONSTANTS
 */
const LOC_SIZE = 2;
const USER = 'u';
const ADMIN = 'admin';

/**
 * Method: GET
 */

router.get('/all_locations', async (req, res) => {
    let locations;
    try {
        locations = await locationController.getAllLocations();
        res.send(resResult(0, 'Successfully get all locations', locations));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all locations ` + err.message));
    }
});

router.get('/location/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const location = await locationController.getLocationById(id);
        res.send(resResult(0, 'Successfully get location', location));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get location ` + err.message));
    }
});

//todo:
/**
 * 1. fuzzy search by formatted_address. Front end Google API call, send backend with the formatted_address. Backend fuzzy search with the formatted address. Implement after other locations CRUD complete
 * or
 * 2. just get user's input search in locations, not go through google
 */


/**
 * npm i mongoose-fuzzy-searching
 * https://dev.to/briansw/implement-fuzzy-text-search-with-mongoose-1ae1
 * try later
 */

// router.get('/location/:addressName', async(req, res) =>{
//     const addressName = req.params.addressName;
//     try{
//         const location = await locationController.getLocationsByAddressName(addressName);
//         res.send(resResult(0, 'Successfully get locations', location));
//     }catch (err){
//         return res.status(422).send(resResult(1, `Fail to get locations ` + err.message));
//     }
// });

router.get('/location_postcode/:postcode', async (req, res) => {
    const postcode = req.params.postcode;
    try {
        const location = await locationController.getLocationByPostcode(postcode);
        res.send(resResult(0, 'Successfully get location', location));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get location ` + err.message));
    }
});

router.get('/locations/:area', async (req, res) => {
    const area = req.params.area;
    try {
        const locations = await locationController.getLocationsByArea(area);
        res.send(resResult(0, 'Successfully get locations', locations));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get locations ` + err.message));
    }
});

router.get('/locations/:lon/:lat', async (req, res) => {
    const lon = req.params.lon;
    const lat = req.params.lat;

    try {
        const locations = await locationController.getLocationsByLonLat(lon, lat);
        if(locations.length !== 0){
            res.send(resResult(0, 'Successfully get locations', locations));
        }
        else{
            res.send(resResult(0, 'No near locations found', locations));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get locations ` + err.message));
    }
});


/**
 * Method: POST
 * @type {Router}
 */

router.post('/create_location', async (req, res) => {

    //save locker_list will be separate function
    const params = req.body;
    const area = params.area;
    const formatted_address = params.formatted_address;
    const postcode = params.postcode;
    const loc = params.loc;

    // role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            // empty fields check
            if (serviceUtil.isStringValNullOrEmpty(area) || serviceUtil.isStringValNullOrEmpty(formatted_address) || serviceUtil.isStringValNullOrEmpty(postcode) || loc.coordinates.length !== LOC_SIZE) {
                return res
                    .status(422)
                    .send(resResult(1, `Please pass all parameters. area: ${area}, formatted_address: ${formatted_address}, postcode: ${postcode}, loc: ${loc} `));
            }
            try {
                //check if duplicate postcode
                if(await locationController.isDuplicatePostcode(postcode)){
                    return res
                        .status(422)
                        .send(resResult(1, `Add failed, postcode: ${postcode} already exist`));
                }
                const location = new Location(
                    {
                        area: area,
                        formatted_address: formatted_address,
                        postcode: postcode,
                        loc: loc,
                    });
                // add location
                await location.save();
                res.send(resResult(0, `Successfully add a new location`, location));
            } catch (err) {
                return res.status(422).send(resResult(1, err.message));
            }
        } else {
            return res.status(422).send(resResult(1, "User has no permission to create location."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

// update location's locker list
router.post('/update_location/add_lockers/:id', async (req, res) => {

    const location_id = req.params.id;
    const params = req.body;
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            let new_location = await locationController.addLockers(location_id, params.locker_list);
            //update locker's location id
            await lockerController.updateLocationByIds(location_id, params.locker_list);
            res.send(resResult(0, `Successfully add lockers to location ${location_id}`, new_location));
        } else {
            return res.status(422).send(resResult(1, "User has no permission to add lockers to location."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

//update location with full document, when admin update any fields need to pass the full document, but not locker list
router.post('/update_location/:id', async (req, res) => {

    const location_id = req.params.id;
    const params = req.body;
    const area = params.area;
    const formatted_address = params.formatted_address;
    const postcode = params.postcode;
    const loc = params.loc;

    // role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            // empty fields check
            if (serviceUtil.isStringValNullOrEmpty(area) || serviceUtil.isStringValNullOrEmpty(formatted_address) || serviceUtil.isStringValNullOrEmpty(postcode) || loc.coordinates.length !== LOC_SIZE) {
                return res
                    .status(422)
                    .send(resResult(1, `Please pass all parameters. area: ${area}, formatted_address: ${formatted_address}, postcode: ${postcode}, loc: ${loc} `));
            }
            try {
                const new_location = await Location.findOneAndUpdate(
                    {_id: location_id},
                    params,
                    {returnOriginal: false}
                );
                res.send(resResult(0, `Successfully update location ${location_id}`, new_location));
            } catch (err) {
                return res.status(422).send(resResult(1, err.message));
            }
        } else {
            return res.status(422).send(resResult(1, "User has no permission to update location."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.post('/update_location/remove_lockers/:id', async (req, res) => {

    const location_id = req.params.id;
    const params = req.body;
    const locker_list = params.locker_list;

    // role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            // empty fields check
            if (locker_list.length === 0) {
                return res
                    .status(422)
                    .send(resResult(1, `Please pass locker_list with IDs `));
            }
            try {
                const location = await locationController.getLocationById(location_id);
                //check if lockers occupied
                const occupiedLockers = await lockerController.getOccupiedLockersByIds(location.locker_list);

                if(occupiedLockers.length === 0){
                    //pull from locker_list
                    const new_location = await locationController.removeLockersById(location_id, locker_list);
                    //remove location_id from locker
                    await lockerController.removeLocationByIds(params.locker_list);
                    res.send(resResult(0, `Successfully remove lockers from location ${location_id}`, new_location));
                }
                else{
                    return res.status(422).send(resResult(1, `Remove lockers failed, lockers are occupied`));
                }
            } catch (err) {
                return res.status(422).send(resResult(1, err.message));
            }
        } else {
            return res.status(422).send(resResult(1, "User has no permission to update location."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

/**
 * Method - DELETE
 */
/**
 * delete a location, delete only when all lockers under this location are not occupied, update corresponding transaction's locker_id to "removed". then delete the lockers as well
 *
 * for front end display transactions to user/admin, check if locker_id is === "removed" and status is "Completed", if yes can display this locker is not available currently
 */

router.delete('/delete_location/:id', async (req, res) => {
    const location_id = req.params.id;
// role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {

            try {
                const location = await locationController.getLocationById(location_id);
                //check if lockers occupied
                const occupiedLockers = await lockerController.getOccupiedLockersByIds(location.locker_list);
                if(occupiedLockers.length === 0){
                    //update transaction locker id to removed, try first not sure if can assign string to _id
                    await transactionController.updateRemovedLockersIdToNull(location.locker_list);
                    await lockerController.deleteLockersByIds(location.locker_list);
                    await locationController.deleteLocationById(location_id);
                }
                else{
                    return res.status(422).send(resResult(1, `Location ${location_id} has lockers in use, cannot delete this location.`));
                }
                res.send(resResult(0, `Successfully delete the location ${location_id}`));
            } catch (err) {
                return res.status(422).send(resResult(1, err.message));
            }
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

module.exports = router;