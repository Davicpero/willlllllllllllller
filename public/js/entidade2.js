import { iniciarCadastro } from './api.js';

iniciarCadastro({
    endereco: '/solicitantes',
    tabela: 'lista-solicitantes',
    campos: ['campo1', 'campo2', 'campo3'],
    colunas: ['campo1', 'campo2', 'campo3']
});
