/*
 * 用于管理rule
 */
var ex = require('lodash');
var moment = require('moment');
var orm = require('../../lib/seq-models');

var shared = {
  projectMenuActive: 'active'
};

exports.index = function(req, res){
  var Rule = orm.model('rule');
  var Project = orm.model('project');
  var pid = req.params.project;
  Project.find(pid).success(function(project){
    if(!project){
      res.status(404).send('Project with ID:' + pid + ' not found');
      return;
    };
    project.getRules({
      include: [{ model:Rule, as: 'children'}],
      order: 'id DESC'
    }).success(function(rules){
      switch (req.format) {
        case 'json':
          res.json({ total: 0, rules: [] });
          break;
        default:
          res.render('admin/rule/index',
            ex.extend({
              title: '考评管理',
              project: project,
              rules: rules
            }, shared)
          );
      };
    }).error(function(errors){
      console.log(errors);
      res.status(500).send('System Error<br/>' + errors);
    });
  }).error(function(errors){
    console.log(errors);
    res.status(500).send('System Error<br/>' + errors);
  });
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  var Rule = orm.model('rule');
  var rule = req.body['rule'];
  var pid = req.params.project;
  var result = {
    success: false,
    msg: ''
  };
  rule.project_id = pid;
  console.log(rule);
  //新版Sequelize将会实现hooks。之前临时采用手动的办法
  rule = Rule.build(rule);

  rule.save().success(function(rule){
    result.success = true;
    result.msg = '新规则添加成功！';
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
  var ruleId = req.params.rule;
  var Rule = orm.model('rule');
  var result = {success: false, msg: ''};

  Rule.find(ruleId).success(function(rule){
    rule.updateAttributes(req.body.rule, ['type','category','name', 'description', 'high_cut', 'low_cut', 'begin_at', 'end_at'])
        .success(function(){
          result.msg = '更新成功';
          result.success = true;
          res.json(result);
        })
        .error(function(errors){
          result.msg = '更新失败! 写入数据库出错！';
          console.log(errors);
          res.json(result);
        });

  }).error(function(errors){
    result.msg = '更新失败! 修改的部门不存在！';
    console.log(errors);
    res.json(result);
  });

};

exports.destroy = function(req, res){
  var rules = req.params.rule.split('-');
  var Rule = orm.model('rule');
  var result = {success: false, msg: ''};
  Rule.destroy({id: rules})
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