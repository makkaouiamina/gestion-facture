const mongoose = require('mongoose');


const FactureSChema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    desf:{type:String},
    client1:{
        cl:{type: mongoose.Schema.Types.ObjectId, ref: 'Client'},
        client_name:{type:String},
        client_tel:{type:String},
        client_email:{type: String,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)/},
        client_adr:{type:String},

    },
    user1:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type : Date,
            default:Date.now() 
          }

});



 module.exports = mongoose.model('Facture', FactureSChema);

