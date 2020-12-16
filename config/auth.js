
module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if(req.isAuthenticated()){
          return next();
      }
       req.flash('error_msj', 'Veuillez vous connecter pour voir cette ressource.');
       res.redirect('/login');
    },
    isAdmin: function(req, res, next) {
        if(req.user.isAdmin) {
          next();
        } else {
          req.flash('error_msj', 'Seulement admin peut voir cette ressource.');
          res.redirect('/');
        }
      },
      isLoggedIn:function(req, res, next) {
        if(req.user.isLoggedIn) {
          next();
        } else {
          req.flash('error_msj', 'Veuillez vous connecter pour voir cette ressource.');
          res.redirect('/');
        }
      }
   }
    

//ensure that the route is protected