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
        //isInt: true,
        min: { args: 0, msg: '高分剪裁不能小于0'},
        max: { args: 50, msg: '高分剪裁不能大于50'}
      }
    },
    low_cut: {
      type: Seq.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0,
      comment: '低分裁剪百分比 0-100',
      validate: {
        //isInt: true,
        min: { args: 0, msg: '低分剪裁不能小于0'},
        max: { args: 50, msg: '低分剪裁不能大于50'}
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
      },
      //生成项目报表
      genReports: function(successFn, errorFn){
        //var Department = orm.model('department');
        //var Member = orm.model('member');
        var Record = orm.model('record');
        var Account = orm.model('account');
        var Report = orm.model('report');
        var key = this.type == 'PERSON' ? 'member_id' : 'department_id';
        var chainer = new (orm.Seq().Utils.QueryChainer)();
        var _self = this;
        chainer.add(Record.findAll({
          where: { project_id: _self.id },
          order: '`' + key + '` DESC , `total` DESC',
          attributes: ['id', 'member_id', 'department_id', 'account_id', 'project_id', 'total', 'detail']
        })).add(Account.count({
          where: { invalid: false }
        }));
        chainer.run()
        .success(function(result){
          var records = {};
          var reports = [];
          var accountTotal = result[1];
          ex.forEach(result[0], function(record){
            if(!records[record[key]]) records[record[key]] = [];
            //去掉所有弃权的票
            if(record.total > 0) records[record[key]].push(record);
          });
          ex.forEach(records, function(arr, id){
            var low = Math.max(Math.round(_self.low_cut * arr.length / 100), 0) * -1;
            var high = Math.max(Math.round(_self.high_cut * arr.length / 100), 0);
            var report = {
              total: 0,
              project_id: _self.id,
              account_count: accountTotal,
              abstentions: accountTotal - arr.length
            };
            var detail = {};
            //去掉高分、去掉低分
            if(low == 0){
              arr.slice(high);
            }else{
              arr.slice(high, low);
            };
            //console.log(low, high, arr);
            ex.forEach(arr, function(r, idx){
              for(var pid in r.detail){
                detail[pid] = detail[pid] || {};
                for(var cid in r.detail[pid]){
                  detail[pid][cid] = detail[pid][cid] || 0;
                  detail[pid][cid] += r.detail[pid][cid];
                }
              };
              report.total += r.total;
            });
            report[key] = id;
            report.valids = arr.length;
            //计算平均分
            ex.forEach(detail, function(p){
              ex.forEach(p, function(c, idx){
                p[idx] = Math.round(c * 100 / report.valids) / 100;
              });
              return p;
            });
            report.detail = detail;
            //console.log(report);
            reports.push(report);
          });
          Report.bulkCreate(reports)
          .success(function(){
            if(ex.isFunction(successFn)) return successFn();
          })
          .error(function(errors){
            if(ex.isFunction(errorFn)) return errorFn(errors);
          });
        })
        .error(function(errors){
          console.log(errors);
          if(ex.isFunction(errorFn)) return errorFn(errors);
        });
      }
    }
  }
};
