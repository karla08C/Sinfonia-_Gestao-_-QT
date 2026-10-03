import React from 'react';
import { 
  ArrowRight, 
  Clock, 
  Armchair, 
  AlertTriangle, 
  CheckCircle, 
  Droplets, 
  Stethoscope, 
  Activity, 
  FileCheck
} from 'lucide-react';

const NEXT_STAGE_LABELS = {
  'Aguardando Check-in': { label: 'Encaminhar Consulta', next: 'Consulta Médica', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  'Consulta Médica': { label: 'Liberar p/ Triagem', next: 'Triagem/Punção', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  'Triagem/Punção': { label: 'Enviar p/ Capela', next: 'Em Manipulação', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  'Em Manipulação': { label: 'Liberar Bolsa', next: 'Pronto para Infundir', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
  'Pronto para Infundir': { label: 'Iniciar Infusão', next: 'Em Infusão', color: 'bg-teal-600 hover:bg-teal-700 text-white' },
  'Em Infusão': { label: 'Concluir Alta', next: 'Alta', color: 'bg-slate-700 hover:bg-slate-800 text-white' },
  'Alta': null
};

export default function PatientCard({ paciente, onAvancar, onSelect }) {
  const isEmInfusao = paciente.status === 'Em Infusão';
  const minutosRestantes = paciente.minutos_restantes_infusao !== null ? paciente.minutos_restantes_infusao : 0;
  const duracaoTotal = paciente.duracao_infusao_min || 120;
  const tempoTranscorrido = Math.max(0, duracaoTotal - minutosRestantes);
  const progresso = Math.min(100, Math.round((tempoTranscorrido / duracaoTotal) * 100));

  // Alerta de Giro de Leito: Faltando 15 min ou menos para acabar a infusão
  const isAlertaHigienizacao = isEmInfusao && minutosRestantes <= 15;

  const nextAction = NEXT_STAGE_LABELS[paciente.status];

  return (
    <div
      onClick={() => onSelect && onSelect(paciente)}
      className={`rounded-xl p-3 transition-all shadow-xs relative cursor-pointer border ${
        isAlertaHigienizacao
          ? 'border-2 border-amber-400 bg-amber-50 ring-2 ring-amber-300 shadow-md animate-pulse-fast'
          : isEmInfusao
          ? 'bg-white border-2 border-teal-300 shadow-xs'
          : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Faixa de Alerta: Acionar Higienização (15 minutos antes) */}
      {isAlertaHigienizacao && (
        <div className="mb-2 px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 fill-slate-950 text-amber-400" />
            <span className="uppercase tracking-wide text-[10px]">Acionar Higienização!</span>
          </div>
          <span className="font-mono text-[11px]">{minutosRestantes}m restantes</span>
        </div>
      )}

      {/* Badges de Topo: Turno, Ciclo e Horários */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          {paciente.turno && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              paciente.turno === 'Manhã' 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}>
              ☀️ {paciente.turno}
            </span>
          )}
          {paciente.ciclo && (
            <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {paciente.ciclo}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {paciente.horarioLimite && (
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold" title="Horário limite do protocolo">
              Lim: {paciente.horarioLimite}
            </span>
          )}
          {paciente.horario_chegada && (
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold" title="Horário de chegada">
              {paciente.horario_chegada}
            </span>
          )}
        </div>
      </div>

      {/* Header do Card: Nome e Prontuário */}
      <div>
        <h4 className="font-bold text-xs text-slate-900 hover:text-teal-700 transition-colors leading-snug">
          {paciente.nome}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {paciente.prontuario}
          </span>
          {paciente.medico && (
            <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1 truncate max-w-[130px]">
              <Stethoscope className="w-3 h-3 text-teal-600 shrink-0" />
              <span className="truncate">{paciente.medico}</span>
            </span>
          )}
        </div>
      </div>

      {/* Protocolo & Droga */}
      <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-teal-800 truncate max-w-[140px] text-[11px]">
            {paciente.protocolo_nome}
          </span>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">
            {paciente.duracao_infusao_min}m QT
          </span>
        </div>
        {paciente.tipo_droga && (
          <p className="text-[9px] text-slate-500 truncate mt-0.5 font-medium">
            {paciente.tipo_droga}
          </p>
        )}
      </div>

      {/* Detalhes Clínicos: Acesso Venoso & Exames */}
      <div className="mt-1.5 flex items-center justify-between text-[9px] font-medium text-slate-500 px-0.5">
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-indigo-500" />
          <span>{paciente.acesso_venoso || 'Acesso Venoso'}</span>
        </div>

        {paciente.exames_status && (
          <span className={`flex items-center gap-1 font-semibold ${
            paciente.exames_status.includes('Liberados') ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            <FileCheck className="w-3 h-3" />
            <span>{paciente.exames_status}</span>
          </span>
        )}
      </div>

      {/* Poltrona / Capela */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <Armchair className="w-3 h-3 text-slate-400" />
          <span className="text-[11px]">
            {paciente.poltrona_numero ? (
              <strong className="text-teal-700 font-bold font-mono">{paciente.poltrona_numero}</strong>
            ) : (
              <span className="text-slate-400 italic text-[10px]">Poltrona pendente</span>
            )}
          </span>
        </div>

        {paciente.status === 'Em Manipulação' && (
          <span className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
            <Droplets className="w-3 h-3 text-amber-600 animate-bounce" />
            Capela 01
          </span>
        )}
      </div>

      {/* Painel Em Infusão (Timer & Progresso) */}
      {isEmInfusao && (
        <div className="mt-2 pt-1.5 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1 font-mono">
            <span className="flex items-center gap-1 text-slate-500 font-sans font-medium text-[10px]">
              <Clock className="w-3 h-3 text-teal-600" />
              <span>Restante:</span>
            </span>
            <span className={`font-bold ${isAlertaHigienizacao ? 'text-amber-800 text-xs' : 'text-teal-700 text-xs'}`}>
              {minutosRestantes} min
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isAlertaHigienizacao ? 'bg-amber-500' : 'bg-teal-600'
              }`}
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      )}

      {/* Botão de Avançar Etapa (1 clique) */}
      {nextAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAvancar(paciente.id);
          }}
          className={`w-full mt-2 py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 ${nextAction.color}`}
        >
          <span>{nextAction.label}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}

      {paciente.status === 'Alta' && (
        <div className="mt-2 py-1 px-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-[10px] font-bold flex items-center justify-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span>Tratamento Concluído</span>
        </div>
      )}
    </div>
  );
}
