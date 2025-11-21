const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");


cloudinary.config({                          //it is used to connect backend from cloud
     cloud_name: process.env.CLOUD_NAME,        //cloud_name,api_key ,api secret  variable name are constant
     api_key : process.env.CLOUD_API_KEY,
     api_secret : process.env.CLOUD_API_secret,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wander_DEVLOP',
    allowerdformat: ["png","jpeg", "jpg"], // supports promises as well
  },
});


module.exports = {
    cloudinary,
    storage,
};