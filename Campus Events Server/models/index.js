'use strict';

const Sequelize = require('sequelize');
const process = require('process');
require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const initModels = require('./init-models');
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(process.env.DB_NAME || config.database, process.env.DB_USER || config.username, process.env.DB_PASS || config.password, {
    ...config,
    host: process.env.DB_HOST || config.host,
    dialect: process.env.DB_DIALECT || config.dialect,
    port: process.env.DB_PORT || config.port
  });
}

// Initialize all models and associations using the sequelize-auto generated file
const models = initModels(sequelize);
Object.assign(db, models);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
