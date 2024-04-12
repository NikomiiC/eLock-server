const mongoose = require("mongoose");
const {sendError} = require('../util/constants');

function isStringValNullOrEmpty(val) {
    return (val === null || val === undefined || val.length === 0);
}

function convertUTC(date){
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
        date.getUTCDate(), date.getUTCHours(),
        date.getUTCMinutes(), date.getUTCSeconds());
}

module.exports = {
    isStringValNullOrEmpty,
    convertUTC
}