const peepalEnv = require('dotenv/config');
const express = require('express');
const models = require('./models');

const bodyParser = require('body-parser');
//for handlebars
const expbs = require('express-handlebars');
const expressValidator = require('express-validator');

const path = require('path');

const app = express();

const port = 3000;


var auth = require('./middleware/userAuthenticate')
//bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var cookieParser = require('cookie-parser')


app.use(cookieParser())

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}));

app.use(expressValidator());

app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var userLogin = require('./routes/userLogin');



app.engine('handlebars', expbs({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    // helpers: require('./config/handlebars-helpers')
}));


app.set('view engine', 'handlebars');

//session with express
app.use(session({
    secret: 'plkmmjuhbgtfcdeszaq',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Web Route

app.use("/", routes);
app.use("/userLogin", userLogin);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;

    next(error);
});

//operation fail in db
app.use((error, req, res, next) => {
    res.status(error.status || 500);

    if (error.errorCode || error.message == "Error checking permissions to access resource") {
        //    acl redirect with message
        res.render('acl/aclForm', {
            layout: "login",
            title: "Home",
            message: error.message,
            errorCode: error.status,
            errorCodeAcl: error.errorCode
        });
    } else {
        res.render('404', {
            title: "Home",
            message: error.message,
            errorCode: error.status,
            errorCodeAcl: error.errorCode
        });
    }

});


app.listen(port, () => console.log(`App is Started on port ${port}!`));