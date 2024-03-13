const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const lockerController = require("../controller/lockerController");
const userController = require("../controller/userController");
const serviceUtil = require("../controller/serviceController");
const Locker = mongoose.model('Locker');
const router = express.Router();
router.use(requireAuth); // require user to sign in first

/**
 * CONSTANTS
 */
const USER = 'u';
const ADMIN = 'admin';


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

module.exports = router;