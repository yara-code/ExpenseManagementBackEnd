
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
        ref : (ref, id ) => {
            return new Promise((resolve, reject) => ( ) => {
                return {
                    "$ref": ref,
                    "$id": id
                }
            })
        },

        sendTwilioMessage : (phone, msg, callback) => {

            phone = typeof phone == 'string' && phone.trim().length == 10 ? phone.trim() : false;
            msg = typeof msg == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

            if(phone && msg) {
                // config request payload:
                var payload = {
                    "From" : config.twilio.fromPhone,  // TODO: ----> add configurations
                    'To' : '+1' + phone,
                    'Body' : msg
                };

                // stringify the payload:
                var stringPayload = querystring.stringify(payload);  // TODO: ---> Add querystring lib to helper.js

                // configure request details
                var requestDetails = {
                    'protocol' : 'https:',
                    'hostname' : 'api.twilio.com',
                    'method'   : "Post",
                    'path'     : `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`, // TODO: ----> add configurations
                    'auth'     : config.twilio.accountSid + ':' + config.twilio.authToken, // TODO: ----> add configurations
                    'headers'  : {
                        'Content-Type'   : 'application/x-www-form-urlencoded',
                        'Content-Length' : Buffer.byteLength(stringPayload)
                    }
                };


                // Instantiate the request object
                var req = https.request(requestDetails, function (res) {  // TODO: ----> add http require
                    // Grab the status of the sent request
                    var status = res.statusCode;
                    // callback successfully
                    if(status == 200 || status == 201)  {
                        console.log(`4422 res: ${res}`);
                        callback(false)
                    } else {
                        callback(`Status code returned was ${status} with : ${res}`)
                    }
                });

                // Bind to the error event so it doesn't get thrown:
                req.on('error', function (e) {
                    console.log(`4422  there is an error: ${JSON.stringify(e, null, 3)}`);
                    callback(e)
                });

                // add the payload
                req.write(stringPayload);

                // end request
                req.end();


            } else {
                callback('Given parameters were missing or invalid.')
            }


        },
    };

    return instance
};
