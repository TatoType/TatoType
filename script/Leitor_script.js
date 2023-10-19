let rate = 1.0; // Velocidade padrão
let volume = 1.0; // Volume padrão
let synth = window.speechSynthesis;
let utterance;
let leituraPausada = false;

// Função para iniciar a leitura do texto
function iniciarLeitura() {
    const texto = document.getElementById('texto').value;
    if (texto) {
        utterance = new SpeechSynthesisUtterance(texto);
        utterance.rate = rate; // Defina a velocidade
        utterance.volume = volume; // Defina o volume
        synth.speak(utterance);
        leituraPausada = false;
        document.getElementById('pausarRetomar').textContent = 'Pausar (Alt + P)';
        document.getElementById('ler').disabled = true; // Desativar o botão "Ler"
        document.getElementById('pausarRetomar').disabled = false; // Ativar o botão de pausa
    } else {
        alert('Nada para ler. Por favor, insira algum texto no campo de texto.');
    }
}

// Função para pausar/retomar a leitura
function pausarRetomarLeitura() {
    if (synth.speaking) {
        if (leituraPausada) {
            synth.resume();
            leituraPausada = false;
            document.getElementById('pausarRetomar').textContent = 'Pausar (Alt + P)';
            document.getElementById('pausarRetomar').style.backgroundColor = ''; // Volte ao estado original
        } else {
            synth.pause();
            leituraPausada = true;
            document.getElementById('pausarRetomar').textContent = 'Retornar (Alt + P)';
            document.getElementById('pausarRetomar').style.backgroundColor = '#085f5b'; // Muda para o estado pausado
        }
        
    }
}

// Evento de clique no botão "Finalizar"
function pararLeitura() {
    synth.cancel();
    leituraPausada = false;
    document.getElementById('pausarRetomar').textContent = 'Pausar (Alt + P)';
    document.getElementById('pausarRetomar').style.backgroundColor = ''; // Volte a cor do botão Pausar em seu estado original
    document.getElementById('ler').disabled = false; // Reativar o botão "Ler"
    document.getElementById('ler').style.backgroundColor = ''; // Volte a cor do botão Ler em sue estado original
    document.getElementById('ler').style.cursor = ''; // Volte ao cursor original
}

// Cancela a leitura se mudar/reseta de/a página
window.addEventListener('beforeunload', function (e) {
    if (synth.speaking) {
        // Cancela a leitura se estiver em andamento
        synth.cancel();
    }
});

// Evento de clique no botão "Ler"
document.getElementById('ler').addEventListener('click', function () {
    if (synth.speaking) {
        pararLeitura();
    } else {
        iniciarLeitura();
    }
    // Atualize o estilo do botão "ler" com base no estado da leitura
    if (synth.speaking) {
        document.getElementById('ler').disabled = true;
        document.getElementById('ler').style.backgroundColor = '#085f5b'; // Altere a cor 
        document.getElementById('ler').style.cursor = 'not-allowed'; // Altere o cursor
    } else {
        document.getElementById('ler').disabled = false;
        document.getElementById('ler').style.backgroundColor = ''; // Volte ao estado original
        document.getElementById('ler').style.cursor = ''; // Volte ao cursor original
    }
});

// Evento de clique no botão "Pausar/Retomar"
document.getElementById('pausarRetomar').addEventListener('click', pausarRetomarLeitura);

// Evento de clique no botão "Parar"
document.getElementById('parar').addEventListener('click', pararLeitura);

// Função do Botão Limpar do TextArea
document.getElementById('limpar').addEventListener('click', function () {
    document.getElementById('texto').value = '';
    pararLeitura();
});

// Evento de ajuste de volume
document.getElementById('volumeRange').addEventListener('input', function () {
    volume = parseFloat(this.value);
    if (utterance) {
        utterance.volume = volume;
    }
    // Atualize o estilo do botão "ler" com base no estado da leitura
    if (!synth.speaking) {
        const volumePercentage = Math.round(volume * 100);
        document.getElementById('volumeLabel').textContent = volumePercentage + '%';
        document.getElementById('ler').disabled = false;
        document.getElementById('ler').style.backgroundColor = ''; // Volte ao estado original
        document.getElementById('ler').style.cursor = ''; // Volte ao cursor original
    }
});

// Inicialize o rótulo de volume com o valor padrão em porcentagem
const volumePercentage = Math.round(volume * 100);
document.getElementById('volumeLabel').textContent = volumePercentage + '%';

// Evento de ajuste de velocidade
document.getElementById('velocidadeRange').addEventListener('input', function () {
    rate = parseFloat(this.value);
    if (utterance) {
        utterance.rate = rate;
    }
    // Atualize o rótulo da velocidade com o valor atual
    document.getElementById('velocidadeLabel').textContent = rate.toFixed(1) + 'x';
});

// Inicialize o rótulo da velocidade com o valor padrão
document.getElementById('velocidadeLabel').textContent = rate.toFixed(1) + 'x';
