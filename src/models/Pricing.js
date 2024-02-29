const mongoose = require('mongoose');
const {sendError} = require('../util/constants');

const pricingSchema = new mongoose.Schema({
    /**
     * first_hour_s
     * first_hour_m
     * first_hour_l
     * follow_up_s
     * follow_up_m
     * follow_up_l
     */
    first_hour_s: {
        type: Number,
        required: true
    },
    first_hour_m: {
        type: Number,
        required: true
    },
    first_hour_l: {
        type: Number,
        required: true
    },
    follow_up_s: {
        type: Number,
        required: true
    },
    follow_up_m: {
        type: Number,
        required: true
    },
    follow_up_l: {
        type: Number,
        required: true
    }
})

mongoose.model('Pricing', pricingSchema)