const User=require("../models/user");

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup=async(req,res)=>{
    try{
    let{username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if (err){
            next(err);
        }
        req.flash("success","User registered successfully!");
        res.redirect("/listings");
    });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
    
};

module.exports.renderloginForm=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=async(req,res)=>{
    req.flash("success","Welcome back to Travique! You are logged in!");
    let redirectUrl = res.locals.redirect || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","logged you out!");
        res.redirect("/listings");
    });
};