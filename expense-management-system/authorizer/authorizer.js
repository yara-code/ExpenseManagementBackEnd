
const sessionLib = require('./lib/Session');
const dates = require('../model/dates');
const keys = require("../env")

const db = require(keys().DB);
const helper = require(keys().mHeler);
const MongoClient = require('mongodb').MongoClient;
const url = keys().mongoUrl;
const Sessions = db.AuthSessions();

module.exports.handler = (event, context, callback) => {
  var currentSession;
  console.log(`event.header : ${JSON.stringify(event.headers, null, 3)}`);
  if(!event.headers.authorizationtoken) {
    callback(true, {statusCode: 400, body: JSON.stringify({'errorMessage' : 'Unauthorized - no auth token'})})
  }  else {
      
    let sessionPromise = Promise.resolve(sessionLib.decodeSession( event.headers.authorizationtoken ));
    sessionPromise
        .then((session )=>{
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;

                //Set open connection to mongodb:
                let dbo = db.db("EMS-DB");

                return Promise.resolve(session)
                    .then( session => {
                        return Promise.resolve(Sessions.findOne(dbo, {sessionId:  session.encoded}))
                            .catch((error ) => {
                                console.log(`error : ${JSON.stringify(error, null, 3)}`);
                                return Promise.reject(error)
                            })
                    })
                    .then( (session ) => {
                        if(session.length == 0){
                            callback(true, {statusCode: 400, body: JSON.stringify({"errorMessage": "Unauthorized - no session"})});
                        } else {

                            // TODO: need to check if session is still alive
                            // This will be a back up just incase document is not removed in time but expires
                            if (dates.expiredCheck(session.expires)){
                                callback(true, {statusCode: 400, body: JSON.stringify({"errorMessage": "Unauthorized - expiried session"})});
                            } else {
                                // TODO: need to extend expiration time:

                                let updatedHitCount = session.hits + 1;
                                let updatedExpires = dates.addMinutes( undefined, 30);
                                // updatedExpires = new Date(updatedExpires);

                                let $set = {$set: {hits : updatedHitCount, expires : updatedExpires}};
                                // do not wait for this to return just continue with the request:
                                Sessions.update(dbo, session._id, $set)
                                    .then((results) => {
                                        // turn on if you need to debug authorization
                                        // console.log(`results from updating a session : ${JSON.stringify(results, null, 3)}`);
                                    });


                                // console.log(`session : ${JSON.stringify(session, null, 3)}`);

                                let result = {
                                    "accountId" : session.accountId ? session.accountId : session.account,
                                    "sessionId" : session.sessionId,
                                    "credential": session.credential,
                                    "id"        : session._id
                                };

                                // console.log(`Returning Session : ---------->`);
                                // console.log(`results : ${JSON.stringify(result, null, 3)}`);
                                callback(null, result)
                            }
                        }
                    })
                    .catch( error => {
                        console.error(`Error: ${error}`);
                        callback(true, {statusCode: 400, body: JSON.stringify({"errorMessage": "Internal Server Error."}) })
                    })

            });// mongo Client
        })
  }
};
