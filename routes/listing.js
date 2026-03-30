const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

router.get("/search", wrapAsync(listingController.searchListings));
router.get("/filter/:category", wrapAsync(listingController.filterListings));

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    (req, res, next) => {
      if (!req.file) {
        return next(new Error("Image is required"));
      }

      if (!req.body.listing) {
        req.body.listing = {};
      }

      req.body.listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };

      next();
    },
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    (req, res, next) => {
      if (req.file) {
        if (!req.body.listing) {
          req.body.listing = {};
        }

        req.body.listing.image = {
          url: req.file.path,
          filename: req.file.filename,
        };
      }
      next();
    },
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;