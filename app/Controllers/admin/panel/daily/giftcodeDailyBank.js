var GiftCodeBank = require('../../../../Models/GiftCodeBank');
var Helper = require('../../../../Helpers/Helpers');
var UserInfo = require('../../../../Models/UserInfo');
module.exports = function(req, res) {
   
    let data = req.body;
    console.log(data);
    let action = data.act?data.act:"";
   
    if(action == "set"){

        let daily = data.daily?data.daily:"";
        let red = data.red?data.red:"0";

        GiftCodeBank.findOne({daily:daily},function(error,data){
            if(data){
                GiftCodeBank.findByIdAndUpdate({_id:data._id},{$inc:{'red':red}},function(errr,doc){

                    res.json({
                        status: 200,
                        success: true,
                        data: {
                            message: `Cong  Quy ${Helper._formatMoneyVND(red)} ${daily ? `cho Đại lý ${daily}` : ''} thành công`,
                        }
                    })
                });
            }else{
                GiftCodeBank.create({daily:daily,red_giftcode:0,red:red,timeUse:new Date()});
                res.json({
                    status: 200,
                    success: true,
                    data: {
                        message: `Cong  Quy ${Helper._formatMoneyVND(red)} ${daily ? `cho Đại lý ${daily}` : ''} thành công`,
                    }
                })
            }
        });
    }else if(action == "get"){
        let daily = data.daily?data.daily:"";
        GiftCodeBank.findOne({forAgent:daily},function(err,data){

        });
    }else{
        let limit = data.limit;
        let offset = data.offset;
        GiftCodeBank.countDocuments({
           
        }).exec(function(err, totals) {
            GiftCodeBank.find({
                
            }, {}, { sort: { '_id': -1 }, limit: limit, skip: offset }, function(err, result) {
                res.json({
                    status: 200,
                    success: true,
                    totals: totals,
                    data: result
                });
            });
        });

    }
};

