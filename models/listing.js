const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const listingSchema = new Schema({
    title: {
         type: String,
         required: true,
    },
    description: String,
    // image: {
    //     type: String,
    //     default:  "https://unsplash.com/photos/brown-sand-field-during-sunset-yR7dHEhi2TE" ,
    //     set: (v)=> v === "" ? "https://unsplash.com/photos/brown-sand-field-during-sunset-yR7dHEhi2TE" : v ,
    // },
     image: {
        
    filename: {
        type: String,
        default: "listingimage"
    },
    url: {
    type: String,
    default: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        set: (v) =>
            v === ""
                ? "https://unsplash.com/photos/brown-sand-field-during-sunset-yR7dHEhi2TE"
                : v
    }
     },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner:
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    geometry : {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

  listingSchema.post("findOneAndDelete", async(listing) =>{  
    if(listing){
          await Review.deleteMany({_id: {$in: listing.reviews } });
    }
 });

const listing = mongoose.model("listing", listingSchema);

module.exports = listing;