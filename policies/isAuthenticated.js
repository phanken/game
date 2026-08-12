var config = require('../config');
var ip = require('../app/Models/Ip');
module.exports = async function(req, res, next) {
    const authorization = req.headers.authorization;
    const { token } = req.cookies || {}
	
//	var _ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  //  console.log("_ip:"+_ip);
//	var data = await ip.findOne({"Ip":_ip}).exec();
//	console.log(token);
//	console.log(authorization);

    let data = {};
	data.Status = true;
    
    if(data){
        if(data.Status){
            if (authorization &&
                authorization.startsWith('Bearer ') || token) {
                const token = authorization ? authorization.slice('Bearer '.length) : token;
				
				console.log(token);
				
                var jwt = require('jsonwebtoken');
                var bcrypt = require('bcrypt-nodejs');
                var cert = config.secret;
                if (token) {
                    try {
                        jwt.verify(token, cert, function(err, decoded) {
                            if (decoded) {
                                req.userAuth = decoded;
                                next();
                            } else {
                                if (err && err.name == 'TokenExpiredError') {
                                    console.log("============================TOKEN EXPIRE HANDLE");
                                    var error = new Error("isAuthenticated.TokenExpiredError");
                                    return res.status(403).json(error);
                                } else {
                                    console.log(err);
                                    var error = new Error("isAuthenticated.tokenInvalid");
                                    return res.status(403).json(error);
                                }
                            }
                        });
                    } catch (err) {
                        console.log('error', err);
                        return res.status(403).json(err);
                    }
                } else {
                    return res.status(403).json(error);
                }
            } else {
                var error = new Error("isAuthenticated.authorizationNotProvided");
                return res.status(403).json(error);
            }
        }else{
            var error = new Error("isAuthenticated.authorizationNotProvided");
            return res.status(403).json(error);
        }
    }else{
        ip.create({"Ip":_ip,'date':new Date(),'Type':'cms'});
        var error = new Error("isAuthenticated.authorizationNotProvided");
        return res.status(403).json(error);
    }
};
