const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const locationController = require("../controller/locationController");
const Location = mongoose.model('Location');
const router = express.Router();
router.use(requireAuth); // require user to sign in first

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

//todo: fuzzy search by formatted_address. Front end Google API call, send backend with the formatted_address. Backend fuzzy search with the formatted address. Implement after other locations CRUD complete
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

module.exports = router;