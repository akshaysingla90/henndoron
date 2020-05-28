'use strict';
const CONFIG = require('../../../config');
const { userModel, blackListModel, rankTypeModel, userChatModel, gameRoomModel, userProgressHistoryModel } = require(`../../models`);
const utils = require(`../../utils/utils`);
const { PAGINATION, GAME_STATUSES, GAME_RESULTS, MATCH_MAKING_TYPES, USER_PROGRESS_HISTORY_TYPE } = require('../../utils/constants');

let userService = {};

/** 
 * function to register a new  user
 */
userService.registerUser = async (payload) => {
  // encrypt user's password and store it in the database.
  payload.password = utils.hashPassword(payload.password);
  return await userModel(payload).save();
};

/**
 * function to update user.
 */
userService.updateUser = async (criteria, dataToUpdate, projection = {}) => {
  let userData = await userService.getUser(criteria);
  let updatedUserData = await userModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, projection: projection }).lean();
  //function to maintain the users stats history.
  await userService.updateUserStatsHistory(userData, updatedUserData);
  return updatedUserData;
};

/**
 * function to fetch user from the system based on criteria.
 */
userService.getUser = async (criteria, projection) => {
  return await userModel.findOne(criteria, projection).lean();
};

/**
 * function to create new user into the system.
 */
userService.createUser = async (payload) => {
  // fetch initial rank type and rank value for new user. 
  let defaultRankType = await rankTypeModel.findOne({ isDefault: true, isDeleted: false });
  payload.rankType = defaultRankType._id;
  payload.rankValue = defaultRankType.maxRank;
  return await userModel(payload).save();
};

module.exports = userService;