'use strict';

const Users = require('../models/users.js');

function bearer(req, res, next) {
  if (req.headers.authorization) {
    const auth = req.headers.authorization.split(' ')[1];
    Users.authenticateToken(auth)
      .then((userData) => {
        req.user = userData;
        next();
      }
      ).catch(() => {
        next('Invalid Token');
      }
      );
  }
}

module.exports = bearer;