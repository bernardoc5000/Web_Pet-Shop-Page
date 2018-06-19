var express = require('express');
var page = express();
page.use(express.static("./public"));
page.listen(8000);

/*
var http = require('http')
var path = require('path')
var fs = require('fs');

function requestHandler(req, res) {
	var filename = req.url;
	if (filename === "/") filename = "./index.html";
	var filepath = path.join(__dirname, "public", filename);
	
	fs.readFile(filepath, function(err, contents) {
		if(!err){
			res.writeHead(200);
			res.end(contents);
		}
		else {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.end('<h1>Error 404: Page Not Found.</h1>');
		};
	});
};
http.createServer(requestHandler).listen(8000);
*/