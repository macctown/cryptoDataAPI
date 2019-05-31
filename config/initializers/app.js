/**
 * Module dependencies.
 */
var express = require('express');
var session = require('express-session');
var lusca = require('lusca');
var dotenv = require('dotenv');
var swStats = require('swagger-stats');
var apiSpec = require('../../swagger.json');
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

var path = require('path');
var logger = require('../../utils/log/logger');
var bodyParser = require('body-parser');

/**
 * Create Express server.
 */
var app = express();

/**
 * Express configuration.
 */
var start =  function(callback) {
    "use strict";
    app.listen(process.env.PORT || 8081);

    logger.info(process.env.SERVICE_NAME + ' HTTP Server Listening on Port ' + (process.env.PORT || 8081));

    logger.info(process.env.SERVICE_NAME + ' Initializing view engine');

    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
    }));

    app.use(lusca.xframe('SAMEORIGIN'));
    app.use(lusca.xssProtection(true));

    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(swStats.getMiddleware({swaggerSpec:apiSpec}));

    // Introduce routes
    logger.info(process.env.SERVICE_NAME + ' Initializing api routes');
    require('../../api/index')(app, logger);

    // Error handler
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: (app.get('env') === 'development' ? err : {})
        });

        logger.error(process.env.SERVICE_NAME + ' 500 Error: Internal Server Error');
        next(err);
    });

    if (callback) {
        return callback();
    }
};

module.exports = start;