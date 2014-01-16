var orm = require('../lib/seq-models');
var Seq = orm.Seq();
var ex = require('lodash');

var positions = {
  '0': '正处级',
  '1': '副处级'
};

module.exports = {
  model: {
    id: { type: Seq.INTEGER, autoIncrement: true, primaryKey: true },
    department_id: { type: Seq.INTEGER, allowNull: false, defaultValue: 0 },
    name: { type: Seq.STRING, allowNull: false },
    description: { type: Seq.TEXT, allowNull: true, comment: '人员职位描述'},
    position_id: { type: Seq.ENUM, values: ['0', '1', '2', '3'], allowNull: false, defaultValue: '0'}
  },
  relations: {
    belongsTo: ['department', { foreignKey: 'department_id' }]
  },
  options: {
    timestamps: true,
    classMethods: {
      /**
       * 返回所有的职位
       * @return {Hash}
       */
      positions: function(){
        return ex.clone(positions);
      }
    },
    instanceMethods: {

    }
  }
};
