'use strict';
const keys = require("../../env")

const db = require(keys().apiDB);
const helper = require(keys().modelHeler);
const Accounts = db.Accounts();
const AuthCredentials = db.AuthCredentials();
const dates = require('../../model/dates');
const Password = require('../../model/password');
const MongoClient = require('mongodb').MongoClient;
const url = keys().mongoUrl;








module.exports.handler = (event, context, callback ) => {
    console.log(`event.pathParameters 4422: ${JSON.stringify(event.pathParameters, null, 3)}`);

    const body = event.body;

    console.log(`body---------> : ${JSON.stringify(body, null, 3)}`);
    // username, email, password
    if (body.password == "" ){delete body.password}
    if (body.email == "" ){delete body.email}
    if (body.username == "" ){delete body.username}
    // first update Accounts
    console.log(`body---------> : ${JSON.stringify(body, null, 3)}`);

    // Then update Creds
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("EMS-DB");
        const setRegex =  (queryValue) => {
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

        return Promise.resolve()
            .then(()=>{
                console.log(`body in first then  : ${JSON.stringify(body, null, 3)}`);
                if(body.username || body.email){


                    console.log(`checking auth : `);
                    let filter = {
                        $or: [
                            {'username': setRegex(body.username)},
                            {'email': setRegex(body.email)},
                        ]
                    };
                    console.log(`filter done : ${filter}`);
                    return Promise.resolve(AuthCredentials.find(dbo, filter))
                        .then((accountCredentials)=>{
                            console.log(`PUT user inside.then in authcreds.find :`);
                            if(accountCredentials.length > 0) {
                                accountCredentials.forEach((account)=>{
                                    if (body.username == account.username){
                                        return Promise.reject("Username already exist.");
                                    }
                                    else if (body.email == account.email){
                                        return Promise.reject("Email already exist.");
                                    }
                                })
                            } else {
                                //resolve and create new account
                                // account doesn't exist yet
                                return Promise.resolve();
                            }
                        })
                        .catch((error)=>{
                            console.log(`find auth error`);
                            return Promise.reject('Username or email already exist')
                        })
                } else {
                    return Promise.resolve()
                }
            })//// first .then
            .then(( ) => {
                // event.accountDetail = accountDetail
                console.log(`******************************************************`);
                console.log(`4422 pasword check ===========================:`);
                if(body.password){
                    console.log(`password create :`);
                    return Promise.resolve(Password.create(body.password))
                        .catch((error ) => {
                            return Promise.reject(error)
                            // return Promise.reject("Could not create credential")
                        })
                } else {
                    return Promise.resolve()
                }
            })
            .then((passwordDetails) => {
                console.log(`doing creds -----4422`);
                let userCreds = {
                    $set: {}
                }
                console.log(`userCred passed `);
                if(body.password){
                    userCreds.$set.salt = passwordDetails.salt
                    userCreds.$set.iterations = passwordDetails.iterations
                    userCreds.$set.password = passwordDetails.password
                }
                console.log(`if body.password password `);
                if(body.email){
                    userCreds.$set.email = body.email
                }
                console.log(`if body.email passed++++++++=========`);
                if(body.username){
                    console.log(`inside body.username8972134902183479237498327238`);
                    console.log(`body.username : ${body.username}`);
                    userCreds.$set.username = body.username
                }
                console.log(`body.username passed`);
                event.updatedDate =  dates.addMinutes()
                userCreds.$set['updated-on'] = event.updatedDate

                console.log(`update creds next line : `);
                console.log(`updating creds 4422 : ${JSON.stringify(userCreds, null, 3)}`);
                return Promise.resolve(AuthCredentials.updateOne(dbo, event.session.credential , userCreds)) // updating auth creds record
                    .catch((error ) => {
                        console.log(`error 4422 updating auth : ${JSON.stringify(error, null, 3)}`);
                        return Promise.reject(error)
                        // return Promise.reject("Could not create credential")
                    })
                    .then((results ) => {
                        console.log(`this is what gets returns :`);
                        console.log(`results : ${JSON.stringify(results, null, 3)}`);
                        return Promise.resolve();
                    })
            })
            .then(( ) => {
                let user = {$set:{}}

                if(body.email){user.$set.email = body.email}
                if(body.username){user.$set.username = body.username}
                user.$set['updated-on'] = event.updatedDate
                console.log(`updating account ----> 4422: ${JSON.stringify(user, null, 3)}`);

                console.log("Accounts.update");
                return Promise.resolve(Accounts.update(dbo, event.session.accountId , user))
                    .then((results ) => {
                        return Promise.resolve()
                    })
                    .catch((error ) => {
                        // return Promise.reject("Could not create Account")
                        console.log(`error updating account 4422 : ${JSON.stringify(error, null, 3)}`);
                        return Promise.reject(error)
                    })
            })
            .then(() => {
                body.accountId = event.session.accountId; // add accountID to auth creds update db
                if(body.password){
                    body.password = "**********"
                    body.confirmPassword = "**********"
                }
                body.responseMessage =  "Account Created Successfully";
                db.close();
                callback(null, {statusCode: 200, body: JSON.stringify(body)});
            })
            .catch ((error ) => {
                console.log(`.catch --->  PUT user: ------------>>>>>>>d `);
                console.log(`err : ${JSON.stringify(error, null, 3)}`);
                db.close();
                callback(null, {statusCode: 400, body: JSON.stringify({"errorMessage" : error })});
            })
    });// mongo Client
};


