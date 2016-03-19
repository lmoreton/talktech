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