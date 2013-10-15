var orm = require('../lib/seq-models');
var Seq = orm.Seq();

// see https://github.com/sequelize/sequelize/pull/894
// (1) beforeValidate(dao, fn)

// (-) validate

// (2) afterValidate(dao, fn)

// (3) beforeBulkCreate(daos, fields, fn) / beforeBulkDestroy(daos, fields, fn) / beforeBulkUpdate(daos, fields, fn)

// (4) beforeCreate(dao, fn) / beforeDestroy(dao, fn) / beforeUpdate(dao, fn)

// (-) create / destroy / update

// (5) afterCreate(dao, fn) / aftreDestroy(dao, fn) / afterUpdate(dao, fn)

// (6) afterBulkCreate(daos, fields, fn) / afterBulkDestory(daos, fields, fn) / afterBulkUpdate(daos, fields, fn)

module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    parent_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    name: { type: Seq.STRING, allowNull: false }
  },
  relations: {

  },
  options: {
    timestamps: true
  }
};
