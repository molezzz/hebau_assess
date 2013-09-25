
/*
 * GET users listing.
 */

exports.list = function(req, res){
  req.models.User.get(1,function(err, users){
    res.json(users);
  });
  //res.send("respond with a resource");
};