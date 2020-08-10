"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { ACTIVITY_TYPE } = require('../../utils/constants')
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

module.exports = MONGOOSE.model('activity', activitySchema);
