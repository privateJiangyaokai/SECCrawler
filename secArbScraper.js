const rp = require('request-promise');
const dateFormat = require('dateformat');
const cheerio = require('cheerio');
const edgarUrl = 'https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp?search_text=%22Entered%20into%20an%20Agreement%20and%20Plan%20of%20Merger%22&sort=Date&formType=Form8K&isAdv=true&stemming=false&numResults=100&fromDate=FROM_DATE&toDate=TO_DATE&numResults=500'
const urlXpath = '//*[@id="ifrm2"]/table[2]/tbody/tr[TOREPLACE]/td[2]/a';
const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const defAg = /Entry into a Material Definitive Agreement/i
const entered = /Entered into an Agreement and Plan of Merger/i
const purchaseInCash = /purchase price of.*per Share.+in cash/i
const entitled = /entitled to receive.*common stock/i
const tenderOffer = /tender offer.+per share/i
const rightToReceive = /right to receive/i
const equalTo = /equal to/i

function queryEdgar(sinceDaysAgo) {
	var now = new Date();
	var dateOffset = (24*60*60*1000) * sinceDaysAgo; //sinceDaysAgo days
	var fromDate = new Date();
	fromDate.setTime(now.getTime() - dateOffset);
	var fromDateString = dateFormat(fromDate, "mm/dd/yyyy");
	var toDateString = dateFormat(now, "mm/dd/yyyy");
	console.log("Searching for filings between " + fromDateString + " to " + toDateString);
	var effectiveUrl = edgarUrl.replace("FROM_DATE", fromDateString).replace("TO_DATE", toDateString);
	console.log(effectiveUrl)
  var headersOpt = {
    "Content-Type": "application/json"
  };
  var options = {
    method:'GET',
    uri:effectiveUrl,
    transform: function (body) {
      return cheerio.load(body);
    }
  }
  rp(options)
    .then(function ($) {
      var allFilings = $('.filing');
      allFilings.each(function() {
        if ($(this).text().indexOf("8-K") == 0){
          var badUrl = $(this).attr('href');
          var begin = badUrl.indexOf("http");
          var end = badUrl.indexOf("','");
          var goodUrl = badUrl.substring(begin, end);
          loadFiling(goodUrl, $(this).text());
        }
      });
    })
    .catch (function (err) {
      console.log("wtf", err);
    })
  }

function loadFiling(url, linkText) {
  var options = {
    method:'GET',
    uri:url,
    transform: function (body) {
      return {"linkText" : linkText, "url" : url, "body" : cheerio.load(body)};
    }
  }

  rp(options)
    .then(function(linkTextAndBody) {
      var cheerioBody = linkTextAndBody.body;
			var body = cheerioBody.text().trim().replace(/\s/gm, " ").replace((/[^ -~]+/gm,"")).replace(/ +/gm, " ");
      // console.log(linkTextAndBody.linkText);
      if (body.search(defAg) >= 0 && body.search(entered) >= 0) {
        console.log(linkTextAndBody.linkText, linkTextAndBody.url);
				var sentences = body.split(". ");
				for (var i = 0; i < sentences.length; i++) {
					// console.log(sentence);
					var sentence = sentences[i];
					if (sentence.search(purchaseInCash) >= 0 || sentence.search(entitled) >= 0 || sentence.search(tenderOffer) >= 0
							|| (sentence.search(rightToReceive) >= 0)) {
						console.log(sentence);
						console.log();
						break;
					}
				}
      }
    })
    .catch (function(err){
      console.log("wtf", err);
    })
}

// loadFiling("https://www.sec.gov/Archives/edgar/data/77159/000119312518310686/d645994d8k.htm", "lala");
queryEdgar(process.argv.length != 3 ? 1 : (0 + process.argv[2]));
