/*
 * 用于管理user
 */
var ex = require('lodash');
var moment = require('moment');

var shared = {
  userMenuActive: 'active'
};

exports.index = function(req, res){
  var User = req.models.User;
  var page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  switch (req.format) {
      case 'json':
        User.search(req.query.q || {}).pages(function(err, totalPages){
          this.page(page).only(User.safeFields())
              .order('-created_at').run(function(err, users){
                res.json({ totalPages: totalPages, users: users });
              });
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
  var user = req.body['user'];
  var result = {
    success: false,
    msg: ''
  };

  req.models.User.create(user, function(err, items){
    if(err){
      result.msg = err;
    }else{
      result.success = true;
      result.msg = '新用户添加成功！';
    }
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
  var User = req.models.User;
  var result = {success: false, msg: ''};

  User.get(userId, function(err, user){
    if(err){
      result.msg = '更新失败! 修改的用户不存在！';
      res.json(result);
      return;
    }
    var data = {};
    ex.each(['name', 'email', 'phone', 'group_id'], function(key){
      data[key] = req.body.user[key];
    });

    user.save(data, function(err){
      if(err){
        result.msg = '更新失败! 写入数据库出错！';
        res.json(result);
        return;
      }
      result.msg = '更新成功';
      result.success = true;
      res.json(result);
    });


  });
};

exports.destroy = function(req, res){
  var userId = req.params.user;
  var User = req.models.User;
  var result = {success: false, msg: ''};

  User.get(userId, function(err, user){
    if(err){
      result.msg = '删除失败! 用户不存在！';
      res.json(result);
      return;
    }
    user.remove(function(err){
      if(err){
        result.msg = '删除失败! 写入数据库出错！';
        res.json(result);
        return;
      }
      result.msg = '用户已删除！';
      result.success = true;
      res.json(result);
    });

  });

};