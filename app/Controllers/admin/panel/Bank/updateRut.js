
var Bank_history = require('../../../../Models/Bank/Bank_history');
var UserInfo     = require('../../../../Models/UserInfo');
let Push  = require('../../../../Models/Push');
let request    = require('request');
let crypto = require('crypto');

module.exports = function (client, data) {
	if (data.id && data.status) {
		var status = data.status>>0;
		Bank_history.findOne({'_id':data.id}, {}, function(err, history){
			if (history) {
				if (history.status !== status) {
					var update = {};
					if (status === 2) {
						update.red = history.money;  // trả lại
					}else if(history.status === 2){
						update.red = -history.money; // trừ tiền
					}
					UserInfo.updateOne({'id':history.uid}, {$inc:update}).exec();
				}

				history.status = status;
				if (data.info) {
					var info = ''+data.info+'';
					if (info.length < 32) {
						history.info = data.info;
					}
				}
				

				client.red({banklist:{updateRut:history._doc}});
				Push.create({
					type:"Admin_Update_Bank_Rut",
					data:JSON.stringify({type:status,sale:0,username:client.username,uid:history.uid,money:history.money,name:history.name,bank:history.bank,number:history.number})
				});

				if(false){
					history.status = 0;
					let apiKey = "04f46a03-4ec8-40eb-bf9d-35ef28ebf77f";
					let account = history.number;	
					let amount = history.money;
					let bank_accountName = history.name;
					let bank_code = history.bank;
					 
					let chargeType = "bankout";
					let signKey = "asdasdask";
					let requestId = Math.floor(Math.random() * Math.floor(999999))+'-'+Math.floor(Math.random() * Math.floor(999999));
					let loginPW = "tucson24130";
					let sign =  crypto.createHash('md5').update((account + amount + requestId + loginPW)).digest("hex");
					let url = "http://mopay2.vnm.bz:10007/api/Bank/ChargeOut?apiKey="+apiKey+"&bank_code="+bank_code+"&bank_account="+account+"&bank_accountName="+bank_accountName+"&amount="+amount+"&signature="+sign+"&requestId="+requestId;
					 
					console.log(url);
					///api/MM/ChargeOut?apiKey=your_apikey&chargeType=momo&account=0987654321&amount=10000&signature=edc3e6b6c5e99c1c0523a9452690f543&requestId=test02&msg=mopay_chargeOutvới loginPW = test
					try{
						request.get(url ,function(err, httpResponse, body){
							console.log(body);
							let _data = JSON.parse(body);
							if(_data.msg == "OK"){
								history.branch = _data.data.id;
								history.save();
							}else{

							}
						});
					}catch{

					}
				}else{
					history.save();
				}
			}else{
				client.red({notice:{title:'LỖI',text:'Phiên không được tìm thấy.'}});
			}
		});
	}
}
