const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {sendError} = require('../util/constants');
// const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching"); note: decide later

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        default: "u"
    },
    gender: {
        type: String,
        default: null
    },
    dob: {
        type: Date,
        default: null
    },
    feedback_list: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feedback', unique: true
    }],
    trn_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction', unique: true
    }],
});

userSchema.pre('save', function (next) {
    // 'this' means user itself
    // if we using the () => to declare a function, then 'this' is pointing to the Class itslef (the context of the file)
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});


userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    // 'this' === user
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
            if (err) {
                return reject(err);
            }
            if (!isMatch) {
                return reject(false);
            }
            resolve(true);
        });
    });
}

//note: add fuzzy search for username blah blah for admin use maybe
// https://www.npmjs.com/package/mongoose-fuzzy-searching
mongoose.model('User', userSchema);