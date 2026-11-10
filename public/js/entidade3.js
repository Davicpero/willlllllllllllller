import { iniciarCadastro } from './api.js';

iniciarCadastro({
    endereco: '/registros',
    tabela: 'lista-registros',
    campos: ['campo1', 'campo2'],

    colunas: ['campo1', registro => Number(registro.campo2).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    })]
});
