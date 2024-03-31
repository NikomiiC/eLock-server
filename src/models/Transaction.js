const mongoose = require('mongoose');
const {sendError} = require('../util/constants');
const {mongo} = require("mongoose");

const transactionSchema = new mongoose.Schema({
    /**
     * user_id
     * locker_id
     * status: booked, ongoing, completed
     * feedback_list:[]
     * cost
     */
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    locker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locker',
        required: true
    },
    pricing_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pricing',
        required: true
    },
    status: {
        type: String,
        enum: ['Booked', 'Ongoing', 'Completed'],
        default: 'Booked'
    },
    feedback_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback'
    }],
    cost: {
        type: Number,
        default: 0
    },
    create_datetime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    latest_update_datetime: {
        type: Date
    },
    start_datetime: {
        type: Date
    },
    end_datetime: {
        type: Date
    }
})

mongoose.model('Transaction', transactionSchema)