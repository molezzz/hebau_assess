var ex = require('lodash');
var orm = require('../lib/seq-models');
var Seq = orm.Seq();
/*
 * GET home page.
 */

exports.index = function(req, res){
  var isAcc = req.isAuthenticated() && req.user.getModel().name == 'account';
  if(isAcc){
    res.redirect('/projects');
  }else{
    res.render('index', { title: '登录', message: req.flash('error') });
  }
};

exports.projects = function(req, res){
  var account = req.user;
  var Department = orm.model('department');
  var Member = orm.model('member');
  var Project = orm.model('project');
  var Rule = orm.model('rule');
  var Record = orm.model('record');
  var chainer = new Seq.Utils.QueryChainer();
  var data = {
    title: '河北农大考评系统',
    pCates: Project.cates(),
    pTypes: Project.types()
  };
  var now = new Date();
  var q = {
    department: {attributes: ['id','name','category_id']},
    member: {
      attributes: ['id','department_id','name','description','position_id']
    },
    project: {
      where: { begin_at : {lt: now}, end_at: {gt: now}, category: account.category },
      attributes: ['id', 'type', 'category', 'dcate', 'mpos', 'name', 'description'],
      include: [{
        model: Rule, as: 'rules',where: {parent_id: 0}, attributes: ['id', 'name', 'key'],
        include: [{model: Rule, as: 'children', attributes: ['id', 'name', 'items', 'key']}]
      }]
    }
  };
  //自评，只取本单位
  if(account.category == 'SA'){
    q['department']['where'] = { id: account.department_id };
    q['member']['where'] = { department_id: account.department_id };
    q['project']['where']['dcate'] = account.department.category_id;
  };
  chainer.add(Department.findAll(q['department']))
  .add(Member.findAll(q['member']))
  .add(Project.findAll(q['project']))
  .run()
  .success(function(results){
    var pids = [];
    data.account = account;
    data.department = null;
    data.departments = {}; //{'部门ID': department}
    data.members = {}; // {'部门类别-职位类别': {'部门ID': [member...]}}
    data.projects = results[2];
    data.recordExists = {};
    ex.forEach(results[0],function(dep){
      data.departments[dep.id] = dep;
    });
    ex.forEach(results[1],function(member){
      //按照 部门类别-级别 分组
      var dep = data.departments[member.department_id];
      var key = [dep.category_id, member.position_id].join('-');
      if(!data.members[key]) data.members[key] = {};
      if(!data.members[key][member.department_id]) data.members[key][member.department_id] = [];
      data.members[key][member.department_id].push(member);
    });
    data.department = data.departments[account.department_id];
    ex.forEach(data.projects, function(p){
      pids.push(p.id);
    });
    Record.findAll({
      where: { account_id: account.id, project_id: pids },
      attributes: ['id', 'project_id', 'department_id', 'member_id']
    }).success(function(records){
      ex.forEach(records, function(r){
        var id = r.member_id > 0 ? r.member_id : r.department_id;
        if(!data.recordExists[r.project_id]) data.recordExists[r.project_id] = {};
        data.recordExists[r.project_id][id] = 1;
      });
      res.render('projects', data);
    }).error(function(errors){
      console.log(errors);
      data.errors = errors;
      res.render('projects', data);
    });

  })
  .error(function(errors){
    res.send(errors);
  });
};

exports.saveRecord = function(req, res){
  var Record = orm.model('record');
  var Project = orm.model('project');
  var record = req.body['record'];
  var result = {success: false, msg: ''};
  var account = req.user;
  var now = new Date();

  record.account_id = account.id;

  Project.find({
    where: {
      id: record.project_id,
      category: account.category,
      begin_at: {lt: now},
      end_at: {gt: now}
    },
    attributes: ['id', 'category']
  })
  .success(function(project){
    if(!project) {
      result.msg = '结果保存失败，项目不存在，或暂不允许“'+ account.name +'”投票';
      result.errors = null;
      res.json(result);
      return;
    };
    Record.create(record).success(function(rule){
      result.success = true;
      result.msg = '结果保存成功！';
      result.rule = rule;
      res.json(result);
    }).error(function(errors){
      result.msg = '结果保存失败';
      result.errors = errors;
      console.log(errors);
      res.json(result);
    });
  })
  .error(function(errors){
    result.msg = '结果保存失败';
    result.errors = errors;
    console.log(errors);
    res.json(result);
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