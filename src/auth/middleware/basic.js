'use strict';

const base64 = require('base-64');
const Users = require('../models/users.js');

function basic(req, res, next) {
  if (req.headers.authorization) {
    let auth = req.headers.authorization.split(' ');
    let encoded = auth.pop();
    let decoded = base64.decode(encoded);
    let [username, password] = decoded.split(':');
    Users.authenticateBasic(username, password)
      .then((userData) => {
        req.user = userData;
        next();
      }
      ).catch(() => {
        next('Invalid User');
      }
      );
  }
}

module.exports = basic;