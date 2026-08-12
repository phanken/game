// Setting & Connect to the Database
let configDB = require('./config/database');
let mongoose = require('mongoose');
 
require('mongoose-long')(mongoose); // INT 64bit

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

console.log(configDB);

mongoose.connect(configDB.url, configDB.options)
    .then(function () {
      
    })
    .catch(function(error) {
        console.log(error);
        if (error)
            console.log('Connect to MongoDB failed', error);
        else{

        }
});

