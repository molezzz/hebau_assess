/*
 * 用于管理project
 */
var ex = require('lodash');
var moment = require('moment');
var orm = require('../../lib/seq-models');

var shared = {
  projectMenuActive: 'active'
};

exports.index = function(req, res){
  var Project = orm.model('project');
  switch (req.format) {
      case 'json':
        var opts = Project.pages(req.query.page, req.query.prepage);
        opts.order = 'id DESC';
        Project.search(req.query.q || {}, opts).success(function(projects){
          res.json({ total: projects.count, projects: projects.rows });
        });
        break;
      default:
        res.render('admin/project/index',
          ex.extend({
            title: '考评管理',
            cates: Project.cates(),
            types: Project.types()
          }, shared)
        );
  }
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  var Project = orm.model('project');
  var project = req.body['project'];
  var result = {
    success: false,
    msg: ''
  };
  //console.log(project);
  //新版Sequelize将会实现hooks。之前临时采用手动的办法
  project = Project.build(project);

  project.save().success(function(project){
    result.success = true;
    result.msg = '新部门添加成功！';
    res.json(result);
  }).error(function(errors){
    result.msg = '添加失败';
    result.errors = errors;
    console.log(errors);
    res.json(result);
  });

};

exports.show = function(req, res){
  res.json({});
};

exports.edit = function(req, res){
  res.json({});
};

exports.update = function(req, res){
  var projectId = req.params.project;
  var Project = orm.model('project');
  var result = {success: false, msg: ''};

  Project.find(projectId).success(function(project){
    console.log(req.body.project);
    project.updateAttributes(req.body.project, ['type','category','name', 'description', 'high_cut', 'low_cut', 'begin_at', 'end_at'])
        .success(function(){
          result.msg = '更新成功';
          result.success = true;
          res.json(result);
        })
        .error(function(errors){
          result.msg = '更新失败! 写入数据库出错！';
          result.errors = errors;
          console.log(errors);
          res.json(result);
        });

  }).error(function(errors){
    result.msg = '更新失败! 修改的部门不存在！';
    result.errors = errors;
    console.log(errors);
    res.json(result);
  });

};

exports.destroy = function(req, res){
  var projects = req.params.project.split('-');
  var Project = orm.model('project');
  var result = {success: false, msg: ''};
  //TODO 删除相关数据
  Project.destroy({id: projects})
      .success(function(){
        result.msg = '考评已删除！';
        result.success = true;
        res.json(result);
      })
      .error(function(errors){
        result.msg = '删除失败! 写入数据库出错！';
        console.log(errors);
        res.json(result);
      });

};

//更新record的总分
exports.updateRecordTotal = function(req, res){
  var chainer = new (orm.Seq().Utils.QueryChainer)();
  var Rule = orm.model('rule');
  var Record = orm.model('record');
  var pid = req.params.project;
  var updateAll = req.query.update_all ? true : false;
  var result = {success: false, msg: ''};  

  chainer.add(Rule.findAll({
    where: { project_id: pid, parent_id: 0 },
    include: [{model: Rule, as: 'children'}]
  }))
  .add(Record.findAll({
    where: updateAll ? {project_id: pid} : { project_id: pid, answer: {ne: '{}'}, total: 0 },
    attributes: ['id','answer','total']
  }))
  .run()
  .success(function(result){
    var rules = {};
    var records = result[1];
    var updateChainer = new (orm.Seq().Utils.QueryChainer)();   
    
    ex.forEach(result[0], function(pRule){
      //计算分值占比
      ex.forEach(pRule.children, function(rule){
        var items = rule.items;
        for(key in items){
          items[key] = (items[key] * pRule.scale) / 100;
        };
        rules[rule.id] = items;
      });      
    });
    ex.forEach(records, function(record, id){
      var t = 0;
      var ans = record.answer;      
      for(key in ans){
        console.log([ans[key], rules[key], rules[key][ans[key]] ]);
        t = t + (rules[key] ? rules[key][ans[key]] : 0); 
      };      
      //record.total = t;
      updateChainer.add(record, 'updateAttributes', [{ total: t }, ['total']], {
        after: function(record) {
          console.log(record.id);
        }
      });
    });
    updateChainer.runSerially({ skipOnError: true })
    .success(function(){
      result.msg = '更新完成！';      
      result.success = true;
      res.json(result);
    })
    .error(function(errors){
      result.msg = '数据库错误！';
      console.log(errors);
      result.errors = errors;
      res.json(result);
    });
  })
  .error(function(errors){
    result.msg = '数据库错误！';
    console.log(errors);
    result.errors = errors;
    res.json(result);
  });
}