'use strict';

const { Joi } = require('../../../utils/joiUtils');
const CONFIG = require('../../../../config');
const { AVAILABLE_AUTHS } = require(`../../../utils/constants`);
//load controllers
const { getServerResponse, registerNewUser, loginUser, getUserProfile, socialLogin, logout, updateProfile, checkAndSendRestoreAccountEmail, restoreAccount, getOpenRooms, getOtherUserProfile, uploadFile, addToBlackList, removeFromBlackList, getBlackList, getChatHistory, getUserGameStats, addUserAvtar, setDefaultUserAvtar, getUserAvtars, getAvtarsOfAnotherUser, likeUnlikeAvtar, deleteAvtar, getGameHistory } = require(`../../../controllers/${CONFIG.PLATFORM}/userController`);

let routes = [
	{
		method: 'GET',
		path: '/v1/serverResponse/',
		joiSchemaForSwagger: {
			group: 'User',
			description: 'Route to get server response (Is server working fine or not?).',
			model: 'SERVER'
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: getServerResponse
	},
	{
		method: 'POST',
		path: '/v1/user/register',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().required().description('User\'s email.'),
				password: Joi.string().required().description('User\'s password.'),
				name: Joi.string().required().description('User\'s name.'),
				country: Joi.string().required().description('User\'s country.'),
				city: Joi.string().required().description('User\'s city.'),
				// tc: Joi.string().required().description('User\'s tc.'),
				// userType: Joi.string().required().description('User\'s type.')
				avtar: Joi.string().optional().description('Url of avtar.'),
				image: Joi.string().optional().description('Url of image.')
			},
			group: 'User',
			description: 'Route to register a user.',
			model: 'Register'
		},
		handler: registerNewUser
	},
	{
		method: 'POST',
		path: '/v1/user/login',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().required().description('User\'s email Id.'),
				password: Joi.string().required().description('User\'s password.')
			},
			group: 'User',
			description: 'Route to login a user.',
			model: 'Login'
		},
		handler: loginUser
	}
];

module.exports = routes;




