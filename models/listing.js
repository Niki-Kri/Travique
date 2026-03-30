const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60"
          : v,
    },
  },
  price: Number,
  location: String,
  country: String,
  categories: [
    {
      type: String,
      enum: [
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Hill Stations",
        "Castles",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Architect",
        "Domes",
        "Islands",
        "Boats",
      ],
    },
  ],
  geometry: {
    lat: {
      type: Number,
      default: 0,
    },
    lng: {
      type: Number,
      default: 0,
    },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.index({ categories: 1 });
listingSchema.index({
  title: "text",
  description: "text",
  location: "text",
  country: "text",
  categories: "text",
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;