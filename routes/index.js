var ex = require('lodash');
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
  ex(req.models).forEach(function(model, k){
    model.sync(function(err) {
      console.log('Sync Table -> ' + k + ' ' + (err ? 'Failed' : 'OK' ));
    });
  });
  res.send('ok');
}