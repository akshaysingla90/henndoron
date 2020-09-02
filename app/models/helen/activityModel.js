"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { ACTIVITY_TYPE, ERROR_TYPES, ACTIVITY_STATUS } = require('../../utils/constants')
const HELPERS = require("../../helpers");

/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const Resources = new Schema();
Resources.add({
    folderName: { type: String },
    subFolders: [{ type: Resources, required: false }]
});

const activitySchema = new Schema({
    name: { type: String, index: true, unique: true },
    path: { type: String },
    description: { type: String },
    iconUrl: { type: String },
    // configData: { type: Object, default: {} },
    templateId: { type: String, ref: 'activity' },
    lessonId: { type: String, ref: 'lesson' },
    courseId: { type: String, ref: 'course' },
    lessonNumber: { type: String },
    episodeNumber: { type: String },
    // resFolders: [Resources],
    type: { type: Number, enum: [ACTIVITY_TYPE.GAME, ACTIVITY_TYPE.MEDIUM, ACTIVITY_TYPE.SMALL] },
    status: { type: Number, enum: [ACTIVITY_STATUS.PUBLISHED, ACTIVITY_STATUS.TEMPLATE, ACTIVITY_STATUS.DRAFT] }
});

activitySchema.set('timestamps', true);

// pre-hook to handle unique key errors
activitySchema.post('save', async (error, doc, next) => {
    if (error.name === 'MongoError' && error.code === 11000)
        throw HELPERS.responseHelper.createErrorResponse(`${Object.keys(error.keyPattern)[0]} must be unique`, ERROR_TYPES.BAD_REQUEST);
    else
        next(error);
    next();
});

module.exports = MONGOOSE.model('activity', activitySchema);
