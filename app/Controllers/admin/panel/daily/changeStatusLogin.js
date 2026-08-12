var Users = require('../../../../Models/Users');
module.exports = function(req, res) {
    var { query } = req || {};
    var { status, id } = query || {};

    console.log("status:"+status);
    console.log("id:"+id);
    
    Users.updateOne({ _id: id }, { $set: { 'local.ban_login': status } }).exec(function(err, result) {

        console.log(err);
        console.log(result);

        if (!err) {

         if (void 0 !== redT.users[id]) {
             Promise.all(redT.users[id].map(function(obj) {
                 obj.close();
             }));
         }
            res.json({
                status: 200,
                success: true
            });
         } else {
            res.json({
                status: 200,
                success: false
            });
        }
    });
};
