function login_out(in_out) {
	if (in_out == 0){
		let user = $("#User").val();
		let psw = $("#Password").val();

		if (user.localeCompare("user") == 0 && psw.localeCompare("user") == 0){
			$("body").load("src/usuario_general.html");
			$("#Content").load("src/usuario_compras.html");
		}
		else{
			$("#Top").load("src/usuario_top.html");
			$("#Menu").load("src/usuario_menu.html");
			$("#Content").load("src/usuario_compras.html");
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
		$("#Content").load("src/usuario_animais_lista.html");
	}
	else if (page == 4){
		$("#Content").load("src/usuario_carrinho.html");
	}
}