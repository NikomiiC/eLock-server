const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const pricingController = require("../controller/pricingController");
const lockerController = require("../controller/lockerController");
const serviceUtil = require("../controller/serviceController");
const userController = require("../controller/userController");
const locationController = require("../controller/locationController");
const transactionController = require("../controller/transactionController");
const Pricing = mongoose.model('Pricing');
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

router.get('/all_pricing', async (req, res) => {
    try {
        const pricing = await pricingController.getAllPricing();
        res.send(resResult(0, 'Successfully get all pricing', pricing));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all pricing ` + err.message));
    }
});

router.get('/pricing/:id', async (req, res) => {
    try {
        const pricing = await pricingController.getPricingById(req.params.id);
        res.send(resResult(0, 'Successfully get pricing', pricing));
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get pricing ` + err.message));
    }
});

/**
 * Method POST
 */

router.post('/create_pricing', async (req, res) => {

    const params = req.body;
    // role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            try {
                const pricing = await pricingController.insertPricing(params);
                res.send(resResult(0, `Successfully add pricing`, pricing));
            } catch (err) {
                return res.status(422).send(resResult(1, err.message));
            }
        } else {
            return res.status(422).send(resResult(1, "User has no permission to create pricing."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.post('/update_pricing/:id', async (req, res) => {

    const params = req.body;
    // role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            try {
                const pricing = await pricingController.updatePricing(req.params.id, params);
                res.send(resResult(0, `Successfully update pricing`, pricing));
            } catch (err) {
                return res.status(422).send(resResult(1, err.message));
            }
        } else {
            return res.status(422).send(resResult(1, "User has no permission to update pricing."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});


/**
 * Method DELETE
 */

router.delete('/delete_pricing/:id', async (req, res) => {
    const pricing_id = req.params.id;
    /**
     * check transaction by pricing_id
     * if transaction is completed, delete pricing
     * if any transaction is not completed, not allow to delete
     */
// role check
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            //todo: To implement below functions in controller
            // check if any Uncompleted transaction
            const uncompletedTransaction = await transactionController.getUncompletedTransactionByPricingId(pricing_id);
            if (uncompletedTransaction.length === 0) {
                //able to delete pricing
                await transactionController.removePricingId(pricing_id);
                await pricingController.deletePricingById(pricing_id);
            } else {
                //unable to delete
                return res.status(422).send(resResult(1, `Unable to delete, there are uncompleted transaction with pricing ${pricing_id}.`));
            }
            res.send(resResult(0, `Successfully delete the pricing ${pricing_id}`));

        } else {
            return res.status(422).send(resResult(1, "User has no permission to delete pricing."));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});


module.exports = router;