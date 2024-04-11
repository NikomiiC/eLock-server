const mongoose = require('mongoose');
const {sendError} = require('../util/constants');

const lockerSchema = new mongoose.Schema({
    /**
     * status: occupied, valid
     * size: small, medium, large
     * location_id
     * trn_id
     */
    status: {
        type: String,
        enum: ['Occupied', 'Valid'],
        default: 'Valid'
    },
    size: {
        type: String,
        enum: ['Small', 'Medium', 'Large'],
        required: true
    },
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    pricing_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pricing'
    },
    trn_list: [
        {
            trn_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Transaction'
            },
            status: String,
            latest_update_datetime: {
                type: Date
            },
            start_datetime: {
                type: Date,
                required: true
            },
            end_datetime: {
                type: Date,
                required: true
            }
        }
    ],
    passcode: {
        type: String,
        default: '000000'
    }
})

mongoose.model('Locker', lockerSchema)