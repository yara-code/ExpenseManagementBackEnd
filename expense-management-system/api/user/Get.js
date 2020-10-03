'use strict';

module.exports.handler = (event, context, callback ) => {
    console.log(`event.pathParameters : ${JSON.stringify(event.pathParameters, null, 3)}`);

    let response = {
        statusCode: 200,
        body: JSON.stringify({
            message: {
                user: "User Info",
                moreData: "Testing data"
            },

        })
    };
    callback(null, response)
};
