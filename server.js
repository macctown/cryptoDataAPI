var server = require('./config/initializers/app');
var database = require('./config/initializers/database');
var async = require('async');
var logger = require('./utils/log/logger');

logger.info('[Server] Starting ' + process.env.SERVICE_NAME + ' initialization');

async.series([
        database,
        server,
    ], function(err) {
        if (err) {
            logger.error(process.env.SERVICE_NAME + ' initialization FAILED', err);
        } else {
            logger.info(process.env.SERVICE_NAME + ' initialized SUCCESSFULLY');
        }
    }
);