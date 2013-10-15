/*
 * 用于管理department
 */
var ex = require('lodash');
var moment = require('moment');
var orm = require('../../lib/seq-models');

var shared = {
  departmentMenuActive: 'active'
};

exports.index = function(req, res){
  var Department = orm.model('department');
  switch (req.format) {
      case 'json':
        var opts = Department.pages(req.query.page, req.query.prepage);
        opts.order = 'id DESC';
        Department.search(req.query.q || {}, opts).success(function(departments){
          res.json({ total: departments.count, departments: departments.rows });
        });
        break;
      default:
        res.render('admin/department/index', ex.extend({ title: '部门管理' }, shared));
  }
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  var Department = orm.model('department');
  var department = req.body['department'];
  var result = {
    success: false,
    msg: ''
  };

  //新版Sequelize将会实现hooks。之前临时采用手动的办法
  department = Department.build(department);

  department.save().success(function(department){
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
  var departmentId = req.params.department;
  var Department = orm.model('department');
  var result = {success: false, msg: ''};

  Department.find(departmentId).success(function(department){
    department.updateAttributes(req.body.department, ['name', 'email', 'phone', 'group_id'])
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
  var departments = req.params.department.split('-');
  var Department = orm.model('department');
  var result = {success: false, msg: ''};
  Department.destroy({id: departments})
      .success(function(){
        result.msg = '部门已删除！';
        result.success = true;
        res.json(result);
      })
      .error(function(errors){
        result.msg = '删除失败! 写入数据库出错！';
        console.log(errors);
        res.json(result);
      });

};