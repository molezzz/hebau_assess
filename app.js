
/**
 * Module dependencies.
 */

var express = require('express');
var engine = require('ejs-locals')
var routes = require('./routes');
var user = require('./routes/user');
var admin = require('./routes/admin');
var adminUser = require('./routes/admin/user');
var adminDepartment = require('./routes/admin/department');
var adminProject = require('./routes/admin/project');

var http = require('http');
var path = require('path');
var passport = require('passport');
var moment = require('moment');
var orm = require('orm');
//var paging = require('orm-paging');
//var modts = require('orm-timestamps');
var ex = require('lodash');
var Resource = require('express-resource');
var orm = require('./lib/seq-models');



var app = express();

var dbConfig = {
  development: 'mysql://mole:mole628@221.194.37.108/assess',
  //development: 'mysql://sql419985:fB4*dI1%25@sql4.freemysqlhosting.net/sql419985',
  /*
  //ORM2
  production: {
    database: "assess",
    protocol: "mysql",
    host: 'localhost', //"molezz.db",
    username: "bdall",
    password: "bdall",
    query: {
        pool: true,
        debug: false
    }
  },
  */
  production: 'mysql://hebau:hebau@localhost/assess',
  test: 'mysql://bdall:bdall@192.168.3.2/assess'
};
orm.setup(__dirname + '/models', dbConfig[app.get('env')]);
// all environments
app.engine('ejs', engine);
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('462267f305f61b7572b5'));
app.use(express.cookieSession({ key:'hebau_assess_sess', secret: '9a63f01779e0f8c98dad24800984157e462267f305f61b7572b5' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
// development only
app.configure('development', function(){
  app.use(express.errorHandler());

});
// production only
app.configure('production', function(){

});
app.locals.inspect = require('util').inspect;

app.get('/admin/setup', routes.setup);
app.get('/admin/login', admin.login);
app.get('/admin/dashboard', admin.index);
app.resource('admin/users', adminUser);
app.resource('admin/departments', adminDepartment);
app.resource('admin/projects', adminProject);
app.post('/admin/user/reset/password', adminUser.resetPassword);
app.get('/users', user.list);
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
