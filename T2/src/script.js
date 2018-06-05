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
	appointments: "id, serviceId, userId, petId, day, time",
	productsSales: "id, productId, productName, productPrice, quantity, total",
	servicesSales: "id, serviceId, serviceName, servicePrice"
});
db.open();
insertInitialAdmin();
insertInitialUser();
var sessionUser = undefined;
var carrinho = new Map();
var reader = new FileReader();



/*
Funcoes temporarias para
inicializar o banco de dados com usuários
*/
async function insertInitialAdmin(){
	if ((await db.admins.get(0)) === undefined){		
		db.admins.put({
			id: 0,
			name: "Joao",
			image: "res/blank.png",
			tel: "5550000",
			email: "email@server.com",
			username: "admin",
			password: "admin"
		});
	}
}

async function insertInitialUser(){
	if ((await db.clients.get(0)) === undefined){
		db.clients.put({
			id: 0,
			name: "Joao",
			addr: "Rua x",
			image: "res/blank.png",
			tel: "5550000",
			email: "email@server.com",
			username: "user",
			password: "user"
		});
	}
}



/*
Funcoes que manipulam a pagina
a partir do banco de dados
*/
//Gera a lista de produtos a partir do BD para 2 paginas diferentes 
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
				line += "<li class=\"ProductValue\">Quantidade: <input id=\"quantidade_" + product['id'].toString() + "\" type=\"number\" name=\"Quantidade\" value=\"Quantidade\" min=\"0\" required></input></li>";
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Adicionar ao Carrinho\" value=\"Adicionar ao Carrinho\" class=\"ProductButton\" onclick=\"addCarrinho(" + product['id'].toString() + ")\"></input></li>";
			}
			else{
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Editar\" value=\"Editar\" class=\"ProductButton\" onclick=\"loadEditProduto(" + product['id'].toString() + ")\"></input></li>";
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeProduto(" + product['id'].toString() + ")\"></input></li>";
			}
			line += "</ul>";
			line += "</div>";
		}

		if (page==0) $("#Content").html(line);
		else $("#MainContent").html(line);
	});
}

//Gera a lista de servicos a partir do BD
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
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Editar\" value=\"Editar\" class=\"ProductButton\" onclick=\"loadEditServico(" + service['id'].toString() + ")\"></input></li>";
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeServico(" + service['id'].toString() + ")\"></input></li>";
			line += "</ul>";
			line += "</div>";
		}

		$("#MainContent").html(line);
	});
}

//Gera a lista de opcoes de servicos a partir do BD
function loadServicosOptions(){
	db.services.toArray(function(services){
		let line = "";
		for (let i=0; i<services.length; i++){
			service = services[i];
			line += "<option value=\"" + service['id'].toString() + "\">" + service['name'] + " - R$" + service['price'] + "</option>";
		}
		$("#select_servico").html(line);
	});

	db.pets.where("ownerId").equals(sessionUser['id']).toArray(function(pets){
		let line = ""
		for (let i=0; i<pets.length; i++){
			pet = pets[i];
			line += "<option value=\"" + pet['id'].toString() + "\">" + pet['name'] + "</option>";
		}
		$("#select_animal").html(line);
	});
}

//Gera a lista de horarios disponiveis a partir do BD
function loadServicosHorarios(){
	for (let horario=8; horario<=16; horario++){
		$("#hr_"+horario.toString()).attr('disabled', false);
		$("#hr_"+horario.toString()).prop("checked", false);
		$("#lb_hr_"+horario.toString()).html(horario.toString() + ":00");
	}

	db.appointments.where("day").equals($("#date").val()).toArray(function(occupied){
		for (let i=0; i<occupied.length; i++){
			let horario = occupied[i]['time'];
			$("#hr_"+horario).attr('disabled', true);
			$("#lb_hr_"+horario).html(horario + ":00 - Ocupado");
		}
	});
}

//Gera a lista de animais a partir do BD
function loadAnimais(){
	db.pets.where("ownerId").equals(sessionUser['id']).toArray(function(pets){
		let line = ""
		for (let i=0; i<pets.length; i++){
			pet = pets[i];
			line += "<div class=\"Item\">";
			line += "<ul class=\"Product\">";
			line += "<li class=\"ProductImage\"><img src=\"" + pet['image'] + "\" alt=\"res/blank.png\"></li>";
			line += "<li class=\"ProductDescription\">" + pet['name'] + "</li>";
			line += "<li class=\"ProductDescription\">" + pet['breed'] + "</li>";
			line += "<li class=\"ProductDescription\">" + pet['age'] + " ano(s) de idade</li>";
			line += "<li class=\"ProductValue\">" + pet['description']+ "</li>";
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Ver Informações\" value=\"Ver Informações\" class=\"ProductButton\" onclick=\"showAnimal(" + pet['id'].toString() + ")\"></li>";
			line += "</ul>";
			line += "</div>";
		}

		$("#MainContent").html(line);
	});
}

//Gera a tabela do carrinho a partir do mapa
async function loadCarrinho(){
	let line = 	"<tr>"
	line += "<th>Foto</th>"
	line += "<th>Produto</th>"
	line += "<th>Quantidade</th>"
	line += "<th>Remover</th>"
	line += "</tr>"
	for (let id of carrinho.keys()){
		let product = await db.products.get(id);
		line += "<tr>"
		line += "<td><img src=\"" + product['image'] + "\"></td>";
		line += "<td>" + product['description'] + "</td>";
		line += "<td>" + carrinho.get(id) + "</td>";
		line += "<td><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeCarrinho(" + id.toString() +")\"></td>";
		line += "</tr>";
	}
	$("#carrinho").html(line);
}

//Mostra a pagina de edicao do servico
function loadEditServico(id){
	$("#MainContent").load("src/admin_servicos_adicionar.html", function(responseTxt, statusTxt, xhr){
		$("#submit_button").attr('onclick', "editServico(" + id.toString() + ")");
		$("#submit_button").attr('value', "Salvar");
		$("#add_servico").append("<input type=\"button\" name=\"SubmitButton\" value=\"Cancelar\" class=\"Button\" onclick=\"loadServicos();\">");
		loadServiceData(id);
	});
}

//Mostra a pagina de edicao do produto
function loadEditProduto(id){
	$("#MainContent").load("src/admin_produtos_adicionar.html", function(responseTxt, statusTxt, xhr){
		$("#submit_button").attr('onclick', "editProduto(" + id.toString() + ")");
		$("#submit_button").attr('value', "Salvar");
		$("#add_produto").append("<input type=\"button\" name=\"SubmitButton\" value=\"Cancelar\" class=\"Button\" onclick=\"loadProdutos(1);\">");
		loadProductData(id);
	});
}

//Mostra a pagina de lucros
function loadLucros(){
	db.productsSales.toArray(function(sales){
		let line = "Produto\t\tQuantidade\t\tValor\n\n";
		let tot = 0;
		for (let i=0; i<sales.length; i++){
			sale = sales[i];
			tot +=  sale['total'];
			line += sale['productName'] + "\t\t" + sale['quantity'].toString() + "\t\t\t" + sale['total'].toString() + "\n";
		}
		line += "------------------------------------------------\n";
		line += "Total:\t\t\t\t\t" + tot.toString() + "\n";
		$("#lucro_produtos").html(line);
	});

	db.servicesSales.toArray(function(sales){
		let line = "Serviço\t\t\t\t\tValor\n\n";
		let tot = 0;
		for (let i=0; i<sales.length; i++){
			sale = sales[i];
			tot +=  sale['servicePrice'];
			line += sale['serviceName'] + "\t\t\t\t\t" + sale['servicePrice'].toString() + "\n";
		}
		line += "------------------------------------------------\n";
		line += "Total:\t\t\t\t\t" + tot.toString() + "\n";
		$("#lucro_servicos").html(line);
	});
}

//Seta os valores do usuario na pagina da edicao antes da edicao
function loadUserData(){
	$("#usuario_nome").val(sessionUser['name']);
	$("#usuario_endereco").val(sessionUser['addr']);
	$("#usuario_tel").val(sessionUser['tel']);
	$("#usuario_email").val(sessionUser['email']);
	$("#usuario_user").val(sessionUser['username']);
	$("#usuario_password").val(sessionUser['password']);
}

//Seta os valores do produto na pagina da edicao antes da edicao
function loadProductData(id){
	db.products.get(id, function(product){
		$("#produto_nome").val(product['name']);
		$("#produto_preco").val(product['price']);
		$("#produto_estoque").val(product['inStock']);
		$("#produto_desc").val(product['description']);
	});
}

//Seta os valores do servico na pagina da edicao antes da edicao
function loadServiceData(id){
	db.services.get(id, function(service){
		$("#servico_nome").val(service['name']);
		$("#servico_preco").val(service['price']);
		$("#servico_desc").val(service['description']);
	});
}

//Altera o produto no BD
function editProduto(id){
	if($("#add_produto")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		if($("#produto_foto").prop("files")[0] === undefined){
			db.products.update(id, {
				name: $("#produto_nome").val(),
				description: $("#produto_desc").val(),
				price: parseFloat($("#produto_preco").val()),
				inStock: parseInt($("#produto_estoque").val()),
			}).then(function(){

				$("#MainContent").empty();
				loadProdutos(1);
				alert("Produto alterado com sucesso.");
			});
		}
		else{
			reader.onloadend = function(){
				db.products.update(id, {
					name: $("#produto_nome").val(),
					image: reader.result,
					description: $("#produto_desc").val(),
					price: parseFloat($("#produto_preco").val()),
					inStock: parseInt($("#produto_estoque").val()),
				}).then(function(){

					$("#MainContent").empty();
					loadProdutos(1);
					alert("Produto alterado com sucesso.");
				});
			};
			reader.readAsDataURL($("#produto_foto").prop("files")[0]);
		}
	}
}

//Altera o servico no BD
function editServico(id){
	if($("#add_servico")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		if($("#servico_foto").prop("files")[0] === undefined){
			db.services.update(id, {
				name: $("#servico_nome").val(),
				description: $("#servico_desc").val(),
				price: parseFloat($("#servico_preco").val())
			}).then(function(){

				$("#MainContent").empty();
				loadServicos();
				alert("Serviço alterado com sucesso.");
			});
		}
		else{
			reader.onloadend = function(){
				db.services.update(id, {
					name: $("#servico_nome").val(),
					image: reader.result,
					description: $("#servico_desc").val(),
					price: parseFloat($("#servico_preco").val())
				}).then(function(){

					$("#MainContent").empty();
					loadServicos();
					alert("Serviço alterado com sucesso.");
				});
			}
			reader.readAsDataURL($("#servico_foto").prop("files")[0]);
		}
	}
}

//Altera o usuario no BD
function editUser(){
	if($("#usuario_cadastro")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		if($("#usuario_foto").prop("files")[0] === undefined){
			db.clients.update(sessionUser['id'], {
			name: $("#usuario_nome").val(),
			addr: $("#usuario_endereco").val(),
			tel: $("#usuario_tel").val(),
			email: $("#usuario_email").val(),
			username: $("#usuario_user").val(),
			password: $("#usuario_password").val()
			}).then(function(){

				alert("Cadastro alterado com sucesso.");
			});

			sessionUser['name'] = $("#usuario_nome").val();
			sessionUser['addr'] = $("#usuario_endereco").val();
			sessionUser['image'] = sessionUser['image'];
			sessionUser['tel'] = $("#usuario_tel").val();
			sessionUser['email'] = $("#usuario_email").val();
			sessionUser['username'] = $("#usuario_user").val();
			sessionUser['password'] = $("#usuario_password").val();
		}
		else{
			reader.onloadend = function(){
				db.clients.update(sessionUser['id'], {
					name: $("#usuario_nome").val(),
					addr: $("#usuario_endereco").val(),
					image: reader.result,
					tel: $("#usuario_tel").val(),
					email: $("#usuario_email").val(),
					username: $("#usuario_user").val(),
					password: $("#usuario_password").val()
				}).then(function(){
					
					alert("Cadastro alterado com sucesso.");
				});

				sessionUser['name'] = $("#usuario_nome").val();
				sessionUser['addr'] = $("#usuario_endereco").val();
				sessionUser['image'] = reader.result;
				sessionUser['tel'] = $("#usuario_tel").val();
				sessionUser['email'] = $("#usuario_email").val();
				sessionUser['username'] = $("#usuario_user").val();
				sessionUser['password'] = $("#usuario_password").val();
			}
			reader.readAsDataURL($("#usuario_foto").prop("files")[0]);
		}
	}
}

//Adiciona o produto no BD
async function addProduto(){
	if($("#add_produto")[0].checkValidity() === false || $("#produto_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.products.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

		reader.onloadend = function(){
			db.products.put({
				id: id,
				name: $("#produto_nome").val(),
				image: reader.result,
				description: $("#produto_desc").val(),
				price: parseFloat($("#produto_preco").val()),
				inStock: parseInt($("#produto_estoque").val()),
				sold: 0
			}).then(function(){

				alert("Produto adicionado com sucesso.");
			});
		}
		reader.readAsDataURL($("#produto_foto").prop("files")[0]);
	}
}

//Adiciona o servico no BD
async function addServico(){
	if($("#add_servico")[0].checkValidity() === false || $("#servico_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.services.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
		
		reader.onloadend = function(){
			db.services.put({
				id: id,
				name: $("#servico_nome").val(),
				image: reader.result,
				description: $("#servico_desc").val(),
				price: parseFloat($("#servico_preco").val())
			}).then(function(){

				alert("Serviço adicionado com sucesso.");
			});
		}
		reader.readAsDataURL($("#servico_foto").prop("files")[0]);
	}
}

//Adiciona o usuario no BD
async function addUser(){
	if($("#usuario_cadastro")[0].checkValidity() === false || $("#usuario_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.clients.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

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
			}).then(function(){

				alert("Usuário criado com sucesso.");
			});
		}
		reader.readAsDataURL($("#usuario_foto").prop("files")[0]);
	}
}

//Adiciona o animal no BD
async function addAnimal(){
	if($("#animal_form")[0].checkValidity() === false || $("#animal_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.pets.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

		reader.onloadend = function(){
			db.pets.put({
				id: id,
				name: $("#animal_nome").val(),
				image: reader.result,
				species: $("#animal_especie").val(),
				breed: $("#animal_raca").val(),
				age: parseInt($("#animal_idade").val()),
				description: $("#animal_desc").val(),
				notes: $("#animal_obs").val(),
				ownerId: sessionUser['id']
			}).then(function(){

				alert("Animal adicionado com sucesso à sua lista de animais.");
			});
		}
		reader.readAsDataURL($("#animal_foto").prop("files")[0]);
	}
}

//Adiciona o administrador no BD
async function addAdmin(){
	if($("#admin_form")[0].checkValidity() === false || $("#admin_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.admins.get(id)) !== undefined) id = parseInt(2147483648*Math.random());
		
		reader.onloadend = function(){
			db.admins.put({
				id: id,
				name: $("#admin_nome").val(),
				image: reader.result,
				tel: $("#admin_tel").val(),
				email: $("#admin_email").val(),
				username: $("#admin_user").val(),
				password: $("#admin_password").val()
			}).then(function(){

				alert("Usuário administrador criado com sucesso.");
			});
		}
		reader.readAsDataURL($("#admin_foto").prop("files")[0]);
	}
}

//Adiciona o servico marcado no BD
async function addAppointment(){
	if($("#Horarios")[0].checkValidity() === false || $("#time_form")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		let id = parseInt(2147483648*Math.random());
		while ((await db.appointments.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

		db.appointments.put({
			id: id,
			serviceId: parseInt($("#select_servico").val()),
			userId: sessionUser['id'],
			petId: parseInt($("#select_animal").val()),
			day: $("#date").val(),
			time: $("#Horarios input[name=time_schedule]:checked").val()
		}).then(function(){

			addServiceSale(parseInt($("#select_servico").val()));
			alert("Serviço agendado com sucesso.");
		});
		loadServicosHorarios();
	}
}

//Adiciona a venda do produto no BD
async function addProductSale(productId, productQuantity){
	let id = parseInt(2147483648*Math.random());
	while ((await db.productsSales.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

	db.products.get(productId, function(product){
		db.productsSales.put({
			id: id,
			productId: productId,
			productName: product['name'],
			productPrice: product['price'],
			quantity: productQuantity,
			total: productQuantity *  product['price']
		});
	});
}

//Adiciona a venda do servico no BD
async function addServiceSale(serviceId){
	let id = parseInt(2147483648*Math.random());
	while ((await db.servicesSales.get(id)) !== undefined) id = parseInt(2147483648*Math.random());

	db.services.get(serviceId, function(service){
		db.servicesSales.put({
			id: id,
			serviceId: serviceId,
			serviceName: service['name'],
			servicePrice: service['price'],
		});
	});
}

//Adiciona o produto ao carrinho
function addCarrinho(id){
	if($("#quantidade_"+id.toString())[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		db.products.get(id, function(product){
			if (carrinho.get(id) === undefined) carrinho.set(id, 0);
			if (carrinho.get(id) + parseInt($("#quantidade_"+id.toString()).val()) <= product['inStock']){
				carrinho.set(id, carrinho.get(id) + parseInt($("#quantidade_"+id.toString()).val()));
				alert("Produtos adicionados ao carrinho com sucesso.");
			}
			else alert("Quantidade indisponível.\nQuantidade no carrinho: " + carrinho.get(id).toString() + "\nQuantidade máxima dispoível: " + product['inStock']);
		});
	}
}

//Remove o produto do BD
function removeProduto(id){
	db.products.delete(id).then(function(){
		loadProdutos(1);
	});
}

//Remove o servico do BD
function removeServico(id){
	db.services.delete(id).then(function(){
		loadServicos();
	});
}

//Remove o produto do carrinho
function removeCarrinho(id){
	carrinho.delete(id);
	loadCarrinho();
}

//Mostra as informacoes do animal
function showAnimal(id){
	db.pets.get(parseInt(id), function(pet){
		$("#MainContent").load("src/usuario_animais_info.html", function(responseTxt, statusTxt, xhr){
			$("#info_img").attr('src', pet['image']);
			$("#info_name").html(pet['name']);
			$("#info_esp").html(pet['species']);
			$("#info_raca").html(pet['breed']);
			$("#info_ida").html(pet['age'].toString());
			$("#info_desc").html(pet['description']);
			$("#info_obs").html(pet['notes']);
		});
	});
}

//Atualiza os dados no BD apos a compra
function updateStock(id, quantity){
	db.products.get(id, function(product){
		db.products.update(id, {
			inStock: product['inStock'] - quantity,
			sold: product['sold'] + quantity
		});
	});
}

//Confirma a compra
function confirmSale(){
	if($("#cartao")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		for (let id of carrinho.keys()){
			addProductSale(id, carrinho.get(id));
			updateStock(id, carrinho.get(id));
			carrinho.delete(id);
		}
		loadCarrinho();
		alert("Compra finalizada com sucesso.");
	}
}

//Cancela a compra
function cancelSale(){
	for (let id of carrinho.keys()) carrinho.delete(id);
	loadCarrinho();
}


/*
Funcoes para a mudanca
de paginas na SPA
*/
//Funcao para login e logout
function login_out(in_out){
	if (in_out === 0){
		let username = $("#User").val();
		let password = $("#Password").val();

		db.clients.get({username: username}, function(user){
			if (user !== undefined && user['password'] === password){
				$("#Top").load("src/logged_top.html");
				$("#Menu").load("src/usuario_menu.html");
				changeUserPage(0);
				sessionUser = user;
			}
			else{
				db.admins.get({username: username}, function(adm){
					if (adm !== undefined && adm['password'] === password){
						$("#Top").load("src/logged_top.html");
						$("#Menu").load("src/admin_menu.html");
						changeAdminPage(0);
						sessionUser = adm;
					}
					else alert("Usuário ou Senha inválidos");
				});
			}
		});
	}
	else{
		$("body").load("index.html");
		sessionUser = undefined;
		carrinho = new Map();
	}
}

//Funcao para o menu superior do usuario
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
			$("#submit_button").attr('onclick', "editUser();");
			loadUserData();
		});
	}
	else if (page === 3){
		$("#Content").load("src/usuario_animais.html", function(responseTxt, statusTxt, xhr){
			animaisSidebar(0);
		});
	}
	else if (page === 4){
		$("#Content").load("src/usuario_carrinho.html", function(responseTxt, statusTxt, xhr){
			loadCarrinho();
		});
	}
}

//Funcao para o menu superior do administrador
function changeAdminPage(page){
	if (page === 0){
		$("#Content").load("src/admin_cadastro.html", function(responseTxt, statusTxt, xhr){
			adminCadastroSidebar(0);
		});
	}
	else if (page === 1){
		$("#Content").load("src/admin_produtos.html", function(responseTxt, statusTxt, xhr){
			adminProdutosSidebar(0);
		});
	}
	else if (page === 2){
		$("#Content").load("src/admin_servicos.html", function(responseTxt, statusTxt, xhr){
			adminServicosSidebar(0);
		});
	}
	else if (page === 3){
		$("#Content").load("src/admin_lucros.html", function(responseTxt, statusTxt, xhr){
			loadLucros();
		});
	}
}

//Funcao para a barra lateral da pagina de animais do usuario
function animaisSidebar(page){
	if (page === 0)$("#MainContent").load("src/usuario_animais_cadastro.html");
	else{
		$("#MainContent").empty();
		loadAnimais();
	}
}

//Funcao para a barra lateral da pagina de cadastro do administrador
function adminCadastroSidebar(page){
	if (page === 0){
		$("#MainContent").load("src/usuario_cadastro.html", function(responseTxt, statusTxt, xhr){
			$("#submit_button").attr('onclick', "addUser();");
		});
	}
	else $("#MainContent").load("src/admin_cadastro_admin.html");
}

//Funcao para a barra lateral da pagina de produtos do administrador
function adminProdutosSidebar(page){
	if (page === 0) $("#MainContent").load("src/admin_produtos_adicionar.html");
	else{
		$("#MainContent").empty();
		loadProdutos(1);
	}
}

//Funcao para a barra lateral da pagina de servicos do administrador
function adminServicosSidebar(page){
	if (page === 0) $("#MainContent").load("src/admin_servicos_adicionar.html");
	else{
		$("#MainContent").empty();
		loadServicos();
	}
}