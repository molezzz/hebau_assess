/*
 * admin
 */
var ex = require('lodash');

var shared = {
  dashboardMenuActive: 'active'
};

exports.login = function(req, res){
  var isAdmin = req.isAuthenticated() && req.user.getModel().name == 'user';
  //console.log(req.user.getModel());
  if(isAdmin){
    res.redirect('/admin/reports');
  } else {
    res.render('admin/login', { title: '登录-后台', message: req.flash('error') });
  };
}

exports.index = function(req, res){
  res.render('admin/index',
    ex.extend({ title: '控制面板', host: req.get('host').split(':')[0] }, shared)
  );
}
