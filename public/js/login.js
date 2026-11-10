import { chamandoServer, mostrarMensagem } from './api.js';

const formulario = document.querySelector('form');
const botao = formulario.querySelector('[type="submit"]');
const cadastro = Boolean(document.getElementById('nome'));
let enviando = false;

function atualizarBotao() {
    botao.disabled = enviando || !formulario.checkValidity();
}
formulario.addEventListener('input', atualizarBotao);
atualizarBotao();

formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (enviando || !formulario.reportValidity()) return;
    enviando = true;
    atualizarBotao();
    const dados = {
        email: formulario.elements.email.value.trim(),
        senha: formulario.elements.senha.value
    };
    if (cadastro) dados.nome = formulario.elements.nome.value.trim();
    try {
        const resultado = await chamandoServer(cadastro ? '/registro' : '/login', 'POST', dados);
        if (cadastro && !resultado?.id) throw new Error('Não foi possível criar a conta.');
        if (!cadastro && !resultado?.user) throw new Error('Não foi possível entrar.');

        location.href = cadastro ? 'index.html?cadastro=sucesso' : 'tecnicos.html';
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    } finally {
        enviando = false;
        atualizarBotao();
    }
});
if (!cadastro && new URLSearchParams(location.search).get('cadastro') === 'sucesso') {
    mostrarMensagem('Conta criada com sucesso. Faça login para continuar.');
}
