require('dotenv').config();
const { format } = require('util');
const Multer = require('multer');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET);

const fileFilter = (req, file, done) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    done(null, true)
  } else { done(new Error, false) }
};

exports.upload = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

exports.sendUploadToGCS = (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();
  const prefix = 'anna/avatars'; // `${yourName}/articles` // prefix
  const size = { width: 180, height: 180 }

  blobStream.on('error', err => {
    next(err);
  });

  blobStream.on('finish', () => {
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}
    /${prefix}/${size.width}x${size.height}/${Date.now()}-${blob.name}`
    );
    res.status(200).send(publicUrl);
  });

  blobStream.end(req.file.buffer);
};