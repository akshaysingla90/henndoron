const CONFIG = require('../../../config');
const { activityModel, courseModel} = require(`../../models`);
const dbUtils = require('../../utils/dbUtils')
let activityService = {};

/**
 * function to  create an activity.
 */
activityService.createActivity = async (activity) => {
  return await new activityModel(activity).save();
};

/**
 * function to fetch Activity by its id.
 */
activityService.getActivity = async (criteria, projection, options) => {
  if (options && options.instance) return await activityModel.findOne(criteria, projection);
  return await activityModel.findOne(criteria, projection).lean();
};

/**
 * function to fetch all Activities.
 */
activityService.getActivities = async (payload, projection) => {
  let query = [
    { $match: payload.criteria },
    ...dbUtils.paginateWithTotalCount(undefined, payload.skip, payload.limit),
    {
      $lookup: {
        from: 'course',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      }
    }
  ]
  let { items: activities, totalCount } = (await activityModel.aggregate(query))[0] || { items: [], totalCount: 0 }
  return { activities, totalCount };
};

/**
 * function to update user's Activity in the database.
 */
activityService.updateActivity = async (criteria, dataToUpdate) => {
  return await activityModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert: true, useFindAndModify: false }).lean();
};

/**
 * function to remove Activity .
 */
activityService.removeActivity = async (criteria) => {
  return await activityModel.findOneAndRemove(criteria);
};

/**
 * function to fetch all Courses.
 */
activityService.getCourses = async (criteria, projection) => {
  return await courseModel.find(criteria, projection).lean();
};
module.exports = activityService;