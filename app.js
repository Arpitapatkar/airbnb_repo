if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express(); 
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

// ROUTES
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// DB URL
const dbUrl = process.env.ATLASDB_URL;

// CONNECT MONGOOSE
main()
    .then(() => console.log("connected to DB"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


//ALTAS MONGO STORE FOR SESSIONS
const store = MongoStore.create({
    mongoUrl: dbUrl,                
    crypto: {
        secret: process.env.SECRET,     
    },
    touchAfter: 24 * 3600,          // seconds
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});


//SESSION CONFIGURATION
const sessionOptions = {
    store,
    secret:  process.env.SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

//SESSION & FLASH
app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//FLASH
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//HOME ROUTE
app.get("/", (req , res) => {
    res.redirect("/listings");
});

//USE ROUTES
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});



// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something went wrong!" } = err;
//     res.status(statusCode).render("error.ejs", { err });
// });


//404 ERROR HANDLER
// app.use((req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });


//GLOBAL ERROR HANDLER
app.use((err, req, res, next)=>{
    let {statusCode=500, message="Something went wrong"} = err;

    // DEFENSIVE CHECK: Prevent responding if headers were already sent
    if (res.headersSent) {
        return next(err); 
    }

    res.status(statusCode).render("error.ejs" , {err});
    // res.status(statusCode).send(message);
});



// app.listen(8080, () => {
//     console.log("server is listening on port 8080");
// });

// SERVER
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});
