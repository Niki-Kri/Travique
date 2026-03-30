const Listing = require("../models/listing");

// helper function for geocoding
async function getCoordinates(location, country) {
  const query = `${location}, ${country}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Travique/1.0",
    },
  });

  const data = await response.json();

  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }

  return {
    lat: 0,
    lng: 0,
  };
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  const coords = await getCoordinates(
    req.body.listing.location,
    req.body.listing.country
  );

  newListing.geometry = {
    lat: coords.lat,
    lng: coords.lng,
  };

  newListing.owner = req.user._id;

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;
  listing.categories = req.body.listing.categories;

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  const coords = await getCoordinates(
    req.body.listing.location,
    req.body.listing.country
  );

  listing.geometry = {
    lat: coords.lat,
    lng: coords.lng,
  };

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
  let { q } = req.query;

  if (!q || q.trim() === "") {
    req.flash("error", "Search query is empty!");
    return res.redirect("/listings");
  }

  const listings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { categories: { $regex: q, $options: "i" } },
    ],
  });

  res.render("listings/results.ejs", {
    allListings: listings,
    pageTitle: `Search Results for "${q}"`,
    backUrl: "/listings",
  });
};

module.exports.filterListings = async (req, res) => {
  let { category } = req.params;

  const listings = await Listing.find({
    categories: category,
  });

  res.render("listings/results.ejs", {
    allListings: listings,
    pageTitle: `${category} Listings`,
    backUrl: "/listings",
  });
};