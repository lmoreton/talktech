var TelegramBot = require('node-telegram-bot-api');
var request = require("request");

var http = require('http');
var fs = require('fs');
 
var token = '187634337:AAEoZr3M3m9AzgRYJoaxsTWVCuL_GHAYTu4';
// Setup polling way 
var bot = new TelegramBot(token, {polling: true});

//Video uploading state
var uploadingState = new Array();
var waitingForLogin = new Array();

var sentVideo = new Array();

var settingTag = false;
var tag = "";

var followedTags = new Array();

var settingName = false;
var videoName = "";

var shareState = false;

var fromIdMaster = "";
var fromIdMasterInt = "";

var globalPath = "";

var login = new Array();
var password = new Array();
 
// Matches /echo [whatever] 
/*bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});*/

bot.onText(/\/setTag (.+)/, function (msg, match) {

  var fromId = msg.from.id;
  if (followedTags[fromId.toString()] == null) {
  	followedTags[fromId.toString()] = new Array();
  }

  var taggy = match[1];
  var index = followedTags[fromId.toString()].indexOf(taggy);

  if (index == -1) {
  	followedTags[fromId.toString()].push(taggy);
  	bot.sendMessage(fromId, "You are now following '"+taggy+"'.");
  } 

  else {
  	followedTags[fromId.toString()].splice(index, 1);
  	bot.sendMessage(fromId, "You have unfollowed '"+taggy+"'.");
  }

});

bot.onText(/\/myTags/, function (msg, match) {

  var fromId = msg.from.id;

  if (followedTags[fromId.toString()] == null) {
  	followedTags[fromId.toString()] = new Array();
  }

  var followedTagsString = "";

  for (var i=0; i<followedTags[fromId.toString()].length; i++) {

  	if (i!= 0)
  	followedTagsString = followedTagsString+", "+followedTags[fromId.toString()][i];

  	else
  	followedTagsString = followedTags[fromId.toString()][i];

  	var pretext = "Tags you are following: '"+followedTagsString+"'";

  }

  if (followedTags[fromId.toString()].length == 0) {

  	pretext = "You are not following any tag.";

  }

  bot.sendMessage(fromId, pretext+"\n\nTo follow or unfollow a tag, type '\/setTag <name of the tag>'. \nAvailable tags:\n'Brazil'\n'BrazillianPolitics'\n'World'\n'USA'\n'Syria'");

});

/* SHARING */

bot.onText(/\/ShareToFacebook/, function (msg, match) {

  var fromId = msg.from.id;

  if (shareState == false) {
  	bot.sendMessage(fromId, "You need to send me a video before doing that!");
  	return;
  }

  bot.sendMessage(fromId, "Shared to your Facebook page. Since your tag was Brazil, I have tagged FOLHA DE SÃO PAULO, ESTADÃO and O GLOBO on it.");

});

bot.onText(/\/ShareToTwitter/, function (msg, match) {

  var fromId = msg.from.id;

  if (shareState == false) {
  	bot.sendMessage(fromId, "You need to send me a video before doing that!");
  	return;
  }

  bot.sendMessage(fromId, "Shared to your Twitter page. Since your tag was Brazil, I have hashtagged FOLHA DE SÃO PAULO, ESTADÃO and O GLOBO on it.");

});

bot.onText(/\/ShareToInstagram/, function (msg, match) {

  var fromId = msg.from.id;

  if (shareState == false) {
  	bot.sendMessage(fromId, "You need to send me a video before doing that!");
  	return;
  }

  bot.sendMessage(fromId, "Shared to your Instagram. Since your tag was Brazil, I have tagged FOLHA DE SÃO PAULO, ESTADÃO and O GLOBO on it.");

});

bot.onText(/\/ShareToReddit/, function (msg, match) {

  var fromId = msg.from.id;

  if (shareState == false) {
  	bot.sendMessage(fromId, "You need to send me a video before doing that!");
  	return;
  }

  bot.sendMessage(fromId, "Shared to your Reddit account. Since your tag was Brazil, I have posted it on /r/brasil, as well as /r/worldnews just in case.");

});

bot.onText(/\/ShareToAllOfThem/, function (msg, match) {

  var fromId = msg.from.id;

  if (shareState == false) {
  	bot.sendMessage(fromId, "You need to send me a video before doing that!");
  	return;
  }

  bot.sendMessage(fromId, "Shared to every account that you registered on me.");

});

/* SHARING END */

bot.onText(/\/start/, function (msg, match) {
  var fromId = msg.from.id;
  bot.sendMessage(fromId, "I am the EmergencySpreader bot.\n\nBy uploading a video on this chat, I'll automatically upload it on your Youtube Channel, linking it to all relatable media sources. After that, you can share it to your Facebook Profile, Twitter, Instagram and Reddit accounts. Set a tag for your video, and I will also send it to everyone who's following that tag.\n\nTo follow or unfollow a tag, click here: \/myTags");
});


bot.onText(/\/help/, function (msg, match) {
  var fromId = msg.from.id;
  bot.sendMessage(fromId, "I am the EmergencySpreader bot.\n\nBy uploading a video on this chat, I'll automatically upload it on your Youtube Channel, linking it to all relatable media sources. After that, you can share it to your Facebook Profile, Twitter, Instagram and Reddit accounts. Set a tag for your video, and I will also send it to everyone who's following that tag.\n\nTo follow or unfollow a tag, click here: \/myTags");
});

/*bot.onText(/youtube.com\/watch%?v=([_A-Za-z0-9-]+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});*/
 
// Any kind of message 
bot.on('message', function (msg) {
  //var chatId = msg.chat.id;

  var fromId = msg.from.id;

  var stringedFromId = fromId.toString();

  //bot.sendMessage(fromId, stringedFromId);

  if (settingTag == true) {

  	tag = msg.text.split("\/")[1];
  	
  	if (tag == null) {
  		tag = "";
  		bot.sendMessage(fromId, "Wrong tag. Please, select a tag from the list!");
  	}

  	else {
  		settingTag = false;
  		//bot.sendMessage(fromId, "Please wait! I'm still uploading your video.");
  		processVideo(msg);
  	}
  	return;
  }

  if (settingName == true) {
  	videoName = msg.text;
  	settingName = false;
  	//bot.sendMessage(fromId, "Please wait! I'm still uploading your video.");
  	processVideo(msg);
  	return;
  }

  if (uploadingState[stringedFromId] == true) {
  	bot.sendMessage(fromId, "Please wait! I'm still uploading your video.");
  	return;
  }

  /*if (waitingForLogin[stringedFromId] == true) {
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
  }*/

  var video = msg.video;
  
  if (video != null && uploadingState[stringedFromId] == null) {
  	sentVideo[stringedFromId] = video;
  	//bot.sendMessage(fromId, "Video recieved. Please wait!");
  	processVideo(msg);
  }
  //var photo = 'cats.png';
  //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});

function processVideo(msg) {

	var fromId = msg.from.id;

	fromIdMasterInt = fromId;
	fromIdMaster = fromId.toString();

	var stringedFromId = fromId.toString();

	if (tag == "") {
		settingTag = true;
		bot.sendMessage(fromId, "Please select a tag for your video. These are the most popular ones at the moment:\n\n\/Brazil");
		return;
	}

	if (videoName == "") {
		settingName = true;
		bot.sendMessage(fromId, "Please, type the name you want for your video.");
		return;
	}

  	//bot.sendMessage(fromId, "DEVProcessing...");

  /*	if (login[stringedFromId] == null && password[stringedFromId] == null) {
  		waitingForLogin[stringedFromId] = true;
  		bot.sendMessage(fromId, "User not logged in. Please type your YouTube username.");
  		return;
  	} */

  	uploadingState[stringedFromId] = true;

  	//bot.sendMessage(fromId, sentVideo[stringedFromId].file_id);

  	var videoUrl = "https://api.telegram.org/bot187634337:AAEoZr3M3m9AzgRYJoaxsTWVCuL_GHAYTu4/getFile?file_id="+sentVideo[stringedFromId].file_id

  	request(videoUrl, function(error, response, body) {

  		console.log(body);
  		bot.sendMessage(fromId, "Processing Video...");

  		var obj = JSON.parse(body);
        var id = obj["result"];
        var path = id["file_path"];

        //bot.sendMessage(fromId, id);
  		var downloadUrl = "http://api.telegram.org/file/bot187634337:AAEoZr3M3m9AzgRYJoaxsTWVCuL_GHAYTu4/"+path;
	
  		//bot.sendMessage(fromId, downloadUrl);

  		download(downloadUrl, "/Users/Bruno/Desktop/bodyVideoGallery/"+path, function() {
    		//console.log('downloaded', "/Users/Bruno/Desktop/bodyVideoGallery/"+stringedFromId+".mp4");
  			//bot.sendMessage(fromIdMasterInt, "Video Processed. Preparing for upload...");

  			oauth = Youtube.authenticate({
    			type: "oauth"
  				, client_id: CREDENTIALS.web.client_id
  				, client_secret: CREDENTIALS.web.client_secret
  				, redirect_url: CREDENTIALS.web.redirect_uris[0]
			});

			var authUrl = oauth.generateAuthUrl({
    			access_type: "offline"
  				, scope: ["https://www.googleapis.com/auth/youtube.upload"]
			});

			bot.sendMessage(fromIdMasterInt, "You need to show me your Youtube Channel. Please, authenticate through this link:\n"+authUrl);

			/*Opn(oauth.generateAuthUrl({
    			access_type: "offline"
  				, scope: ["https://www.googleapis.com/auth/youtube.upload"]
			}));*/

  		});

  		//download(downloadUrl,"/Users/Bruno/Desktop/bodyVideoGallery/"+stringedFromId+".mp4", onDataSuccess);

	});

  	/*bot.getFile(sentVideo[stringedFromId].file_id, function (response) {

  		console.log(response);
  		bot.sendMessage(fromId, response);

  		//bot.sendMessage(fromId, "Downloaded.");
  		//console.log(response);

  		oauth = Youtube.authenticate({
    		type: "oauth"
  			, client_id: CREDENTIALS.web.client_id
  			, client_secret: CREDENTIALS.web.client_secret
  			, redirect_url: CREDENTIALS.web.redirect_uris[0]
		});

		Opn(oauth.generateAuthUrl({
    		access_type: "offline"
  			, scope: ["https://www.googleapis.com/auth/youtube.upload"]
		}));

  	}); */

}

/*function download(url, dest, cb, fromId) {

  var file = fs.createWriteStream(dest);
  var requesty = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });

}; */

var download = function(uri, filename, callback) {
  console.log(uri, filename);

  globalPath = filename;

  // make the filename not need a directory
  var file = filename.split('/')[filename.split('/').length - 1];

  request.head(uri, function(err, res, body) {

    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    var r = request(uri).pipe(fs.createWriteStream(filename));
    r.on('close', callback);
    r.on('error', error);

  });
};

var error = function(message) {
  console.log(message);
};

/*function onDataSuccess(response) { 

	bot.sendMessage(fromIdMasterInt, "Video Downloaded.");

	oauth = Youtube.authenticate({
    	type: "oauth"
  		, client_id: CREDENTIALS.web.client_id
  		, client_secret: CREDENTIALS.web.client_secret
  		, redirect_url: CREDENTIALS.web.redirect_uris[0]
	});

	Opn(oauth.generateAuthUrl({
    	access_type: "offline"
  		, scope: ["https://www.googleapis.com/auth/youtube.upload"]
	}));

}*/

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
var CREDENTIALS = ReadJson("/Users/Bruno/Desktop/talktech/credentials.json")
      // Set the video path (it can be any video file)
    , VIDEO_PATH = "/Users/Bruno/Desktop/screentest.mov"
;

// Init the lien server
var server = new Lien({
    host: "localhost"
  , port: 5000
});

// Authenticate using the credentials
var oauth = null;
/*var oauth = Youtube.authenticate({
    type: "oauth"
  , client_id: CREDENTIALS.web.client_id
  , client_secret: CREDENTIALS.web.client_secret
  , redirect_url: CREDENTIALS.web.redirect_uris[0]
});*/

// Open the authentication url in the default browser
/*Opn(oauth.generateAuthUrl({
    access_type: "offline"
  , scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));*/

// Here we're waiting for the OAuth2 redirect containing the auth code
server.page.add("/oauth2callback", function (lien) {

	//bot.sendMessage(fromId, "Logged in (or not).");

    Logger.log("Trying to get the token using the following code: " + lien.search.code);

    // Get the access token
    oauth.getToken(lien.search.code, function(err, tokens) {
        if (err) { lien.end(err, 400); return Logger.log(err); }

        // Set the credentials
        oauth.setCredentials(tokens);

        bot.sendMessage(fromIdMasterInt, "All done. Uploading video!");

        // And finally upload the video! Yay!
        Youtube.videos.insert({
            resource: {
                // Video title and description
                snippet: {
                    title: "EmSpreader "+tag+": "+videoName
                  , description: "Shared via Emergency Spreader"
                }
                // I don't want to spam my subscribers
              , status: {
                    privacyStatus: "public"
                }
            }
            // This is for the callback function
          , part: "snippet,status"

            // Create the readable stream to upload the video
          , media: {
                body: Fs.createReadStream(globalPath)
            }
        }, function (err, data) {

            if (err) { return lien.end(err, 400); }

            uploadingState[fromIdMaster] = false;

            //console.log(data);
            //var dataJson = JSON.parse(""+data);
            var id = data["id"];

            shareState = true;
            bot.sendMessage(fromIdMasterInt, "Done! YouTube link: https://www.youtube.com/watch?v="+id+"\n\nSince your tag was Brazil, I have sent your video to FOLHA DE SÃO PAULO, ESTADÃO and O GLOBO, as well as everyone who follows that tag.\n\nYou can send me a new video now, or share to other media networks. If you have accounts on other networks, select the ones you want to share to.\n\n\/ShareToFacebook\n\/ShareToTwitter\n\/ShareToInstagram\n\/ShareToReddit\n----------\n\/ShareToAllOfThem\n----------");

            var keys = [];

			for (var key in followedTags) {
				console.log(key);
				if (followedTags[key].indexOf(tag) > -1) {
					console.log(key+" has tag: "+tag);
  					var fromId = parseInt(key);
  					if (fromId != fromIdMasterInt) {
  						bot.sendMessage(fromId, tag+" EMERGENCY: https://www.youtube.com/watch?v="+id+"\n"+videoName);
  					}
  				}
			}

		    tag = "";
            videoName = "";


            lien.end("<script>window.close();</script>");

        });
    });
});