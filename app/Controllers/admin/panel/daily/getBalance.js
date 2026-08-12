var UserInfo = require('../../../../Models/UserInfo');
var GiftCodeBank = require('../../../../Models/GiftCodeBank');
module.exports = function(req, res) {
    var { userAuth } = req || {};
    console.log("userAuth", userAuth);
    UserInfo.findOne({
        id: userAuth.id
    }, function(err, result) {
        console.log(result);
        GiftCodeBank.findOne({daily:userAuth.nickname},function(error,data){
            
            res.json({
                status: 200,
                success: true,
                data: result ? result.red : 0,
                bank:data?data.red:0
            });
        });
        
    });
};