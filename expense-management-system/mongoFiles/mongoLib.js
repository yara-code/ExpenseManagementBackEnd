
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://EMS-Admin:PUuABNm2m0ZUZhkA@cluster0.fqgbv.mongodb.net/EMS-DB?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const helper = require('./helper');
const h = require('../model/helper')

module.exports = function  (_collectionName) {
    const instance = {
        // Create : TODO --> Done
        // create:  (record, toClose) => {
        //     return new Promise((resolve, reject) => {
        //         client.connect((err, DB) => {
        //             if (err) {
        //                 return reject({'Error': 'Cannot connect to DB'})
        //             }
        //             console.log(`connect to db and collection : ${_collectionName}`);
        //             const db = client.db("EMS-DB").collection(_collectionName);
        //             // Calls the correct collection and returns all records in an array of object:
        //             db.insertOne(record, function (err, record) {
        //                 if (err) {
        //                     client.close();
        //                     return reject({'Error': `Could not create record.`, 'errorMessage': err})
        //                 }
        //
        //                 // h().close(client)
        //                 //     .then(()=>{
        //                 //         return resolve(record);
        //                 //     })
        //                 DB.close()
        //                     .then(()=>{
        //                         return resolve(record);
        //                     })
        //                 // if (toClose) {client.close();}
        //                 return resolve(record);
        //             });
        //
        //         })
        //     });
        // },
        create:  (DB, record) => {
            return new Promise((resolve, reject) => {
                console.log(`connect to db and collection : ${_collectionName}`);
                const db = DB.collection(_collectionName);
                // Calls the correct collection and returns all records in an array of object:
                db.insertOne(record, function (err, record) {
                    if (err) {
                        return reject({'Error': `Could not create record.`, 'errorMessage': err})
                    }
                    return resolve(record);
                });
            });
        },


        // Get data: TODO --> Done
        // find: (query, attributes, size, toClose) => {
        //     return new Promise((resolve, reject) => {
        //         query = query ?  query : {};
        //         attributes = attributes ? attributes : {};
        //         size = size ? size : undefined;
        //
        //         console.log(`connect to find :`);
        //         client.connect((err, DB) => {
        //             console.log(`connected check iferr :`);
        //             if(err){
        //                 return reject({'Error': 'Cannot connect to DB'})
        //             }
        //             const db = client.db("EMS-DB").collection(_collectionName);
        //             // Calls the correct collection and returns all records in an array of object:
        //             console.log(`db.find :`);
        //             db.find(query, attributes, size).toArray(function (err, accounts) {
        //                 if (err) {
        //                     client.close();
        //                     return reject({'Error': 'error- cant find'});
        //                 } else {
        //                     // client.close();
        //                     // if (toClose){client.close();}
        //                     DB.close()
        //                         .then(()=>{
        //                             return resolve(accounts);
        //                         })
        //                     // h().close(client)
        //                     //     .then(()=>{
        //                     //         console.log(`accounts : ${accounts}`);
        //                     //         return resolve(accounts);
        //                     //     })
        //                     // console.log(`accounts : ${accounts}`);
        //                     // return resolve(accounts);
        //                 }
        //             })
        //         });
        //     })
        //
        // },
        find: (DB, query, attributes, size) => {
            return new Promise((resolve, reject) => {
                query = query ?  query : {};
                attributes = attributes ? attributes : {};
                size = size ? size : undefined;

                console.log(`connect to find :`);
                console.log(`connected check db can connect :`);
                const db = DB.collection(_collectionName);
                // Calls the correct collection and returns all records in an array of object:
                console.log(`db.find :`);
                db.find(query, attributes, size).toArray(function (err, accounts) {
                    if (err) {
                        return reject({'Error': 'error- cant find'});
                    } else {
                        console.log(`accounts : ${accounts}`);
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

        // TODO: - Done
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
        update: (id, update) => {
            return new Promise((resolve, reject) => {
                client.connect(err => {
                    if (err) {
                        return reject({'Error': 'Cannot connect to DB'})
                    }
                    const db = client.db("EMS-DB");
                    id = {_id : helper().objectId(id)};

                    db.collection(_collectionName).updateOne(id, update, function (err, record) {
                        if (err) {
                            client.close();
                            return reject({'Error': `Could not create record.`, 'errorMessage': err})
                        }
                        client.close();
                        return resolve(record);
                    });

                });
            });
        },

        // Delete data
        delete: (id) => {
            return new Promise((resolve, reject) => {
                client.connect(err => {
                    if(err){
                        return reject({'Error': 'Cannot connect to DB'})
                    }
                    const db = client.db("EMS-DB");
                    id = helper().objectId(id);
                    // Calls the correct collection and returns all records in an array of object:
                    db.collection(_collectionName).remove({_id: id}, function (err, accounts) {
                        if (err) {
                            client.close();
                            return reject({'Error': 'error- cant find'});
                        } else {
                            client.close();
                            return resolve(accounts);
                        }
                    })
                });
            })
        },
    };
    return instance;
};



