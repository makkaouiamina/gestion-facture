const mongoose = require('mongoose');


const ProduitSChema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
        des:{type:String},
        prix:{type:Number},
        qty:{type:Number},
    facture:{
       fa:{type: mongoose.Schema.Types.ObjectId, ref: 'Facture'},
       desf:{type:String}
    },
    user1:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    client:{
        num:{type: mongoose.Schema.Types.ObjectId, ref: 'Client'},
        client_name:{type:String},
        client_tel:{type:String},
        client_email:{type: String,
                      match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)/},
        client_adr:{type:String},
    }
});



module.exports = mongoose.model('Produit', ProduitSChema);

