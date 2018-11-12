const request = require('request');
const fs = require('fs');
const papa = require('papaparse');
const xml2js = require('xml2js');
const fdic_url = 'https://www5.fdic.gov/cra/WebServices/DBService.asmx/callWS'
const no_records_xpath = '/html/body/div[3]/div/table[1]/tbody/tr/td/div/b/strong';

var fileContent = fs.readFileSync('mutualBanks.csv').toString();
var banks = papa.parse(fileContent, {header: true}).data;

banks.forEach(function (bank) {
  if (bank) {
    if (!bank.Name) {
      return;
    }
    queryFdic(bank);
  }
});

function queryFdic(bank) {
  var headersOpt = {
    "Content-Type": "application/json"
  };
  var options = {
    method:'POST',
    uri:fdic_url,
    form: { functionName: 'SearchCRA', parmsJSON : '{\"BANK_NAME\":\"' + bank.Name + '\"}'},
    headers: headersOpt,
    json: true
  }
  request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var parser = new xml2js.Parser();
            parser.parseString(body, function (err, result) {
              var results = JSON.parse(result.string._).Result;
              for (var idx = 0; idx < results.length; idx ++) {
                var toLog = '';
                var application = results[idx];
                toLog += "Bank name: " + application.Instname.trim() + ", ";
                toLog += application.Paddr1.trim() + ", "
                  + application.Paddr2.trim() + ", "
                  + application.Pcity.trim() + ", "
                  + application.Pstalp.trim() + "\n"
                toLog += "\tApplication number:" + application.Appl_Number + "\n";
                toLog += "\tApplication type:" + application.Appl_Type + "\n";
                toLog += "\tApplication received date:" + application.Appl_Recd_YMD + "\n";
                toLog += "\tApplication number:" + application.Appl_Number + "\n";
                toLog += "\tApplication number:" + application.Appl_Number + "\n";
                toLog += "\tComment close date:" + application.Cmt_Pd_Close_Dte;
                console.log(toLog);
              }
            });
        } else {
          console.log(error);
          console.log(body);
          console.log(response.statusCode);
        }
    }
  );
}
