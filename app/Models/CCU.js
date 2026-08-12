let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    count:    {type:mongoose.Schema.Types.Long, default:0},
    date:   {type: Date,    required: true},
});
module.exports = mongoose.model('CCU', Schema);