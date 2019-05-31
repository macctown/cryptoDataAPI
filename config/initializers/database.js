var Sequelize = require('Sequelize');
var logger = require('../../utils/log/logger');
var dataDB = require('../dataInstance');

var start = function(callback) {

    const sequelize = new Sequelize(process.env.DB_DATA_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: 3306
    });

    sequelize.authenticate()
        .then(() => {
            logger.info('MYSQL DB Connection is Created on : ' + process.env.DB_HOST);
            dataDB.sync();
            logger.info('MYSQL DATA DB Sync successfully.');
        })
        .catch(err => {
            console.error('MYSQL DB Connection has error:', err);
        });

    callback()
};

module.exports = start;