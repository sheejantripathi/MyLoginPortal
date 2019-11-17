var models = require('../models')
//email
const nodemailer = require("nodemailer");

module.exports = {
    sendMail(fName, email, host, content, subject, text) {
        return new Promise(function (resolve, reject) {
            let account = nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            /*let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass // generated ethereal password
                }
            });*/
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'myloginportal19@gmail.com',
                    pass: 'password@123ADD'
                }

            });
            // var host = "http://"+req.headers.host+'/'+token

            // setup email data with unicode symbols

            let mailOptions = {
                from: '"Sheejan👻" <myLoginPortal19@gmail.com>', // sender address
                to: email, // list of receivers
                subject: subject, // Subject line
                text: text, // plain text body
                html: content // html body
            };

            // send mail with defined transport object
            let info = transporter.sendMail(mailOptions)
            if (info) {
                resolve(true)
            } else {
                resolve(false)
            }

            console.log("Message sent: %s", info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        })

    }
}




