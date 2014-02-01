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
  var Department = orm.model('department');
  var Member = orm.model('member');
  var Project = orm.model('project');
  var Rule = orm.model('rule');
  var chainer = new Seq.Utils.QueryChainer();
  var data = { 
    title: '河北农大考评系统',
    pCates: Project.cates(),
    pTypes: Project.types()
  };
  var now = new Date();

  chainer.add(Department.findAll({attributes: ['id','name']}))
  .add(Member.findAll({
    attributes: ['id','department_id','name','description','position_id']
  }))
  .add(Project.findAll({
    where: { begin_at : {lt: now}, end_at: {gt: now} },
    include: [{
      model: Rule, as: 'rules',where: {parent_id: 0},
      include: [{model: Rule, as: 'children'}]
    }]
  }))
  .run()  
  .success(function(results){
    data.account = account;
    data.department = null;    
    data.departments = {};
    data.members = {};
    data.projects = results[2];
    ex.forEach(results[0],function(dep){
      data.departments[dep.id] = dep;          
    });
    ex.forEach(results[1],function(member){
      if(!data.members[member.department_id]) data.members[member.department_id] = [];
      data.members[member.department_id].push(member);      
    });
    data.department = data.departments[account.department_id];    
    res.render('projects', data);
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