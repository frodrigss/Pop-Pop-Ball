document.addEventListener("DOMContentLoaded", () => {
	const rankings = JSON.parse(localStorage.getItem("rankings")) || [],
		rankingList = document.getElementById("ranking-list");

	if (rankings.length === 0) {
		const li = document.createElement("li");
		li.id = "none";
		li.textContent = `Nenhum jogador no ranking.`;
		rankingList.appendChild(li);
	} else {
		rankings.forEach((jogador, index) => {
			const li = document.createElement("li");
			li.textContent = `${index + 1}. ${jogador.nome}: ${jogador.pontos} pts`;
			rankingList.appendChild(li);
		});
	}
});

window.home = () => {
	window.location.href = "index.html";
};
