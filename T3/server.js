var nano = require('nano')("http://couchdb:couchdb@191.205.128.212:5984");
var express = require('express');
var bodyParser = require('body-parser');

var db = {};
nano.db.list(function(err, body){
	if (err) return;
	let props = ["admins", "clients", "pets", "products", "services", "appointments", "products_sales", "services_sales"];
	for (let i=0; i<props.length; i++){
		if(!body.includes(props[i])) nano.db.create(props[i], function(){ db[props[i]] = nano.use(props[i]); });
		else db[props[i]] = nano.use(props[i]);
	}
});

var page = express();
page.use(express.static("./public"));
page.use(bodyParser.json({limit: '10mb'}));



page.post("/login", function(req, res){
	let userdata = req.body, user;
	db.admins.list({include_docs: true}, function(err, body){
		if (err){
			res.send({user: undefined, type: "none"});
			return;
		}
		for (let i=0; user === undefined && i<body.rows.length; i++) if (body.rows[i].doc.username === userdata.username) user = body.rows[i].doc;
		if (user !== undefined){
			if (user.password === userdata.password) res.send({user: user, type: "admin"});
			else res.send({user: undefined, type: "none"});
		}
		else{
			db.clients.list({include_docs: true}, function(err, body){
			if (err){
				res.send({user: undefined, type: "none"});
				return;
			}
			for (let i=0; user === undefined && i<body.rows.length; i++) if (body.rows[i].doc.username === userdata.username) user = body.rows[i].doc;
				if (user !== undefined){
					if (user.password === userdata.password) res.send({user: user, type: "client"});
					else res.send({user: undefined, type: "none"});
				}
				else res.send({user: undefined, type: "none"});
			});
		}
	});
});

page.post("/addProduto", function(req, res){
	let product = req.body;
	product.sold = 0;
	db.products.insert(product, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.get("/loadProdutos", function(req, res){
	db.products.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let products = [];
		for (let i=0; i<body.rows.length; i++) products.push(body.rows[i].doc);
		res.send(products);
	});
});



page.listen(8000);