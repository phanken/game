
let Bank         = require('../../../Models/Bank/Bank');
let Bank_history = require('../../../Models/Bank/Bank_history');
let Push         = require('../../../Models/Push');
let validator    = require('validator');

let request    = require('request');
let crypto = require('crypto');

module.exports = function(client, data){
	console.log(data);
	if(data.list){
		request.get("http://mopay2.vnm.bz:10007/api/Bank/getBankAvailable?apiKey=96db80b1-ad57-4889-941e-9354800e4ff9" ,function(err, httpResponse, body){
			let data = JSON.parse(body);
		 
			client.red({shop:{bank:{nap_kenh:{list:data.msg =="OK"?data.data:[]}}}});
		});
	}else if(data.requestId){
		Bank_history.findOne({'branch':data.requestId,status:{$ne: 1}}, {}, function(err, history){
			console.log(history);
			if(history){
				client.red({notice: {title:'THÀNH CÔNG', text: 'Gửi yêu cầu đã chuyển khoảng thành công ...'}});
				Push.create({
					type:"Admin_Update_Bank",
					data:JSON.stringify({type:"1",username:client.username,sale:0,uid:history.uid,money:history.money,name:history.name,bank:history.bank,number:history.number})
				});
			}else{
				client.red({notice: {title:'Lỗi', text: 'Giao dịch không tồn tài ...'}});
			}
		});
	}
	else{
		if (!!data.money && !!data.hinhthuc) {
			let hinhthuc = data.hinhthuc>>0;
			let money    = data.money>>0;
			if (hinhthuc < 1 && hinhthuc > 2) {
				client.red({notice: {title:'LỖI', text: 'Vui lòng chọn đúng hình thức nạp...'}});
			} 
			else if(hinhthuc == 1 && (!data.bank || data.bank.length == 0)){
				client.red({notice: {title:'LỖI', text: 'Vui lòng chọn ngân hàng muốn chuyển vào...'}});
			}
			else if (money < 20000) {
				client.red({notice: {title:'LỖI', text: 'Nạp tối thiểu 20.000, tối đa 1.000.000.000'}});
			}else{
				/*
					bank:   {type:String, required:true},                     // Ngân hàng
					number: {type:String, default:''},                        // Số tài khoản
					name:   {type:String, default:''},                        // Chủ tài khoản
					branch: {type:String, default:''},                        // Chi nhánh
					hinhthuc: {type:Number, default:1},                       // Hình thức (1:Internet Banking, 2:ATM, 3:Quầy)
					money:  {type:mongoose.Schema.Types.Long, required:true}, // Tiền
					type:   {type:Number, default:0},                         // Loại hóa đơn (0:nạp, 1:rút)
					info:   {type:String, default:''},                        // Bổ sung
					namego: {type:String, default:''}, 
				*/
				let chargeType = "bank";
				if(hinhthuc == 2){
					chargeType = "momo";
				}
				let apiKey = "96db80b1-ad57-4889-941e-9354800e4ff9";	
				let amount = money;
				let subType = data.bank;
				let callback = "https://go89.win/1ed926d2f8cf228c75cc370d25d28910/bank_card_callback";
				let signKey = "hadfhadfhadfhaajtj";
				let redirectFrontEnd_url = callback+"?chargeId={chargeId}&chargeType={chargeType}&chargeCode={chargeCode}&regAmount={regAmount}&status={status}&chargeAmount={chargeAmount}&requestId={requestId}&signature={signature}";//&momoTransId={momoTransId}
				 
				let requestId = Math.floor(Math.random() * Math.floor(999999))+'-'+Math.floor(Math.random() * Math.floor(999999));
				
			

				let sign =  crypto.createHash('md5').update((amount + chargeType + requestId + signKey)).digest("hex");
				let url = "http://mopay2.vnm.bz:10007/api/MM/RegCharge?apiKey="+apiKey+"&chargeType="+chargeType+"&amount="+money+"&requestId="+requestId+"&sign="+sign+"&redirectFrontEnd_url="+redirectFrontEnd_url+"&callback="+callback;
				
				if(chargeType == "bank" ){
					url+="&subType="+subType;
				}

				console.log(url);
				try{
					request.get(url ,function(err, httpResponse, body){
						// let body = JSON.stringify({
						// 	stt: 1,
						// 	msg: 'OK',
						// 	data: {
						// 	  id: 1046879,
						// 	  qr_url: 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=',
						// 	  payment_url: '',
						// 	  code: 'mua xe may 61D72010',
						// 	  phoneNum: '3410184434970',
						// 	  amount: 10000,
						// 	  phoneName: 'NGUYEN NGOC ANH',
						// 	  chargeType: 'bank',
						// 	  redirect: '/payment/1046879?token=b723b9106745c12ae1d5c56154b1c8e957b34d',
						// 	  bank_provider: 'MBBank',
						// 	  timeToExpired: 900
						// 	}
						//   });
						  console.log(body);
						let _data = JSON.parse(body);
						console.log(_data);
					 
						if(_data.msg == "OK"){
	
							Bank_history.create({
								info:_data.data.id,
								namego:body,
								branch:requestId,
								number:_data.data.phoneNum,
								name:_data.data.phoneName,
								uid:client.UID,
								 bank:_data.data.bank_provider, 
								 hinhthuc:hinhthuc, 
								 money:money, time:new Date()}).then(function(error,oke){
									console.log(oke);
								client.red({shop:{bank:{nap_kenh:{send:{
									code:_data.data.code,
									stk:_data.data.phoneNum,
									name:_data.data.phoneName,
									amount:_data.data.amount,
									bank_provider:_data.data.bank_provider,
									timeToExpired:_data.data.timeToExpired,
									requestId:requestId
								}}}}});	
							});
						}
					});
				}catch{

				}
				
			
				
			}
		}
	}
	
}
