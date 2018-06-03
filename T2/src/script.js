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
async function loadProdutos(div){
	let products = await db.products.toArray();
	for (let i=0; i<products.length; i++){
		product = products[i];
		let line = "<div class=\"Item\">";
		line += "<ul class=\"Product\">";
		line += "<li class=\"ProductImage\"><img src=\"" + product['image'] + "\" alt=\"res/areia_gato.png\"></img></li>";
		line += "<li class=\"ProductDescription\">" + product['name'] + "</li>";
		line += "<li class=\"ProductDescription\">" + product['description'] + "</li>";
		line += "<li class=\"ProductValue\">R$ " + product['price'] + "</li>";
		line += "<li class=\"ProductValue\">Quantidade: <input id=\"quantidade_\"" + product['id'].toString() + "\" type=\"number\" name=\"Quantidade\" value=\"Quantidade\"></input></li>";
		line += "<li><input type=\"button\" name=\"Adicionar ao Carrinho\" value=\"Adicionar ao Carrinho\" class=\"ProductButton\" onclick=\"addCarrinho(" + product['id'].toString() + ")\"></input></li>";
		line += "</ul>";
		line += "</div>";
		$(div).append(line);
	}
}

function loadUserData(div){
	if (sessionUser !== undefined){
		$(div + " #usuario_nome").val(sessionUser['name']);
		$(div + " #usuario_endereco").val(sessionUser['addr']);
		$(div + " #usuario_tel").val(sessionUser['tel']);
		$(div + " #usuario_email").val(sessionUser['email']);
		$(div + " #usuario_user").val(sessionUser['username']);
	}
}

async function loadServicosOptions(){
	let services = await db.services.toArray();
	let line = "";
	for (let i=0; i<services.length; i++){
		service = services[i];
		line += "<option value=\"" + service['id'].toString() + "\">" + service['name'] + "</option>";
	}
	$("#select_servico").html(line);

	let pets = await db.pets.where("ownerId").equals(sessionUser['id']);
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

async function saveData(){
	if (user !== undefined){
		db.clients.put({
			id: user['id'],
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
}

async function addProduto(opt){
	if (opt === 0){
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

		$("#produto_nome").val('');
		$("#produto_foto").val('');
		$("#produto_desc").val('');
		$("#produto_preco").val('');
		$("#produto_estoque").val('');
	}
	else{
		$("#produto_nome").val('');
		$("#produto_foto").val('');
		$("#produto_desc").val('');
		$("#produto_preco").val('');
		$("#produto_estoque").val('');
	}
}

async function addAnimal(opt){
	if(opt === 0){
		let user = await db.clients.get({username: sessionUser});
		let id = parseInt(2147483648*Math.random());
		while ((await db.pets.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
		if (user !== undefined){
			let file = document.createElement("input");
			file.setAttribute("type", "file");
			file.setAttribute("value", $("#animal_foto").val());
			db.pets.put({
				id: id,
				name: $("#animal_nome").val(),
				image: file.value,
				species: $("#animal_especie").val(),
				breed: $("#animal_raca").val(),
				age: $("#animal_idade").val(),
				description: $("#animal_desc").val(),
				notes: $("#animal_obs").val(),
				ownerId: user['id']
			});
		}
		alert("Animal adicionado com sucesso à sua lista de animais.");
		$("#animal_nome").val('');
		$("#animal_foto").val('');
		$("#animal_especie").val('');
		$("#animal_raca").val('');
		$("#animal_idade").val('');
		$("#animal_desc").val('');
		$("#animal_obs").val('');
	}

	else{
		$("#animal_nome").val('');
		$("#animal_foto").val('');
		$("#animal_especie").val('');
		$("#animal_raca").val('');
		$("#animal_idade").val('');
		$("#animal_desc").val('');
		$("#animal_obs").val('');
	}
}

async function addAdmin(opt){
	if(opt === 0){
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
		$("#admin_nome").val('');
		$("#admin_foto").val('');
		$("#admin_tel").val('');
		$("#admin_email").val('');
		$("#admin_user").val('');
		$("#admin_password").val('');
	}

	else{
		$("#admin_nome").val('');
		$("#admin_foto").val('');
		$("#admin_tel").val('');
		$("#admin_email").val('');
		$("#admin_user").val('');
		$("#admin_password").val('');
	}
}

async function addUser(opt){
	if(opt === 0){
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
		$("#usuario_nome").val('');
		$("#usuario_foto").val('');
		$("#usuario_endereco").val('');
		$("#usuario_tel").val('');
		$("#usuario_email").val('');
		$("#usuario_user").val('');
		$("#usuario_password").val('');
	}

	else{
		$("#usuario_nome").val('');
		$("#usuario_foto").val('');
		$("#usuario_endereco").val('');
		$("#usuario_tel").val('');
		$("#usuario_email").val('');
		$("#usuario_user").val('');
		$("#usuario_password").val('');
	}
}

async function addServico(opt){
	if(opt === 0){
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
		$("#servico_nome").val('');
		$("#servico_foto").val('');
		$("#servico_desc").val('');
		$("#servico_preco").val('');
	}

	else{
		$("#servico_nome").val('');
		$("#servico_foto").val('');
		$("#servico_desc").val('');
		$("#servico_preco").val('');
	}
}

async function addAppointment(){
	if (sessionUser !== undefined){
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
	}
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
			loadProdutos("#Content");
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
		loadProdutos("#Content");
	}
	else if (page === 1){
		$("#Content").load("src/usuario_servicos.html");
		loadServicosOptions();
		loadServicosHorarios();
	}
	else if (page === 2){
		$("#Content").load("src/usuario_cadastro.html");
		loadUserData("#Content");
	}
	else if (page === 3){
		jQuery.ajaxSetup({async:false});
		$("#Content").load("src/usuario_animais.html");
		$("#MainContent").load("src/usuario_animais_lista.html");
		jQuery.ajaxSetup({async:true});
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
		$("#MainContent").load("src/usuario_animais_lista.html");
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
		$("#MainContent").load("src/admin_produtos_editar_remover.html");
	}
}

function adminServicosSidebar(page){
	if (page === 0){
		$("#MainContent").load("src/admin_servicos_adicionar.html");
	}
	else{
		$("#MainContent").load("src/admin_servicos_editar_remover.html");
	}
}