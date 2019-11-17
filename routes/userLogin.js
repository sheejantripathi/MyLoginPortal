var express = require('express');
var router = express.Router();
const models = require('../models');
const bcrypt = require('bcrypt');
var passport = require('passport');
const saltRounds = 10;
const crypto = require('crypto');
const secret = 'heythisisthesecret';
const emailAccess = require('../middleware/emailAccess');
var chalk = require('chalk');
const {check, validationResult} = require('express-validator');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
//email
const nodemailer = require("nodemailer");


function hashPassword(pass) {
    return new Promise(function (resolve, reject) {
        bcrypt.hash(pass, saltRounds, function (err, hash) {
            // Store hash in your password DB.
            if (err) {
                console.log('hash err ', err.message);
                reject(false)
            } else {
                resolve(hash)
            }
        });
    })
}

function compareHash(username, password, hash) {

    return new Promise(function (resolve, reject) {

        bcrypt.compare(password, hash, function (err, res) {
            // res == true
            if (res) {
                resolve(res)
            } else {
                reject(res)
            }
        });
    })
}

function createToken() {
    return new Promise(function (resolve, reject) {
        var random = Math.random(new Date()).toString()
        const hash = crypto.createHmac('sha256', secret)
            .update(random)
            .digest('hex');
        if (hash) {
            resolve(hash)
        } else {
            reject(false)
        }
        console.log(hash);
    })
}

router.get('/login', async function (req, res) {
    try {
        // if (req.user) {
        //     console.log("inside req user")
        //     res.redirect('/user/dashboard')
        //
        // } else {
        //     res.redirect('/userLogin/login')
        // }

    } catch (err) {
        console.log("T-Catch /admin ", err.message)
    }

    res.render('users/login',{
        layout:'blank',
        success:req.session.success,
        msg:req.session.msg,
        errors:req.session.errors,
        errorMsg:req.session.errorMsg
    });
    req.session.errors = null;
    req.session.errorMsg = null;
    req.session.success = null;
    req.session.msg = null;
})

//get registration form
router.get('/register', async function (req, res) {
    try {
        // if (req.user) {
        //     console.log("inside req user")
        //     res.redirect('/user/dashboard')
        //
        // } else {
        //     res.redirect('/userLogin/login')
        // }

    } catch (err) {
        console.log("T-Catch /admin ", err.message)
    }

    res.render('users/register',{
        layout:'blank',
        success:req.session.success,
        msg:req.session.msg,
        errors:req.session.errors,
        errorMsg:req.session.errorMsg
    });
    req.session.success = null;
    req.session.msg = null;
    req.session.errorMsg = null;
    req.session.errors = null;
})


//get registration form
router.get('/homepage', async function (req, res) {
    try {
        console.log('##############DDDDDDDDDDDDDDDDD',req.user);

    } catch (err) {
        console.log("T-Catch /admin ", err.message)
    }

    res.render('users/homePage',{
        layout:'blank',
        success:req.session.success,
        msg:req.session.msg,
        errorMsg:req.session.errorMsg
    });
    req.session.success = null;
    req.session.msg = null;
    req.session.errorMsg = null;
})
//create new user through registration

router.post('/register',async (req, res, next) => {
        // console.log(req.body);
        try {
            console.log("$$$$$$$$$$$$$$$$$$$$$$ req body ", req.body)
            req.check('username', 'Please enter username').isLength({min: 5});
            req.check('password', 'Please re-enter password correctly').isLength({min: 5}).equals(req.body.confirmPassword);
            req.check('email', 'Please Enter Email').isEmail();
            var errors = await req.validationErrors();
            if (errors) {
                req.session.errors = errors;
                req.session.success = false;
                }else {
                console.log('went in hash');
                //hashing technique
                console.log(req.body.password);
                var pass = req.body.password;
                var hash = await hashPassword(pass).catch(error => {
                    console.log(error.message);
                    req.session.success = false;
                    req.session.errorMsg = "Problem with your password !!!";
                });

                if (hash) {

                    console.log("hash ", hash);
                    const createdUser = await models.User.create({
                        username: req.body.username,
                        password: hash,
                        email: req.body.email,
                        isActive:0
                    }).then(async function (user) {
                        req.session.success = true;
                        req.session.msg = "User has been created successfully !!!";

                        var token = await createToken()
                        if (token) {
                            var subject = 'Verification of your Email Id'
                            var text = 'Click this link to verify your Email Id.'
                            var host = "http://" + req.headers.host + "/userLogin/email_verify/" + user.id;
                            var content = "<h2>Hi "+user.username+",Your account has been created successfully!!!</h2>"+
                                "<h2>Here's the link to verify your account</h2>" +
                                "<a style='color:#008cc9;display:inline-block;text-decoration:none'  href='" + host + "'>Verify my Account</a>"
                            await emailAccess.sendMail(user.username, user.email, host, content, subject, text);
                        }

                        await req.login(user, function (err) {
                            if (err) {
                                return next(err);
                            }

                        });
                    }).catch(function (error) {
                        //unlink the uploaded file
                        req.session.success = false;
                        console.log('success catch add ' + req.session.success);
                        console.log(error.message);


                    });
                }
            }
        } catch (error) {
            req.session.success = false;
            console.log(chalk.red.bold("user.js 230", error.message));

        }

        if(req.session.success){
            console.log('success last add ' + req.session.success);
            res.redirect('/userLogin/homePage');
            req.session.success = null;
            req.session.requestedUrl = null;
        }
        else{
            console.log('success last add ' + req.session.success);
            res.redirect('/userLogin/register');
        }

    });


//check user before login
router.post('/check', async (req, res, next) => {
    try {
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$ checkLogin ",req.body)
        var hash = null;
        console.log(req.body)
        var email = req.body.email;
        var password = req.body.password;
        var loginError = false;
        var login = false;
        var user = null;

        await models.User.findOne({
            where: {email: email,isActive:1}
        }).then(function (userObj) {
            if (userObj) {
                // console.log(userObj.password)
                hash = userObj.password;
                user = userObj;
            } else {
                req.session.loginError = true;
                req.session.success = false;
                req.session.msg="This Email is not registered"
            }

            //on error occured

            // res.render('index',{title:"Author :Add",name:'Sheejan'});
        });
        if (hash) {
            var compare = await compareHash(email, password, hash)
                .catch(error => {
                console.log("compare hash error ", error.message)
                    req.session.success = false;
                    req.session.loginError = true;
                    req.session.msg = 'Wrong password!!!!';
            });
            if (compare) {
                /*
               *  # Setting variable to session on successful login
               *
               *
               * */
                await req.login(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/userLogin/homePage');
                    req.session.success = null;
                    req.session.requestedUrl = null;
                });

            } else {
                console.log('went out compare');
                req.session.loginError = true;
                req.session.msg = 'Oops,Wrong Password!!!!';
            }

        }


    } catch (e) {
        console.log('try catch ', e.message);
        req.session.loginError = true
        req.session.msg = 'Oops Something went wrong!!!!'

    }

    if (req.session.loginError) {
        // console.log('lalalalalalalalala')
        res.render('users/login', {
            layout: 'blank',
            loginError: req.session.loginError,
            success:req.session.success,
            msg:req.session.msg

        });
        req.session.loginError = null;
        req.session.success = null;
        req.session.msg = null;

    }

});

//get registration form
router.get('/email_verify/:id', async function (req, res) {
    try {
        console.log('##############DDDDDDDDDDDDDDDDD',req.user);
        await models.User.update({
            isActive:1
        },{where:{id:req.params.id}})
            .then(obj=>{
                req.session.msg = 'User verified successFully'
            })
            .catch(err=>{
                console.log(chalk.red.bold('userLogin.js 274'),err.message);
                req.session.msg = 'User verified not possible at the moment'
            })

    } catch (err) {
        console.log("T-Catch /admin ", err.message)
    }

    res.redirect('/userLogin/homePage')
})
//logout user
router.get('/logout', async (req, res) => {
    req.logout();
    res.redirect('/userLogin/login');
})

module.exports = router;