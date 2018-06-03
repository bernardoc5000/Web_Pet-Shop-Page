Dexie.delete("petshop_database");
var sessionUser;
var sessionPass;
var db = new Dexie("petshop_database");
db.version(1).stores({
	admins: "id, name, image, tel, email, username, password",
	clients: "id, name, addr, image, tel, email, username, password",
	pets: "id, name, image, species, breed, age, description, notes, ownerId",
	products: "id, name, image, description, price, inStock, sold",
	services: "id, name, image, description, price"
});
db.open();
insertInitialAdmin();
insertInitialUser();



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
	}
	else{
		$("#produto_nome").val('');
		$("#produto_foto").val('');
		$("#produto_desc").val('');
		$("#produto_preco").val('');
		$("#produto_estoque").val('');
	}
}

async function loadProdutos(div){
	let products = await db.products.toArray();
	for (product in products){
		$(div).append("<div class=\"Item\">");
		$(div).append("<ul class=\"Product\">");
		$(div).append(("<li class=\"ProductImage\"><img src=\"").concat(product['image']).concat("\" alt=\"res/areia_gato.png\"></img></li>"));
		$(div).append(("<li class=\"ProductDescription\">").concat(product['description']).concat("</li>"));
		$(div).append(("<li class=\"ProductValue\">R$ ").concat(product['price']).concat("</li>"));
		$(div).append(("<li class=\"ProductValue\">Quantidade: <input id=\"quantidade_\"").concat(product['id'].toString()).concat("\" type=\"number\" name=\"Quantidade\" value=\"Quantidade\"></input></li>"));
		$(div).append(("<li><input type=\"button\" name=\"Adicionar ao Carrinho\" value=\"Adicionar ao Carrinho\" class=\"ProductButton\" onclick=\"addCarrinho(").concat(product['id'].toString()).concat(");\"></input></li>"));
		$(div).append("</ul>");
		$(div).append("</div>");
	}
}



async function login_out(in_out){
	if (in_out === 0){
		let username = $("#User").val();
		let password = $("#Password").val();

		sessionUser = username;
		sessionPass = password;

		let user = await db.clients.get({username: username});
		if (user !== undefined && user['password'] === password){
			$("#Top").load("src/logged_top.html");
			$("#Menu").load("src/usuario_menu.html");
			$("#Content").load("src/usuario_compras.html");
		}
		else{
			user = await db.admins.get({username: username});
			if (user !== undefined && user['password'] === password){
				$("#Top").load("src/logged_top.html");
				$("#Menu").load("src/admin_menu.html");
				jQuery.ajaxSetup({async:false});
				$("#Content").load("src/admin_cadastro.html");
				$("#MainContent").load("src/admin_cadastro_cliente.html");
				jQuery.ajaxSetup({async:true});
				loadProdutos("#Content");
			}
			else alert("Usuário ou Senha inválidos");
		}
	}
	else $("body").load("index.html");
}

async function loadUserData(div){
	let user = await db.clients.get({username: sessionUser});
	if (user !== undefined && user['password'] === sessionPass){
		$(div + " #usuario_nome").val(user['name']);
		$(div + " #usuario_endereco").val(user['addr']);
		$(div + " #usuario_tel").val(user['tel']);
		$(div + " #usuario_email").val(user['email']);
		$(div + " #usuario_user").val(user['username']);
	}
}

async function saveData(){
	let user = await db.clients.get({username: $("#usuario_user").val()});
	if (user !== undefined && user['password'] === $("#usuario_password").val()){
		let file = document.createElement("input");
		file.setAttribute("type", "file");
		file.setAttribute("value", "res/manager.png");
		let tel = document.createElement("input");
		tel.setAttribute("type", "tel");
		tel.setAttribute("value", $("#usuario_tel").val());
		let email = document.createElement("input");
		email.setAttribute("type", "email");
		email.setAttribute("value", $("#usuario_email").val());
		
		db.clients.put({
			id: 0,
			name: $("#usuario_nome").val(),
			addr: $("#usuario_endereco").val(),
			image: file.value,
			tel: tel.value,
			email: email.value,
			username: "user",
			password: "user"
		});

		alert("Cadastro alterado com sucesso.");
	}
	else alert("Senha Incorreta.");
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

function changeUserPage(page){
	if (page === 0){
		$("#Content").load("src/usuario_compras.html");
	}
	else if (page === 1){
		$("#Content").load("src/usuario_servicos.html");
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
	else if (page === 1){
		$("#MainContent").load("src/admin_produtos_remover.html");
	}
	else{
		$("#MainContent").load("src/admin_produtos_editar.html");
	}
}

function adminServicosSidebar(page){
	if (page === 0){
		$("#MainContent").load("src/admin_servicos_adicionar.html");
	}
	else if (page === 1){
		$("#MainContent").load("src/admin_servicos_remover.html");
	}
	else{
		$("#MainContent").load("src/admin_servicos_editar.html");
	}
}