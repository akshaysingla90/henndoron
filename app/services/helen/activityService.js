const CONFIG = require('../../../config');
const activityModel = require(`../../models/${CONFIG.PLATFORM}/activityModel`);

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
activityService.getActivity = async (criteria, projection) => {
  return await activityModel.findOne(criteria, projection).lean();
};

/**
 * function to fetch all Activities.
 */
activityService.getActivities = async (criteria, projection) => {
  return await activityModel.find(criteria, projection).lean();
};

/**
 * function to update user's Activity in the database.
 */
activityService.updateActivity = async (criteria, dataToUpdate) => {
  return await activityModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert: true }).lean();
};

/**
 * function to remove Activity .
 */
activityService.removeActivity = async (_id) => {
  return await activityModel.findOneAndRemove({ _id });
};

module.exports = activityService;