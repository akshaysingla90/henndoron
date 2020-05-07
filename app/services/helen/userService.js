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

/**
 * function to get user's current rank.
 */
userService.getUserRank = async (userId) => {
  let user = await userModel.findOne({ _id: userId }).lean();
};

/**
 * function to fetch count of users from the system based on criteria.
 */
userService.getCountOfUsers = async (criteria) => {
  return await userModel.countDocuments(criteria);
};

/**
 * function to fetch users from the system based on criteria.
 */
userService.getUsers = async (criteria) => {
  return await userModel.find(criteria);
};

/**
 * function to update user in blackList
 */
userService.updateBlackList = async (criteria, dataToUpdate, options) => {
  return await blackListModel.findOneAndUpdate(criteria, dataToUpdate, options);
};

/**
 * Function to get black list of user
 */
userService.getBlackList = async (criteria) => {
  let query = [
    { $match: { ...criteria } },
    {
      $lookup: {
        from: 'users',
        localField: 'toId',
        foreignField: '_id',
        as: 'blockedUserInfo'
      }
    },
    { $unwind: '$blockedUserInfo' },
    {
      $project: {
        userId: '$toId',
        name: '$blockedUserInfo.name',
        expPoints: '$blockedUserInfo.expPoints'
      }
    }
  ];
  return await blackListModel.aggregate(query);
};

/**
 * Function to delete from black list
 */
userService.deleteFromBlackList = async (criteria) => {
  return await blackListModel.findOneAndDelete(criteria);
};

/**
 * Function to get chat history
 */
userService.getChatHistory = async (criteria, payload) => {
  let limit = payload.limit || PAGINATION.DEFAULT_LIMIT;
  let skip = payload.skip || PAGINATION.DEFAULT_NUMBER_OF_DOCUMENTS_TO_SKIP;
  let query = [
    {
      $match: { ...criteria },
    },
    {
      $project: {
        message: '$message',
        fromUserId: '$fromId',
        toUserId: '$toUserId',
        time: '$createdAt'
      }
    },
    {
      $sort: { time: -1 }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    },
    {
      $sort: { time: 1 }
    }
  ];
  return await userChatModel.aggregate(query);
};

/**
 * Function to check if two users are blackLiu
 */
userService.checkFriendAreInBlackListOrNot = async (userId, friendId) => {
  let result = await blackListModel.findOne({ fromId: userId, toId: friendId });
  return result ? true : false;
};

//Function to get the top 64 users having premium membership.
userService.top64UserOfSeasonHavingPremiumSubscription = async (currentTime) => {
  let query = [
    // { $match: { $and: [{ 'premiumSubscription.startDate': { $lte: currentTime } }, { 'premiumSubscription.endDate': { $gte: currentTime } }] } },
    { $sort: { isLegend: -1, legendRank: 1, 'premiumSubscription.endDate': -1, rankValue: 1, stars: -1 } },
    { $limit: 64 }
  ];
  return await userModel.aggregate(query);
};

//Function to get the game history of the users.
userService.getUserGameHistory = async (payload) => {
  let userId = payload.user._id, limit = payload.limit || PAGINATION.DEFAULT_LIMIT, skip = payload.skip || PAGINATION.DEFAULT_NUMBER_OF_DOCUMENTS_TO_SKIP;
  let query = [
    //match the matches that is completed of that user.
    { $match: { 'users.userId': userId, status: GAME_STATUSES.COMPLETED } },
    //unwind the users to find the username and avtar url.
    { $unwind: '$users' },
    //get userInfo from users collection.
    {
      $lookup: {
        from: 'users',
        localField: 'users.userId',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    //Fetch the user default avtart from userAvtar collection.
    {
      $lookup: {
        from: 'useravtars',
        let: { is_Default: true, user_Id: "$users.userId" },
        pipeline: [{
          $match: {
            $expr: { $and: [{ $eq: ['$userId', '$$user_Id'] }, { $eq: ['$isDefault', '$$is_Default'] }] }
          }
        }],
        as: 'userAvtar'
      }
    },
    //unwind the userinfo (change from array to object.)
    {
      $unwind: { path: '$userInfo', "preserveNullAndEmptyArrays": true }
    },
    //unwind avtar Info (change from array to object.)
    { $unwind: { path: '$userAvtar', "preserveNullAndEmptyArrays": true } },
    //group the data accordin to document Id.
    {
      $group: {
        _id: '$_id',
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        winners: { $first: '$winners' },
        loosers: { $first: '$loosers' },
        matchMakingType: { $first: '$matchMakingType' },
        users: { $push: { userId: '$users.userId', isBotConnected: '$users.isBotConnected', userName: '$userInfo.name', userAvtar: '$userAvtar.avtarUrl', playerPosition: '$users.playerPosition' } }
      }
    },
    //add fields isUserWinner and isUserLeft to check status of user in the game either win/loose/leave.
    {
      $addFields: {
        isUserWinner: {
          $filter: {
            input: "$winners",
            as: "winUsers",
            cond: { $eq: ["$$winUsers.userId", userId] }
          }
        },
        isUserLeft: {
          $filter: {
            input: "$users",
            as: "users",
            cond: { $and: [{ $eq: ["$$users.userId", userId] }, { $eq: ["$$users.isBotConnected", true] }] }
          }
        }
      },
    },
    //Mark the status win/loose.
    { $addFields: { status: { $cond: [{ $size: '$winnerUser' }, GAME_RESULTS.WIN, GAME_RESULTS.LOSE] } } },
    {
      $addFields: {
        status: { $cond: [{ $and: [{ $ne: ['$matchMakingType', MATCH_MAKING_TYPES.TOURNAMENT] }, { $eq: ['$status', GAME_RESULTS.LOSE] }] }, { $cond: [{ $size: '$userLeft' }, GAME_RESULTS.LEAVE, GAME_RESULTS.LOSE] }, 2] },
        team1: {
          $filter: {
            input: '$users',
            as: 'users',
            cond: { $or: [{ $eq: ['$$users.playerPosition', 0] }, { $eq: ['$$users.playerPosition', 2] }] }
          }
        },
        team2: {
          $filter: {
            input: '$users',
            as: 'users',
            cond: { $or: [{ $eq: ['$$users.playerPosition', 1] }, { $eq: ['$$users.playerPosition', 3] }] }
          }
        }
      }
    },
    { $sort: { 'updatedAt': -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        team1: '$team1',
        team2: '$team2',
        status: '$status',
        gameType: '$matchMakingType',
      }
    }
  ];
  return gameRoomModel.aggregate(query);
};

//Function to update the user stats history of the user.
userService.updateUserStatsHistory = async (dataBeforeUpdate, updateUserData) => {
  let currentDate = new Date();
  //check the is daily record exists for that user.
  //if no then create the record.
  let criteria = { userId: updateUserData._id, startDate: { $lte: currentDate }, endDate: { $gte: currentDate }, type: USER_PROGRESS_HISTORY_TYPE.DAILY };
  let dataToUpdate = { $set: { endWith: updateUserData } };
  let dataToSave = {
    startWith: dataBeforeUpdate,
    endWith: updateUserData,
    userId: updateUserData._id,
  };
  let updateDailyStats = await userProgressHistoryModel.findOneAndUpdate(criteria, dataToUpdate).lean();
  if (!updateDailyStats) {
    //if no record exists then create new record.
    let startDate = new Date(currentDate);
    startDate.setUTCHours(0, 0, 0, 0);
    let endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);
    dataToSave[`type`] = USER_PROGRESS_HISTORY_TYPE.DAILY;
    dataToSave[`startDate`] = new Date(startDate);
    dataToSave[`endDate`] = new Date(endDate);
    await userProgressHistoryModel(dataToSave).save();
  };
  criteria.type = USER_PROGRESS_HISTORY_TYPE.WEEKLY;
  let updateWeeklyStats = await userProgressHistoryModel.findOneAndUpdate(criteria, dataToUpdate).lean();
  if (!updateWeeklyStats) {
    //if no record exists then create new record.
    let tempDate = new Date(currentDate);
    let start = tempDate.getUTCDate() - tempDate.getUTCDay();
    let end = start + 6;
    let startDate = new Date(tempDate.setUTCDate(start));
    let endDate = new Date(tempDate.setUTCDate(end));
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);
    dataToSave[`type`] = USER_PROGRESS_HISTORY_TYPE.WEEKLY;
    dataToSave[`startDate`] = new Date(startDate);
    dataToSave[`endDate`] = new Date(endDate);
    await userProgressHistoryModel(dataToSave).save();
  };
  return;
};

module.exports = userService;