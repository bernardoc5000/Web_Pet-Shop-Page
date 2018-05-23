function login() {
	let user = $("#User").val();
	let psw = $("#Password").val();

	if(user.localeCompare("user") == 0 && psw.localeCompare("user") == 0){
		$("body").load("src/usuario_general.html")
		$("#Content").load("src/usuario_compras.html")
	}
	else{
		$("body").load("src/usuario_general.html")
		$("#Content").load("src/usuario_compras.html")
	}
}