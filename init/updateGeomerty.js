if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const mongoose = require("mongoose");
const Listing = require("../models/listing");

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));



async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/travique');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCoordinates(location, country) {
  try {
    const query = `${location}, ${country}`;
    console.log("Geocoding:", query);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Travique/1.0 (test@test.com)",
        "Accept-Language": "en",
      },
    });

    const text = await response.text();

    if (!text.startsWith("[")) {
      console.log("Non-JSON response for:", query);
      return { lat: 0, lng: 0 };
    }

    const data = JSON.parse(text);

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return { lat: 0, lng: 0 };
  } catch (err) {
    console.log("Geocoding error:", query, err.message);
    return { lat: 0, lng: 0 };
  }
}

async function updateFailedListings() {
  const listings = await Listing.find({
    $or: [
      { "geometry.lat": 0 },
      { "geometry.lng": 0 },
      { geometry: { $exists: false } },
    ],
  });

  console.log(`Found ${listings.length} failed listings`);

  for (let listing of listings) {
    const coords = await getCoordinates(listing.location, listing.country);

    if (coords.lat !== 0 && coords.lng !== 0) {
      listing.geometry = {
        lat: coords.lat,
        lng: coords.lng,
      };
      await listing.save();
      console.log(`Updated: ${listing.title} ->`, listing.geometry);
    } else {
      console.log(`Still failed: ${listing.title}`);
    }

    await sleep(2000);
  }

  console.log("Done updating failed listings");
  mongoose.connection.close();
}

updateFailedListings();