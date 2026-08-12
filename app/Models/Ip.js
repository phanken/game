let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
	Ip:    {type: String,  required: true},
	Status:  {type: Boolean, default: false},  
	date:   {type: Date,    default: new Date()},
	Type:    {type: String,  default: "admin"},
});
module.exports = mongoose.model('Ip', Schema);
