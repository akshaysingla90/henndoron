"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { ACTIVITY_TYPE, ERROR_TYPES } = require('../../utils/constants')
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
    configData: { type: Object, default: {} },
    templateId: { type: String, ref: 'activity' },
    // resFolders: [Resources],
    type: { type: Number, enum: [ACTIVITY_TYPE.CLONED, ACTIVITY_TYPE.TEMPLATE] }

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
