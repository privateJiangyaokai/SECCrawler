const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const htmlparser = require("htmlparser");

const listPageUrl = "http://www.quantumonline.com/listwipo.cfm?type=AllIncSec&b_c=100&t_r="
const singleTickerUrl = "http://www.quantumonline.com/search.cfm?sopt=symbol&tickersymbol="
const numPages = 10;

var doneSize = 0;
var tickers = [];

var cookie = rp.cookie('REGUSER=268942')
var cookiejar = rp.jar();
cookiejar.setCookie(cookie, 'http://www.quantumonline.com');

var listPageHandler = new htmlparser.DefaultHandler(function (error, dom) {
	if (error) {
		console.error("PARSE ERROR");
  }	else {
    var tableRows = dom[3].children[1].children[5].children[1].children[1].children[1].children;
    for (var i = 0; i < tableRows.length; i++) {
      var tr = tableRows[i];
      if (!tr.raw.startsWith('tr bgcolor=') || (tr.children[0] && tr.children[0].raw != 'td')) {
        continue;
      }
      var ticker = tr.children[0].children[0].children[0].children[0].children[0].raw;
      tickers.push(ticker);
    }
  }
});
var parser = new htmlparser.Parser(listPageHandler);

for (var index = 0; index < numPages; index++) {
  var options = {
    uri: listPageUrl + (1 + (index - 1) * 100),
    jar: cookiejar,
    transform: function (body) {
      return body.replace(/\t|\n|\r|^\s*\n/g, '');
    }
  };
  rp(options)
    .then((body) => {
      parser.parseComplete(body);
      signalDone(index);
    })
    .catch((err) => {
      console.log(err);
    });
}

function signalDone(index) {
  doneSize++;
  if (doneSize < numPages) {
    return;
  }
  iteratorOverTickers(0);
}

function iteratorOverTickers(index) {
  if (index == tickers.length) {
    return;
  }
  var ticker = tickers[index];
  var options = {
    uri: singleTickerUrl + ticker,
    jar: cookiejar,
    transform: function (body) {
      return body.replace(/\t|\n|\r|^\s*\n/g, '');
    }
  };
  var listPageHandler = new htmlparser.DefaultHandler(function (error, dom) {
  	if (error) {
  		console.error("PARSE ERROR");
    }	else {
      var tableRows = dom[3].children[1].children[5].children[1].children[1].children[1].children;
      for (var i = 0; i < tableRows.length; i++) {
        var tr = tableRows[i];
        if (!tr.raw.startsWith('tr bgcolor=') || (tr.children[0] && tr.children[0].raw != 'td')) {
          continue;
        }
        var ticker = tr.children[0].children[0].children[0].children[0].children[0].raw;
        tickers.push(ticker);
      }
    }
  });
  setTimeout(function() {
    iteratorOverTickers(index + 1);
  })
}
