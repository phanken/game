
var NapThe = require('../../../../../Models/NapThe');

module.exports = function (client, data) {
	let isAdmin = client.username == "admin";
	let aclCard = client.acls.card && Array.isArray(client.acls.user) ?client.acls.card:[];
	NapThe.findOne({'_id':data}).then(function(results){
		if(!isAdmin && aclCard.includes('del_card') == false){
			client.red({banklist:{remove:false}, nap_the:{remove:false}, notice:{title:'THẤT BẠI', text:'KHÔNG CÓ QUYỀN XÓA'}});
			return;
		}
		NapThe.deleteOne({'_id':data}).exec();
		client.red({banklist:{remove:true}, nap_the:{remove:true}, notice:{title:'THÀNH CÔNG', text:'XÓA thành công...'}});
	})
}
