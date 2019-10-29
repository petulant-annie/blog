const express = require('express');
const https = require('https');
const router = express.Router();

const blog = require('./blog');
const users = require('./users');

router.use('/api/v1', users);
router.use('/api/v1/blog', blog);

router.get('*', (req, res) => {
  https.get(process.env.FRONTED_URL, response => response.pipe(res));
});

module.exports = router;