import React, { useState, useMemo } from 'react';
import PatientCard from './PatientCard';
import { 
  UserCheck, 
  Stethoscope, 
  FlaskConical, 
  Truck, 
  Armchair, 
  CheckCircle2,
  Search,
  Filter,
  X,
  Activity
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'Aguardando Check-in',
    title: '1. Recepção / Check-in',
    icon: UserCheck,
    color: 'border-blue-200 bg-blue-50/70 text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'Consulta Médica',
    title: '2. Consulta & Liberação',
    icon: Stethoscope,
    color: 'border-purple-200 bg-purple-50/70 text-purple-900',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'Triagem/Punção',
    title: '3. Triagem e Punção',
    icon: Activity,
    color: 'border-indigo-200 bg-indigo-50/70 text-indigo-900',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'Em Manipulação',
    title: '4. Capela Manipulando',
    icon: FlaskConical,
    color: 'border-amber-200 bg-amber-50/70 text-amber-900',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'Pronto para Infundir',
    title: '5. Bolsa a Caminho',
    icon: Truck,
    color: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'Em Infusão',
    title: '6. Poltrona em Infusão',
    icon: Armchair,
    color: 'border-teal-200 bg-teal-50/70 text-teal-900',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  {
    id: 'Alta',
    title: '7. Finalizado / Alta',
    icon: CheckCircle2,
    color: 'border-slate-200 bg-slate-100 text-slate-800',
    badgeColor: 'bg-slate-200 text-slate-700 border-slate-300'
  }
];

export default function KanbanBoard({ pacientes = [], onAvancar, onSelectPatient }) {
  // Filtros Avançados
  const [busca, setBusca] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');
  const [filtroProtocolo, setFiltroProtocolo] = useState('');

  // Opções para filtros
  const medicosDisponiveis = useMemo(() => {
    const set = new Set();
    pacientes.forEach(p => { if (p.medico) set.add(p.medico); });
    return Array.from(set);
  }, [pacientes]);

  const protocolosDisponiveis = useMemo(() => {
    const set = new Set();
    pacientes.forEach(p => { if (p.protocolo_nome) set.add(p.protocolo_nome); });
    return Array.from(set);
  }, [pacientes]);

  // Aplicação dos Filtros
  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter(p => {
      if (busca) {
        const termo = busca.toLowerCase();
        const nomeMatch = p.nome && p.nome.toLowerCase().includes(termo);
        const prontMatch = p.prontuario && p.prontuario.toLowerCase().includes(termo);
        if (!nomeMatch && !prontMatch) return false;
      }
      if (filtroMedico && p.medico !== filtroMedico) return false;
      if (filtroTurno && p.turno !== filtroTurno) return false;
      if (filtroProtocolo && p.protocolo_nome !== filtroProtocolo) return false;
      return true;
    });
  }, [pacientes, busca, filtroMedico, filtroTurno, filtroProtocolo]);

  // Agrupamento por etapa
  const grouped = useMemo(() => {
    const g = {};
    COLUMNS.forEach(col => {
      g[col.id] = pacientesFiltrados.filter(p => p.status === col.id);
    });
    return g;
  }, [pacientesFiltrados]);

  const temFiltroAtivo = Boolean(busca || filtroMedico || filtroTurno || filtroProtocolo);

  const limparFiltros = () => {
    setBusca('');
    setFiltroMedico('');
    setFiltroTurno('');
    setFiltroProtocolo('');
  };

  return (
    <div className="space-y-3.5">
      
      {/* Barra de Filtros Avançados */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          
          {/* Busca por Nome / Prontuário */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por paciente ou prontuário (ex: PAC-069)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
            />
            {busca && (
              <button 
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Select */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filtro Médico */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <select
                value={filtroMedico}
                onChange={(e) => setFiltroMedico(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-hidden"
              >
                <option value="">Médico: Todos</option>
                {medicosDisponiveis.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Filtro Turno */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <span className="text-xs">☀️</span>
              <select
                value={filtroTurno}
                onChange={(e) => setFiltroTurno(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-hidden"
              >
                <option value="">Turno: Todos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>

            {/* Filtro Protocolo */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filtroProtocolo}
                onChange={(e) => setFiltroProtocolo(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-hidden"
              >
                <option value="">Protocolo: Todos</option>
                {protocolosDisponiveis.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Contador & Limpar Filtros */}
            <div className="flex items-center gap-2 pl-1">
              <span className="text-[11px] font-mono text-slate-500 font-semibold whitespace-nowrap">
                {pacientesFiltrados.length} de {pacientes.length} pac.
              </span>
              {temFiltroAtivo && (
                <button
                  onClick={limparFiltros}
                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1"
                  title="Limpar todos os filtros"
                >
                  <X className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Linha de Colunas do Kanban com Rolagem Suave e Espaçamento Confortável */}
      <div className="flex gap-3 overflow-x-auto pb-4 items-start scroll-smooth">
        {COLUMNS.map(col => {
          const Icon = col.icon;
          const pacsNaColuna = grouped[col.id] || [];

          return (
            <div 
              key={col.id}
              className="w-[270px] shrink-0 bg-slate-100/75 rounded-2xl p-2.5 border border-slate-200/80 flex flex-col min-h-[490px]"
            >
              {/* Header da Coluna */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span className="font-bold text-xs text-slate-800 tracking-tight leading-tight truncate">
                    {col.title}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${col.badgeColor}`}>
                  {pacsNaColuna.length}
                </span>
              </div>

              {/* Lista de Cards de Pacientes */}
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5 max-h-[calc(100vh-270px)]">
                {pacsNaColuna.length === 0 ? (
                  <div className="h-24 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs text-center p-2 bg-white/40">
                    <span>Sem pacientes</span>
                  </div>
                ) : (
                  pacsNaColuna.map(pac => (
                    <PatientCard
                      key={pac.id}
                      paciente={pac}
                      onAvancar={onAvancar}
                      onSelect={onSelectPatient}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
