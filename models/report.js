var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');


module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    department_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    member_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    project_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    account_count: { type: Seq.INTEGER, allowNull: false, defaultValue: 0, comment: '参与总人数'},
    valids: { type: Seq.INTEGER, allowNull: false, defaultValue: 0, comment: '参与计算的有效票数'},
    abstentions: { type: Seq.INTEGER, allowNull: false, defaultValue: 0, comment: '弃权票数'},
    total: {type: Seq.FLOAT, allowNull: false, defaultValue: 0, comment: '总分' },
    detail: { type: Seq.TEXT, allowNull: true, comment: '评分明细JSON格式'}
  },
  relations: {
    belongsTo: ['department', { foreignKey: 'department_id' }],
    belongsTo: ['member', { foreignKey: 'member_id' }],
    belongsTo: ['project', { foreignKey: 'project_id' }]
  },
  options: {
    timestamps: true,
    getterMethods: {
      detail: function(){
        return JSON.parse(this.getDataValue('detail') || 'null');
      }
    },
    setterMethods: {
      detail: function(detail){
        if(!detail) detail = {};
        this.setDataValue('detail', JSON.stringify(detail));
        return;
      }
    },
    classMethods: {

    },
    instanceMethods: {

    }
  }
};
