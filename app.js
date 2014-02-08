
/**
 * Module dependencies.
 */

var express = require('express');
var socketIo = require('socket.io');
var engine = require('ejs-locals')
var routes = require('./routes');
var user = require('./routes/user');
var admin = require('./routes/admin');
var adminUser = require('./routes/admin/user');
var adminDepartment = require('./routes/admin/department');
var adminMember = require('./routes/admin/member');
var adminProject = require('./routes/admin/project');
var adminRule = require('./routes/admin/rule');
var adminAccount = require('./routes/admin/account');
var adminReport = require('./routes/admin/report');

var http = require('http');
var path = require('path');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var moment = require('moment');
//var orm = require('orm');
//var paging = require('orm-paging');
//var modts = require('orm-timestamps');
var ex = require('lodash');
var Resource = require('express-resource');
var orm = require('./lib/seq-models');



var app = express();
var socketSrv = { io: null, clients: {} };

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
orm.setup(__dirname + '/models', dbConfig[app.get('env')],{ logging: console.log });
// all environments
app.engine('ejs', engine);
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('462267f305f61b7572b5'));
app.use(express.cookieSession({
  key:'hebau_assess_sess',
   secret: '9a63f01779e0f8c98dad24800984157e462267f305f61b7572b5',
   cookie: { maxAge : 3600000 * 8 } //8小时过期
}));
app.use(flash());
app.use(express.methodOverride());
app.use(function (req, res, next) {
  res.socketSrv = socketSrv;
  //console.log('Setup socket.io');
  next();
});
//app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
//初始化passport必须在static之后，router之前。
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
// development only
app.configure('development', function(){
  app.use(express.errorHandler());

});
// production only
app.configure('production', function(){

});
app.locals.inspect = require('util').inspect;

passport.use(new LocalStrategy(
  {passReqToCallback: true},
  function(req, username, password, done) {
    var admin = password != 'HEBAUACC';
    var Account = orm.model('account');
    var User = orm.model('user');
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if(admin){
      User.login(username, password, function(error, user){
        return error ? done(null, false, { message: '用户名或密码错误！' }) : done(null, user);
      });
    } else {
      Account.find({
        where: { name: username, invalid: false }
      }).success(function(account){
        if (!account) {
          return done(null, false, { message: '帐户名错误！' });
        }
        account.updateAttributes({
          last_login_at: new Date(),
          last_login_ip: ip
        })
        .success(function(){
          return done(null, account);
        })
        .error(function(errors){
          console.log(errors);
          return done(null, account);
        });
      }).error(function(errors){
        console.log(errors);
        return done(errors);
      });
    };
  }
));
passport.serializeUser(function(user, done) {
  var model = user.getModel();
  done(null, {model: model.name, id: user.id});
});

passport.deserializeUser(function(obj, done) {
  var model = orm.model(obj.model);
  if(!model){
    return done(null, null);
  };
  model.find(obj.id)
  .success(function(user){
    return done(null, user);
  })
  .error(function(errors){
    return done(errors, null);
  });
});

passport.accountAuth = function(req, res, next){
  var isAcc = req.isAuthenticated() && req.user.getModel().name == 'account';
  if(isAcc){
    return next();
  }else{
    res.redirect('/');
  }
};

passport.adminAuth = function(req, res, next){
  var isAdmin = req.isAuthenticated() && req.user.getModel().name == 'user';
  //console.log(admin.getModel());
  if(req.params[0] == 'login' || isAdmin){
    res.locals({
      admin: req.user
    });
    return next();
  }else{
    res.redirect('/admin/login');
  }
};

app.all('/admin/*', passport.adminAuth);
app.get('/admin/setup', routes.setup);
app.get('/admin/login', admin.login);
app.get('/admin/dashboard', admin.index);
app.resource('admin/users', adminUser);
app.resource('admin/departments', adminDepartment);
app.resource('admin/members', adminMember);
app.get('/admin/accounts/excel', adminAccount.excel);
app.resource('admin/accounts', adminAccount);
app.get('/admin/accounts/wizard/deps', adminAccount.wizardDeps);
app.post('/admin/accounts/wizard/run', adminAccount.wizardRun);
app.put('/admin/accounts/disable/all', adminAccount.disableAll);
app.post('/admin/project/:project/record/update/total', adminProject.updateRecordTotal);
app.post('/admin/project/:project/update/report', adminProject.updateReport);
var projects = app.resource('admin/projects', adminProject);
var rules = app.resource('rules', adminRule);
projects.add(rules);
app.get('/admin/reports', adminReport.index);
app.get('/admin/report', adminReport.show);
app.post('/admin/user/reset/password', adminUser.resetPassword);
app.post('/admin/login', passport.authenticate('local', {
  successRedirect: '/admin/reports',
  failureRedirect: '/admin/login',
  failureFlash: true
}));
app.get('/admin/logout', function(req, res){
  req.logout();
  res.redirect('/admin/login');
});
app.get('/users', user.list);
app.post('/login', passport.authenticate('local', {
  successRedirect: '/projects',
  failureRedirect: '/',
  failureFlash: true
}));
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
app.get('/projects', passport.accountAuth, routes.projects);
app.post('/projects/records', passport.accountAuth, routes.saveRecord);
app.get('/', routes.index);

var server = http.createServer(app);
socketSrv.io = socketIo.listen(server);
socketSrv.io.sockets.on('connection', function (socket) {
  socketSrv.clients[socket.id] = socket;
  socket.emit('server_ok', { status: 'OK', msg: '服务器准备就绪... OK', cid: socket.id});
  socket.on('account_ready', function(data){
    console.log(data);
  });
});
socketSrv.io.sockets.on('disconnect', function () {
   console.log('disconnect client event....');
});
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
