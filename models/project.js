var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');
var moment = require('moment');

//考评类型
var types = {
  'PERSON': '人员考核',
  'DEPARTMENT': '班子考核'
};
//考评类别
var cates = {
  'SA': '自评', //Self assessment
  'PA': '互评'  //Peer assessment
};

//考核项目
module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    type: {
      type: Seq.STRING, allowNull: false, defaultValue: 'PERSON',
      comment: 'PERSON 人员考核,  DEPARTMENT 班子考核',
      validate: {
        isIn: [['PERSON', 'DEPARTMENT']],
        notEmpty: true,
      }
    },
    category: {
      type: Seq.STRING, allowNull: false, defaultValue: 'SA',
      comment: '评选类别： PA 互评，SA 自评',
      validate: {
        isIn: [['PA', 'SA']],
        notEmpty: true,
      }
    },
    name: {
      type: Seq.STRING, allowNull: false,
      comment: '考核项目名称',
      validate: {
        notEmpty: true
      }
    },
    description: { type: Seq.TEXT, allowNull: true, comment: '项目描述和评分说明'},
    high_cut: {
      type: Seq.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0,
      comment: '高分裁剪百分比 0-100',
      validate: {
        isNumeric: true,
        min: 0,
        max: 50
      }
    },
    low_cut: {
      type: Seq.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0,
      comment: '低分裁剪百分比 0-100',
      validate: {
        isNumeric: true,
        min: 0,
        max: 50
      }
    },
    begin_at: {
      type: Seq.DATE, allowNull: false,
      comment: '开始时间',
      validate: {
        isDate: true
      }
    },
    end_at: {
      type: Seq.DATE, allowNull: false,
      comment:'结束时间',
      validate: {
        isDate: true,
        isEven: function(v, next){
          var begin_at = this.begin_at;
          if(v <= begin_at){
            return next('结束日期必须在开始日期之后！');
          };
          next();
        }
      }
    }
  },
  relations: {
    hasMany: ['rule', { as: 'rules', foreignKey: 'project_id' }]
  },
  options: {
    timestamps: true,
    classMethods: {
      /**
       * 返回所有的类别
       * @return {Hash}
       */
      types: function(){
        return ex.clone(types);
      },
      /**
       * 返回所有考核的分类
       * @return {Hash}
       */
      cates: function(){
        return ex.clone(cates);
      }

    },
    getterMethods: {
      beginAt: function(){
        return moment(this.begin_at);
      },
      endAt: function(){
        return moment(this.end_at);
      }
    },
    setterMethods: {

    },
    instanceMethods: {
      getTypeName: function(){
        return types[this.type];
      },
      getCateName: function(){
        return cates[this.category];
      }
    }
  }
};
