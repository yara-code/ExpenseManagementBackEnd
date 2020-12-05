/*
*
*   
*
* */

const db = require('../../mongoFiles/collection');
const AuthSession = db.AuthSessions();

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://EMS-Admin:PUuABNm2m0ZUZhkA@cluster0.fqgbv.mongodb.net/EMS-DB?retryWrites=true&w=majority";

module.exports.handler = (event, context, callback ) => {

    Promise.resolve()
        .then(()=>{
            if(!event.pathParameters.userid) {
                return Promise.reject("Missing id in url.");
            }
            return Promise.resolve();
        })
        .then(()=>{
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;

                //Set open connection to mongodb:
                let dbo = db.db("EMS-DB");

                return Promise.resolve()
                    .then(()=>{
                        if (event.session.accountId !== event.pathParameters.userid){
                            return Promise.reject("Id does not match session id.")
                        } else {
                            return Promise.resolve(AuthSession.delete(dbo, event.session.id))
                                .then((results ) => {
                                    db.close();
                                    callback(null, {statusCode: 200, body: JSON.stringify({"message" : "Successfully deleted session."})});
                                })
                        }
                    })
                    .catch((error ) => {
                        db.close();
                        callback(null, {statusCode: 400, body: JSON.stringify({"errorMessage": error})})
                    })

            });// mongo Client
        })
}