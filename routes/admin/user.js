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
        User.pages(function(err, totalPages){
          User.page(page).only(User.safeFields())
              .order('-created_at').run(function(err, users){
                res.json({ totalPages: totalPages, users: users });
              });
        });
        break;
      default:
        res.render('admin/user/index', ex.extend({ title: '人员管理' }, shared));
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
      result.msg = error;
    }else{
      result.success = true;
    }
    res.json(result);
  });
};

exports.show = function(req, res){
  res.send('show forum ' + req.params.forum);
};

exports.edit = function(req, res){
  res.send('edit forum ' + req.params.forum);
};

exports.update = function(req, res){
  res.send('update forum ' + req.params.forum);
};

exports.destroy = function(req, res){
  res.send('destroy forum ' + req.params.forum);
};