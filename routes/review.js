const express = require("express")
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const {validateReview, isLoggedIn, isReviewOwner} = require("../middleware.js");

const reviewController = require("../Controllers/review.js")
const review = require("../models/review.js");

//Reviews
//Post Review Route
router.post(
   "/", 
   isLoggedIn, 
   validateReview , 
   wrapAsync (reviewController.createReview));

//Delete Review Route 
router.delete(
   "/:reviewId",
   isLoggedIn, 
   isReviewOwner, 
   wrapAsync(reviewController.deleteReview));

module.exports = router;