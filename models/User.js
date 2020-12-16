const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSChema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username : {type : String,},
    id_fiscale:{type:Number,
                unique:true },
    email:{ type: String,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)/
          },

    adresse:{type:String},
    password : {type : String,
            required : true},
    telephone:{ type : String,
                match: /[0-9]/},
    fax:{
        type:String,
        match: /[0-9]/
        },
    isAdmin:{
        type: Boolean,
        default: false,
        },
    isLoggedIn:{
        type: Boolean,
        default: true,
        }
    

});
UserSChema.plugin(passportLocalMongoose);

const User = module.exports = mongoose.model('User', UserSChema);
