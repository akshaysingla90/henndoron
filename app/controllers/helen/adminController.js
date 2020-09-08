"use strict";
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, ACTIVITY_TYPE, RESOURCE_TYPE, ACTIVITY_STATUS } = require('../../utils/constants');
const { ACTIVITY_PREVIEW_PATH, TEMPLATE_ACTIVITY_PREVIEW, TEMPLATE_ACTIVITY_PATH, ACTIVITY_DIRECTORY_PATH, ACTIVITY_RESOURCE_DIRECTORY_PATH, BASE_PATH, ACTIVITY_CONFIG_PATH } = require('../../../config').COCOS_PROJECT_PATH;
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
  const sourceActivity = await SERVICES.activityService.getActivity({ _id: payload.templateId });
  let sourcePath = sourceActivity.status == ACTIVITY_STATUS.TEMPLATE
    ? path.join(__dirname, `../../..${TEMPLATE_ACTIVITY_PATH}`, sourceActivity.path)
    : path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}`, sourceActivity.path)

  const destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}/${payload.name}`)
  let newActivity = {
    name: payload.name,
    path: `/${payload.name}${Date.now()}`,
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
 * function to edit a draft
 */

adminController.editActivity = async (payload) => {
  let activity = await SERVICES.activityService.getActivity({ _id: payload.activityId, status: ACTIVITY_STATUS.DRAFT }, NORMAL_PROJECTION, { instance: true });
  if (!activity) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ACTIVITY_DOESNOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
  await SERVICES.activityService.updateActivity({ _id: payload.activityId }, payload);
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
  let activity = await SERVICES.activityService.getActivity({ _id: payload.id, status: ACTIVITY_STATUS.DRAFT }, NORMAL_PROJECTION, { instance: true });
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
  const suffix = Date.now();
  const destinationPath = path.join(__dirname, `../../../..${BASE_PATH}${ACTIVITY_DIRECTORY_PATH}/${sourceActivity.name}${suffix}`);
  //create new activity in database 
  let newActivity = {
    name: `${sourceActivity.name} (COPY)`,
    path: `/${sourceActivity.name}${suffix}`,
    status: ACTIVITY_STATUS.DRAFT,
    type: sourceActivity.type,
    templateId: sourceActivity._id,
    description: sourceActivity.description,
    iconUrl: sourceActivity.iconUrl
  }
  const activity = await SERVICES.activityService.createActivity(newActivity);
  // Copying Directory
  await fs.copy(sourcePath, destinationPath);
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
  projectData.jsList.push(`res/Activity/${sourceActivity.name}/src/index.js`);
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

/* export adminController */
module.exports = adminController;


