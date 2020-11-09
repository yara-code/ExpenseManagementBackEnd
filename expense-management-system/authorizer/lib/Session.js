'use strict';

const crypto = require('crypto');
const db = require('../../mongoFiles/collection');

const Sessions = db.AuthSessions();


const instance = {

    makeid: (length) => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return Promise.resolve(result);
    },
    makeKey: (length) => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ[]{}()$#@!&*<>?abcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        // return result
        return Promise.resolve(result);
    },
    encodeSession: (sessionId ) => {
        // Cipher Suites, key, and the iv
        let a = 'aes-256-cbc';
        let key = "MOxEW3%!Oop+tXhIh(9f>Za3]{s98Cv#"; // key should be 32 bytes
        let iv = '0000000000000000'; // iv should be 16

        console.log(`sessionID : ${sessionId}`);
        let randomKey = instance.makeid(8);
        return Promise.resolve(randomKey)
            .then((nums ) => {
                let id = sessionId ? sessionId + nums: instance.makeid(16);
                let cipher = crypto.createCipheriv(a, key, iv);
                let encodedId1 = cipher.update(id, 'utf8', 'hex');
                let result = {
                    id: encodedId1,
                    iv: iv
                };
                console.log(`.then results from encodeSession : ${JSON.stringify(result, null, 3)}`);
                return Promise.resolve(result);
            })
    },
    decodeSession : (authToken) => {
        let a = 'aes-256-cbc';
        let key = "MOxEW3%!Oop+tXhIh(9f>Za3]{s98Cv#"; // key should be 32 bytes
        let iv = '0000000000000000'; // iv should be 16

        // ensure authToken is only 64
        if (authToken.length < 64) {
            authToken = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // 64
        }
        authToken = authToken.substr(0, 64);

        let encodedId     = authToken;
        let decipher      = crypto.createDecipheriv(a, key, '0000000000000000');
        decipher.setAutoPadding(false);
        let id            = decipher.update(encodedId,'hex','utf8');

        return Promise.resolve({id: id.substr(0, 24), encoded: encodedId})
    },

    load: id => Sessions.load(id.id ? id.id : id),

    extendSession: id => { Sessions.update(id, { expires : { $date : new Date() } }) },

};

module.exports = instance;

