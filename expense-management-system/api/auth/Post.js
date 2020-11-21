/*
*
*
*
* */

const db = require('../../mongoFiles/collection');
const helper = require('../../model/helper');
const Accounts = db.Accounts();
const AuthCredentials = db.AuthCredentials();
const AuthSession = db.AuthSessions();
const Session = require('../../authorizer/lib/Session');
const dates = require('../../model/dates');
const Password = require('../../model/password');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://EMS-Admin:PUuABNm2m0ZUZhkA@cluster0.fqgbv.mongodb.net/EMS-DB?retryWrites=true&w=majority";

module.exports.handler = (event, context, callback ) => {

    const body = event.body;
    Promise.resolve()
        .then(( ) => {
            // validate payload
            if (!body) {
                return Promise.reject('Body is empty.');
            }
            if (!body.password) {
                return Promise.reject('Missing password.');
            }
            if (!body.username) {
                return Promise.reject('Missing username. (username value can be: username, email, phone number.)');
            }
            return Promise.resolve();
        })
        .then(()=>{
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;

                //Set open connection to mongodb:
                let dbo = db.db("EMS-DB");

                // Filter search
                let filter = {
                    $or: [
                        {'username': setRegex(body.username)},
                        {'email': setRegex(body.username)},
                    ]
                };

                return Promise.resolve()
                    .then(()=>{
                        // TODO: FIND --->
                        return Promise.resolve(AuthCredentials.find(dbo, filter))
                            .then((accountCredentials) => {
                                if(accountCredentials.length == 0) {
                                    return Promise.reject("Invalid username and password.");
                                } else {
                                    event.accountCredentials = accountCredentials[0];
                                    return Promise.resolve(event)
                                }
                            })
                            .then(( ) => {
                                // check if password from cred and password from payload match
                                return Password.check(event.body.password, event.accountCredentials)
                                    .then((results) => {
                                        if(results == false) {
                                            return Promise.reject('Login credentials do not match.');
                                        } else {
                                            return Promise.resolve()
                                        }
                                    })
                                    .catch((error ) => {
                                        return Promise.reject('Login credentials do not match.');
                                    })
                            })

                            .then((results ) => {
                                // load credentials and check if username/email/ and password matches
                                //create a session
                                return Session.encodeSession(event.accountCredentials.accountId)
                                    .then((sessionId) => {

                                        let add30 = new Date();
                                        let expiredTime = dates.addMinutes(add30, 30);
                                        // Create Session and add to db then return in response
                                        let addSession = {
                                            "sessionId" : sessionId.id,
                                            "expires" : expiredTime,
                                            "username" : event.accountCredentials.username,
                                            "email" : event.accountCredentials.email,
                                            "credential" : event.accountCredentials._id,
                                            "accountId" : event.accountCredentials.accountId,
                                            "hits" : 1,
                                        };
                                        // console.log(`Creating an AuthSessionn ------>------------>----->`);
                                        return Promise.resolve(AuthSession.create(dbo, addSession))
                                            .then(() => {
                                                // console.log(`session created successfully : <-------------`);
                                                let response = {
                                                    username  : addSession.username,
                                                    accountId : addSession.accountId,
                                                    sessionId : addSession.sessionId,
                                                    timeStamp : addSession.expires
                                                };

                                                return Promise.resolve(response);
                                            })
                                            .catch(( ) => {
                                                console.log(` AuthSession not created------->`);
                                                return Promise.reject("AuthSession not created");
                                            })
                                    })
                                    .catch((error ) => {
                                        // console.log(`error from encodeSession : ${JSON.stringify(error, null, 3)}`);
                                        return Promise.reject('Internal Server Error; session.');
                                    })
                            })

                            .then((results)=>{

                                let userId = helper().objectId(results.accountId)

                                return Promise.resolve(Accounts.findOne(dbo, {_id: userId}))
                                    .then((user)=>{
                                        results.user = user;

                                        return Promise.resolve(results)
                                    })
                            })
                            .then((results ) => {
                                // console.log(`no errors returning to router.js : `);
                                // console.log(`results : ${results}`);
                                // console.log(`results that is return to router.js : ${JSON.stringify(results, null, 3)}`);
                                db.close();
                                callback(null, {statusCode: 200, body: JSON.stringify(results)});
                            })
                            .catch(error => {
                                console.log(`last catch error : ${error}`);
                                if (error) {
                                    db.close();
                                    callback(null, {statusCode: 400, body: JSON.stringify({errorMessage: error})})
                                } else {
                                    db.close();
                                    callback(null, {statusCode: 500, body: JSON.stringify({errorMessage: "Internal Server Error."})})
                                }
                            })
                    });
            });// mongo Client
        })

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
