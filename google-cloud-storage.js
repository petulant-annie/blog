const Multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');

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

exports.sendUploadToGCS = async (req, res, next) => {
  let prefix;
  let size;

  if (!req.file) {
    return next();
  }

  if (req.headers.referer.includes('articles')) {
    prefix = 'anna/articles'
    size = { width: 1200, height: 630 }
  } else {
    prefix = 'anna/avatars';
    size = { width: 180, height: 180 }
  }

  const sharpImage =
    await sharp(req.file.buffer)
      .resize(size.width, size.height)
      .toBuffer()

  const fileName = `${Date.now()}-${req.file.originalname}`;
  const fullFileName = `${prefix}/${size.width}x${size.height}/${fileName}`
  const blob = bucket.file(fullFileName);

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
    req.file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${fullFileName}`;
    next();
  });

  blobStream.end(sharpImage);
}

exports.deleteFromGCS = (pic) => {
  const fileName = pic.slice(49);
  const image = bucket.file(fileName);
  image.delete();
}
