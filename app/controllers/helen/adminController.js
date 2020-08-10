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
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_FETCHED_SUCCESSFULLY), { activity });
}

/**
 * function to add batch of files in a activity resource
 * @param {*} payload 
 */
adminController.addResourceFiles = async (payload) => {
  const activity = await SERVICES.activityService.getActivity({ _id: payload.id }, { path: 1 });
  let destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}${activity.path}`);
   await SERVICES.activityService.updateActivity({ _id: payload.id }, { "configData.resources": resources });
  let fileUrls = await SERVICES.fileUploadService.uploadMultipleFilesToLocal(payload, destinationPath);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.RESOURCES_UPLOAD_SUCCESSFULLY));
}

/* export adminController */
module.exports = adminController;


