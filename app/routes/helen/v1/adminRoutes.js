'use strict';

const { Joi } = require('../../../utils/joiUtils');
const CONFIG = require('../../../../config');
const { USER_ROLE, ACTIVITY_TYPE, RESOURCE_TYPE } = require(`../../../utils/constants`);
//load controllers
const { updateActivityTemplate, deleteActivityPreview, deleteResourceFiles, getCourses, editActivity, cloneActivity, getActivities, getActivity, addResourceFiles, deleteActivity, duplicateActivity, previewActivity, publishActivity } = require(`../../../controllers/helen/adminController`);

let routes = [
  {
    method: 'POST',
    path: '/v1/admin/activities/:templateId',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        templateId: Joi.string().optional().description('Activity Id to clone.'),
      },
      body: {
        name: Joi.string().regex(/^[a-z0-9_ ]+$/i).error(new Error('Activity name should contain only alphanumeric chracters')).description('Activity name.'),
        description: Joi.string().required().description('Activity description.'),
        courseId: Joi.string().required().description('courseId.'),
        lessonNumber: Joi.number().required().description('Activity Cdescription.'),
        episodeNumber: Joi.number().required().description('Activity episode.'),


        configData: Joi.object({}).unknown().description('Activity Config Data.'),
        exactResources: Joi.boolean().default(true).description(' true if want exact resources')
      },
      group: 'Admin',
      description: 'Route to create a new activity save draft',
      model: 'Save_Draft'
    },
    auth: USER_ROLE.ADMIN,
    handler: cloneActivity
  },
  {
    method: 'PUT',
    path: '/v1/admin/activities/:activityId',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        activityId: Joi.string().optional().description('Draft activity Id.')
      },
      body: {
        name: Joi.string().regex(/^[a-z0-9_ ]+$/i).error(new Error('Activity name should contain only alphanumeric chracters')).description('Activity name.'),
        description: Joi.string().optional().description('Activity description.'),
        courseId: Joi.string().optional().description('courseId.'),
        lessonNumber: Joi.number().optional().description('Activity Lesson Number.'),
        episodeNumber: Joi.number().optional().description('Activity episode Number.'),
        configData: Joi.object({}).unknown().description('Activity Config Data.'),
      },
      group: 'Admin',
      description: 'Route to edit a draft',
      model: 'Edit_Draft'
    },
    auth: USER_ROLE.ADMIN,
    handler: editActivity
  },
  {
    method: 'PUT',
    path: '/v1/admin/activities/publish/:activityId',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        activityId: Joi.string().required().description('Activity Id to clone.')
      },
      group: 'Admin',
      description: 'Route to publish a draft activity',
      model: 'Publish_Actvity'
    },
    auth: USER_ROLE.ADMIN,
    handler: publishActivity
  },
  {
    method: 'POST',
    path: '/v1/admin/activities/duplicate/:activityId',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        activityId: Joi.string().required().description('Activity Id to clone.')
      },
      group: 'Admin',
      description: 'Route to copy an existing activity',
      model: 'Duplicate_Activity'
    },
    auth: USER_ROLE.ADMIN,
    handler: duplicateActivity
  },
  {
    method: 'GET',
    path: '/v1/admin/activities',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      query: {
        //pagination 
        counter: Joi.number().min(1).default(1).description('Page Counter'),
        limit: Joi.number().min(0).default(10).description('Page Limit'),
        //TODO PAGINATION AND FILTERS AND SORTING ORDER
        type: Joi.number().valid(ACTIVITY_TYPE.SMALL, ACTIVITY_TYPE.MEDIUM, ACTIVITY_TYPE.GAME).description('1 => SMALL,2 => MEDIUM,3 => GAME'),
      },
      group: 'Admin',
      description: 'Route to get activities',
      model: 'GET_ACTIVITIES'
    },
    auth: USER_ROLE.ADMIN,
    handler: getActivities
  },
  {
    method: 'GET',
    path: '/v1/admin/activities/:id',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        id: Joi.string().required().description('Activity\'s Id.')
      },
      group: 'Admin',
      description: 'Route to get activity by its id',
      model: 'GET_ACTIVITY'
    },
    auth: USER_ROLE.ADMIN,
    handler: getActivity
  },
  {
    method: 'POST',
    path: '/v1/admin/activities/:id/files-upload',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        id: Joi.string().required().description('Activity\'s Id.')
      },
      formData: {
        fileArray: Joi.fileArray({ name: 'assets', description: 'Files Array', maxCount: 70 }),
        body: {
          type: Joi.number().required().valid(RESOURCE_TYPE.SOUND.VALUE, RESOURCE_TYPE.ANIMATION_FRAMES.VALUE, RESOURCE_TYPE.SPRITE.VALUE).description('1 => SPRITE,2 => SOUND 3 => ANIMATION_FRAME'),
          // animationFramePath: Joi.string().optional().description('animationFrame Folder\'s path'),
          animationFramePath: Joi.string().description('animationFrame Folder\'s path')
            .when('type', {
              is: RESOURCE_TYPE.ANIMATION_FRAMES.VALUE,
              then: Joi.string().required(),
              otherwise: Joi.forbidden()
            }),
        }
      },
      group: 'Admin',
      description: 'Route to upload resource of an activity',
      model: 'Add_Resource'
    },
    auth: USER_ROLE.ADMIN,
    handler: addResourceFiles
  },
  {
    method: 'DELETE',
    path: '/v1/admin/activities/:id',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        id: Joi.string().required().description('Activity\'s Id.')
      },
      group: 'Admin',
      description: 'Route to delete activity by its id',
      model: 'Delete_Activity'
    },
    auth: USER_ROLE.ADMIN,
    handler: deleteActivity
  },
  {
    method: 'POST',
    path: '/v1/admin/activities/preview/:activityId',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        activityId: Joi.string().required().description('Activity Id to clone.')
      },
      group: 'Admin',
      description: 'Route to create preview activity',
      model: 'Preview_Activity'
    },
    auth: USER_ROLE.ADMIN,
    handler: previewActivity
  },
  {
    method: 'GET',
    path: '/v1/admin/course',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      group: 'Course',
      description: 'Route to get courses',
      model: 'Get_Course'
    },
    auth: USER_ROLE.ADMIN,
    handler: getCourses
  },
  {
    method: 'DELETE',
    path: '/v1/admin/activities/:id/files-delete',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        id: Joi.string().required().description('Activity\'s Id.')
      },
      body: {
        fileNames: Joi.array().items(Joi.string().required()).description(' File\'s name'),
        type: Joi.number().required().valid(RESOURCE_TYPE.SOUND.VALUE, RESOURCE_TYPE.ANIMATION_FRAMES.VALUE, RESOURCE_TYPE.SPRITE.VALUE).description('1 => SPRITE,2 => SOUND 3 => ANIMATION_FRAME'),
        animationFramePath: Joi.string().description('animationFrame Folder\'s path')
          .when('type', {
            is: RESOURCE_TYPE.ANIMATION_FRAMES.VALUE,
            then: Joi.string().required(),
            otherwise: Joi.forbidden()
          }),
      },
      group: 'Admin',
      description: 'Route to delete resource of an activity',
      model: 'Delete_Resource'
    },
    auth: USER_ROLE.ADMIN,
    handler: deleteResourceFiles
  },
  {
    method: 'DELETE',
    path: '/v1/admin/activities/preview/:activityId',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        activityId: Joi.string().required().description('Activity\'s Id.')
      },
      group: 'Admin',
      description: 'Route to delete activity-preview',
      model: 'Delete_Acyivity_Preview'
    },
    auth: USER_ROLE.ADMIN,
    handler: deleteActivityPreview
  }
];

if (process.env.UPDATE_TEMPLATES) {
  routes.push({
    method: 'POST',
    path: '/v1/admin/update-activity-templates',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      group: 'Activity-Template',
      description: 'Route to update activity templates',
      model: 'Delete_Acyivity_Preview'
    },
    auth: USER_ROLE.ADMIN,
    handler: updateActivityTemplate
  })
}

module.exports = routes;