const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const transactionController = require("../controller/transactionController");
const pricingController = require("../controller/pricingController");
const userController = require("../controller/userController");
const serviceUtil = require("../controller/serviceController");
const lockerController = require("../controller/lockerController");
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
const MODIFY = 'MODIFY';
const CANCEL = 'CANCEL';

/**
 * Method: GET
 */

router.get('/all_transactions', async (req, res) => {
    //admin only
    try {
        const status = req.query.status;
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            const transactions = await transactionController.getAllTransactions(status);
            return res.send(resResult(0, 'Successfully get all transactions', transactions));
        } else {
            return res.status(422).send(resResult(1, "User has no permission to get all transactions."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all transactions ` + err.message));
    }
});

router.get('/user_all_transaction', async (req, res) => {
    const user_id = req.query.user_id; // for admin to query for specific user's transaction, not a good practice as expose user_id in url
    const status = req.query.status;

    try {
        const role = await userController.getRole(req);
        if (role === ADMIN && !serviceUtil.isStringValNullOrEmpty(user_id)) {
            const transactions = await transactionController.getAllUserTransactions(user_id, status);
            return res.send(resResult(0, 'Successfully get all transactions', transactions));
        } else if (role === ADMIN && serviceUtil.isStringValNullOrEmpty(user_id)) {
            const transactions = await transactionController.getAllTransactions(status);
            return res.send(resResult(0, 'Successfully get all transactions', transactions));
        } else {
            //user
            const transactions = await transactionController.getAllUserTransactions(req.user._id, status);
            return res.send(resResult(0, 'Successfully get all transactions', transactions));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, `Fail to get all transactions ` + err.message));
    }
});

/**
 * Method: POST
 */

router.post('/create_transaction', async (req, res) => {

    const params = req.body;
    try {
        // 2 book per day + set locker passcode
        const validToBook = await transactionController.isLessThanTwoBookToday(params.user_id);
        const validBalance = await userController.isBalanceEnough(params, params.user_id);
        if (validToBook) {
            if(validBalance){
                const transaction = await transactionController.createTransaction(params);
                // set locker passcode, i dont do encrypt to keep it simple
                // await lockerController.setPasscode(params.passcode, params.locker_id);
                await lockerController.addTransactionToLocker(params.locker_id, transaction);
                return res.send(resResult(0, `Successfully create transaction`, transaction));
            }
            else{
                return res.status(422).send(resResult(1, "User has not enough balance, please top-up first"));
            }

        } else {
            return res.status(422).send(resResult(1, "User has hit maximum 2 booking today."));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.post('/update_transaction/:id', async (req, res) => {
    const trn_id = req.params.id;
    const params = req.body;
    const action = params.action;
    const doc = params.doc;
    //action: modify, cancel
    try {
        const role = await userController.getRole(req);
        const transaction = await transactionController.updateTransaction(action, doc, trn_id, req.user._id, role);
        res.send(resResult(0, `Successfully ${action} transaction`, transaction));

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});
module.exports = router;