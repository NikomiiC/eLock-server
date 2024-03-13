const mongoose = require('mongoose');
const {sendError} = require('../util/constants');

const lockerSchema = new mongoose.Schema({
    /**
     * status: occupied, valid
     * size: small, medium, large
     * location_id
     * trn_id
     */
    status:{
        type: String,
        enum: ['Occupied', 'Valid'],
        default: 'Valid'
    },
    size:{
        type: String,
        enum: ['Small', 'Medium','Large'],
        required: true
    },
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    trn_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }
})

mongoose.model('Locker', lockerSchema)