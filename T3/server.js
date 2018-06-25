var nano = require('nano')("http://couchdb:couchdb@191.205.128.212:5984");
var express = require('express');
var bodyParser = require('body-parser');

var db = {};
nano.db.list(function(err, body){
	if (!err){
		let props = ["admins", "clients", "pets", "products", "services", "appointments", "productsSales", "servicesSales"];
		for (let i=0; i<props.length; i++){
			if(!body.includes(props[i])) nano.db.create(props[i], function(){ db[props[i]] = nano.use(props[i]); });
			else db[props[i]] = nano.use(props[i]);
		}
	}
});

var page = express();
page.use(express.static("./public"));
page.use(bodyParser.json());

page.post("/login", function(req, res){
	let userdata = req.body, user;
	db.admins.list(function(err, body){
		let keys = [];
		for (let i=0; i<body.rows.length; i++) keys.push(body.rows[i].key);
		db.admins.fetch({keys: keys}, function(err, data){
			for (let j=0; user === undefined && j<data.rows.length; j++) if (data.rows[j].doc.username === userdata.username) user = data.rows[j].doc;
			if (user !== undefined){
				if (user.password === userdata.password) res.send({user: user, type: "admin"});
				else res.send({user: undefined, type: -1});
			}
			else{
				db.clients.list(function(err, body){
					keys = [];
					for (let i=0; i<body.rows.length; i++) keys.push(body.rows[i].key);
					db.clients.fetch({keys: keys}, function(err, data){
						for (let j=0; user === undefined && j<data.rows.length; j++) if (data.rows[j].doc.username === userdata.username) user = data.rows[j].doc;
						if (user !== undefined){
							if (user.password === userdata.password) res.send({user: user, type: "client"});
							else res.send({user: undefined, type: -1});
						}
						else res.send({user: undefined, type: -1});
					});
				});
			}
		});
	});
});

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