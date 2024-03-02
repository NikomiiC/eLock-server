const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const feedbackController = require("../controller/feedbackController");
const userController = require("../controller/userController");
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

router.get('/feedback/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const feedback = await Feedback.findOne({_id: id});
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
    try {
        const feedback = new Feedback(
            {
                feedback_header: params.feedback_header,
                body: params.body,
                user_id: req.user._id,
                ticketList: params.ticketList
            });
        if (feedback_header === null || feedback_header === undefined || feedback_header.length === 0) {
            return res
                .status(422)
                .send(resResult(1, 'Header is required.'));
        }
        if (ticketList === null || ticketList === undefined || ticketList.length === 0 || ticketList.ticket_body === null || ticketList.ticket_body === undefined || ticketList.ticket_body.length === 0) {
            return res
                .status(422)
                .send(resResult(1, 'Feedback body is required.'));
        }
        // add commentsList
        await feedback.save();
        await userController.updateFeedbackList(req.user._id, feedback._id);
        return res.send(resResult(0, `Successfully create a new feedback `, feedback));

    } catch (err) {
        return res.status(422).send(resResult(1, err.message));
    }
});

router.post('/update_feedback/add_ticket/:id', async (req, res) => {

    const feedback_id = req.params.id;
    const {body} = req.body;
    const current_datetime = new Date.now();

    /**
     * 1. admin or user
     * 2. if status is open
     * !! let feedback controller return feedback, sort by ticketList.
     * user:
     *      <1> update status
     *      <2> update latest_update_datetime
     */
    try {
        const role = await userController.getRole();
        if (role === USER) {
            let old_feedback = await feedbackController.getFeedbackById(feedback_id);
            if(old_feedback.status === OPEN){
                let new_ticket = {
                    user_ticket_datetime : current_datetime,
                    ticket_body : body,
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
                res.send(resResult(0, `Successfully add comment`, new_feedback));
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


router.post('/update_feedback/edit_ticket/:id', async (req, res) => {

    const feedback_id = req.params.id;
    const {body} = req.body;
    const current_datetime = new Date.now();
    /**
     * 1. admin or user
     * 2. if status is open
     * !! let feedback controller return feedback, sort by ticketList.
     * admin:
     *      <1> ticketList.reply_body && ticketList.reply_datetime
     *      <2> update latest_update_datetime
     */
    try {
        const role = await userController.getRole();
        if (role === ADMIN) {
            const new_feedback = await Feedback.findOneAndUpdate(
                {_id: feedback_id, 'ticketList.reply_datetime': {$e: ''}},
                {
                    latest_update_datetime : current_datetime,
                    "$push":
                        {
                            "ticketList":
                                {
                                    "ticket_body": body,
                                    "user_ticket_datetime": current_datetime
                                }
                        }
                },
                {
                    returnOriginal: false
                });
            res.send(resResult(0, `Successfully add comment`, new_feedback));
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
        //without sort, default desc
        return 2;
    }
}

module.exports = router;