/*
 * 用于管理rule
 */
var ex = require('lodash');
var moment = require('moment');
var orm = require('../../lib/seq-models');
var Seq = orm.Seq();

var shared = {
  projectMenuActive: 'active'
};
var attrs = [
  'name', 'items', 'project_id',
  'parent_id','scale', 'key'
];
var formatItems = function(items){
  if(!items) return {};
  var _items = {};  
  //将选项分数格式化成数字
  ex.forEach(items, function(v, k){
    _items[k] = v * 1;
  });
  return _items;  
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
    Rule.findAll({
      include: [{ model:Rule, as: 'children'}],
      where: { 'rules.parent_id': {lt: 1}, 'rules.project_id': project.id },
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
  rule.items = formatItems(rule.items);

  Rule.create(rule, { fields: attrs }).success(function(rule){
    result.success = true;
    result.msg = '新规则添加成功！';
    result.rule = rule;
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
  var _rule = req.body.rule;
  if(_rule.items) {
    _rule.items = formatItems(_rule.items);
  };  
  Rule.find(ruleId).success(function(rule){
    rule.updateAttributes(_rule, attrs)
        .success(function(){
          result.msg = '更新成功';
          result.success = true;
          result.rule = rule;
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
  orm.seq().transaction(function(t) {
    //先删除子类
    Rule.destroy({parent_id: rules}).success(function(){
      Rule.destroy({id: rules})
          .success(function(){
            t.commit();
            result.msg = '考评条目已删除！';
            result.success = true;
            res.json(result);
          })
          .error(function(errors){
            t.rollback();
            result.msg = '删除失败! 写入数据库出错！';
            console.log(errors);
            res.json(result);
          });
    }).error(function(errors){
      t.rollback();
    });
  });
};