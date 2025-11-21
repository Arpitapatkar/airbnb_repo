 const mongoose = require("mongoose");
 const initData = require("./data.js");
 const Listing = require("../models/listing.js");

 const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
 main()
 .then(() => {
     console.log("conneted to DB");
     initDB();
 })
 .catch((err) => {
     console.log(err);
 });
 
 async function main() {
     await mongoose.connect(MONGO_URL);
 }

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
         ...obj,
         owner:"6905a3122a42d5e31f3ac9b4" ,
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
}

initDB();