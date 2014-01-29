var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');
var moment = require('moment');
var crypto = require('crypto');

module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    department_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    invalid: { type: Seq.BOOLEAN, defaultValue: false, comment: '账号失效'},
    group_key: { type: Seq.STRING, allowNull: false, comment: '分组号' },
    last_login_at: { type: Seq.DATE, allowNull: true, comment: '最后登录时间' },
    last_login_ip: { type: Seq.STRING, allowNull: true, comment: '最后登录IP' },
    name: {
      type: Seq.STRING, allowNull: false, unique: true,
      comment: '用户名',
      validate: {
        notEmpty: { msg: '用户名不能为空'}
      }
    }
  },
  relations: {
    belongsTo: ['department', { foreignKey: 'department_id' }]
  },
  options: {
    timestamps: false,
    getterMethods: {

    },
    setterMethods: {

    },
    classMethods: {

    },
    instanceMethods: {
      getModel: function(){
        return orm.model('account');
      }
    }
  }
};
