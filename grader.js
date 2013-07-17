#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "https://github.com/mikeaggro/bitstarter/blob/aecbd65545f3826de3c5731207991468ad575ca2/index.html";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.",instr);
	process.exit(1);
    }
    return instr;
};

var getUrl = function(url, callback) {
    rest.get(url).on('complete', function(result){
	return callback(result.request.res.rawEncode);
	})
}; 



var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) {
    program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-u, --url <url_location>', 'https://github.com/mikeaggro/bitstarter/blob/aecbd65545f3826de3c5731207991468ad575ca2/index.html')
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .parse(process.argv);
    if(program.file) {
	var checkJson = checkHtmlFile(program.file, program.checks);
	}
    else if (program.url) {
        var checkJson = checkHtmlFile(getUrl(program.url), program.checks);
	}

    var outJson = JSON.stringify(checkJson, null, 4);
    fs.writeFileSync('checkResults.txt',outJson.toString());
}
else {
    exports.checkHtmlFile = checkHtmlFile;
}
