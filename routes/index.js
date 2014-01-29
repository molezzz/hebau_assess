var ex = require('lodash');
var orm = require('../lib/seq-models');
var Seq = orm.Seq();
/*
 * GET home page.
 */

exports.index = function(req, res){
  if(req.isAuthenticated()){
    res.redirect('/projects');
  }else{
    res.render('index', { title: 'Express', message: req.flash('error') });
  }
};

exports.projects = function(req, res){
  var account = req.user;
  account.getDepartment()
  .success(function(dep){
    res.render('projects', { title: '河北农大考评系统', account: account, department: dep});
  })
  .error(function(errors){
    res.send(errors);
  });
};

exports.setup = function(req, res){
  var chainer = new Seq.Utils.QueryChainer();
  ex(orm.models()).forEach(function(model, k){
    chainer.add(model.sync());
    console.log('Sync Table -> ' + k );
  });

  chainer.run()
  .success(function(){
    res.send('ok');
  }).error(function(error){
    res.send(error);
  });

}