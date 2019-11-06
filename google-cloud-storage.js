require('dotenv').config();
const Multer = require('multer');
const { Storage } = require('@google-cloud/storage');

const prefix = 'anna/articles'
// const size = { width: 1200, height: 630 };

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

exports.sendUploadToGCS = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileName = `${Date.now()}-${req.file.originalname}`;
  const blob = bucket.file(`${prefix}/${fileName}`);

  // const options = {
  //   prefix: prefix,
  // };

  // bucket.getFiles(options).then((file) => { console.log(file) });

  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
    predefinedAcl: 'publicRead',
    public: true,
  });

  blobStream.on('error', err => {
    next(err);
  });

  blobStream.on('finish', async () => {
    req.file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${prefix}/${fileName}`;
    next();
  });

  blobStream.end(req.file.buffer);
};