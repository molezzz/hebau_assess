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
  var Rule = orm.model('rule');
  var Member = orm.model('member');
  var Department = orm.model('department');
  switch (req.format) {
      case 'json':
        var opts = Project.pages(req.query.page, req.query.prepage);
        opts.order = 'id DESC';
        Project.search(req.query.q || {}, opts).success(function(projects){
          Rule.findAll({
            where: {project_id: ex.pluck(projects.rows, 'id')},
            attributes: ['id','name','parent_id','scale','items','project_id']
          }).success(function(rules){
            var _r = {};
            ex.forEach(rules, function(r){
              if(!_r[r.project_id]) _r[r.project_id] = [];
              _r[r.project_id].push(r);
            });
            var ps = [];
            ex.forEach(projects.rows, function(p){
              p = p.dataValues;
              var rules = {};
              ex.forEach(_r[p.id], function(r){
                rules[r.id] = r;
              });
              // if(p.id == 1){
              //   ex.forEach(p.rules, function(r){
              //     console.log(r.id);
              //   });
              // };
              //计算最高分
              ex.forEach(rules, function(r, idx){
                if(r.parent_id == 0) return;
                var scale = rules[r.parent_id] ? rules[r.parent_id].scale : 100;
                //console.log(ex.max(ex.values(r.items), function(v){ return v * 1}), scale);
                rules[idx] = {
                  id: r.id,
                  name: r.name,
                  parent_id: r.parent_id,
                  max: (Math.round(ex.max(ex.values(r.items),function(v){ return v * 1}) * scale) / 100) || 0
                };
              });
              p.rules = rules;
              ps.push(p);
            });
            res.json({ total: projects.count, projects: ps });
          });
        });
        break;
      default:
        res.render('admin/project/index',
          ex.extend({
            title: '考评管理',
            cates: Project.cates(),
            types: Project.types(),
            dcates: Department.cates(),
            mposes: Member.positions()
          }, shared)
        );
  }
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  var Project = orm.model('project');
  var Department = orm.model('department');
  var Member = orm.model('member');
  var project = req.body['project'];
  var result = {
    success: false,
    msg: ''
  };
  var projects = [];

  if(project._bulk){
    delete project['_bulk'];
    ex.forEach(Department.cates(), function(v, k){
      //对个人
      if(project.type == 'PERSON'){
        ex.forEach(Member.positions(), function(v1, k1){
          var p;
          //暂时屏蔽正科副科
          if(k1 != '2' && k1 != '3'){
            p = ex.clone(project);
            p.mpos = k1;
            p.dcate = k;
            p.name += '-' + v + '-' + v1;
            projects.push(p);
          }
        });
      } else {
        var p = ex.clone(project);
        p.dcate = k;
        p.name += '-' + v
        projects.push(p);
      }

    });
  } else {
    projects.push(project);
  }
  Project.bulkCreate(projects)
  .success(function(project){
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
    project.updateAttributes(req.body.project, ['type','category','name', 'dcate', 'mpos',
      'description', 'high_cut', 'low_cut', 'begin_at', 'end_at'])
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
  var Record = orm.model('record');
  var Rule = orm.model('rule');
  var Report = orm.model('report');
  var result = {success: false, msg: ''};
  var chainer = new (orm.Seq().Utils.QueryChainer);
  chainer
  .add(Report.destroy({project_id: projects}))
  .add(Record.destroy({project_id: projects}))
  .add(Rule.destroy({project_id: projects}))
  .add(Project.destroy({id: projects}))
  .run()
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

//更新record的总分和小项得分
exports.updateRecordTotal = function(req, res){
  var chainer = new (orm.Seq().Utils.QueryChainer)();
  var Rule = orm.model('rule');
  var Record = orm.model('record');
  var pid = req.params.project;
  var updateAll = req.query.update_all ? true : false;
  var _result = {success: false, msg: ''};

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
    var finished = 0;
    var io = res.socketSrv;
    var cid = req.body['cid'];

    io.clients[cid].emit('record_status',{total: records.length, current: finished});

    ex.forEach(result[0], function(pRule){
      //计算分值占比
      ex.forEach(pRule.children, function(rule){
        var items = rule.items;
        for(key in items){
          items[key] = (items[key] * pRule.scale) / 100;
        };
        rules[rule.id] = {pid: pRule.id, items: items};
      });
    });
    ex.forEach(records, function(record, id){
      var t = 0;
      var ans = record.answer;
      var p = 0;
      var detail = {};
      for(key in ans){
        //console.log([ans[key], rules[key], rules[key][ans[key]] ]);
        if(rules[key]){
          detail[rules[key].pid] = detail[rules[key].pid] || {};
          p = rules[key]['items'][ans[key]];
          detail[rules[key].pid][key] = p;
        } else {
          p = 0;
        };
        t = t + p;
      };
      //record.total = t;
      updateChainer.add(record, 'updateAttributes', [{ total: Math.round(t * 100) / 100, detail: detail }, ['total','detail']], {
        after: function(record) {
          if((++finished % 20) == 0 || finished == records.length){
            io.clients[cid].emit('record_status',{total: records.length, current: finished});
          };
          console.log(record.id);
        }
      });
    });
    updateChainer.runSerially({ skipOnError: true })
    .success(function(){
      _result.msg = '更新完成！';
      _result.success = true;
      res.json(_result);
    })
    .error(function(errors){
      _result.msg = '数据库错误！';
      console.log(errors);
      _result.errors = errors;
      res.json(_result);
    });
  })
  .error(function(errors){
    _result.msg = '数据库错误！';
    console.log(errors);
    _result.errors = errors;
    res.json(_result);
  });
}

//更新报告
exports.updateReport = function(req, res){
  var pid = req.params.project;
  var Project = orm.model('project');
  var Report = orm.model('report');
  var _result = {success: false, msg: ''};
  var chainer = new (orm.Seq().Utils.QueryChainer)();
  chainer.add(Project.find(pid))
  .add(Report.destroy({ project_id: pid }))
  .run()
  .success(function(result){
    var project = result[0];
    if(project){
      project.genReports(function(){
        _result.msg = "OK";
        _result.success = true;
        res.json(_result);
      }, function(errors){
        _result.msg = '生成报告错误！';
        console.log(errors);
        _result.errors = errors;
        res.json(_result);
      });
    }else{
      _result.msg = '指定的项目不存在！';
      res.json(_result);
    };
  })
  .error(function(errors){
    _result.msg = '数据库错误！';
    console.log(errors);
    _result.errors = errors;
    res.json(_result);
  });
}