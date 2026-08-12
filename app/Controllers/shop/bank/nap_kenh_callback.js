
let Bank_history = require('../../../Models/Bank/Bank_history');
let UserInfo     = require('../../../Models/UserInfo');
let fs 	= require('fs');
var helper = require('../../../Helpers/Helpers');
module.exports = function (req, res) {
    try{
        let data = req.query;
        /*
          query: {
            chargeId: '1047217',
            chargeType: 'bank',
            chargeCode: 'coc mua xe 27X75961',
            regAmount: '2000',
            status: 'success',
            chargeAmount: '2000',
            requestId: '1-388666',
            signature: 'af97f088792ce419018a4fe2234c8e72',
            momoTransId: ''
        },
        */
        requestId = data.requestId;
        chargeType = data.chargeType;
        let regAmount = data.regAmount;
        let chargeAmount = data.chargeAmount;
        console.log("requestId:"+requestId);
        try{
            conf =  JSON.parse(fs.readFileSync(global['path_server']+'/config/config-payment.json', 'utf8'))
       }catch(e){
            conf =  {};
            console.log(e);
       }
    
       let statusOke = data.status;
       
       Bank_history.findOne({'branch':requestId,status:{$ne: 1}}, {}, function(err, history){
            
           if (!!history) {
                let update = {};
                let sale = 0;	
                if(statusOke == "success"){
                    if(regAmount == chargeAmount){
                        update.red = parseInt(chargeAmount); 
                        if(conf.hasOwnProperty("bank")){
                            sale = conf.bank;
                            update.red+=parseInt(conf.bank*chargeAmount);
                        }
                        history.status = 1;
                        history.save();
                        UserInfo.findOneAndUpdate({'id':history.uid}, {$inc:{red:update.red}}, function(err2, user) {
                            
                            if (void 0 !== redT.users[history.uid]) {
                                Promise.all(redT.users[history.uid].map(function(obj) {
                                    if(chargeType == "bank"){
                                        obj.red({ notice: {title:'THÀNH CÔNG', text:`Nạp thẻ thành công \nBạn nhận được ${helper.numberWithCommas(update.red)} gold.`, load: false}, user:{red: user.red*1+update.red} });
                                    }else{
                                        obj.red({ notice: {title:'THÀNH CÔNG', text:`Nạp thẻ thành công \nBạn nhận được ${helper.numberWithCommas(update.red)} gold.`, load: false}, user:{red: user.red*1+update.red} });
                                    }
                                }));
                            }
                            
                        });
                    }else{
                        history.status = 2;
                        history.info = regAmount;
                        history.save();
                    }
                }else{
                    history.status = 2;
                    history.save();
                }
           }
        });
    }catch{

    }
   
    res.sendStatus(200);
};