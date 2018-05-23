function login() {
	let user = $("#User").val();
	let psw = $("#Password").val();

	if(user.localeCompare("user") == 0 && psw.localeCompare("user") == 0) location.href = "usuario_compras.html";
	else if(user.localeCompare("admin") == 0 && psw.localeCompare("admin") == 0) location.href = "admin_cadastro.html";
}