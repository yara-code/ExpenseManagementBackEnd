'use strict'

const ObjectId = require('mongodb').ObjectId;

module.exports = function () {

    const instance = {
        objectId: (id) => {
            if(id && id.$id && id.$id.$oid){
                return new ObjectId(id.$id.$oid);
            }
            else if (id && id.$id){
                return new ObjectId(id.$id);
            } else {
                return new ObjectId(id);
            }
        },

        objectParse : (event ) => {
            try {
                let obj = JSON.parse(event);
                return obj;
            } catch(err) {
                return event
            }
        },
        Promise : ( ) => {
            return new Promise((resolve, reject) => {
             return resolve('')
            })
        },
        close : (c) =>{
            return new Promise((resolve, reject) => {
                return resolve(c.close())
            })
        },

        ref : (ref, id ) => {
            return new Promise((resolve, reject) => ( ) => {
                return {
                    "$ref": ref,
                    "$id": id
                }
            })
        },
    };

    return instance
};
