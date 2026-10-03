import React from 'react';
import { Clock, Armchair, FlaskConical, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function KpiCards({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* KPI 1: Total de Horas de QT Realizadas Hoje */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Horas QT no Turno</span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {kpis.total_horas_qt_realizadas || '0h 00m'}
          </span>
          <span className="text-xs text-teal-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +8.0h vs Atual
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Capacidade maximizada no turno</p>
      </div>

      {/* KPI 2: Tempo Médio de Espera Porta-Agulha */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tempo Porta-Agulha</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {kpis.tempo_medio_porta_agulha_min} <span className="text-lg font-normal text-slate-500">min</span>
          </span>
          <span className="text-xs text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
            -42% via JIT
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Chegada até a punção venosa</p>
      </div>

      {/* KPI 3: Taxa de Ocupação das Poltronas */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ocupação das Poltronas</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Armchair className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {kpis.taxa_ocupacao_poltronas_pct}%
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ({kpis.poltronas_ocupadas || 0}/{kpis.total_poltronas || 4} ativas)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${kpis.taxa_ocupacao_poltronas_pct}%` }}
          />
        </div>
      </div>

      {/* KPI 4: Status da Capela & Giro de Leito */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Capela de Fluxo Laminar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              kpis.capela_status === 'Manipulando' ? 'bg-amber-500 animate-ping' :
              kpis.capela_status === 'Disponível' ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
            <span className="text-sm font-bold text-slate-900">
              Capela {kpis.capela_status || 'Disponível'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Fluxo Laminar 01 (Ativo)</p>
        </div>

        {kpis.alertas_higienizacao_ativos > 0 ? (
          <div className="mt-2 flex items-center justify-between px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold animate-pulse">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {kpis.alertas_higienizacao_ativos} Higienização Alerta!
            </span>
          </div>
        ) : (
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fluxo normal
          </span>
        )}
      </div>

    </div>
  );
}
