var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var page = express();
page.use(express.static(__dirname + "/public"));
page.use(compression());
page.use(bodyParser.json({limit: '10mb'}));

var nano = require('nano')("http://admin:couchdb@127.0.0.1:5984");
var db = {};
nano.db.list(function(err, body){
	if (err) return;
	let props = ["admins", "clients", "pets", "products", "services", "appointments", "products_sales", "services_sales"];
	for (let i=0; i<props.length; i++){
		if(!body.includes(props[i])) nano.db.create(props[i], function(){ db[props[i]] = nano.use(props[i]); });
		else db[props[i]] = nano.use(props[i]);
	}
});


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

page.post("/addServico", function(req, res){
	let service = req.body;
	service.sold = 0;
	db.services.insert(service, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addUser", function(req, res){
	let user = req.body;
	user.sold = 0;
	db.clients.insert(user, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addAnimal", function(req, res){
	let animal = req.body;
	animal.sold = 0;
	db.pets.insert(animal, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addAdmin", function(req, res){
	let admin = req.body;
	admin.sold = 0;
	db.admins.insert(admin, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addAppointment", function(req, res){
	let appointment = req.body;
	appointment.sold = 0;
	db.appointments.insert(appointment, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/loadServicosOptionsPets", function(req, res){
	userId = req.body.sessionUserId;
	db.pets.list({ownerId: userId, include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let pets = [];
		for (let i=0; i<body.rows.length; i++) pets.push(body.rows[i].doc);
		res.send(pets);
	});
});

page.post("/loadAnimais", function(req, res){
	userId = req.body.sessionUserId;
	db.pets.list({ownerId: userId, include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let pets = [];
		for (let i=0; i<body.rows.length; i++) pets.push(body.rows[i].doc);
		res.send(pets);
	});
});

// VER GET EM VEZ DE LIST
page.post("/loadProductData", function(req, res){
	productId = req.body.productId;
	db.products.list({ _id: productId, include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let products = [];
		for (let i=0; i<body.rows.length; i++) products.push(body.rows[i].doc);
		res.send(products);
	});
});

// VER GET EM VEZ DE LIST
page.post("/loadServiceData", function(req, res){
	serviceId = req.body.serviceId;
	db.services.list({ _id: serviceId, include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let services = [];
		for (let i=0; i<body.rows.length; i++) services.push(body.rows[i].doc);
		res.send(services);
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

page.get("/loadServicos", function(req, res){
	db.services.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let services = [];
		for (let i=0; i<body.rows.length; i++) services.push(body.rows[i].doc);
		res.send(services);
	});
});

page.get("/loadServicosOptionsServices", function(req, res){
	db.services.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let services = [];
		for (let i=0; i<body.rows.length; i++) services.push(body.rows[i].doc);
		res.send(services);
	});
});

page.get("/loadLucrosProductsSales", function(req, res){
	db.products_sales.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let products_sales = [];
		for (let i=0; i<body.rows.length; i++) products_sales.push(body.rows[i].doc);
		res.send(products_sales);
	});
});

page.get("/loadLucrosServicesSales", function(req, res){
	db.services_sales.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let services_sales = [];
		for (let i=0; i<body.rows.length; i++) services_sales.push(body.rows[i].doc);
		res.send(services_sales);
	});
});



page.listen(5985);