const request = require('request');
const fs = require('fs');
const papa = require('papaparse')
const api_key = 'AIzaSyAIxX11JdIgnFaI-e5H942BsQNmt0BIMck';
const search_url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?';
const details_url = 'https://maps.googleapis.com/maps/api/place/details/json?';

var fileContent = fs.readFileSync('mutualBanks.csv').toString();
var banks = papa.parse(fileContent, {header: true}).data;

banks.forEach(function (bank) {
  if (bank) {
    if (!bank.Phone) {
      return;
    }
    searchBank(bank);
    sleep(1000);
  }
});

function searchBank(bank) {
  if (!bank.Phone) {
    return console.log("missing Phone " + bank);
  }
  var phonenumber = bank.Phone.replace(/ | |\(|\)|\-|\?|\n|\r|/g, '');
  var search_url_to_use = search_url
                            + 'key=' + api_key
                            + '&input=' + '%2B1' + phonenumber
                            + '&inputtype=phonenumber';
  request(search_url_to_use, { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    var candidates = res.body.candidates;
    for (var index in candidates) {
      var place_id = candidates[index].place_id;
      var details_url_to_use = details_url
                                + 'key=' + api_key
                                + '&placeid=' + place_id;
      request(details_url_to_use, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        var result = res.body.result;
        if (!result) {
          console.log(phonenumber + ' ' + place_id + ' could not be found, ');
          console.log(res.body);
          return;
        }
        var toLog = result.name + " at " + result.formatted_address + " " + result.formatted_phone_number;
        var isPermanently_closed = result.permanently_closed;
        if (isPermanently_closed) {
          toLog += " is permanently closed, ";
        } else {
          // if (result.opening_hours) {
          //   toLog += " has operating hours:";
          //   for (var idx in result.opening_hours.weekday_text) {
          //     var day_text = result.opening_hours.weekday_text[idx];
          //     toLog += "\n\t" + day_text;
          //   }
          // } else {
          //   toLog += " has no info on operating hours"
          // }
          // if (result.website) {
          //   toLog += "\n" + result.website;
          }
        }
        console.log(toLog);
      });
    }
  });
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
