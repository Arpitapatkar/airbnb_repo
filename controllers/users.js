const user = require("../models/user.js");

//render signup
module.exports.renderSignupForm = (req,res) =>{
    res.render("users/signup.ejs");
};


//posting signup form
module.exports.postSignup = async(req,res) => {
    try{
       let {username , email , password} = req.body;
    const newUser = new user ({email,username});
    const registeredUser = await user.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser , (err) =>{
      if(err){
         return next(err);
      }
       req.flash("success" ,"Registered successfully");
    res.redirect("/listings");
    })
    }
    catch(e){
       req.flash("error",e.message);
       res.redirect("/signup");
    }
}

//render login form
module.exports.renderLogin = (req,res) =>{
     res.render("users/login.ejs");
};

//posting login form
module.exports.postLogin = async(req,res) =>{
   req.flash("success" , "welcome back ! you are logged in ");
   let redirectUrl = res.locals.redirectUrl || "/listings";
   res.redirect(redirectUrl);
};


//logout
module.exports.logout = (req,res) =>{
   req.logout((err) => {
      if(err){
       return next(err);
      }
      req.flash("success" , "successfully logged out");
      res.redirect("/listings");
   });
};