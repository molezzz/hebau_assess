/*
 * 用于管理user
 */
var ex = require('lodash');
var moment = require('moment');
var orm = require('../../lib/seq-models');

var shared = {
  userMenuActive: 'active'
};

exports.index = function(req, res){
  var User = orm.model('user');
  var page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  switch (req.format) {
      case 'json':
        // User.search(req.query.q || {}).pages(function(err, totalPages){
        //   this.page(page).only(User.safeFields())
        //       .order('-created_at').run(function(err, users){
        //         res.json({ totalPages: totalPages, users: users });
        //       });
        // });
        User.findAll().success(function(users){
          res.json({ totalPages: 1, users: users });
        });
        break;
      default:
        res.render('admin/user/index', ex.extend({ title: '用户管理' }, shared));
  }
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  var User = orm.model('user');
  var user = req.body['user'];
  var result = {
    success: false,
    msg: ''
  };

  //新版Sequelize将会实现hooks。之前临时采用手动的办法
  user = User.build(user);
  user.setPassword(user.phone);

  //User.create(user).success(function(user){
  user.save().success(function(user){
    result.success = true;
    result.msg = '新用户添加成功！';
    res.json(result);
  }).error(function(errors){
    result.msg = '添加失败';
    result.errors = errors;
    console.log(errors);
    res.json(result);
  });

};

exports.show = function(req, res){
  res.json({});
};

exports.edit = function(req, res){
  res.json({});
};

exports.update = function(req, res){
  var userId = req.params.user;
  var User = orm.model('user');
  var result = {success: false, msg: ''};

  User.find(userId).success(function(user){
    user.updateAttributes(req.body.user, ['name', 'email', 'phone', 'group_id'])
        .success(function(){
          result.msg = '更新成功';
          result.success = true;
          res.json(result);
        })
        .error(function(errors){
          result.msg = '更新失败! 写入数据库出错！';
          console.log(errors);
          res.json(result);
        });

  }).error(function(errors){
    result.msg = '更新失败! 修改的用户不存在！';
    console.log(errors);
    res.json(result);
  });

};

exports.destroy = function(req, res){
  var users = req.params.user.split('-');
  var User = orm.model('user');
  var result = {success: false, msg: ''};
  User.destroy({id: users})
      .success(function(){
        result.msg = '用户已删除！';
        result.success = true;
        res.json(result);
      })
      .error(function(errors){
        result.msg = '删除失败! 写入数据库出错！';
        console.log(errors);
        res.json(result);
      });

};

exports.resetPassword = function(req, res){
  var uid = req.query.uid;
  var password = req.body.password;
  var result = {success: false, msg: '密码不能为空！'};
  if(password && password != ''){
    var User = orm.model('user');
    console.log(uid);
    User.find(uid)
        .success(function(user){
          user.setPassword(password);
          user.save()
              .success(function(){
                result.msg = '密码已修改为：“ '+ password +' ”';
                result.success = true;
                res.json(result);
              })
              .error(function(errors){
                result.msg = '更新失败! 写入数据库出错！';
                console.log(errors);
                res.json(result);
              })
        })
        .error(function(errors){
          result.msg = '更新失败! 用户不存在！';
          console.log(errors);
          res.json(result);
        });
  }else{
    req.json(result);
  }
}