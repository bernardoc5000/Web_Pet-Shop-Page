/*
Inicializacao
*/
var sessionUser = undefined;
var carrinho = new Map();
var reader = new FileReader();



function sendJSON(endpoint, data, onSuccess){
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: document.location.origin + "/" + endpoint,
		success: onSuccess
	});
}

function recvJSON(endpoint, onSuccess){
	$.ajax({
		type: 'GET',
		contentType: 'application/json',
		url: document.location.origin + "/" + endpoint,
		success: onSuccess
	});
}



/*
Funcoes que manipulam a pagina
a partir do banco de dados
*/
//Gera a lista de produtos a partir do BD para 2 paginas diferentes 
function loadProdutos(page){
	recvJSON("loadProdutos", function(data){
		let line = "";
		for (let i=0; i<data.length; i++){
			let product = data[i];
			line += "<div class=\"Item\">";
			line += "<ul class=\"Product\">";
			line += "<li class=\"ProductImage\"><img src=\"" + product['image'] + "\" alt=\"res/blank.png\"></img></li>";
			line += "<li class=\"ProductDescription\">" + product['name'] + "</li>";
			line += "<li class=\"ProductDescription\">" + product['description'] + "</li>";
			line += "<li class=\"ProductDescription\">R$ " + product['price'] + "</li>";
			if (page === 0){
				line += "<li class=\"ProductValue\">Quantidade: <input id=\"quantidade_" + product['_id'].toString() + "\" type=\"number\" name=\"Quantidade\" value=\"Quantidade\" min=\"1\" required></input></li>";
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Adicionar ao Carrinho\" value=\"Adicionar ao Carrinho\" class=\"ProductButton\" onclick=\"addCarrinho(\'" + product['_id'].toString() + "\')\"></input></li>";
			}
			else{
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Editar\" value=\"Editar\" class=\"ProductButton\" onclick=\"loadEditProduto(\'" + product['_id'].toString() + "\')\"></input></li>";
				line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeProduto(\'" + product['_id'].toString() + "\')\"></input></li>";
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
	recvJSON("loadServicos", function(services){
		let line = "";
		for (let i=0; i<services.length; i++){
			service = services[i];
			line += "<div class=\"Item\">";
			line += "<ul class=\"Product\">";
			line += "<li class=\"ProductImage\"><img src=\"" + service['image'] + "\" alt=\"res/blank.png\"></img></li>";
			line += "<li class=\"ProductDescription\">" + service['name'] + "</li>";
			line += "<li class=\"ProductDescription\">" + service['description'] + "</li>";
			line += "<li class=\"ProductDescription\">R$ " + service['price'] + "</li>";
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Editar\" value=\"Editar\" class=\"ProductButton\" onclick=\"loadEditServico(\'" + service['_id'].toString() + "\')\"></input></li>";
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeServico(\'" + service['_id'].toString() + "\')\"></input></li>";
			line += "</ul>";
			line += "</div>";
		}

		$("#MainContent").html(line);
	});
}

//Gera a lista de opcoes de servicos a partir do BD
function loadServicosOptions(){
	recvJSON("loadServicosOptionsServices", function(services){
		let line = "";
		for (let i=0; i<services.length; i++){
			service = services[i];
			line += "<option value=\'" + service['_id'].toString() + "\'>" + service['name'] + " - R$" + service['price'] + "</option>";
		}
		$("#select_servico").html(line);
	});

	sendJSON("loadServicosOptionsPets", {sessionUserId: sessionUser['_id']}, function(pets){
		let line = ""
		for (let i=0; i<pets.length; i++){
			pet = pets[i];
			line += "<option value=\'" + pet['_id'].toString() + "\'>" + pet['name'] + "</option>";
		}
		$("#select_animal").html(line);
	});
}

//Gera a lista de horarios disponiveis a partir do BD
function loadServicosHorarios(){
	for (let horario=8; horario<=16; horario++){
		$("#hr_"+horario.toString()).attr('disabled', false);
		$("#hr_"+horario.toString()).prop("checked", false);
		if (horario >= 10) $("#lb_hr_"+horario.toString()).html(horario.toString() + ":00");
		else $("#lb_hr_"+horario.toString()).html("0" + horario.toString() + ":00");
	}

	sendJSON("loadServicosHorariosAppointment", {day: $("#date").val()}, function(occupied){
		for (let i=0; i<occupied.length; i++){
			$("#hr_"+occupied[i]['time']).attr('disabled', true);
			sendJSON("loadServicosHorariosService", {serviceId: occupied[i]['serviceId']}, function(service){
				sendJSON("loadServicosHorariosPet", {petId: occupied[i]['petId']}, function(pet){
					let timeString = occupied[i]['time'];
					if (parseInt(timeString) < 10) timeString = "0" + timeString;
					$("#lb_hr_"+occupied[i]['time']).html(timeString + ":00 - Ocupado   →   <img class=\"ServicoImage\" src=\"" + service['image'] + "\" alt=\"res/blank.png\">(" + service['name'] + ") para " + pet['name']);
				});
			});
		}
	});
}

//Gera a lista de animais a partir do BD
function loadAnimais(){
	sendJSON("loadAnimais", {ownerId: sessionUser['_id']}, function(pets){
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
			line += "<li class=\"ProductButtonLine\"><input type=\"button\" name=\"Ver Informações\" value=\"Ver Informações\" class=\"ProductButton\" onclick=\"showAnimal(\'" + pet['_id'].toString() + "\')\"></li>";
			line += "</ul>";
			line += "</div>";
		}

		$("#MainContent").html(line);
	});
}

//Gera a tabela do carrinho a partir do mapa
function loadCarrinho(){
	let tot = 0;
	let line = 	"<tr>";
	line += "<th>Foto</th>";
	line += "<th>Produto</th>";
	line += "<th>Quantidade</th>";
	line += "<th>Preço unid.</th>";
	line += "<th>Valor total</th>";
	line += "<th>Remover</th>";
	line += "</tr>";
	for (let id of carrinho.keys()){
		sendJSON("loadCarrinho", {productId: id}, function(product){
			tot += carrinho.get(id)*product['price'];
			line += "<tr>";
			line += "<td><img src=\"" + product['image'] + "\"></td>";
			line += "<td>" + product['description'] + "</td>";
			line += "<td>" + carrinho.get(id).toString() + "</td>";
			line += "<td>" + product['price'].toString() + "</td>";
			line += "<td>" + (carrinho.get(id)*product['price']).toString() + "</td>";
			line += "<td><input type=\"button\" name=\"Remover\" value=\"Remover\" class=\"ProductButton\" onclick=\"removeCarrinho(" + id.toString() +")\"></td>";
			line += "</tr>";
		});
	}
	line += "<tr>";
	line += "<td>Total a pagar: </td>";
	line += "<td></td>";
	line += "<td></td>";
	line += "<td></td>";
	line += "<td>" + tot.toString() + "</td>";
	line += "<td></td>";
	line += "</tr>";
	$("#carrinho").html(line);
}

//Mostra a pagina de edicao do servico
function loadEditServico(id){
	$("#MainContent").load("src/admin_servicos_adicionar.html", function(responseTxt, statusTxt, xhr){
		$("#submit_button").attr('onclick', "editServico(\'" + id.toString() + "\')");
		$("#submit_button").attr('value', "Salvar");
		$("#add_servico").append("<input type=\"button\" name=\"SubmitButton\" value=\"Cancelar\" class=\"Button\" onclick=\"loadServicos();\">");
		loadServiceData(id);
	});
}

//Mostra a pagina de edicao do produto
function loadEditProduto(id){
	$("#MainContent").load("src/admin_produtos_adicionar.html", function(responseTxt, statusTxt, xhr){
		$("#submit_button").attr('onclick', "editProduto(\'" + id.toString() + "\')");
		$("#submit_button").attr('value', "Salvar");
		$("#add_produto").append("<input type=\"button\" name=\"SubmitButton\" value=\"Cancelar\" class=\"Button\" onclick=\"loadProdutos(1);\">");
		loadProductData(id);
	});
}

//Mostra a pagina de lucros
function loadLucros(){
	recvJSON("loadLucrosProductsSales", function(sales){
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

	recvJSON("loadLucrosServicesSales", function(sales){
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
	sendJSON("loadProductData", {productId: id}, function(product){
		$("#produto_nome").val(product['name']);
		$("#produto_preco").val(product['price']);
		$("#produto_estoque").val(product['inStock']);
		$("#produto_desc").val(product['description']);
	});
}

//Seta os valores do servico na pagina da edicao antes da edicao
function loadServiceData(id){
	sendJSON("loadServiceData", {serviceId: id}, function(service){
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
			let product = {
				_id: id,
				name: $("#produto_nome").val(),
				description: $("#produto_desc").val(),
				price: parseFloat($("#produto_preco").val()),
				inStock: parseInt($("#produto_estoque").val())
			};
			sendJSON("editProduto", product, function(data){
				if(data.success){
					$("#MainContent").empty();
					loadProdutos(1);
					alert("Produto alterado com sucesso.");
				}
				else alert("Erro ao alterar produto.");
			});
		}
		else{
			reader.onloadend = function(){
				let product = {
					_id: id,
					name: $("#produto_nome").val(),
					image: reader.result,
					description: $("#produto_desc").val(),
					price: parseFloat($("#produto_preco").val()),
					inStock: parseInt($("#produto_estoque").val())
				};
				sendJSON("editProduto", product, function(data){
					if(data.success){
						$("#MainContent").empty();
						loadProdutos(1);
						alert("Produto alterado com sucesso.");
					}
					else alert("Erro ao alterar produto.");
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
			let service = {
				_id: id,
				name: $("#servico_nome").val(),
				description: $("#servico_desc").val(),
				price: parseFloat($("#servico_preco").val())
			};
			sendJSON("editServico", service, function(data){
				if(data.success){
					$("#MainContent").empty();
					loadServicos();
					alert("Serviço alterado com sucesso.");
				}
				else alert("Erro ao alterar o serviço.");
			});
		}
		else{
			reader.onloadend = function(){
				let service = {
					_id: id,
					name: $("#servico_nome").val(),
					image: reader.result,
					description: $("#servico_desc").val(),
					price: parseFloat($("#servico_preco").val())
				};
				sendJSON("editServico", service, function(data){
					if(data.success){
						$("#MainContent").empty();
						loadServicos();
						alert("Serviço alterado com sucesso.");
					}
					else alert("Erro ao alterar o serviço.");
				});
			};
			reader.readAsDataURL($("#servico_foto").prop("files")[0]);
		}
	}
}

//Altera o usuario no BD
function editUser(){
	if($("#usuario_cadastro")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		if($("#usuario_foto").prop("files")[0] === undefined){
			let client = {
				_id: sessionUser['_id'],
				name: $("#usuario_nome").val(),
				addr: $("#usuario_endereco").val(),
				tel: $("#usuario_tel").val(),
				email: $("#usuario_email").val(),
				username: $("#usuario_user").val(),
				password: $("#usuario_password").val()
			};
			sendJSON("editUser", client, function(data){
				if(data.success){
					alert("Cadastro alterado com sucesso.");
					sessionUser['name'] = $("#usuario_nome").val();
					sessionUser['addr'] = $("#usuario_endereco").val();
					sessionUser['image'] = sessionUser['image'];
					sessionUser['tel'] = $("#usuario_tel").val();
					sessionUser['email'] = $("#usuario_email").val();
					sessionUser['username'] = $("#usuario_user").val();
					sessionUser['password'] = $("#usuario_password").val();
				}
				else alert("Erro ao alterar dados do usuário.")
			});
		}
		else{
			reader.onloadend = function(){
				let client = {
					_id: sessionUser['_id'],
					name: $("#usuario_nome").val(),
					addr: $("#usuario_endereco").val(),
					image: reader.result,
					tel: $("#usuario_tel").val(),
					email: $("#usuario_email").val(),
					username: $("#usuario_user").val(),
					password: $("#usuario_password").val()
				};
				sendJSON("editUser", client, function(data){
					if(data.success){
						alert("Cadastro alterado com sucesso.");
						sessionUser['name'] = $("#usuario_nome").val();
						sessionUser['addr'] = $("#usuario_endereco").val();
						sessionUser['image'] = sessionUser['image'];
						sessionUser['tel'] = $("#usuario_tel").val();
						sessionUser['email'] = $("#usuario_email").val();
						sessionUser['username'] = $("#usuario_user").val();
						sessionUser['password'] = $("#usuario_password").val();
					}
					else alert("Erro ao alterar dados do usuário.")
				});
			};
			reader.readAsDataURL($("#usuario_foto").prop("files")[0]);
		}
	}
}

//Adiciona o produto no BD
function addProduto(){
	if($("#add_produto")[0].checkValidity() === false || $("#produto_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		reader.onloadend = function(){
			let product = {
				name: $("#produto_nome").val(),
				image: reader.result,
				description: $("#produto_desc").val(),
				price: parseFloat($("#produto_preco").val()),
				inStock: parseInt($("#produto_estoque").val())
			};
			sendJSON("addProduto", product, function(data){
				if (data.success) alert("Produto adicionado com sucesso.");
				else alert("Erro ao adicionar o produto.");
			});
		}
		reader.readAsDataURL($("#produto_foto").prop("files")[0]);
	}
}

//Adiciona o servico no BD
function addServico(){
	if($("#add_servico")[0].checkValidity() === false || $("#servico_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		reader.onloadend = function(){
			let service = {
				name: $("#servico_nome").val(),
				image: reader.result,
				description: $("#servico_desc").val(),
				price: parseFloat($("#servico_preco").val())
			};
			sendJSON("addServico", service, function(data){
				if(data.success) alert("Serviço adicionado com sucesso.");
				else alert("Erro ao adicionar o serviço.");
			});
		}
		reader.readAsDataURL($("#servico_foto").prop("files")[0]);
	}
}

//Adiciona o usuario no BD
function addUser(){
	if($("#usuario_cadastro")[0].checkValidity() === false || $("#usuario_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		reader.onloadend = function(){
			let user = {
				name: $("#usuario_nome").val(),
				addr: $("#usuario_endereco").val(),
				image: reader.result,
				tel: $("#usuario_tel").val(),
				email: $("#usuario_email").val(),
				username: $("#usuario_user").val(),
				password: $("#usuario_password").val()
			};
			sendJSON("addUser", user, function(data){
				if(data.success) alert("Usuário criado com sucesso.");
				else alert("Erro ao adicionar o usuário.");
			});
		}
		reader.readAsDataURL($("#usuario_foto").prop("files")[0]);
	}
}

//Adiciona o animal no BD
function addAnimal(){
	if($("#animal_form")[0].checkValidity() === false || $("#animal_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		reader.onloadend = function(){
			let animal = {
				name: $("#animal_nome").val(),
				image: reader.result,
				species: $("#animal_especie").val(),
				breed: $("#animal_raca").val(),
				age: parseInt($("#animal_idade").val()),
				description: $("#animal_desc").val(),
				notes: $("#animal_obs").val(),
				ownerId: sessionUser['_id']
			};
			sendJSON("addAnimal", animal, function(data){
				if(data.success) alert("Animal adicionado com sucesso à sua lista de animais.");
				else alert("Erro ao adicionar o animal à sua lista de animais.");
			});
		}
		reader.readAsDataURL($("#animal_foto").prop("files")[0]);
	}
}

//Adiciona o administrador no BD
function addAdmin(){
	if($("#admin_form")[0].checkValidity() === false || $("#admin_foto").prop("files")[0] === undefined) alert("Dados Invalidos.");
	else{
		reader.onloadend = function(){
			let admin = {
				name: $("#admin_nome").val(),
				image: reader.result,
				tel: $("#admin_tel").val(),
				email: $("#admin_email").val(),
				username: $("#admin_user").val(),
				password: $("#admin_password").val()
			};
			sendJSON("addAdmin", admin, function(data){
				if(data.success) alert("Usuário administrador criado com sucesso.");
				else alert("Erro ao adicionar o usuário administrador.");
			});
		}
		reader.readAsDataURL($("#admin_foto").prop("files")[0]);
	}
}

//Adiciona o servico marcado no BD
function addAppointment(){
	if($("#Horarios")[0].checkValidity() === false || $("#time_form")[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		let appointment = {
			serviceId: $("#select_servico").val(),
			userId: sessionUser['_id'],
			petId: $("#select_animal").val(),
			day: $("#date").val(),
			time: $("#Horarios input[name=time_schedule]:checked").val()
		};
		sendJSON("addAppointment", appointment, function(data){
			if(data.success){
				addServiceSale($("#select_servico").val());
				alert("Serviço agendado com sucesso.");
			}
			else alert("Erro ao agendar o serviço.");
		});
		loadServicosHorarios();
	}
}

//Adiciona a venda do produto no BD
function addProductSale(productId, productQuantity){

	sendJSON("addProductSaleGetProduct", {productId: productId}, function(product){
		let productSale = {
			productId: productId,
			productName: product['name'],
			productPrice: product['price'],
			quantity: productQuantity,
			total: productQuantity *  product['price']
		};
		sendJSON("addProductSaleAdd", productSale, function(data){
			if(!data.success) alert("Erro ao adicionar produto na lista de lucros");
		});
	});
}

//Adiciona a venda do servico no BD
function addServiceSale(serviceId){

	sendJSON("addServiceSaleGetService", {serviceId: serviceId}, function(service){
		let serviceSale = {
			serviceId: serviceId,
			serviceName: service['name'],
			servicePrice: service['price']
		};
		sendJSON("addServiceSaleAdd", serviceSale, function(data){
			if(!data.success) alert("Erro ao adicionar serviço na lista de lucros");
		});
	});
}

//Adiciona o produto ao carrinho
function addCarrinho(id){
	if($("#quantidade_"+id.toString())[0].checkValidity() === false) alert("Dados Invalidos.");
	else{
		sendJSON("addCarrinho", {productId: id}, function(product){
			let cur = 0;
			if (carrinho.get(id) !== undefined) cur = carrinho.get(id);
			if (cur + parseInt($("#quantidade_"+id.toString()).val()) <= product['inStock']){
				carrinho.set(id, cur + parseInt($("#quantidade_"+id.toString()).val()));
				alert("Produtos adicionados ao carrinho com sucesso.");
			}
			else alert("Quantidade indisponível.\nQuantidade no carrinho: " + cur.toString() + "\nQuantidade máxima dispoível: " + product['inStock']);
		});
	}
}

//Remove o produto do BD
function removeProduto(id){
	sendJSON("removeProduto", {productId: id}, function(data){
		if(data.success) loadProdutos(1);
		else alert("Erro ao remover produto.");
	});
}

//Remove o servico do BD
function removeServico(id){
	sendJSON("removeServico", {serviceId: id}, function(data){
		if(data.success) loadServicos();
		else alert("Erro ao remover serviço.");
	});
}

//Remove o produto do carrinho
function removeCarrinho(id){
	carrinho.delete(id);
	loadCarrinho();
}

//Mostra as informacoes do animal
function showAnimal(id){
	sendJSON("showAnimal", {petId: id}, function(pet){
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
	sendJSON("updateStock", {productId: id, quantity: quantity}, function(data){
		if(!data.success) alert("Erro ao atualizar estoque.");
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
		sendJSON("login", {username: $("#User").val(), password: $("#Password").val()}, function(data) {
			if (data.type === "admin"){
				$("#Top").load("src/logged_top.html");
				$("#Menu").load("src/admin_menu.html");
				changeAdminPage(0);
				sessionUser = data.user;
			}
			else if (data.type === "client"){
				$("#Top").load("src/logged_top.html");
				$("#Menu").load("src/usuario_menu.html");
				changeUserPage(0);
				sessionUser = data.user;
			}
			else alert("Usuário ou Senha inválidos");
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