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
        setRegex:  (queryValue) => {
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
        }
    };

    return instance
};
