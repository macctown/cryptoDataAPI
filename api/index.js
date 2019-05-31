/**
 * Controllers (route handlers).
 */
var isAuthenticate = require('../auth/isAuthenticate');
var binanceController = require('./binance');
var bitfinexController = require('./bitfinex');

const API_PREFIX = "/api/v1";

module.exports = function(app, logger) {
    "use strict";

    /**
     * Primary api routes.
     */
    app.get(API_PREFIX+'/binance/historicalTrades/:base/:quote', isAuthenticate, binanceController.getTrades);
    app.get(API_PREFIX+'/binance/candles/:base/:quote/:interval', isAuthenticate, binanceController.getCandles);
    app.get(API_PREFIX+'/binance/orderBooks/:base/:quote/:depth', isAuthenticate, binanceController.getOrderBooks);

    app.get(API_PREFIX+'/bitfinex/historicalTrades/:base/:quote', isAuthenticate, bitfinexController.getTrades);
    app.get(API_PREFIX+'/bitfinex/candles/:base/:quote/:interval', isAuthenticate, bitfinexController.getCandles);
    app.get(API_PREFIX+'/bitfinex/orderBooks/:base/:quote/:depth', isAuthenticate, bitfinexController.getOrderBooks);

    // Set 404 response for non-exist api routes
    app.use(function(req, res, next) {
        var err = new Error('Routes Request URL Not Found');
        err.status = 404;
        logger.warn('[SERVER] 404 NOT FOUND: Received request ('+ req.pathname +') can not be found');
        next(err);
    });
};