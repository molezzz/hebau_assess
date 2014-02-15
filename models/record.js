var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');


module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    department_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    member_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    account_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    project_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    answer: { type: Seq.TEXT, allowNull: true, comment: '投票记录'},
    detail: { type: Seq.TEXT, allowNull: true, comment: '各项分数详情'},
    total: {type: Seq.FLOAT, allowNull: false, defaultValue: 0, comment: '总分' }
  },
  relations: {
    belongsTo: ['department', { foreignKey: 'department_id' }],
    belongsTo: ['member', { foreignKey: 'member_id' }],
    belongsTo: ['account', { foreignKey: 'account_id' }],
    belongsTo: ['project', { foreignKey: 'project_id' }]
  },
  options: {
    timestamps: true,
    getterMethods: {
      answer: function(){
        return JSON.parse(this.getDataValue('answer'));
      },
      detail: function(){
        return JSON.parse(this.getDataValue('detail') || '{}');
      }
    },
    setterMethods: {
      answer: function(answer){
        if(!answer) answer = {};
        this.setDataValue('answer', JSON.stringify(answer));
        return;
      },
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
