import React from 'react';
import { FlaskConical, Play, CheckCircle2, User, Clock } from 'lucide-react';

export default function CapelaView({ 
  capelas, 
  fila, 
  onIniciarPreparo, 
  onConcluirPreparo, 
  onSetStatusCapela 
}) {
  const capela = capelas && capelas.length > 0 ? capelas[0] : {
    id: 1,
    nome: 'Capela Fluxo Laminar 01',
    status: 'Disponível',
    paciente_atual_id: null
  };

  const isLivre = capela.status === 'Disponível' || capela.status === 'Livre';
  const isManipulando = capela.status === 'Manipulando';
  const isLimpeza = capela.status === 'Limpeza';

  return (
    <div className="space-y-6">
      
      {/* 1. Painel Superior: Status Visual da Capela de Fluxo Laminar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Informações da Capela */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs ${
              isLivre ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              isManipulando ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' :
              'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <FlaskConical className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{capela.nome}</h3>
                
                {/* Status Visual Simples (Verde: Livre | Laranja: Manipulando | Vermelho: Limpeza/Parada) */}
                <span className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full border flex items-center gap-1.5 ${
                  isLivre ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                  isManipulando ? 'bg-amber-50 text-amber-800 border-amber-300' :
                  'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isLivre ? 'bg-emerald-500' :
                    isManipulando ? 'bg-amber-500 animate-ping' :
                    'bg-rose-500'
                  }`} />
                  {isLivre ? 'Verde: Livre / Disponível' :
                   isManipulando ? 'Laranja: Manipulando' :
                   'Vermelho: Limpeza / Parada'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Farmácia Oncológica • Cabine de Segurança Biológica Classe II B2
              </p>
            </div>
          </div>

          {/* Botões de Ação Rápida do Farmacêutico */}
          <div className="flex flex-wrap items-center gap-2">
            {isManipulando && (
              <button
                onClick={() => onConcluirPreparo(capela.id)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                <span>Concluir e Liberar Bolsa (Bolsa a Caminho)</span>
              </button>
            )}

            {/* Alternadores rápidos de estado */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onSetStatusCapela(capela.id, 'Disponível')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isLivre ? 'bg-white text-emerald-800 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Livre
              </button>
              <button
                onClick={() => onSetStatusCapela(capela.id, 'Limpeza')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isLimpeza ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Limpeza
              </button>
            </div>
          </div>

        </div>

        {/* Detalhe do Paciente em Manipulação Ativa */}
        {isManipulando && (
          <div className="mt-4 pt-4 border-t border-amber-200 bg-amber-50/70 -mx-5 -mb-5 p-5 border-b-2 border-b-amber-500 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {capela.paciente_nome || 'Paciente em Preparo'}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                      Preparo em Curso
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Droga: <strong className="text-slate-800">{capela.tipo_droga || capela.protocolo_nome || 'Citotóxico'}</strong> • Duração estimada: ~{capela.duracao_manipulacao_min || 30} min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-slate-500 font-semibold">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Iniciado via Sincronia Just-in-Time</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Fila de Manipulação da Farmácia */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Fila de Manipulação da Farmácia Oncológica
            </h3>
            <p className="text-xs text-slate-500">
              Ordenada pela prioridade de necessidade da infusão (Just-in-Time: bolsa pronta 15 min antes da punção)
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
            {fila.length} bolsas na fila
          </span>
        </div>

        {fila.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-60" />
            <p className="text-sm text-slate-700 font-bold">Fila de manipulação zerada!</p>
            <p className="text-xs text-slate-400">Todas as bolsas agendadas foram preparadas e liberadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="py-3 px-3">Prioridade / Paciente</th>
                  <th className="py-3 px-3">Protocolo & Fármacos</th>
                  <th className="py-3 px-3">Tempo Manipulação</th>
                  <th className="py-3 px-3">Início Infusão Alvo</th>
                  <th className="py-3 px-3">Status Atual</th>
                  <th className="py-3 px-3 text-right">Ação Farmacêutica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {fila.map((item, idx) => {
                  const emPreparo = item.paciente_status === 'Em Manipulação';

                  return (
                    <tr 
                      key={item.paciente_id} 
                      className={`hover:bg-slate-50 transition-colors ${
                        emPreparo ? 'bg-amber-50/50 font-medium' : ''
                      }`}
                    >
                      {/* Paciente */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center border border-slate-200">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {item.paciente_nome}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 font-semibold">
                              Pront: {item.prontuario}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Protocolo */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-teal-800 block">
                          {item.protocolo_nome}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-xs block font-medium">
                          {item.tipo_droga}
                        </span>
                      </td>

                      {/* Tempo Manipulação */}
                      <td className="py-3.5 px-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                          {item.duracao_manipulacao_min} min
                        </span>
                      </td>

                      {/* Início Infusão Alvo */}
                      <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">
                        {item.horario_inicio_infusao || 'Sob demanda'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          emPreparo
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        }`}>
                          {item.paciente_status}
                        </span>
                      </td>

                      {/* Ação */}
                      <td className="py-3.5 px-3 text-right">
                        {emPreparo ? (
                          <button
                            onClick={() => onConcluirPreparo(capela.id, item.paciente_id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-95 inline-flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Concluir Bolsa</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onIniciarPreparo(capela.id, item.paciente_id)}
                            disabled={!isLivre}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 inline-flex items-center gap-1 shadow-xs ${
                              isLivre
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            }`}
                            title={!isLivre ? 'Capela ocupada ou em limpeza' : 'Iniciar manipulação'}
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Iniciar Preparo</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
