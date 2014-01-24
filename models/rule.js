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
        var key = 'P' + rule.project_id;
        if(rule.parent_id){
          key += 'R' + rule.parent_id;
        };
        key += '-' + now.format('DDHHmm');
        rule.key = key + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
        return next(null, rule);
      }
    },
    getterMethods: {
      itemsObj: function(){
        return JSON.parse(this.items);
      },
      items: function(){
        console.log(['From items', this.getDataValue('items')]);
        return this.getDataValue('items');
      }
    },
    setterMethods: {
      itemsObj: function(items){
        this.items = JSON.stringify(items);
        console.log(this.items);
        return ;
      },
      items: function(items){
        this.setDataValue(JSON.stringify(items));
        return;
      }
    },
    classMethods: {

    },
    instanceMethods: {

    }
  }
};
