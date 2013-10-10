var filesystem = require('fs');
var models = {};
var relationships = {};

var metaMap = {
    eq: function(name, val){
        var c = {};
        c[name] = val;
        return c;
    },
    ne: function(name, val){
        var c = {};
        c[name] = { ne: val };
        return c;
    },
    gt: function(name, val){
        var c = {};
        c[name] = { gt: val };
        return c;
    },
    gte: function(name, val){
        var c = {};
        c[name] = { gte: val };
        return c;
    },
    lt: function(name, val){
        var c = {};
        c[name] = { lt: val };
        return c;
    },
    lte: function(name, val){
        var c = {};
        c[name] = { lte: val };
        return c;
    },
    between: function(name, val){
        var c = {};
        c[name] = { between: val.split(',') };
        return c;
    },
    not_between: function(name, val){
        var c = {};
        c[name] = { nbetween: val.split(',') };
        return c;
    },
    like: function(name, val){
        var c = {};
        c[name] =  [ name + ' like ?', '%' + val + '%'];
        return c;
    },
    inc: function(name, val){
        var c = {};
        c[name] =  val.split(',');
        return c;
    }
  };

/**
* 智能搜索
* @param  {Hash}   query
*                  example: {name_eq: xxx} -> {name: orm.eq(xxx)}
* @return {Chains}
*/

var metaSearch = function (query) {
    var chains = this.findAll();
    var conditions = [];
    var t, fn, condition;

    for(var key in query){
      t = key.split('_');
      //检查是否存在对应的操作
      //TODO: 处理诸如 name_and_phone_eq 或者 name_or_phone_eq的情况
      fn = metaMap[t.pop()];

      if(typeof fn == 'function'){
        condition = fn(t.join('_'), query[key]);
        console.log(condition);
        conditions.push(condition);
      }
    }
    for(var i=0;i < conditions.length;i++){
      chains = chains.find.apply(chains, conditions[i]);
    }
    return chains;
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
            classMethods.pages = function(){

            }
            classMethods.search = function(){

            }
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