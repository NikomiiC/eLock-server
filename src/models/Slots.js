const mongoose = require('mongoose');
const {sendError} = require('../util/constants');

const slotsSchema = new mongoose.Schema({
    /**
     * Date
     * Slots
     */
    recordDate:{
        type: Date
    },
    slots:[{
        type: Number,
        validate: [arrayLimit, '{PATH} must be 24'],
        default:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    }],
    locker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locker'
    },
})

function arrayLimit(val){
    return val.length === 24;
}
mongoose.model('Slots', slotsSchema)