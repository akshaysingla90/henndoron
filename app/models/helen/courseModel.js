"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { ERROR_TYPES } = require('../../utils/constants')
const HELPERS = require("../../helpers");

/**************************************************
 ************* Course Model or collection ***********
 **************************************************/


const courseSchema = new Schema({
  name: { type: String, index: true, unique: true },
  iconUrl: { type: String }
});

courseSchema.set('timestamps', true);

// pre-hook to handle unique key errors
courseSchema.post('save', async (error, doc, next) => {
  if (error.name === 'MongoError' && error.code === 11000)
    throw HELPERS.responseHelper.createErrorResponse(`${Object.keys(error.keyPattern)[0]} must be unique`, ERROR_TYPES.BAD_REQUEST);
  else
    next(error);
  next();
});

module.exports = MONGOOSE.model('course', courseSchema);
