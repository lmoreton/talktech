var TelegramBot = require('node-telegram-bot-api');
 
var token = '187634337:AAEoZr3M3m9AzgRYJoaxsTWVCuL_GHAYTu4';
// Setup polling way 
var bot = new TelegramBot(token, {polling: true});

//Video uploading state
var uploadingState = new Array();
var waitingForLogin = new Array();

var sentVideo = new Array();

var login = new Array();
var password = new Array();
 
// Matches /echo [whatever] 
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

bot.onText(/youtube.com\/watch%?v=([_A-Za-z0-9-]+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});
 
// Any kind of message 
bot.on('message', function (msg) {
  //var chatId = msg.chat.id;

  var fromId = msg.from.id;

  var stringedFromId = fromId.toString();

  //bot.sendMessage(fromId, stringedFromId);

  if (uploadingState[stringedFromId] == true) {
  	bot.sendMessage(fromId, "Hey, I'm still working!");
  	return;
  }

  if (waitingForLogin[stringedFromId] == true) {
  	//Login requested.

  	if (login[stringedFromId] == null) {
  		var text = msg.text;
  		//bot.sendMessage(fromId, "Login: "+text);
  		login[stringedFromId] = text;
  	}

  	else if (password[stringedFromId] == null) {
  		var text = msg.text;
  		//bot.sendMessage(fromId, "Login: "+text);
  		password[stringedFromId] = text;
  		bot.sendMessage(fromId, "Please type your YouTube password.");
  		waitingForLogin[stringedFromId] = false;
  		processVideo(msg);
  	}

  	return;
  }

  var video = msg.video;
  
  if (video != null && uploadingState[stringedFromId] == null) {
  	sentVideo[stringedFromId] = video;
  	bot.sendMessage(fromId, "Video recieved.");
  	processVideo(msg);
  }
  //var photo = 'cats.png';
  //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});

function processVideo(msg) {

	var fromId = msg.from.id;

	var stringedFromId = fromId.toString();

  	//bot.sendMessage(fromId, "DEVProcessing...");

  	if (login[stringedFromId] == null && password[stringedFromId] == null) {
  		waitingForLogin[stringedFromId] = true;
  		bot.sendMessage(fromId, "User not logged in. Please type your YouTube username.");
  		return;
  	}

  	uploadingState[stringedFromId] = true;

  	bot.sendMessage(fromId, "Processing...");

}

//MARK: Youtube Video Uploading Example

// YouTube will handle the YouTube API requests
var Youtube = require("youtube-api")

    // We will use `fs` to read the video file
  , Fs = require("fs")

    // `r-json` will read the JSON file (credentials)
  , ReadJson = require("r-json")

    // `lien` handles the server requests (localhost:5000)
  , Lien = require("lien")

    // Logging things
  , Logger = require("bug-killer")

    // Open in the default browser
  , Opn = require("opn")
  ;

// Copy the downloaded JSON file in `credentials.json`
const CREDENTIALS = ReadJson("./credentials.json")
      // Set the video path (it can be any video file)
    , VIDEO_PATH = "video.mp4"
    ;

// Init the lien server
var server = new Lien({
    host: "localhost"
  , port: 5000
});

// Authenticate using the credentials
var oauth = Youtube.authenticate({
    type: "oauth"
  , client_id: CREDENTIALS.web.client_id
  , client_secret: CREDENTIALS.web.client_secret
  , redirect_url: CREDENTIALS.web.redirect_uris[0]
});

// Open the authentication url in the default browser
Opn(oauth.generateAuthUrl({
    access_type: "offline"
  , scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));

// Here we're waiting for the OAuth2 redirect containing the auth code
server.page.add("/oauth2callback", function (lien) {
    Logger.log("Trying to get the token using the following code: " + lien.search.code);

    // Get the access token
    oauth.getToken(lien.search.code, function(err, tokens) {
        if (err) { lien.end(err, 400); return Logger.log(err); }

        // Set the credentials
        oauth.setCredentials(tokens);

        // And finally upload the video! Yay!
        Youtube.videos.insert({
            resource: {
                // Video title and description
                snippet: {
                    title: "Testing YoutTube API NodeJS module"
                  , description: "Test video upload via YouTube API"
                }
                // I don't want to spam my subscribers
              , status: {
                    privacyStatus: "private"
                }
            }
            // This is for the callback function
          , part: "snippet,status"

            // Create the readable stream to upload the video
          , media: {
                body: Fs.createReadStream(VIDEO_PATH)
            }
        }, function (err, data) {
            if (err) { return lien.end(err, 400); }
            lien.end(data);
        });
    });
});