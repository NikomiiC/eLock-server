const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const transactionController = require("../controller/transactionController");
const pricingController = require("../controller/pricingController");
const userController = require("../controller/userController");
const Transaction = mongoose.model('Transaction');
const router = express.Router();
router.use(requireAuth); // require user to sign in first

/**
 * CONSTANTS
 */
const USER = 'u';
const ADMIN = 'admin';
const BOOKED = 'Booked';
const ONGOING = 'Ongoing';
const COMPLETED = 'Completed';

/**
 * Method: GET
 */

router.get('/all_transactions', async (req, res) => {
    //admin only
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            const transactions = await transactionController.getAllTransactions();
            res.send(resResult(0, 'Successfully get all transactions', transactions));
        }
        else{
            return res.status(422).send(resResult(1, "User has no permission to get all transactions."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all transactions ` + err.message));
    }
});

router.get('/user_all_transaction', async (req, res) => {
    const user_id = req.query.user_id;
    //todo: add filter terms
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN && user_id !== undefined) {
            const transactions = await transactionController.getAllUserTransactions(user_id);
            res.send(resResult(0, 'Successfully get all transactions', transactions));
        }else if(role === ADMIN && user_id === undefined){
            return res.status(422).send(resResult(1, `Failed to get all transaction, user_id is ${user_id}`));
        }
        else{
            //user
            const transactions = await transactionController.getAllUserTransactions(req.user._id);
            res.send(resResult(0, 'Successfully get all transactions', transactions));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all transactions ` + err.message));
    }
});

/**
 * Method: POST
 */



module.exports = router;