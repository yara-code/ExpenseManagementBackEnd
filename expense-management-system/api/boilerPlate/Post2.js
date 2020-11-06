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
        let dbo = db.db("EMS-DB");

        let filter = {
            $or: [
                {'username': setRegex(body.username)},
                {'email': setRegex(body.email)},
            ]
        };

        return Promise.resolve()
            .then(()=>{
                return Promise.resolve(AuthCredentials.find(dbo, filter))
                    .then((accountCredentials)=>{
                        console.log(`Post user inside.then in authcreds.find :`);
                        if(accountCredentials.length > 0) {
                            if (body.username == accountCredentials[0].username){
                                return Promise.reject("Username already exist.");
                            }
                            else if (body.email == accountCredentials[0].email){
                                return Promise.reject("Email already exist.");
                            }
                            else {
                                return Promise.reject("Account already exist.");
                            }
                        } else {
                            //resolve and create new account
                            // account doesn't exist yet
                            return Promise.resolve();
                        }
                    })
            })// first .then
            .then(( ) => {
                console.log(`password create :`);
                return Promise.resolve(Password.create(body.password))
                    .catch((error ) => {
                        return Promise.reject(error)
                        // return Promise.reject("Could not create credential")
                    })
            })
            .then((passwordDetails) => {
                console.log(`password Details : ${passwordDetails}`);
                console.log(`-------> : ${JSON.stringify(passwordDetails, null, 3)}`);
                let userCreds = {
                    username: body.username,
                    email: body.email,
                    salt: passwordDetails.salt,
                    iterations: passwordDetails.iterations,
                    password: passwordDetails.password,
                    "create-on" : dates.addMinutes(),
                    accountId: ''
                };

                console.log(`creating creds next line : `);
                return Promise.resolve(AuthCredentials.create(dbo, userCreds)) // creating auth creds record
                    .then((results ) => {
                        console.log(`this is what gets returns :`);
                        console.log(`results : ${JSON.stringify(results, null, 3)}`);
                        return Promise.resolve(results.ops[0]);
                    })
                    .catch((error ) => {
                        return Promise.reject(error)
                        // return Promise.reject("Could not create credential")
                    })
            })
            .then((creds ) => {
                // .then(( ) => {
                // TODO: create account collection
                // _id:5cf4fb32d69884098272c612
                // firstName:"First Name"
                // lastName:"Last Name"
                // username
                // email:"test@gamil.com"
                // authCredential:DBRef(undefined, 5cf4fc14d69884098272c617, undefined)

                event.creds = creds;

                let userAccount = {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    username: body.username,
                    email: body.email,
                    authCredential: creds._id
                };
                console.log("Accounts.create");
                return Promise.resolve(Accounts.create(dbo, userAccount))
                    .then((results ) => {
                        return Promise.resolve(results.ops[0])
                    })
                    .catch((error ) => {
                        // return Promise.reject("Could not create Account")
                        return Promise.reject(error)
                    })
            })
            .then((results ) => {
                console.log(`return response to api : `);
                body.accountId = results._id; // add accountID to auth creds update db
                AuthCredentials.update(event.creds._id, {$set : {accountId: body.accountId} });
                // return account info or do that in the front end to log user inn
                body.responseMessage =  "Account Created Successfully";
                console.log(`body : ${JSON.stringify(body, null, 3)}`);
                db.close();
                callback(null, {statusCode: 200, body: JSON.stringify(body)});
            })
            .catch ((error ) => {
                console.log(`.catch --->  Post user: `);
                console.log(`err : ${JSON.stringify(error, null, 3)}`);
                db.close();
                callback(null, {statusCode: 404, body: JSON.stringify({"errorMessage" : error })});
            })
            // .then((creds)=>{
            //     db.close();
            //     callback(null, {statusCode: 200, body: JSON.stringify(body)});
            // })
    });// mongo Client
};

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
