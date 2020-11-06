/*
*
*   Password creations and check
*
* */
const crypto  = require('crypto');

const instance   = {

    algorithm: "sha512",
    salt: () => new Buffer.alloc(128, crypto.randomBytes(128)).toString('base64'),
    iterations: max => {
        let maxIterations = max || 2400;
        return Math.floor(Math.random() * maxIterations) + 1000;
    },

    generate: (password, credential) => {
        var hash       = crypto.createHash(instance.algorithm);
        var hashedPass = hash.update(password).digest('base64');
        var hmacValue  = hashedPass;

        for (var i = 0; i < credential.iterations; i++) {
            hmacValue = crypto.createHmac(instance.algorithm, credential.salt).update(hmacValue).digest('base64');
        }
        return hmacValue;
    }
};

module.exports = {

    create: password => {
        const salt       = instance.salt();
        const iterations = instance.iterations();
        const encPass    = instance.generate(password,{salt:salt,iterations:iterations});
        return Promise.resolve({salt:salt,iterations:iterations,password:encPass});
    },


    check: (password, credential) => {
        const encryptedPassword = instance.generate(password,credential);
        return Promise.resolve(encryptedPassword==credential.password);
    }
};


