var ex = require('lodash');
var orm = require('../lib/seq-models');
var Seq = orm.Seq();
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.login = function(req, res){
  res.render('index', { title: 'Express' });
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