var nano = require('nano')("http://couchdb:couchdb@191.205.128.212:5984");
var express = require('express');
var delay = require('delay');

var db = {};
initializeDatabase();

async function initializeDatabase(){
	nano.db.list(function(err, body){
		if (!err){
			if(!body.includes("admins")) nano.db.create("admins", function(){ db.admins = nano.use("admins"); });
			else db.admins = nano.use("admins");

			if(!body.includes("clients")) nano.db.create("clients", function(){ db.clients = nano.use("clients"); });
			else db.clients = nano.use("clients");
		}
	});

	/*
	let keepGoing;
	do{
		keepGoing = false;
		for (let property in db) if (db.hasOwnProperty(property) && property === undefined) keepGoing = true;
		await delay(500);
    }while(keepGoing);
    console.log(db.admins);
	console.log(db.clients);
	*/
}
//var db = nano.db.use("petshop");
//db.insert({ crazy: true }, 0);
//db.get(0, function(err, body) {
//  if (!err)
//    console.log(body);
//});

/*
var page = express();
page.use(express.static("./public"));
page.listen(8000);
*/
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