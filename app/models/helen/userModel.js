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
    rewards: { type: Number, default: 0 },
    contactNumber: { type: String },
    lessonReward: [{
        roomId: { type: String, ref: 'room' },
        activity: { type: String },
        rewards: { type: Number },
        teacherId: { type: Schema.Types.ObjectId, ref: 'user' }
    }]
});

userSchema.set('timestamps', true);

module.exports = MONGOOSE.model('user', userSchema);



