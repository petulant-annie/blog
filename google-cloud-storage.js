require('dotenv').config();
const Multer = require('multer');
const { Storage } = require('@google-cloud/storage');

const prefix = 'anna/articles'
const size = { width: 1200, height: 630 };

const storage = new Storage({ keyFilename: './service-key.json' });
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

// const streamOpts = { predefinedAcl: this.options.acl || 'publicread' }

exports.sendUploadToGCS = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileName = `${Date.now()}-${req.file.originalname}`;
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
    predefinedAcl: 'publicread'
  });

  blobStream.on('error', err => {
    next(err);
  });

  blobStream.on('finish', async () => {
    req.file.cloudStorageObject = fileName;
    const public = await blob.makePublic();
    console.log(public)
    req.file.gcsUrl =
      `https://storage.googleapis.com/${bucket.name}
      /${prefix}/${size.width}x${size.height}/${fileName}`;
    next();
  });

  blobStream.end(req.file.buffer);
};