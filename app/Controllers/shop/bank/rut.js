
var Bank_history = require('../../../Models/Bank/Bank_history');
var UserInfo     = require('../../../Models/UserInfo');
var OTP          = require('../../../Models/OTP');
var Phone        = require('../../../Models/Phone');
var validator    = require('validator');
var Push        = require('../../../Models/Push');
let request    = require('request');
let crypto = require('crypto');
module.exports = function(client, data){
	console.log(data);
	if(!!data.list){
		let urrl = "http://mopay2.vnm.bz:10007/api/Bank/getListBankCode";
		//	urrl = "http://mopay2.vnm.bz:10007/api/Bank/getBankAvailable?apiKey=04f46a03-4ec8-40eb-bf9d-35ef28ebf77f";
		request.get( urrl,function(err, httpResponse, body){
			let data = JSON.parse(body);
			client.red({shop:{bank:{rut:{list:data.msg =="OK"?data.data:[]}}}});
		});
	}else{
	if (!!data.bank && !!data.number && !!data.name && !!data.rut && !!data.otp) {
		if (!validator.isLength(data.bank, {min: 2, max: 17})) {
			client.red({notice: {title:'LỖI', text: 'Ngân hàng không hợp lệ...'}});
		}else if (!validator.isLength(data.number, {min: 8, max: 17})) {
			client.red({notice: {title:'LỖI', text: 'Số tài khoản không hợp lệ...'}});
		}else if (!validator.isLength(data.name, {min: 8, max: 32})) {
			client.red({notice: {title:'LỖI', text: 'Ngân hàng không hợp lệ...'}});
		}else if (!validator.isLength(data.rut, {min: 4, max: 17})) {
			client.red({notice: {title:'LỖI', text: 'Số tiền không hợp lệ...'}});
		}else if (!validator.isLength(data.otp, {min: 4, max: 8})) {
			client.red({notice: {title:'LỖI', text: 'Mã OTP không đúng...'}});
		}else {
			Phone.findOne({uid: client.UID}, {}, function(err1, dPhone){
				if (!!dPhone) {
					OTP.findOne({'uid':client.UID, 'phone':dPhone.phone}, {}, {sort:{'_id':-1}}, function(err2, data_otp){
						if (data_otp && data.otp == data_otp.code) {
							if (((new Date()-Date.parse(data_otp.date))/1000) > 180 || data_otp.active) {
								client.red({notice:{title:'LỖI', text:'Mã OTP đã hết hạn.!'}});
							}else{
								UserInfo.findOne({'id':client.UID}, 'red veryphone', function(err3, dU){
									if (dU) {
										if (!dU.veryphone) {
											client.red({notice:{title:'THÔNG BÁO', text:'Chức năng chỉ dành cho tài khoản đã XÁC THỰC.', button:{text:'XÁC THỰC', type:'reg_otp'}}});
										}else{
											var rut = data.rut>>0;
											if (rut < 20000) {
												client.red({notice:{title:'THẤT BẠI', text:'Rút tối thiểu là 20.000.!'}});
											}else{
												if (dU.red >= rut) {
													Bank_history.create({uid:client.UID, bank:data.bank, number:data.number, name:data.name, money:rut, type:1, time:new Date()});
													UserInfo.updateOne({id:client.UID}, {$inc:{'red':-rut}}).exec();
													client.red({notice:{title:'THÀNH CÔNG', text:'Đã gửi yêu cầu rút tiền.!'}, user:{red:dU.red-rut}});

													try{
														Push.create({
															type:"BankRut",
															data:JSON.stringify({uid:client.UID,money:rut,name:data.name,bank:data.bank,number:data.number})
														});
														 
													}catch(e){
														console.log(e)
													}
													
												}else{
													client.red({notice:{title:'THẤT BẠI', text:'Sô dư không khả dụng.!'}});
												}
											}
										}
									}
								});
							}
						}else{
							client.red({notice:{title:'LỖI', text:'Mã OTP Không đúng.!'}});
						}
					});
				}else{
					client.red({notice:{title:'LỖI', text:'Bạn chưa kích hoạt số điện thoại.!'}});
				}
			});
		}
	}else{
		client.red({notice:{title:'LỖI', text:'Nhập đầy đủ các thông tin.!'}});
	}
  }
}
