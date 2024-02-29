const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const {resResult, sendError} = require('../util/constants');
const userController = require("../controller/userController");
const User = mongoose.model('User');
const router = express.Router();
router.use(requireAuth); // require user to sign in first
