require('dotenv').config();
const GoogleCloudStorage = require('@google-cloud/storage');

exports.storage = GoogleCloudStorage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

exports.getPublicUrl =
  (bucketName, fileName, prefix, size) => {
    return `https://storage.googleapis.com/${bucketName}/${prefix}/${size.width}x${size.height}/${Date.now()}-${fileName}`;
  }
