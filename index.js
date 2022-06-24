'use strict';
require('dotenv').config();
const PORT = process.env.PORT || 3050;
const server = require('./src/server.js');

const { sequelize } = require('./src/auth/models/index.js');

sequelize.sync().then(() => {
  server.startup(PORT);
}).catch((err) => {
  console.log(err);
}
);