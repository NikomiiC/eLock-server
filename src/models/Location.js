const mongoose = require('mongoose');
const {sendError} = require('../util/constants');

const locationSchema = new mongoose.Schema({
    /**
     * area (EW,NS), I dont put enum, more flexible for future
     * formatted_address
     * postcode
     * loc <field>: [<longitude>, <latitude> ]
     * locker_list[locker_id]
     */
    area: {
        type: String,
        require: true
    },
    formatted_address: {
        type: String,
        require: true
    },
    postcode: {
        type: String,
        require: true
    },
    loc: {
        type: {
            type: String,
            enum: ['Point'],
            default: "Point",
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    locker_list : [{
        locker_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Locker'
        }
    }]
})

locationSchema.index({location: '2dsphere'});
mongoose.model('Location', locationSchema)