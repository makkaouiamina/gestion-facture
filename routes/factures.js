const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const config = require('../config/auth');
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');

var { isLoggedIn, isAdmin,ensureAuthenticated} = config;

//Facture model
const Facture = require('../models/Facture');

//Client model
const Client = require('../models/Client');

//User model
const User = require('../models/User');

//Produit model
const Produit = require('../models/Produit');



// liste des factures

router.get('/',ensureAuthenticated,(req, res,limit )=>{ 
   user=req.user;
   if(user.isLoggedIn){
         if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      Facture.find({'client1.client_name':regex,'user1':req.user}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
      .exec(function(err, factures) {   
        if (err) {
          req.flash('error_msj','aucune facture trouve!');
          res.redirect('/factures');
        }else{ 
          if(factures < 1){
            req.flash('error_msj','Ressayer a nouveau!');
            res.redirect('/factures')
          }else{
            console.log(factures);
            res.render('factures/list-facture' ,{ "factures": factures,
            user: req.user,
            username:req.user.username
        });
          }
    }
      })
    }
    else{
      Facture.find({'user1':req.user}).limit(limit).sort([['created_at', 'descending']])
      .exec(function(err, factures) {  
        if (err) throw err;
        console.log(factures);
          res.render('factures/list-facture' ,{ "factures": factures,
          
          user: req.user,
          username:req.user.username
      });
      }
  )
    }
   }if(user.isAdmin){
         if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      Facture.find({'desf':regex}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
      .exec(function(err, factures) {   
        if (err) {
          req.flash('error_msj','aucune facture trouve!');
          res.redirect('/factures');
        }else{ 
          if(factures < 1){
            req.flash('error_msj','Ressayer a nouveau!');
            res.redirect('/factures')
          }else{
            console.log(factures);
            res.render('admin/factures/list-facture' ,{ "factures": factures,
            user: req.user,
            username:req.user.username
        });
          }
    }
      })
    }
    else{
      Facture.find({}).populate('user1').limit(limit).sort([['created_at', 'ascending']])
      .exec(function(err, factures) {   
        if (err) throw err;
        console.log(factures);
          res.render('admin/factures/list-facture' ,{ "factures": factures,
          user: req.user,
          username:req.user.username
      });
      }
  )
    }
  
   }
});


//supprimer facture
router.get('/supprimer/:facture_id',ensureAuthenticated,(req,res)=>{
  Facture.findByIdAndDelete(req.params.facture_id, (err,result)=>{
      if (err){
          req.flash('error_msj','suppression échouée');
          res.redirect('/factures');
        }else{
          req.flash('success_msj','facture num '+ result._id +' est supprimée avec succès');
          res.redirect('/factures')
        }
  })
});
//delete all
router.get('/delete',ensureAuthenticated,(req,res)=>{
  Facture.deleteMany({}).exec((err)=>{
   if (err){
     req.flash('error_msj','delete failed');
     res.redirect('/factures');
   }else{
     req.flash('error_msj', 'la liste est vide');
     res.redirect('/factures')
   }
  })
});
//
router.get('/vider',ensureAuthenticated,(req,res)=>{
  Facture.deleteMany({}).exec((err)=>{
   if (err){
     req.flash('error_msj','delete failed');
     res.redirect('/factures');
   }else{
     req.flash('error_msj', 'la liste est vide');
     res.redirect('/factures')
   }
  })
});




//
router.get('/ajouter/:client_id',ensureAuthenticated,(req,res)=>{
  Client.findById(req.params.client_id).populate('user1').exec((err,client)=>{
    if(err) throw err;
    console.log(client);
    
    res.render('admin/factures/facture-ajouter',
   { user:req.user,
    username:req.user.username,
   "client":client
   }
    )
  })
})

router.post('/ajouter/:client_id',ensureAuthenticated,(req,res)=>{
  Client.findOne({'client_name':req.body.client_name}).populate('user1').exec((err,c)=>{
  if(err) throw err;
  var desf= req.body.desf;
  var date= req.body.date;
  var user1 = req.body.id;
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
   //res.redirect('/clients/ajouter/produits/'+c._id+'/'+facture._id);
  // res.redirect('/clients/'+c._id+'/factures');
   //res.redirect('/factures');
   res.redirect('/users/'+facture.user1._id+'/'+facture.client1.cl+'/'+facture._id);
 }).catch(err =>{
   console.log(err);
   res.status(500).json({error : err})
 });
  });
});

//creer facture user
router.get('/ajouter',ensureAuthenticated,(req,res)=>{
    Client.find({'user1':req.user}).exec((err,clients)=>{
      if(err) throw err;
      res.render('factures/facture-ajouter',
     { user:req.user,
      username:req.user.username,
     "clients":clients
     }
      )
    })
   
  
});

router.post('/ajouter',ensureAuthenticated,(req,res)=>{
  Client.findOne({'client_name':req.body.client_name}).exec((err,c)=>{
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
       req.flash('success_msj','facture '+ facture.desf+' cree avec succes');
       res.redirect('/clients/ajouter/produits/'+c._id+'/'+facture._id);
      // res.redirect('/clients/'+c._id+'/factures');
       //res.redirect('/factures');
     }).catch(err =>{
       console.log(err);
       res.status(500).json({error : err})
     });
  })
});

router.post('/:facture_id/pdf',ensureAuthenticated,(req,res)=>{
  Facture.findById(req.params.facture_id).exec((err,f)=>{
    if(err) throw err;
    Produit.find({'client.client_name':f.client1.client_name,'facture.desf':f.desf}).exec((err, results)=>{
      if(err) throw err;

      data={f,results};
      ejs.renderFile('./views/factures/facture.ejs', data, function(err, result) {
        // render on success
        if (result) {
           html = result;
        }
        // render or error
        else {
           res.end('An error occurred');
           console.log(err);
        }
    });
    var options = { filename: 'facture.pdf', format: 'A4', orientation: 'portrait', directory: './views/factures',type: "pdf" };
    pdf.create(html, options).toFile(function(err, res) {
      if (err) return console.log(err);
           console.log(res);
      });
    })
  })
});
//
router.get('/modifier/:facture_id',ensureAuthenticated,(req,res)=>{
  Facture.findById(req.params.facture_id).exec((err, facture)=>{
    if (err){
      res.redirect('/factures/modifier/' + req.params.facture_id);
    }
    else{
      console.log(facture);
      res.render('factures/modifier-facture',{"facture":facture,
      user:req.user,
      username: req.user.username
     })
    }
  });
});

router.post('/modifier/:facture_id',ensureAuthenticated,(req,res)=>{
  const body={
    desf:req.body.desf,
    date:req.body.date
  }
  Facture.findByIdAndUpdate(req.params.facture_id, body, {upsert: true, new: true}, (err)=>{
    if (err){
      req.flash('error_msj','Modification échouée');
      res.redirect('/factures/modifier/' + req.params.facture_id);
    }else{
      req.flash('success_msj','Modification effectuée avec succès');
      res.redirect('/factures');
    }
  });
});



router.get('/produits/:facture_id/:client_id',ensureAuthenticated,(req,res)=>{
  Facture.findById(req.params.facture_id).exec((err,facture)=>{
    if(err) throw err;
    console.log('facture est '+facture);
        res.render('admin/produits/produit-ajouter',{
          "facture":facture,
        user:req.user,
         username:req.user.username
        })
  });
});
router.post('/produits/:facture_id/:client_id', ensureAuthenticated,(req,res)=>{
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
                 res.redirect('/clients/'+resultat.client1.cl+'/'+resultat._id)
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