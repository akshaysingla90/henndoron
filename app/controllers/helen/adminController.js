"use strict";
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, ACTIVITY_TYPE, RESOURCE_TYPE } = require('../../utils/constants');
const { ACTIVITY_DIRECTORY_PATH, ACTIVITY_RESOURCE_DIRECTORY_PATH, BASE_PATH, ACTIVITY_CONFIG_PATH } = require('../../../config').COCOS_PROJECT_PATH;
const SERVICES = require('../../services');
const fs = require('fs-extra');
const path = require('path');
/**************************************************
 ***** Auth controller for authentication logic ***
 **************************************************/
let adminController = {};

/**
 * function to clone a Activity from existing activity
 */

adminController.cloneActivity = async (payload) => {
  const sourceActivity = await SERVICES.activityService.getActivity({ _id: payload.activityId }, { _id: 1, path: 1 });
  const sourcePath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}`, sourceActivity.path);
  const destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}/${payload.name}`)
  let newActivity = {
    name: payload.name,
    path: `/${payload.name}`,
    configData: payload.configData,
    type: ACTIVITY_TYPE.CLONED,
    templateId: sourceActivity._id
  }
  const { id: activityId } = await SERVICES.activityService.createActivity(newActivity);

  let re = new RegExp(sourcePath + ACTIVITY_RESOURCE_DIRECTORY_PATH);
  const filterFunc = (filePath) => {
    if ((!payload.exactResources && filePath.search(re) !== -1) || filePath == sourcePath + ACTIVITY_CONFIG_PATH) return false;
    return true;
  }
  // Copying Directory
  await fs.copy(sourcePath, destinationPath, { filter: filterFunc });
  await fs.writeFileSync(destinationPath + ACTIVITY_CONFIG_PATH, JSON.stringify(payload.configData));

  console.log('Copying complete!');
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_CLONED_SUCCESSFULLY), { activityId });
};

/**
 * function to get all the activities
 * @param {*} payload 
 */
adminController.getActivities = async (payload) => {
  let criteria = {};
  if (payload.type) criteria.type = payload.type;
  let activities = await SERVICES.activityService.getActivities(criteria, { name: 1, type: 1, _id: 1 });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITIES_FETCHED_SUCCESSFULLY), { activities });
}

/**
 * function to get activity by its id
 * @param {*} payload 
 */
adminController.getActivity = async (payload) => {
  let activity = await SERVICES.activityService.getActivity({ _id: payload.id }, NORMAL_PROJECTION);
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_FETCHED_SUCCESSFULLY), { activity });
}

/**
 * function to add batch of files in a activity resource
 * @param {*} payload 
 */
adminController.addResourceFiles = async (payload) => {
  let activity = await SERVICES.activityService.getActivity({ _id: payload.id }, { path: 1, configData: 1 });
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  let destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}${activity.path}`);
  let configPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}${activity.path}/${ACTIVITY_CONFIG_PATH}`);
  let resources = { ...(activity.configData.resources || {}) };
  let resourceNames = payload.files.map(file => file.originalname);
  switch (payload.type) {
    case RESOURCE_TYPE.ANIMATION_FRAMES.VALUE:
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.ANIMATION_FRAMES.BASE_PATH + `/${payload.animationFramePath}`;
      let fileName = payload.files[0].originalname.toString();
      let fileExtension = fileName.substr(fileName.lastIndexOf('.'));
      const animation = {
        "Name": payload.animationName,
        "frameCount": payload.files.length,
        "frameInitial": payload.animationFrameInitial,
        "extension": fileExtension
      };
      if (resources.animationFrames) {
        resources.animationFrames.animation.push(animation);
      } else {
        resources.animationFrames = {
          basePath: RESOURCE_TYPE.ANIMATION_FRAMES.BASE_PATH,
          animation: [animation]
        }
      }
      break;
    case RESOURCE_TYPE.SOUND.VALUE:
      resources.sound = {
        basePath: RESOURCE_TYPE.SOUND.BASE_PATH,
        audio: resourceNames
      }
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.SOUND.BASE_PATH
      break;
    case RESOURCE_TYPE.SPRITE.VALUE:
      resources.sprites = {
        basePath: RESOURCE_TYPE.SPRITE.BASE_PATH,
        images: resourceNames
      }
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.SPRITE.BASE_PATH
      break;
  }
  await SERVICES.activityService.updateActivity({ _id: payload.id }, { "configData.resources": resources });
  await SERVICES.fileUploadService.uploadMultipleFilesToLocal(payload, destinationPath);
  let dataToWrite = activity.configData;
  dataToWrite.resources = resources;
  fs.writeFileSync(configPath, JSON.stringify(dataToWrite));
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.RESOURCES_UPLOAD_SUCCESSFULLY));
}

/* export adminController */
module.exports = adminController;


