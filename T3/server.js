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
		if(!body.includes(props[i])) nano.db.create(props[i], function(){
			db[props[i]] = nano.use(props[i]);
			if(props[i] === "admins"){
				let admin = {};
				admin.name = "Joao";
  				admin.image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAGQCAIAAACxkUZyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gYEETEasaFFUQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAE+0lEQVR42u3VMREAAAjEMMC/58cFA5dI6NJOUgDArZEAAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAMGAAwYAAwYADAgAHAgAEAAwYAAwYADBgADBgADBgAMGAAMGAAwIABwIABAAMGAAMGAAwYAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAMGAAwYAAwYADAgAHAgAEAAwYAAwYADBgADBgADBgAMGAAMGAAwIABwIABAAMGAAMGAAwYAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAMGAAwYAAwYADAgAHAgAEAAwYAAwYADBgADBgADBgAMGAAMGAAwIABwIABAAMGAAMGAAwYAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAwYAAwYAAwYADAgAHAgAEAAwYAAwYADBgADBgAMGAAMGAAMGAAwIABwIABAAMGAAMGAAwYAAwYADBgADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAwYAAwYAAwYADAgAHAgAEAAwYAAwYADBgADBgAMGAAMGAAMGAAwIABwIABAAMGAAMGAAwYAAwYADBgADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAwYAAwYAAwYADAgAHAgAEAAwYAAwYADBgADBgAMGAAMGAAMGAAwIABwIABAAMGAAMGAAwYAAwYADBgADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAwYAAwYADAgAHAgAHAgAEAAwYAAwYADBgADBgAMGAAMGAAwIABwIABwIABAAMGAAMGAAwYAAwYADBgADBgAMCAAcCAAcCAAQADBgADBgAMGAAMGAAwYAAwYADAgAHAgAHAgAEAAwYAAwYADBgADBgAMGAAMGAAwIABwIABwIABAAMGAAMGAAwYAAwYADBgADBgAMCAAcCAAcCAAQADBgADBgAMGAAMGAAwYAAwYADAgAHAgAHAgAEAAwYAAwYADBgADBgAMGAAMGAAwIABwIABwIABAAMGAAMGAAwYAAwYADBgADBgAMCAAcCAAcCAAQADBgADBgAMGAAMGAAwYAAwYADAgAHAgAHAgCUAAAMGAAMGAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgADBgAMGAAMGAAwYAAwYADAgAHAgAEAAwYAAwYAAwYADBgADBgAMGAAMGAAwIABwIABAAMGAAMGAAMGAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgADBgAMGAAMGAAwYAAwYADAgAHAgAEAAwYAAwYAAwYADBgADBgAMGAAMGAAwIABwIABAAMGAAMGAAMGAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgADBgAMGAAMGAAwYAAwYADAgAHAgAEAAwYAAwYAAwYADBgADBgAMGAAMGAAwIABwIABAAMGAAMGAAMGAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAMGAAwYAAwYADAgAHAgAEAAwYAAwYADBgADBgADBgAMGAAMGAAwIABwIABAAMGAAMGAAwYAAwYAAwYADBgADBgAMCAAcCAAQADBgADBgAMGAAMGAAMGAAwYAAwYADAgAHAgAEAAwYAAwYADBgADBgADBgAMGAAMGAAwIABwIABAAMGAAMGAAwYAAwYAAwYADBgAPhrAUkcBh1kyqz7AAAAAElFTkSuQmCC";
  				admin.tel = "5550000";
  				admin.email = "email@server.com";
  				admin.username = "admin";
  				admin.password = "admin";
				db.admins.insert(admin);
			}
		});
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
	db.services.insert(service, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addUser", function(req, res){
	let user = req.body;
	db.clients.insert(user, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addAnimal", function(req, res){
	let animal = req.body;
	db.pets.insert(animal, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addAdmin", function(req, res){
	let admin = req.body;
	db.admins.insert(admin, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addAppointment", function(req, res){
	let appointment = req.body;
	db.appointments.insert(appointment, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/loadServicosOptionsPets", function(req, res){
	let userId = req.body.sessionUserId;
	db.pets.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let pets = [];
		for (let i=0; i<body.rows.length; i++){
			if(body.rows[i].doc.ownerId === userId) pets.push(body.rows[i].doc);
		}
		res.send(pets);
	});
});

page.post("/loadAnimais", function(req, res){
	let ownerId = req.body.ownerId;
	db.pets.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let pets = [];
		for (let i=0; i<body.rows.length; i++){
			if(body.rows[i].doc.ownerId === ownerId) pets.push(body.rows[i].doc);
		}
		res.send(pets);
	});
});

page.post("/loadProductData", function(req, res){
	let productId = req.body.productId;
	db.products.get(productId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		res.send(body);
	});
});

page.post("/loadServiceData", function(req, res){
	let serviceId = req.body.serviceId;
	db.services.get(serviceId, { include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		res.send(body);
	});
});

page.post("/editProduto", function(req, res){
	let product = req.body, productId = product['_id'];
	db.products.get(productId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		product['_rev'] = body['_rev'];
		if(product['image'] === undefined) product['image'] = body['image'];
		db.products.insert(product, function(err, body){
			if (err) res.send({success: false});
			else res.send({success: true});
		});
	});
});

page.post("/editServico", function(req, res){
	let service = req.body, serviceId = service['_id'];
	db.services.get(serviceId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		service['_rev'] = body['_rev'];
		if(service['image'] === undefined) service['image'] = body['image'];
		db.services.insert(service, function(err, body){
			if (err) res.send({success: false});
			else res.send({success: true});
		});
	});
});

page.post("/editUser", function(req, res){
	let client = req.body, clientId = client['_id'];
	db.clients.get(clientId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		client['_rev'] = body['_rev'];
		if(client['image'] === undefined) client['image'] = body['image'];
		db.clients.insert(client, function(err, body){
			if (err) res.send({success: false});
			else res.send({success: true});
		});
	});
});

page.post("/loadServicosHorariosAppointment", function(req, res){
	let day = req.body.day;
	db.appointments.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let appointments = [];
		for (let i=0; i<body.rows.length; i++){
			if(body.rows[i].doc.day === day) appointments.push(body.rows[i].doc);
		}
		res.send(appointments);
	});
});

page.post("/loadServicosHorariosService", function(req, res){
	let serviceId = req.body.serviceId;
	db.services.get(serviceId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		res.send(body);
	});
});

page.post("/loadServicosHorariosPet", function(req, res){
	let petId = req.body.petId;
	db.pets.get(petId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		res.send(body);
	});
});

page.post("/loadCarrinho", function(req, res){
	let keys = req.body.keys;
	db.products.list({include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		let products = [];
		for (let i=0; i<body.rows.length; i++){
			if(keys.includes(body.rows[i].doc['_id'])) products.push(body.rows[i].doc);
		}
	res.send(products);
	});
	
});

page.post("/addProductSaleGetProduct", function(req, res){
	let productId = req.body.productId;
	db.products.get(productId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		res.send(body);
	});
});

page.post("/addProductSaleAdd", function(req, res){
	let productSale = req.body;
	db.products_sales.insert(productSale, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addServiceSaleGetService", function(req, res){
	let serviceId = req.body.serviceId;
	db.services.get(serviceId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		res.send(body);
	});
});

page.post("/addServiceSaleAdd", function(req, res){
	let serviceSale = req.body;
	db.services_sales.insert(serviceSale, function(err, body){
		if (err) res.send({success: false});
		else res.send({success: true});
	});
});

page.post("/addCarrinho", function(req, res){
	let productId = req.body.productId;
	db.products.get(productId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		res.send(body);
	});
});

page.post("/removeProduto", function(req, res){
	let productId = req.body.productId;
	db.products.get(productId, {include_docs: true}, function(err, body){
		if (err){
			res.send({success: false});
			return;
		}
		db.products.destroy(body['_id'], body['_rev'], function(err, body){
			if (err) res.send({success: false});
			else res.send({success: true});
		});
	});
});

page.post("/removeServico", function(req, res){
	let serviceId = req.body.serviceId;
	db.services.get(serviceId, {include_docs: true}, function(err, body){
		if (err){
			res.send({success: false});
			return;
		}
		db.services.destroy(body['_id'], body['_rev'], function(err, body){
			if (err) res.send({success: false});
			else res.send({success: true});
		});
	});
});

page.post("/showAnimal", function(req, res){
	let petId = req.body.petId;
	db.pets.get(petId, {include_docs: true}, function(err, body){
		if (err){
			res.send([]);
			return;
		}
		res.send(body);
	});
});

page.post("/updateStock", function(req, res){
	let productId = req.body.productId, quantity = req.body.quantity;
	db.products.get(productId, {include_docs: true}, function(err, body){
		if (err){
			res.send({success: false});
			return;
		}
		body['inStock'] = body['inStock'] - quantity;
		body['sold'] = body['sold'] + quantity;
		db.products.insert(body, function(err, body){
			if (err) res.send({success: false});
			else res.send({success: true});
		});
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