const CONFIG = require('../../../config');
const { lessonModel, courseModel} = require(`../../models`);

let lessonService = {};

/**
 * function to  create an lesson.
 */
lessonService.createLesson = async (lesson) => {
  return await new lessonModel(lesson).save();
};

/**
 * function to fetch Lesson by its id.
 */
lessonService.getLesson = async (criteria, projection) => {
  return await lessonModel.findOne(criteria, projection).lean();
};

/**
 * function to fetch all Lessons.
 */
lessonService.getLessons = async (criteria, projection) => {
  return await lessonModel.find(criteria, projection).lean();
};

/**
 * function to update user's Lesson in the database.
 */
lessonService.updateLesson = async (criteria, dataToUpdate) => {
  return await lessonModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert: true, useFindAndModify: false }).lean();
};

/**
 * function to remove Lesson .
 */
lessonService.removeLesson = async (_id) => {
  return await lessonModel.findOneAndRemove({ _id });
};

/**
 * function to fetch all Courses.
 */
lessonService.getCoursesAggregate = async (query) => {
  return await courseModel.aggregate(query);
};
/**
 * function to fetch all Lessons.
 */
lessonService.getLessonsAggregate = async (query) => {
  return await  lessonModel.aggregate(query);
};

/**
 * function to delte lesson by its id.
 */
lessonService.deleteLesson = async (criteria) => {
  return await  lessonModel.findOneAndRemove(criteria);
};

module.exports = lessonService;