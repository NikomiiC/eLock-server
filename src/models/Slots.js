const mongoose = require('mongoose');
const {sendError} = require('../util/constants');

const slotsSchema = new mongoose.Schema({
    /**
     * Date
     * Slots
     */
    RecordDate:{
        type: Date
    },
    slots:[{
        type: Number,
        validate: [arrayLimit, '{PATH} must be 24']
    }]
})

function arrayLimit(val){
    return val.length === 24;
}
mongoose.model('Slots', slotsSchema)