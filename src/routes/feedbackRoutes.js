const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const feedbackController = require("../controller/feedbackController");
const userController = require("../controller/userController");
const Feedback = mongoose.model('Feedback');
const router = express.Router();
router.use(requireAuth); // require user to sign in first


//const isAdmin = await userController(req);

/**
 * Method: GET
 * @type {Router}
 */
// note: for admin, no need role check, don't configure it for normal user
router.get('/all_feedbacks_all_user', async (req, res) => {
    const order = req.query.order,
        statusFilter = req.query.statusFilter; //filter by status
    const validateResult = requestCheck(order, statusFilter);
    let feedbacks;
    try {
        switch (validateResult) {
            case 1:
                feedbacks = await feedbackController.getFeedbacksSortByAscDates();
                res.send(resResult(0, 'Successfully get all feedbacks', feedbacks));
                break;
            case -1:
                feedbacks = await feedbackController.getFeedbacksSortByDescDates();
                res.send(resResult(0, 'Successfully get all feedbacks', feedbacks));
                break;
            case 2:
                feedbacks = await feedbackController.getFeedbacksSortByStatusAndDescDates(undefined, statusFilter);
                res.send(resResult(0, 'Successfully get all feedbacks', feedbacks));
                break;
            default:
                return res.status(422).send(resResult(1, 'Wrong type of request data'));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.get('/all_feedbacks', async (req, res) => {
    const order = req.query.order,
        statusFilter = req.query.statusFilter; //filter by status;
    let feedbacks;
    try {
        feedbacks = await feedbackController.getFeedbacksSortByStatusAndDescDates(req.user._id, statusFilter);
        res.send(resResult(0, 'Successfully get all feedbacks', feedbacks));

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});
function requestCheck(order, statusFilter) {
    if (statusFilter === null || statusFilter === undefined || statusFilter.length === 0) {
        if (order === '1') {
            //ascending, 1
            return 1;
        } else if (order === '-1') {
            //descending, -1
            return -1;
        } else {
            //wrong data
            console.log('order can only be 1 or -1');
            return -1;
        }
    } else {
        //without sort, default desc
        return 2;
    }
}

module.exports = router;