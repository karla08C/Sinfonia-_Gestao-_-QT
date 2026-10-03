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
import { api } from './services/api';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'capela' | 'poltronas' | 'hoje_proposta' | 'gantt'
  const [pacientes, setPacientes] = useState([]);
  const [poltronas, setPoltronas] = useState([]);
  const [capelas, setCapelas] = useState([]);
  const [protocolos, setProtocolos] = useState([]);
  const [filaCapela, setFilaCapela] = useState([]);
  const [kpis, setKpis] = useState(null);

  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isImprevistoOpen, setIsImprevistoOpen] = useState(false);
  const [isSextaFeira, setIsSextaFeira] = useState(false);
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

  // Ação 1-Clique: Avançar Etapa do Paciente no Kanban
  const handleAvancar = async (pacienteId) => {
    try {
      const res = await api.avancarEtapa(pacienteId);
      await carregarDados();
      showToast(`Status atualizado para "${res.novo_status}"!`);
    } catch (err) {
      showToast('Erro ao avançar etapa: ' + err.message, 'erro');
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
        isSextaFeira={isSextaFeira}
        setIsSextaFeira={handleToggleSextaFeira}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Painel de Indicadores (KPIs no topo) */}
        {activeTab === 'kanban' && <KpiCards kpis={kpis} />}

        {/* Barra de Sincronia e Ações Rápidas */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Fluxo Clínico Integrado: <strong className="text-slate-900">Recepção</strong> ➔ <strong className="text-slate-900">Capela Farmácia</strong> ➔ <strong className="text-slate-900">Poltrona de Infusão</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {isSextaFeira && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                Limite -1h (Sexta-feira)
              </span>
            )}
          </div>
        </div>

        {/* Aba 1: Torre de Controle (Kanban em Tempo Real) */}
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

        {/* Aba 5: Gantt da Agenda (Unidade 07h às 18h) */}
        {activeTab === 'gantt' && (
          <GanttAgenda poltronas={poltronas} />
        )}

        {/* Aba 6: Hoje × Proposta (Métricas e Histórias Sinfonia) */}
        {activeTab === 'hoje_proposta' && (
          <HojeXProposta />
        )}

      </main>

      {/* Modal: Motor de Agendamento Inteligente (Tetris Clínico) */}
      <SmartSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onGerarGrade={handleGerarGrade}
        onAplicarGrade={handleAplicarGrade}
        poltronas={poltronas}
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
