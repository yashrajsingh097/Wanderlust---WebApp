const listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {

    let { search, country, price } = req.query;

    let filter = {};

    // Destination Search
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }

    // Country Filter
    if (country) {
        filter.country = {
            $regex: `^${country}$`,
            $options: "i"
        };
    }

    // Price Filter
    if (price && !isNaN(Number(price))) {
        filter.price = { $lte: Number(price) };
    }

    const allListings = await listing.find(filter);

    res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listingData=  await listing.findById(id).populate ({
        path:"reviews",
        populate: {
        path: "author"},
    }).populate("owner");
    if(!listingData){
       req.flash("error", "Listing you requested for does not exist!");
       return  res.redirect("/listings");
    };
    console.log("Listing Data:", listingData);

   res.render("listings/show.ejs",{listing : listingData});
};

module.exports.createListing = async (req,res,next)=>{

    let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
    })
    .send()
   
    
    
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename }
    newListing.geometry = response.body.features[0].geometry;
        
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    const listingData=  await listing.findById(id);
    if(!listingData){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let OriginalImageUrl = listingData.image.url;
    let originalImageUrl = OriginalImageUrl.replace("/upload", "/upload/h_300,w_250");
    
    console.log("Image URL:", listingData.image.url);
    console.log("Resized URL:", originalImageUrl);

    res.render("listings/edit.ejs",{listing: listingData , originalImageUrl});
};

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    let listings =  await listing.findByIdAndUpdate(id, {...req.body.listing})
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listings.image = { url, filename }
    await listings.save();  
    } 
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};