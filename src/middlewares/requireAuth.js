const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const {resResult} = require('../util/constants');

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 * authorization === 'Bearer sldkfjwlekjflwejf --> some token'
 */
module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    if (!authorization) {
        return res.status(401).send(resResult(0, 'You must be logged in.'));
    }
    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, 'MY_SECRET_KEY', async (err, payload) => {
        if (err) {
            return res.status(401).send(resResult(0, 'You must be logged in.'));
        }
        const {userId} = payload;
        const user = await User.findById(userId);
        req.user = user;
        next();
    });
};