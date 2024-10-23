let corBola = "red",
	corBorda = "black",
	rainbowInterval,
	rainbowOptInterval;

function mudarCorBola(cor) {
	const bola = document.getElementById("preview");
	clearInterval(rainbowInterval);
	bola.style.backgroundColor = cor;
	corBola = cor;
}

function rainbow() {
	const bola = document.getElementById("preview");
	clearInterval(rainbowInterval);
	bola.style.backgroundColor = "transparent";
	corBola = "rainbow";
	rainbowInterval = setInterval(() => {
		bola.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
	}, 100);
}

function rainbowOpt() {
	const rainbowOpt = document.getElementById("rainbowOption");
	rainbowOpt.style.backgroundColor = "transparent";
	clearInterval(rainbowOptInterval);
	rainbowOptInterval = setInterval(() => {
		rainbowOpt.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
	}, 100);
}

rainbowOpt();

function mudarCorBorda(cor) {
	const bola = document.getElementById("preview");
	bola.style.border = `0.25vw solid ${cor}`;
	corBorda = cor;
}

function salvar() {
	localStorage.setItem("bordaCustomizada", corBorda);
	localStorage.setItem("corBolaCustomizada", corBola);
	alert("Personalização salva com sucesso!");
}

function removeBorder() {
	document.getElementById("preview").style.border = "none";
	corBorda = "none";
}

function home() {
	window.location.href = "index.html";
}

window.onload = function () {
	clearInterval(rainbowInterval);
	const salvarCor = localStorage.getItem("bordaCustomizada");
	const salvarCorBola = localStorage.getItem("corBolaCustomizada");

	if (salvarCor) {
		if (salvarCor === "none") {
			removeBorder();
		} else {
			mudarCorBorda(salvarCor);
		}
	}

	if (salvarCorBola) {
		if (salvarCorBola === "rainbow") {
			rainbow();
		} else {
			mudarCorBola(salvarCorBola);
		}
	}

	const totalMoedas = localStorage.getItem('totalMoedas') || '0';
	document.getElementById('total-moedas').textContent = 'PopCoins: ' + totalMoedas;
};
