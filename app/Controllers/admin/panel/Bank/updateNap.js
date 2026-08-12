
let Bank_history = require('../../../../Models/Bank/Bank_history');
let UserInfo     = require('../../../../Models/UserInfo');
let Push  = require('../../../../Models/Push');
let fs 			  = require('fs');
module.exports = function (client, data) {
	if (!!data.id && !!data.status) {
		let status = data.status>>0;
		var conf = {};

		try{
			 conf =  JSON.parse(fs.readFileSync(global['path_server']+'/config/config-payment.json', 'utf8'))
		}catch(e){
			 conf =  {};
			 console.log(e);
		}

		console.log(conf);

		Bank_history.findOne({'_id':data.id}, {}, function(err, history){
			if (!!history) {
				if (history.status !== status) {
					let update = {};
					let sale = 0;	
					
					history.money = parseInt(history.money);

					if (status === 1) {

						update.red = parseInt(history.money);  // Thành công
						if(conf.hasOwnProperty("bank")){
							sale = conf.bank;
							update.red+=parseInt(conf.bank*history.money);
						}
						
						console.log(update);

						Push.create({
							type:"Admin_Update_Bank",
							data:JSON.stringify({type:"1",username:client.username,sale:sale,uid:history.uid,money:history.money,name:history.name,bank:history.bank,number:history.number})
						});
					}else if(history.status === 1){
						update.red = -history.money; // Thất bại
						Push.create({
							type:"Admin_Update_Bank",
							data:JSON.stringify({type:"10",username:client.username,sale:0,uid:history.uid,money:history.money,name:history.name,bank:history.bank,number:history.number})
						});
					}else{
						Push.create({
							type:"Admin_Update_Bank",
							data:JSON.stringify({type:"2",sale:0,username:client.username,uid:history.uid,money:history.money,name:history.name,bank:history.bank,number:history.number})
						});
					}
					UserInfo.updateOne({'id':history.uid}, {$inc:update}).exec();
				}

				history.status = status;
				history.save();
			}else{
				client.red({notice:{title:'LỖI',text:'Phiên không được tìm thấy.'}});
			}
		});
	}
}
