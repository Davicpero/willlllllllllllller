import { iniciarCadastro } from './api.js';

iniciarCadastro({
    endereco: '/tecnicos',
    tabela: 'lista-tecnicos',
    campos: ['campo1', 'campo2', 'campo3'],
    colunas: ['campo1', 'campo2', 'campo3']
});
