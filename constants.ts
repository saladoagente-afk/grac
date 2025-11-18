import { ThemeOption } from './types';

export const THEMES: ThemeOption[] = [
  {
    id: 'mei',
    label: 'Microempreendedor Individual (MEI)',
    subthemes: [
      'Formalização',
      'Alteração Cadastral',
      'Baixa',
      'Declaração Anual (DASN)',
      'Boleto DAS',
      'Parcelamento'
    ]
  },
  {
    id: 'alvara',
    label: 'Alvará e Licenciamento',
    subthemes: [
      'Consulta de Viabilidade',
      'Emissão de Alvará',
      'Renovação',
      'Licença Sanitária',
      'Licença Ambiental'
    ]
  },
  {
    id: 'nf',
    label: 'Nota Fiscal',
    subthemes: [
      'Emissão de NFS-e',
      'Credenciamento',
      'Cancelamento de Nota',
      'Configuração do Sistema'
    ]
  },
  {
    id: 'credito',
    label: 'Crédito e Finanças',
    subthemes: [
      'Banco do Povo',
      'Microcrédito',
      'Renegociação de Dívidas',
      'Consultoria Financeira'
    ]
  },
  {
    id: 'outro',
    label: 'Outros Assuntos',
    subthemes: [
      'Cursos e Capacitações',
      'Consultoria Sebrae',
      'Ouvidoria',
      'Dúvidas Gerais'
    ]
  }
];