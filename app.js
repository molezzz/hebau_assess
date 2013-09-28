
/**
 * Module dependencies.
 */

var express = require('express');
var engine = require('ejs-locals')
var routes = require('./routes');
var user = require('./routes/user');
var admin = require('./routes/admin');
var http = require('http');
var path = require('path');
var passport = require('passport');
var orm = require('orm');
var ex = require('lodash');
var Resource = require('express-resource');
//var paging = require('orm-paging');
var paging = require('./lib/orm-paginate');
var metaSearch = require('./lib/orm-metasearch');

var app = express();

var dbConfig = {
  development: 'mysql://bdall:bdall@192.168.3.2/assess?pool=true&debug=true',
  production: {
    database: "assess",
    protocol: "mysql",
    host: "molezz.db",
    username: "bdall",
    password: "bdall",
    query: {
        pool: true,
        debug: false
    }
  },
  test: 'mysql://bdall:bdall@192.168.3.2/assess?pool=true&debug=true'
};

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
app.use(orm.express(dbConfig[app.get('env')],{
  define: function (db, models, next) {
    db.use(paging);
    db.use(metaSearch);

    ex(['User', 'Group']).forEach(function(v, k){
      models[v] = require('./models/' + v.toLowerCase())(db);
    });
  }
}));
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

//app.get('/setup', routes.setup);
app.get('/admin/login', admin.login);
app.get('/admin/dashboard', admin.index);
app.resource('admin/users', require('./routes/admin/user'));
app.get('/users', user.list);
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
