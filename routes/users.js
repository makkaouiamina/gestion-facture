const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const passport = require('passport');
const config = require('../config/auth');

var { isLoggedIn, isAdmin,ensureAuthenticated} = config;

//User model
const User = require('../models/User');
//CLient model
const Client = require('../models/Client');
//Produit model
const Produit = require('../models/Produit');
//Facture model
const Facture = require('../models/Facture');



//admin
//admin add a user
router.get('/ajouter',ensureAuthenticated, (req, res )=>{
  user= req.user;
  res.render('admin/users/ajouter-user',{
    user:req.user,
    username:req.user.username
  })
});

router.post('/ajouter',ensureAuthenticated,(req,res)=>{
  let errors=[];
  var username = req.body.username;
  var email = req.body.email;
  var telephone = req.body.telephone;
  var fax = req.body.fax;
  var id_fiscale = req.body.id_fiscale;
  var adresse =req.body.adresse;
  //Check required fields
if(!username ||!email||!adresse ||!telephone||!id_fiscale||!fax|| !req.body.password){
req.flash('error_msj','Les champs sont obligatoires');
res.redirect('/users/ajouter')
}
if(req.body.password.length < 8){
  req.flash('error_msj','le mot de passe doit contenir au moins 8 caractères!');
}else{
  // validation passed
  User.find({email: req.body.email})
  .exec()
  .then(user => { 
      if (user.length >= 1){
          errors.push({ msj: 'cette adresse email existe déja'});
          res.redirect('/users/ajouter');
      }else{
         bcrypt.hash(req.body.password, 10, (err, hash)=>{
             if (err){
                 return res.status(500).json({
                 error: err
                 });
             }else {
                 const user = new User({
                     _id : new mongoose.Types.ObjectId(),username,email,telephone,fax,id_fiscale,adresse,
                     password:hash
                   });
                   user.save()
                   .then(user => {
                    req.flash('success_msj',user.username + ' ete ajouté avec succès');
                    res.redirect('/users');
                       })
                   .catch(err =>{
                       console.log(err);
                       res.status(500).json({
                           error:err
                       });
                   });
             }
         });
      }
  })
}
});

//get all users
router.get('/',isAdmin,(req,res,limit)=>{
  user=req.user;
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    User.find({'username':regex}).limit(limit).sort([['created_at', 'ascending']])
    .exec(function(err, users) {   
      if (err) {
        req.flash('error_msj','aucun utilisateur trouvé');
        res.redirect('/users');
      }else{ 
        if(users < 1){
          req.flash('error_msj','aucun utilisateur ne correspond à cette requête, réessayez');
          res.redirect('/users')
        }else{
          console.log(users);
          res.render('admin/users/list-user' ,{ "users": users,
          user: req.user,
          username:req.user.username
      });
        }
  }
    })
  }else{
    User.find({username:{$nin:req.user.username}}).limit(limit).sort([['created_at', 'ascending']])
    .exec(function(err, users) {   
      if (err) {
        req.flash('error_msj','aucun utilisateur trouvé');
        res.redirect('/users');
      }else{  console.log(users);
        res.render('admin/users/list-user' ,{ "users": users,
        user: req.user,
        username:req.user.username
    });
  }
    })
  }
});







//
router.get('/:user_id',(req, res)=>{
  user=req.user;
User.findById(req.params.user_id,(err,user1)=>{
if(err) throw err;
res.render('users/user',{
    user:req.user,
    username:req.user.username,
    "user1":user1
})
});
});

//edit user
router.get('/modifier/:user_id',ensureAuthenticated,(req,res)=>{
    User.findById(req.params.user_id).exec((err, user1)=>{
      if (err){
        res.redirect('/users/edit/' + req.params.user_id);
      }else{
        console.log(user1);
        res.render('users/edit',{"user1":user1,
        user:req.user,
        username: req.user.username,
       })
      }
    });
  });
  router.post('/modifier/:user_id',ensureAuthenticated,(req,res)=>{
   console.log('user id is '+ req.params.user_id);
  
   const body={
     username: req.body.username,
     email: req.body.email,
     telephone: req.body.telephone,
     fax: req.body.fax,
     id_fiscale: req.body.id_fiscale,
     adresse: req.body.adresse,
   }
  
   User.findByIdAndUpdate(req.params.user_id, body, {upsert: true, new: true}, (err)=>{
     if (err){throw err
     }else{
       
      req.flash('success_msj','les informations sont modifiés avec succès');
       res.redirect('/users');
     }
   });
  
  });

//supprimer user
router.get('/supprimer/:user_id',ensureAuthenticated,(req,res)=>{
  User.findByIdAndDelete(req.params.user_id, (err,result)=>{
      if (err){
          req.flash('error_msj','suppression échouée');
          res.redirect('/users');
        }else{
          req.flash('success_msj', result.username +' est supprimée avec succès');
          res.redirect('/users')
        }
  })
});

//admin
//ajouter client a utilisteur
router.get('/:user_id/ajouter-client',ensureAuthenticated,(req,res)=>{
  User.findById(req.params.user_id).exec((err, u)=>{
    if(err) throw err;
    console.log('user est est est :'+u);
   res.render('admin/clients/ajouter-client',{
     user:req.user,
     username:req.username,
     "u":u
   })
})
});

router.post('/:user_id/ajouter-client',ensureAuthenticated,(req, res, next) =>{
  let errors =[];
  var user1 = req.body.id;
  var client_name = req.body.client_name;
  var client_tel = req.body.client_tel;
  var client_email = req.body.client_email;
  var client_adr = req.body.client_adr;
  //Check required fields
if(!client_name ||!client_tel ||!client_email||!client_adr ){
req.flash('error_msj','les champs sont obligatoires');
res.render('admin/clients/ajouter-client',{
  client_adr ,client_email,client_tel,client_name,
  user:req.user,
  username:req.user.username
})
}else{
  // validation passed
  Client.find({client_name: req.body.client_name})
  .exec()
  .then(client => { 
      if (client.length >= 1){
          errors.push({ msj: 'client existe deja'});
          res.render('admin/clients/ajouter-client', {
              errors,client_adr ,client_email,client_tel,client_name,
              user:req.user,
              username:req.user.username
          });
      }else{
          const client = new Client({ _id : new mongoose.Types.ObjectId(),
            user1,
            client_name,client_email,client_tel,client_adr});
          client.save()
          .then(client=> {
            console.log(client);
            req.flash('success_msj',client.client_name +' ajouté(e) avec succée');
          res.redirect('/clients');
               })
          .catch(err =>{
              console.log(err);
              res.status(500).json({
                  error:err
              });
          });
       }
})}
}); 

//all user's clients
router.get('/:user_id/clients',ensureAuthenticated,(req,res)=>{
  User.findById(req.params.user_id).exec((err,user1)=>{
    if(err) throw err;
    Client.find({'user1':user1._id}).exec((err,results)=>{
      if(err) throw err;
      console.log("results:"+results)
      res.render('admin/users/all-clients',{
        user:req.user,
        username:req.username,
        "results":results,
        "user1":user1
      })
     })
  })
 });


//supprimer tout
router.get('/delete',ensureAuthenticated,(req,res)=>{
  User.deleteMany({}).exec((err)=>{
   if (err){
     req.flash('error_msj','suppression echouée');
     res.redirect('/users');
   }else{
     req.flash('error_msj', 'la liste est vide');
     res.redirect('/users')
   }
  })

});
//all client's factures
router.get('/factures/:user_id/:client_id',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).populate('user1').exec((err,c)=>{
    if(err) throw err;
    Facture.find({'client1.cl':c._id,'user1':c.user1._id}).populate('user1').exec((err,factures)=>{
      if(err) throw err;
      console.log(factures);
      res.render('admin/factures/show-factures',{
        user:req.user,
        username:req.username,
        "factures":factures,
        "c":c
      })
     });
    });
  })


///facturer
router.get('/:user_id/:client_id/facturer',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).populate('user1').exec((err,c)=>{
    if(err) throw err;
    console.log(c);
    User.findById(c.user1._id).exec((err,u)=>{
      if(err) throw err;
      console.log('societe est :'+u.username);
      console.log(' client est'+ c.client_name);
      res.render('admin/factures/ajouter-facture',{
      "c":c,
      "u":u,
        user:req.user,
        username: req.user.username
     })  
   })
    })
 });
 
 router.post('/:user_id/:client_id/facturer',ensureAuthenticated,(req,res)=>{
   Client.findById(req.params.client_id).populate('user1').exec((err,c)=>{
     if(err) throw err;
     console.log('client est:'+c.client_name);
      var desf = req.body.desf;
      var date= req.body.date;
      var user1 = c.user1._id;
      var client1 = {cl:c._id,
       client_name:c.client_name,
       client_adr:c.client_adr,
       client_email:c.client_email,
       client_tel:c.client_tel
     }
      const facture = new Facture({
       _id: new mongoose.Types.ObjectId(),desf,date,user1,client1
      });
      facture.save()
      .then(facture =>{
        req.flash('success_msj','facture '+ facture.desf+' cree avec succes');
       // res.redirect('/users/clients/'+req.params.client_id+'/factures');
        res.redirect('/factures');
      }).catch(err =>{
        console.log(err);
        res.status(500).json({error : err})
      });
   })
 });


//facture produit
router.get('/:user_id/:client_id/:facture_id',(req,res)=>{
  let total=0;
  let tva =1;
  let pttc;
  Facture.findById(req.params.facture_id).populate('user1').exec((err,f)=>{
    if(err) throw err;
    Produit.find({'client.client_name':f.client1.client_name,'facture.desf':f.desf}).exec((err, results)=>{
      if(err) throw err;
      console.log('tous le produits du client '+f.client1.client_name+'sont '+results);
      res.render('admin/factures/facture',{
        results:results
        ,f:f,
        total,pttc,
        tva,
        user:req.user,
        username:req.user.username,
      })
    })
  })
});

//admin 

//ajouter produit a la facture d'un client
router.get('/produit/:client_id',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).populate('user1').exec((err, result)=>{
    if(err) throw err;
    console.log("result :"+req.params.client_id);
      console.log(result);
      Facture.find({'client1.cl':result._id}).exec((err,factures)=>{
        if(err) throw err;
        console.log('facture sont'+factures);
      
      
      res.render('admin/produits/ajouter-produit',{
        "factures":factures,
        "result":result,
      user:req.user,
       username:req.user.username,
      })
  });
});
 });
router.post('/produit/:client_id', ensureAuthenticated,(req,res)=>{
    Client.findById(req.params.client_id).populate('user1').exec((err,result)=>{
   if(err) throw err;
   Facture.findOne({'desf':req.body.desf}).exec((err, resultat)=>{
    if(err) throw err;
    console.log('id '+resultat._id +' nom du facture '+resultat.desf);
    var facture={
      fa:resultat._id,
      desf:resultat.desf
    };
    des= req.body.des;
    prix=req.body.prix;
    qty=req.body.qty;
   var user1 = req.body.user1;;
   var client={
    num : result._id,
    client_name: result.client_name,
    client_tel: result.client_tel,
    client_email: result.client_email,
    client_adr: result.client_adr
   };
   if(!des ||!prix||!qty ||!req.body.desf){
    req.flash('error_msj','Les champs sont obligatoires');
res.redirect('/clients/'+req.params.client_id+'/produit')
  }else{
              const produit = new Produit({
                  _id: new mongoose.Types.ObjectId(),des, prix,qty,user1,client,facture
              });
              produit.save().then(produit =>{
                  console.log(produit);
                  req.flash('success_msj',produit.des+' ajoute a '+produit.facture.desf+ ' avec succes');
                res.redirect('/users/'+result.user1._id+'/'+result._id+'/'+resultat._id);
                  // res.redirect('/clients/'+req.params.client_id+'/factures');
              }).catch(err =>{
                  console.log(err);
                  res.status(500).json({error : err})
              })
          
  }
  })
});
});

router.get('/produits/:client_id',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).populate('user1').exec((err, c)=>{
    if(err) throw err;
    console.log('client est est est :'+c);
  Produit.find({'client.num': req.params.client_id}).populate('user1').exec((err,results)=>{
   if(err) throw err;
   res.render('admin/clients/all-produits',{
     "c":c,
     "results":results,
     user:req.user,
     username:req.user.username
   })
  })
})
});


////////////
router.get('/ajouter/produits/:client_id/:facture_id',ensureAuthenticated,(req,res)=>{
  Facture.findById(req.params.facture_id).exec((err,facture)=>{
    if(err) throw err;
    console.log('facture est '+facture);
        res.render('admin/produits/produit-ajouter',{
          "facture":facture,
        user:req.user,
         username:req.user.username,
        })
  });
});
router.post('/ajouter/produits/:client_id/:facture_id', ensureAuthenticated,(req,res)=>{
  Facture.findOne({'desf':req.body.desf}).populate('user1').exec((err, resultat)=>{
    if(err) throw err;
    console.log('id '+resultat._id +' nom du facture '+resultat.desf);
    var facture={
      fa:resultat._id,
      desf:resultat.desf
    };
    des= req.body.des;
    prix=req.body.prix;
    qty=req.body.qty;
   var user1 = resultat.user1._id;
   var client={
    num : resultat.client1.cl,
    client_name:resultat.client1.client_name,
    client_tel: resultat.client1.client_tel,
    client_email: resultat.client1.client_email,
    client_adr: resultat.client1.client_adr
   };
   if(!des ||!prix||!qty ||!req.body.desf){
    req.flash('error_msj','Les champs sont obligatoires');
res.redirect('/ajouter/produits/'+resultat.client1.cl+'/'+resultat._id);
  }else{
              const produit = new Produit({
                  _id: new mongoose.Types.ObjectId(),des, prix,qty,user1,client,facture
              });
              produit.save().then(produit =>{
                  console.log(produit);
                  req.flash('success_msj',produit.des+' ajouté à '+produit.facture.desf+ ' avec succès');
                res.redirect('/users/'+resultat.user1._id+'/'+resultat.client1.cl+'/'+resultat._id)
                  // res.redirect('/clients/'+resultat.client1.cl+'/'+resultat._id)
                  // res.redirect('/clients/'+resultat.client1.cl+'/factures');
              }).catch(err =>{
                  console.log(err);
                  res.status(500).json({error : err})
              })
          
  }
});
});

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\&&");
};


module.exports = router;