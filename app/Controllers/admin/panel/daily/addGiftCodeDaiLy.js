var GiftCode = require('../../../../Models/GiftCode');
var Helper = require('../../../../Helpers/Helpers');
var UserInfo = require('../../../../Models/UserInfo');
var GiftCodeBank = require('../../../../Models/GiftCodeBank');
module.exports = function(req, res) {
	
	
	 
	
    var { body } = req || {}
    var { Data } = body || {}
	if(!Data || !Data.menhgia){
		Data = req.body;
	} 
    if(Data.Data){
        Data = Data.Data;
    }
	var voucher_codes = require('voucher-code-generator');
	console.log(Data);
    var { daily, menhgia, soluong, ngaythang } = Data || {};
	
	menhgia = parseInt(menhgia);
    soluong = parseInt(soluong);
    var ngaythangSp = ngaythang.split('-');
    var nam = parseInt(ngaythangSp[0]);
    var thang = parseInt(ngaythangSp[1]);
    var ngay = parseInt(ngaythangSp[2]);
    console.log(ngay+'-'+thang+'-'+nam)
	
   var rawData = [];
	  if(Data.tool){
		 var code = voucher_codes.generate({
            length: 12,
            count: soluong,
            charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
         });
         GiftCodeBank.findOne({"daily":daily}, '_id red', function(err, data){
            var total = menhgia*soluong;
            if(!data || data.red < total){
                res.json({
                    status: 200,
                    success: false,
                    data: {
                        message: 'Số tiền trong tài khoản không đủ.'
                    }
                })
            }else{
				GiftCodeBank.findOneAndUpdate({_id:data._id}, {$inc:{'red':-total,"red_giftcode":total}},function(err, user){
						console.log(err);
                         
						
					   var code = voucher_codes.generate({
							length: 12,
							count: soluong,
							charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
						});
					for (var i = 0; i < soluong; i++) {
						rawData.push({
							'code': code[i],
							'red': menhgia,
							'xu': 0,
							'type': 'GC001',
							'date': new Date(),
							'todate': new Date(nam, thang-1, ngay),
							'forAgent': daily,
							//'uid': null
						});
					}
					GiftCode.insertMany(rawData)
						.then(function(mongooseDocuments) {
							res.json({
								status: 200,
								success: true,
								data: {
									message: `Xuất ${soluong} GiftCode Mệnh giá ${Helper._formatMoneyVND(menhgia)} ${daily ? `cho Đại lý ${daily}` : ''} thành công.`,
									
								}
							})
						})
						.catch(function(err) {
							res.json({
								status: 200,
								success: false,
								data: {
									message: 'Tạo GiftCode thất bại.'
								}
							})
						});
					});
			
            }

        });
    }else{
        var code = voucher_codes.generate({
            length: 12,
            count: soluong,
            charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        });
        for (var i = 0; i < soluong; i++) {
            rawData.push({
                'code': code[i],
                'red': menhgia,
                'xu': 0,
                'type': 'GC001',
                'date': new Date(),
                'todate': new Date(nam, thang-1, ngay),
                'forAgent': daily,
                //'uid': null
            });
        }
        GiftCode.insertMany(rawData)
            .then(function(mongooseDocuments) {
                res.json({
                    status: 200,
                    success: true,
                    data: {
                        message: `Xuất ${soluong} GiftCode Mệnh giá ${Helper._formatMoneyVND(menhgia)} ${daily ? `cho Đại lý ${daily}` : ''} thành công.`
                    }
                })
            })
            .catch(function(err) {
                res.json({
                    status: 200,
                    success: false,
                    data: {
                        message: 'Tạo GiftCode thất bại.'
                    }
                })
            });
    }
}
