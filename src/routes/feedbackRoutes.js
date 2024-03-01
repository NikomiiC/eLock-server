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
        if(feedback_header === null || feedback_header === undefined || feedback_header.length === 0){
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

    const postId = req.params.id;
    const {body} = req.body;

    try {
        const updatedDoc = await Post.findOneAndUpdate(
            {_id: postId},
            {
                "$push":
                    {
                        "commentsList":
                            {
                                "body": body,
                                "userId": req.user._id
                            }
                    }
            },
            {
                returnOriginal: false
            });
        res.send(resResult(1, `Successfully add comment`, updatedDoc));
    } catch (err) {
        return res.status(422).send(resResult(0, err.message));
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