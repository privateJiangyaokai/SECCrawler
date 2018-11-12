const rp = require('request-promise');
const cheerio = require('cheerio');
const edgarUrl = 'https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp?search_text=%22Entered%20into%20an%20Agreement%20and%20Plan%20of%20Merger%22&sort=Date&formType=Form8K&isAdv=true&stemming=false&numResults=100&fromDate=11/04/2018&toDate=11/07/2018&numResults=100'
const urlXpath = '//*[@id="ifrm2"]/table[2]/tbody/tr[TOREPLACE]/td[2]/a';
const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const defAg = /Entry into a Material Definitive Agreement/i
const entered = /Entered into an Agreement and Plan of Merger/i
const purchasePrice = /purchase price of/i
const shareInCash = /per Share in cash/i

var count = 0;
function queryEdgar() {
  var headersOpt = {
    "Content-Type": "application/json"
  };
  var options = {
    method:'GET',
    uri:edgarUrl,
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
      return {"linkText" : linkText, "body" : cheerio.load(body).text().replace((/(\r\n|\n|\r)/gm,""))};
    }
  }

  rp(options)
    .then(function(linkTextAndBody) {
      var body = linkTextAndBody.body;
      // console.log(linkTextAndBody.linkText);
      if (body.search(defAg) > 0 && body.search(entered) > 0) {
        console.log(linkTextAndBody.linkText);
        // console.log(body);
        var purchasePriceMatch = body.match(purchasePrice);
        if (purchasePriceMatch) {
          var shareInCashMatch = body.match(shareInCash);
          if (shareInCashMatch) {
            var endIdx = shareInCashMatch.index;
            var shareInCashStr = shareInCashMatch[0];
            var beginIdx = purchasePriceMatch.index;
            var line = body.substring(beginIdx, endIdx) + shareInCashStr;
            console.log(line);
          }
        }
      }
    })
    .catch (function(err){
      console.log("wtf", err);
    })
}

queryEdgar();
