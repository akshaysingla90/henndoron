'use strict';

const { Joi } = require('../../../utils/joiUtils');
const CONFIG = require('../../../../config');
const { AVAILABLE_AUTHS } = require(`../../../utils/constants`);
//load controllers
const { getServerResponse, loginUser, createAndUpdateUser } = require(`../../../controllers/${CONFIG.PLATFORM}/userController`);

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
		path: '/v1/user/',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().optional().description('User\'s email.'),
				password: Joi.string().optional().description('User\'s password.'),
				userName: Joi.string().optional().description('User\'s user name.'),
				firstName: Joi.string().optional().description('User\'s first name.'),
				lastName: Joi.string().optional().description('User\'s last name.'),
				contactNumber: Joi.string().optional().description('User\'s contact number.'),
				operationType: Joi.number().required().description('Operation type. 1 for create, 2 for update & 3 for delete.')
			},
			group: 'User',
			description: 'Route to create/update/Delete a user.',
			model: 'CRUD_USER'
		},
		handler: createAndUpdateUser
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




