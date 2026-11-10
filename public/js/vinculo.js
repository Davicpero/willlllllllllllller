import { chamandoServer, iniciarCadastro } from './api.js';

async function carregarOpcoes() {

    const listas = await Promise.all([
        chamandoServer('/tecnicos'),
        chamandoServer('/solicitantes'),
        chamandoServer('/registros')
    ]);

    ['id_tecnicos', 'id_solicitantes', 'id_registros'].forEach((campo, indice) => {
        const select = document.getElementById(campo);
        if (!Array.isArray(listas[indice])) throw new Error('Não foi possível carregar as opções.');

        select.length = 1;
        for (const registro of listas[indice]) {

            select.add(new Option(registro.campo1, registro.id));
        }
    });
}
iniciarCadastro({
    endereco: '/vinculo',
    tabela: 'lista-vinculo',
    campos: ['data_vinculo', 'id_tecnicos', 'id_solicitantes', 'id_registros'],
    colunas: [
        registro => registro.data_vinculo.split('-').reverse().join('/'),
        'tecnicos', 'solicitantes', 'registros'
    ],
    preparar: carregarOpcoes
});
