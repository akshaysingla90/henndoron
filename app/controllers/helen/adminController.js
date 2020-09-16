"use strict";
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, ACTIVITY_TYPE, RESOURCE_TYPE, ACTIVITY_STATUS } = require('../../utils/constants');
const { ACTIVITY_SRC_PATH, ACTIVITY_PREVIEW_PATH, TEMPLATE_ACTIVITY_PREVIEW, TEMPLATE_ACTIVITY_PATH, ACTIVITY_DIRECTORY_PATH, ACTIVITY_RESOURCE_DIRECTORY_PATH, BASE_PATH, ACTIVITY_CONFIG_PATH } = require('../../../config').COCOS_PROJECT_PATH;
const SERVICES = require('../../services');
const fs = require('fs-extra');
const replace = require('replace-in-file');
const path = require('path');
/**************************************************
 ***** Auth controller for authentication logic ***
 **************************************************/
let adminController = {};

/**
 * function to clone a Activity from existing activity 
 */

adminController.cloneActivity = async (payload) => {
  const sourceActivity = await SERVICES.activityService.getActivity({ _id: payload.templateId });
  let sourcePath = sourceActivity.status == ACTIVITY_STATUS.TEMPLATE
    ? path.join(__dirname, `../../..${TEMPLATE_ACTIVITY_PATH}`, sourceActivity.path)
    : path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}`, sourceActivity.path)
  const activityPath = `${payload.name}${Date.now()}`;
  const destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}/${activityPath}`);
  let newActivity = {
    name: payload.name,
    path: `/${activityPath}`,
    status: ACTIVITY_STATUS.DRAFT,
    type: sourceActivity.type,
    templateId: sourceActivity._id,
    description: payload.description,
    iconUrl: sourceActivity.iconUrl,
    courseId: payload.courseId,
    lessonNumber: payload.lessonNumber,
    episodeNumber: payload.episodeNumber
  }
  //create new activity in database 
  const activity = await SERVICES.activityService.createActivity(newActivity);

  let re = new RegExp(sourcePath + ACTIVITY_RESOURCE_DIRECTORY_PATH);
  const filterFunc = (filePath) => {
    if ((!payload.exactResources && filePath.search(re) !== -1) || filePath == sourcePath + ACTIVITY_CONFIG_PATH) return false;
    return true;
  }
  // Copying Directory
  await fs.copy(sourcePath, destinationPath, { filter: filterFunc });

  // Change index.js 
  let pathToReplace = payload.configData.properties.activityPath;
  let namespaceToReplace = payload.configData.properties.namespace;
  let textToWrite = activityPath;
  console.log('------- In SAVE DRAFT ------');
  console.log('pathToReplace => ', pathToReplace);
  console.log('namespaceToReplace => ', namespaceToReplace);
  console.log('textToWrite => ', textToWrite);
  const options = {
    files: destinationPath + ACTIVITY_SRC_PATH,
    from: () => pathToReplace == namespaceToReplace
      ? new RegExp(pathToReplace, 'g')
      : [new RegExp(pathToReplace, 'g'), new RegExp(namespaceToReplace, 'g')],
    to: textToWrite
  };
  await replace(options);

  //Creating config.json for activity 
  payload.configData.properties.activityPath = activityPath;
  payload.configData.properties.url = `res/Activity/${activityPath}/`
  payload.configData.properties.namespace = `${activityPath}`
  await fs.writeFileSync(destinationPath + ACTIVITY_CONFIG_PATH, JSON.stringify(payload.configData));

  console.log('Copying complete!');
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_CLONED_SUCCESSFULLY), { activity });
};

/**
 * function to edit a draft
 */

adminController.editActivity = async (payload) => {
  let activity = await SERVICES.activityService.getActivity({ _id: payload.activityId, status: ACTIVITY_STATUS.DRAFT }, NORMAL_PROJECTION, { instance: true });
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  await SERVICES.activityService.updateActivity({ _id: payload.activityId }, payload);
  const destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}/${activity.path}`);
  await fs.writeFileSync(destinationPath + ACTIVITY_CONFIG_PATH, JSON.stringify(payload.configData));
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_UPDATED_SUCCESSFULLY));
};

/**
 * function to get all the activities
 * @param {*} payload 
 */
adminController.getActivities = async (payload) => {
  payload.criteria = {};
  payload.skip = (payload.counter - 1) * payload.limit;
  if (payload.type) payload.criteria.type = payload.type;
  let activities = await SERVICES.activityService.getActivities(payload, { path: 0 });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITIES_FETCHED_SUCCESSFULLY), activities);
}

/**
 * function to get publish activity by its id
 * @param {*} payload 
 */
adminController.publishActivity = async (payload) => {
  let activity = await SERVICES.activityService.getActivity({ _id: payload.activityId, status: ACTIVITY_STATUS.DRAFT }, NORMAL_PROJECTION, { instance: true });
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  activity.status = ACTIVITY_STATUS.PUBLISHED;
  await activity.save();
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_FETCHED_SUCCESSFULLY), { activity });
}

/**
 * function to get activity by its id
 * @param {*} payload 
 */
adminController.getActivity = async (payload) => {
  let activity = await SERVICES.activityService.getActivity({ _id: payload.id }, NORMAL_PROJECTION);
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  let activityPath = activity.status == ACTIVITY_STATUS.TEMPLATE
    ? path.join(__dirname, `../../..${TEMPLATE_ACTIVITY_PATH}`, activity.path)
    : path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}`, activity.path);
  let configData = await (new Promise((resolve, reject) => {
    fs.readFile(activityPath + ACTIVITY_CONFIG_PATH, 'utf-8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  }))
  activity.configData = JSON.parse(configData);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_FETCHED_SUCCESSFULLY), { activity });
}

/**
 * function to add batch of files in a activity resource
 * @param {*} payload 
 */
adminController.addResourceFiles = async (payload) => {
  let activity = await SERVICES.activityService.getActivity({ _id: payload.id }, { path: 1 });
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  let destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}${activity.path}`);
  switch (payload.type) {
    case RESOURCE_TYPE.ANIMATION_FRAMES.VALUE:
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.ANIMATION_FRAMES.BASE_PATH + `${payload.animationFramePath}`;
      break;
    case RESOURCE_TYPE.SOUND.VALUE:
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.SOUND.BASE_PATH
      break;
    case RESOURCE_TYPE.SPRITE.VALUE:
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.SPRITE.BASE_PATH
      break;
  }
  await SERVICES.fileUploadService.uploadMultipleFilesToLocal(payload, destinationPath);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.RESOURCES_UPLOAD_SUCCESSFULLY));
}

/**
 * function to delete batch of files in a activity resource
 * @param {*} payload 
 */
adminController.deleteResourceFiles = async (payload) => {
  let activity = await SERVICES.activityService.getActivity({ _id: payload.id }, { path: 1 });
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  let destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}${activity.path}`);
  switch (payload.type) {
    case RESOURCE_TYPE.ANIMATION_FRAMES.VALUE:
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.ANIMATION_FRAMES.BASE_PATH + `/${payload.animationFramePath}`;
      break;
    case RESOURCE_TYPE.SOUND.VALUE:
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.SOUND.BASE_PATH
      break;
    case RESOURCE_TYPE.SPRITE.VALUE:
      destinationPath = destinationPath + '/' + RESOURCE_TYPE.SPRITE.BASE_PATH
      break;
  }
  await SERVICES.fileUploadService.deleteMultipleFilesFromLocal(payload, destinationPath);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.RESOURCES_DELETED_SUCCESSFULLY));
}

/**
 * function to delete the activity draft/published by its id
 * @param {*} payload 
 */
adminController.deleteActivity = async (payload) => {
  let activity = await SERVICES.activityService.removeActivity({ _id: payload.id, status: { $ne: ACTIVITY_STATUS.TEMPLATE } });
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_DELETED_SUCCESSFULLY));
}

/**
 * function to duplicate a Activity from existing activity
 */

adminController.duplicateActivity = async (payload) => {
  const sourceActivity = await SERVICES.activityService.getActivity({ _id: payload.activityId });
  let sourcePath = sourceActivity.status == ACTIVITY_STATUS.TEMPLATE
    ? path.join(__dirname, `../../..${TEMPLATE_ACTIVITY_PATH}`, sourceActivity.path)
    : path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}`, sourceActivity.path)
  const activityPath = `${sourceActivity.name}${Date.now()}`;
  const destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}/${activityPath}`);
  //create new activity in database 
  let newActivity = {
    name: `${sourceActivity.name} (COPY)`,
    path: `/${activityPath}`,
    status: ACTIVITY_STATUS.DRAFT,
    type: sourceActivity.type,
    templateId: sourceActivity._id,
    description: sourceActivity.description,
    iconUrl: sourceActivity.iconUrl
  }
  const alreadyExist = await SERVICES.activityService.getActivity({ templateId: sourceActivity._id, name: newActivity.name });
  if (alreadyExist) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_ALREADY_EXISTS_WITH_THIS_NAME, ERROR_TYPES.BAD_REQUEST);
  const activity = await SERVICES.activityService.createActivity(newActivity);
  // Copying Directory
  await fs.copy(sourcePath, destinationPath);
  let configData = await (new Promise((resolve, reject) => {
    fs.readFile(sourcePath + ACTIVITY_CONFIG_PATH, 'utf-8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  }))
  configData = JSON.parse(configData);

  // Change index.js 
  let pathToReplace = configData.properties.activityPath;
  let namespaceToReplace = configData.properties.namespace;
  let textToWrite = activityPath;
  console.log('------- In DUPLICATEC COPY ------');
  console.log('pathToReplace => ', pathToReplace);
  console.log('namespaceToReplace => ', namespaceToReplace);
  console.log('textToWrite => ', textToWrite);
  const options = {
    files: destinationPath + ACTIVITY_SRC_PATH,
    from: () => pathToReplace == namespaceToReplace
      ? new RegExp(pathToReplace, 'g')
      : [new RegExp(pathToReplace, 'g'), new RegExp(namespaceToReplace, 'g')],
    to: textToWrite
  };
  await replace(options);

  //Creating config.json for activity
  configData.properties.activityPath = activityPath;
  configData.properties.namespace = `${activityPath}`
  configData.properties.url = `res/Activity/${activityPath}/`
  await fs.writeFileSync(destinationPath + ACTIVITY_CONFIG_PATH, JSON.stringify(configData));
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_CLONED_SUCCESSFULLY), { activity });
};

/**
 * function to create preview acitivity
 */

adminController.previewActivity = async (payload) => {
  const sourceActivity = await SERVICES.activityService.getActivity({ _id: payload.activityId });
  const sourcePath = sourceActivity.status == ACTIVITY_STATUS.TEMPLATE
    ? path.join(__dirname, `../../..${TEMPLATE_ACTIVITY_PATH}`, sourceActivity.path)
    : path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}`, sourceActivity.path)

  const previewPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_PREVIEW_PATH}`);
  const templatePreviewPath = path.join(__dirname, `../../..${TEMPLATE_ACTIVITY_PREVIEW}`)
  const destinationPath = `${previewPath}/res/Activity${sourceActivity.path}`;

  // Copying Preview template Directory
  await fs.emptyDir(previewPath);
  await fs.copy(templatePreviewPath, previewPath,);

  //Copying the activity to the preview folder
  await fs.copy(sourcePath, destinationPath);

  //Update project.json
  let projectData = await (new Promise((resolve, reject) => {
    fs.readFile(`${templatePreviewPath}/project.json`, 'utf-8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  }))
  projectData = JSON.parse(projectData);
  projectData.jsList.push(`res/Activity${sourceActivity.path}/src/index.js`);
  fs.writeFileSync(`${previewPath}/project.json`, JSON.stringify(projectData));

  //Update lesson-config
  let configData = await (new Promise((resolve, reject) => {
    fs.readFile(`${sourcePath}/${ACTIVITY_CONFIG_PATH}`, 'utf-8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  }))
  configData = JSON.parse(configData);
  let lessonObj = { ...configData.properties, resources: configData.resources };
  let lessonConfigData = await (new Promise((resolve, reject) => {
    fs.readFile(`${templatePreviewPath}/res/lesson-config.json`, 'utf-8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  }))
  lessonConfigData = JSON.parse(lessonConfigData);
  lessonConfigData.activityGame = [lessonObj];
  fs.writeFileSync(`${previewPath}/res/lesson-config.json`, JSON.stringify(lessonConfigData));
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACTIVITY_PREVIEW_CREATED_SUCCESSFULLY));
};

/**
 * function to get all the courses
 * @param {*} payload 
 */
adminController.getCourses = async (payload) => {
  let criteria = {};
  let courses = await SERVICES.activityService.getCourses(criteria, NORMAL_PROJECTION);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.COURSES_FETCHED_SUCCESSFULLY), { courses });
}

/* export adminController */
module.exports = adminController;


