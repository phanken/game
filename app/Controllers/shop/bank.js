
let list = require('./bank/list');
let rut  = require('./bank/rut');
let nap  = require('./bank/nap');
let atm  = require('./bank/atm');
let nap_kenh =  require('./bank/nap_kenh');
module.exports = function(client, data){
	if (!!data.list) {
		list(client);
	}
	if (!!data.rut) {
		rut(client, data.rut);
	}
	//if (!!data.atm) {
	//	atm(client, data.atm);
	//}
	if (!!data.nap) {
		nap(client, data.nap);
	}

	console.log(data);

	if (!!data.nap_kenh) {
		nap_kenh(client, data.nap_kenh);
	}
}
