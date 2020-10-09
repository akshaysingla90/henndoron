"use strict";
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LESSON_STATUS, ACTIVITY_STATUS } = require('../../utils/constants');
const { LESSON_DIRECTORY_PATH, BASE_PATH, ACTIVITY_SRC_PATH, ACTIVITY_PREVIEW_PATH, TEMPLATE_ACTIVITY_PREVIEW, TEMPLATE_ACTIVITY_PATH, ACTIVITY_DIRECTORY_PATH, ACTIVITY_RESOURCE_DIRECTORY_PATH, ACTIVITY_CONFIG_PATH } = require('../../../config').COCOS_PROJECT_PATH;
const dbUtils = require('../../utils/dbUtils')
const { generateCharacterString } = require('../../utils/utils');

const SERVICES = require('../../services');
const Mongoose = require('mongoose');
const path = require('path');
const fs = require('fs-extra');
const replace = require('replace-in-file');

/**************************************************
 ***** Lesson controller for Authorising Tool ***
 **************************************************/
let lessonController = {};

/**
 * function to make lesson by copying all the activities folder to the lesson folder
 * @param {*} lessonId 
 */
async function makeLesson(lessonId) {
  let lesson = (await SERVICES.lessonService.getLessonsAggregate([
    { $match: { _id: lessonId } },
    {
      $unwind: { path: "$activities", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'activities.activityId',
        foreignField: '_id',
        as: 'activityInfo'
      }
    },
    {
      $unwind: { path: "$activityInfo", preserveNullAndEmptyArrays: true }
    },
    {
      $group: {
        _id: '$_id',
        activities: {
          $push: "$activities"
        },
        activityInfo: {
          $push: "$activityInfo"
        },
        lesson: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: { $mergeObjects: ["$lesson", "$$ROOT"] } } },
    {
      $project: {
        "lesson": 0
      }
    }
  ]))[0];

  const destinationLessonPath = path.join(__dirname, `../../../..${BASE_PATH}${LESSON_DIRECTORY_PATH}/${lesson.path}`);
  const lessonTemplatePath = path.join(__dirname, `../../..${TEMPLATE_ACTIVITY_PREVIEW}`)
  // Copying Directory
  await fs.copy(lessonTemplatePath, destinationLessonPath);

  //Read lesson-config.json
  let lessonConfigData = await (new Promise((resolve, reject) => {
    fs.readFile(`${lessonTemplatePath}/res/lesson-config.json`, 'utf-8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  }))
  lessonConfigData = JSON.parse(lessonConfigData);
  //Read Project.json
  let projectData = await (new Promise((resolve, reject) => {
    fs.readFile(`${lessonTemplatePath}/project.json`, 'utf-8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  }))
  projectData = JSON.parse(projectData);

  for (let index = 0; index < lesson.activityInfo.length; index++) {
    let activity = lesson.activityInfo[index];
    //activity path to copy the activity folder
    const activityPath = [ACTIVITY_STATUS.WEB_URL, ACTIVITY_STATUS.TEMPLATE].includes(activity.status)
      ? path.join(__dirname, `../../..${TEMPLATE_ACTIVITY_PATH}`, activity.path)
      : path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}`, activity.path)
    //Regex to prevent resourcesfrom copying
    let re = new RegExp(activityPath + ACTIVITY_RESOURCE_DIRECTORY_PATH);
    const filterFunc = (filePath) => {
      if ((filePath.search(re) !== -1) || filePath == activityPath + ACTIVITY_RESOURCE_DIRECTORY_PATH) return false;
      return true;
    }
    if (activity.status == ACTIVITY_STATUS.WEB_URL) {
      var webUrlNameSpace = `${generateCharacterString(15)}${Date.now()}`
      activity.path = `/${webUrlNameSpace}`;
    }
    //Updtae project.json
    projectData.jsList.push(`res/Activity${activity.path}/src/index.js`);
    //Copying each activity to lesson
    await fs.copy(activityPath, `${destinationLessonPath}/res/Activity${activity.path}`, { filter: filterFunc });
    //Copy resources of each activity
    if (activity.status != ACTIVITY_STATUS.WEB_URL) {
      await fs.copy(`${activityPath}/res`, `${destinationLessonPath}/AsyncActivity/res/Activity${activity.path}/res`);
    }
    //Update configData for each activity
    let configData = await (new Promise((resolve, reject) => {
      fs.readFile(`${activityPath}/${ACTIVITY_CONFIG_PATH}`, 'utf-8', (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    }))
    configData = JSON.parse(configData);
    //Changes in case of weburl 
    if (activity.status == ACTIVITY_STATUS.WEB_URL) {
      // Change index.js 
      let pathToReplace = configData.properties.activityPath;
      let namespaceToReplace = configData.properties.namespace;
      let textToWrite = webUrlNameSpace;
      let fromReplace = pathToReplace == namespaceToReplace ? new RegExp(pathToReplace, 'g') : [new RegExp(pathToReplace, 'g'), new RegExp(namespaceToReplace, 'g')];
      const options = {
        files: `${destinationLessonPath}/res/Activity${activity.path}` + ACTIVITY_SRC_PATH,
        from: fromReplace,
        to: textToWrite
      };
      await replace(options);
      //Creating config.json for web url activity 
      configData.properties.activityPath = webUrlNameSpace;
      configData.properties.url = `res/Activity/${webUrlNameSpace}/`;
      configData.properties.namespace = `${webUrlNameSpace}`;
      if (lesson.activities[index].webUrl) configData.properties.urlInfo.url = lesson.activities[index].webUrl;
    }
    configData.properties.activityName = lesson.activities[index].activityName;
    configData.properties.allocatedTime = lesson.activities[index].allocatedTime;
    //update activity-config 
    await fs.writeFileSync(`${destinationLessonPath}/res/Activity${activity.path}` + ACTIVITY_CONFIG_PATH, JSON.stringify(configData));
    //Update lesson-config
    let lessonObj = { ...configData.properties, resources: configData.resources };
    lessonConfigData.activityGame.push(lessonObj);
  }
  fs.writeFileSync(`${destinationLessonPath}/project.json`, JSON.stringify(projectData));
  fs.writeFileSync(`${destinationLessonPath}/res/lesson-config.json`, JSON.stringify(lessonConfigData));
  return destinationLessonPath;
}

/**
 * function to create a new lesson
 * @param {*} payload 
 */
lessonController.createLesson = async (payload) => {
  const alreadyExist = await SERVICES.lessonService.getLesson({ courseId: payload.courseId, lessonNumber: payload.lessonNumber, episodeNumber: payload.episodeNumber });
  if (alreadyExist) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LESSON_ALREADY_EXISTS_WITH_THIS_LESSON_NUMBER, ERROR_TYPES.BAD_REQUEST);
  let lessonPath = `${generateCharacterString(15)}${Date.now()}`;
  payload.path = "/" + lessonPath;
  if (payload.status == LESSON_STATUS.PUBLISHED && (!payload.activities || !payload.activities.length)) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_REQUIRED_TO_PUBLISH_LESSON, ERROR_TYPES.BAD_REQUEST)
  //Create new lesson in database
  let lesson = await SERVICES.lessonService.createLesson(payload);
  lessonPath = await makeLesson(lesson._id);
  if (payload.status == LESSON_STATUS.PUBLISHED) {
    await SERVICES.activityService.minifyPublishLesoon(lessonPath, payload.path);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSON_PUBLISHED_SUCCESSFULLY));
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSON_CLONED_SUCCESSFULLY));
}

/**
 * function to duplicate the lesson by its id
 * @param {*} payload 
 */
lessonController.duplicateLesson = async (payload) => {
  const sourceLesson = await SERVICES.lessonService.getLesson({ _id: payload.id });
  if (!sourceLesson) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LESSON_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  const sourcePath = path.join(__dirname, `../../../..${BASE_PATH}${LESSON_DIRECTORY_PATH}`, sourceLesson.path);
  const lessonPath = `${sourceLesson.name.replace(/ /g, '')}${Date.now()}`;
  const destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${LESSON_DIRECTORY_PATH}/${lessonPath}`);
  let newLesson = { ...sourceLesson, name: `${sourceLesson.name} (COPY)`, path: `/${lessonPath}` };
  delete newLesson._id;
  newLesson.status = LESSON_STATUS.DRAFT;
  const alreadyExist = await SERVICES.lessonService.getLesson({ name: newLesson.name, coursId: newLesson.coursId, lessonNumber: newLesson.lessonNumber, episodeNumber: newLesson.episodeNumber });
  if (alreadyExist) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LESSON_ALREADY_EXISTS_WITH_THIS_NAME, ERROR_TYPES.BAD_REQUEST);
  let lesson = await SERVICES.lessonService.createLesson(newLesson);
  // Copying Directory
  await fs.copy(sourcePath, destinationPath);
  let query = [
    { $match: { _id: lesson._id } },
    {
      $lookup: {
        from: 'activities',
        localField: 'activities.activityId',
        foreignField: '_id',
        as: 'activityInfo'
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
        "activityIcons": "$activityInfo.iconUrl",
        "name": 1,
        "path": 1,
        "description": 1,
        "lessonNumber": 1,
        'status': 1,
        "courseIcon": "$course.iconUrl",
        "createdAt": 1,
        "updatedAt": 1,
        "episodeNumber": 1,
        "numberOfActivities": { $cond: { if: { $isArray: "$activities" }, then: { $size: "$activities" }, else: "NA" } }
      }
    }]
  lesson = (await SERVICES.lessonService.getLessonsAggregate(query))[0];
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSON_DUPLICATED_SUCCESSFULLY), { lesson });
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
      $unwind: { path: "$activities", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'activities.activityId',
        foreignField: '_id',
        as: 'activitiesInfo'
      }
    },
    {
      $unwind: { path: "$activitiesInfo", preserveNullAndEmptyArrays: true }
    },
    {
      $group: {
        _id: '$_id',
        activities: {
          $push: {
            $mergeObjects: [
              {
                activityName: '$activities.activityName',
                activityId: '$activities.activityId',
                allocatedTime: '$activities.allocatedTime'
              },
              {
                type: '$activitiesInfo.type',
                iconUrl: '$activitiesInfo.iconUrl'
              }
            ]
          }
        },
        lesson: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: { $mergeObjects: ["$lesson", "$$ROOT"] } } },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: { path: "$course", preserveNullAndEmptyArrays: true }

    },
    {
      $addFields: {
        "activities": {
          $cond: {
            if: { $eq: [[{}], "$activities"] },
            then: [],
            else: "$activities"
          }
        }
      }
    },
    {
      $project: {
        "activityIcons": "$activities.iconUrl",
        "name": 1,
        "path": 1,
        "description": 1,
        "lessonNumber": 1,
        'status': 1,
        "courseIcon": "$course.iconUrl",
        "createdAt": 1,
        "updatedAt": 1,
        "episodeNumber": 1,
        "numberOfActivities": { $cond: { if: { $isArray: "$activities" }, then: { $size: "$activities" }, else: "NA" } }
      }
    },
    ...dbUtils.paginateWithTotalCount({ createdAt: -1 }, payload.skip, payload.limit)
  ]
  let { items: lessons, totalCount } = (await SERVICES.lessonService.getLessonsAggregate(query))[0] || { items: [], totalCount: 0 };
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSONS_FETCHED_SUCCESSFULLY), { lessons, totalCount });
}

/**
 * function to get lesson by its id
 * @param {*} payload 
 */
lessonController.getLessonById = async (payload) => {
  let matchCriteria = { $match: { _id: Mongoose.Types.ObjectId(payload.id) } };
  let query = [
    matchCriteria,
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: { path: "$course", preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: "$activities", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'activities.activityId',
        foreignField: '_id',
        as: 'activitiesInfo'
      }
    },
    {
      $unwind: { path: "$activitiesInfo", preserveNullAndEmptyArrays: true }
    },
    {
      $group: {
        _id: '$_id',
        activities: {
          $push: {
            $mergeObjects: [
              {
                activityName: '$activities.activityName',
                activityId: '$activities.activityId',
                allocatedTime: '$activities.allocatedTime',
                webUrl: '$activities.webUrl',
              },
              {
                type: '$activitiesInfo.type',
                iconUrl: '$activitiesInfo.iconUrl'
              }
            ]
          }
        },
        lesson: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: { $mergeObjects: ["$lesson", "$$ROOT"] } } },
    {
      $addFields: {
        "activities": {
          $cond: {
            if: { $eq: [[{}], "$activities"] },
            then: [],
            else: "$activities"
          }
        }
      }
    },
    {
      $addFields: {
        "numberOfActivities": { $cond: { if: { $isArray: "$activities" }, then: { $size: "$activities" }, else: "NA" } }
      }
    },
    {
      $project: {
        "activitiesInfo": 0,
        "lesson": 0,
      }
    }
  ]
  let lesson = (await SERVICES.lessonService.getLessonsAggregate(query))[0];
  if (!lesson) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LESSON_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSON_FETCHED_SUCCESSFULLY), { lesson });
}

/**
 * function to delete the lesson by its id
 * @param {*} payload 
 */
lessonController.deleteLesson = async (payload) => {
  let lesson = await SERVICES.lessonService.deleteLesson({ _id: payload.id });
  if (!lesson) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LESSON_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  let lessonPath = path.join(__dirname, `../../../..${BASE_PATH}${LESSON_DIRECTORY_PATH}${lesson.path}`);
  fs.removeSync(lessonPath);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSON_DELETED_SUCCESSFULLY));
}

/**
 * function to update the lesson 
 * @param {*} payload 
 */
lessonController.updateLesson = async (payload) => {
  let lesson = await SERVICES.lessonService.getLesson({ _id: payload.id, status: LESSON_STATUS.DRAFT }, NORMAL_PROJECTION);
  if (!lesson) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LESSON_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  if (payload.status == LESSON_STATUS.PUBLISHED && (!payload.activities || !payload.activities.length)) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_REQUIRED_TO_PUBLISH_LESSON, ERROR_TYPES.BAD_REQUEST)
  //Update lesson in database
  await SERVICES.lessonService.updateLesson({ _id: payload.id }, payload);
  let lessonPath = await makeLesson(Mongoose.Types.ObjectId(payload.id));
  if (payload.status == LESSON_STATUS.PUBLISHED) {
    await SERVICES.activityService.minifyPublishLesoon(lessonPath,lesson.path);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSON_PUBLISHED_SUCCESSFULLY));
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LESSONS_UPDATED_SUCCESSFULLY));
}

/* export lessonController */
module.exports = lessonController;