/*
 * 用于管理project
 */
var ex = require('lodash');
var moment = require('moment');
var orm = require('../../lib/seq-models');
var nodeExcel = require('excel-export');

var shared = {
  reportMenuActive: 'active'
};

exports.index = function(req, res){
  var Project = orm.model('project');
  var Member = orm.model('member');
  var Department = orm.model('department');

  switch (req.format) {
      case 'json':
        var opts = Project.pages(req.query.page, req.query.prepage);
        opts.order = 'id DESC';
        Project.search(req.query.q || {}, opts).success(function(projects){
          res.json({ total: projects.count, projects: projects.rows });
        });
        break;
      default:
        res.render('admin/report/index',
          ex.extend({
            title: '考评管理',
            cates: Project.cates(),
            types: Project.types(),
            departmentCates: Department.cates(),
            memberPosition: Member.positions()
          }, shared)
        );
  }
};

exports.new = function(req, res){
  res.send('ok');
};

exports.create = function(req, res){
  res.send('ok');
};

exports.show = function(req, res){
  var Project = orm.model('project');
  var Report = orm.model('report');
  var result = { success: false, msg: '' };
  var pid = req.query.pid;
  var format = req.query.format;
  var type = null;
  //var chainer = new (orm.Seq().Utils.QueryChainer)();
  Project.find(pid)
  .success(function(project){
    var _r = null;
    if(project.type == 'PERSON'){
      _r = orm.seq().query(
        'SELECT r.*,m.position_id AS cate, (ROUND((r.total / r.valids) * 100) / 100) AS avg, m.name AS name, d.name AS `department.name`, d.id AS `department.id`, d.category_id AS `department.category_id` FROM `reports` AS r '
        + ' INNER JOIN `members` AS m ON m.id = r.member_id '
        + ' LEFT JOIN `departments` AS d ON d.id = m.department_id'
        + ' WHERE r.project_id = ' + project.id
        + ' ORDER BY m.position_id ASC, avg DESC');
      type = 'PERSON';
    }else{
      _r = orm.seq().query(
        'SELECT r.*, d.category_id AS cate ,(ROUND((r.total / r.valids) * 100) / 100) AS avg, d.name AS name FROM `reports` AS r '
        + ' INNER JOIN `departments` AS d ON d.id = r.department_id '
        + ' WHERE r.project_id = ' + project.id
        + ' ORDER BY d.category_id ASC, avg DESC');
      type = 'DEPARTMENT';
    };

    _r.success(function(reports){
      //console.log(reports);
      switch (format) {
        case 'json':
          result.reports = reports;
          result.type = type;
          res.json(result);
          break;
        default:
          var Department = orm.model('department');
          var Member = orm.model('member');
          var conf = {};
          var cates = {
            'PERSON': Member.positions(),
            'DEPARTMENT': Department.cates()
          };
          conf.stylesXmlFile = 'views/admin/styles.xml';
          conf.cols = [{
              caption:'排名',
              type:'number',
              width:5
          },{
              caption:'名称',
              type:'string',
              width: 10
          },{
              caption:'类别',
              type:'string',
              width: 10,
              beforeCellWrite:function(row, cellData){
                return cates[type][cellData];
              }
          },{
              caption:'总分',
              type:'number'
          },{
              caption:'平均分',
              type:'number'
          },{
              caption:'参与投票人数',
              type:'number'
          },{
              caption:'有效票数',
              type:'number'
          }];
          conf.rows = [];

          if(project.type == 'PERSON'){
            conf.cols = conf.cols.concat([{
              caption:'所属部门',
              type:'string',
              width: 10
            },{
              caption:'部门类别',
              type:'string',
              width: 10,
              beforeCellWrite:function(row, cellData){
                return cates['DEPARTMENT'][cellData];
              }
            }]);
            ex.forEach(reports, function(report, idx){
              conf.rows.push([
                idx + 1, report.name, report.cate, report.total, report.avg,
                report.account_count, report.valids, report.department.name,
                report.department.category_id
              ]);
            });
          } else {
            ex.forEach(reports, function(report, idx){
              conf.rows.push([
                idx + 1, report.name, report.cate, report.total, report.avg,
                report.account_count, report.valids
              ]);
            });
          };
          var excel = nodeExcel.execute(conf);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats');
          res.setHeader("Content-Disposition", "attachment; filename=" + "reports-"+ project.id +".xlsx");
          res.end(excel, 'binary');
      }
    })
    .error(function(errors){
      console.log(errors);
      result.msg = '数据错误！';
      result.errors = errors;
      res.json(result);
    });

  })
  .error(function(errors){
    console.log(errors);
    result.msg = '数据错误！';
    result.errors = errors;
    res.json(result);
  });

};

exports.edit = function(req, res){
  res.send('ok');
};

exports.update = function(req, res){
  res.send('ok');
};

exports.destroy = function(req, res){
  res.send('ok');
};