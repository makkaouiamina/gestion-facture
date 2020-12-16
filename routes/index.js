const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const passport = require('passport');

const config = require('../config/auth');

var { isLoggedIn, isAdmin,ensureAuthenticated} = config;

//User model
const User = require('../models/User');

//dasboard page
router.get('/dashboard',ensureAuthenticated,(req, res)=>{
    user=req.user;
    if(user.isLoggedIn){

        res.redirect('/clients');
    }if(user.isAdmin){
        res.redirect('/users');
    }
    });
    

// welcome page
router.get('/',(req, res )=>{
    res.render('login');
});



//login
router.get('/login', (req, res )=>{
    res.render('login')
});

// Login Handle 
router.post('/login', (req, res, next) => {
    
    passport.authenticate('local', 
    {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
       })(req, res, next);

});

//register
router.get('/register', (req, res )=>{
    res.render('register')
});


router.post('/register',(req, res, next) =>{
    let errors=[];
    var username = req.body.username;
    var email = req.body.email;
    var telephone = req.body.telephone;
    var fax = req.body.fax;
    var id_fiscale = req.body.id_fiscale;
    var adresse =req.body.adresse;
    //Check required fields
 if(!username ||!email||!adresse ||!telephone|| !req.body.password || !req.body.password2){
  req.flash('error_msj','Les champs sont obligatoires ');
  res.render('register', {
      errors,
    username,email,
    adresse,id_fiscale,fax,telephone
})
}
if(req.body.password !== req.body.password2){
  req.flash('error_msj','les mots de passe saisis ne sont pas identiques');
  }
  if(req.body.password.length < 8){
    req.flash('error_msj','le mot de passe doit contenir au moins 8 caractères!');
  }else{
    // validation passed
    User.find({email: req.body.email})
    .exec()
    .then(user => { 
        if (user.length >= 1){
            errors.push({ msj: 'cette adresse email existe déjà'});
            res.render('register', {
                errors,
                username,email,
                adresse,id_fiscale,fax,telephone
            });
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
                     if(req.body.adminCode === process.env.ADMIN_CODE) {
                      user.isAdmin = true;
                      user.isLoggedIn = false;
                    }
                     user.save()
                     .then(user => {
                         passport.authenticate('local')(req, res, function(){
                            req.flash('success_msj','Vous êtes inscrit ' +req.body.username );
                            res.redirect('/dashboard');
                         });
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

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msj', 'vous êtes maintenant déconnecté!');
    res.redirect('/login');
});




module.exports = router;
