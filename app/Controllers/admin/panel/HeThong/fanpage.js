
var fs = require('fs');

module.exports = function(data) {
	let isAdmin = client.username == "admin";
	let aclCard = client.acls.system && Array.isArray(client.acls.system) ?client.acls.system:[];
	if(isAdmin == false && aclCard.includes('system') == false){
		return client.red({notice:{title:'THẤT BẠI', text:'bạn không có quyền'}});
	}
	fs.readFile('./config/sys.json', 'utf8', (err, dataF)=>{
		try {
			var sys = JSON.parse(dataF);
			sys.fanpage = data;
			fs.writeFile('./config/sys.json', JSON.stringify(sys), function(err){
				if (!!err) {
					client.red({notice:{title:'THẤT BẠI', text:'Đổi Fanpage thất bại...'}});
				}
			});
		} catch (error) {
		}
	});
}
