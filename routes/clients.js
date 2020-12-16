const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const config = require('../config/auth');

var { isLoggedIn, isAdmin,ensureAuthenticated} = config;


//Client model
const Client = require('../models/Client');

//Produit model
const Produit = require('../models/Produit');

//Facture model
const Facture = require('../models/Facture');


//get all clients

router.get('/',ensureAuthenticated,(req, res,limit )=>{
 user = req.user;
 if(user.isLoggedIn){
     if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Client.find({'client_name':regex, 'user1':req.user}).populate('user').limit(limit).sort([['created_at', 'ascending']])
    .exec(function(err, clients) {   
      if (err) {
        req.flash('error_msj','aucun client trouvé');
        res.redirect('/clients');
      }else{ 
        if(clients < 1){
          req.flash('error_msj','aucun client ne correspond à cette requête, réessayez');
          res.redirect('/clients')
        }else{
          console.log(clients);
          res.render('clients/list-client' ,{ "clients": clients,
          user: req.user,
          username:req.user.username,
          title:'liste des clients'
          
      });
        }
  }
    })
  }else{
    Client.find({'user1':req.user}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
    .exec(function(err, clients) {   
      if (err) {
        req.flash('error_msj','aucun client trouvé');
        res.redirect('/users/dashboard');
      }else{  console.log(clients);
        res.render('clients/list-client' ,{ "clients": clients,
        user: req.user,
        username:req.user.username
    });
  }
    })
  }
 }if(user.isAdmin){
     if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Client.find({'client_name':regex}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
    .exec(function(err, clients) {   
      if (err) {
        req.flash('error_msj','aucun client trouvLes champs ne devraient pas être vides');
        res.redirect('/users/dashboard');
      }else{ 
        if(clients < 1){
          req.flash('error_msj','aucun client ne correspond à cette requête, réessayez');
          res.redirect('/clients')
        }else{
          console.log(clients);
          res.render('admin/clients/list-client' ,{ "clients": clients,
          user: req.user,
          username:req.user.username
      });
        }
  }
    })
  }else{
    Client.find({}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
    .exec(function(err, clients) {   
      if (err) {
        req.flash('error_msj','aucun client trouvé');
        res.redirect('/users/dashboard');
      }else{ 
         console.log(clients);
        res.render('admin/clients/list-client' ,{ 
        "clients": clients,
        user: req.user,
        username:req.user.username
    });
  }
    })
  }
 }
});
//one client information
/*
router.get('/:client_id',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id)
  .exec((err, client)=>{
    if(err){ 
      req.flash('error_msj','un erreur est produit');
      res.redirect('/clients')}
    res.render('clients/client',{"client":client,
      user:req.user,
      username:req.user.username
  })
  });
});*/


router.get('/:client_id/produits',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).exec((err, c)=>{
    if(err) throw err;
    console.log('client est est est :'+c);
  Produit.find({'client.num': req.params.client_id}).exec((err,results)=>{
   if(err) throw err;
   res.render('clients/all-produits',{
     "c":c,
     "results":results,
     user:req.user,
     username:req.user.username
   })
  })
})
});
/*
router.get('/:client_id/produits',ensureAuthenticated,(req,res)=>{
  Produit.find({'client.num':req.params.client_id}).exec((err, results)=>{
  if(err) throw err;
  console.log('tous les produits du client '+ req.params.clients_id +' sont '+ results);
  res.render('clients/all-produits',{"results":results,
    user:req.user,
    username: req.user.username
 })
  });
});*/

// ajouter clients
router.get('/ajouter',ensureAuthenticated,(req,res)=>{
  res.render('clients/ajouter-client',{
      user: req.user,
      username:req.username
  })
});

router.post('/ajouter',ensureAuthenticated,(req, res, next) =>{
  let errors =[];
  var user1 = req.user;
  var client_name = req.body.client_name;
  var client_tel = req.body.client_tel;
  var client_email = req.body.client_email;
  var client_adr = req.body.client_adr;
  //Check required fields
if(!client_name ||!client_tel ||!client_email||!client_adr ){
req.flash('error_msj','Les champs sont obligatoires');
res.render('clients/ajouter-client',{
  client_adr ,client_email,client_tel,client_name,
  user:req.user,
  username:req.user.username
})
}else{
  
          const client = new Client({ _id : new mongoose.Types.ObjectId(),
            user1,
            client_name,client_email,client_tel,client_adr});
          client.save()
          .then(client=> {
            console.log(client);
            req.flash('success_msj',client.client_name +' ajouté avec succès');
          res.redirect('/clients');
               })
          .catch(err =>{
              console.log(err);
              res.status(500).json({
                  error:err
              });
          });
       }

}); 

//supprimer 

router.get('/supprimer/:client_id',ensureAuthenticated,(req,res)=>{
  Client.findByIdAndRemove(req.params.client_id, function(err, result) {
    if (err){
      req.flash('error_msj','suppression échouée');
      res.redirect('/clients');
    }else{
      req.flash('success_msj', result.client_name +' est supprimée avec succès');
      res.redirect('/clients')
    }
  });
});
//supprimer tout
router.get('/delete',ensureAuthenticated,(req,res)=>{
   Client.deleteMany({}).exec((err)=>{
    if (err){
      req.flash('error_msj','suppression échouée');
      res.redirect('/clients');
    }else{
      req.flash('error_msj', 'la liste est vide');
      res.redirect('/clients')
    }
   })

});

//Modifier
router.get('/modifier/:client_id',ensureAuthenticated,(req,res)=>{
  user=req.user;
  if(user.isLoggedIn){
    Client.findById(req.params.client_id).exec((err, client)=>{
      if (err){
        res.redirect('/clients/modifier/' + req.params.client_id);
      }
      else{
        console.log(client);
        res.render('clients/modifier-client',{"client":client,
        user:req.user,
        username: req.user.username,
        title:"Modifier Client"
       })
      }
    });
  }if(user.isAdmin){
    Client.findById(req.params.client_id).exec((err, client)=>{
      if (err){
        res.redirect('/clients/modifier/' + req.params.client_id);
      }
      else{
        console.log(client);
        res.render('admin/clients/modifier-client',{"client":client,
        user:req.user,
        username: req.user.username,
        title:"Modifier Client"
       })
      }
    });
  }
  
  });

router.post('/modifier/:client_id',ensureAuthenticated,(req,res)=>{
    
   console.log('client id is '+ req.params.client_id);
  
   const body={
    client_name: req.body.client_name,
    client_adr: req.body.client_adr,
    client_tel: req.body.client_tel,
    client_email: req.body.client_email
   }
   Client.findByIdAndUpdate(req.params.client_id, body, {upsert: true, new: true}, (err)=>{
     if (err){
       req.flash('error_msj','modification echouee!!');
       res.redirect('/clients/modifier/' + req.params.client_id);
     }else{
       req.flash('success_msj','les informations sont modifiés avec succès');
       res.redirect('/clients');
     }
   });
  
});

router.get('/:client_id',ensureAuthenticated,(req,res)=>{
  user= req.user;
  if(user.isLoggedIn){
    Client.findById(req.params.client_id).populate('user').exec((err, client)=>{
      if(err) throw err;
      res.render('clients/client',{"client":client,
    user:req.user,
    username:req.user.username
    })
    })
  }if(user.isAdmin){
    Client.findById(req.params.client_id).populate('user').exec((err, client)=>{
      if(err) throw err;
      res.render('admin/clients/client',{"client":client,
    user:req.user,
    username:req.user.username
    })
    })
  }
  
});


//ajouter produit a la facture d'un client
router.get('/:client_id/produit',ensureAuthenticated,(req,res)=>{
  Facture.find({'client1.cl':req.params.client_id}).exec((err,factures)=>{
    if(err) throw err;
    console.log('facture sont'+factures);
    Client.findById(req.params.client_id).exec((err, result)=>{
      if(err) throw err;
      console.log("result :"+req.params.client_id);
        console.log(result);
        res.render('produits/ajouter-produit',{
          "factures":factures,
          "result":result,
        user:req.user,
         username:req.user.username,
        })
    });
  });
 });
router.post('/:client_id/produit', ensureAuthenticated,(req,res)=>{
  Facture.findOne({'desf':req.body.desf}).exec((err, resultat)=>{
    if(err) throw err;
    console.log('id '+resultat._id +' nom du facture '+resultat.desf);
    Client.findById(req.params.client_id).exec((err,result)=>{
   if(err) throw err;
    var facture={
      fa:resultat._id,
      desf:resultat.desf
    };
    des= req.body.des;
    prix=req.body.prix;
    qty=req.body.qty;
   var user1 = req.user;
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
                  res.redirect('/clients/'+req.params.client_id+'/factures');
              }).catch(err =>{
                  console.log(err);
                  res.status(500).json({error : err})
              })
          
  }
  })
});
});


////////////
router.get('/ajouter/produits/:client_id/:facture_id',ensureAuthenticated,(req,res)=>{
  Facture.findById(req.params.facture_id).exec((err,facture)=>{
    if(err) throw err;
    console.log('facture est '+facture);
        res.render('produits/ajouter-fproduit',{
          "facture":facture,
        user:req.user,
         username:req.user.username,
        })
  });
});
router.post('/ajouter/produits/:client_id/:facture_id', ensureAuthenticated,(req,res)=>{
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
   var user1 = req.user;
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
                 res.redirect('/clients/'+resultat.client1.cl+'/'+resultat._id)
                  // res.redirect('/clients/'+resultat.client1.cl+'/factures');
              }).catch(err =>{
                  console.log(err);
                  res.status(500).json({error : err})
              })
          
  }
});
});


/*
router.get('/:client_id/facturer',ensureAuthenticated,(req,res)=>{
 Client.findById(req.params.client_id).exec((err,c)=>{
   if(err) throw err;
   console.log(' client est'+ c.client_name);
   Produit.find({'client.num':req.params.client_id}).exec((err, results)=>{
    if(err) throw err;
    console.log('tous les produits du client '+ req.params.client_id +' sont '+ results);
    res.render('clients/produits/all',{"results":results,
    "c":c,
      user:req.user,
      username: req.user.username
   })
    });
 })
});

router.post('/:client_id/facturer',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).exec((err,c)=>{
    if(err) throw err;
    console.log('client est:'+c.client_name);
    Produit.find({'client.num':req.params.client_id}).exec((err,results)=>{
     if(err) throw err;
     console.log('tous les produits du client '+c.client_name + ' sont '+ results);
     var desf = req.body.desf;
     var user1 = req.user;
     var client1 = {cl:c._id,
      client_name:c.client_name,
      client_adr:c.client_adr,
      client_email:c.client_email,
      client_tel:c.client_tel
    }
     const facture = new Facture({
      _id: new mongoose.Types.ObjectId(),desf,user1,client1
     });
     facture.save()
     .then(facture =>{
       req.flash('succes_msj', facture._id+' ajoute avec succes');
       res.redirect('/clients/'+ req.params.client_id +'/factures');
     }).catch(err =>{
       console.log(err);
       res.status(500).json({error : err})
     });
    });
  })
});*/


//facturer
router.get('/:client_id/facturer',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).exec((err,c)=>{
    if(err) throw err;
    console.log(' client est'+ c.client_name);
     res.render('factures/ajouter-facture',{
     "c":c,
       user:req.user,
       username: req.user.username
    })  
  })
 });
 
 router.post('/:client_id/facturer',ensureAuthenticated,(req,res)=>{
   Client.findById(req.params.client_id).exec((err,c)=>{
     if(err) throw err;
     console.log('client est:'+c.client_name);
      var desf = req.body.desf;
      var date= req.body.date;
      var user1 = req.user;
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
        req.flash('success_msj','facture num '+ facture._id+' crée avec succès');
        res.redirect('/clients/'+req.params.client_id+'/factures');
        //res.redirect('/factures');
      }).catch(err =>{
        console.log(err);
        res.status(500).json({error : err})
      });
   })
 });


 
 

//get facture
router.get('/:client_id/factures',ensureAuthenticated,(req, res,limit )=>{
  user= req.user;
  if(user.isLoggedIn){
    if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      Client.findById(req.params.client_id).exec((err,c)=>{
        if(err)throw err;
        console.log(c);
        Facture.find({'desf':regex,'client1.cl':req.params.client_id}).limit(limit).sort([['created_at', 'ascending']])
        .exec(function(err, factures) {   
          if (err) {
            req.flash('error_msj','aucune facture trouve!');
            res.redirect('/clients/'+req.params.client_id+'/factures');
          }else{ 
            if(factures < 1){
              req.flash('error_msj','aucun produit ne correspond à cette requête, réessayez');
              res.redirect('/clients/'+req.params.client_id+'/factures')
            }else{
              console.log(factures);
              res.render('factures/show-facture' ,{ "factures": factures,
              "c":c,
              user: req.user,
              username:req.user.username
          });
            }
      }
        }
       )
         })
    }
      else{
        Client.findById(req.params.client_id).exec((err,c)=>{
          if(err)throw err;
          console.log(c);
          Facture.find({'client1.cl':req.params.client_id}).limit(limit).sort([['created_at', 'ascending']])
          .exec(function(err, factures) {   
            if (err) throw err;
            console.log(factures);
              res.render('factures/show-facture' ,{ "factures": factures,
              "c":c,
              user: req.user,
              username:req.user.username
          });
          }
         )
           })
      }
  }if(user.isAdmin){
    Client.findById(req.params.client_id).exec((err,c)=>{
      if(err)throw err;
      console.log(c);
      Facture.find({'client1.cl':req.params.client_id}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
      .exec(function(err, factures) {   
        if (err) throw err;
        console.log(factures);
          res.render('admin/factures/show-factures' ,{ "factures": factures,
          "c":c,
          user: req.user,
          username:req.user.username
      });
      }
     )
       })
  }

});

//facture produit
router.get('/:client_id/:facture_id',(req,res)=>{
  let total=0;
  let tva =1;
  let pttc;
  Facture.findById(req.params.facture_id).exec((err,f)=>{
    if(err) throw err;
    console.log(' client est '+ f.client1.client_name + 'facture est '+f.desf );
    Produit.find({'client.client_name':f.client1.client_name,'facture.desf':f.desf}).exec((err, results)=>{
      if(err) throw err;
      console.log('tous le produits du client '+f.client1.client_name+'sont'+results);
      res.render('factures/facture',{
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
/*
//facture produit
router.get('/:client_id/:facture_id',(req,res)=>{
  Facture.findById(req.params.facture_id).exec((err,f)=>{
    if(err) throw err;
    console.log(' client est '+ f.client1.client_name);

    Produit.find({'client.client_name':f.client1.client_name}).exec((err, p)=>{
      if(err) throw err;
      console.log('tous le produits du client '+f.client1.client_name+'sont'+p);
      res.render('factures/facture',{
        "p":p,"f":f,
        user:req.user,
        username:req.user.username,
      })
      });

  })
});*/
/*
//
router.get('/:client_id/produits',ensureAuthenticated,(req,res)=>{
  Produit.find({'client.num':req.params.client_id}).exec((err, results)=>{
  if(err) throw err;
  console.log('tous les produits du client '+ req.params.clients_id +' sont '+ results);
  res.render('clients/produits/all',{"results":results,
    user:req.user,
    username: req.user.username
 })
  });
});
router.post('/facture',ensureAuthenticated,(req, res )=>{
  Client.find({'client_name':req.body.client_name});
  /*
  Produit.find({'client.client_name':req.body.client_name}).exec((err, result)=>{
    console.log(result);
    var desf = req.body.desf;
    var user1 = req.user;
    var client1 = result.client.num;
    const facture = new Facture({
     _id: new mongoose.Types.ObjectId(),desf,user1,client1
    });
    facture.save()
    .then(facture =>{
      req.flash('succes_msj', facture._id+' ajoute avec succes');
      res.render('factures/facture',{
        user:req.user,
        username:req.user.username,

      })
    }).catch(err =>{
      console.log(err);
      res.status(500).json({error : err})
    });
  });
 });
*/






 



function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\&&");
};





module.exports = router;