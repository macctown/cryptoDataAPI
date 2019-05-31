const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATA_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: 3306
});

module.exports = sequelize;