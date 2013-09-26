var orm = require('orm');
var ex = require('lodash');
var rnds = require('randomstring');
var crypto = require('crypto');

module.exports = exports = function(db) {

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

    var User = db.define('users', {
      group_id    : { type: 'number', defaultValue: 0, rational: false },
      is_admin    : { type: 'boolean', defaultValue: false},
      name        : { type: 'text', require: true },
      email       : { type: 'text', unique: true },
      password    : String,
      salt        : { type: 'text', size: 6 },
      phone       : { type: 'text', unique: true, require: true },
      created_at  : Date,
      updated_at  : Date
    },{
      methods: {
        checkPassword: function(password){
          return this.password == encryptPassword(password, this.getSalt());
        },
        //获取盐值，没有则自动创建
        getSalt: function(){
          if(this.salt == ''){
            //生成随机盐值
            this.salt = rnds.generate(6);
          }
          return this.salt;
        },
        setPassword: function(password){
          this.password = encryptPassword(password, this.getSalt());
        }
      },
      hooks: {
        beforeCreate: function (next) {
          setPassword(this.password);
          next();
        }
      },
      validations: {

      }
    });

    User.encryptPassword = encryptPassword;

    /*
     * 使用用户名、密码登陆
     * param String username
     * param String password
     * param Function cb(err, user)
     */
    User.login = function(username, password, cb){
      User.find(guessName(uesername), 1, function(err, user){
        if(err || (user && user.checkPassword(password))){
          cb(true, null);
        }else{
          cb(false, user);
        }
      });
    }

    return User;

};
