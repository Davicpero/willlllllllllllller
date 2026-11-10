export async function chamandoServer(endereco, metodo = 'GET', dados) {
    const resposta = await fetch(endereco, {
        method: metodo,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: dados === undefined ? undefined : JSON.stringify(dados)
    });
    let resultado;
    try {
        resultado = await resposta.json();
    } catch {
        throw new Error('Resposta inválida do servidor. Tente novamente.');
    }
    if (resposta.status === 401 || resposta.status === 403) {
        if (!['/login', '/registro'].includes(endereco)) {
            location.href = 'index.html';
        }
    }

    if (!resposta.ok || resultado?.erro ||
        (resultado?.message && !resultado?.user)) {
        throw new Error(resultado?.erro || resultado?.message || 'Não foi possível concluir a operação.');
    }
    return resultado;
}

export function mostrarMensagem(texto, erro = false) {
    let mensagem = document.getElementById('mensagem');
    if (!mensagem) {
        mensagem = document.createElement('p');
        mensagem.id = 'mensagem';
        document.querySelector('main').prepend(mensagem);
    }
    mensagem.setAttribute('role', erro ? 'alert' : 'status');
    mensagem.textContent = texto;
}

export function iniciarCadastro({ endereco, tabela, campos, colunas, preparar }) {
    const formulario = document.querySelector('form');
    const botao = formulario.querySelector('[type="submit"]');
    const cancelar = document.createElement('button');
    cancelar.type = 'button';
    cancelar.textContent = 'Cancelar edição';
    cancelar.hidden = true;
    formulario.append(cancelar);
    let registros = [];
    let idEmEdicao = null;
    let ocupado = false;

    function atualizarBotao() {
        botao.disabled = ocupado || !formulario.checkValidity();
    }
    function limpar() {
        formulario.reset();
        idEmEdicao = null;
        cancelar.hidden = true;

        botao.textContent = endereco === '/vinculo' ? 'Vincular' : 'Salvar';
        atualizarBotao();
    }
    async function carregar() {
        const dados = await chamandoServer(endereco);
        if (!Array.isArray(dados)) throw new Error('Não foi possível carregar a lista.');
        registros = dados;
        const corpo = document.getElementById(tabela);
        corpo.replaceChildren();
        if (!registros.length) {
            const linha = corpo.insertRow();
            const celula = linha.insertCell();
            celula.colSpan = colunas.length + 1;
            celula.textContent = 'Nenhum registro encontrado.';
        }
        for (const registro of registros) {
            const linha = corpo.insertRow();
            for (const coluna of colunas) {
                linha.insertCell().textContent = typeof coluna === 'function'
                    ? coluna(registro) : registro[coluna] ?? '';
            }
            const acoes = linha.insertCell();
            const editar = document.createElement('button');
            editar.type = 'button';
            editar.textContent = 'Editar';
            editar.onclick = () => {
                if (ocupado) return;
                idEmEdicao = registro.id;
                for (const campo of campos) {
                    formulario.elements[campo].value = registro[campo] ?? '';
                }
                cancelar.hidden = false;
                botao.textContent = 'Salvar alterações';
                atualizarBotao();
                formulario.elements[campos[0]].focus();
            };
            const excluir = document.createElement('button');
            excluir.type = 'button';
            excluir.textContent = 'Excluir';
            excluir.onclick = async () => {
                if (ocupado || !confirm('Deseja excluir este registro?')) return;
                ocupado = true;
                atualizarBotao();
                try {
                    await chamandoServer(endereco + '/' + registro.id, 'DELETE');
                    if (idEmEdicao === registro.id) limpar();
                    await carregar();
                    mostrarMensagem('Registro excluído com sucesso.');
                } catch (erro) {
                    mostrarMensagem(erro.message, true);
                } finally {
                    ocupado = false;
                    atualizarBotao();
                }
            };
            acoes.append(editar, excluir);
        }
    }
    formulario.addEventListener('input', atualizarBotao);
    formulario.addEventListener('change', atualizarBotao);
    cancelar.onclick = () => { if (!ocupado) limpar(); };
    formulario.addEventListener('submit', async evento => {
        evento.preventDefault();
        if (ocupado || !formulario.reportValidity()) return;
        const dados = Object.fromEntries(campos.map(campo =>
            [campo, formulario.elements[campo].value.trim()]));
        ocupado = true;
        atualizarBotao();
        try {
            await chamandoServer(idEmEdicao ? endereco + '/' + idEmEdicao : endereco,
                idEmEdicao ? 'PUT' : 'POST', dados);
            limpar();
            await carregar();
            mostrarMensagem('Registro salvo com sucesso.');
        } catch (erro) {
            mostrarMensagem(erro.message, true);
        } finally {
            ocupado = false;
            atualizarBotao();
        }
    });
    async function iniciar() {
        ocupado = true;
        atualizarBotao();
        try {
            if (preparar) await preparar();
            await carregar();
        } catch (erro) {
            mostrarMensagem(erro.message, true);
        } finally {
            ocupado = false;
            atualizarBotao();
        }
    }
    iniciar();
}
