const localStrategy = require('passport-local').Strategy;
//create our strategy
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// load User Model
const User = require('../models/User');



module.exports = function(passport) {
    passport.use(
        new localStrategy({ usernameField: 'email'}, (email, password, done) => {
          //
          if(isAdmin = true){
            
        }
      //check is there a user with that email
    
       User.findOne({ email: email})
       .then(user => {
           if(!user){
           return done(null, false, { message: 'that email is not registered'});
        }
        
        //match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if(err) throw err;

          if(isMatch){
              return done(null, user);
          }else {
              return done(null, false, {message: 'Password incorrect'})
          }
        });
       })
       .catch(err => console.log(err));
   
        })
    );

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      User.findById(id, (err, user) => {
      done(err, user);
      });
    });
}

