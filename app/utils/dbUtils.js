const CONSTANTS = require('../utils/constants');
const MODELS = require('../models/index');
const MONGOOSE = require('mongoose');

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
 * Funcion to migrate database.
 */
dbUtils.migrateDatabase = async () => {
  let dbVersion = await MODELS.versionModel.findOne();
  let version = dbVersion ? dbVersion.dbVersion : 0;
  if (version < 1) {
    //change data type of currentUserTurn in room model from string to objectId.
    let rooms = await MODELS.roomModel.find({ currentTurnUserId: { $type: 2 } }, {}, { lean: true });
    let dataToUpdate = {};
    for (let index = 0; index < rooms.length; index++) {
      if (rooms[index].currentTurnUserId && rooms[index].currentTurnUserId != "") {
        dataToUpdate = { $set: { currentTurnUserId: MONGOOSE.Types.ObjectId(rooms[index].currentTurnUserId) } }
      } else {
        dataToUpdate = { $unset: { currentTurnUserId: 1 } }
      }
      await MODELS.roomModel.findOneAndUpdate({ _id: rooms[index]._id }, dataToUpdate);
    }
    await MODELS.versionModel.findOneAndUpdate({}, { dbVersion: 1 }, { upsert: true });
  } else if (version < 2) {
    await MODELS.userModel.updateMany({}, { $set: { rewards: 0 } });
    await MODELS.versionModel.findOneAndUpdate({}, { dbVersion: 2 }, { upsert: true });
  }
  return;
};

module.exports = dbUtils;