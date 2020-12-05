/*
*
*   Creating a new account:
*
* */

const db = require('../../mongoFiles/collection');
const helper = require('../../model/helper');
const Accounts = db.Accounts();
const AuthCredentials = db.AuthCredentials();
const dates = require('../../model/dates');
const Password = require('../../model/password');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://EMS-Admin:PUuABNm2m0ZUZhkA@cluster0.fqgbv.mongodb.net/EMS-DB?retryWrites=true&w=majority";

module.exports.handler = (event, context, callback ) => {

    const body = event.body;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        //Set open connection to mongodb:
        let dbo = db.db("EMS-DB");

        // Filter search
        let filter = {
            $or: [
                {'username': setRegex(body.username)},
                {'email': setRegex(body.email)},
            ]
        };

        return Promise.resolve()
            .then(()=>{
                // TODO: FIND --->
                return Promise.resolve(Accounts.find(dbo, filter))
                    .then((results ) => {
                        // TODO: NO errors, close db connection then callback to return data
                        body.accountId = results._id; // add accountID to auth creds update db
                        AuthCredentials.update(event.creds._id, {$set : {accountId: body.accountId} });
                        body.responseMessage =  "Account Created Successfully";
                        db.close();
                        callback(null, {statusCode: 200, body: JSON.stringify(body)});
                    })
                    .catch ((error ) => {
                        // TODO: ERRORS Clsoe db and callback response
                        db.close();
                        callback(null, {statusCode: 404, body: JSON.stringify({"errorMessage" : error })});
                    })
            });
    });// mongo Client
}
setRegex =  (queryValue)=>{
    let value = encodeURIComponent(queryValue)
        .replace("%2F","\\%2F")
        .replace("%2B","\\\%2B")
        .replace("!","\\!")
        .replace("%40","\\%40")
        .replace("%23","\\%23")
        .replace("%24","\\%24")
        .replace("%25","\\%25")
        .replace("%5E","\\%5E")
        .replace("%26","\\%26")
        .replace("*","\\*")
        .replace("(","\\(")
        .replace(")","\\)")
        .replace("%7B","\\%7B")
        .replace("%7D","\\%7D")
        .replace("%22","\\%22")
        .replace("%5B","\\%5B")
        .replace("%5D","\\%5D")
        .replace("%3A","\\%3A")
        .replace("%3B","\\%3B")
        .replace("%5C","\\\%5C")
        .replace("%27","\\%27")
        .replace("%3C","\\%3C")
        .replace("%2C","\\%2C")
        .replace("%3E","\\%3E")
        .replace(".","\\.")
        .replace("%3F","\\%3F");
    return {'$regex' : '^' + value + '$', '$options' : 'i'};
};
