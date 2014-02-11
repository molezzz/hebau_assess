var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');

var cates = {
  '1': '教学单位',
  '2': '党群部门',
  '3': '科研教辅',
  '0': '行政处室',
}
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
    name: { type: Seq.STRING, allowNull: false },
    category_id: { type: Seq.ENUM, values: ['0', '1', '2', '3'], allowNull: false, defaultValue: '0'}
  },
  relations: {
    hasMany: ['member',{ as: 'members', foreignKey: 'department_id' }]
  },
  options: {
    timestamps: true,
    classMethods: {
      /**
       * 返回所有的类别
       * @return {Hash}
       */
      cates: function(){
        return ex.clone(cates);
      }
    },
    instanceMethods: {
      getCateName: function(){
        return cates[this.category_id] || '未知';
      }
    }
  }
};
