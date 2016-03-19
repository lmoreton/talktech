var TelegramBot = require('node-telegram-bot-api');
 
var token = '187634337:AAEoZr3M3m9AzgRYJoaxsTWVCuL_GHAYTu4';
// Setup polling way 
var bot = new TelegramBot(token, {polling: true});

//Video uploading state
var uploadingState = false;
var waitingForLogin = false;

var sentVideo = null;
var sentVideoFromId = null;


var login = "";
var password = "";
 
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

  if (uploadingState == true) {
  	bot.sendMessage(fromId, "Hey, I'm still working!");
  	return;
  }

  if (waitingForLogin == true) {
  	//Login requested.
  	if (login == "") {
  		var text = msg.text;
  		//bot.sendMessage(fromId, "Login: "+text);
  		login = text;
  	}

  	else if (password == "") {
  		var text = msg.text;
  		//bot.sendMessage(fromId, "Login: "+text);
  		password = text;
  		bot.sendMessage(fromId, "Please type your YouTube password.");
  		waitingForLogin = false;
  		processVideo()
  	}

  	return;
  }

  var video = msg.video;
  
  if (video != null && uploadingState == false) {
  	sentVideo = video;
  	sentVideoFromId = fromId;
  	bot.sendMessage(fromId, "Video recieved.");
  	processVideo();
  }
  //var photo = 'cats.png';
  //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});

function processVideo() {

  	//bot.sendMessage(fromId, "Processing...");

  	if (login == "" && password == "") {
  		waitingForLogin = true;
  		bot.sendMessage(sentVideoFromId, "User not logged in. Please type your YouTube username.");
  		return;
  	}

  	uploadingState = true;

  	bot.sendMessage(sentVideoFromId, "Processing...");

}