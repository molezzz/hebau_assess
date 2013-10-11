var filesystem = require('fs');
var ex = require('lodash');
var models = {};
var relationships = {};

var metaMap = {
    eq: function(name, val){
        return [name, val];
    },
    ne: function(name, val){
        return [name, { ne: val }];
    },
    gt: function(name, val){
        return [name, { gt: val }];
    },
    gte: function(name, val){
        return [name, { gte: val }];
    },
    lt: function(name, val){
        return [name, { lt: val }];
    },
    lte: function(name, val){
        return [name, { lte: val }];
    },
    between: function(name, val){
        return [name, { between: val.split(',') }];
    },
    not_between: function(name, val){
        return [name, { nbetween: val.split(',') }];
    },
    like: function(name, val){
        return [name, { like: '%' + val + '%'}];
    },
    inc: function(name, val){
        return [name, val.split(',')];
    }
  };

/**
* 智能搜索
* @param  {Hash}   query
*                  example: {name_eq: xxx} -> {name: orm.eq(xxx)}
* @return {Chains}
*/

var metaSearch = function (query, options) {
    var opts = options || {};
    var next = (opts['offset'] || opts['limit']) ? this.findAndCountAll : this.findAll

    var conditions = {};
    var t, fn, condition;

    for(var key in query){
      t = key.split('_');
      //检查是否存在对应的操作
      //TODO: 处理诸如 name_and_phone_eq 或者 name_or_phone_eq的情况
      fn = metaMap[t.pop()];

      if(typeof fn == 'function'){
        condition = fn(t.join('_'), query[key]);
        console.log(condition);
        conditions[condition[0]] = condition[1];
      }else{
        conditions[key] = query[key];
      }
    }
    console.log(ex.extend({where: conditions}, opts));
    return next.call(this, ex.extend({where: conditions}, opts));
};
var pages = function(page, perpage){
    perpage = perpage || 20;
    page = page || 1;
    page = Math.max(parseInt(page), 1);
    perpage = Math.max(parseInt(perpage), 1);
    return {offset: (page - 1) * perpage, limit: perpage};
};

var singleton = function singleton(){
    var Sequelize = require("sequelize");
    var sequelize = null;
    var modelsPath = "";
    /*
    this.setup = function (path, database, username, password, obj){
        modelsPath = path;

        if(arguments.length == 3){
            sequelize = new Sequelize(database, username);
        }
        else if(arguments.length == 4){
            sequelize = new Sequelize(database, username, password);
        }
        else if(arguments.length == 5){
            sequelize = new Sequelize(database, username, password, obj);
        }
        init();
    };
    */
    this.setup = function(path, connectionStr, options){
        modelsPath = path;
        options = options || {};
        sequelize = new Sequelize(connectionStr, options);
        init();
    }

    this.model = function (name){
        return models[name];
    }

    this.Seq = function (){
        return Sequelize;
    }

    this.models = function(){
        return models;
    }

    function init() {
        filesystem.readdirSync(modelsPath).forEach(function(name){
            var object = require(modelsPath + "/" + name);
            var _ = Sequelize.Utils._;
            var options = object.options || {};
            var classMethods = {};
            var modelName = name.replace(/\.js$/i, "");
            //添加metasearch 和 paginate
            classMethods.pages = pages;
            classMethods.search = metaSearch;

            _.extend(classMethods, options.classMethods);
            options.classMethods = classMethods;
            models[modelName] = sequelize.define(modelName, object.model, options);

            if("relations" in object){
                relationships[modelName] = object.relations;
            }
        });
        //console.log(models);
        for(var name in relationships){
            var relation = relationships[name];
            for(var relName in relation){
                var related = relation[relName];
                console.log(related)
                models[name][relName](models[related]);
            }
        }
    }

    if(singleton.caller != singleton.getInstance){
        throw new Error("This object cannot be instanciated");
    }
}

singleton.instance = null;

singleton.getInstance = function(){
    if(this.instance === null){
        this.instance = new singleton();
    }
    return this.instance;
}

module.exports = singleton.getInstance();