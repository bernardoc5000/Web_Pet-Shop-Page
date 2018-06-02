//Dexie.delete("petshop_database");
var db = new Dexie("petshop_database");
db.version(1).stores({
	admins: "id, name, image, tel, email, username, password",
	clients: "id, name, addr, image, tel, email, username, password",
	pets: "id, name, image, breed, age, ownerId",
	products: "id, name, image, description, price, inStock, sold",
	services: "id, name, image, description, price",
	appointments: "id, serviceId, userId, day, time"
});
db.open();
insertInitialAdmin();
insertInitialUser();
var sessionUser = undefined;



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

function loadUserData(div){
	if (sessionUser !== undefined){
		$(div + " #usuario_nome").val(sessionUser['name']);
		$(div + " #usuario_endereco").val(sessionUser['addr']);
		$(div + " #usuario_tel").val(sessionUser['tel']);
		$(div + " #usuario_email").val(sessionUser['email']);
		$(div + " #usuario_user").val(sessionUser['username']);
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
	}
	else alert("Senha Incorreta.");
}

function changeUserPage(page){
	if (page === 0){
		$("#Content").empty();
		loadProdutos("#Content");
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