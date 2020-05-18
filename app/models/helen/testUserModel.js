"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const testUsersSchema = new Schema({
    name: { type: String }
});

testUsersSchema.set('timestamps', true);

module.exports = MONGOOSE.model('testUser', testUsersSchema);



