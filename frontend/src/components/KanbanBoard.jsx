import React from 'react';
import PatientCard from './PatientCard';
import { 
  UserCheck, 
  Stethoscope, 
  FlaskConical, 
  Truck, 
  Armchair, 
  CheckCircle2
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'Aguardando Check-in',
    title: '1. Recepção / Check-in',
    icon: UserCheck,
    color: 'border-blue-200 bg-blue-50/80 text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'Triagem/Punção',
    title: '2. Triagem e Punção',
    icon: Stethoscope,
    color: 'border-indigo-200 bg-indigo-50/80 text-indigo-900',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'Em Manipulação',
    title: '3. Capela Manipulando',
    icon: FlaskConical,
    color: 'border-amber-200 bg-amber-50/80 text-amber-900',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'Pronto para Infundir', // Bolsa a Caminho
    title: '4. Bolsa a Caminho',
    icon: Truck,
    color: 'border-emerald-200 bg-emerald-50/80 text-emerald-900',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'Em Infusão',
    title: '5. Poltrona em Infusão',
    icon: Armchair,
    color: 'border-teal-200 bg-teal-50/80 text-teal-900',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  {
    id: 'Alta',
    title: '6. Finalizado / Alta',
    icon: CheckCircle2,
    color: 'border-slate-200 bg-slate-100 text-slate-800',
    badgeColor: 'bg-slate-200 text-slate-700 border-slate-300'
  }
];

export default function KanbanBoard({ pacientes, onAvancar, onSelectPatient }) {
  const grouped = {};
  COLUMNS.forEach(col => {
    grouped[col.id] = pacientes.filter(p => p.status === col.id);
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Fluxo Contínuo da Quimioterapia (Tempo Real)
          </h2>
          <span className="text-xs bg-white px-2.5 py-0.5 rounded-full text-slate-600 border border-slate-200 font-semibold shadow-2xs">
            {pacientes.length} pacientes hoje
          </span>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block font-medium">
          Clique no botão de ação rápida do card para avançar a etapa
        </p>
      </div>

      {/* Grid horizontal das 6 colunas do Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 items-start pb-4">
        {COLUMNS.map(col => {
          const list = grouped[col.id] || [];
          const IconComponent = col.icon;

          return (
            <div
              key={col.id}
              className="bg-slate-100/80 rounded-2xl border border-slate-200 p-2.5 sm:p-3 min-w-0 flex flex-col min-h-[260px] sm:min-h-[320px]"
            >
              {/* Cabeçalho da Coluna */}
              <div className={`p-2 rounded-xl border mb-3 flex items-center justify-between gap-2 shadow-2xs ${col.color}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs tracking-tight leading-snug">{col.title}</span>
                </div>
                <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${col.badgeColor}`}>
                  {list.length}
                </span>
              </div>

              {/* Lista de Cards de Pacientes */}
              <div className="space-y-3 flex-1 min-w-0">
                {list.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-3 text-center">
                    <span className="text-xs text-slate-400 font-semibold">Nenhum paciente</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Etapa liberada</span>
                  </div>
                ) : (
                  list.map(paciente => (
                    <PatientCard
                      key={paciente.id}
                      paciente={paciente}
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
