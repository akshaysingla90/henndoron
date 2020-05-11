"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema({
    name: { type: { first: String, last: String } },
    email: { type: String },
    password: { type: String }
});

userSchema.set('timestamps', true);

module.exports = MONGOOSE.model('user', userSchema);



