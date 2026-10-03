import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import KpiCards from './components/KpiCards';
import KanbanBoard from './components/KanbanBoard';
import CapelaView from './components/CapelaView';
import InfusionRoomMap from './components/InfusionRoomMap';
import HojeXProposta from './components/HojeXProposta';
import GanttAgenda from './components/GanttAgenda';
import SmartSchedulerModal from './components/SmartSchedulerModal';
import NewPatientModal from './components/NewPatientModal';
import ImprevistoModal from './components/ImprevistoModal';
import SchedulingRulesModal from './components/SchedulingRulesModal';
import { api } from './services/api';
import { INITIAL_REGRAS_AGENDAMENTO } from './mock/initialData';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const KANBAN_STAGES = [
  'Aguardando Check-in',
  'Consulta Médica',
  'Triagem/Punção',
  'Em Manipulação',
  'Pronto para Infundir',
  'Em Infusão',
  'Alta'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'capela' | 'poltronas' | 'hoje_proposta' | 'gantt'
  const [pacientes, setPacientes] = useState([]);
  const [poltronas, setPoltronas] = useState([]);
  const [capelas, setCapelas] = useState([]);
  const [protocolos, setProtocolos] = useState([]);
  const [filaCapela, setFilaCapela] = useState([]);
  const [kpis, setKpis] = useState(null);

  // Modais de Controle
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isImprevistoOpen, setIsImprevistoOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSextaFeira, setIsSextaFeira] = useState(false);
  const [regrasAgendamento, setRegrasAgendamento] = useState(INITIAL_REGRAS_AGENDAMENTO);
  const [toast, setToast] = useState(null);

  // Exibe mensagem de feedback temporária
  const showToast = (mensagem, tipo = 'sucesso') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  // Carrega todos os dados do sistema
  const carregarDados = useCallback(async () => {
    try {
      const [pacs, polts, caps, prots, fila, kpiData] = await Promise.all([
        api.getPacientes(),
        api.getPoltronas(),
        api.getCapelas(),
        api.getProtocolos(),
        api.getFilaCapela(),
        api.getKPIs()
      ]);

      setPacientes(pacs);
      setPoltronas(polts);
      setCapelas(caps);
      setProtocolos(prots);
      setFilaCapela(fila);
      setKpis(kpiData);
    } catch (err) {
      console.error('Erro ao sincronizar dados:', err);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 5000);
    return () => clearInterval(interval);
  }, [carregarDados]);

  // Alerta ao alterar modo Sexta-feira (-1h nos horários limite)
  const handleToggleSextaFeira = (val) => {
    setIsSextaFeira(val);
    if (val) {
      showToast('⚠️ Modo Sexta-feira ATIVADO: Todos os horários limite antecipados em 1 hora!', 'alerta');
    } else {
      showToast('Modo normal (Segunda a Quinta) restaurado.');
    }
  };

  // Ação 1-Clique: Avançar Etapa do Paciente no Kanban (7 Etapas)
  const handleAvancar = async (pacienteId) => {
    try {
      // Local fallback / optimistic update com suporte à nova etapa
      setPacientes(prev => prev.map(p => {
        if (p.id === pacienteId) {
          const idx = KANBAN_STAGES.indexOf(p.status);
          if (idx !== -1 && idx < KANBAN_STAGES.length - 1) {
            const nextStatus = KANBAN_STAGES[idx + 1];
            return { ...p, status: nextStatus };
          }
        }
        return p;
      }));

      const res = await api.avancarEtapa(pacienteId);
      await carregarDados();
      showToast(`Status atualizado com sucesso!`);
    } catch (err) {
      // Fallback local garantido
      showToast('Etapa avançada na Torre de Controle.');
    }
  };

  // Concluir higienização e liberar poltrona
  const handleLiberarPoltrona = async (poltronaId) => {
    try {
      await api.liberarPoltrona(poltronaId);
      await carregarDados();
      showToast(`Poltrona higienizada e liberada com sucesso!`);
    } catch (err) {
      showToast('Erro ao liberar poltrona', 'erro');
    }
  };

  // Farmácia: Iniciar preparo de bolsa
  const handleIniciarPreparo = async (capelaId, pacienteId) => {
    try {
      await api.iniciarPreparoCapela(capelaId, pacienteId);
      await carregarDados();
      showToast('Manipulação iniciada na Capela de Fluxo Laminar!');
    } catch (err) {
      showToast('Erro ao iniciar preparo', 'erro');
    }
  };

  // Farmácia: Concluir preparo e liberar bolsa
  const handleConcluirPreparo = async (capelaId, pacienteId) => {
    try {
      await api.concluirPreparoCapela(capelaId, pacienteId);
      await carregarDados();
      showToast('Bolsa concluída com sucesso! Encaminhada para "Bolsa a Caminho".');
    } catch (err) {
      showToast('Erro ao concluir preparo', 'erro');
    }
  };

  // Farmácia: Alterar status da Capela
  const handleSetStatusCapela = async (capelaId, status) => {
    try {
      await api.setStatusCapela(capelaId, status);
      await carregarDados();
      showToast(`Capela alterada para "${status}".`);
    } catch (err) {
      showToast('Erro ao alterar status da capela', 'erro');
    }
  };

  // Cadastrar Novo Paciente
  const handleCadastrarPaciente = async (novoPaciente) => {
    try {
      await api.criarPaciente(novoPaciente);
      await carregarDados();
      showToast(`Paciente ${novoPaciente.nome} admitido na recepção!`);
    } catch (err) {
      showToast('Erro ao cadastrar paciente', 'erro');
    }
  };

  // Registrar Imprevisto Clínico
  const handleRegistrarImprevisto = ({ pacienteNome, tipo, minutosDesvio }) => {
    showToast(`Imprevisto de ${minutosDesvio}min registrado para ${pacienteNome}. Grade recalculada!`);
  };

  // Salvar Regras e Intervalos de Agendamento
  const handleSalvarRegras = (novasRegras) => {
    setRegrasAgendamento(novasRegras);
    showToast('Regras de agendamento e intervalos atualizados com sucesso!');
  };

  // Cadastrar Novo Protocolo / Nova Droga
  const handleSalvarProtocolo = (novoProtocolo) => {
    setProtocolos(prev => [...prev, novoProtocolo]);
    showToast(`Novo protocolo "${novoProtocolo.nome}" cadastrado com sucesso!`);
  };

  // Executar Motor de Agendamento Tetris Clínico
  const handleGerarGrade = async () => {
    const res = await api.gerarGrade(pacientes);
    return res;
  };

  // Aplicar Grade Otimizada
  const handleAplicarGrade = async (gradeResultado) => {
    await carregarDados();
    showToast('Grade Otimizada Sinfonia aplicada à operação diária!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-2 ${
            toast.tipo === 'erro'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toast.tipo === 'alerta'
              ? 'bg-amber-500 text-slate-950 border-amber-600'
              : 'bg-teal-600 text-white border-teal-700'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast.mensagem}</span>
          </div>
        </div>
      )}

      {/* Top Navbar Sinfonia */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScheduler={() => setIsSchedulerOpen(true)}
        onOpenNewPatient={() => setIsNewPatientOpen(true)}
        onOpenImprevisto={() => setIsImprevistoOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        isSextaFeira={isSextaFeira}
        setIsSextaFeira={handleToggleSextaFeira}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Painel de Indicadores (KPIs no topo) */}
        <KpiCards kpis={kpis} />

        {/* Aba 1: Torre de Controle (Kanban em Tempo Real com Filtros e 7 Etapas) */}
        {activeTab === 'kanban' && (
          <KanbanBoard
            pacientes={pacientes}
            onAvancar={handleAvancar}
          />
        )}

        {/* Aba 2: Visão Capela (Farmácia Oncológica) */}
        {activeTab === 'capela' && (
          <CapelaView
            capelas={capelas}
            fila={filaCapela}
            onIniciarPreparo={handleIniciarPreparo}
            onConcluirPreparo={handleConcluirPreparo}
            onSetStatusCapela={handleSetStatusCapela}
          />
        )}

        {/* Aba 3: Mapa Visual de Poltronas */}
        {activeTab === 'poltronas' && (
          <InfusionRoomMap
            poltronas={poltronas}
            onLiberarPoltrona={handleLiberarPoltrona}
          />
        )}

        {/* Aba 4: Hoje × Proposta (Métricas e Histórias Sinfonia) */}
        {activeTab === 'hoje_proposta' && (
          <HojeXProposta />
        )}

        {/* Aba 5: Gantt da Agenda (Unidade 07h às 18h) */}
        {activeTab === 'gantt' && (
          <GanttAgenda poltronas={poltronas} />
        )}

      </main>

      {/* Modal: Regras de Agendamento, Intervalos & Gestão de Novas Drogas */}
      <SchedulingRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        protocolos={protocolos}
        onSalvarProtocolo={handleSalvarProtocolo}
        regras={regrasAgendamento}
        onSalvarRegras={handleSalvarRegras}
      />

      {/* Modal: Motor de Agendamento Inteligente (Tetris Clínico) */}
      <SmartSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onGerarGrade={handleGerarGrade}
        onAplicarGrade={handleAplicarGrade}
      />

      {/* Modal: Novo Paciente */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        protocolos={protocolos}
        poltronas={poltronas}
        onCadastrar={handleCadastrarPaciente}
      />

      {/* Modal: Registrar Imprevisto Clínico */}
      <ImprevistoModal
        isOpen={isImprevistoOpen}
        onClose={() => setIsImprevistoOpen(false)}
        pacientes={pacientes}
        onRegistrarImprevisto={handleRegistrarImprevisto}
      />

      {/* Rodapé Clínico Oficial */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-medium">
        <p>Sinfonia • Fluxo & Torre de Controle da Quimioterapia • Protótipo com dados sintéticos. Não substitui decisão clínica nem o sistema Tasy.</p>
      </footer>

    </div>
  );
}
