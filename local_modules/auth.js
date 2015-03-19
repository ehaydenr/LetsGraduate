module.exports = function Auth(everyauth){
  var CLIENT_ID = '430770259727-sbqrr3cpm8prhmf6v23l5objsq6rv7lg.apps.googleusercontent.com';
  var CLIENT_SECRET = 'Ziyd-uSWZ0sFme87w4cGzbKJ';
  var conf = { google : { clientId : CLIENT_ID, clientSecret: CLIENT_SECRET}};

  var usersByGoogleId = {};
  var usersById = {};
  var nextUserId = 0;

  function addUser (source, sourceUser) {
    var user;
    if (arguments.length === 1) { // password-based
      user = sourceUser = source;
      user.id = ++nextUserId;
      return usersById[nextUserId] = user;
    } else { // non-password-based
      user = usersById[++nextUserId] = {id: nextUserId};
      user[source] = sourceUser;
    }
    return user;
  }

  everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

  everyauth.google
  .appId(conf.google.clientId)
    .appSecret(conf.google.clientSecret)
    .scope('https://www.googleapis.com/auth/userinfo.profile https://www.google.com/m8/feeds/')
    .authQueryParam({ access_type:'online', approval_prompt:'auto' })
    .findOrCreateUser( function (sess, accessToken, extra, googleUser) {
      googleUser.refreshToken = extra.refresh_token;
      googleUser.expiresIn = extra.expires_in;
      return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
    })
  .redirectPath('/');

  module.exports.CLIENT_ID = CLIENT_ID;
};

