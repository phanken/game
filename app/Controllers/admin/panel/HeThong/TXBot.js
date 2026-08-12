
var path     = require('path');
var fs       = require('fs');

module.exports = function(client, data) {
	let isAdmin = client.username == "admin";
	let aclCard = client.acls.system && Array.isArray(client.acls.system) ?client.acls.system:[];
	if(isAdmin == false && aclCard.includes('system') == false){
		return client.red({notice:{title:'THẤT BẠI', text:'bạn không có quyền'}});
	}
	var file = require('../../../../../config/taixiu.json');
	var TT   = null;
	if (data == '0') {
		TT = file.bot = false;
	}else if (data == '1') {
		TT = file.bot = true;
	}
	if (TT != null) {	
		fs.writeFile(path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(__dirname))))) + '/config/taixiu.json', JSON.stringify(file), function(err){
			if (!!err) {
				client.red({notice:{title:'THẤT BẠI', text:'đổi chế độ thất bại...'}});
			}
		});
	}
}
