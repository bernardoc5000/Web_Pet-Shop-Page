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

async function loadProdutos(page){
	let products = await db.products.toArray();
	let line = "";
	for (let i=0; i<products.length; i++){
		product = products[i];
		line += "<div class=\"Item\">";
		line += "<ul class=\"Product\">";
		line += "<li class=\"ProductImage\"><img src=\"" + product['image'] + "\" alt=\"res/areia_gato.png\"></img></li>";
		line += "<li class=\"ProductDescription\">" + product['name'] + "</li>";
		line += "<li class=\"ProductDescription\">" + product['description'] + "</li>";
		line += "<li class=\"ProductValue\">R$ " + product['price'] + "</li>";
		if (page === 0){
			line += "<li class=\"ProductValue\">Quantidade: <input id=\"quantidade_\"" + product['id'].toString() + "\" type=\"number\" name=\"Quantidade\" value=\"Quantidade\"></input></li>";
			line += "<li><input type=\"button\" name=\"Adicionar ao Carrinho\" value=\"Adicionar ao Carrinho\" class=\"ProductButton\" onclick=\"addCarrinho(" + product['id'].toString() + ")\"></input></li>";
		}
		else{
			line += "<li><input type=\"button\" name=\"Editar\" value=\"Editar\" class=\"ProductButton\" onclick=\"editProduto(" + product['id'].toString() + ")\"></input></li>";
			line += "<li><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeProduto(" + product['id'].toString() + ")\"></input></li>";
		}
		line += "</ul>";
		line += "</div>";
	}

	if (page==0) $("#Content").html(line);
	else $("#MainContent").html(line);
}

async function loadServicos(page){
	let services = await db.services.toArray();
	let line = "";
	for (let i=0; i<services.length; i++){
		service = services[i];
		line += "<div class=\"Item\">";
		line += "<ul class=\"Product\">";
		line += "<li class=\"ProductImage\"><img src=\"" + service['image'] + "\" alt=\"res/areia_gato.png\"></img></li>";
		line += "<li class=\"ProductDescription\">" + service['name'] + "</li>";
		line += "<li class=\"ProductDescription\">" + service['description'] + "</li>";
		line += "<li class=\"ProductValue\">R$ " + service['price'] + "</li>";
		line += "<li><input type=\"button\" name=\"Editar\" value=\"Editar\" class=\"ProductButton\" onclick=\"editServico(" + service['id'].toString() + ")\"></input></li>";
		line += "<li><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeServico(" + service['id'].toString() + ")\"></input></li>";
		line += "</ul>";
		line += "</div>";
	}

	$("#MainContent").html(line);
}

function loadUserData(){
	$("#usuario_nome").val(sessionUser['name']);
	$("#usuario_endereco").val(sessionUser['addr']);
	$("#usuario_tel").val(sessionUser['tel']);
	$("#usuario_email").val(sessionUser['email']);
	$("#usuario_user").val(sessionUser['username']);
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
		line += "<li><input type=\"button\" name=\"Ver Informações\" value=\"Ver Informações\" class=\"ProductButton\" onclick=\"showPet(" + pet['id'].toString() + ")\"></li>";
		line += "</ul>";
		line += "</div>";
	}

	$("#MainContent").html(line);
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

	db.products.put({
		id: id,
		name: $("#produto_nome").val(),
		image: $("#produto_foto").val(),
		description: $("#produto_desc").val(),
		price: $("#produto_preco").val(),
		inStock: $("#produto_estoque").val(),
		sold: 0
	});

	alert("Produto adicionado com sucesso.");
}

async function addAnimal(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.pets.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

	db.pets.put({
		id: id,
		name: $("#animal_nome").val(),
		image: $("#animal_foto").val(),
		species: $("#animal_especie").val(),
		breed: $("#animal_raca").val(),
		age: $("#animal_idade").val(),
		description: $("#animal_desc").val(),
		notes: $("#animal_obs").val(),
		ownerId: sessionUser['id']
	});

	alert("Animal adicionado com sucesso à sua lista de animais.");
}

async function addAdmin(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.admins.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
	
	db.admins.put({
		id: id,
		name: $("#admin_nome").val(),
		image: $("#admin_foto").val(),
		tel: $("#admin_tel").val(),
		email: $("#admin_email").val(),
		username: $("#admin_user").val(),
		password: $("#admin_password").val()
	});

	alert("Usuário administrador criado com sucesso.");
}

async function addUser(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.clients.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
	
	db.clients.put({
		id: id,
		name: $("#usuario_nome").val(),
		addr: $("#usuario_endereco").val(),
		image: $("#usuario_foto").val(),
		tel: $("#usuario_tel").val(),
		email: $("#usuario_email").val(),
		username: $("#usuario_user").val(),
		password: $("#usuario_password").val()
	});

	alert("Usuário criado com sucesso.");
}

async function addServico(){
	let id = parseInt(2147483648*Math.random());
	while ((await db.services.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
	
	db.services.put({
		id: id,
		name: $("#servico_nome").val(),
		image: $("#servico_foto").val(),
		description: $("#servico_desc").val(),
		price: $("#servico_preco").val()
	});

	alert("Serviço adicionado com sucesso.");
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

async function removeProduto(id){
	db.products.delete(id);
	loadProdutos(1);
}

async function removeServico(id){
	db.services.delete(id);
	loadServicos(1);
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
		$("#Content").load("src/usuario_servicos.html");
		loadServicosOptions();
		loadServicosHorarios();
	}
	else if (page === 2){
		$("#Content").load("src/usuario_cadastro.html");
		loadUserData();
	}
	else if (page === 3){
		jQuery.ajaxSetup({async:false});
		$("#Content").load("src/usuario_animais.html");
		$("#MainContent").empty();
		jQuery.ajaxSetup({async:true});
		loadAnimais();
	}
	else if (page === 4){
		$("#Content").load("src/usuario_carrinho.html");
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
		loadServicos(1);
	}
}