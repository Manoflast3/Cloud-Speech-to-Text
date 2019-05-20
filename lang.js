var Lang = function () {};

var languages = [];
var directionCodes = {};
var directions = {};


// English language
// TODO: do chinese 

languages.push('en-US');

var en_n = ["north", "forward", "up"];
var en_ne = ["north east"];
var en_e = ["east", "right"];
var en_se = ["south east"];
var en_s = ["south", "back", "backward", "reverse", "down"];
var en_sw = ["south west"];
var en_w = ["west", "left"];
var en_nw = ["north west"];

// spoken direction to code
// index is the code
directionCodes['en-US'] = [en_n, en_ne, en_e, en_se, en_s, en_sw, en_w, en_nw];
// flat array for Google Cloud Speech API to increase accuracy of speech recognition
directions['en-US'] = [].concat.apply([], directionCodes['en-US']);

// Polish language

languages.push('pl-PL');

var pl_n = ["północ", "góra", "przód"];
var pl_ne = ["północny wschód"];
var pl_e = ["wschód", "prawo"];
var pl_se = ["południowy wschód"];
var pl_s = ["południe", "wstecz", "tył", "dół"];
var pl_sw = ["południowy zachód"];
var pl_w = ["zachód", "lewo"];
var pl_nw = ["północny zachód"];

// spoken direction to code
// index is the code
directionCodes['pl-PL'] = [pl_n, pl_ne, pl_e, pl_se, pl_s, pl_sw, pl_w, pl_nw];
// flat array for Google Cloud Speech API to increase accuracy of speech recognition
directions['pl-PL'] = [].concat.apply([], directionCodes['pl-PL']);

Lang.prototype.getLanguages = function () {
  return languages;
}

Lang.prototype.getDirectionCodes = function (languageCode) {
  return directionCodes[languageCode];
}

Lang.prototype.getDirections = function (languageCode) {
  return directions[languageCode];
}

Lang.prototype.directionToCode = function (languageCode, direction) {
  var directionCodes = Lang.prototype.getDirectionCodes(languageCode);
  for (var i = 0; i < directionCodes.length; i++) {
    for (var j = 0; j < directionCodes[i].length; j++) {
      if (direction.includes(directionCodes[i][j])) {
        return i;
      }
    }
  }
  return -1;
}

module.exports = Lang;
