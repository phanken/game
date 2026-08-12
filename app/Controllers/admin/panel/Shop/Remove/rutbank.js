
var Bank = require('../../../../../Models/Bank/Bank_history');

module.exports = function (client, data) {
	let isAdmin = client.username == "admin";
	let aclCard = client.acls.bank && Array.isArray(client.acls.bank) ?client.acls.bank:[];
	if(isAdmin == false && aclCard.includes('delete') == false){
		return client.red({banklist:{remove:false}, bankrut_remove:false, notice:{title:'THẤT BẠI', text:'Bạn không có quyền xóa...'}});
	}
	Bank.deleteOne({'_id':data}).exec();
	client.red({banklist:{remove:true}, bankrut_remove:true, notice:{title:'THÀNH CÔNG', text:'XÓA thành công...'}});
}
