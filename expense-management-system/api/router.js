
/*
*
*  All RESTful Endpoints will be routed through here
*
*/
'use strict';
const Endpoints = require('../endpoints');
const helper = require('../model/helper');


let instance = {

    resource: (resource, callback) => {

        // get json file with endpoint routing info:
        let endpoints = Endpoints;

        let path = [];
        endpoints.forEach((endpoint) => { // go through each endpoint until one is found
            if(endpoint.path == resource){
                path.push(endpoint);
            }
        });
        if (path.length !== 0){
            callback(false, path)
        } else {
            callback(true, {statusCode: 404, body: JSON.stringify({"errorMessage" : "Path does not exist."})})
        }
    }

};


module.exports.handler =  (event, context, callback) => {

    if (!event.resource){
        // Check if resource is present in event if not end call
        callback(null, {statusCode: 500, body: {"errorMessage": "Internal Server Error."}})
    } else {
        instance.resource(event.resource, (err, path) => {
            console.log(`err : ${JSON.stringify(err, null, 3)}`);
            console.log(`path : ${JSON.stringify(path, null, 3)}`);
            if(err){
                callback(null, path)
            } else {
                // parse body just in case:
                event.body = helper().objectParse(event.body);
                if(path[0].auth) {
                    // // send to authorizer first and add session to event : ---> event.session
                    const auth = require('../authorizer/authorizer').handler;
                    auth(event, context, (err, results) => {
                        if(err) {
                            callback(null, results)
                        } else {
                            // attach session to event:
                            results.accountId = results.accountId.toString(); // typeof was returning object, changing to string
                            event.session = results;
                            // console.log(`event.session : ${JSON.stringify(event.session, null, 3)}`);
                            const route = require(`../${path[0].require}`).handler;
                            console.log(`routing to correct path----------> : `);
                            route(event, context, (err, results ) => {
                                callback(null,{statusCode : results.statusCode, body: results.body});
                            })
                        }
                    })
                } else {
                    const route = require(`../${path[0].require}`).handler;
                    route(event, context, (err, results ) => {
                        callback(null,{statusCode : results.statusCode, body: results.body});
                    })
                }

            }
        })
    }

};












