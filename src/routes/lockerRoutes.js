const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const lockerController = require("../controller/lockerController");
const Locker = mongoose.model('Locker');
const router = express.Router();
router.use(requireAuth); // require user to sign in first



module.exports = router;