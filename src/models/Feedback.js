const mongoose = require('mongoose');
const {sendError} = require('../util/constants');

const feedbackSchema = new mongoose.Schema({
    /**
     * user_com_datetime
     * feedback_header
     * feedback_body
     * reply_body
     * reply_datetime
     * user_id
     */
    user_com_datetime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    feedback_header:{
        type: String,
        required:true
    },
    feedback_body:{
        type: String,
        required:true
    },
    reply_body:{
        type: String
    },
    reply_datetime: {
        type: Date
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

mongoose.model('Feedback', feedbackSchema)