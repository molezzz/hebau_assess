var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');

var types = {
  'SA': '自评', //Self assessment
  'PA': '互评'  //Peer assessment
}
//考核项目
module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    type: { type: Seq.STRING, allowNull: false, defaultValue: 'SA', comment: '评选类别： PA 互评，SA 自评' },
    name: { type: Seq.STRING, allowNull: false, comment: '考核项目名称' },
    description: { type: Seq.TEXT, allowNull: true, comment: '项目描述和评分说明'},
    high_cut: { type: Seq.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, comment: '高分裁剪百分比 0-100'},
    low_cut: { type: Seq.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, comment: '低分裁剪百分比 0-100'},
    begin_at: { type: Seq.DATE, allowNull: false, comment: '开始时间'},
    end_at: { type: Seq.DATE, allowNull: false, comment:'结束时间'}
  },
  relations: {
    hasMany: ['rule', {as: 'rules'}]
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

    }
  }
};
