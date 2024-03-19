const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const lockerController = require("../controller/lockerController");
const userController = require("../controller/userController");
const serviceUtil = require("../controller/serviceController");
const feedbackController = require("../controller/feedbackController");
const locationController = require("../controller/locationController");
const transactionController = require("../controller/transactionController");
const Locker = mongoose.model('Locker');
const router = express.Router();
router.use(requireAuth); // require user to sign in first

/**
 * CONSTANTS
 */
const USER = 'u';
const ADMIN = 'admin';

/**
 * Method GET
 */
router.get('/all_lockers', async (req, res) => {
    try {
        const lockers = await lockerController.getAllLockers();
        res.send(resResult(0, 'Successfully get all lockers', lockers));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all lockers ` + err.message));
    }
});

router.get('/locker/:id', async (req, res) => {
    try {
        const locker = await lockerController.getLockerById(req.params.id);
        res.send(resResult(0, 'Successfully get locker', locker));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get locker ` + err.message));
    }
});

router.get('/lockers/by_location_id/:id', async (req, res) => {
    const location_id = req.params.id;
    const status = req.query.status;
    const size = req.query.size;
    if(location_id === undefined){
        return res.status(422).send(resResult(1, `Please pass location id, location_id = ${location_id}`));
    }
    try {
        const lockers = await lockerController.getLockersByLocationId(location_id, status, size);
        res.send(resResult(0, 'Successfully get lockers', lockers));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get lockers ` + err.message));
    }
});

router.get('/locker/by_trn_id/:id', async (req, res) => {
    const trn_id = req.params.id;
    try {
        const locker = await lockerController.getLockerByTransactionId(trn_id);
        res.send(resResult(0, 'Successfully get locker', locker));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get locker ` + err.message));
    }
});

/**
 * Method POST
 */
//create multi lockers in one call
router.post('/create_lockers', async (req, res) => {

    const params = req.body;

    // empty fields check
    for (const doc of params) {
        const size = doc.size;
        //const location_id = doc.location_id;
        if (serviceUtil.isStringValNullOrEmpty(size)) {
            return res
                .status(422)
                .send(resResult(1, `Please pass all parameters. size: ${size}`));
        }
    }
    // role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            try {
                const lockers = await lockerController.insertManyLockers(params);
                res.send(resResult(0, `Successfully add lockers`, lockers));
            } catch (err) {
                return res.status(422).send(resResult(1, err.message));
            }
        } else {
            return res.status(422).send(resResult(1, "User has no permission to create lockers."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.post('/locker/update_status/:id', async (req, res) => {

    const id = req.params.id;
    const params = req.body;

    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            const new_locker = await lockerController.updateStatus(id, params.status);

            res.send(resResult(0, `Successfully update status `, new_locker));
        } else {
            return res.status(422).send(resResult(1, "User has no permission to update location."));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }

});

router.post('/locker/update_location/:id', async (req, res) => {

    const id = req.params.id;
    const params = req.body;

    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            await lockerController.updateLocationByIds(params.location_id, [id]);
            const new_locker = lockerController.getLockerById(id);
            res.send(resResult(0, `Successfully update location id `, new_locker));
        } else {
            return res.status(422).send(resResult(1, "User has no permission to update location."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }

});

/**
 * Method: DELETE
 */
router.delete('/delete_locker', async (req, res) => {
    const params = req.body;
    const locker_id_list = params.locker_list;
// role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            const occupiedLockers = await lockerController.getOccupiedLockersByIds(locker_id_list);
            if (occupiedLockers.length === 0) {
                //update transaction locker id to removed, try first not sure if can assign string to _id
                await transactionController.updateRemovedLockersIdToNull(location.locker_list);
                await lockerController.deleteLockersByIds(location.locker_list);
            } else {
                return res.status(422).send(resResult(1, `Failed to delete, lockers in use`));
            }
            res.send(resResult(0, `Successfully delete lockers ${locker_id_list}`));
        } else {
            return res.status(422).send(resResult(1, "User has no permission to update location."));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});


module.exports = router;