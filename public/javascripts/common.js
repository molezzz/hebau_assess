(function(ng){
  window.hbex = window.hbex || {};
  var ex = {
    showErr : function(errors, msg){
      var errs = [];
      ng.forEach(errors, function(v, k){
        errs.push(k + '：' + v);
      });
      alert(msg + "\n\n" + errs.join("\n"));
    }
  };
  ng.extend(window.hbex, ex);
})(angular);