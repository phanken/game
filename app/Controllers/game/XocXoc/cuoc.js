
let XocXoc_cuoc = require('../../../Models/XocXoc/XocXoc_cuoc');
let UserInfo    = require('../../../Models/UserInfo');
let TopVip      = require('../../../Models/VipPoint/TopVip');
let getConfig   = require('../../../Helpers/Helpers').getConfig;
let Push =  require('../../../Models/Push');
module.exports = function(client, data){
	if (!!data.cuoc && !!data.box) {
		let cuoc = data.cuoc>>0;
		let box  = data.box;

		if (client.redT.game.xocxoc.time < 5 || client.redT.game.xocxoc.time > 30) {
			client.red({xocxoc:{notice: 'Vui lòng cược ở phiên sau.!!'}});
			return;
		}

		if (!(cuoc === 1000 || cuoc === 10000 || cuoc === 50000 || cuoc === 100000 || cuoc === 1000000) ||
			!(box === 'chan' || box === 'le' || box === 'red3' || box === 'red4' || box === 'white3' || box === 'white4')) {
			client.red({mini:{XocXoc:{notice: 'Cược thất bại...'}}});
		}else{
			let name = client.profile.name;
			UserInfo.findOne({id:client.UID}, 'red', function(err, user){
				if (!user || user.red < cuoc) {
					client.red({xocxoc:{notice: 'Bạn không đủ R để cược.!!'}});
				}else{
					let xocxoc = client.redT.game.xocxoc;
					XocXoc_cuoc.findOne({uid:client.UID, phien:xocxoc.phien}, function(err, checkOne) {
						let betOke = true;
						if (checkOne){
							if(box === 'chan'){
								if(checkOne['le']  > 0){
									betOke = false;
								}	
							}else{
								if(checkOne['chan']   >  0){
									betOke = false;
								}	
							}
							if(betOke){

								user.red -= cuoc;
								user.save();
								xocxoc.chip[box][cuoc] += 1;

								checkOne[box] += cuoc;
								checkOne.save();
							}
							
						}else{
							var create = {uid:client.UID,name: name, phien:xocxoc.phien, time: new Date()};
							create[box] = cuoc;

							user.red -= cuoc;
							user.save();
							xocxoc.chip[box][cuoc] += 1;

							XocXoc_cuoc.create(create);
						}

						if(betOke){

						

							let newData = {
								'chan':   0,
								'le':     0,
								'red3':   0,
								'red4':   0,
								'white3': 0,
								'white4': 0,
							};
							newData[box] = cuoc;
							let me_cuoc = {};
							xocxoc.data.red[box] += cuoc;
							xocxoc.dataAdmin.red[box] += cuoc;
							if (xocxoc.ingame.red[name]) {
								xocxoc.ingame.red[name][box] += cuoc;
							}else{
								xocxoc.ingame.red[name] = newData;
							}
							me_cuoc.red = xocxoc.ingame.red[name];
							Object.values(xocxoc.clients).forEach(function(users){
								if (client !== users) {
									users.red({xocxoc:{chip:{box:box, cuoc:cuoc}}});
								}else{
									users.red({xocxoc:{mechip:{box:box, cuoc:data.cuoc}, me:me_cuoc}, user:{red:user.red}});
								}
							});
	
							let vipStatus = getConfig('topVip');
							if (!!vipStatus && vipStatus.status === true) {
								TopVip.updateOne({'name':name}, {$inc:{vip:cuoc}}).exec(function(errV, userV){
									if (!!userV && userV.n === 0) {
										try{
											TopVip.create({'name':name, 'vip':cuoc});
										} catch(e){
										}
									}
									name = null;
									cuoc = null;
								});
							}else{
								name = null;
								cuoc = null;
							}
	
							Push.create({
								type:"GameXocXocBet",
								data:JSON.stringify({uid:client.UID,money:cuoc,name:name})
							});
						}else{
							client.red({xocxoc:{notice: 'Bạn không được phép đặt 2 cửa.!!'}});
						}

						client  = null;
						xocxoc  = null;
						me_cuoc = null;
						newData = null;
						data    = null;
						box  = null;

					})
				}
			});
		}
	}
};
