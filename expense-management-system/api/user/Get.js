'use strict';

//import env keys
const keys = require("../../env")


const db = require(keys().apiDB);
const Accounts = db.Accounts();
const MongoClient = require('mongodb').MongoClient;
const url = keys().mongoUrl;
const helper = require(keys().modelHeler);


module.exports.handler = (event, context, callback ) => {
    console.log(`event.pathParameters : ${JSON.stringify(event.pathParameters, null, 3)}`);


    MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            let id = event.pathParameters.userid;
            let userId = helper().objectId(id)

        //Set open connection to mongodb:
            let dbo = db.db("EMS-DB");

            let filter = {_id: id}

            return Promise.resolve(Accounts.findOne(dbo, {_id: userId}))
                .then((account)=>{
                    console.log(`account GET.js: ${JSON.stringify(account, null, 3)}`);
                    db.close()
                    callback(null, {Status: 200, body: JSON.stringify(account) })
                })
        });// mongo Client
};


