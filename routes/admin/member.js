/*
 * 用于管理member
 */
var ex = require('lodash');
var moment = require('moment');
var orm = require('../../lib/seq-models');

var shared = {
  memberMenuActive: 'active'
};

exports.index = function(req, res){
  var Member = orm.model('member');
  var Department = orm.model('department');

  switch (req.format) {
      case 'json':
        var opts = Member.pages(req.query.page, req.query.perpage);
        opts.order = 'position_id ASC';
        opts.include = [{ model: Department, as: 'department' }]
        Member.search(req.query.q || {}, opts).success(function(members){
          res.json({ total: members.count, members: members.rows });
        });
        break;
      default:
        Department.findAll({ attributes: ['id','category_id','name'] })
        .success(function(deps){
          var depGroups = {};
          var cates = Department.cates();
          ex.forEach(deps,function(dep){
            if(!depGroups[dep.category_id]){
              depGroups[dep.category_id] = { name: cates[dep.category_id], departments: []}
            };
            depGroups[dep.category_id].departments.push(dep);
          });
          res.render('admin/member/index',
            ex.extend({ title: '人员管理', depGroups: depGroups, positions: Member.positions() }, shared)
          );
        })
        .error(function(errors){
          res.json({success:false, errors: errors});
        });
  }
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  var Member = orm.model('member');
  var member = req.body['member'];
  var result = {
    success: false,
    msg: ''
  };

  //新版Sequelize将会实现hooks。之前临时采用手动的办法
  member = Member.build(member);

  member.save().success(function(member){
    result.success = true;
    result.msg = '新人员添加成功！';
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
  var memberId = req.params.member;
  var Member = orm.model('member');
  var result = {success: false, msg: ''};

  Member.find(memberId).success(function(member){
    member.updateAttributes(req.body.member, ['name', 'category_id', 'parent_id','description'])
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
    result.msg = '更新失败! 修改的人员不存在！';
    console.log(errors);
    res.json(result);
  });

};

exports.destroy = function(req, res){
  var members = req.params.member.split('-');
  var Member = orm.model('member');
  var result = {success: false, msg: ''};
  Member.destroy({id: members})
      .success(function(){
        result.msg = '人员已删除！';
        result.success = true;
        res.json(result);
      })
      .error(function(errors){
        result.msg = '删除失败! 写入数据库出错！';
        console.log(errors);
        res.json(result);
      });

};