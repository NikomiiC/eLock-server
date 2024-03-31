const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const feedbackController = require("../controller/feedbackController");
const userController = require("../controller/userController");
const transactionController = require("../controller/transactionController");
const Feedback = mongoose.model('Feedback');
const router = express.Router();
router.use(requireAuth); // require user to sign in first

/**
 * CONSTANTS
 */

const USER = 'u';
const ADMIN = 'admin';
const OPEN = 'Open';
const CLOSED = 'Closed';

/**
 * Method: GET
 * @type {Router}
 */
// note: for admin, no need role check, don't configure it in front end for normal user
router.get('/all_feedbacks_all_user', async (req, res) => {
    const order = req.query.order,
        statusFilter = req.query.statusFilter; //filter by status
    const validateResult = requestCheck(order, statusFilter);
    let feedbacks;
    try {
        switch (validateResult) {
            case 1:
                feedbacks = await feedbackController.getFeedbacksSortByAscDates(undefined);
                res.send(resResult(0, 'Successfully get all feedbacks', feedbacks));
                break;
            case -1:
                feedbacks = await feedbackController.getFeedbacksSortByDescDates(undefined);
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
    //default show open cases and desc
    const order = req.query.order,
        statusFilter = req.query.statusFilter; //filter by status;
    let feedbacks;
    const validateResult = requestCheck(order, statusFilter);
    try {
        switch (validateResult) {
            case 1:
                feedbacks = await feedbackController.getFeedbacksSortByAscDates(req.user._id);
                res.send(resResult(0, 'Successfully get all feedbacks', feedbacks));
                break;
            case -1:
                feedbacks = await feedbackController.getFeedbacksSortByDescDates(req.user._id);
                res.send(resResult(0, 'Successfully get all feedbacks', feedbacks));
                break;
            case 2:
                feedbacks = await feedbackController.getFeedbacksSortByStatusAndDescDates(req.user._id, statusFilter);
                res.send(resResult(0, 'Successfully get all feedbacks', feedbacks));
                break;
            default:
                return res.status(422).send(resResult(1, 'Wrong type of request data'));
        }

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.get('/feedback/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const feedback = await feedbackController.getFeedbackById(id);
        res.send(resResult(0, 'Successfully get feedback', feedback));

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

/**
 * Method: POST
 * @type {Router}
 */

router.post('/create_feedback', async (req, res) => {

    const params = req.body;
    const ticketList = params.ticketList;
    const feedback_header = params.feedback_header;
    const trn_id = params.transaction_id; // if not passing transaction_id means this feedback does not relate to any transaction
    const current_datetime = new Date();
    console.log(current_datetime)

    ticketList[0].user_ticket_datetime = current_datetime; // to sync 3 datetime for later check
    if (feedback_header === null || feedback_header === undefined || feedback_header.length === 0) {
        return res
            .status(422)
            .send(resResult(1, 'Header is required.'));
    }
    if (ticketList === null || ticketList === undefined || ticketList.length === 0 || ticketList[0].ticket_body === null || ticketList[0].ticket_body === undefined || ticketList[0].ticket_body.length === 0) {
        return res
            .status(422)
            .send(resResult(1, 'Feedback body is required.'));
    }

    try {
        const feedback = new Feedback(
            {
                feedback_header: params.feedback_header,
                user_id: req.user._id,
                transaction_id: trn_id,
                ticketList: params.ticketList,
                latest_update_datetime : current_datetime,
                create_datetime : current_datetime
            });

        // add commentsList
        await feedback.save();
        try{
            //todo: add feedback id to transaction, test
            if(trn_id !== undefined){
                await transactionController.updateFeedbackId(trn_id, feedback._id);
            }
            await userController.updateFeedbackList(req.user._id, feedback._id);

            return res.send(resResult(0, `Successfully create a new feedback `, feedback));
        }catch (err){
            return res.status(422).send(resResult(1, err.message));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.post('/update_feedback/add_ticket/:id', async (req, res) => {

    const feedback_id = req.params.id;
    const params = req.body;
    const current_datetime = new Date();

    /**
     * 1. admin or user, only for user
     * 2. if status is open
     * !! let feedback controller return feedback
     * user:
     *      <1> update latest_update_datetime
     */
    try {
        const role = await userController.getRole(req);
        if (role === USER) {
            // add a new ticket to ticketList
            let old_feedback = await feedbackController.getFeedbackById(feedback_id);
            if(old_feedback.status === OPEN){
                let new_ticket = {
                    user_ticket_datetime : current_datetime,
                    ticket_body : params.ticketList[0].ticket_body,
                    reply_body : null,
                    reply_datetime : null
                }
                //update value
                old_feedback.ticketList.push(new_ticket);
                old_feedback.latest_update_datetime = current_datetime;
                const new_feedback = await Feedback.findOneAndUpdate(
                    {_id: feedback_id},
                    old_feedback,
                    {
                        returnOriginal: false
                    });
                res.send(resResult(0, `Successfully add ticket`, new_feedback));
            }
            else{
                return res.status(422).send(resResult(1, "This ticket is closed."));
            }
        } else {
            return res.status(422).send(resResult(1, "Only allow user role to trigger this function."));
        }
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.post('/edit_feedback/update_status/:id', async (req, res) => {

    /**
     * 1. if status is open
     * !! let feedback controller return feedback
     * user:
     *      <1> update status -> open to closed, closed to open
     *      <2> update latest_update_datetime
     */

    const id = req.params.id;
    const params = req.body;

    try {
        const new_feedback = await feedbackController.updateStatus(id, params.status);

        res.send(resResult(0, `Successfully update status `, new_feedback));
    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }

});

router.post('/update_feedback/edit_ticket/:id', async (req, res) => {

    const feedback_id = req.params.id;
    const {reply_body} = req.body;
    const current_datetime = new Date();
    /**
     * 1. admin or user, only for admin
     * 2. if status is open
     * !! let feedback controller return feedback, sort by ticketList.
     * admin:
     *      <1> ticketList.reply_body && ticketList.reply_datetime
     *      <2> update latest_update_datetime
     */
    try {
        const role = await userController.getRole(req);
        if (role === ADMIN) {
            const new_feedback = await Feedback.findOneAndUpdate(
                {_id: feedback_id, ticketList: {$elemMatch: {reply_body: undefined}}},
                {
                    latest_update_datetime : current_datetime,
                    "$set": {
                        "ticketList.$.reply_body": reply_body,
                        "ticketList.$.reply_datetime": current_datetime,
                    }
                },
                {
                    returnOriginal: false
                });
            res.send(resResult(0, `Successfully edit ticket`, new_feedback));
        } else {
            return res.status(422).send(resResult(1, "Only allow admin role to trigger this function."));
        }
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
        //with sort, default desc
        return 2;
    }
}

module.exports = router;