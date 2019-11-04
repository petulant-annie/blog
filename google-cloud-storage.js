require('dotenv').config();
const gcsHelpers = require('../helpers/google-cloud-storage');

const sendUploadToGCS = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const bucketName = process.env.GCS_BUCKET;
  const bucket = gcsHelpers.storage.bucket(bucketName);
  const gcsFileName = `${Date.now()}-${req.file.originalname}`;
  const file = bucket.file(gcsFileName);
  const prefix ='anna/avatars'; // `${yourName}/articles`
  const size = {
    width: 180,
    height: 180,
  }

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsFileName;

    return file.makePublic()
      .then(() => {
        req.file.gcsUrl = gcsHelpers.getPublicUrl(bucketName, gcsFileName, prefix, size);
        next();
      });
  });

  stream.end(req.file.buffer);
};

module.exports = sendUploadToGCS;