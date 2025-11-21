const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync =require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner ,validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const axios = require("axios");
require("dotenv").config();
   
const listingController = require("../controllers/listing.js");


router.route("/")
        //index route
       .get(wrapAsync(listingController.index))
       
       //Create route
        .post(
       isLoggedIn,
      
       upload.single('listing[image]'),
        validateListing,
       wrapAsync(listingController.createPost));
        // res.send(req.file);                                              //image cloud url is inside this

      
//nearby 
router.get("/nearby", 
    wrapAsync(listingController.findNearby));

        

//new route
router.get("/new" ,
    isLoggedIn, 
    listingController.renderNewForm);
 




router.route("/:id")
     //show route
     .get( wrapAsync(listingController.showListing))

     //update route
     .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updatePost))

    //delete  route
    .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deletePost));


    
//edit route
router.get("/:id/edit" ,
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.editPost));

    

//index route
// router.get("/", wrapAsync(listingController.index));


//Create route
// router.post("/" ,
//     isLoggedIn,
//     validateListing,
//     wrapAsync(listingController.createPost));


//show route
// router.get("/:id", wrapAsync(listingController.showListing));


//update route
// router.put("/:id" ,
//     isLoggedIn,
//     isOwner,
//     validateListing,
//     wrapAsync(listingController.updatePost));

//delete  route
// router.delete("/:id" ,
//     isLoggedIn,
//     isOwner,
//     wrapAsync(listingController.deletePost));


module.exports = router;
