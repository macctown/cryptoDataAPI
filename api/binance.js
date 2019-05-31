var jsonBuilder = require('../utils/json/jsonBuilder');
var sequelize = require('../config/dataInstance');
var url = require('url');
var async = require("async");
var DB_LAST_MONTH = 2;
var DB_LAST_YEAR = 2019;
var HARD_LIMIT = 1000;

var binanceController = {

    getTrades: function (req, res) {
        var query = url.parse(req.url,true).query;

        //required
        var base = req.params.base;
        var quote = req.params.quote;
        var fromTime = query.fromTime;

        //optional
        var limit = query.limit == null ? 1000 : query.limit;

        if( base == null || base == undefined || base.length == 0){
            response = jsonBuilder.buildResponse('getBinanceHistoricalTrades', 400, null, 'base is required');
            res.send(response);
        }

        if( quote == null || quote == undefined || quote.length == 0){
            response = jsonBuilder.buildResponse('getBinanceHistoricalTrades', 400, null, 'quote is required');
            res.send(response);
        }

        if( fromTime == null || fromTime == undefined || fromTime.length == 0){
            response = jsonBuilder.buildResponse('getBinanceHistoricalTrades', 400, null, 'fromTime is required');
            res.send(response);
        }

        if (limit > HARD_LIMIT) {
            response = jsonBuilder.buildResponse('getBinanceHistoricalTrades', 400, null, 'limit can not be larget than ' + HARD_LIMIT);
            res.send(response);
        }

        var fromDateTime = new Date(fromTime);
        var fromTimestamp = "time > " + fromDateTime.getTime();
        var month = fromTime.split("-")[1];
        var next_month = parseInt(month) + 1 < 10 ? "0"+ (parseInt(month) + 1).toString() : parseInt(month) + 1;
        var year = parseInt(fromTime.split("-")[0]);
        var next_year = month !== "12" ? year : year + 1;

        var tableName = base + "_" + quote + "_" + "BINANCE" + "_" + month + "_" + year + "_" + "TXNS";
        var nextTableName = base + "_" + quote + "_" + "BINANCE" + "_" + next_month + "_" + next_year + "_" + "TXNS";

        async.waterfall([
            function(callback) {
                sequelize.query("SELECT * FROM "+tableName+" WHERE " +fromTimestamp+" LIMIT " + limit).spread((results, metadata) => {
                    if(results == null){
                        callback(null, null, true);
                    }else{
                        callback(null, results, true);
                    }
                }).catch(function (err) {
                    callback(null, err, false);
                });
            },
            function(results, isSuccess, callback) {
                if (!isSuccess) {
                    callback(results, null, null);
                } else if (results == null) {
                    callback(null, null, null);
                } else if (results.length < limit && (year < DB_LAST_YEAR || (year == DB_LAST_YEAR && parseInt(month) < DB_LAST_MONTH))) {
                    limit = limit - results.length;
                    sequelize.query("SELECT * FROM "+nextTableName+ " LIMIT " + limit).spread((newResults, metadata) => {
                        if(newResults == null){
                            callback(null, results, null);
                        }else{
                            callback(null, results, newResults);
                        }
                    }).catch(function (newErr) {
                        callback(newErr, null, null);
                    });
                } else {
                    callback(null, results, null);
                }
            }
        ], function (err, result1, result2) {
            if (err) {
                if (err.parent.code === "ER_NO_SUCH_TABLE") {
                    response = jsonBuilder.buildResponse('getBinanceHistoricalTrades', 404, null, "There's no records meet your criteria. Please check your input base, quote, interval and time range.");
                } else {
                    response = jsonBuilder.buildResponse('getBinanceHistoricalTrades', 500, null, err);
                }
            } else {
                if (result1 == null) {
                    response = jsonBuilder.buildResponse('getBinanceHistoricalTrades', 404, result1, null);
                } else {
                    result = result2 == null ? result1 : result1.concat(result2);
                    response = jsonBuilder.buildResponse('getBinanceHistoricalTrades', 200, result, null);
                }
            }
            res.send(response);
        });
    },

    getCandles: function(req, res){

        var query = url.parse(req.url,true).query;

        //required
        var base = req.params.base;
        var quote = req.params.quote;
        var interval = req.params.interval;
        var fromTime = query.fromTime;

        //optional
        var limit = query.limit == null ? 1000 : query.limit;

        if( base == null || base == undefined || base.length == 0){
            response = jsonBuilder.buildResponse('getCandles', 502, null, 'base is required');
            res.send(response);
        }

        if( quote == null || quote == undefined || quote.length == 0){
            response = jsonBuilder.buildResponse('getBinanceCandles', 400, null, 'quote is required');
            res.send(response);
        }

        if( interval == null || interval == undefined || interval.length == 0){
            response = jsonBuilder.buildResponse('getBinanceCandles', 400, null, 'interval is required');
            res.send(response);
        }

        if( fromTime == null || fromTime == undefined || fromTime.length == 0){
            response = jsonBuilder.buildResponse('getBinanceCandles', 400, null, 'fromTime is required');
            res.send(response);
        }

        if (limit > HARD_LIMIT) {
            response = jsonBuilder.buildResponse('getBinanceCandles', 400, null, 'limit can not be larget than ' + HARD_LIMIT);
            res.send(response);
        }

        var fromDateTime = new Date(fromTime);
        var fromTimestamp = "openTime > " + fromDateTime.getTime();
        var month = fromTime.split("-")[1];
        var next_month = parseInt(month) + 1 < 10 ? "0"+ (parseInt(month) + 1).toString() : parseInt(month) + 1;
        var year = parseInt(fromTime.split("-")[0]);
        var next_year = month !== "12" ? year : year + 1;

        var tableName = base + "_" + quote + "_" + "BINANCE" + "_" + month + "_" + year + "_" + interval + "_CANDLES";
        var nextTableName = base + "_" + quote + "_" + "BINANCE" + "_" + next_month + "_" + next_year + "_" + interval + "_CANDLES";

        async.waterfall([
            function(callback) {
                sequelize.query("SELECT * FROM "+tableName+" WHERE " +fromTimestamp+" LIMIT " + limit).spread((results, metadata) => {
                    if(results == null){
                        callback(null, null, true);
                    }else{
                        callback(null, results, true);
                    }
                }).catch(function (err) {
                    callback(null, err, false);
                });
            },
            function(results, isSuccess, callback) {
                if (!isSuccess) {
                    callback(results, null, null);
                } else if (results == null) {
                    callback(null, null, null);
                } else if (results.length < limit && (year < DB_LAST_YEAR || (year == DB_LAST_YEAR && parseInt(month) < DB_LAST_MONTH))) {
                    limit = limit - results.length;
                    sequelize.query("SELECT * FROM "+nextTableName+ " LIMIT " + limit).spread((newResults, metadata) => {
                        if(newResults == null){
                            callback(null, results, null);
                        }else{
                            callback(null, results, newResults);
                        }
                    }).catch(function (newErr) {
                        callback(newErr, null, null);
                    });
                } else {
                    callback(null, results, null);
                }
            }
        ], function (err, result1, result2) {
            if (err) {
                if (err.parent.code === "ER_NO_SUCH_TABLE") {
                    response = jsonBuilder.buildResponse('getBinanceCandles', 404, null, "There's no records meet your criteria. Please check your input base, quote, interval and time range.");
                } else {
                    response = jsonBuilder.buildResponse('getBinanceCandles', 500, null, err);
                }
            } else {
                if (result1 == null) {
                    response = jsonBuilder.buildResponse('getBinanceCandles', 404, result1, null);
                } else {
                    result = result2 == null ? result1 : result1.concat(result2);
                    response = jsonBuilder.buildResponse('getBinanceCandles', 200, result, null);
                }
            }
            res.send(response);
        });
    },

    getOrderBooks: function (req, res) {
        var query = url.parse(req.url, true).query;

        //required
        var base = req.params.base;
        var quote = req.params.quote;
        var depth = req.params.depth;

        //optional
        var limit = query.limit == null ? 1000 : query.limit;
        var fromTime = query.fromTime;

        if (base == null || base == undefined || base.length == 0) {
            response = jsonBuilder.buildResponse('getBinanceOrderBooks', 400, null, 'base is required');
            res.send(response);
        }

        if (depth == null || depth == undefined || depth.length == 0) {
            response = jsonBuilder.buildResponse('getBinanceOrderBooks', 400, null, 'depth is required');
            res.send(response);
        }

        if (quote == null || quote == undefined || quote.length == 0) {
            response = jsonBuilder.buildResponse('getBinanceOrderBooks', 400, null, 'quote is required');
            res.send(response);
        }

        if (limit > HARD_LIMIT) {
            response = jsonBuilder.buildResponse('getBinanceOrderBooks', 400, null, 'limit can not be larget than ' + HARD_LIMIT);
            res.send(response);
        }

        var fromTimestamp = "";
        if (fromTime != undefined && fromTime != null) {
            var fromDateTime = new Date(fromTime);
            fromTimestamp = "WHERE timestamp > " + fromDateTime.getTime();
        }

        var tableName = base + "_" + quote + "_" + depth + "_" + "BINANCE" + "_" + "ORDER_BOOKS";
        sequelize.query("SELECT * FROM " + tableName + " " + fromTimestamp + " LIMIT " + limit).spread((results, metadata) => {
            if (results == null) {
                response = jsonBuilder.buildResponse('getBinanceOrderBooks', 404, null, null);
            } else {
                response = jsonBuilder.buildResponse('getBinanceOrderBooks', 200, results, null);
            }
            res.send(response);
        }).catch(function (err) {
            if (err.parent.code === "ER_NO_SUCH_TABLE") {
                response = jsonBuilder.buildResponse('getBinanceOrderBooks', 404, null, "There's no records meet your criteria. Please check your input base, quote, interval and time range.");
            } else {
                response = jsonBuilder.buildResponse('getBinanceOrderBooks', 500, null, err);
            }
            res.send(response);
        });

    }
};

module.exports = binanceController;