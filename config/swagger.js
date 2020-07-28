const { AVAILABLE_AUTHS } = require('../app/utils/constants');
let swaggerConfig = {
  "swagger": "2.0",
  "info": {
    "version": "2.0.0",
    "title": "Helen Aplication",
    "description": "Project",
    "termsOfService": "http://swagger.io/terms/",
    "contact": {
      "name": "Chicmic Team"
    },
    "license": {
      "name": "MIT"
    }
  },
  "paths": {},
  "definitions": {},
  "schemes": [
    "http",
    "https"
  ],
  "consumes": [
    "application/json"
  ],
  "produces": [
    "application/json"
  ],
  "securityDefinitions": {}// security definitions can be multiple
};

/** Adding Security definitions Header for each Auth */
Object.keys(AVAILABLE_AUTHS).forEach(auth => {
  swaggerConfig.securityDefinitions[`${AVAILABLE_AUTHS[auth]}TokenHeader`] = {
    "type": "apiKey",
    "name": "authorization",
    "in": "header"
  }
});

module.exports = swaggerConfig;
