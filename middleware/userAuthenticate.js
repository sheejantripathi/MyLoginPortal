var passport = require('passport');
module.exports = {
    authenticateUser:(userId,role,next)=>{
        req.login(userId,function (err) {
            console.log(userId);
            //finding role
            session.role=role;
            return next()
            // res.redirect('/');

        });

    },
    isAuthenticate:(req,res,next)=>{
        try{
            if(req.isAuthenticated()) {
                return next();
            }else{
                req.session.requestedUrl = req.originalUrl;
                console.log("Went in requested url middleware ",req.originalUrl)
                res.redirect('/userLogin/login');
            }
        }catch (error) {
            res.status(401).json({
                message:'Auth Failed'
            });
        }
    },
    userLogOut:(req,res)=>{
        req.session.destroy(function (err) {
            res.redirect('/'); //Inside a callback… bulletproof!
        });
    },
// end of isAuthenticate

    isAdmin:(res,req,next)=>{
        try{
            console.log('yes it is admin');
            next();
        }catch (error) {
            res.status(401).json({
                message:'Auth Failed'
            });
        }
    },
//    end of isAdmin
}

//end of module exports
passport.serializeUser(function(userId, done) {
    done(null, userId);
});

passport.deserializeUser(function(userId, done) {
    done(null, userId);
    // User.findById(id, function (err, user) {
    //     done(err, userId);
    // });
});
/*
module.exports = (req,res,next) =>{

    try{
        console.log('went in usre')
        next();
    }catch (error) {
        res.status(401).json({
            message:'Auth Failed'
        })
    }

};*/
