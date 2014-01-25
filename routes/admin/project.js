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
    project.updateAttributes(req.body.project, ['type','category','name', 'description', 'high_cut', 'low_cut', 'begin_at', 'end_at'])
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
  var projects = req.params.project.split('-');
  var Project = orm.model('project');
  var result = {success: false, msg: ''};
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