
var TXChat  = require('../../Models/TaiXiu_chat');
function getindex(arrray , name){
	for(let i =0 ; i < arrray.length ; i++){
		if(arrray[i].name == name){
			return i+1;	
		}
	}
	return 0;
}
module.exports = function(client){
	TXChat.find({},'name value', {sort:{'_id':-1}, limit: 20}, function(err, post) {
		if (post.length){
			Promise.all(post.map(function(obj){return {'user':obj.name, 'value':obj.value,top:getindex(client.redT.listTop,obj.name)}}))
			.then(function(arrayOfResults) {
				client.red({taixiu:{chat:{logs: arrayOfResults.reverse()}}});
			})
		}
	});
}
