const mongoose = require("mongoose");
const Pricing = mongoose.model('Pricing');
const {sendError} = require('../util/constants');
const serviceUtil = require("../controller/serviceController");

async function getAllPricing() {
    try {
        return await Pricing.find();
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getPricingById(id) {
    try {
        return await Pricing.findById(id);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function insertPricing(doc) {
    try {
        //todo: test first, if cannot use new Pricing() and .save
        return await Pricing.create(doc);
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function updatePricing(pricing_id, doc) {
    let new_pricing;
    try {
        new_pricing = await Pricing.findOneAndUpdate({_id: pricing_id},
            doc,
            {
                returnOriginal: false
            });
        return new_pricing;
    } catch (err) {
        sendError(err.message);
    }
}

module.exports = {
    getAllPricing,
    getPricingById,
    insertPricing,
    updatePricing
}
