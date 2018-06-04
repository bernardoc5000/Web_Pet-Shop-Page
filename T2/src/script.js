/*
Inicializacao e abertura do
banco de dados
*/
//Dexie.delete("petshop_database");
var db = new Dexie("petshop_database");
db.version(1).stores({
	admins: "id, name, image, tel, email, username, password",
	clients: "id, name, addr, image, tel, email, username, password",
	pets: "id, name, image, species, breed, age, description, notes, ownerId",
	products: "id, name, image, description, price, inStock, sold",
	services: "id, name, image, description, price",
	appointments: "id, serviceId, userId, petId, day, time"
});
db.open();
insertInitialAdmin();
insertInitialUser();
var sessionUser = undefined;
var carrinho = new Map();



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

async function loadServicosOptions(){
	let services = await db.services.toArray();
	let line = "";
	for (let i=0; i<services.length; i++){
		service = services[i];
		line += "<option value=\"" + service['id'].toString() + "\">" + service['name'] + "</option>";
	}
	$("#select_servico").html(line);

	let pets = await db.pets.where("ownerId").equals(sessionUser['id']).toArray();
	line = ""
	for (let i=0; i<pets.length; i++){
		pet = pets[i];
		line += "<option value=\"" + pet['id'].toString() + "\">" + pet['name'] + "</option>";
	}
	$("#select_animal").html(line);
}

async function loadServicosHorarios(){
	for (let horario=8; horario<=16; horario++){
		$("#hr_"+horario.toString()).attr('disabled', false);
		$("#lb_hr_"+horario.toString()).html(horario.toString() + ":00");
	}

	let occupied = await db.appointments.where("day").equals($("#date").val()).toArray();
	for (let i=0; i<occupied.length; i++){
		let horario = occupied[i]['time'];
		$("#hr_"+horario).attr('disabled', true);
		$("#lb_hr_"+horario).html(horario + ":00 - Ocupado");
	}
}

async function loadAnimais(){
	let pets = await db.pets.where("ownerId").equals(sessionUser['id']).toArray();
	line = ""
	for (let i=0; i<pets.length; i++){
		pet = pets[i];
		line += "<div class=\"Item\">";
		line += "<ul class=\"Product\">";
		line += "<li class=\"ProductImage\"><img src=\"" + pet['image'] + "\" alt=\"res/cachorro1.png\"></li>";
		line += "<li class=\"ProductDescription\">" + pet['name'] + "</li>";
		line += "<li class=\"ProductDescription\">" + pet['description'] + "</li>";
		line += "<li><input type=\"button\" name=\"Ver Informações\" value=\"Ver Informações\" class=\"ProductButton\" onclick=\"showAnimal(" + pet['id'].toString() + ")\"></li>";
		line += "</ul>";
		line += "</div>";
	}

	$("#MainContent").html(line);
}

async function loadCarrinho(){
	line = "<table class=\"Carrinho\">";
	line += "<tr>";
	line += "<th>Foto</th>";
	line += "<th>Produto</th>";
	line += "<th>Quantidade</th>";
	line += "<th>Remover</th>";
	line += "</tr>";
	for (let id of carrinho.keys()){
		let product = await db.products.get(id);
		line += "<tr>"
		line += "<td><img src=\"" + product['image'] + "\"></td>";
		line += "<td>" + product['description'] + "</td>";
		line += "<td>" + carrinho.get(id) + "</td>";
		line += "<td><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeCarrinho(" + id.toString() +")\"></td>";
		line += "</tr>";
	}
	line += "</table>";
	line += "<label for=\"cartao\" style=\"margin-left: 2%;\">Número do Cartão: </label>";
	line += "<input type=\"text\" name=\"cartao\" id=\"cartao\" placeholder=\"1234-5678-1234-5678\" maxlength=\"16\" pattern=\"[0-9]{16}\" title=\"Credit Card Number\">";
	line += "<br>";
	line += "<input type=\"button\" style=\"margin-right: 3%; margin-left: 1%;\" name=\"Confirmar\" value=\"Confirmar Compra\" class=\"Button\"><input type=\"button\" name=\"Esvaziar\" value=\"Esvaziar Carrinho\" class=\"Button\">";
	$("#Content").html(line);
}

function loadUserData(){
	$("#usuario_nome").val(sessionUser['name']);
	$("#usuario_endereco").val(sessionUser['addr']);
	$("#usuario_tel").val(sessionUser['tel']);
	$("#usuario_email").val(sessionUser['email']);
	$("#usuario_user").val(sessionUser['username']);
}

async function loadProductData(id){
	let product = await db.products.get(id);
	$("#produto_nome").val(product['name']);
	$("#produto_preco").val(product['price']);
	$("#produto_estoque").val(product['inStock']);
	$("#produto_desc").val(product['description']);
}

async function loadServiceData(id){
	let service = await db.services.get(id);
	$("#servico_nome").val(service['name']);
	$("#servico_preco").val(service['price']);
	$("#servico_desc").val(service['description']);
}

function editProduto(id){
	db.products.get(id, function(product){
		db.products.put({
			id: product['id'],
			name: $("#produto_nome").val(),
			image: $("#produto_foto").val(),
			description: $("#produto_desc").val(),
			price: $("#produto_preco").val(),
			inStock: $("#produto_estoque").val(),
			sold: product['sold']
		});

		alert("Produto alterado com sucesso.");
		$("#MainContent").empty();
		loadProdutos(1);
	});
}

function editServico(id){
	db.services.get(id, function(service){
		db.services.put({
			id: service['id'],
			name: $("#servico_nome").val(),
			image: $("#servico_foto").val(),
			description: $("#servico_desc").val(),
			price: $("#servico_preco").val()
		});

		alert("Serviço alterado com sucesso.");
		$("#MainContent").empty();
		loadServicos();
	});
}

async function editUserData(){
	db.clients.put({
		id: sessionUser['id'],
		name: $("#usuario_nome").val(),
		addr: $("#usuario_endereco").val(),
		image: $("#usuario_foto").val(),
		tel: $("#usuario_tel").val(),
		email: $("#usuario_email").val(),
		username: $("#usuario_user").val(),
		password: $("#usuario_password").val()
	});

	alert("Cadastro alterado com sucesso.");
}

async function addProduto(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.products.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

	let reader = new FileReader();
	reader.onloadend = function(){
		db.products.put({
			id: id,
			name: $("#produto_nome").val(),
			image: reader.result,
			description: $("#produto_desc").val(),
			price: $("#produto_preco").val(),
			inStock: $("#produto_estoque").val(),
			sold: 0
		});

		alert("Produto adicionado com sucesso.");
	}
	reader.readAsDataURL($("#produto_foto").prop("files")[0]);
}

async function addAnimal(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.pets.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

	let reader = new FileReader();
	reader.onloadend = function(){
		db.pets.put({
			id: id,
			name: $("#animal_nome").val(),
			image: reader.result,
			species: $("#animal_especie").val(),
			breed: $("#animal_raca").val(),
			age: $("#animal_idade").val(),
			description: $("#animal_desc").val(),
			notes: $("#animal_obs").val(),
			ownerId: sessionUser['id']
		});

		alert("Animal adicionado com sucesso à sua lista de animais.");
	}
	reader.readAsDataURL($("#animal_foto").prop("files")[0]);
}

async function addAdmin(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.admins.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
	
	let reader = new FileReader();
	reader.onloadend = function(){
		db.admins.put({
			id: id,
			name: $("#admin_nome").val(),
			image: reader.result,
			tel: $("#admin_tel").val(),
			email: $("#admin_email").val(),
			username: $("#admin_user").val(),
			password: $("#admin_password").val()
		});

		alert("Usuário administrador criado com sucesso.");
	}
	reader.readAsDataURL($("#admin_foto").prop("files")[0]);
}

async function addUser(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.clients.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
	
	let reader = new FileReader();
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
		});

		alert("Usuário criado com sucesso.");
	}
	reader.readAsDataURL($("#usuario_foto").prop("files")[0]);
}

async function addServico(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.services.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
	
	let reader = new FileReader();
	reader.onloadend = function(){
		db.services.put({
			id: id,
			name: $("#servico_nome").val(),
			image: reader.result,
			description: $("#servico_desc").val(),
			price: $("#servico_preco").val()
		});

		alert("Serviço adicionado com sucesso.");
	}
	reader.readAsDataURL($("#servico_foto").prop("files")[0]);
}

async function addAppointment(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.appointments.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

	db.appointments.put({
		id: id,
		serviceId: parseInt($("#select_servico").val()),
		userId: sessionUser['id'],
		petId: parseInt($("#select_animal").val()),
		day: $("#date").val(),
		time: $("#Horarios input[name=time_schedule]:checked").val()
	});

	alert("Serviço agendado com sucesso.");
	loadServicosHorarios();
}

function addCarrinho(id){
	if (carrinho.get(id) === undefined) carrinho.set(id, parseInt($("#quantidade_"+id.toString()).val()));
	else carrinho.set(id, carrinho.get(id) + parseInt($("#quantidade_"+id.toString()).val()));
}

async function removeProduto(id){
	db.products.delete(id);
	loadProdutos(1);
}

async function removeServico(id){
	db.services.delete(id);
	loadServicos();
}

function showAnimal(id){
	db.pets.get(parseInt(id), function(pet){
	$("#MainContent").load("src/usuario_animais_info.html", function(responseTxt, statusTxt, xhr){
		$("#info_img").attr('src', pet['image']);
		$("#info_name").html(pet['name']);
		$("#info_esp").html(pet['species']);
		$("#info_raca").html(pet['breed']);
		$("#info_ida").html(pet['age']);
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
	};
}


/*
Funcoes para a mudanca
de paginas na SPA
*/
async function login_out(in_out){
	if (in_out === 0){
		let username = $("#User").val();
		let password = $("#Password").val();

		let user = await db.clients.get({username: username});
		if (user !== undefined && user['password'] === password){
			$("#Top").load("src/logged_top.html");
			$("#Menu").load("src/usuario_menu.html");
			sessionUser = user;
			$("#Content").empty();
			loadProdutos(0);
		}
		else{
			user = await db.admins.get({username: username});
			if (user !== undefined && user['password'] === password){
				$("#Top").load("src/logged_top.html");
				$("#Menu").load("src/admin_menu.html");
				sessionUser = user;
				jQuery.ajaxSetup({async:false});
				$("#Content").load("src/admin_cadastro.html");
				$("#MainContent").load("src/admin_cadastro_cliente.html");
				jQuery.ajaxSetup({async:true});
			}
			else alert("Usuário ou Senha inválidos");
		}
	}
	else $("body").load("index.html");
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
		loadUserData();
		});
	}
	else if (page === 3){
		$("#Content").load("src/usuario_animais.html", function(responseTxt, statusTxt, xhr){
		$("#MainContent").empty();
		loadAnimais();
		});
	}
	else if (page === 4){
		$("#Content").empty();
		loadCarrinho();
	}
}

function changeAdminPage(page){
	if (page === 0){
		jQuery.ajaxSetup({async:false});
		$("#Content").load("src/admin_cadastro.html");
		$("#MainContent").load("src/admin_cadastro_cliente.html");
		jQuery.ajaxSetup({async:true});
	}
	else if (page === 1){
		jQuery.ajaxSetup({async:false});
		$("#Content").load("src/admin_produtos.html");
		$("#MainContent").load("src/admin_produtos_adicionar.html");
		jQuery.ajaxSetup({async:true});
	}
	else if (page === 2){
		jQuery.ajaxSetup({async:false});
		$("#Content").load("src/admin_servicos.html");
		$("#MainContent").load("src/admin_servicos_adicionar.html");
		jQuery.ajaxSetup({async:true});
	}
	else if (page === 3){
		$("#Content").load("src/admin_lucros.html");
	}
}

function animaisSidebar(page){
	if (page === 0){
		$("#MainContent").empty();
		loadAnimais();
	}
	else{
		$("#MainContent").load("src/usuario_animais_cadastro.html");
	}
}

function adminCadastroSidebar(page){
	if (page === 0){
		$("#MainContent").load("src/admin_cadastro_cliente.html");
	}
	else{
		$("#MainContent").load("src/admin_cadastro_admin.html");
	}
}

function adminProdutosSidebar(page){
	if (page === 0){
		$("#MainContent").load("src/admin_produtos_adicionar.html");
	}
	else{
		$("#MainContent").empty();
		loadProdutos(1);
	}
}

function adminServicosSidebar(page){
	if (page === 0){
		$("#MainContent").load("src/admin_servicos_adicionar.html");
	}
	else{
		$("#MainContent").empty();
		loadServicos();
	}
}