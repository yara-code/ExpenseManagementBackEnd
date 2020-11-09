/*
*
*
*
* */

const db = require('../../mongoFiles/collection');
const Accounts = db.Accounts();
const AuthCredentials = db.AuthCredentials();

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://EMS-Admin:PUuABNm2m0ZUZhkA@cluster0.fqgbv.mongodb.net/EMS-DB?retryWrites=true&w=majority";

module.exports.handler = (event, context, callback ) => {
    const body = event.body;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        //Set open connection to mongodb:
        let dbo = db.db("EMS-DB");

        return Promise.resolve()

    });// mongo Client
}