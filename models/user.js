var orm = require('orm');

module.exports = exports = function(db) {

    return db.define('users', {
      group_id    : { type: 'number', defaultValue: 0, rational: false },
      name        : { type: 'text', require: true },
      email       : { type: 'text', unique: true },
      password    : String,
      salt        : { type: 'text', size: 6 },
      phone       : { type: 'text', unique: true, require: true },
      created_at  : Date,
      updated_at  : Date
    },{
      methods: {},
      validations: {

      }
    });

};
