'use strict';

require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize, DataTypes } = require('./index');
const SECRET = process.env.API_SECRET || 'secret';

const users = sequelize.define('users', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.VIRTUAL,
  }
});

users.authenticateBasic = async function (username, password) {
  const user = await users.findOne({ where: { username: username } });
  const valid = await bcrypt.compare(password, user.password);
  if (valid) {
    let newToken = jwt.sign({ username: user.username }, SECRET, { expiresIn: '15m' });
    user.token = newToken;
    return user;
  }
  else {
    throw new Error('Invalid User');
  }
}

users.authenticateToken = async function (token) {
  const decoded = jwt.verify(token, SECRET);
  const user = await users.findOne({ where: { username: decoded.username } });
  if (user.username) {
    return user;
  }
  else {
    throw new Error('Invalid Token');
  }
}

module.exports = users;