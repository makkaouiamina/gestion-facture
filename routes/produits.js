const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const config = require('../config/auth');

var { isLoggedIn, isAdmin,ensureAuthenticated} = config;

//Client model
const Produit = require('../models/Produit');

//Facture model
const Facture = require('../models/Facture');

//Client model
const Client = require('../models/Facture');

//get tout les produits
router.get('/',ensureAuthenticated,(req,res,limit)=>{
  user= req.user;
  if(user.isLoggedIn){
      if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Produit.find({'des':regex, 'user1':req.user}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
    .exec(function(err, produits) {   
      if (err) {
        req.flash('error_msj','aucun produit trouvé');
        res.redirect('/produits');
      }else{ 
        if(produits < 1){
          req.flash('error_msj','aucun produit ne correspond à cette requête, réessayez');
          res.redirect('/produits')
        }else{
          console.log(produits);
          res.render('produits/list-produit' ,{ "produits": produits,
          user: req.user,
          username:req.user.username
      });
        }
  }
    })
  }
   else{
    Produit.find({'user1':req.user}).limit(limit).populate('user1').sort([['created_at', 'ascending']]).exec((err, produits)=>{
      if (err) {
          req.flash('error_msj','aucune produit trouvé');
          res.redirect('/produit');
        }else{
          console.log(produits);
          res.render('produits/list-produit' ,{ "produits": produits,
          user: req.user,
          username:req.user.username
      });
        }
   });
   }
  }if(user.isAdmin){
      if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Produit.find({'des':regex}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
    .exec(function(err, produits) {   
      if (err) {
        req.flash('error_msj','aucun produit trouvé');
        res.redirect('/produits');
      }else{ 
        if(produits < 1){
          req.flash('error_msj','aucun produit ne correspond à cette requête, réessayez');
          res.redirect('/produits')
        }else{
          console.log(produits);
          res.render('admin/produits/list-produit' ,{ "produits": produits,
          user: req.user,
          username:req.user.username
      });
        }
  }
    })
  }
   else{
    Produit.find({}).populate('user1').limit(limit).sort([['created_at', 'ascending']]).exec((err, produits)=>{
      if (err) {
          req.flash('error_msj','aucune produit trouvé');
          res.redirect('/produits');
        }else{
          console.log(produits);
          res.render('admin/produits/list-produit' ,{ "produits": produits,
          user: req.user,
          username:req.user.username
      });
        }
   });
   }
  }
});



//modifier produit
router.get('/modifier/:produit_id',ensureAuthenticated,(req,res)=>{
  Produit.findById(req.params.produit_id).populate().exec((err, produit)=>{
    if (err){
      res.redirect('/produits/modifier/' + req.params.produit_id);
    }
    else{
      console.log(produit);
      res.render('produits/modifier-produit',{"produit":produit,
      user:req.user,
      username: req.user.username
     })
    }
  });
});

router.post('/modifier/:produit_id',ensureAuthenticated,(req,res)=>{
    
  console.log('produit id is '+ req.params.produit_id);
 
  const body={
    des:req.body.des,
    prix:req.body.prix,
    qty:req.body.qty
  }
  Produit.findByIdAndUpdate(req.params.produit_id, body, {upsert: true, new: true}, (err)=>{
    if (err){
      req.flash('error_msj','Mmodification échouée');
      res.redirect('/produits/modifier/' + req.params.produit_id);
    }else{
      req.flash('success_msj','Modification effectuée avec succès');
      res.redirect('/produits');
    }
  });
 
});


//supprimer produit
router.get('/supprimer/:produit_id',ensureAuthenticated,(req,res)=>{
  Produit.findByIdAndDelete(req.params.produit_id, (err,result)=>{
      if (err){
          req.flash('error_msj','Suppression échouée');
          res.redirect('/produits');
        }else{
          req.flash('success_msj', result.des +' est supprimée avec succès');
          res.redirect('/produits')
        }
  })
});

//supprimer tout
router.get('/delete',ensureAuthenticated,(req,res)=>{
  Produit.deleteMany({}).exec((err)=>{
   if (err){
     req.flash('error_msj','suppression a échoué');
     res.redirect('/produits');
   }else{
     req.flash('error_msj', 'la liste est vide');
     res.redirect('/produits')
   }
  })

});

//getOne produit
router.get('/:produit_id',ensureAuthenticated,(req,res)=>{
  Produit.findById(req.params.produit_id).populate('user1')
  .exec((err, produit)=>{
    if(err){ res.redirect('/produits')}
    res.render('produits/produit',{"produit":produit,
      user:req.user,
      username:req.user.username
  })
  });
});

//
router.get('/ajouter/:client_id',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).populate('user1').exec((err,result)=>{
    if(err) throw err;/*
    Facture.find({'client1.cl':result._id}).populate('user1').exec((err,factures)=>{
      if(err) throw err;
      res.render('admin/produits/ajouter-produit',{
        user:req.user,
        username:req.username,
        "factures":factures,
        "result":result
      })
     })*/
  })
});

/*
//payer
router.post('/payer/:commande_id',ensureAuthenticated,(req,res)=>{
  console.log('command id is '+ req.params.commande_id);
  
  var newvalue = { $set: { status: "paid" } };
  Commande.findByIdAndUpdate(req.params.commande_id,newvalue, {upsert: true, new: true}, (err)=>{
    if (err){
      req.flash('error_msj','paiment failed');
      res.redirect('/commandes');
    }else{
      req.flash('success_msj','paiment succed');
      res.redirect('/commandes');
    }
  })
 
});*/
/*
//facturer

router.post('/:commande_id/facture',ensureAuthenticated,(req, res )=>{
 Commande.findById(req.params.commande_id).exec((err, result)=>{
   console.log(result);
   var user1 = req.user;
   var commande1 = result._id;

   const facture = new Facture({
    _id: new mongoose.Types.ObjectId(),user1,commande1
   });
   facture.save()
   .then(facture =>{
     req.flash('succes_msj', facture._id+' ajoute avec succes');
     res.redirect('/factures');
   }).catch(err =>{
     console.log(err);
     res.status(500).json({error : err})
   });
 });
});
*/

/*
//facturer 2
router.get('/:commande_id/facture',ensureAuthenticated,(req,res)=>{

  Commande.findById(req.params.commande_id).exec((err, result)=>{
   if(err) throw err;
   console.log("result :"+req.params.commade_id);
     console.log(result);
     res.render('factures/ajouter-facture',{
       "result":result,
     user:req.user,
      username:req.user.username,
     })
 })
 });
 
router.post('/:commande_id/facture',ensureAuthenticated,(req, res )=>{
  Commande.findById(req.params.commande_id).exec((err, result)=>{
    console.log(result);
    var desf= req.body.desf;
    var user1 = req.user;
    var commande1 = result._id;
    var client1 = result.client.num;
 
    const facture = new Facture({
     _id: new mongoose.Types.ObjectId(),user1,commande1,desf,client1
    });
    facture.save()
    .then(facture =>{
      req.flash('succes_msj', facture._id+' ajoute avec succes');
      res.redirect('/factures');
    }).catch(err =>{
      console.log(err);
      res.status(500).json({error : err})
    });
  });
 });
 */
/*
 //facture3

 router.get('/:commande_id/facture',ensureAuthenticated,(req,res)=>{

  Commande.findById(req.params.commande_id).exec((err, result)=>{
   if(err) throw err;
   console.log("result :"+req.params.commade_id);
     console.log(result);
     res.render('factures/ajouter-facture',{
       "result":result,
     user:req.user,
      username:req.user.username,
     })
 
 })
 });
 
router.post('/:commande_id/facture',ensureAuthenticated,(req, res )=>{
  Commande.findById(req.params.commande_id).populate('client').exec((err, result)=>{
    console.log(result);
    var desf= req.body.desf;
    var user1 = req.user;
    var commande1 = result._id;
    var client1= result.client.num;
 
    const facture = new Facture({
     _id: new mongoose.Types.ObjectId(),user1,commande1,desf,client1
    });
    facture.save()
    .then(facture =>{
      req.flash('succes_msj', facture._id+' ajoute avec succes');
      res.redirect('/factures');
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