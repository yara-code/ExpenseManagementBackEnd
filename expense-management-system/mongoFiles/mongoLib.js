
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://EMS-Admin:PUuABNm2m0ZUZhkA@cluster0.fqgbv.mongodb.net/EMS-DB?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const helper = require('../model/helper');

module.exports = function  (_collectionName) {
    const instance = {

        create:  (DB, record) => {
            return new Promise((resolve, reject) => {
                // console.log(`connect to db and collection : ${_collectionName}`);
                const db = DB.collection(_collectionName);
                // Calls the correct collection and returns all records in an array of object:
                // console.log(`insert record for  : ${_collectionName}`);
                db.insertOne(record, function (err, record) {
                    if (err) {
                        console.log(`err inside of create : ${JSON.stringify(err, null, 3)}`);
                        return reject({'Error': `Could not create record.`, 'errorMessage': err})
                    }
                    // console.log(`returning record : ${record}`);
                    return resolve(record);
                });
            });
        },

        find: (DB, query, attributes, size) => {
            return new Promise((resolve, reject) => {
                query = query ?  query : {};
                attributes = attributes ? attributes : {};
                size = size ? size : undefined;
                const db = DB.collection(_collectionName);
                // Calls the correct collection and returns all records in an array of object:
                db.find(query, attributes, size).toArray(function (err, accounts) {
                    if (err) {
                        return reject({'Error': 'error- cant find'});
                    } else {
                        return resolve(accounts);
                    }
                })
            })

        },

        //TODO - Done
        //calls the find function and only returns the first one:
        findOne: (DB, query, attributes) => {
            return instance.find(DB, query, attributes, {page: 1, pagesize: 1})
                .then((accounts) => {
                    if (accounts.length === 0){
                        return {"Error" : "NotFound"}
                    }
                    return accounts[0]
                });
        },

        // TODO: - need to do ---> Not sure We need this
        load: (id) => {
            return new Promise((resolve, reject) => {
                client.connect(err => {
                    if (err) {
                        return reject({'Error': 'Cannot connect to DB'})
                    }
                    const db = client.db("EMS-DB");
                    id = helper().objectId(id);
                    db.collection(_collectionName).findOne({_id: id}, function (err, account){
                        if(err) {
                            client.close();
                            reject({'Error': err});
                        }
                        client.close();
                        return resolve(account)
                    })
                });
            });
        },

        // Update: TODO --> Done
        update: (DB, id, update) => {
            return new Promise((resolve, reject) => {
                const db = DB.collection(_collectionName);
                id = {_id : helper().objectId(id)};
                console.log(`id for update : ${id}`);
                db.updateOne(id, update, function (err, record) {
                    if (err) {
                        return reject({'Error': `Could not update record.`, 'errorMessage': err})
                    }
                    return resolve(record);
                });
            });
        },
        updateOne: (DB, id, update) => {
            return new Promise((resolve, reject) => {
                const db = DB.collection(_collectionName);
                id = {_id : helper().objectId(id)};
                console.log(`id for update : ${id}`);
                db.updateOne(id, update, function (err, record) {
                    if (err) {
                        return reject({'Error': `Could not update record.`, 'errorMessage': err})
                    }
                    return resolve(record);
                });
            });
        },

        // Delete data TODO: Done
        delete: (DB, id) => {
            return new Promise((resolve, reject) => {
                const db = DB.collection(_collectionName);
                id = helper().objectId(id);
                // Calls the correct collection and returns all records in an array of object:
                db.remove({_id: id}, function (err, accounts) {
                    if (err) {
                        return reject({'Error': 'error- cant find'});
                    } else {
                        return resolve(accounts);
                    }
                })
            })
        },
    };
    return instance;
};



