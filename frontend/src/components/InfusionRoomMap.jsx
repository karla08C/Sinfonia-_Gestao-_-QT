import React from 'react';
import { Armchair, Clock, CheckCircle, AlertTriangle, User, RefreshCw } from 'lucide-react';

export default function InfusionRoomMap({ poltronas, onLiberarPoltrona }) {
  return (
    <div className="space-y-6">
      
      {/* Cabeçalho do Mapa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Armchair className="w-6 h-6 text-teal-600" />
            <span>Mapa Visual da Sala de Infusão</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Monitoramento de ocupação em tempo real e controle de giro de leito (15 min higienização obrigatória)
          </p>
        </div>

        {/* Legenda de Cores */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span className="text-emerald-800">Verde: Livre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-sky-200"></span>
            <span className="text-sky-800">Azul: Ocupada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span className="text-amber-800">Laranja: Em Higienização</span>
          </div>
        </div>
      </div>

      {/* Grid das Poltronas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {poltronas.map(polt => {
          const isLivre = polt.status === 'Livre';
          const isOcupada = polt.status === 'Ocupada';
          const isHigienizacao = polt.status === 'Higienização';

          const minutosRestantes = polt.minutos_restantes_infusao !== null ? polt.minutos_restantes_infusao : 0;
          const progresso = polt.progresso_pct || 0;
          const isAlerta = polt.alerta_higienizacao;

          return (
            <div
              key={polt.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between min-h-[320px] ${
                isLivre
                  ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                  : isOcupada
                  ? isAlerta
                    ? 'bg-amber-50 border-2 border-amber-400 ring-2 ring-amber-300 shadow-md animate-pulse-fast'
                    : 'bg-sky-50/50 border-sky-200 hover:border-sky-300'
                  : 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
              }`}
            >
              
              {/* Topo do Card da Poltrona */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
                      isLivre
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : isOcupada
                        ? isAlerta
                          ? 'bg-amber-200 text-amber-900 border-amber-300'
                          : 'bg-sky-100 text-sky-800 border-sky-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      <Armchair className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 tracking-tight">{polt.numero}</h4>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Box Clínico</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide rounded-full border ${
                    isLivre
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isOcupada
                      ? isAlerta
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-500'
                        : 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {isLivre ? 'Livre' : isOcupada ? (isAlerta ? 'Alerta Higienização' : 'Ocupada') : 'Higienização'}
                  </span>
                </div>

                {/* Conteúdo Dinâmico por Status */}
                {isLivre && (
                  <div className="py-8 text-center border border-dashed border-emerald-300 rounded-xl my-4 bg-white/70">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
                    <p className="text-sm font-bold text-emerald-800">Pronta para Uso</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Higienização completa realizada</p>
                  </div>
                )}

                {isOcupada && (
                  <div className="space-y-3 my-2">
                    {/* Alerta de Giro se < 15 min */}
                    {isAlerta && (
                      <div className="p-2 rounded-lg bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xs">
                        <AlertTriangle className="w-4 h-4 text-slate-950 flex-shrink-0" />
                        <span>Fim iminente: acionar equipe de higienização!</span>
                      </div>
                    )}

                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-sky-600" />
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {polt.paciente_nome || 'Paciente em Infusão'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold block">
                        Pront: <strong className="text-slate-700">{polt.paciente_prontuario || 'N/D'}</strong>
                      </span>
                      <span className="text-xs font-bold text-teal-800 mt-1 block">
                        {polt.protocolo_nome || 'Protocolo de Quimioterapia'}
                      </span>
                    </div>

                    {/* Barra de Progresso do Tempo de Infusão */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                        <span className="text-slate-600 font-sans font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>Restante:</span>
                        </span>
                        <span className={`font-bold ${isAlerta ? 'text-amber-800 text-sm' : 'text-sky-800'}`}>
                          {minutosRestantes} min
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isAlerta ? 'bg-amber-500' : 'bg-sky-600'
                          }`}
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                        <span>Progresso</span>
                        <span>{progresso}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {isHigienizacao && (
                  <div className="py-6 text-center border border-dashed border-amber-300 rounded-xl my-4 bg-white/70">
                    <RefreshCw className="w-10 h-10 text-amber-600 mx-auto mb-2 animate-spin" />
                    <p className="text-sm font-bold text-amber-900">Em Processo de Higienização</p>
                    <p className="text-xs text-slate-600 mt-1 font-mono font-semibold">Giro de leito padrão: 15 min</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Desinfecção de superfícies e troca de lençóis</p>
                  </div>
                )}
              </div>

              {/* Botão de Rodapé para Poltrona em Higienização */}
              {isHigienizacao ? (
                <button
                  onClick={() => onLiberarPoltrona(polt.id)}
                  className="w-full mt-3 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Liberar Poltrona (Concluir Limpeza)</span>
                </button>
              ) : isLivre ? (
                <div className="mt-3 text-center py-1 text-xs text-emerald-800 font-bold bg-emerald-100 rounded-lg border border-emerald-300">
                  Disponível para Agendamento
                </div>
              ) : (
                <div className="mt-3 text-center py-1 text-[11px] text-slate-500 font-mono bg-slate-100 rounded-lg border border-slate-200">
                  Infusão Ativa • Poltrona Bloqueada
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
