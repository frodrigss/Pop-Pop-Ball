document.addEventListener("DOMContentLoaded", () => {
  const mensagemElement = document.getElementById("mensagem"),
    nomeInput = document.getElementById("nome-jogador"),
    jogarBtn = document.getElementById("jogar-btn");

  const mensagens = [
    "Mereço um MB!",
    "Pegue a bola!",
    "Pop, Pop, Pop!",
    "Seja rápido!",
    "Desafio aceito!",
    "Está pronto?",
    "Tente de novo!",
    "Mais uma bolinha!",
    "O segredo é gerenciar o tempo.",
    "Continue clicando!",
    "Rápido como um raio!",
    "A bola está fugindo!",
    "Siga o ritmo!",
    "Estourou! Boa!",
    "Os boosters são traiçoeiros.",
    "Mantenha o foco!",
    "Você está arrasando!",
    "Hora do desafio!",
    "Desafie seus amigos!",
    "Nível 3...4...5?",
    "Prepare-se para o próximo pop!",
    "Bola no ponteiro!",
    "Fique atento às mudanças!",
    "Seja o mestre do pop!",
    "Só mais uma vez!",
    "O tempo está passando!",
    "Vamos ver suas habilidades!",
  ];

  let ultimaMensagem;

  function mostrarMensagemAleatoria() {
    let novaMensagem;
    mensagemElement.style.opacity = 0;

    do {
      novaMensagem = mensagens[Math.floor(Math.random() * mensagens.length)];
    } while (novaMensagem === ultimaMensagem);

    setTimeout(() => {
      mensagemElement.textContent = novaMensagem;
      mensagemElement.style.opacity = 1;
      ultimaMensagem = novaMensagem;
    }, 500);
  }

  setInterval(mostrarMensagemAleatoria, 2500);

  nomeInput.addEventListener("input", () => {
    nomeInput.value = nomeInput.value.toUpperCase();
    jogarBtn.disabled = nomeInput.value.length < 3;
  });

  window.jogar = () => {
    const nome = nomeInput.value;
    if (nome.length >= 3) {
      localStorage.setItem("nomeJogador", nome);
      window.location.href = "bolinha.html";
    }
  };

  const nomeJogador = document.getElementById('nome-jogador');

  nomeJogador.addEventListener('focus', () => {
    nomeJogador.placeholder = '3-6 caracteres';
    nomeJogador.style.fontSize = '1.9vh';
  });

  nomeJogador.addEventListener('blur', () => {
    nomeJogador.placeholder = 'NICKNAME';
    nomeJogador.style.fontSize = '2.5vh';
  });

  const totalMoedas = localStorage.getItem('totalMoedas') || '0';
  document.getElementById('total-moedas').textContent = `PopCoins: ${totalMoedas}`;
});
