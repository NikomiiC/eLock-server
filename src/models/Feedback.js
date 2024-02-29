const mongoose = require('mongoose');
const {sendError} = require('../util/constants');

const ticketSchema = new mongoose.Schema({
    user_com_datetime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    ticket_body:{
        type: String,
        required:true
    },
    reply_body:{
        type: String
    },
    reply_datetime: {
        type: Date
    },
});
const feedbackSchema = new mongoose.Schema({
    /**
     * user_com_datetime
     * feedback_header
     * feedback_body
     * reply_body
     * reply_datetime
     * user_id
     * status [open, closed]
     */

    feedback_header:{
        type: String,
        required:true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    },
    commentsList: [ticketSchema]
})

mongoose.model('Feedback', feedbackSchema)