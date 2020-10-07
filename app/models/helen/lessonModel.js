"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { LESSON_STATUS, ERROR_TYPES } = require('../../utils/constants')
const HELPERS = require("../../helpers");

/**************************************************
 ************* Lesson Model or collection ***********
 **************************************************/


const lessonSchema = new Schema({
  name: { type: String, index: true, unique: true },
  path: { type: String },
  description: { type: String },
  lessonNumber: { type: Number },
  episodeNumber: { type: Number },
  activities: [{
    activityId: { type: Schema.Types.ObjectId, ref: 'activities' },
    activityName: { type: String },
    allocatedTime: { type: Number },
    webUrl: { type: String },
  }],
  courseId: { type: Schema.Types.ObjectId, ref: 'courses' },
  status: { type: Number, enum: [LESSON_STATUS.DRAFT, LESSON_STATUS.PUBLISHED] }
});

lessonSchema.set('timestamps', true);

// pre-hook to handle unique key errors
lessonSchema.post('save', async (error, doc, next) => {
  if (error.name === 'MongoError' && error.code === 11000)
    throw HELPERS.responseHelper.createErrorResponse(`${Object.keys(error.keyPattern)[0]} must be unique`, ERROR_TYPES.BAD_REQUEST);
  else
    next(error);
  next();
});

module.exports = MONGOOSE.model('lesson', lessonSchema);

