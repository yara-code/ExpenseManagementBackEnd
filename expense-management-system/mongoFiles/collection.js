
const Collection = require('./mongoLib');

module.exports = {
    Accounts          : () =>  new Collection('Accounts'),
    AuthCredentials   : () =>  new Collection('Credentials'),
    AuthSessions      : () =>  new Collection('AuthSessions')
};