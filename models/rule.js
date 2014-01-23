var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');
var moment = require('moment');
var crypto = require('crypto');

module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    parent_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    name: { type: Seq.STRING, allowNull: false, comment: '规则名称'},
    key: { type: Seq.STRING, allowNull: false, comment: '英文键值'},
    scale: { type: Seq.INTEGER.UNSIGNED, allowNull: false, defaultValue: 100, comment: '分值占比 0-100'},
    items: { type: Seq.TEXT, allowNull: false, defaultValue: '{}', comment: '选项 {key: point}'}
  },
  relations: {
    hasMany: ['rule', { as: 'children', foreignKey: 'parent_id', useJunctionTable: false }],
    belongsTo: ['rule', { as: 'parent', foreignKey: 'parent_id' }],
    belongsTo: ['project', { foreignKey: 'project_id' }]
  },
  options: {
    timestamps: true,
    hooks: {
      beforeCreate: function(rule, next){
        var now = moment();
        var key = 'P' + rule.project_id + '-' + now.format('MMDD');
        if(rule.parent_id){
          key += '-R' + rule.parent_id;
        };
        rule.key = key + '-' + crypto.randomBytes(3).toString('hex');
        console.log(rule.key);
        return next(null, rule);
      }
    },
    classMethods: {

    },
    instanceMethods: {

    }
  }
};
