//Dexie.delete("petshop_database");
var db = new Dexie("petshop_database");
db.version(1).stores({
	users: 'username, password, type'
});
db.users.put({username: "user", password: "user", type: 0});
db.users.put({username: "admin", password: "admin", type: 1});

async function login_out(in_out){
	if (in_out === 0){
		let user = await db.users.get($("#User").val());
		if (user !== undefined && user['password'] === $("#Password").val()){
			if (user['type'] === 0){
				$("#Top").load("src/logged_top.html");
				$("#Menu").load("src/usuario_menu.html");
				$("#Content").load("src/usuario_compras.html");
			}
			else{
				$("#Top").load("src/logged_top.html");
				$("#Menu").load("src/admin_menu.html");
				jQuery.ajaxSetup({async:false});
				$("#Content").load("src/admin_cadastro.html");
				$("#MainContent").load("src/admin_cadastro_cliente.html");
				jQuery.ajaxSetup({async:true});
			}
		}
		else alert("Usuário ou Senha inválidos");
	}
	else $("body").load("index.html");
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