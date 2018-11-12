const rp = require('request-promise');
const cheerio = require('cheerio');
const investingSearchUrl = "https://www.investing.com/search/?q=";
const investingUrl = "https://www.investing.com";
const readline = require('readline');

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('infoOnAllTickers')
});

lineReader.on('line', function (line) {
  console.log(line);
});

function searchByCusip(anArray) {
  var cusip = anArray[1];
  console.log(cusip);
  var options = {
    uri: investingSearchUrl + cusip,
    headers: {
      'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    },
    transform: function (body) {
        return cheerio.load(body);
    }
  };
  rp(options)
    .then(($) => {
      var element = $('#fullColumn > div > div.js-section-wrapper.searchSection.allSection > div.searchSectionMain > div.js-inner-all-results-quotes-wrapper.newResultsContainer.quatesTable > a');
      var href = element.attr('href');
      if (href) {
        var url = investingUrl + href;
        console.log(url);
        fetchCurrentPrice(anArray, url)
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function fetchCurrentPrice(anArray, url) {
  var options = {
    uri: url,
    headers: {
      'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    },
    transform: function (body) {
        return cheerio.load(body);
    }
  };
  rp(options)
    .then(($) => {
      var element = $('#last_last');
      var price = element.html();
      console.log(anArray[0], anArray[1], anArray[2], anArray[3], anArray[4], anArray[5], anArray[6], anArray[7], anArray[8], anArray[9], price);
    })
    .catch((err) => {
      console.log(err);
    });
}
