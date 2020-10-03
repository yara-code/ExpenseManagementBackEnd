'use strict';

module.exports.handler = (event, context, callback ) => {
    let response = {
        statusCode: 200,
        body: JSON.stringify({
            message: "Post Auth"
        })
    };
    callback(null, response)
};