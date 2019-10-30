const express = require('express');
const oauth = express.Router();

oauth.get('/google', () => {

});

oauth.post('/google/callback', () => {

});

oauth.get('/facebook', () => {

});

oauth.post('/facebook/callback', () => {

})

module.exports = oauth;