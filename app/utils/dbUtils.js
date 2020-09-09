const CONSTANTS = require('../utils/constants');
const MODELS = require('../models/index');
const MONGOOSE = require('mongoose');
const activities = require('../data-db/activityConfig.json')
const courses = require('../data-db/course.json')
let dbUtils = {};

/**
 * function to check valid reference from models.
 */
dbUtils.checkValidReference = async (document, referenceMapping) => {
  for (let key in referenceMapping) {
    let model = referenceMapping[key];
    if (!!document[key] && !(await model.findById(document[key]))) {
      throw CONSTANTS.RESPONSE.ERROR.BAD_REQUEST(key + ' is invalid.');
    }
  }
};

/**
 * create pagination condition for aggregateQuery with sort.
 *
 * @param {JSON} sort valid mongodb sort condition Object.
 * @param {Number} skip no. of documents to skip.
 * @param {Number} limit no. of documents to return.
 * @returns {Promise<[JSON]>} aggregate pipeline queries for pagination.
 */

dbUtils.paginateWithTotalCount = (sort, skip, limit) => {
  let condition = [
    ...(!!sort ? [{ $sort: sort }] : []),
    { $group: { _id: null, items: { $push: '$$ROOT' }, totalCount: { $sum: 1 } } },
    { $addFields: { items: { $slice: ['$items', skip, limit] } } },
  ]
  return condition;
}

/**
 * Funcion to migrate database.
 */
dbUtils.migrateDatabase = async () => {
  let dbVersion = await MODELS.versionModel.findOne();
  let version = dbVersion ? dbVersion.dbVersion : 0;
  let updatedVersion = version;
  if (version < 1) {
    //change data type of currentUserTurn in room model from string to objectId.
    let rooms = await MODELS.roomModel.find({ currentTurnUserId: { $type: 2 } }, {}, { lean: true });
    let dataToUpdate = {};
    for (let index = 0; index < rooms.length; index++) {
      if (rooms[index].currentTurnUserId && rooms[index].currentTurnUserId != "") {
        dataToUpdate['currentTurnUserId'] = MONGOOSE.Types.ObjectId(rooms[index].currentTurnUserId);
      } else {
        dataToUpdate = { $unset: { currentTurnUserId: 1 } }
      }
      await MODELS.roomModel.findOneAndUpdate({ _id: rooms[index]._id }, dataToUpdate);
      updatedVersion = 1;
    }
  }
  if (version < 2) {
    await MODELS.userModel.updateMany({}, { $set: { rewards: 0 } });
    // await MODELS.versionModel.findOneAndUpdate({}, { dbVersion: 2 }, { upsert: true });
    updatedVersion = 2;
  }
  if (version < 3) {
    //adding template activity's configData
    await dbUtils.addInitialTemplateActivities();
    updatedVersion = 3;
  }
  if (version < 4) {
    //adding course data
    await dbUtils.addInitialCourses();
    updatedVersion = 4;
  }
  if (updatedVersion !== version)
    await MODELS.versionModel.findOneAndUpdate({}, { dbVersion: updatedVersion }, { upsert: true });

  return;
};

/**
 *  function to add initial template activities.
 */
dbUtils.addInitialTemplateActivities = async () => {
  await MODELS.activityModel.insertMany(activities);
};

/**
 *  function to add initial courses.
 */
dbUtils.addInitialCourses = async () => {
  await MODELS.courseModel.insertMany(courses);
};

module.exports = dbUtils;