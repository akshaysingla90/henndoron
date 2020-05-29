"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema({
    userName: { type: String },
    email: { type: String },
    password: { type: String },
    isDeleted: { type: Boolean, default: false },
    firstName: { type: String },
    lastName: { type: String },
    contactNumber: { type: String }
});

userSchema.set('timestamps', true);

module.exports = MONGOOSE.model('user', userSchema);



