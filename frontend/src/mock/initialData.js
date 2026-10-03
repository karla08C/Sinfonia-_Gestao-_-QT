export const INITIAL_CAPELAS = [
  {
    id: 1,
    nome: 'Capela Fluxo Laminar 01',
    status: 'Manipulando', // Disponível | Manipulando | Limpeza
    paciente_atual_id: 4,
    paciente_nome: 'João Pedro Alcântara',
    protocolo_nome: 'AC-T (Doxorrubicina + Ciclofosfamida)',
    tipo_droga: 'Antraciclina + Agente Alquilante',
    duracao_manipulacao_min: 30
  }
];

export const INITIAL_POLTRONAS = [
  {
    id: 1,
    numero: 'Poltrona 01',
    status: 'Ocupada', // Livre | Ocupada | Higienização
    paciente_atual_id: 1,
    paciente_nome: 'Maria de Lourdes Santos',
    paciente_prontuario: 'PAC-069',
    protocolo_nome: 'FOLFIRINOX',
    duracao_infusao_min: 360,
    minutos_restantes_infusao: 12, // < 15 min -> Dispara Alerta de Higienização!
    progresso_pct: 96,
    alerta_higienizacao: true
  },
  {
    id: 2,
    numero: 'Poltrona 02',
    status: 'Ocupada',
    paciente_atual_id: 2,
    paciente_nome: 'Carlos Eduardo Meireles',
    paciente_prontuario: 'PAC-041',
    protocolo_nome: 'Paclitaxel + Carboplatina',
    duracao_infusao_min: 180,
    minutos_restantes_infusao: 110,
    progresso_pct: 39,
    alerta_higienizacao: false
  },
  {
    id: 3,
    numero: 'Poltrona 03',
    status: 'Livre',
    paciente_atual_id: null,
    paciente_nome: null,
    paciente_prontuario: null,
    protocolo_nome: null,
    duracao_infusao_min: null,
    minutos_restantes_infusao: null,
    progresso_pct: 0,
    alerta_higienizacao: false
  },
  {
    id: 4,
    numero: 'Poltrona 04',
    status: 'Higienização',
    paciente_atual_id: null,
    paciente_nome: null,
    paciente_prontuario: null,
    protocolo_nome: null,
    duracao_infusao_min: null,
    minutos_restantes_infusao: null,
    progresso_pct: 0,
    alerta_higienizacao: false
  }
];

export const INITIAL_PROTOCOLOS = [
  { id: 1, nome: 'FOLFIRINOX', duracao_manipulacao_min: 45, duracao_infusao_min: 360, tipo_droga: 'Citotóxico / Irinotecano + Oxaliplatina', corFolha: 'Vermelho (Longo)', horarioLimite: '11:00' },
  { id: 2, nome: 'Paclitaxel + Carboplatina', duracao_manipulacao_min: 35, duracao_infusao_min: 180, tipo_droga: 'Taxano + Derivado de Platina', corFolha: 'Laranja (Intermediário)', horarioLimite: '13:00' },
  { id: 3, nome: 'AC-T (Doxorrubicina + Ciclofosfamida)', duracao_manipulacao_min: 30, duracao_infusao_min: 150, tipo_droga: 'Antraciclina + Agente Alquilante', corFolha: 'Marrom (Intermediário)', horarioLimite: '13:30' },
  { id: 4, nome: 'Oxaliplatina + Capecitabina (XELOX)', duracao_manipulacao_min: 25, duracao_infusao_min: 120, tipo_droga: 'Derivado de Platina', corFolha: 'Marrom (Intermediário)', horarioLimite: '14:00' },
  { id: 5, nome: 'Imunoterapia (Pembrolizumabe)', duracao_manipulacao_min: 20, duracao_infusao_min: 60, tipo_droga: 'Anticorpo Monoclonal / Anti-PD-1', corFolha: 'Verde (Rápido)', horarioLimite: '15:30' },
  { id: 6, nome: 'Bortezomibe + Dexametasona', duracao_manipulacao_min: 15, duracao_infusao_min: 30, tipo_droga: 'Inibidor de Proteassoma', corFolha: 'Azul (Injetável)', horarioLimite: '16:00' }
];

export const INITIAL_PACIENTES = [
  {
    id: 1,
    nome: 'Maria de Lourdes Santos',
    prontuario: 'PAC-069',
    status: 'Em Infusão',
    protocolo_id: 1,
    protocolo_nome: 'FOLFIRINOX',
    tipo_droga: 'Citotóxico / Irinotecano + Oxaliplatina',
    corFolha: 'Vermelho (Longo)',
    horarioLimite: '11:00',
    duracao_manipulacao_min: 45,
    duracao_infusao_min: 360,
    poltrona_id: 1,
    poltrona_numero: 'Poltrona 01',
    horario_chegada: '07:20',
    horario_inicio_infusao_real: '08:00',
    minutos_restantes_infusao: 12, // Destaque Amarelo de Alerta!
    alerta_higienizacao: true
  },
  {
    id: 2,
    nome: 'Carlos Eduardo Meireles',
    prontuario: 'PAC-041',
    status: 'Em Infusão',
    protocolo_id: 2,
    protocolo_nome: 'Paclitaxel + Carboplatina',
    tipo_droga: 'Taxano + Derivado de Platina',
    corFolha: 'Laranja (Intermediário)',
    horarioLimite: '13:00',
    duracao_manipulacao_min: 35,
    duracao_infusao_min: 180,
    poltrona_id: 2,
    poltrona_numero: 'Poltrona 02',
    horario_chegada: '08:00',
    horario_inicio_infusao_real: '09:00',
    minutos_restantes_infusao: 110,
    alerta_higienizacao: false
  },
  {
    id: 3,
    nome: 'Ana Beatriz Nogueira',
    prontuario: 'PAC-018',
    status: 'Pronto para Infundir', // Bolsa a Caminho
    protocolo_id: 5,
    protocolo_nome: 'Imunoterapia (Pembrolizumabe)',
    tipo_droga: 'Anticorpo Monoclonal / Anti-PD-1',
    corFolha: 'Verde (Rápido)',
    horarioLimite: '15:30',
    duracao_manipulacao_min: 20,
    duracao_infusao_min: 60,
    poltrona_id: 3,
    poltrona_numero: 'Poltrona 03',
    horario_chegada: '08:30',
    horario_inicio_infusao_real: null,
    minutos_restantes_infusao: 60,
    alerta_higienizacao: false
  },
  {
    id: 4,
    nome: 'João Pedro Alcântara',
    prontuario: 'PAC-024',
    status: 'Em Manipulação',
    protocolo_id: 3,
    protocolo_nome: 'AC-T (Doxorrubicina + Ciclofosfamida)',
    tipo_droga: 'Antraciclina + Agente Alquilante',
    corFolha: 'Marrom (Intermediário)',
    horarioLimite: '13:30',
    duracao_manipulacao_min: 30,
    duracao_infusao_min: 150,
    poltrona_id: 4,
    poltrona_numero: 'Poltrona 04',
    horario_chegada: '09:00',
    horario_inicio_infusao_real: null,
    minutos_restantes_infusao: 150,
    alerta_higienizacao: false
  },
  {
    id: 5,
    nome: 'Helena Silveira Ramos',
    prontuario: 'PAC-033',
    status: 'Triagem/Punção',
    protocolo_id: 4,
    protocolo_nome: 'Oxaliplatina + Capecitabina (XELOX)',
    tipo_droga: 'Derivado de Platina',
    corFolha: 'Marrom (Intermediário)',
    horarioLimite: '14:00',
    duracao_manipulacao_min: 25,
    duracao_infusao_min: 120,
    poltrona_id: null,
    poltrona_numero: null,
    horario_chegada: '09:40',
    horario_inicio_infusao_real: null,
    minutos_restantes_infusao: 120,
    alerta_higienizacao: false
  },
  {
    id: 6,
    nome: 'Roberto Mendes de Freitas',
    prontuario: 'PAC-052',
    status: 'Aguardando Check-in',
    protocolo_id: 1,
    protocolo_nome: 'FOLFIRINOX',
    tipo_droga: 'Citotóxico / Irinotecano + Oxaliplatina',
    corFolha: 'Vermelho (Longo)',
    horarioLimite: '11:00',
    duracao_manipulacao_min: 45,
    duracao_infusao_min: 360,
    poltrona_id: null,
    poltrona_numero: null,
    horario_chegada: '10:00',
    horario_inicio_infusao_real: null,
    minutos_restantes_infusao: 360,
    alerta_higienizacao: false
  },
  {
    id: 7,
    nome: 'Fernanda Costa Ribeiro',
    prontuario: 'PAC-077',
    status: 'Aguardando Check-in',
    protocolo_id: 6,
    protocolo_nome: 'Bortezomibe + Dexametasona',
    tipo_droga: 'Inibidor de Proteassoma',
    corFolha: 'Azul (Injetável)',
    horarioLimite: '16:00',
    duracao_manipulacao_min: 15,
    duracao_infusao_min: 30,
    poltrona_id: null,
    poltrona_numero: null,
    horario_chegada: '10:15',
    horario_inicio_infusao_real: null,
    minutos_restantes_infusao: 30,
    alerta_higienizacao: false
  },
  {
    id: 8,
    nome: 'Antônio Silva Vasconcelos',
    prontuario: 'PAC-088',
    status: 'Alta',
    protocolo_id: 5,
    protocolo_nome: 'Imunoterapia (Pembrolizumabe)',
    tipo_droga: 'Anticorpo Monoclonal / Anti-PD-1',
    corFolha: 'Verde (Rápido)',
    horarioLimite: '15:30',
    duracao_manipulacao_min: 20,
    duracao_infusao_min: 60,
    poltrona_id: null,
    poltrona_numero: null,
    horario_chegada: '07:10',
    horario_inicio_infusao_real: '07:45',
    minutos_restantes_infusao: 0,
    alerta_higienizacao: false
  }
];
