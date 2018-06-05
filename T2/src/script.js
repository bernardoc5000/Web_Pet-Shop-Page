/*
Inicializacao e abertura do
banco de dados
*/
Dexie.delete("petshop_database");
var db = new Dexie("petshop_database");
db.version(1).stores({
	admins: "id, name, image, tel, email, username, password",
	clients: "id, name, addr, image, tel, email, username, password",
	pets: "id, name, image, species, breed, age, description, notes, ownerId",
	products: "id, name, image, description, price, inStock, sold",
	services: "id, name, image, description, price",
	appointments: "id, serviceId, userId, petId, day, time",
	productsSales: "id, productId, productName, productPrice, quantity, total",
	servicesSales: "id, serviceId, serviceName, servicePrice"
});
db.open();
insertInitialAdmin();
insertInitialUser();
var sessionUser = undefined;
var carrinho = new Map();
var reader = new FileReader();



/*
Funcoes temporarias para
inicializar o banco de dados
*/
async function insertInitialAdmin(){
	if ((await db.admins.get(0)) === undefined){
		let file = document.createElement("input");
		file.setAttribute("type", "file");
		file.setAttribute("value", "res/manager.png");
		let tel = document.createElement("input");
		tel.setAttribute("type", "tel");
		tel.setAttribute("value", "5550000");
		let email = document.createElement("input");
		email.setAttribute("type", "email");
		email.setAttribute("value", "email@server.com");
		
		db.admins.put({
			id: 0,
			name: "Joao",
			image: file.value,
			tel: tel.value,
			email: email.value,
			username: "admin",
			password: "admin"
		});
	}
}

async function insertInitialUser(){
	if ((await db.clients.get(0)) === undefined){
		let file = document.createElement("input");
		file.setAttribute("type", "file");
		file.setAttribute("value", "res/manager.png");
		let tel = document.createElement("input");
		tel.setAttribute("type", "tel");
		tel.setAttribute("value", "54450000");
		let email = document.createElement("input");
		email.setAttribute("type", "email");
		email.setAttribute("value", "email@server2.com");
		
		db.clients.put({
			id: 0,
			name: "Joao",
			addr: "RUA X",
			image: file.value,
			tel: tel.value,
			email: email.value,
			username: "user",
			password: "user"
		});
	}
}



/*
Funcoes que manipulam a pagina
a partir do banco de dados
*/

function loadProdutos(page){
	db.products.toArray(function(products){
		let line = "";
		for (let i=0; i<products.length; i++){
			let product = products[i];
			line += "<div class=\"Item\">";
			line += "<ul class=\"Product\">";
			line += "<li class=\"ProductImage\"><img src=\"" + product['image'] + "\" alt=\"res/blank.png\"></img></li>";
			line += "<li class=\"ProductDescription\">" + product['name'] + "</li>";
			line += "<li class=\"ProductDescription\">" + product['description'] + "</li>";
			line += "<li class=\"ProductDescription\">R$ " + product['price'] + "</li>";
			if (page === 0){
				line += "<li class=\"ProductValue\">Quantidade: <input id=\"quantidade_" + product['id'].toString() + "\" type=\"number\" name=\"Quantidade\" value=\"Quantidade\"></input></li>";
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Adicionar ao Carrinho\" value=\"Adicionar ao Carrinho\" class=\"ProductButton\" onclick=\"addCarrinho(" + product['id'].toString() + ")\"></input></li>";
			}
			else{
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Editar\" value=\"Editar\" class=\"ProductButton\" onclick=\"showEditProduto(" + product['id'].toString() + ")\"></input></li>";
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeProduto(" + product['id'].toString() + ")\"></input></li>";
			}
			line += "</ul>";
			line += "</div>";
		}

		if (page==0) $("#Content").html(line);
		else $("#MainContent").html(line);
	});
}

function loadServicos(){
	db.services.toArray(function(services){
		let line = "";
		for (let i=0; i<services.length; i++){
			service = services[i];
			line += "<div class=\"Item\">";
			line += "<ul class=\"Product\">";
			line += "<li class=\"ProductImage\"><img src=\"" + service['image'] + "\" alt=\"res/blank.png\"></img></li>";
			line += "<li class=\"ProductDescription\">" + service['name'] + "</li>";
			line += "<li class=\"ProductDescription\">" + service['description'] + "</li>";
			line += "<li class=\"ProductDescription\">R$ " + service['price'] + "</li>";
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Editar\" value=\"Editar\" class=\"ProductButton\" onclick=\"showEditServico(" + service['id'].toString() + ")\"></input></li>";
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeServico(" + service['id'].toString() + ")\"></input></li>";
			line += "</ul>";
			line += "</div>";
		}

		$("#MainContent").html(line);
	});
}

function loadServicosOptions(){
	db.services.toArray(function(services){
		let line = "";
		for (let i=0; i<services.length; i++){
			service = services[i];
			line += "<option value=\"" + service['id'].toString() + "\">" + service['name'] + "</option>";
		}
		$("#select_servico").html(line);
	});

	db.pets.where("ownerId").equals(sessionUser['id']).toArray(function(pets){
		let line = ""
		for (let i=0; i<pets.length; i++){
			pet = pets[i];
			line += "<option value=\"" + pet['id'].toString() + "\">" + pet['name'] + "</option>";
		}
		$("#select_animal").html(line);
	});
}

function loadServicosHorarios(){
	for (let horario=8; horario<=16; horario++){
		$("#hr_"+horario.toString()).attr('disabled', false);
		$("#hr_"+horario.toString()).prop("checked", false);
		$("#lb_hr_"+horario.toString()).html(horario.toString() + ":00");
	}

	db.appointments.where("day").equals($("#date").val()).toArray(function(occupied){
		for (let i=0; i<occupied.length; i++){
			let horario = occupied[i]['time'];
			$("#hr_"+horario).attr('disabled', true);
			$("#lb_hr_"+horario).html(horario + ":00 - Ocupado");
		}
	});
}

function loadAnimais(){
	db.pets.where("ownerId").equals(sessionUser['id']).toArray(function(pets){
		let line = ""
		for (let i=0; i<pets.length; i++){
			pet = pets[i];
			line += "<div class=\"Item\">";
			line += "<ul class=\"Product\">";
			line += "<li class=\"ProductImage\"><img src=\"" + pet['image'] + "\" alt=\"res/cachorro1.png\"></li>";
			line += "<li class=\"ProductDescription\">" + pet['name'] + "</li>";
			line += "<li class=\"ProductDescription\">" + pet['breed'] + "</li>";
			line += "<li class=\"ProductDescription\">" + pet['age'] + " ano(s) de idade</li>";
			line += "<li class=\"ProductValue\">" + pet['description']+ "</li>";
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Ver Informações\" value=\"Ver Informações\" class=\"ProductButton\" onclick=\"showAnimal(" + pet['id'].toString() + ")\"></li>";
			line += "</ul>";
			line += "</div>";
		}

		$("#MainContent").html(line);
	});
}

async function loadCarrinho(){
	let line = 	"<tr>"
	line += "<th>Foto</th>"
	line += "<th>Produto</th>"
	line += "<th>Quantidade</th>"
	line += "<th>Remover</th>"
	line += "</tr>"
	for (let id of carrinho.keys()){
		let product = await db.products.get(id);
		line += "<tr>"
		line += "<td><img src=\"" + product['image'] + "\"></td>";
		line += "<td>" + product['description'] + "</td>";
		line += "<td>" + carrinho.get(id) + "</td>";
		line += "<td><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeCarrinho(" + id.toString() +")\"></td>";
		line += "</tr>";
	}
	$("#carrinho").html(line);
}

function loadUserData(){
	$("#usuario_nome").val(sessionUser['name']);
	$("#usuario_endereco").val(sessionUser['addr']);
	$("#usuario_tel").val(sessionUser['tel']);
	$("#usuario_email").val(sessionUser['email']);
	$("#usuario_user").val(sessionUser['username']);
	$("#usuario_password").val(sessionUser['password']);
}

function loadProductData(id){
	db.products.get(id, function(product){
		$("#produto_nome").val(product['name']);
		$("#produto_preco").val(product['price']);
		$("#produto_estoque").val(product['inStock']);
		$("#produto_desc").val(product['description']);
	});
}

function loadServiceData(id){
	db.services.get(id, function(service){
		$("#servico_nome").val(service['name']);
		$("#servico_preco").val(service['price']);
		$("#servico_desc").val(service['description']);
	});
}

function editProduto(id){
	if($("#add_produto")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		if($("#produto_foto").prop("files")[0] === undefined){
			db.products.update(id, {
				name: $("#produto_nome").val(),
				description: $("#produto_desc").val(),
				price: parseFloat($("#produto_preco").val()),
				inStock: parseInt($("#produto_estoque").val()),
			}).then(function(){

				$("#MainContent").empty();
				loadProdutos(1);
				alert("Produto alterado com sucesso.");
			});
		}
		else{
			reader.onloadend = function(){
				db.products.update(id, {
					name: $("#produto_nome").val(),
					image: reader.result,
					description: $("#produto_desc").val(),
					price: parseFloat($("#produto_preco").val()),
					inStock: parseInt($("#produto_estoque").val()),
				}).then(function(){

					$("#MainContent").empty();
					loadProdutos(1);
					alert("Produto alterado com sucesso.");
				});
			};
			reader.readAsDataURL($("#produto_foto").prop("files")[0]);
		}
	}
}

function editServico(id){
	if($("#add_servico")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		if($("#servico_foto").prop("files")[0] === undefined){
			db.services.update(id, {
				name: $("#servico_nome").val(),
				description: $("#servico_desc").val(),
				price: parseFloat($("#servico_preco").val())
			}).then(function(){

				$("#MainContent").empty();
				loadServicos();
				alert("Serviço alterado com sucesso.");
			});
		}
		else{
			reader.onloadend = function(){
				db.services.update(id, {
					name: $("#servico_nome").val(),
					image: reader.result,
					description: $("#servico_desc").val(),
					price: parseFloat($("#servico_preco").val())
				}).then(function(){

					$("#MainContent").empty();
					loadServicos();
					alert("Serviço alterado com sucesso.");
				});
			}
			reader.readAsDataURL($("#servico_foto").prop("files")[0]);
		}
	}
}

function editUser(){
	if($("#usuario_cadastro")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		if($("#usuario_foto").prop("files")[0] === undefined){
			db.clients.update(sessionUser['id'], {
			name: $("#usuario_nome").val(),
			addr: $("#usuario_endereco").val(),
			tel: $("#usuario_tel").val(),
			email: $("#usuario_email").val(),
			username: $("#usuario_user").val(),
			password: $("#usuario_password").val()
			}).then(function(){

				alert("Cadastro alterado com sucesso.");
			});

			sessionUser['name'] = $("#usuario_nome").val();
			sessionUser['addr'] = $("#usuario_endereco").val();
			sessionUser['image'] = sessionUser['image'];
			sessionUser['tel'] = $("#usuario_tel").val();
			sessionUser['email'] = $("#usuario_email").val();
			sessionUser['username'] = $("#usuario_user").val();
			sessionUser['password'] = $("#usuario_password").val();
		}
		else{
			reader.onloadend = function(){
				db.clients.update(sessionUser['id'], {
					name: $("#usuario_nome").val(),
					addr: $("#usuario_endereco").val(),
					image: reader.result,
					tel: $("#usuario_tel").val(),
					email: $("#usuario_email").val(),
					username: $("#usuario_user").val(),
					password: $("#usuario_password").val()
				}).then(function(){
					
					alert("Cadastro alterado com sucesso.");
				});

				sessionUser['name'] = $("#usuario_nome").val();
				sessionUser['addr'] = $("#usuario_endereco").val();
				sessionUser['image'] = reader.result;
				sessionUser['tel'] = $("#usuario_tel").val();
				sessionUser['email'] = $("#usuario_email").val();
				sessionUser['username'] = $("#usuario_user").val();
				sessionUser['password'] = $("#usuario_password").val();
			}
			reader.readAsDataURL($("#usuario_foto").prop("files")[0]);
		}
	}
}

async function addProduto(){
	if($("#add_produto")[0].checkValidity() === false || $("#produto_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.products.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

		reader.onloadend = function(){
			db.products.put({
				id: id,
				name: $("#produto_nome").val(),
				image: reader.result,
				description: $("#produto_desc").val(),
				price: parseFloat($("#produto_preco").val()),
				inStock: parseInt($("#produto_estoque").val()),
				sold: 0
			}).then(function(){

				alert("Produto adicionado com sucesso.");
			});
		}
		reader.readAsDataURL($("#produto_foto").prop("files")[0]);
	}
}

async function addServico(){
	if($("#add_servico")[0].checkValidity() === false || $("#servico_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.services.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
		
		reader.onloadend = function(){
			db.services.put({
				id: id,
				name: $("#servico_nome").val(),
				image: reader.result,
				description: $("#servico_desc").val(),
				price: parseFloat($("#servico_preco").val())
			}).then(function(){

				alert("Serviço adicionado com sucesso.");
			});
		}
		reader.readAsDataURL($("#servico_foto").prop("files")[0]);
	}
}

async function addUser(){
	if($("#usuario_cadastro")[0].checkValidity() === false || $("#usuario_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.clients.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

		reader.onloadend = function(){
			db.clients.put({
				id: id,
				name: $("#usuario_nome").val(),
				addr: $("#usuario_endereco").val(),
				image: reader.result,
				tel: $("#usuario_tel").val(),
				email: $("#usuario_email").val(),
				username: $("#usuario_user").val(),
				password: $("#usuario_password").val()
			}).then(function(){

				alert("Usuário criado com sucesso.");
			});
		}
		reader.readAsDataURL($("#usuario_foto").prop("files")[0]);
	}
}

async function addAnimal(){
	if($("#animal_form")[0].checkValidity() === false || $("#animal_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.pets.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

		reader.onloadend = function(){
			db.pets.put({
				id: id,
				name: $("#animal_nome").val(),
				image: reader.result,
				species: $("#animal_especie").val(),
				breed: $("#animal_raca").val(),
				age: parseInt($("#animal_idade").val()),
				description: $("#animal_desc").val(),
				notes: $("#animal_obs").val(),
				ownerId: sessionUser['id']
			}).then(function(){

				alert("Animal adicionado com sucesso à sua lista de animais.");
			});
		}
		reader.readAsDataURL($("#animal_foto").prop("files")[0]);
	}
}

async function addAdmin(){
	if($("#admin_form")[0].checkValidity() === false || $("#admin_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.admins.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
		
		reader.onloadend = function(){
			db.admins.put({
				id: id,
				name: $("#admin_nome").val(),
				image: reader.result,
				tel: $("#admin_tel").val(),
				email: $("#admin_email").val(),
				username: $("#admin_user").val(),
				password: $("#admin_password").val()
			}).then(function(){

				alert("Usuário administrador criado com sucesso.");
			});
		}
		reader.readAsDataURL($("#admin_foto").prop("files")[0]);
	}
}

async function addAppointment(){
	if($("#Horarios")[0].checkValidity() === false || $("#time_form")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.appointments.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

		db.appointments.put({
			id: id,
			serviceId: parseInt($("#select_servico").val()),
			userId: sessionUser['id'],
			petId: parseInt($("#select_animal").val()),
			day: $("#date").val(),
			time: $("#Horarios input[name=time_schedule]:checked").val()
		}).then(function(){

			addServiceSale(parseInt($("#select_servico").val()));
			alert("Serviço agendado com sucesso.");
		});
		loadServicosHorarios();
	}
}

async function addProductSale(productId, productQuantity){
	let id = parseInt(2147483648*Math.random());
	while ((await db.productsSales.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

	db.products.get(productId, function(product){
		db.productsSales.put({
			id: id,
			productId: productId,
			productName: product['name'],
			productPrice: product['price'],
			quantity: productQuantity,
			total: productQuantity *  product['price']
		});
	});
}

async function addServiceSale(serviceId){
	let id = parseInt(2147483648*Math.random());
	while ((await db.servicesSales.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

	db.services.get(serviceId, function(service){
		db.servicesSales.put({
			id: id,
			serviceId: serviceId,
			serviceName: service['name'],
			servicePrice: service['price'],
		});
	});
}

function addCarrinho(id){
	if (carrinho.get(id) === undefined) carrinho.set(id, parseInt($("#quantidade_"+id.toString()).val()));
	else carrinho.set(id, carrinho.get(id) + parseInt($("#quantidade_"+id.toString()).val()));

	alert("Produtos adicionados ao carrinho com sucesso.");
}

function removeProduto(id){
	db.products.delete(id).then(function(){
		loadProdutos(1);
	});
}

function removeServico(id){
	db.services.delete(id).then(function(){
		loadServicos();
	});
}

function removeCarrinho(id){
	carrinho.delete(id);
	loadCarrinho();
}

function showAnimal(id){
	db.pets.get(parseInt(id), function(pet){
		$("#MainContent").load("src/usuario_animais_info.html", function(responseTxt, statusTxt, xhr){
			$("#info_img").attr('src', pet['image']);
			$("#info_name").html(pet['name']);
			$("#info_esp").html(pet['species']);
			$("#info_raca").html(pet['breed']);
			$("#info_ida").html(pet['age'].toString());
			$("#info_desc").html(pet['description']);
			$("#info_obs").html(pet['notes']);
		});
	});
}

function showEditServico(id){
	$("#MainContent").load("src/admin_servicos_adicionar.html", function(responseTxt, statusTxt, xhr){
		$("#submit_button").attr('onclick', "editServico(" + id.toString() + ")");
		$("#add_servico").append("<input type=\"button\" name=\"SubmitButton\" value=\"Cancelar\" class=\"Button\" onclick=\"loadServicos();\">");
		loadServiceData(id);
	});
}

function showEditProduto(id){
	$("#MainContent").load("src/admin_produtos_adicionar.html", function(responseTxt, statusTxt, xhr){
		$("#submit_button").attr('onclick', "editProduto(" + id.toString() + ")");
		$("#add_produto").append("<input type=\"button\" name=\"SubmitButton\" value=\"Cancelar\" class=\"Button\" onclick=\"loadProdutos(1);\">");
		loadProductData(id);
	});
}

function showLucros(){
	db.productsSales.toArray(function(sales){
		let line = "Produto\t\tQuantidade\t\tValor\n\n";
		let tot = 0;
		for (let i=0; i<sales.length; i++){
			sale = sales[i];
			tot +=  sale['total'];
			line += sale['productName'] + "\t\t" + sale['quantity'].toString() + "\t\t\t" + sale['total'].toString() + "\n";
		}
		line += "------------------------------------------------\n";
		line += "Total:\t\t\t\t\t" + tot.toString() + "\n";
		$("#lucro_produtos").html(line);
	});

	db.servicesSales.toArray(function(sales){
		let line = "Serviço\t\t\t\t\tValor\n\n";
		let tot = 0;
		for (let i=0; i<sales.length; i++){
			sale = sales[i];
			tot +=  sale['servicePrice'];
			line += sale['serviceName'] + "\t\t\t\t\t" + sale['servicePrice'].toString() + "\n";
		}
		line += "------------------------------------------------\n";
		line += "Total:\t\t\t\t\t" + tot.toString() + "\n";
		$("#lucro_servicos").html(line);
	});
}

function confirmSale(){
	if($("#cartao")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		for (let id of carrinho.keys()){
			addProductSale(id, carrinho.get(id));
			carrinho.delete(id);
		}
		loadCarrinho();
		alert("Compra finalizada com sucesso.");
	}
}

function cancelSale(){
	for (let id of carrinho.keys()) carrinho.delete(id);
	loadCarrinho();
}


/*
Funcoes para a mudanca
de paginas na SPA
*/
function login_out(in_out){
	if (in_out === 0){
		let username = $("#User").val();
		let password = $("#Password").val();

		db.clients.get({username: username}, function(user){
			if (user !== undefined && user['password'] === password){
				$("#Top").load("src/logged_top.html");
				$("#Menu").load("src/usuario_menu.html");
				changeUserPage(0);
				sessionUser = user;
			}
			else{
				db.admins.get({username: username}, function(adm){
					if (adm !== undefined && adm['password'] === password){
						$("#Top").load("src/logged_top.html");
						$("#Menu").load("src/admin_menu.html");
						changeAdminPage(0);
						sessionUser = adm;
					}
					else alert("Usuário ou Senha inválidos");
				});
			}
		});
	}
	else{
		$("body").load("index.html");
		sessionUser = undefined;
	}
}

function changeUserPage(page){
	if (page === 0){
		$("#Content").empty();
		loadProdutos(0);
	}
	else if (page === 1){
		$("#Content").load("src/usuario_servicos.html", function(responseTxt, statusTxt, xhr){
			loadServicosOptions();
			loadServicosHorarios();
		});
	}
	else if (page === 2){
		$("#Content").load("src/usuario_cadastro.html", function(responseTxt, statusTxt, xhr){
			$("#submit_button").attr('onclick', "editUser();");
			loadUserData();
		});
	}
	else if (page === 3){
		$("#Content").load("src/usuario_animais.html", function(responseTxt, statusTxt, xhr){
			animaisSidebar(0);
		});
	}
	else if (page === 4){
		$("#Content").load("src/usuario_carrinho.html", function(responseTxt, statusTxt, xhr){
			loadCarrinho();
		});
	}
}

function changeAdminPage(page){
	if (page === 0){
		$("#Content").load("src/admin_cadastro.html", function(responseTxt, statusTxt, xhr){
			adminCadastroSidebar(0);
		});
	}
	else if (page === 1){
		$("#Content").load("src/admin_produtos.html", function(responseTxt, statusTxt, xhr){
			adminProdutosSidebar(0);
		});
	}
	else if (page === 2){
		$("#Content").load("src/admin_servicos.html", function(responseTxt, statusTxt, xhr){
			adminServicosSidebar(0);
		});
	}
	else if (page === 3){
		$("#Content").load("src/admin_lucros.html", function(responseTxt, statusTxt, xhr){
			showLucros();
		});
	}
}

function animaisSidebar(page){
	if (page === 0)$("#MainContent").load("src/usuario_animais_cadastro.html");
	else{
		$("#MainContent").empty();
		loadAnimais();
	}
}

function adminCadastroSidebar(page){
	if (page === 0){
		$("#MainContent").load("src/usuario_cadastro.html", function(responseTxt, statusTxt, xhr){
			$("#submit_button").attr('onclick', "addUser();");
		});
	}
	else $("#MainContent").load("src/admin_cadastro_admin.html");
}

function adminProdutosSidebar(page){
	if (page === 0) $("#MainContent").load("src/admin_produtos_adicionar.html");
	else{
		$("#MainContent").empty();
		loadProdutos(1);
	}
}

function adminServicosSidebar(page){
	if (page === 0) $("#MainContent").load("src/admin_servicos_adicionar.html");
	else{
		$("#MainContent").empty();
		loadServicos();
	}
}