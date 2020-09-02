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
  decription: { type: String },
  lessonNumber: { type: Number },
  episodeNumber: { type: Schema.Types.ObjectId },
  activityIds: [{ type: Schema.Types.ObjectId }],
  courseId: { type: Schema.Types.ObjectId },
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

