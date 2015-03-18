var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var CLIENT_ID = '430770259727-sbqrr3cpm8prhmf6v23l5objsq6rv7lg.apps.googleusercontent.com';
var CLIENT_SECRET = 'Ziyd-uSWZ0sFme87w4cGzbKJ';
var REDIRECT_URL = 'http://localhost:3000/oauth2callback';
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var plus = google.plus('v1');

var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/plus.me'
});


function getProfile(callback){
  plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, profile);
  });
}

module.exports.getProfile = getProfile;
module.exports.oauth2Client = oauth2Client;
module.exports.url = url;
