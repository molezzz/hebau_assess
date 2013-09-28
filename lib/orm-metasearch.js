var orm = require('orm');
/**
 * orm 2 meta搜索 by molezz
 * @param  Orm db
 * @return Chains
 */
module.exports = function(db){

  return {
    define: function (Model) {
      var map = {
        eq: orm.eq,
        ne: orm.ne,
        gt: orm.gt,
        gte: orm.gte,
        lt: orm.lt,
        lte: orm.lte,
        between: function(params){
          var p = params.split(',');
          return orm.between(p[0], p[1]);
        },
        not_between: function(params){
          var p = params.split(',');
          return orm.not_between(p[0], p[1]);
        },
        like: function(params){
          return orm.like('%'+ params + '%');
        },
        inc: function(params){
          return params.split(',');
        }
      }
      /**
       * 智能搜索
       * @param  {Hash}   query
       *                  example: {name_eq: xxx} -> {name: orm.eq(xxx)}
       * @param  {Function} cb(err, records) 回调方法
       * @return {Chains}
       */
      Model.search = function (query, cb) {
        var chains = this.find();
        var conditions = [];
        var t, fn, condition;

        for(var key in query){
          t = key.split('_');
          //检查是否存在对应的操作
          //TODO: 处理诸如 name_and_phone_eq 或者 name_or_phone_eq的情况
          fn = map[t.pop()];

          if(typeof fn == 'function'){
            condition = {};
            condition[t.join('_')] = fn(query[key]);
            console.log(condition);
            conditions.push([condition]);
          }
        }
        for(var i=0;i < conditions.length;i++){
          chains = chains.find.apply(chains, conditions[i]);
        }

        if(cb){
          return chains.run(cb);
        }else{
          return chains;
        }
      };
    }
  };
}