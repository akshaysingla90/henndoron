'use strict';

let CONSTANTS = {};

CONSTANTS.SERVER = {
  ONE: 1
};


CONSTANTS.USER_ROLE = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',

};

CONSTANTS.RESOURCE_TYPE = {
  SPRITE: { VALUE: 1, BASE_PATH: 'res/Sprite/' },
  SOUND: { VALUE: 2, BASE_PATH: 'res/Sound/' },
  ANIMATION_FRAMES: { VALUE: 3, BASE_PATH: 'res/AnimationFrames/' }
};

CONSTANTS.ACTIVITY_TYPE = {
  SMALL: 1,
  MEDIUM: 2,
  GAME: 3
};

CONSTANTS.ACTIVITY_STATUS = {
  DRAFT:2,
  TEMPLATE: 1,
  PUBLISHED:3
};

CONSTANTS.PASSWORD_PATTER_REGEX = /^(?=.{6,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

CONSTANTS.NORMAL_PROJECTION = { __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 };

CONSTANTS.MESSAGES = require('./messages');

CONSTANTS.SECURITY = {
  JWT_SIGN_KEY: 'fasdkfjklandfkdsfjladsfodfafjalfadsfkads',
  BCRYPT_SALT: 8,
  STATIC_TOKEN_FOR_AUTHORIZATION: '58dde3df315587b279edc3f5eeb98145'
};

CONSTANTS.ERROR_TYPES = {
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  MONGO_EXCEPTION: 'MONGO_EXCEPTION',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SOCKET_ERROR: 'SOCKET_ERROR',
  INVALID_MOVE: 'invalidMove'
};

CONSTANTS.LOGIN_TYPES = {
  NORMAL: 1,
  GOOGLE_PLAY: 2,
  GAME_CENTER: 3
};

CONSTANTS.EMAIL_TYPES = {
  ACCOUNT_RESTORATION_EMAIL: 1
};

CONSTANTS.EMAIL_SUBJECTS = {
  ACCOUNT_RESTORATION_EMAIL: 'Account restoration email'
};

CONSTANTS.EMAIL_CONTENTS = {
  ACCOUNT_RESTORATION_EMAIL: `<p>Hello<span style="color: #3366ff;"> <strong>{{name}}</strong></span>,</p><p>Restore your account by clicking on the link<span style="color: #3366ff;"><strong></p><a href={{confirmationLink}} target="_blank">Confirm here</a><p>Regards,<br>
  Team Helen</p>`
};

CONSTANTS.SOCKET_EVENTS = {
  DISCONNECT: 'disconnect',
  CONNECTION: 'connection',
  REMOVE_CARD_FROM_QUEUE: 'removeCardFromQueue',
  DISABLE_STUDENT_INTERATION: 'disableStudentInteraction',
  ADD_CARD_TO_QUEUE: 'addCardToQueue',
  DISABLE_INTERACTION: 'disableInteraction',
  RECEIVE_GRADES: 'receiveGrades',
  FLASH_CARDS_NEXT_ITEM: 'flashCardsNextItem',
  PLAYER_CHRACTER_CONVERSATION: 'playCharacterConversation',
  SHOW_FLASH_CARD: 'showFlashCard',
  LAUNCH_ACTIVITY: 'launchActivity',
  CREATE_ROOM: 'createRoom',
  JOIN_ROOM: 'joinRoom',
  ROOM_DATA: 'roomData',
  EXIT_ROOM: 'exitRoom',
  SOCKET_ERROR: 'socketError',
  STUDENT_STATUS: 'studentStatus',
  SYNC_DATA: 'syncData',
  RECONNECTED_SERVER: 'reconnectedServer',
  SWITCH_TURN_BY_TEACHER: 'switchTurnByTeacher',
  SWITCH_TURN_BY_STUDENT: 'switchTurnByStudent',
  STUDENT_TURN: 'studentTurn',
  UPDATE_ROOM_DATA: 'updateRoomData',
  COMPLETE_LEASSON: 'completeLesson',
  LIST_OF_ROOMS: 'listOfRooms',
  REWARD_POINTS: 'rewardPoints'
};

CONSTANTS.MAX_LIMITS_OF_USERS_FOR_SINGLE_ROOM = 4;

CONSTANTS.OPERATION_TYPES = {
  CREATE: 1,
  UPDATE: 2,
  DELETE: 3
};

CONSTANTS.AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS = ['csv', 'png'];

CONSTANTS.PAGINATION = {
  DEFAULT_LIMIT: 10,
  DEFAULT_NUMBER_OF_DOCUMENTS_TO_SKIP: 0
};

CONSTANTS.LESSON_STATUS = {
  ON_GOING: 1,
  COMPLETE: 2,
  DRAFT: 3,
  PUBLISHED: 4
};



CONSTANTS.SOCKET_EVENTS_TYPES = {
  GAME_MESSAGE: 1000,
  REMOVE_CARD_FROM_QUEUE: 1,
  DISABLE_STUDENT_INTERATION: 2,
  ADD_CARD_TO_QUEUE: 3,
  DISABLE_INTERACTION: 4,
  RECEIVE_GRADES: 5,
  FLASH_CARDS_NEXT_ITEM: 6,
  PLAYER_CHRACTER_CONVERSATION: 7,
  SHOW_FLASH_CARD: 8,
  LAUNCH_ACTIVITY: 9,
  CREATE_ROOM: 10,
  JOIN_ROOM: 11,
  ROOM_DATA: 12,
  SOCKET_ERROR: 13,
  STUDENT_STATUS: 14,
  SYNC_DATA: 15,
  SWITCH_TURN_BY_TEACHER: 16,
  SWITCH_TURN_BY_STUDENT: 17,
  STUDENT_TURN: 18,
  UPDATE_ROOM_DATA: 19,
  COMPLETE_LESSON: 20,
  MODIFY_ROOM_DATA: 21,
  STUDENT_REWARDS: 22,
  SAVE_GAME_DATA: 23
};

CONSTANTS.SOCKET_OPERATIONS = {
  INSERT: 1,
  REMOVE: 2,
  CLEAR: 3,
  CHANGE_INDEX: 4
};

CONSTANTS.USER_TYPES = {
  TEACHER: 1,
  STUDENT: 2
};

module.exports = CONSTANTS;
