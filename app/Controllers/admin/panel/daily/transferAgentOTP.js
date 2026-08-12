var ChuyenRed = require('../../../../Models/ChuyenRed');
var UserInfo = require('../../../../Models/UserInfo');
var tab_DaiLy = require('../../../../Models/DaiLy');
var OTP = require('../../../../Models/OTP');
var Phone = require('../../../../Models/Phone');
var nTmux = require('node-tmux');
var validator = require('validator');
var Helper = require('../../../../Helpers/Helpers');
var request = require('request');
let telegram = require('../../../../Models/Telegram');
module.exports = function(req, res) {
 const { body, userAuth } = req || {}
 const { Data: data } = body || {};
 Phone.findOne({'uid':userAuth.id}, function(err3, check){
		if (check) {
			OTP.findOne({'uid': userAuth.id, 'phone':check.phone}, {}, {sort:{'_id':-1}}, function(err1, data){
				if (!data || ((new Date()-Date.parse(data.date))/1000) > 180 || data.active) {
					// Tạo mã OTP mới
					UserInfo.findOne({'id': userAuth.id}, 'red name', function(err2, user){
						if (user) {
							let otp = (Math.random()*(999999-100000+1)+100000)>>0; // OTP từ 100000 đến 999999
                            let userNameOTP = user.name;
                            let id = userAuth.id;
                            let phoneno = check.phone;
                            OTP.create({'uid':id, 'phone':phoneno, 'code':otp, 'date':new Date()});
                            console.log(phoneno);        
                            telegram.findOne({'phone':phoneno}, 'form', function(err3, teleCheck){
								if (!!teleCheck) {
									
                                    res.json({
                                        status: 200,
                                        success: true,
                                        data: {
                                            message: 'Mã OTP đã được gửi đến telegram của bạn'
                                        }
                                    });
                                    console.log(teleCheck.form);
									 global['redT'].telegram.sendMessage(teleCheck.form, '*OTP*:  ' + otp + '', {parse_mode:'markdown', reply_markup:{remove_keyboard: true}});
								}else{
									client.red({notice:{title:'THẤT BẠI', text:'Bạn cần xác thực Telegram để lấy OTP.'}});
                                    res.json({
                                        status: 200,
                                        success: false,
                                        data: {
                                            message: 'Bạn cần xác thực Telegram để lấy OTP.'
                                        }
                                    });
								}
							});
					}});
				}else{
                    UserInfo.findOne({'id': userAuth.id}, 'red name', function(err2, user2){
                                        if (user2) {
                    let userNameOTP = user2.name;
                    let id = userAuth.id;
                    let phoneno = check.phone;
                    // App OTP
                    res.json({
                        status: 200,
                        success: true,
                        data: {
                            message: 'Mã OTP đã được gửi lại đến telegram của bạn'
                        }
                    });
    //   nTmux.tmux().then(tm => {
    //      //tm.newSession("Telegram","telegram-cli");
    //      tm.writeInput("tele","dialog_list",true);
    //      setTimeout(() => { tm.writeInput("tele",'msg '+userNameOTP+' "OTP :'+data.code+'"',true); }, 2000);
    //      res.json({
    //          status: 200,
    //          success: true,
    //          data: {
    //              message: 'Mã OTP đã được gửi lại đến telegram của bạn'
    //          }
    //      });
    //   }).catch((e) => {
    //         console.log(e)
    //     res.json({
    //         status: 200,
    //         success: false,
    //         data: {
    //             message: 'Lỗi111'
    //         }
    //     });
    //   });
    }
   });
  }
 });
		}else{
   res.json({
       status: 200,
       success: false,
       data: {
           message: 'Bạn cần kích hoạt otp để xử dụng tính năng này'
       }
   });
		}
	});
}
