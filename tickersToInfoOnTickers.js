const rp = require('request-promise');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const htmlparser = require("htmlparser");
require("datejs");

const listPageUrl = "http://www.quantumonline.com/listwipo.cfm?type=AllIncSec&b_c=100&t_r="
const singleTickerUrl = "http://www.quantumonline.com/search.cfm?sopt=symbol&tickersymbol="
const numPages = 10;

var doneSize = 0;
var tickers = ['PIHPP', 'SLMNP', 'AEH', 'AED', 'AEB', 'AESRO', 'MITT-B', 'MITT-A', 'AGNCN', 'AGNCB', 'AGRIP', 'AICPQ', 'APRDN', 'APRCP', 'ALPVN', 'APRDO', 'APRDP', 'APRDM', 'ALP-Q', 'ALR-B', 'ARE-D', 'NCZIP', 'AFC', 'ALL-B', 'ALL-G', 'ALL-A', 'ALL-F', 'ALL-E', 'ALL-D', 'ALL-C', 'AKT', 'AKF', 'ABV', 'AILLP', 'AILIH', 'AILIP', 'AILLO', 'AILIO', 'AILIN', 'AILIM', 'AILLN', 'AILLM', 'AILLI', 'AILLL', 'AILNP', 'AMBKO', 'AMBKP', 'AFGH', 'AFGE', 'AHMNQ', 'AHMMQ', 'AMH-F', 'AMH-G', 'AMH-E', 'AMH-D', 'ASRVP', 'AMTPQ', 'AATRL', 'AFSI-A', 'AFSI-F', 'AFSI-B', 'AFSS', 'AFSI-D', 'AFST', 'AFSI-C', 'AFSI-E', 'NLY-G', 'NLY-F', 'NLY-D', 'NLY-C', 'NLY-H', 'ACPOQ', 'ACPPQ', 'ANH-B', 'ANH-C', 'ANH-A', 'AIV-A', 'ARI-C', 'APO-A', 'APO-B', 'AIY', 'AERGP', 'ABR-B', 'ABR-A', 'ABR-C', 'ACGLP', 'ACGLO', 'ARH-C', 'ARNC-', 'ARES-A', 'ARGD', 'AIW', 'AIC', 'AI-B', 'ARR-B', 'ARR-A', 'AHT-F', 'AHT-G', 'AHT-H', 'AHT-I', 'AHT-D', 'AHL-D', 'AHL-C', 'ASB-D', 'ASB-C', 'AIZP', 'AGO-F', 'AGO-E', 'AGO-B', 'TBC', 'TBB', 'AFHBL', 'ATPGQ', 'CDMOP', 'AXS-E', 'AXS-D', 'RILYG', 'RILYH', 'RILYL', 'RILYZ', 'TEMP85', 'BANC-E', 'BANC-D', 'BANC-C', 'BCV-A', 'BAC-K', 'BAC-B', 'TEMP05', 'BCXQL', 'BAC-A', 'BAC-C', 'BAC-D', 'TEMP01', 'BAC-Y', 'BAC-W', 'BAC-L', 'TEMP87', 'BML-G', 'BML-H', 'BML-J', 'BML-L', 'BAC-E', 'BKNML', 'BK-C', 'BCS-D', 'BCBAY', 'BBT-F', 'BBT-G', 'BBT-E', 'BBT-H', 'BBT-D', 'BDXA', 'BDC-B', 'BANFP', 'BKHU', 'BRG-D', 'BRG-C', 'BRG-A', 'BOFIL', 'BOKFL', 'BNPVP', 'BXP-B', 'TEUCF', 'BHR-B', 'BSA', 'BMYMP', 'DTLA-', 'BPRAP', 'BGEPF', 'CAI-A', 'CAI-B', 'CPE-A', 'CARSP', 'CARSO', 'COF-G', 'COF-H', 'COF-P', 'COF-F', 'COF-C', 'COF-D', 'CSWCL', 'CPTAG', 'CPTAL', 'CMO-E', 'TCGP', 'CSVSP', 'CBL-E', 'CBL-D', 'CCOMP', 'CDR-C', 'CDR-B', 'CETXP', 'TEMP12', 'CNTQP', 'EBR.B', 'CTPPO', 'CRLKP', 'SCHW-D', 'SCHW-C', 'TEMP80', 'CHMI-A', 'CHK-D', 'CHKDG', 'CHKVP', 'CIM-A', 'CIM-B', 'CHSCM', 'CHSCN', 'CHSCL', 'CHSCO', 'CHSCP', 'CBB-B', 'C-N', 'C-C', 'C-S', 'C-K', 'C-L', 'C-J', 'TEMP88', 'CIO-A', 'CIVBP', 'CMFNL', 'CMSA', 'CBKAP', 'CBKLP', 'CKNQP', 'CBKPP', 'CBCPQ', 'CLNY-H', 'CLNY-J', 'CLNY-I', 'CLNY-G', 'CLNY-B', 'CLNY-E', 'CBSHP', 'CODI-A', 'CODI-B', 'CNLTL', 'CNLTN', 'CNPWP', 'CNLPM', 'CNPWM', 'CNLTP', 'CNLPL', 'CNLHN', 'CNLHO', 'CNLHP', 'CNTHN', 'CNTHO', 'CNTHP', 'CTGSP', 'CMS-B', 'CORR-A', 'GYB', 'GYC', 'PFH', 'CMRE-B', 'CMRE-C', 'CMRE-D', 'CMRE-E', 'CWGRP', 'COWNZ', 'COWNL', 'CCI-A', 'CFR-A', 'CUBI-F', 'CUBI-E', 'CUBI-D', 'CUBI-C', 'CYCCP', 'DYIGP', 'TEMP08', 'DCP-B', 'DDR-K', 'DDR-A', 'DDR-J', 'DXB', 'DKT', 'DSX-B', 'DSXN', 'DLR-J', 'DLR-G', 'DLR-I', 'DLR-C', 'DLR-H', 'DDT', 'DCUD', 'DRUA', 'DD-A', 'DD-B', 'DS-C', 'DS-D', 'DS-B', 'DTQ', 'DTJ', 'DTY', 'DTV', 'DTW', 'DUKH', 'DLNG-A', 'DX-B', 'DX-A', 'TEMP68', 'EHPTP', 'ECCX', 'ECCY', 'ECCA', 'ECCB', 'EBAYL', 'ECVPF', 'EP-C', 'ECF-A', 'ENBA', 'ETP-C', 'ETP-D', 'ESGRP', 'EGRKN', 'EGRKM', 'EGRKH', 'EGRKI', 'EAE', 'EAI', 'EAB', 'ELJ', 'ELU', 'ELC', 'EYMSN', 'EYMSP', 'EMP', 'EYMSM', 'ENJ', 'ENO', 'EZT', 'EPR-C', 'EPR-G', 'EPR-E', 'EQC-D', 'ESCSQ', 'XAN-C', 'FNB-E', 'FNMAL', 'FNMFM', 'FNMAN', 'FNMFO', 'FNMAG', 'FNMAK', 'FNMAM', 'FNMAI', 'FNMAJ', 'FNMAS', 'FNMAT', 'FNMAP', 'FNMAO', 'FNMFN', 'FNMAH', 'FPI-B', 'AGM-A', 'AGM-C', 'AGM-B', 'FRT-C', 'FDUSL', 'FTBXL', 'FITBI', 'FIISP', 'FIISO', 'FBPRL', 'FBPRP', 'FBPRN', 'FBPRM', 'FBPRO', 'FHN-A', 'INBKL', 'FNSPQ', 'FRC-H', 'FRC-D', 'FRC-G', 'FRC-I', 'FRC-F', 'FRC-E', 'FTV-A', 'FBIOP', 'FMCKK', 'FMCCH', 'FREJP', 'FMCKM', 'FMCKN', 'FMCKP', 'FMCCK', 'FMCCO', 'FMCKO', 'FMCCP', 'FMCKL', 'FMCCT', 'FMCKI', 'FMCKJ', 'FMCCI', 'FMCCG', 'FMCCL', 'FMCCS', 'FMCCM', 'TWO-B', 'TWO-A', 'TWO-E', 'TWO-D', 'TXUE', 'USB-O', 'USB-P', 'USB-M', 'USB-A', 'USB-H', 'UMH-D', 'UMH-C', 'UMH-B', 'UEPEN', 'UELMO', 'UEPEM', 'UEPCP', 'UEPEO', 'UEPEP', 'UEPCN', 'UEPCO', 'URIRP', 'UZA', 'UZB', 'UZC', 'UNMA', 'UBP-H', 'UBP-G', 'USATP', 'VALE.P', 'VR-B', 'VR-A', 'VLY-B', 'VLY-A', 'VTRB', 'VER-F', 'VZA', 'VRTSP', 'DYNC', 'VNORP', 'VNO-M', 'VNO-L', 'VNO-K', 'WBPRZ', 'WBPRJ', 'WBPRL', 'WBPRK', 'WBPRP', 'WBPRO', 'WBPRM', 'WBPRN', 'WRB-B', 'WRB-E', 'WRB-D', 'WRB-C', 'TEMP66', 'WGLCN', 'WGLCO', 'WGLCP', 'WPG-I', 'WPG-H', 'WBS-F', 'WFC-O', 'WFC-N', 'WFC-P', 'WFC-X', 'WFC-Y', 'WFC-W', 'WFC-Q', 'WFC-T', 'WFC-V', 'WFC-R', 'WFC-L', 'WFCNO', 'WFC-J', 'WFE-A', 'WELL-I', 'WALA', 'WGNAP', 'WHLRD', 'WHLRP', 'WVVIP', 'WLMCP', 'WTFCM', 'WELPP', 'WELPM', 'ZB-H', 'ZIONP', 'ZB-G', 'ZBK', 'ZIONO', 'ZB-A', 'IBKCO', 'IBKCP', 'IMPHO', 'IMPHP', 'IPWLP', 'IPWLO', 'IPWLG', 'IPWLN', 'IPWLK', 'IDDNF', 'ISG', 'ISF', 'IIPR-A', 'INSW-A', 'IPL-D', 'INPAP', 'IVR-C', 'IVR-B', 'IVR-A', 'IRET-C', 'IRDMB', 'SFICP', 'TEMP02', 'STAR-I', 'STAR-G', 'STAR-D', 'JSSNP', 'JCAP-B', 'JMPD', 'JMPB', 'JNEEP', 'JPJQL', 'JPM-A', 'JPM-G', 'JPMQL', 'JPM-F', 'JPM-H', 'JPM-E', 'JPM-B', 'JFTTL', 'JPYYL', 'JE-A', 'KSU-', 'KYN-F', 'KBKCP', 'KCAPL', 'KAP', 'KMPA', 'KEY-J', 'KEY-I', 'KIM-L', 'KIM-M', 'KIM-J', 'KIM-K', 'KIM-I', 'KMI-A', 'KKR-B', 'KKR-A', 'LTSL', 'LTSF', 'LTSK', 'LTS-A', 'LMRKO', 'LMRKP', 'LMRKN', 'LHO-J', 'LHO-I', 'LGCYP', 'LGCYO', 'LMHB', 'LMHA', 'JBK', 'LEHKQ', 'LEHLQ', 'LHHMQ', 'LEHNQ', 'LXP-C', 'MTB-', 'MTB-C', 'MTBPP', 'MHLA', 'MH-D', 'MH-C', 'MH-A', 'MHNC', 'MSSEL', 'MSSEN', 'MBFIO', 'MFINL', 'MTBCP', 'MCV', 'MCX', 'MDLX', 'MDLQ', 'MER-K', 'TEMP49', 'MET-E', 'MET-A', 'MFA-B', 'MFO', 'FMCCN', 'FMCCQ', 'FCELB', 'GCV-B', 'GDV-G', 'GDV-A', 'GDV-D', 'GAB-H', 'GAB-G', 'GAB-J', 'GAB-D', 'GGZ-A', 'GGO-A', 'GRX-A', 'GRX-B', 'GGT-E', 'GGT-B', 'GUT-C', 'GUT-A', 'GGN-B', 'GNT-A', 'TEMP10', 'TEMP11', 'GLOG-A', 'GLOP-B', 'GLOP-A', 'GST-B', 'GST-A', 'GMTA', 'GAM-B', 'GEAPO', 'GEAPP', 'GFNSL', 'GFNCP', 'GNE-A', 'GMETP', 'GPJA', 'GLADN', 'GOODM', 'GOODO', 'GOODP', 'GAINM', 'GAINL', 'GDVPP', 'LANDP', 'GBLIL', 'GBLIZ', 'GMRE-A', 'GNL-A', 'GLP-A', 'GSL-B', 'ALLY-A', 'GMLPP', 'GLSSP', 'GS-J', 'GS-B', 'GS-N', 'GS-K', 'GS-A', 'GS-C', 'GS-D', 'GDPAL', 'GDPAN', 'GDUEL', 'GOVNI', 'GPT-A', 'AJXA', 'GAJTQ', 'GECCL', 'GECCM', 'HKRCP', 'HABKP', 'HWCPL', 'THGA', 'HGH', 'HCAPZ', 'HAWEN', 'HAWLL', 'HAWEM', 'HAWEL', 'HAWLN', 'HL-B', 'HE-U', 'TEMP06', 'HCXZ', 'HTGX', 'HT-D', 'HT-E', 'HT-C', 'HES-A', 'HIW-A', 'HLM-', 'HMLP-A', 'HMTAP', 'HTFA', 'HOVNP', 'HSBC-A', 'HCFT-A', 'HBANN', 'HBANO', 'PNCYL', 'PNC-Q', 'PNC-P', 'PARDP', 'BPOPN', 'BPOPM', 'BPOPO', 'BPOPP', 'PW-A', 'PPX', 'PRIF-A', 'PLDGP', 'PBB', 'PBY', 'TEMP90', 'PRH', 'PJH', 'PRS', 'PUK-A', 'PUK-', 'PSB-W', 'PSB-Y', 'PSB-X', 'PSB-V', 'PSB-U', 'PSB-T', 'PNMXO', 'PSA-D', 'PSA-E', 'PSA-G', 'PSA-C', 'PSA-F', 'PSA-W', 'PSA-X', 'PSA-V', 'PSA-B', 'PSA-U', 'PSA-A', 'PSA-Z', 'PSA-Y', 'QTS-B', 'QTS-A', 'CTY', 'CTBB', 'CTZ', 'CTDD', 'CTV', 'CTAA', 'CTW', 'RLGT-A', 'RFTA', 'RFTT', 'RASFP', 'RASFO', 'RASFN', 'RPT-D', 'RYAM-A', 'RHE-A', 'RF-B', 'RF-A', 'RZB', 'RZA', 'RNR-E', 'RNR-C', 'RNR-F', 'RXNRP', 'REXR-A', 'REXR-B', 'RXN-A', 'RMPL-', 'RBS-S', 'RCCCP', 'RTULP', 'SB-C', 'SB-D', 'SAN-B', 'SAF', 'SAB', 'BFS-D', 'BFS-C', 'SBFGP', 'SCE-G', 'SCE-H', 'SCE-J', 'SCE-K', 'SCE-L', 'SLTB', 'SBNA', 'SBBC', 'SKRUF', 'SSWN', 'SSWA', 'SSW-H', 'SSW-D', 'SSW-G', 'SSW-E', 'JBN', 'JBR', 'SGZA', 'SRE-A', 'SRE-B', 'SENEM', 'SNHNI', 'SNHNL', 'SRG-A', 'SPG-J', 'SLG-I', 'SLMBP', 'SMANP', 'SOHOK', 'SOHOO', 'SOHOB', 'SJIU', 'SCE-B', 'SCE-C', 'SCE-D', 'SCE-E', 'SOCGP', 'SOCGM', 'SOJB', 'SOJC', 'SOJA', 'SNCTO', 'SPKEP', 'SPE-B', 'SRC-A', 'STAG-C', 'SWJ', 'SWH', 'SBLKZ', 'STT-C', 'STT-G', 'STT-D', 'STT-E', 'SPLP-A', 'SCA', 'SRCLP', 'STL-A', 'SFB', 'SF-A', 'SXN.A', 'SXN.B', 'SXN.C', 'SXN.D', 'SXN.E', 'SXN.F', 'KTN', 'KTBA', 'KTP', 'KTH', 'INN-E', 'INN-D', 'TEMP09', 'SHO-F', 'SHO-E', 'STI-A', 'SLDD', 'SLDA', 'SNV-D', 'GJH', 'GJO', 'GJP', 'GJR', 'GJS', 'GJT', 'GJV', 'NGLS-A', 'TCO-K', 'TCO-J', 'TCF-D', 'TGP-B', 'TGP-A', 'TOO-A', 'TOO-B', 'TOO-E', 'TDA', 'TDI', 'TDE', 'TDJ', 'TLSRP', 'TMCVP', 'TVE', 'TVC', 'TCBIP', 'TCBIL', 'TCRX', 'TCRZ', 'TMK-C', 'TANNZ', 'TANNL', 'TANNI', 'TY-', 'TPVY', 'TSCAP', 'TNP-B', 'TNP-D', 'TNP-C', 'TNP-E', 'TNP-F', 'TWO-C', 'MAA-I', 'MWPSL', 'MPRWL', 'MPRWP', 'MSPWP', 'MP-D', 'MINDP', 'IPB', 'PYS', 'PYT', 'PIY', 'MNR-C', 'MS-A', 'MS-K', 'MS-I', 'MS-G', 'MS-F', 'MS-E', 'SSRAP', 'HJV', 'MNESP', 'MVCD', 'NBR-A', 'NGHCO', 'NGHCN', 'NGHCP', 'NGHCZ', 'NNN-F', 'NNN-E', 'NSA-A', 'JSM', 'NM-H', 'NM-G', 'NAV-D', 'NEWEN', 'NUSPQ', 'NYCB-A', 'NYMTP', 'NYMTO', 'NYMTN', 'NEWTI', 'NEWTZ', 'NXTLM', 'NEE-I', 'NEE-K', 'NEE-J', 'NEE-R', 'NGL-B', 'NMPWP', 'NMK-B', 'NMK-C', 'NTRSP', 'NSARP', 'NSARO', 'NS-B', 'NS-A', 'NS-C', 'NSS', 'OAK-B', 'OAK-A', 'OSLE', 'OCSLL', 'OFG-B', 'OFG-A', 'OFG-D', 'OFGIP', 'OFSSL', 'OSBCP', 'OXLCM', 'OXLCO', 'OXSQL', 'PCG-I', 'PCG-H', 'PCG-G', 'PCG-C', 'PCG-D', 'PCG-E', 'PCG-B', 'PCG-A', 'PPWLO', 'PPWLM', 'PKRDP', 'PRE-F', 'PRE-I', 'PRE-G', 'PRE-H', 'PEB-D', 'PEB-C', 'PVAYQ', 'PVGPQ', 'PEI-D', 'PEI-C', 'PEI-B', 'PMT-B', 'PMT-A', 'PBCTP', 'PTQEP', 'PBOWN', 'PBI-B', 'PLYM-A'];

// var tickers = ['PIHPP', 'SLMNP', 'AEH'];
var cookie = rp.cookie('REGUSER=268942')
var cookiejar = rp.jar();
cookiejar.setCookie(cookie, 'http://www.quantumonline.com');

iteratorOverTickers(0);

function iteratorOverTickers(index) {
  // console.log("in!");
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
      var titleRow = dom[5].children[0].children[0].children[1].children[2].children[0].children[0].children[0].raw;
      var cusip = titleRow.substring(titleRow.indexOf('CUSIP: ') + 7);
      cusip = cusip.substring(0, cusip.indexOf('&nbsp'));
      if (dom[5].children[0].children[0].children[1].children[4] == undefined) {
        // console.log("can't handle, probably mandatory convertible");
        return;
      }
      if (dom[5].children[0].children[0].children[1].children[4].children == undefined ||
        dom[5].children[0].children[0].children[1].children[4].children[1] == undefined ||
        dom[5].children[0].children[0].children[1].children[4].children[1].children[1] == undefined) {
          // probably suspended
          // console.log("suspended");
          return;
      }
      var infoRow = dom[5].children[0].children[0].children[1].children[4].children[1].children[1];
      if (infoRow.raw == 'p') {
        // partial call?
        // console.log("partial call");
        return;
      }
      // console.log(infoRow);
      var incomeCell = infoRow.children[1].children[0];
      var yield = incomeCell.children[0].raw.trim();
      var payment = incomeCell.children[2].raw.trim();
      var priceCell = infoRow.children[2].children[0];
      var liqPref = priceCell.children[0].raw.trim();
      var callPrice = priceCell.children[2].raw.trim();
      var dateCell = infoRow.children[3].children[0];
      var callDate = dateCell.children[0].raw.trim();
      var tempDate;
      if (tempDate = Date.parse(callDate)) {
        callDate = tempDate.toString('yyyy-MM-dd');
      }
      var matureDate = dateCell.children[2].raw.trim();
      if (tempDate = Date.parse(callDate)) {
        callDate = tempDate.toString('yyyy-MM-dd');
      }
      var distributionCell = infoRow.children[5].children[0];
      var suspended = distributionCell.children[0];
      var description = dom[5].children[0].children[0].children[1].children[4].children[0].children[0].children[1].children[0].children[0].children[0].raw;
      var taxPref = description.indexOf('Dividends paid by these preferred shares are eligible for the preferential income tax rate of 15%') >= 0;
      var cumulative = description.indexOf('umulative') >= 0 && description.indexOf('on-cumulative distributions') < 0;
      var niceYield = description.match(/distributions of ([0-9\.]+%) /i);
      if (niceYield) {
        niceYield = niceYield[1];
      } else {
        niceYield = yield;
      }
      var frequencyTest = description.match(/paid (\w+) on/i);
      var frequency;
      if (frequencyTest) {
        frequency = frequencyTest[1];
      } else if (frequencyTest = description.match(/paid (\w+) up to and including/i)) {
        frequency = frequencyTest[1];
      } else if (frequencyTest = description.match(/paid (\w+) through /i)) {
        frequency = frequencyTest[1];
      } else if (frequencyTest = description.match(/paid (\w+) in cash or stock on/i)) {
        // stock payment?
        frequency = frequencyTest[1];
      } else {
        // can not deal with description
        frequency = 'unknown';
      }
      var output = [];
      output.push(ticker);
      output.push(cusip);
      output.push(niceYield);
      output.push(payment);
      output.push(liqPref);
      output.push(callPrice);
      output.push(callDate);
      output.push(matureDate);
      output.push(frequency);
      output.push(cumulative);
      output.push(taxPref);
      // console.log("ticker:" + ticker + " cusip:" + cusip
      //             + " yield:" + niceYield + " payment:" + payment + " liqPref:" + liqPref + " callPrice:" + callPrice
      //             + " callDate:" + callDate + " matureDate:" + matureDate + " pays:" + frequency
      //             + " cumulative:" + cumulative + " 15%Tax:" + taxPref);
      var outputString = ticker + "|||" + cusip + "|||" + niceYield + "|||" + payment + "|||" + liqPref + "|||" + callPrice + "|||"
                      + callDate + "|||" + matureDate + "|||" + frequency + "|||" + cumulative + "|||" + taxPref + "|||" + description;
      console.log(outputString);
    }
  });

  var parser = new htmlparser.Parser(listPageHandler);

  rp(options)
    .then((body) => {
      setTimeout(function() {
        iteratorOverTickers(++index);
      }, 100);
      parser.parseComplete(body);
    })
    .catch((err) => {
      console.log(err);
    });
}
