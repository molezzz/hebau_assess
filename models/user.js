var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');
var rnds = require('randomstring');
var crypto = require('crypto');
//var moment = require('moment');

//对密码进行散列
var encryptPassword = function(pwd, salt){
  var shasum = crypto.createHash('sha1');
  return shasum.update(salt + '-' + pwd).digest('hex');
}

//猜测用户名
var guessName = function(name){
  var r = {};
  if(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(name)){
    r = {email: name};
  }else if(/^1[3|4|5|8][0-9]\d{4,8}$/.test(name)){
    r = {phone: name};
  }else{
    r = {name: name};
  }
  return r;
}

module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    group_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    is_admin: { type: Seq.BOOLEAN, defaultValue: true},
    name: { type: Seq.STRING, allowNull: false },
    email: {
      type: Seq.STRING, allowNull:false, unique: true,
      validate: { notEmpty: true }
    },
    phone: { type: Seq.STRING, unique: true },
    password: { type: Seq.STRING },
    salt: { type: Seq.STRING(6) }
  },
  relations: {

  },
  options: {
    timestamps: true,
    hooks: {
      beforeCreate: function(user, next){
        var password = (!user.password || user.password == '') ? user.phone : user.password;
        user.setPassword(password);
        return next();
      }
    },
    classMethods: {
      encryptPassword: encryptPassword,

      safeFields: function(){
        return ex.filter(ex.keys(fields), function(key){
          return key != 'salt' && key != 'password';
        });
      },

      /*
       * 使用用户名、密码登陆
       * param String username
       * param String password
       * param Function cb(err, user)
       */
      login: function(username, password, cb){
        this.find(guessName(uesername), 1, function(err, user){
          if(err || (user && user.checkPassword(password))){
            cb(true, null);
          }else{
            cb(false, user);
          }
        });
      }
    },
    instanceMethods: {
      checkPassword: function(password){
        return this.password == encryptPassword(password, this.getSalt());
      },
      //获取盐值，没有则自动创建
      getSalt: function(){
        if(!this.salt || this.salt == ''){
          //生成随机盐值
          this.salt = rnds.generate(6);
        }
        return this.salt;
      },
      setPassword: function(password){
        this.password = encryptPassword(password, this.getSalt());
      }
    }
  }
};