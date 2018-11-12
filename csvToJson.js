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
    console.log(bank);
  }
});
