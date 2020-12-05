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
    const body = event.body;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        //Set open connection to mongodb:
        let dbo = db.db("EMS-DB");

        return Promise.resolve()
            .then(()=>{
                // validation:

                if(!body.category){
                    Promise.reject("Missing category.")
                }
                if(!body.title){
                    Promise.reject("Missing title.")
                }
                if(!body.date){
                    // check if date is entered correctly:
                    Promise.reject("Missing date.")
                }
                if(!body.amount){
                    Promise.reject("Missing amount.")
                } else {
                    body.amount = Number(body.amount).toFixed(2)
                }

            })
            .then(()=>{
                return Promise.resolve(Accounts.findOne(dbo, {_id: event.session.accountId}))
            })
            .then((account)=>{
                // TODO: add expense --->
                // event.session.accountId
                let userId = helper().objectId(event.session.accountId)

                // console.log(`account : ${JSON.stringify(account, null, 3)}`);

                return Promise.resolve(Accounts.update(dbo, userId, {$push: {expenses:body}}))
                    .then((results ) => {
                        // TODO: NO errors, close db connection then callback to return data
                        body.message = "Account updated."
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
};