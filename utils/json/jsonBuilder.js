var logger = require('../log/logger.js');

var builder = module.exports;

builder.buildResponse = function buildResponse(apiName, statusCode, result, error) {

	var resStatus;
	if(statusCode < 300){
		resStatus = {
			statusCode: statusCode,
            errors: error==null ? "" : error
        }
		logger.info('[SERVER] '+ apiName +' Successfully');
	}
	else{
		resStatus = {
			statusCode: statusCode,
			errors:error==null ? "" : error
		}
		logger.error('[SERVER] '+ apiName +' Failed');
	}


	var res = {
		status: resStatus,
		result: result == null ? "" : result
	}

	return res;
}
