var server_url = "http://localhost:3000";
console.log("background loaded");
chrome.browserAction.onClicked.addListener( function(request, sender, sendResponse) {
  console.log("clicked");
  chrome.tabs.executeScript(null, { // defaults to the current tab
    file: "parse.js", // script to inject into page and run in sandbox
    allFrames: true // This injects script into iframes in the page and doesn't work before 4.0.266.0.
  },
  function (result) {
    console.log(result);
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
      console.log(token);
      var url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + token;
      $.get( url, function( data ) {
        var id = data.user_id;
        console.log("id: " + id);
        url = server_url + "/import";
        $.post( url, { "id": id, "data": JSON.stringify(result) }, "json")
        .done(function( data ) {
          //console.log(data);
        });
      });
    });
  });
});
