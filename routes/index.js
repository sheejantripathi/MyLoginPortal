var express = require('express');
var router = express.Router();
const models = require('../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var imagePath = path.join(__dirname, '../public/uploads/');
//email
const nodemailer = require("nodemailer");


var chalk = require('chalk')



router.get('/', async function (req, res) {
    try {
        console.log('#################',req.user);
        if (req.user) {
            console.log("inside req user")
            res.redirect('/userLogin/homepage')

        } else {
            res.redirect('/userLogin/login')
        }

    } catch (err) {
        console.log("T-Catch /admin ", err.message)
    }

})


module.exports = router;