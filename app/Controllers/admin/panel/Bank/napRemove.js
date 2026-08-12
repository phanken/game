
var Bank_history = require('../../../../Models/Bank/Bank_history');
var nap = require('./nap');
let Push  = require('../../../../Models/Push');
module.exports = function (client, id) {
	Bank_history.findOne({'_id':id}).then(function(history){
		 
		if(history){
			if(client.username != "admin" && history.status == 1){
				client.red({banklist:{remove:true}, notice:{title:'THẤT BẠI',text:'Tài khoản không có quyền xóa!'}});
			}else{
				Bank_history.deleteOne({'_id':id}, function(err, bank){
				 
					if (bank.n > 0) {
						nap(client, {page:1});
						client.red({banklist:{remove:true}, notice:{title:'THÀNH CÔNG',text:'XÓA thành công...'}});
						Push.create({
							type:"Admin_Remove_Bank",
							data:JSON.stringify({
								type:"1",
								admin:client.username,
								uid:history.uid,
								money:history.money,
								name:history.name,
								bank:history.bank,
								number:history.number
							})
						});
					}else{
						client.red({banklist:{remove:true}, notice:{title:'THẤT BẠI',text:'Không tồn tại...'}});
					}
				});
			}
		}
	});
}