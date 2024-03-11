const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const locationController = require("../controller/locationController");
const userController = require("../controller/userController");
const serviceUtil = require("../controller/serviceController")
const feedbackController = require("../controller/feedbackController");
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

router.get('/all_locations', async(req, res) =>{
    let locations;
    try{
        locations = await locationController.getAllLocations();
        res.send(resResult(0, 'Successfully get all locations', locations));
    }catch (err){
        return res.status(422).send(resResult(1, `Fail to get all locations ` + err.message));
    }
});

router.get('/location/:id', async(req, res) =>{
    const id = req.params.id;
    try{
        const location = await locationController.getLocationById(id);
        res.send(resResult(0, 'Successfully get location', location));
    }catch (err){
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

router.get('/location/:postcode', async(req, res) =>{
    const postcode = req.params.postcode;
    try{
        const location = await locationController.getLocationByPostcode(postcode);
        res.send(resResult(0, 'Successfully get location', location));
    }catch (err){
        return res.status(422).send(resResult(1, `Fail to get location ` + err.message));
    }
});

router.get('/locations/:area', async(req, res) =>{
    const area = req.params.area;
    try{
        const locations = await locationController.getLocationsByArea(area);
        res.send(resResult(0, 'Successfully get locations', locations));
    }catch (err){
        return res.status(422).send(resResult(1, `Fail to get locations ` + err.message));
    }
});

router.get('/locations/:lon/:lat', async(req, res) =>{
    const lon = req.params.lon;
    const lat = req.params.lat;
    try{
        const locations = await locationController.getLocationsByLonLat(lon, lat);
        res.send(resResult(0, 'Successfully get locations', locations));
    }catch (err){
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
    try{
        const role = await userController.getRole(req);
        if(role === ADMIN){
            // empty fields check
            if(serviceUtil.isStringValNullOrEmpty(area) || serviceUtil.isStringValNullOrEmpty(formatted_address) || serviceUtil.isStringValNullOrEmpty(postcode) || loc.length !== LOC_SIZE){
                return res
                    .status(422)
                    .send(resResult(1, `Please pass all parameters. area: ${area}, formatted_address: ${formatted_address}, postcode: ${postcode}, loc: ${loc} `));
            }
            try {
                const location = new Location(
                    {
                        area: area,
                        formatted_address: formatted_address,
                        postcode: postcode,
                        loc : loc,
                    });
                // add location
                await location.save();
            } catch (err) {
                return res.status(422).send(resResult(1, err.message));
            }
        }
        else{
            return res.status(422).send(resResult(1, "User has no permission to create location."));
        }
    }catch (err){
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
            res.send(resResult(0, `Successfully add lockers to location ${location_id}`, new_location));
        } else {
            return res.status(422).send(resResult(1, "User has no permission to add lockers to location."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

module.exports = router;