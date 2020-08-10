'use strict';

const { Joi } = require('../../../utils/joiUtils');
const CONFIG = require('../../../../config');
const { AVAILABLE_AUTHS, ACTIVITY_TYPE, RESOURCE_TYPE } = require(`../../../utils/constants`);
//load controllers
const { cloneActivity, getActivities, getActivity, addResourceFiles } = require(`../../../controllers/${CONFIG.PLATFORM}/adminController`);

let routes = [
  {
    method: 'POST',
    path: '/v1/admin/activities/:activityId',
    joiSchemaForSwagger: {
      // headers: Joi.object({
      //   'authorization': Joi.string().required().description('User\'s JWT token.')
      // }).unknown(),
      params: {
        activityId: Joi.string().optional().description('Activity Id to clone.')
      },
      body: {
        name: Joi.string().description('Activity name.'),
        configData: Joi.object({}).unknown().description('Activity Config Data.'),
        exactResources: Joi.boolean().default(false).description(' true if want exact resources')
      },
      group: 'Admin',
      description: 'Route to create a new activity',
      model: 'Auth Tool'
    },
    // auth: AVAILABLE_AUTHS.ADMIN,
    handler: cloneActivity
  },
  {
    method: 'GET',
    path: '/v1/admin/activities',
    joiSchemaForSwagger: {
      // headers: Joi.object({
      //   'authorization': Joi.string().required().description('User\'s JWT token.')
      // }).unknown(),
      query: {
        //TODO PAGINATION AND FILTERS AND SORTING ORDER
        type: Joi.number().valid(ACTIVITY_TYPE.CLONED, ACTIVITY_TYPE.TEMPLATE).description('1 => TEMPLATE,2 => CLONED'),

      },
      group: 'Admin',
      description: 'Route to get activities',
      model: 'Auth Tool'
    },
    // auth: AVAILABLE_AUTHS.ADMIN,
    handler: getActivities
  },
  {
    method: 'GET',
    path: '/v1/admin/activities/:id',
    joiSchemaForSwagger: {
      // headers: Joi.object({
      //   'authorization': Joi.string().required().description('User\'s JWT token.')
      // }).unknown(),
      params: {
        id: Joi.string().required().description('Activity\'s Id.')
      },
      group: 'Admin',
      description: 'Route to get activity by its id',
      model: 'Auth Tool'
    },
    // auth: AVAILABLE_AUTHS.ADMIN,
    handler: getActivity
  },
  {
    method: 'POST',
    path: '/v1/admin/activities/:id/files-upload',
    joiSchemaForSwagger: {
      // headers: Joi.object({
      //   'authorization': Joi.string().required().description('User\'s JWT token.')
      // }).unknown(),
      params: {
        id: Joi.string().required().description('Activity\'s Id.')
      },
      formData: {
        fileArray: Joi.fileArray({ name: 'assets', description: 'Files Array', maxCount: 20 }),
        body: {
          animationFramePath: Joi.string().optional().description('animationFrame Folder\'s path'),
          animationName: Joi.string().optional().description('animationName for config.json'),
          animationFrameInitial: Joi.string().optional().description('Animation asset folder\'s path'),
          type: Joi.number().required().valid(RESOURCE_TYPE.SOUND.VALUE, RESOURCE_TYPE.ANIMATION_FRAMES.VALUE, RESOURCE_TYPE.SPRITE.VALUE).description('1 => SPRITE,2 => SOUND 3 => ANIMATION_FRAME'),
        }
      },
      group: 'Admin',
      description: 'Route to create a new activity',
      model: 'Auth Tool'
    },
    // auth: AVAILABLE_AUTHS.ADMIN,
    handler: addResourceFiles
  }
];

module.exports = routes;