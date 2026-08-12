let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
	red:    {type: Number, default: 0},         
    red_giftcode:    {type: Number, default: 0},         
    daily: { type: String }, 					 
    timeUse: { type: Date },
});
Schema.index({daily:1}, {background: true});
module.exports = mongoose.model('GiftCodeBank', Schema);