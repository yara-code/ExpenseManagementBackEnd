

const ObjectId = require('mongodb').ObjectId;




module.exports = function () {

    const instance = {
        objectId: (id) => {
            return new ObjectId(id);
        },

    };

    return instance
};



// work on await promise
