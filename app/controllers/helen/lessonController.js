"use strict";
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION } = require('../../utils/constants');
const SERVICES = require('../../services');
const Mongoose = require('mongoose');

/**************************************************
 ***** Lesson controller for Authorising Tool ***
 **************************************************/
let lessonController = {};

lessonController.createLesson = async (payload) => {
  //todo lesson folder 
  let lesson = await SERVICES.lessonService.createLesson(payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSONS_FETCHED_SUCCESSFULLY), { lesson });

}

/**
 * function to get all the lessons
 * @param {*} payload 
 */
lessonController.getLessons = async (payload) => {
  let matchCriteria = { $match: {} };
  if (payload.status) matchCriteria.$match.status = payload.status;
  if (payload.coursId) matchCriteria.$match.coursId = Mongoose.Types.ObjectId(payload.coursId);
  if (payload.search) matchCriteria.$match.name = new RegExp(payload.search, 'i');

  payload.skip = (payload.counter - 1) * payload.limit;
  let query = [
    matchCriteria,
    {
      $lookup: {
        from: 'activities',
        localField: 'activityIds',
        foreignField: '_id',
        as: 'activities'
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: "$course"
    },
    {
      $project: {
        "activityIcons": "$activities.iconUrl",
        "name": 1,
        "path": 1,
        "decription": 1,
        "lessonNumber": 1,
        'status': 1,
        "courseIcon": "$course.iconUrl",
        "createdAt": 1,
        "updatedAt": 1,
        "numberOfActivities": { $cond: { if: { $isArray: "$activities" }, then: { $size: "$activities" }, else: "NA" } }
      }
    }
  ]
  let lessons = await SERVICES.lessonService.getLessonsAggregate(query);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSONS_FETCHED_SUCCESSFULLY), { lessons });
}
/**
 * function to get lesson by its id
 * @param {*} payload 
 */
lessonController.getLessonById = async (payload) => {
  // let lesson = await SERVICES.lessonService.getLesson({ _id: payload.id }, NORMAL_PROJECTION);
  let criteria = {
    $match: {
      _id: Mongoose.Types.ObjectId(payload.id)
    }
  };
  let query = [
    ...(criteria ? [criteria] : []),
    {
      $lookup: {
        from: 'activities',
        localField: 'activityIds',
        foreignField: '_id',
        as: 'activities'
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: "$course"
    },
    {
      $project: {
        "activityIcons": "$activities.iconUrl",
        "name": 1,
        "path": 1,
        "decription": 1,
        "lessonNumber": 1,
        'status': 1,
        "courseIcon": "$course.iconUrl",
        "createdAt": 1,
        "updatedAt": 1,
        "numberOfActivities": { $cond: { if: { $isArray: "$activities" }, then: { $size: "$activities" }, else: "NA" } }
      }
    }
  ]
  let lesson = await SERVICES.lessonService.getLessonsAggregate(query);
  if (!lesson) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LESSONS_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSON_FETCHED_SUCCESSFULLY), { lesson });
}

/**
 * function to delete the lesson by its id
 * @param {*} payload 
 */
lessonController.deleteLesson = async (payload) => {
  let lesson = await SERVICES.lessonService.deleteLesson({ _id: payload.id });
  if (!lesson) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LESSONS_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSON_DELETED_SUCCESSFULLY));
}

/* export lessonController */
module.exports = lessonController;