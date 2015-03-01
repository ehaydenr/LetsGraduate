chrome.browserAction.onClicked.addListener( function(request, sender, sendResponse) {
  chrome.tabs.executeScript(null, { // defaults to the current tab
    file: "parse.js", // script to inject into page and run in sandbox
    allFrames: true // This injects script into iframes in the page and doesn't work before 4.0.266.0.
  },
  function (result) {
    console.log(result);
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
      var url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + token;
      $.get( url, function( data ) {
        var id = data.user_id;
        url = "http://localhost:3000/import";
        $.post( url, { "id": id, "data": JSON.stringify(result) })
        .done(function( data ) {
          console.log(data);
        });
      });
    });
  });
});