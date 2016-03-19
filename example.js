var TelegramBot = require('node-telegram-bot-api');
 
var token = '187634337:AAEoZr3M3m9AzgRYJoaxsTWVCuL_GHAYTu4';
// Setup polling way 
var bot = new TelegramBot(token, {polling: true});
 
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
  var video = msg.video;
  
  if (video != null) {
  	bot.sendMessage(fromId, "it's a video");
  }
  //var photo = 'cats.png';
  //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});