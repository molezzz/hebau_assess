var orm = require('orm');

module.exports = exports = function(db) {

    return db.define('groups', {
      parent_id   : { type: 'number', defaultValue: 0, rational: false },
      name        : { type: 'text', require: true },
      created_at  : Date,
      updated_at  : Date
    },{
      methods: {},
      validations: {

      }
    });

};
