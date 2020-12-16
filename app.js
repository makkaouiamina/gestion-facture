const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
const mongoStore = require('connect-mongo')(session);

  


const methodOverride = require('method-override')
 

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))



app.use(express.static('./public'));
app.use(express.static('./views'));

//Passport config
require('./config/passport')(passport);

//db conn  
const db = mongoose.connect('mongodb+srv://nodeApp:'+process.env.MONGO_ATLAS_PW+'@nodeapp-qgpjx.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true
})
.then(console.log('MOngoDB connected ...'))
.catch(err => console.log(err));
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Bodyparser
app.use(express.urlencoded({ extended: false}));

//log requests to console
app.use(morgan('dev'));



//Express Session 
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store : new mongoStore({ mongooseConnection : mongoose.connection }),
    cookie : { maxAge: 180 * 60 * 1000 }
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global variables
app.use((req,res, next) =>{
    res.locals.success_msj = req.flash('success_msj');
    res.locals.error_msj = req.flash('error_msj');
    res.locals.error = req.flash('error');
    next();
});



//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/factures', require('./routes/factures'));
app.use('/clients', require('./routes/clients'));
app.use('/produits', require('./routes/produits'));


const port = process.env.PORT || 3500;

app.listen(port, console.log(`server started on port ${port}`));