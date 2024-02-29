const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const pricingController = require("../controller/pricingController");
const Pricing = mongoose.model('Pricing');
const router = express.Router();
router.use(requireAuth); // require user to sign in first



module.exports = router;