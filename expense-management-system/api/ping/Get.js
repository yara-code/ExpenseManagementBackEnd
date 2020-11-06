'use strict';

module.exports.handler = (event, context, callback ) => {
    let response = {
        statusCode: 205,
        body: JSON.stringify({
            message: "Ping Successful",

        })
    };
    callback(null, response)
};
