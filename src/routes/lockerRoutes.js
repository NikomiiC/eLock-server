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
const slotsController = require("../controller/slotsController");
const Locker = mongoose.model('Locker');
const router = express.Router();
router.use(requireAuth); // require user to sign in first

/**
 * CONSTANTS
 */
const USER = 'u';
const ADMIN = 'admin';
const VALID = 'Valid';
const OCCUPIED = 'Occupied';
const UPDATE_LOCATION_ID = 'UPDATE_LOCATION_ID';
const ONGOING = 'Ongoing';
const COMPLETED = 'Completed';
const BOOKED = 'Booked';

/**
 * Method GET
 */
router.get('/all_lockers', async (req, res) => {
    try {
        //when call this endpoints run update trn status by current date time.
        // todo: uncomment after transaction test done
        //await transactionController.updateTransactionByCurrentDatetime();
        const lockers = await lockerController.getAllLockers();
        res.send(resResult(0, 'Successfully get all lockers', lockers));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all lockers ` + err.message));
    }
});

router.get('/locker/:id', async (req, res) => {
    try {
        const locker = await lockerController.getLockerById(req.params.id);
        const slots = await slotsController.getSlotsByLockerId(req.params.id);
        res.send(resResult(0, 'Successfully get locker', {locker, slots}));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get locker ` + err.message));
    }
});

router.get('/lockers/by_location_id/:id', async (req, res) => {
    const location_id = req.params.id;
    const status = req.query.status;
    const size = req.query.size;
    if (location_id === undefined) {
        return res.status(422).send(resResult(1, `Please pass location id, location_id = ${location_id}`));
    }
    try {
        //when call this endpoints run update trn status by current date time.
        // todo: uncomment after transaction test done
        //await transactionController
        //await transactionController.updateTransactionByCurrentDatetime();
        const lockers = await lockerController.getLockersByLocationId(location_id, status, size);
        if (lockers.length === 0) {
            res.send(resResult(0, 'No match lockers found', lockers));
        }
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

    const id = req.params.id; //locker id
    const params = req.body;

    /**
     * check locker status, update only when status is valid
     * remove locker from original location
     * add locker to new location
     * update location id of locker object
     */
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            const locker = await lockerController.getLockerById(id);
            if (locker.status !== VALID) {
                return res.status(422).send(resResult(1, "Failed to update location id, locker is occupied currently"));
            }
            await locationController.removeLockersById(locker.location_id, [id]);
            await locationController.addLockers(params.location_id, [id], UPDATE_LOCATION_ID);
            await lockerController.updateLocationByIds(params.location_id, [id]);
            const new_locker = await lockerController.getLockerById(id);
            res.send(resResult(0, `Successfully update location id `, new_locker));
        } else {
            return res.status(422).send(resResult(1, "User has no permission to update location."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }

});
router.post('/delete_locker', async (req, res) => {
    const params = req.body;
    const locker_id_list = params.locker_list;
    const location_id = params.location_id;
// role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            const occupiedLockers = await lockerController.getOccupiedLockersByIds(locker_id_list);
            if (occupiedLockers.length === 0) {
                //update transaction locker id to removed
                await transactionController.updateRemovedLockersIdToEmpty(locker_id_list);
                await locationController.removeLockersById(location_id, locker_id_list);
                await lockerController.deleteLockersByIds(locker_id_list);
            } else {
                return res.status(422).send(resResult(1, `Failed to delete, lockers in use, occupiedLockers: `, occupiedLockers));
            }
            res.send(resResult(0, `Successfully delete lockers ${locker_id_list}`));
        } else {
            return res.status(422).send(resResult(1, "User has no permission to update location."));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.post('/locker/update_passcode/:id', async (req, res) => {

    const id = req.params.id;
    const passcode = req.body.passcode;

    try {
        const new_locker = await lockerController.setPasscode(passcode, id);
        res.send(resResult(0, `Successfully update status `, new_locker));
    } catch
        (err) {
        return res.status(422).send(resResult(1, err.message));
    }

});

router.post('/locker_use/:id', async (req, res) => {
    const trn_id = req.query.trn_id;
    const locker_id = req.params.id;
    const params = req.body;

    try {
        const trn = transactionController.getTransactionById(trn_id);
        if(trn === undefined){
            sendError("Invalid transaction.");
        }
        if(trn.status === BOOKED){
            sendError("Transaction not start yet. Please try after the booking start.");
        }
        if(trn.status === COMPLETED){
            sendError("Fail to use locker. Transaction is completed.");
        }

        const new_locker = await lockerController.updateStatus(locker_id, OCCUPIED);

        res.send(resResult(0, `Successfully update status `, new_locker));


    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }

});

module.exports = router;