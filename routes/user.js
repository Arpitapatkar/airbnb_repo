const express = require("express");
const router = express.Router();
const user = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
       //signup
      .get(userController.renderSignupForm)
      
      //posting signup form
      .post(wrapAsync(userController.postSignup));


router.route("/login")
      //login
      .get( userController.renderLogin)

      //posting login form
      .post(
        saveRedirectUrl,
        passport.authenticate("local" , {
        failureRedirect: '/login' , 
        failureFlash: true
    }),
    userController.postLogin
 );
   
 
//logged out
router.get("/logout" , userController.logout);


//signup
// router.get("/signup" , userController.renderSignupForm);

//posting signup form
// router.post("/signup", wrapAsync(userController.postSignup));


//login
// router.get("/login", userController.renderLogin);


//posting login form
// router.post(
//     "/login", 
//     saveRedirectUrl,
//     passport.authenticate("local" , {
//         failureRedirect: '/login' , 
//         failureFlash: true
//     }),
//     userController.postLogin
//  );



module.exports = router;