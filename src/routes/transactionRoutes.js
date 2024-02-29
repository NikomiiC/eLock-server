const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const transactionController = require("../controller/transactionController");
const Transaction = mongoose.model('Transaction');
const router = express.Router();
router.use(requireAuth); // require user to sign in first



module.exports = router;