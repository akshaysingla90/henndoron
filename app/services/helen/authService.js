const jwt = require('jsonwebtoken');

const { SECURITY, MESSAGES, ERROR_TYPES } = require('../../utils/constants');
const CONFIG = require('../../../config');
const HELPERS = require("../../helpers");
const { userModel, sessionModel, testUserModel } = require(`../../models`);

let authService = {};

/**
 * function to authenticate user.
 */
authService.userValidate = () => {
    return (request, response, next) => {
        validateUser(request).then((isAuthorized) => {
            if (isAuthorized) {
                return next();
            }
            let responseObject = HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        }).catch((err) => {
            let responseObject = HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        });
    };
};


/**
 * function to validate user's jwt token and fetch its details from the system. 
 * @param {} request 
 */
let validateUser = async (request) => {
    try {
        // return request.headers.authorization === SECURITY.STATIC_TOKEN_FOR_AUTHORIZATION
        // let decodedToken = jwt.verify(request.headers.authorization, SECURITY.JWT_SIGN_KEY);
        // let authenticatedUser = await testUserModel.findOne({ _id: decodedToken.id }).lean();
        let authenticatedUser = await userModel.findOne({ userName: request.headers.authorization }).lean();
        if (authenticatedUser) {
            request.user = authenticatedUser;
            return true;
        }
        return false;
    } catch (err) {
        return false;
    }
};

/**
 * function to validate user's token from samsung server if it is valid or not.
 */
authService.validateToken = async (token) => {
    let isValidToken = true;
    return isValidToken;
};

/**
 * function to authenticate socket users
 */
authService.socketAuthentication = async (socket, next) => {
    try {
        // const token = socket.handshake.query.authToken;
        const token = socket.handshake.query.userName;
        console.log(token);
        if (token) {
            // const socketUser = await sessionModel.findOne({ token: token}).lean();
            const socketUser = await userModel.findOne({ userName: token }).lean();
            if (socketUser) {
                // socket.id = socketUser.userId;
                socket.id = socketUser._id;
                console.log("socketId", socket.id);
                return next();
            }
            else {
                return next(new Error("Socket authentication Error"));
            }
        }
        return next(new Error("Socket authentication Error"));
    } catch (err) {
        return next(new Error("Socket unhandled authentication Error"));
    }
};

module.exports = authService;