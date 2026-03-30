const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),

    categories: Joi.array()
      .items(
        Joi.string().valid(
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
          "Boats"
        )
      )
      .min(1)
      .required(),

    image: Joi.object({
      url: Joi.string().allow("", null),
      filename: Joi.string().allow("", null),
    }).optional(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});