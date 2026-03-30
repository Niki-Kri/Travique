const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_APT_KEY,
   api_secret:process.env.CLOUD_APT_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'travique_DEV',
    allowedFormats: ["png","jpg","jpeg"],
  },
});

module.exports={
    cloudinary,
    storage
};