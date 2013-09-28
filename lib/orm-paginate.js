/**
 * orm2 分页扩展，支持查询条件 by molezz
 * @param  Orm db
 * @return
 */
module.exports = function(db){
  return {
    define: function (Model) {
      Model.settings.set("pagination.perpage", 20);

      Model.page = function (n) {
        var perpage = Model.settings.get("pagination.perpage");

        return this.find().offset( (n - 1) * perpage ).limit(perpage);
      };

      Model.pages = function (cb) {
        var chains = this;
        chains.count(function (err, count) {
          if (err) {
            return cb.apply(chains, err);
          }

          return cb.apply(chains, [null, Math.ceil(count / Model.settings.get("pagination.perpage"))]);
        });
      };
    }
  };
}