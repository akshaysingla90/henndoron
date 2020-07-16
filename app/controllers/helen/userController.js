"use strict";
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, OPERATION_TYPES, SOCKET_EVENTS, SOCKET_EVENTS_TYPES } = require('../../utils/constants');
const SERVICES = require('../../services');
const { compareHash, encryptJwt, createResetPasswordLink, createAccountRestoreLink, sendEmail } = require(`../../utils/utils`);

/**************************************************
 ***** Auth controller for authentication logic ***
 **************************************************/
let userController = {};

/**
 * function to get server response.
 */

userController.getServerResponse = async (payload) => {
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.SERVER_IS_WORKING_FINE);
  
};

/**
 * function to register a user to the system.
 */
userController.registerNewUser = async (payload) => {
  let isUserAlreadyExists = await SERVICES.userService.getUser({ email: payload.email }, NORMAL_PROJECTION);
  if (!isUserAlreadyExists) {
    let newRegisteredUser = await SERVICES.userService.registerUser(payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { user: newRegisteredUser });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.EMAIL_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to login a user to the system.
 */
userController.loginUser = async (payload) => {
  // check is user exists in the database with provided email or not.
  let user = await SERVICES.userService.getUser({ email: payload.email }, NORMAL_PROJECTION);
  // if user exists then compare the password that user entered.
  if (user) {
    // compare user's password.
    if (compareHash(payload.password, user.password)) {
      const dataForJwt = {
        id: user._id,
        date: Date.now()
      };
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token: encryptJwt(dataForJwt) });
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to create and update user based on the operation type. 
 */
userController.createAndUpdateUser = async (payload) => {
  let criteria = { email: payload.email, isDeleted: false }, dataToUpdate = payload;
  if (payload.operationType === OPERATION_TYPES.DELETE) {
    dataToUpdate = { $set: { isDeleted: true } };
  }
  let user = await SERVICES.userService.updateUser(criteria, dataToUpdate, { new: true, upsert: true });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_UPDATED_SUCCESSFULLY), { data: user });
};

/**
 * Function to add reward points of the student.
 */
userController.saveRewardPoints = async (payload) => {
  let userInfo = await SERVICES.userService.getUser({ userName: payload.studentUserName }, {}, { lean: true });
  if (!userInfo) {
    return HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_STUDENT_USER_NAME, ERROR_TYPES.BAD_REQUEST);
  }
  if (!payload.hasOwnProperty('rewards')) {
    payload.rewards = 1;
  }
  // let criteria = { _id: userInfo._id, lessonReward: { $elemMatch: { activity: payload.activity, roomId: payload.roomId } } };
  // //check is reward points already rewarded or not.
  // let isAlreadyRewarded = await SERVICES.userService.getUser(criteria, {}, { lean: true });
  // if (isAlreadyRewarded) {
  //   return HELPERS.responseHelper.createErrorResponse(MESSAGES.ALREADY_REWARDED, ERROR_TYPES.BAD_REQUEST);
  // }
  // let dataToPush = { teacherId: payload.user._id, roomId: payload.roomId, rewards: payload.rewards, activity: payload.activity };
  // //update student record.
  // let updatedRecord = await SERVICES.userService.updateUser({ _id: userInfo._id }, { $push: { lessonReward: dataToPush } }, { lean: true, new: true });
  let criteria = { _id: userInfo._id }, dataToUpdate = { $inc: { rewards: payload.rewards } };
  let updatedUser = await SERVICES.userService.updateUser(criteria, dataToUpdate, { lean: true, new: true });
  let eventData = { eventType: SOCKET_EVENTS_TYPES.STUDENT_REWARDS, roomId: payload.roomId };
  eventData.data = { roomId: payload.roomId, rewards: (updatedUser || {}).rewards || 0 };
  global.io.to(updatedUser._id.toString()).emit('SingleEvent', eventData);
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESSFULLY_REWARDED);
};

//Function to fetch room Data.
userController.getGameData = async (payload) => {
  let roomId = payload.roomId;
  let roomInfo = await SERVICES.roomService.getRoom({ _id: roomId }, { roomData: 1 }, { lean: true });
  if (!roomInfo) {
    return HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_ROOM_ID, ERROR_TYPES.BAD_REQUEST);
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS), { data: roomInfo.roomData || {} })

};

/* export userController */
module.exports = userController;