const express = require('express');
const https = require('https');
const router = express.Router();

const blog = require('./blog');
const users = require('./users');
const auth = require('./auth');
const oauth = require('./socialAuth');

router.use('/api/v1/users', users);
router.use('/api/v1/blog', blog);
router.use('/api/v1/', auth);
router.use('/api/v1/oauth', oauth);

router.get('*', (req, res) => {
  https.get(process.env.FRONTED_URL, response => response.pipe(res));
});

module.exports = router;