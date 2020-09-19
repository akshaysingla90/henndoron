const fs = require('fs-extra');
const shell = require('shelljs')
const path = require('path');
const { activityModel, courseModel } = require(`../../models`);
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
    {
      $lookup: {
        from: 'courses',
        let: { id: "$courseId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
          { $project: { "iconUrl": 1 } }
        ],
        as: 'courses',
      }
    },
    { $unwind: { path: "$courses", preserveNullAndEmptyArrays: true } },
    { $addFields: { courseIcon: "$courses.iconUrl" } },
    { $project: { courses: 0, courseId: 0 } },
    ...dbUtils.paginateWithTotalCount(undefined, payload.skip, payload.limit)
  ];
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

/**
 * function to copy the templates from cocos directory to templates
 * @param {*} activities activities to copy
 */
activityService.copyTemplates = async (activities) => {
  let cocoProjectPath = path.join(__dirname, '../../../../HelenDron-Cocos2d');
  await shell.cd(cocoProjectPath);
  await shell.exec(`sudo git pull`);
  for (let index = 0; index < activities.length; index++) {
    let activity = activities[index];
    let templateCocoPath = path.join(`${cocoProjectPath}/HelenDoron/res/Activity${activity.path}`);
    let templateNodePath = path.join(__dirname, `../../../template-activities${activity.path}`);
    console.log('copying start for file ',index);
    await fs.copy(templateCocoPath, templateNodePath);
    console.log('copying end for file ', index);
  }
  await shell.cd(path.join(__dirname, `../../..`));
  await shell.exec(`sudo git add template-activities`);
  await shell.exec(`sudo git commit -m '-Update templates'`);
  await shell.exec(`sudo git push`);
  console.log('Template activities are updated and pushed to the remote')
}
module.exports = activityService;