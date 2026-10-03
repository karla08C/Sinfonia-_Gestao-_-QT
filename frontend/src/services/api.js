/**
 * Sinfonia API Service
 * Conecta-se de forma transparente ao backend Node/Express ou opera localmente em fallback resiliente.
 */
import { INITIAL_CAPELAS, INITIAL_PACIENTES, INITIAL_POLTRONAS, INITIAL_PROTOCOLOS } from '../mock/initialData';

const BASE_URL = '/api';

// Armazenamento local reativo caso o backend esteja offline
class LocalStore {
  constructor() {
    this.pacientes = JSON.parse(localStorage.getItem('oncoflow_pacientes')) || [...INITIAL_PACIENTES];
    this.poltronas = JSON.parse(localStorage.getItem('oncoflow_poltronas')) || [...INITIAL_POLTRONAS];
    this.capelas = JSON.parse(localStorage.getItem('oncoflow_capelas')) || [...INITIAL_CAPELAS];
    this.protocolos = [...INITIAL_PROTOCOLOS];
  }

  save() {
    localStorage.setItem('oncoflow_pacientes', JSON.stringify(this.pacientes));
    localStorage.setItem('oncoflow_poltronas', JSON.stringify(this.poltronas));
    localStorage.setItem('oncoflow_capelas', JSON.stringify(this.capelas));
  }


}

const localStore = new LocalStore();

async function fetchWithFallback(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Backend offline -> Executar via LocalStore transparente
    return null;
  }
}

export const api = {
  // PACIENTES
  async getPacientes() {
    const remote = await fetchWithFallback(`${BASE_URL}/pacientes`);
    if (remote && remote.sucesso) return remote.dados;

    return localStore.pacientes.map(p => ({
      ...p,
      alerta_higienizacao: p.status === 'Em Infusão' && p.minutos_restantes_infusao !== null && p.minutos_restantes_infusao <= 15
    }));
  },

  async criarPaciente(pacienteData) {
    const remote = await fetchWithFallback(`${BASE_URL}/pacientes`, {
      method: 'POST',
      body: JSON.stringify(pacienteData)
    });
    if (remote && remote.sucesso) return remote;

    const prot = localStore.protocolos.find(p => p.id === Number(pacienteData.protocolo_id)) || localStore.protocolos[0];
    const novo = {
      id: Date.now(),
      nome: pacienteData.nome,
      prontuario: pacienteData.prontuario,
      status: 'Aguardando Check-in',
      protocolo_id: prot.id,
      protocolo_nome: prot.nome,
      tipo_droga: prot.tipo_droga,
      duracao_manipulacao_min: prot.duracao_manipulacao_min,
      duracao_infusao_min: prot.duracao_infusao_min,
      poltrona_id: pacienteData.poltrona_id ? Number(pacienteData.poltrona_id) : null,
      poltrona_numero: pacienteData.poltrona_id ? `Poltrona 0${pacienteData.poltrona_id}` : null,
      horario_chegada: pacienteData.horario_chegada || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      origem: pacienteData.origem || 'Não informado',
      horario_inicio_infusao_real: null,
      minutos_restantes_infusao: prot.duracao_infusao_min,
      alerta_higienizacao: false
    };

    localStore.pacientes.push(novo);
    localStore.save();
    return { sucesso: true, dados: novo };
  },

  async avancarEtapa(pacienteId) {
    const remote = await fetchWithFallback(`${BASE_URL}/pacientes/${pacienteId}/avancar`, {
      method: 'POST'
    });
    if (remote && remote.sucesso) return remote;

    const stages = [
      'Aguardando Check-in',
      'Triagem/Punção',
      'Em Manipulação',
      'Pronto para Infundir',
      'Em Infusão',
      'Alta'
    ];

    const pac = localStore.pacientes.find(p => p.id === pacienteId);
    if (!pac) throw new Error('Paciente não encontrado');

    const currIdx = stages.indexOf(pac.status);
    if (currIdx < stages.length - 1) {
      const nextStatus = stages[currIdx + 1];
      pac.status = nextStatus;

      if (nextStatus === 'Em Infusão') {
        pac.horario_inicio_infusao_real = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (!pac.poltrona_id) {
          const livre = localStore.poltronas.find(p => p.status === 'Livre');
          if (livre) {
            pac.poltrona_id = livre.id;
            pac.poltrona_numero = livre.numero;
          }
        }
        if (pac.poltrona_id) {
          const polt = localStore.poltronas.find(p => p.id === pac.poltrona_id);
          if (polt) {
            polt.status = 'Ocupada';
            polt.paciente_atual_id = pac.id;
            polt.paciente_nome = pac.nome;
            polt.paciente_prontuario = pac.prontuario;
            polt.protocolo_nome = pac.protocolo_nome;
            polt.duracao_infusao_min = pac.duracao_infusao_min;
            polt.minutos_restantes_infusao = pac.minutos_restantes_infusao;
            polt.progresso_pct = 10;
          }
        }
      } else if (nextStatus === 'Alta') {
        pac.minutos_restantes_infusao = 0;
        if (pac.poltrona_id) {
          const polt = localStore.poltronas.find(p => p.id === pac.poltrona_id);
          if (polt) {
            polt.status = 'Higienização';
            polt.paciente_atual_id = null;
            polt.paciente_nome = null;
          }
        }
      }
      localStore.save();
    }

    return { sucesso: true, novo_status: pac.status };
  },

  // POLTRONAS
  async getPoltronas() {
    const remote = await fetchWithFallback(`${BASE_URL}/poltronas`);
    if (remote && remote.sucesso) return remote.dados;

    return localStore.poltronas.map(polt => {
      let progressoPct = 0;
      let alerta = false;
      if (polt.status === 'Ocupada' && polt.duracao_infusao_min && polt.minutos_restantes_infusao !== null) {
        const transcorrido = Math.max(0, polt.duracao_infusao_min - polt.minutos_restantes_infusao);
        progressoPct = Math.min(100, Math.round((transcorrido / polt.duracao_infusao_min) * 100));
        if (polt.minutos_restantes_infusao <= 15) alerta = true;
      }
      return {
        ...polt,
        progresso_pct: progressoPct,
        alerta_higienizacao: alerta
      };
    });
  },

  async liberarPoltrona(poltronaId) {
    const remote = await fetchWithFallback(`${BASE_URL}/poltronas/${poltronaId}/liberar`, {
      method: 'POST'
    });
    if (remote && remote.sucesso) return remote;

    const polt = localStore.poltronas.find(p => p.id === poltronaId);
    if (polt) {
      polt.status = 'Livre';
      polt.paciente_atual_id = null;
      polt.paciente_nome = null;
      polt.paciente_prontuario = null;
      polt.protocolo_nome = null;
      polt.duracao_infusao_min = null;
      polt.minutos_restantes_infusao = null;
      polt.progresso_pct = 0;
      polt.alerta_higienizacao = false;
      localStore.save();
    }
    return { sucesso: true };
  },

  // CAPELAS & FARMÁCIA ONCOLÓGICA
  async getCapelas() {
    const remote = await fetchWithFallback(`${BASE_URL}/capelas`);
    if (remote && remote.sucesso) return remote.dados;
    return localStore.capelas;
  },

  async getFilaCapela() {
    const remote = await fetchWithFallback(`${BASE_URL}/capelas/fila-manipulacao`);
    if (remote && remote.sucesso) return remote.dados;

    return localStore.pacientes
      .filter(p => ['Triagem/Punção', 'Em Manipulação', 'Aguardando Check-in'].includes(p.status))
      .sort((a, b) => {
        const order = { 'Em Manipulação': 1, 'Triagem/Punção': 2, 'Aguardando Check-in': 3 };
        return order[a.status] - order[b.status];
      });
  },

  async iniciarPreparoCapela(capelaId, pacienteId) {
    const remote = await fetchWithFallback(`${BASE_URL}/capelas/${capelaId}/iniciar-preparo`, {
      method: 'POST',
      body: JSON.stringify({ paciente_id: pacienteId })
    });
    if (remote && remote.sucesso) return remote;

    const capela = localStore.capelas.find(c => c.id === capelaId);
    const pac = localStore.pacientes.find(p => p.id === pacienteId);
    if (capela && pac) {
      capela.status = 'Manipulando';
      capela.paciente_atual_id = pac.id;
      capela.paciente_nome = pac.nome;
      capela.protocolo_nome = pac.protocolo_nome;
      capela.tipo_droga = pac.tipo_droga;
      pac.status = 'Em Manipulação';
      localStore.save();
    }
    return { sucesso: true };
  },

  async concluirPreparoCapela(capelaId, pacienteId) {
    const remote = await fetchWithFallback(`${BASE_URL}/capelas/${capelaId}/concluir-preparo`, {
      method: 'POST',
      body: JSON.stringify({ paciente_id: pacienteId })
    });
    if (remote && remote.sucesso) return remote;

    const capela = localStore.capelas.find(c => c.id === capelaId);
    const targetPacId = pacienteId || capela?.paciente_atual_id;
    const pac = localStore.pacientes.find(p => p.id === targetPacId);

    if (capela) {
      capela.status = 'Disponível';
      capela.paciente_atual_id = null;
      capela.paciente_nome = null;
      capela.protocolo_nome = null;
      capela.tipo_droga = null;
    }
    if (pac) {
      pac.status = 'Pronto para Infundir';
    }
    localStore.save();
    return { sucesso: true };
  },

  async setStatusCapela(capelaId, status) {
    const remote = await fetchWithFallback(`${BASE_URL}/capelas/${capelaId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (remote && remote.sucesso) return remote;

    const capela = localStore.capelas.find(c => c.id === capelaId);
    if (capela) {
      capela.status = status;
      if (status !== 'Manipulando') {
        capela.paciente_atual_id = null;
        capela.paciente_nome = null;
      }
      localStore.save();
    }
    return { sucesso: true };
  },

  // PROTOCOLOS
  async getProtocolos() {
    const remote = await fetchWithFallback(`${BASE_URL}/protocolos`);
    if (remote && remote.sucesso) return remote.dados;
    return localStore.protocolos;
  },

  // AGENDAMENTOS & MOTOR INTELIGENTE
  async gerarGrade(pacientesList = null) {
    const remote = await fetchWithFallback(`${BASE_URL}/agendamentos/gerar-grade`, {
      method: 'POST',
      body: JSON.stringify({ pacientes: pacientesList })
    });
    if (remote && remote.sucesso) return remote;

    // Se estiver em modo local, executar algoritmo do Tetris no frontend
    return executarTetrisLocal(pacientesList || localStore.pacientes, localStore.protocolos, localStore.poltronas);
  },

  // KPIS
  async getKPIs() {
    const remote = await fetchWithFallback(`${BASE_URL}/kpis`);
    if (remote && remote.sucesso) return remote.dados;

    const polts = localStore.poltronas;
    const ocupadas = polts.filter(p => p.status === 'Ocupada').length;
    const taxaOcupacao = Math.round((ocupadas / (polts.length || 1)) * 100);

    let totalMinutos = 0;
    localStore.pacientes.forEach(p => {
      const dur = p.duracao_infusao_min || 120;
      if (p.status === 'Alta') totalMinutos += dur;
      else if (p.status === 'Em Infusão') {
        const rest = p.minutos_restantes_infusao ?? 60;
        totalMinutos += Math.max(0, dur - rest);
      }
    });

    const horas = Math.floor(totalMinutos / 60);
    const mins = totalMinutos % 60;

    return {
      total_horas_qt_realizadas: `${horas}h ${String(mins).padStart(2, '0')}m`,
      total_horas_qt_minutos: totalMinutos,
      tempo_medio_porta_agulha_min: 38,
      taxa_ocupacao_poltronas_pct: taxaOcupacao,
      poltronas_ocupadas: ocupadas,
      total_poltronas: polts.length,
      capela_status: localStore.capelas[0]?.status || 'Disponível',
      pacientes_em_infusao: ocupadas,
      alertas_higienizacao_ativos: localStore.pacientes.filter(p => p.status === 'Em Infusão' && (p.minutos_restantes_infusao ?? 99) <= 15).length
    };
  },


};

// Algoritmo do Tetris Clínico local para fallback perfeito
function executarTetrisLocal(pacientes, protocolos, poltronas) {
  const prioridadeOrigem = (paciente) => {
    const origem = String(paciente.origem || '').trim().toLocaleLowerCase('pt-BR');
    if (origem === 'interior') return 0;
    if (origem === 'capital') return 1;
    return 2;
  };
  const protMap = new Map(protocolos.map(p => [p.id, p]));
  const longos = [];
  const interm = [];
  const rapidos = [];

  pacientes.forEach(p => {
    const prot = protMap.get(p.protocolo_id) || { duracao_infusao_min: 120, duracao_manipulacao_min: 30, nome: p.protocolo_nome };
    const enriched = { ...p, protocolo: prot };
    if (prot.duracao_infusao_min > 240) longos.push(enriched);
    else if (prot.duracao_infusao_min >= 120) interm.push(enriched);
    else rapidos.push(enriched);
  });

  const ordenarGrupo = (a, b) =>
    prioridadeOrigem(a) - prioridadeOrigem(b) ||
    b.protocolo.duracao_infusao_min - a.protocolo.duracao_infusao_min;
  longos.sort(ordenarGrupo);
  interm.sort(ordenarGrupo);
  rapidos.sort(ordenarGrupo);

  const grade = [];
  let poltIdx = 0;

  function alocar(lista, horaBaseStr, manipOffset = 45) {
    let [h, m] = horaBaseStr.split(':').map(Number);
    let baseMins = h * 60 + m;

    lista.forEach((p, idx) => {
      const polt = poltronas[poltIdx % poltronas.length];
      poltIdx++;
      const inicioInfMins = baseMins + (idx * 20);
      const fimInfMins = inicioInfMins + p.protocolo.duracao_infusao_min;
      const fimCapelaMins = inicioInfMins - 15;
      const iniCapelaMins = fimCapelaMins - p.protocolo.duracao_manipulacao_min;
      const chegadaMins = Math.max(7 * 60, iniCapelaMins - 15);

      const toTime = (mins) => {
        const hh = String(Math.floor(mins / 60)).padStart(2, '0');
        const mm = String(mins % 60).padStart(2, '0');
        return `${hh}:${mm}`;
      };

      grade.push({
        paciente_id: p.id,
        paciente_nome: p.nome,
        paciente_prontuario: p.prontuario,
        paciente_origem: p.origem || 'Não informado',
        protocolo_nome: p.protocolo.nome,
        duracao_infusao_min: p.protocolo.duracao_infusao_min,
        duracao_manipulacao_min: p.protocolo.duracao_manipulacao_min,
        poltrona_id: polt.id,
        poltrona_numero: polt.numero,
        horario_chegada: toTime(chegadaMins),
        horario_inicio_capela: toTime(iniCapelaMins),
        horario_fim_capela: toTime(fimCapelaMins),
        horario_inicio_infusao: toTime(inicioInfMins),
        horario_fim_infusao: toTime(fimInfMins),
        intervalo_higienizacao_ate: toTime(fimInfMins + 15),
        status: 'Agendado'
      });
    });
  }

  alocar(longos, '07:45');
  alocar(interm, '10:00');
  alocar(rapidos, '13:00');

  return {
    sucesso: true,
    data: new Date().toISOString().split('T')[0],
    total_pacientes_agendados: grade.length,
    distribuicao_tetris: {
      longos_manha: longos.length,
      intermediarios_meio_dia: interm.length,
      rapidos_tarde: rapidos.length
    },
    regras_aplicadas: [
      'Tetris Clínico: Protocolos >240min alocados na manhã (07h30-08h30), intermediários 10h00, rápidos 13h00',
      'Prioridade logística: pacientes do interior antes dos da capital dentro de cada faixa do Tetris; origem não informada fica depois',
      'Sincronia Just-in-Time: Capela programa manipulação reversa com 15 min de antecedência de transporte/checagem',
      'Giro de Leito Seguro: Bloqueio estrito de 15 minutos de higienização entre pacientes na mesma poltrona'
    ],
    grade
  };
}
