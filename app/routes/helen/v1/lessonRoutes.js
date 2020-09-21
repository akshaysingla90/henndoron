'use strict';

const { Joi } = require('../../../utils/joiUtils');
const { USER_ROLE, LESSON_STATUS } = require(`../../../utils/constants`);
//load controllers
const { createLesson, getLessons, getLessonById, deleteLesson } = require(`../../../controllers/helen/lessonController`);

let routes = [
  {
    method: 'POST',
    path: '/v1/admin/lesson',
    joiSchemaForSwagger: {
      headers: {
        'authorization': Joi.string().required().description('User\'s JWT token.')
      },
      params: {
        activityId: Joi.string().optional().description('Lesson Id to clone.')
      },
      body: {
        name: Joi.string().required().description('Lesson name.'),
        // decription: Joi.string().required().description('Lesson decription.'),
        lessonNumber: Joi.number().required().description('Lesson number.'),
        episodeNumber: Joi.number().required().description('Episode number.'),
        activityIds: Joi.array().items(Joi.string().required()).description('Activity Ids in order'),
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
      // headers: {
      //   'authorization': Joi.string().required().description('User\'s JWT token.')
      // },
      params: {
        id: Joi.string().required().description('Lesson\'s Id.')
      },
      group: 'Lesson',
      description: 'Route to delete lesson by its id',
      model: 'Delete_Lesson'
    },
    // auth: USER_ROLE.ADMIN,
    handler: deleteLesson
  }
];

module.exports = routes;