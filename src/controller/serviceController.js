const mongoose = require("mongoose");
const {sendError} = require('../util/constants');

function isStringValNullOrEmpty(val) {
    return (val === null || val === undefined || val.length === 0);
}

module.exports = {
    isStringValNullOrEmpty
}