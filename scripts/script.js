document.addEventListener("DOMContentLoaded", () => {
	const tempo = document.getElementById("timer"),
		textoTempo = document.getElementById("texto-tempo"),
		score = document.getElementById("score"),
		level = document.getElementById("level"),
		mensagemFinal = document.getElementById("mensagem-final"),
		barra = document.getElementById("barra-progresso-inner"),
		barraProgresso = document.getElementById("barra-progresso");

	const play = document.getElementById("play"),
		coringa = document.getElementById("coringa"),
		rankingList = document.getElementById("ranking");

	const area = document.querySelector(".area"),
		booster = document.querySelector(".booster"),
		bola = document.querySelector(".bola");

	const somPositivo = new Audio("sons/somPositivo.wav"),
		somNegativo = new Audio("sons/somNegativo.wav"),
		sons = [
			new Audio("sons/pop-1.mp3"),
			new Audio("sons/pop-2.mp3"),
			new Audio("sons/pop-3.mp3"),
			new Audio("sons/pop-4.mp3"),
		];

	let pontos = 0,
		tempoRestante = 80,
		nivel = 1,
		moedasGanhas = 0;

	let attTempo,
		attDificuldade,
		boosterInterval,
		boosterPiscando,
		jogoAtivo = false,
		coringaAtivo = false,
		rainbowInterval;

	let totalClicks = 0,
		maxLevel = 1,
		totalBoosters = 0,
		coringaBoosters = 0,
		pontosPositivosBoosters = 0,
		pontosNegativosBoosters = 0,
		tempoExtraBoosters = 0,
		tempoReduzidoBoosters = 0,
		bolaMaiorBoosters = 0,
		bolaMenorBoosters = 0;

	let rankings = JSON.parse(localStorage.getItem("rankings")) || [];

	// Variáveis para armazenar a posição atual do mouse
	let mouseX = 0;
	let mouseY = 0;

	// Atualiza as coordenadas do mouse sempre que ele se move
	document.addEventListener("mousemove", (evento) => {
		mouseX = evento.clientX;
		mouseY = evento.clientY;
	});

	function moverElemento(elemento) {
		const margemSeguranca = Math.max(8 - (nivel - 1), 5);
		const altura =
			area.offsetHeight -
			elemento.offsetHeight -
			(2 * margemSeguranca * window.innerHeight) / 100;
		const largura =
			area.offsetWidth -
			elemento.offsetWidth -
			(2 * margemSeguranca * window.innerWidth) / 100;

		elemento.style.top = `${
			margemSeguranca + ((Math.random() * altura) / window.innerHeight) * 100
		}vh`;
		elemento.style.left = `${
			margemSeguranca + ((Math.random() * largura) / window.innerWidth) * 100
		}vw`;
	}

	function moverBola() {
		moverElemento(bola);
	}

	function atualizarPontos() {
		score.textContent = `Pontos: ${pontos}`;
		atualizarBarraProgresso();
	}

	function atualizarBarraProgresso() {
		const pontosParaProximoNivel = 10;
		const progresso =
			((pontos % pontosParaProximoNivel) / pontosParaProximoNivel) * 100;
		barra.style.width = `${progresso}%`;

		const cor = obterCorBarraProgresso(nivel);
		barra.style.backgroundColor = cor;
	}

	function ajustarDificuldade() {
		const { tamanho, intervalo } = obterDificuldade();
		bola.style.width = bola.style.height = tamanho;
		clearInterval(attDificuldade);
		attDificuldade = setInterval(moverBola, intervalo);
		atualizarNivel();
	}

	function obterDificuldade() {
		switch (true) {
			case pontos < 10:
				return { tamanho: "8vh", intervalo: 1000 };
			case pontos < 20:
				return { tamanho: "7vh", intervalo: 850 };
			case pontos < 30:
				return { tamanho: "6vh", intervalo: 700 };
			case pontos < 40:
				return { tamanho: "5vh", intervalo: 620 };
			default:
				return { tamanho: "4vh", intervalo: 550 };
		}
	}

	function atualizarNivel() {
		const novoNivel = Math.max(Math.floor(pontos / 10) + 1, 1);

		if (novoNivel !== nivel) {
			if (novoNivel > maxLevel) {
				maxLevel = novoNivel;
			}

			if (novoNivel > nivel) {
				somPositivo.play();
			} else {
				somNegativo.play();
			}

			nivel = novoNivel;
			level.textContent = `Nível: ${nivel}`;
			piscarElemento(level);
		}
	}

	function obterCorBarraProgresso(nivel) {
		switch (true) {
			case nivel === 1:
				return "#4CAF50";
			case nivel === 2:
				return "#2196F3";
			case nivel === 3:
				return "#FFC107";
			case nivel === 4:
				return "#FF9800";
			default:
				return "#F44336";
		}
	}

	function gerarBooster() {
		if (coringaAtivo || booster.style.display === "block") {
			return;
		}

		moverElemento(booster);
		booster.style.display = "block";

		boosterPiscando = setInterval(() => {
			booster.classList.toggle("blue");
		}, 300);

		setTimeout(() => {
			booster.style.display = "none";
			clearInterval(boosterPiscando);
		}, 3000);

		console.log("Booster gerado: " + calcularIntervaloBooster());
	}

	function aplicarEfeitoBooster() {
		const acao = Math.floor(Math.random() * 100);
		totalBoosters++;

		switch (true) {
			case acao < 5:
				coringaBoosters++;
				aplicarEfeitoCoringa();
				break;
			case acao < 20:
				pontosNegativosBoosters++;
				aplicarEfeitoPontos(-3);
				break;
			case acao < 35:
				pontosPositivosBoosters++;
				aplicarEfeitoPontos(3);
				break;
			case acao < 50:
				bolaMaiorBoosters++;
				mudarTamanhoBola(20);
				break;
			case acao < 65:
				bolaMenorBoosters++;
				mudarTamanhoBola(0.8);
				break;
			case acao < 85:
				tempoExtraBoosters++;
				aplicarEfeitoTempo(5);
				break;
			default:
				tempoReduzidoBoosters++;
				aplicarEfeitoTempo(-5);
				break;
		}
	}

	function piscarElemento(elemento) {
		let piscada = 0;
		const interval = setInterval(() => {
			if (elemento.style.visibility === "hidden") {
				elemento.style.visibility = "visible";
			} else {
				elemento.style.visibility = "hidden";
			}

			piscada++;

			if (piscada === 8 && jogoAtivo) {
				clearInterval(interval);
				elemento.style.visibility = "visible";
			} else if (!jogoAtivo) {
				clearInterval(interval);
				elemento.style.visibility = "hidden";
			}
		}, 250);
	}

	function iniciarPiscadaCoringa() {
		coringa.style.visibility = "visible";

		const piscadaCoringa = setInterval(() => {
			if (jogoAtivo) {
				if (coringa.style.visibility === "hidden") {
					coringa.style.visibility = "visible";
				} else {
					coringa.style.visibility = "hidden";
				}
			}
		}, 250);

		return () => {
			clearInterval(piscadaCoringa);
			coringa.style.visibility = "hidden";
		};
	}

	function aplicarEfeitoCoringa() {
		coringaAtivo = true;
		const adicionarOuSubtrair = Math.random() < 0.5 ? -1 : 1;
		const incremento = Math.floor(Math.random() * 7) + 3;

		pontos += incremento * adicionarOuSubtrair;
		tempoRestante = Math.max(
			0,
			tempoRestante + incremento * adicionarOuSubtrair
		);

		if (adicionarOuSubtrair > 0) {
			somPositivo.play();
		} else {
			somNegativo.play();
		}

		atualizarPontos();
		ajustarDificuldade();

		pararPiscadaCoringa = iniciarPiscadaCoringa();
		aplicarEfeitoVisualCoringa();

		piscarElemento(score);
		piscarElemento(tempo);

		setTimeout(() => {
			finalizarEfeitoCoringa();
		}, 8100);
	}

	function aplicarEfeitoVisualCoringa() {
		bola.style.width = "1.5vh";
		bola.style.height = "1.5vh";
		bola.style.transition = "all 0.1s ease";

		clearInterval(attDificuldade);
		attDificuldade = setInterval(moverBola, 200);

		bola.style.backgroundColor = "transparent";
		rainbowInterval = setInterval(() => {
			bola.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
		}, 100);
	}

	function finalizarEfeitoCoringa() {
		clearInterval(rainbowInterval);
		clearInterval(attDificuldade);
		pararPiscadaCoringa();

		bola.style.transition =
			"top 0.45s ease, left 0.45s ease, width 0.45s ease, height 0.45s ease, box-shadow 0.25s ease";
		bola.style.backgroundColor = localStorage.getItem("corBolaCustomizada");

		ajustarDificuldade();
		coringaAtivo = false;
	}

	function aplicarEfeitoPontos(quantidade) {
		pontos += quantidade;
		if (quantidade > 0) {
			somPositivo.play();
		} else {
			somNegativo.play();
		}

		atualizarPontos();
		ajustarDificuldade();
		piscarElemento(score);
	}

	function aplicarEfeitoTempo(quantidade) {
		tempoRestante = Math.max(0, tempoRestante + quantidade);
		if (quantidade > 0) {
			somPositivo.play();
		} else {
			somNegativo.play();
		}

		piscarElemento(tempo);
	}

	function mudarTamanhoBola(novoTamanho) {
		bola.style.width = `${novoTamanho}vh`;
		bola.style.height = `${novoTamanho}vh`;
		setTimeout(() => {
			ajustarDificuldade();
		}, 6000);
	}

	function iniciarJogo() {
		try {
			inicializarEstatisticas();
			configurarEstadoInicial();
			configurarVisualizacao();
			aplicarCustomizacoes();
			iniciarTempo = Date.now();
			attTempo = setInterval(controlarTempo, 1000);
			boosterInterval = setInterval(gerarBooster, calcularIntervaloBooster());
			moedasGanhas = 0;
			document.addEventListener("keydown", verificarTecla);
		} catch (erro) {
			console.error("Erro ao iniciar o jogo: ", erro);
		}
	}

	function controlarTempo() {
		tempoRestante = tempoRestante - 1;
		tempo.textContent = tempoRestante;
		if (tempoRestante < 0) {
			finalizarJogo();
			play.textContent = "Jogar";
		} else {
			atualizarCorTempo();
		}
	}

	function inicializarEstatisticas() {
		(totalClicks = 0),
			(maxLevel = 1),
			(totalBoosters = 0),
			(coringaBoosters = 0),
			(pontosPositivosBoosters = 0),
			(pontosNegativosBoosters = 0),
			(tempoExtraBoosters = 0),
			(tempoReduzidoBoosters = 0),
			(bolaMaiorBoosters = 0),
			(bolaMenorBoosters = 0);
	}

	function configurarEstadoInicial() {
		jogoAtivo = true;
		pontos = 0;
		tempoRestante = 80;
		nivel = 1;
		atualizarPontos();
		moverBola();
	}

	function configurarVisualizacao() {
		bola.style.display = "block";
		tempo.style.color = "#4caf50";
		mensagemFinal.style.visibility = "hidden";
		rankingList.style.visibility = "hidden";
		score.style.visibility = "visible";
		level.style.visibility = "visible";
		tempo.style.visibility = "visible";
		textoTempo.style.visibility = "visible";
		barraProgresso.style.visibility = "visible";
	}

	function calcularIntervaloBooster() {
		const intervaloMinimo = 7000;
		const intervaloMaximo = 12000;
		return (
			Math.random() * (intervaloMaximo - intervaloMinimo) + intervaloMinimo
		);
	}

	function aplicarCustomizacoes() {
		try {
			const borda = localStorage.getItem("bordaCustomizada");
			const corBola = localStorage.getItem("corBolaCustomizada");

			if (borda) {
				if (borda === "none") {
					bola.style.border = "none";
				} else {
					bola.style.border = `0.25vw solid ${borda}`;
				}
			}

			if (corBola) {
				if (corBola === "rainbow") {
					rainbowEfeito();
					bola.style.transition =
						"top 0.45s ease, left 0.45s ease, width 0.45s ease, height 0.45s ease, box-shadow 0.25s ease, background-color 0.3s ease";
				} else {
					bola.style.backgroundColor = corBola;
				}
			}
		} catch (erro) {
			console.error("Erro ao aplicar customizações: ", erro);
		}
	}

	function rainbowEfeito() {
		bola.style.backgroundColor = "transparent";
		return setInterval(() => {
			bola.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
		}, 120);
	}

	function finalizarJogo() {
		pararIntervalos();
		resetarEstadoJogo();
		resetarVisualizacao();
		atualizarRanking(pontos);
		atualizarRankingVisual();
		exibirMensagemFinal();

		// Remover evento de tecla
		document.removeEventListener("keydown", verificarTecla);
	}

	function pararIntervalos() {
		clearInterval(attTempo);
		clearInterval(attDificuldade);
		clearInterval(boosterInterval);
		clearInterval(boosterPiscando);
		clearInterval(rainbowInterval);
	}

	function resetarEstadoJogo() {
		jogoAtivo = false;
		nivel = 1;
		tempo.textContent = "80";
		level.textContent = "Nível: 1";
	}

	function resetarVisualizacao() {
		bola.style.width = "8vh";
		bola.style.height = "8vh";
		bola.style.transition =
			"top 0.45s ease, left 0.45s ease, width 0.45s ease, height 0.45s ease, box-shadow 0.25s ease";
		tempo.style.color = "white";

		booster.style.display = "none";
		bola.style.display = "none";
		coringa.style.visibility = "hidden";
		score.style.visibility = "hidden";
		level.style.visibility = "hidden";
		tempo.style.visibility = "hidden";
		textoTempo.style.visibility = "hidden";
		barraProgresso.style.visibility = "hidden";
	}

	function atualizarRanking(pontos) {
		try {
			const nomeJogador = localStorage.getItem("nomeJogador") || "Teste";

			let jogadorExistente = rankings.find(
				(jogador) => jogador.nome === nomeJogador
			);

			if (jogadorExistente) {
				if (pontos > jogadorExistente.pontos) {
					jogadorExistente.pontos = pontos;
				}
			} else {
				rankings.push({
					nome: nomeJogador,
					pontos: pontos,
				});
			}

			rankings.sort((a, b) => b.pontos - a.pontos);

			if (rankings.length > 10) {
				rankings = rankings.slice(0, 10);
			}

			localStorage.setItem("rankings", JSON.stringify(rankings));
		} catch (erro) {
			console.error("Erro ao atualizar o ranking:", erro);
		}
	}

	function atualizarRankingVisual() {
		rankingList.innerHTML = "";
		rankings.forEach((jogador, index) => {
			const rankingItem = document.createElement("li");
			rankingItem.textContent = `${index + 1}. ${jogador.nome} - ${
				jogador.pontos
			} pontos`;
			rankingList.appendChild(rankingItem);
		});
	}

	function exibirMensagemFinal() {
		const tempoJogado = (Date.now() - iniciarTempo) / 1000;
		const pontosPorMinuto = (pontos / (tempoJogado / 60)).toFixed(2);
		rankingList.style.visibility = "visible";

		const estatisticas = `
            <div id="fim">FIM DE JOGO</div>
            📊 Estatísticas finais:

            <div class="estatisticas">🎯 Pontos totais: ${pontos}</div>
            <div class="estatisticas">💰 Moedas ganhas: ${moedasGanhas}</div>
            <div class="estatisticas">📈 Nível máximo alcançado: ${maxLevel}</div>
            <div class="estatisticas">🖱️ Total de cliques: ${totalClicks}</div>
            <div class="estatisticas">⚡ Média de pontos por minuto: ${pontosPorMinuto}</div>
            🎲 Boosters coletados: ${totalBoosters}

            <div class="booster-info">• Coringa: ${coringaBoosters}</div>
            <div class="booster-info">• Pontos positivos: ${pontosPositivosBoosters}</div>
            <div class="booster-info">• Pontos negativos: ${pontosNegativosBoosters}</div>
            <div class="booster-info">• Tempo extra: ${tempoExtraBoosters}</div>
            <div class="booster-info">• Tempo reduzido: ${tempoReduzidoBoosters}</div>
            <div class="booster-info">• Bola maior: ${bolaMaiorBoosters}</div>
            <div class="booster-info">• Bola menor: ${bolaMenorBoosters}</div>
        `;

		mensagemFinal.style.whiteSpace = "pre-line";
		mensagemFinal.innerHTML = estatisticas;
		mensagemFinal.style.visibility = "visible";

		const moedasAtuais = parseInt(localStorage.getItem("totalMoedas") || "0");
		const novoTotalMoedas = moedasAtuais + moedasGanhas;
		localStorage.setItem("totalMoedas", novoTotalMoedas.toString());
	}

	function atualizarCorTempo() {
		if (tempoRestante <= 10) {
			tempo.style.color = "red";
		} else if (tempoRestante <= 49) {
			tempo.style.color = "yellow";
		} else {
			tempo.style.color = "#4caf50";
		}
	}

	function atualizarRanking(pontos) {
		const nomeJogador = localStorage.getItem("nomeJogador") || "Guest";

		let jogadorExistente = rankings.find(
			(jogador) => jogador.nome === nomeJogador
		);

		if (jogadorExistente) {
			if (pontos > jogadorExistente.pontos) {
				jogadorExistente.pontos = pontos;
			}
		} else {
			rankings.push({
				nome: nomeJogador,
				pontos: pontos,
			});
		}

		rankings.sort((a, b) => b.pontos - a.pontos);

		if (rankings.length > 10) {
			rankings = rankings.slice(0, 10);
		}

		localStorage.setItem("rankings", JSON.stringify(rankings));
	}

	function atualizarRankingVisual() {
		rankingList.innerHTML = "";
		rankings.forEach((jogador, index) => {
			const rankingItem = document.createElement("li");
			rankingItem.textContent = `${index + 1}. ${jogador.nome} - ${
				jogador.pontos
			} pontos`;
			rankingList.appendChild(rankingItem);
		});
	}

	function bolaClick() {
		pontos++;
		totalClicks++;

		if (pontos % 2 === 0) {
			moedasGanhas++;
		}

		ajustarDificuldade();
		atualizarPontos();

		bola.classList.add("brilhando");

		const somAleatorio = sons[Math.floor(Math.random() * sons.length)];
		somAleatorio.play();

		setTimeout(() => {
			bola.classList.remove("brilhando");
		}, 250);

		moverBola();
	}

	function boosterClick() {
		aplicarEfeitoBooster();
		booster.style.display = "none";
		clearInterval(boosterPiscando);
	}

	function playClick() {
		if (jogoAtivo) {
			finalizarJogo();
			play.textContent = "Jogar";
		} else {
			iniciarJogo();
			play.textContent = "Parar";
		}
	}

	window.home = function () {
		window.location.href = "index.html";
	};

	bola.addEventListener("click", bolaClick);
	booster.addEventListener("click", boosterClick);
	play.addEventListener("click", playClick);

	function verificarTecla(evento) {
		if (evento.code === "Space" && jogoAtivo) {
			evento.preventDefault();
			if (mouseEstaSobreABola()) {
				bolaClick();
			}
			if (mouseEstaSobreBooster()) {
				boosterClick();
			}
		}
	}

	function mouseEstaSobreABola() {
		const rect = bola.getBoundingClientRect();

		return (
			mouseX >= rect.left &&
			mouseX <= rect.right &&
			mouseY >= rect.top &&
			mouseY <= rect.bottom
		);
	}

	function mouseEstaSobreBooster() {
		const rect = booster.getBoundingClientRect();
	
		return (
			mouseX >= rect.left &&
			mouseX <= rect.right &&
			mouseY >= rect.top &&
			mouseY <= rect.bottom
		);
	}
});
