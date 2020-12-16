const mongoose = require('mongoose');


const ClientSChema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user1:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    client_name:{type:String},
    client_tel:{type:String},
    client_email:{type: String,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)/},
    client_adr:{type:String},
});



module.exports = mongoose.model('Client', ClientSChema);