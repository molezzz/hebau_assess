/*
 * admin
 */

exports.login = function(req, res){
  res.render('admin/login', { title: 'Express' });
}

exports.index = function(req, res){
  res.render('admin/index', { title: 'Express' });
}
