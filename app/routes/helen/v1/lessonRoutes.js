'use strict';

const { Joi } = require('../../../utils/joiUtils');
const { USER_ROLE, LESSON_STATUS } = require(`../../../utils/constants`);
//load controllers
const { duplicateLesson, updateLesson, createLesson, getLessons, getLessonById, deleteLesson } = require(`../../../controllers/helen/lessonController`);

let routes = [
  {
    method: 'POST',
    path: '/v1/admin/lesson',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      body: {
        name: Joi.string().required().description('Lesson name.'),
        description: Joi.string().required().description('Lesson decription.'),
        lessonNumber: Joi.number().required().description('Lesson number.'),
        episodeNumber: Joi.number().required().description('Episode number.'),
        activities: Joi.array().required().items(
          Joi.object({
            activityId: Joi.string().required().description('actvityId.'),
            activityName: Joi.string().required().description('Module name'),
            allocatedTime: Joi.number().required().description('Module time'),
          }).error(new Error('Module file cannot not be empty'))
            .required()).description('Activity Ids in order'),
        courseId: Joi.string().required().description('Course Id'),
        status: Joi.number().valid(LESSON_STATUS.DRAFT, LESSON_STATUS.PUBLISHED).description('3 => DRAFT,4 => PUBLISHED'),
      },
      group: 'Lesson',
      description: 'Route to create a new lesson either Draft/Publish',
      model: 'Create_Lesson'
    },
    auth: USER_ROLE.ADMIN,
    handler: createLesson
  },
  {
    method: 'PUT',
    path: '/v1/admin/lesson/:id',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        id: Joi.string().optional().description('Lesson Id to edit.')
      },
      body: {
        name: Joi.string().optional().description('Lesson name.'),
        description: Joi.string().optional().description('Lesson decription.'),
        lessonNumber: Joi.number().optional().description('Lesson number.'),
        episodeNumber: Joi.number().optional().description('Episode number.'),
        activities: Joi.array().items(
          Joi.object({
            activityId: Joi.string().required().description('Module Id.'),
            activityName: Joi.string().required().description('Module name'),
            allocatedTime: Joi.number().required().description('Module time')
          })
            .error(new Error('Module file cannot not be empty'))
            .required()).description('Activity Ids in order'),
        courseId: Joi.string().description('Course Id'),
        status: Joi.number().valid(LESSON_STATUS.DRAFT, LESSON_STATUS.PUBLISHED).description('3 => DRAFT,4 => PUBLISHED'),
      },
      group: 'Lesson',
      description: 'Route to update a lesson',
      model: 'Edit_Lesson'
    },
    auth: USER_ROLE.ADMIN,
    handler: updateLesson
  },
  {
    method: 'GET',
    path: '/v1/admin/lesson',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      query: {
        //TODO PAGINATION AND FILTERS AND SORTING ORDER
        search: Joi.string().optional().description('search string'),
        status: Joi.number().valid(LESSON_STATUS.DRAFT, LESSON_STATUS.PUBLISHED).description('1 => DRAFT,2 => PUBLISHED'),
        courseId: Joi.string().optional().description('Course Id'),
        limit: Joi.number().optional().default(99999).description('Pagination limit.'),
        counter: Joi.number().optional().default(1).description('Pagination counter.'),
      },
      group: 'Lesson',
      description: 'Route to get lessons',
      model: 'Get_Lessons'
    },
    auth: USER_ROLE.ADMIN,
    handler: getLessons
  },
  {
    method: 'GET',
    path: '/v1/admin/lesson/:id',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        id: Joi.string().required().description('Lesson\'s Id.')
      },
      group: 'Lesson',
      description: 'Route to get lesson by its id',
      model: 'Get_Lesson_By_Id'
    },
    auth: USER_ROLE.ADMIN,
    handler: getLessonById
  },
  {
    method: 'DELETE',
    path: '/v1/admin/lesson/:id',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        id: Joi.string().required().description('Lesson\'s Id.')
      },
      group: 'Lesson',
      description: 'Route to delete lesson by its id',
      model: 'Delete_Lesson'
    },
    auth: USER_ROLE.ADMIN,
    handler: deleteLesson
  },
  {
    method: 'POST',
    path: '/v1/admin/lesson/duplicate/:id',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        id: Joi.string().required().description('Lesson\'s Id.')
      },
      group: 'Lesson',
      description: 'Route to duplicate lesson by its id',
      model: 'Delete_Lesson'
    },
    auth: USER_ROLE.ADMIN,
    handler: duplicateLesson
  }
];

module.exports = routes;