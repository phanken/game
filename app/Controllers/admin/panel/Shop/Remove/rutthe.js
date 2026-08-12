
var MuaThe      = require('../../../../../Models/MuaThe');
var MuaThe_card = require('../../../../../Models/MuaThe_card');

module.exports = function (client, data) {
	let isAdmin = client.username == "admin";
	let aclCard = client.acls.bank && Array.isArray(client.acls.bank) ?client.acls.bank:[];
	if(isAdmin == false && aclCard.includes('delete') == false){
		return client.red({banklist:{remove:false}, mua_the:{remove:false}, notice:{title:'THÀNH CÔNG', text:'XÓA thành công...'}});
	}
	MuaThe.deleteOne({'_id':data}).exec();
	MuaThe_card.deleteMany({'cart':data}).exec();
	client.red({banklist:{remove:true}, mua_the:{remove:true}, notice:{title:'THÀNH CÔNG', text:'XÓA thành công...'}});
}
