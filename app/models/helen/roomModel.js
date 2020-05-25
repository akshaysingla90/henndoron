"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
/**************************************************
 ************* Room Model or collection ***********
 **************************************************/
const roomSchema = new Schema({
    _id: { type: String },
    users: [{ userId: { type: Schema.Types.ObjectId }, isOnline: { type: Boolean, default: true } }],
    createdBy: { type: Schema.Types.ObjectId, required: true },
    capacity: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    roomData: { type: Object, default: {} },
    lessonStatus: { type: Number, enum: [1, 2], default: 1 },      //1 for ongoing 2 for complete
    currentTurnUserId: { type: String }
});

roomSchema.set('timestamps', true);

module.exports = MONGOOSE.model('room', roomSchema);



