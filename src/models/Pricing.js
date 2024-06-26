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
    name:{
        type: String, // 'Small', 'Medium','Large'
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true
    },
    first_hour:{
        type: Number,
        required: true
    },
    follow_up:{
        type: Number,
        required: true
    }
})

mongoose.model('Pricing', pricingSchema)