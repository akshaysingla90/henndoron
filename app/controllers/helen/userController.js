"use strict";
const jwt = require('jsonwebtoken');
const path = require('path');
const CONFIG = require('../../../config');
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, SECURITY, GAME_STATUSES } = require('../../utils/constants');
const SERVICES = require('../../services');
const User = require(`../../models/${CONFIG.PLATFORM}/userModel`);
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
 * Function to fetch user's profile from the system.
 */
userController.getUserProfile = async (payload) => {
  let user = await SERVICES.userService.getUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION, password: 0, isRestored: 0 });
  if (user) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: user });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * funciton to send a link to registered email of an user who forgots his password.
 */
userController.forgotPassword = async (payload) => {
  let requiredUser = await SERVICES.userService.getUser({ email: payload.email });
  if (requiredUser) {

    // create reset-password link.
    let resetPasswordLink = createResetPasswordLink(requiredUser);
    let linkParts = resetPasswordLink.split("/");
    payload.resetPasswordToken = linkParts[linkParts.length - 1];
    let updatedUser = await SERVICES.userService.updateUser({ _id: requiredUser._id }, payload);

    // send forgot-password email to user.
    await sendEmail({
      email: updatedUser.email,
      username: updatedUser.userName,
      link: resetPasswordLink
    }, CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD_EMAIL);
    return CONSTANTS.RESPONSEMESSAGES.SUCCESS.MISSCELANEOUSAPI(CONSTANTS.MESSAGES.EMAIL_SENT_TO_REGISTERED_EMAIL_WITH_RESET_PASSWORD_LINK);
  }
  return CONSTANTS.RESPONSEMESSAGES.ERROR.DATA_NOT_FOUND(CONSTANTS.MESSAGES.NO_USER_FOUND);
};


/**
 * function to login using google play, game center and using device id.
 */
userController.socialLogin = async (payload) => {
  // check user's session with provided device id is exists or not.
  let criteriaForSession = { deviceId: payload.deviceId, loginType: payload.loginType };
  if (payload.loginType !== LOGIN_TYPES.NORMAL && !payload.socialId) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.SOCIAL_ID_REQUIRED_FOR_THIS_LOGIN, ERROR_TYPES.BAD_REQUEST);
  }
  let userSession = await SERVICES.sessionService.getSession(criteriaForSession);
  if (userSession || (!userSession && payload.loginType !== LOGIN_TYPES.NORMAL)) {
    let userFindCriteria = userSession ? { _id: userSession.userId._id, isDeleted: false } : {};
    // if user wants to login using google play then find its google's record from database.
    if (payload.socialId && payload.loginType === LOGIN_TYPES.GOOGLE_PLAY) {
      userFindCriteria = { 'googlePlayServices.id': payload.socialId, isDeleted: false };
      payload.googlePlayServices = { id: payload.socialId };
    }
    // if user wants to login using game center then find its game center's record from database.
    else if (payload.socialId && payload.loginType === LOGIN_TYPES.GAME_CENTER) {
      userFindCriteria = { 'gameCenter.id': payload.socialId, isDeleted: false };
      payload.gameCenter = { id: payload.socialId };
    }
    // check user exists based on above criteria if yes then return it in response otherwise create new one and update its session.  
    let user = await SERVICES.userService.getUser(userFindCriteria, { ...NORMAL_PROJECTION, password: 0 });
    if (user) {
      // update user's session.
      const dataForJwt = {
        id: user._id,
        date: Date.now()
      };
      payload.token = encryptJwt(dataForJwt);
      await createUserSession(criteriaForSession, user._id, payload);
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { data: user, token: payload.token });
    }
  }

  let newUser = await SERVICES.userService.createUser(payload);
  // update session with new created user.
  const dataForJwt = {
    id: newUser._id,
    date: Date.now()
  };
  payload.token = encryptJwt(dataForJwt);
  await createUserSession(criteriaForSession, newUser._id, payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { data: newUser, token: payload.token });
};

/**
 * function to create user's sesion or update an existing one.
 * @param {*} userId 
 * @param {*} payload 
 */
let createUserSession = async (criteriaForSession, userId, payload) => {
  payload.userId = userId;
  await SERVICES.sessionService.updateSession(criteriaForSession, payload);
};

/**
 * function to logout an user.
 */
userController.logout = async (payload) => {
  let criteria = {
    userId: payload.user._id,
    deviceId: payload.deviceId
  }, dataToUpdate = { $unset: { token: 1 } };
  await SERVICES.sessionService.updateSession(criteria, dataToUpdate);
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_OUT_SUCCESSFULLY);
};

/**
 * function to update user's profile
 */
userController.updateProfile = async (payload) => {
  let updatedUser = await SERVICES.userService.updateUser({ _id: payload.user._id }, payload, { ...NORMAL_PROJECTION, password: 0 });
  if (updatedUser) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_UPDATE_SUCCESSFULLY), { data: updatedUser });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * function to check user's previous account with provided email and send a confirmation link to that email to restore user's account.
 */
userController.checkAndSendRestoreAccountEmail = async (payload) => {
  let user = await SERVICES.userService.getUser({ email: payload.email, isDeleted: false });
  if (user._id.equals(payload.user._id)) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.THIS_EMAIL_IS_ALREADY_ASSOCIATED_TO_YOUR_CURRENT_ACCOUNT, ERROR_TYPES.BAD_REQUEST);
  }
  if (user) {
    user.newAccountId = payload.user._id;
    user.confirmationLink = createAccountRestoreLink(user);
    await sendEmail(user, EMAIL_TYPES.ACCOUNT_RESTORATION_EMAIL);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.CONFIRMATION_LINK_SENT_TO_YOUR_EMAIL);
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_USER_FOUND_WITH_THIS_EMAIL, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * function to restore user's account when user clicks the confirmation link from his email inbox.
 */
userController.restoreAccount = async (payload) => {
  let dataFromToken = jwt.verify(payload.token, SECURITY.JWT_SIGN_KEY);
  // update(soft-delete) user's previous account.
  let previousAccount = await SERVICES.userService.updateUser({ _id: dataFromToken.previousAccountId }, { $set: { isDeleted: true } }, { ...NORMAL_PROJECTION, isDeleted: 0 });

  // remove session of previous account if any.
  await SERVICES.sessionService.removeSession(previousAccount._id);

  // fetch the account in which user wants to transfer the previous account's data and also check if user already transfer the data from this account previously.
  let newAccount = await SERVICES.userService.getUser({ _id: dataFromToken.newAccountId });
  if (newAccount && newAccount.isRestored.status && newAccount.isRestored.from.equals(previousAccount._id)) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.YOU_HAVE_ALREADY_RESTORED_YOUR_ACCOUNT_FROM_THIS_ACCOUNT, ERROR_TYPES.BAD_REQUEST);
  }
  // transfer previous account data to new account of user.
  // TODO this can be change. (Which information needed to transfer according to requirements)
  let dataToTransfer = {
    email: previousAccount.email,
    name: previousAccount.name,
    country: previousAccount.country,
    city: previousAccount.city,
    isRestored: {
      status: true,
      from: previousAccount._id
    }
  };
  await SERVICES.userService.updateUser({ _id: dataFromToken.newAccountId }, dataToTransfer);
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.ACCOUNT_RESTORED_SUCCESSFULLY);
};

/**
 * function to get open rooms 
 */
userController.getOpenRooms = async () => {
  let criteria = { status: GAME_STATUSES.NOT_STARTED };
  let rooms = await SERVICES.roomService.getAllRooms(criteria, { _id: 1 }, { lean: true });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.OPEN_ROOMS_FETCHED_SUCCESSFULLY), { data: rooms });
};

/**
 * Function to get other user profile
 */
userController.getOtherUserProfile = async (payload) => {
  let criteria = { _id: payload.userId };
  let projection = { name: 1, email: 1, country: 1, city: 1, expPoints: 1, level: 1, rankValue: 1, rankType: 1, stars: 1, isLegend: 1, legendRank: 1, legendPoints: 1, totalGamesPlayed: 1, totalGameWon: 1, winRatio: 1, totalGamesLost: 1, totalGamesLeaved: 1, avtar: 1, image: 1 };
  let userInfo = await SERVICES.userService.getUserProfile(criteria, projection, { lean: true });
  if (!userInfo) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_USER_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  };
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_PROFILE_FETCHED_SUCCESSFULLY), { data: userInfo });
};

/**
 * Function to upload file.
 */
userController.uploadFile = async (payload) => {
  // check whether the request contains valid payload.
  if (!Object.keys(payload.file).length) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.FILE_REQUIRED_IN_PAYLOAD, ERROR_TYPES.BAD_REQUEST);
  }
  let pathToUpload = path.resolve(__dirname + `../../../..${CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL}`),
    pathOnServer = CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL;
  let fileUrl = await SERVICES.fileUploadService.uploadFile(payload, pathToUpload, pathOnServer);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY), { fileUrl });
};

/**
 * Function to add the user in black list
 */
userController.addToBlackList = async (payload) => {
  let dataToUpdate = { toId: payload.userId, fromId: payload.user._id };
  let criteria = { ...dataToUpdate };
  await SERVICES.userService.updateBlackList(criteria, dataToUpdate, { upsert: true });
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESSFULLY_ADDED_TO_BLACK_LIST);
};

/**
 * Function to delete user from blackList
 */
userController.removeFromBlackList = async (payload) => {
  let criteria = { fromId: payload.user._id, toId: payload.userId };
  await SERVICES.userService.deleteFromBlackList(criteria);
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESSFULLY_REMOVE_FROM_BLACK_LIST);
};

/**
 * Function to get blacklist
 */
userController.getBlackList = async (payload) => {
  let criteria = { fromId: payload.user._id };
  let balckList = await SERVICES.userService.getBlackList(criteria);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.BLACK_LIST_FETCHED_SUCCESSFULLY), { data: balckList });
};

/**
 * function to get chat history 
 */
userController.getChatHistory = async (payload) => {
  let criteria = { $or: [{ toId: payload.toUserId, fromId: payload.user._id }, { toId: payload.user._id, fromId: payload.toUserId }] };
  let chatHistory = await SERVICES.userService.getChatHistory(criteria);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHAT_HISTORY_FETCHED_SUCCESSFULLY), { data: chatHistory });
};

/**
 * Function to get user game stats.
 */
userController.getUserGameStats = async (payload) => {
  let userId = payload.user._id;
  let criteria = { _id: userId }, projection = { _id: 0, totalGamesPlayed: 1, totalGameWon: 1, totalGamesLost: 1, totalGamesLeaved: 1, totalNakedWin: 1, totalFlawlessWin: 1 };
  let userGameStats = await SERVICES.userService.getUser(criteria, projection, { lean: true });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.GAME_STATS_FETCHED_SUCCESSFULLY), { data: userGameStats });
};

/**
 * Function to add the profile images of the user.
 */
userController.addUserAvtar = async (payload) => {
  let userId = payload.user._id;
  let dataToSave = {
    userId,
    avtarUrl: payload.avtarUrl
  };
  //check is the first user avtar.
  let isAnyUserAvtarExist = await SERVICES.userAvtarService.getSingleAvtar({ userId });
  if (!isAnyUserAvtarExist) {
    dataToSave[`isDefault`] = true;
  };
  //save the avtar.
  let avtar = await SERVICES.userAvtarService.addAvtar(dataToSave);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.AVTAR_ADDED_SUCCESSFULLY), { data: { avtarId: avtar._id } });
};

//Function to set default user avtar.
userController.setDefaultUserAvtar = async (payload) => {
  let userId = payload.user._id;
  let criteria = { userId, _id: payload.avtarId };
  //check is avtart exists or not.
  let isAvtarExists = await SERVICES.userAvtarService.getSingleAvtar(criteria);
  if (!isAvtarExists) {
    return HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_AVTAR_ID, ERROR_TYPES.BAD_REQUEST);
  }
  let dataToUpdate = { $set: { isDefault: false } };
  await SERVICES.userAvtarService.updateAllAvtars({ userId }, dataToUpdate);
  dataToUpdate = { $set: { isDefault: true } };
  await SERVICES.userAvtarService.updateSingleAvtar(criteria, dataToUpdate);
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.AVTAR_SET_DEFAULT_SUCCESSFULLY);
};

//Function to get the user avtars and number of likes.
userController.getUserAvtars = async (payload) => {
  let avatrsInfo = await SERVICES.userAvtarService.getAllAvtarsInfo(payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.AVTARS_FETCHED_SUCCESSFULLY), { data: avatrsInfo });
};

//Function to get avtars of other user.
userController.getAvtarsOfAnotherUser = async (payload) => {
  let avtarsOfOtherUser = await SERVICES.userAvtarService.getAvtarOfOtherUser(payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.AVTARS_FETCHED_SUCCESSFULLY), { data: avtarsOfOtherUser });
};

//Function to like/unlike the avtar.
userController.likeUnlikeAvtar = async (payload) => {
  //check if your try to like itself. Then throw error.
  let isItselfAvtar = await SERVICES.userAvtarService.getSingleAvtar({ _id: payload.avtarId, userId: payload.user._id });
  if (isItselfAvtar) {
    return HELPERS.responseHelper.createErrorResponse(MESSAGES.SORRY_NOT_ALLOWED_TO_LIKE_OUR_PROFILE, ERROR_TYPES.BAD_REQUEST);
  };
  //check is user already liked.
  let isAlredyLiked = await SERVICES.userAvtarService.getSingleAvtar({ _id: payload.avtarId, 'userLiked.userId': payload.user._id });
  if (payload.isLike && isAlredyLiked) {
    return HELPERS.responseHelper.createErrorResponse(MESSAGES.YOU_ALREADY_LIKED_THIS_AVTAR, ERROR_TYPES.BAD_REQUEST);
  };
  if (!payload.isLike && !isAlredyLiked) {
    return HELPERS.responseHelper.createErrorResponse(MESSAGES.YOU_NOT_LIKED_THIS_AVTAR_YET, ERROR_TYPES.BAD_REQUEST);
  };
  let dataToUpdate = payload.isLike ? { $push: { userLiked: { userId: payload.user._id } } } : { $pull: { userLiked: { userId: payload.user._id } } };
  let updatedAvtar = await SERVICES.userAvtarService.updateSingleAvtar({ _id: payload.avtarId }, dataToUpdate, { new: true });
  if (updatedAvtar) {
    let dataToUpdateForUser = payload.isLike ? { $inc: { profileLikes: 1 } } : { $inc: { profileLikes: -1 } };
    await SERVICES.userService.updateUser({ _id: updatedAvtar.userId }, dataToUpdateForUser);
  }
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.AVTAR_LIKED_SUCCESSFULLY);
};

//Function to delete the avtar.
userController.deleteAvtar = async (payload) => {
  let userId = payload.user._id;
  let deletedAvtar = await SERVICES.userAvtarService.deleteAvtar({ _id: payload.avtarId, userId });
  if (!deletedAvtar) {
    return HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_AVTAR_ID, ERROR_TYPES.BAD_REQUEST);
  }
  if (deletedAvtar && deletedAvtar.userLiked && deletedAvtar.userLiked.length) {
    let dataToUpdateForUser = { $inc: { profileLikes: -(deletedAvtar.userLiked.length) } };
    await SERVICES.userService.updateUser({ _id: userId }, dataToUpdateForUser);
  };
  //If the deleted avtar is default avtar then set one avtar randomly default.
  if (deletedAvtar.isDefault) {
    await SERVICES.userAvtarService.updateSingleAvtar({ userId: payload.user._id }, { isDefault: true });
  };
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.AVTAR_DELETED_SUCCESSFULLY);
};

//Function to fetch the game history.
userController.getGameHistory = async (payload) => {
  let gameHistory = await SERVICES.userService.getUserGameHistory(payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.GAME_HISTORY_FETCHED_SUCCESSFULLY), { data: gameHistory });
};


/* export userController */
module.exports = userController;