const Listing = require("../models/listing");
const axios = require("axios");


//index route   
module.exports.index = async (req,res) =>{
   const allListings =  await Listing.find({}).populate("owner");
   return res.render("./listings/index.ejs", { allListings });
};


//new form
module.exports.renderNewForm = (req,res) =>{            //new route show route ke pehle ayega kiuki vo new ko id na samjh le
    res.render("listings/new.ejs");
};


//show
module.exports.showListing = async(req,res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path : "reviews" ,
        populate :{
            path : "author",
        },
    });
    await listing.populate("owner");

    if(!listing){
        req.flash("error","Listing Does Not Exist");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}

//create post

module.exports.createPost = async (req, res, next) => {
  try {
    const listingData = req.body.listing;
    const location = listingData.location;

    // Get coordinates from OpenStreetMap (free)
    const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: location,
        format: "json",
        limit: 1,
      },
    });

    if (!geoRes.data || geoRes.data.length === 0) {
      req.flash("error", "Unable to find location coordinates. Try again.");
      return res.redirect("/listings/new");
    }

    const { lat, lon } = geoRes.data[0];

    //Check if image is uploaded
    if (!req.file) {
      req.flash("error", "Image is required! Please upload one.");
      return res.redirect("/listings/new");
    }

    // Create new listing
    const newListing = new Listing({
      ...listingData,
      owner: req.user._id,
      geometry: {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)],
      },
      image: {
        url: req.file.path,
        filename: req.file.filename,
      },
    });

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", "Failed to create listing. Please try again.");
    res.redirect("/listings/new");
  }
};



//edit post
module.exports.editPost = async(req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

     if(!listing){
        req.flash("error","Listing Does Not Exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload" ,"/upload/h_300,w_400,c_fill,q_30,f_auto/");
    res.render("listings/edit.ejs", { listing ,originalImageUrl});
}

//update route 
module.exports.updatePost = async(req,res) =>{
    let { id } = req.params;
    let listing =  await Listing.findByIdAndUpdate(id, {...req.body.listing } , { new : true });
    
    if(typeof req.file !== "undefined"){
    let url =req.file.path;
    let filename = req.file.filename;

    const transformedUrl = url.replace(
      "/upload/",
      "/upload/f_auto,q_auto,w_800,h_600,c_fill/"
    );
    
    listing.image  = { url , filename, transformedUrl };
     await listing.save();
    }

    req.flash("success"," Listing Updated");
    res.redirect(`/listings/${id}`);
}

//delete post
module.exports.deletePost = async(req,res) =>{
    let { id } = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted");
    res.redirect("/listings");
}


// Find nearby listings
module.exports.findNearby = async (req, res) => {
  console.log("QUERY:", req.query);

  const { lat, lon, lng } = req.query;
  const finalLng = lng || lon;

  if (!lat || !lon) {
    req.flash("error", "Location not detected");
    return res.redirect("/listings");
  }

  const nearbyListings = await Listing.find({
    geometry: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(finalLng), parseFloat(lat)], // lon, lat
        },
        $maxDistance: 10000, // 10 KM
      },
    },
  });

  res.render("listings/nearby.ejs", { nearbyListings });
};
