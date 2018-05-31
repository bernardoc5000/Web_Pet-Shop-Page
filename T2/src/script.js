function login_out(in_out) {
	if (in_out == 0){
		let user = $("#User").val();
		let psw = $("#Password").val();

		if (user.localeCompare("user") == 0 && psw.localeCompare("user") == 0){
			$("#Top").load("src/logged_top.html");
			$("#Menu").load("src/usuario_menu.html");
			$("#Content").load("src/usuario_compras.html");
		}
		else if (user.localeCompare("admin") == 0 && psw.localeCompare("admin") == 0){
			$("#Top").load("src/logged_top.html");
			$("#Menu").load("src/admin_menu.html");
			$("#Content").load("src/admin_lucros.html");
		}
	}
	else{
		$("body").load("index.html");
	}
}

function changeUserPage(page){
	if (page == 0){
		$("#Content").load("src/usuario_compras.html");
	}
	else if (page == 1){
		$("#Content").load("src/usuario_servicos.html");
	}
	else if (page == 2){
		$("#Content").load("src/usuario_cadastro.html");
	}
	else if (page == 3){
		jQuery.ajaxSetup({async:false});
		$("#Content").load("src/usuario_animais.html");
		$("#MainContent").load("src/usuario_animais_lista.html");
		jQuery.ajaxSetup({async:true});
	}
	else if (page == 4){
		$("#Content").load("src/usuario_carrinho.html");
	}
}

function changeAdminPage(page){
	if (page == 0){
		$("#Content").load("src/admin_cadastro_cliente.html");
	}
	else if (page == 1){
		$("#Content").load("src/admin_produtos_adicionar.html");
	}
	else if (page == 2){
		$("#Content").load("src/admin_servicos_adicionar.html");
	}
	else if (page == 3){
		$("#Content").load("src/admin_lucros.html");
	}
}

function animaisSidebar(page){
	if (page == 0){
		$("#MainContent").load("src/usuario_animais_lista.html");
	}
	else{
		$("#MainContent").load("src/usuario_animais_cadastro.html");
	}
}