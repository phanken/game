
let UserInfo = require('../../../../Models/UserInfo');

module.exports = function(client){
	let isAdmin = client.username == "admin";
	let aclCard = client.acls.system && Array.isArray(client.acls.system) ?client.acls.system:[];
	if(isAdmin == false && aclCard.includes('system') == false){
		return client.red({notice:{title:'THẤT BẠI', text:'bạn không có quyền'}});
	}
	UserInfo.find({type:true}, 'id name', function(err, list){
		if (!!list && list.length) {
			client.redT.listBot = list.map(function(user){
				user = user._doc;
				delete user._id;
				return user;
			});
			client.red({notice:{title:'THÀNH CÔNG', text:'Cập nhật thành công ' + client.redT.listBot.length + ' tài khoản BOT...'}});
			client = null;
		}
	});
}
