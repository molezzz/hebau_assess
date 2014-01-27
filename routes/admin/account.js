/*
 * 用于管理account
 */
var ex = require('lodash');
var moment = require('moment');
var orm = require('../../lib/seq-models');
var rnds = require('randomstring');

var shared = {
  accountMenuActive: 'active'
};

exports.index = function(req, res){
  var Account = orm.model('account');
  var Department = orm.model('department');

  switch (req.format) {
      case 'json':
        var opts = Account.pages(req.query.page, req.query.prepage);
        opts.order = 'id DESC';
        opts.include = [{ model: Department, as: 'department'}],
        Account.search(req.query.q || {}, opts).success(function(accounts){
          res.json({ total: accounts.count, accounts: accounts.rows });
        });
        break;
      default:
        res.render('admin/account/index',
          ex.extend({ title: '账户管理', cates: Department.cates() }, shared)
        );
  }
};

//返回账户向导使用的departments
exports.wizardDeps = function(req, res){
  var Department = orm.model('department');
  var result = {
    success: false,
    msg: ''
  };
  Department.findAll({
    attributes: ['id', 'name', 'category_id'],
    order: 'category_id ASC'
  }).success(function(deps){
    var depGroups = {};
    for (var i = 0; i < deps.length; i++) {
      if(!depGroups[deps[i].category_id]){
        depGroups[deps[i].category_id] = [];
      };
      depGroups[deps[i].category_id].push(deps[i]);
    };
    res.json(depGroups);
  }).error(function(errors){
    result.errors = errors;
    res.json(result);
  });
};

exports.wizardRun = function(req, res){
  var Account = orm.model('account');
  var io = res.socketSrv;
  var cid = req.body['cid'];
  var deps = req.body['deps'];
  var records = {};
  var total = 0;
  var groupKey = moment().format('YYYYMMDD');
  io.clients[cid].emit('account_status',{msg: '正在分组数据'});
  for(var id in deps){
    var prefix = rnds.generate(2);
    records[id] = [];
    for (var i = 0; i < deps[id]; i++) {
      total++;
      records[id].push({
        name: (prefix + '-' + rnds.generate(6)).toLowerCase(),
        department_id: id,
        group_key: groupKey,
        invalid: false
      });
    };
  };
  io.clients[cid].emit('account_status',{msg: '账号已生成，总计: '+ total +'个，开始写入数据库。', total: total});
  //console.log(records);
  var chainer = new (orm.Seq().Utils.QueryChainer);
  ex.forEach(records, function(accounts, key){
    chainer.add(Account, 'bulkCreate', [accounts],{
      before: function(model) {
        io.clients[cid].emit('account_status',{msg: '正在保存“'+ key + '组"'});
      },
      success: function(migration, next) {
        io.clients[cid].emit('account_status',{msg: '已保存“'+ key + '组”共' + accounts.length +'个', count: accounts.length});
        setTimeout(function(){next();}, 500);
      }
    });
  });
  chainer
  .runSerially({ skipOnError: true })
  .success(function(){
    io.clients[cid].emit('account_status',{msg: '已生成 '+ total +'个'});
    res.json({ success: true });
  });
  // setTimeout(function(){
  //   io.clients[cid].emit('account_status',{msg: '正在分组数据'});
  //   setTimeout(function(){
  //     io.clients[cid].emit('account_status',{msg: '已生成 100个'});
  //     res.json({});
  //   },5000);
  // },1000);
};

exports.new = function(req, res){
  res.send('new forum');
};

exports.create = function(req, res){
  var Account = orm.model('account');
  var account = req.body['account'];
  var result = {
    success: false,
    msg: ''
  };

  //新版Sequelize将会实现hooks。之前临时采用手动的办法
  account = Account.build(account);

  account.save().success(function(account){
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
  var accountId = req.params.account;
  var Account = orm.model('account');
  var result = {success: false, msg: ''};

  Account.find(accountId).success(function(account){
    account.updateAttributes(req.body.account, ['invalid'])
        .success(function(account){
          result.msg = '更新成功';
          result.success = true;
          result.account = account;
          res.json(result);
        })
        .error(function(errors){
          result.msg = '更新失败! 写入数据库出错！';
          console.log(errors);
          res.json(result);
        });

  }).error(function(errors){
    result.msg = '更新失败! 账户不存在！';
    console.log(errors);
    res.json(result);
  });

};

exports.destroy = function(req, res){
  var accounts = req.params.account.split('-');
  var Account = orm.model('account');
  var result = {success: false, msg: ''};
  //TODO: 删除投票
  Account.destroy({id: accounts})
      .success(function(){
        result.msg = '账户已删除！';
        result.success = true;
        res.json(result);
      })
      .error(function(errors){
        result.msg = '删除失败! 写入数据库出错！';
        console.log(errors);
        res.json(result);
      });

};