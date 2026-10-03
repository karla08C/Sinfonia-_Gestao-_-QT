import React from 'react';
import { Sparkles, UserPlus, AlertTriangle, FileText } from 'lucide-react';

export default function Navbar({ 
  onOpenScheduler, 
  onOpenNewPatient, 
  onOpenImprevisto,
  activeTab, 
  setActiveTab,
  isSextaFeira,
  setIsSextaFeira
}) {
  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Título Sinfonia */}
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Sinfonia</span>
                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                  Fluxo QT
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Orquestração em Tempo Real: Recepção • Capela • Infusão</p>
            </div>
          </div>

          {/* Navegação entre Abas (Incluindo as do Sinfonia) */}
          <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'kanban'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Torre de Controle
            </button>
            <button
              onClick={() => setActiveTab('capela')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'capela'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Capela
            </button>
            <button
              onClick={() => setActiveTab('poltronas')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'poltronas'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mapa Poltronas
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'gantt'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Gantt
            </button>
            <button
              onClick={() => setActiveTab('hoje_proposta')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'hoje_proposta'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              📊 Hoje × Proposta
            </button>
          </nav>

          {/* Horário & Ações Rápidas */}
          <div className="flex items-center gap-2">
            {/* Toggle Sexta-feira */}
            <label className="hidden xl:flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isSextaFeira}
                onChange={(e) => setIsSextaFeira(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span className={isSextaFeira ? 'text-amber-800 font-bold' : 'text-slate-600'}>
                {isSextaFeira ? '⚠️ Sexta (-1h)' : 'Sexta-feira'}
              </span>
            </label>

            <button
              onClick={onOpenImprevisto}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-all flex items-center gap-1"
              title="Registrar imprevisto clínico"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Imprevistos</span>
            </button>

            <button
              onClick={onOpenScheduler}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-100" />
              <span className="hidden sm:inline">Grade Tetris</span>
            </button>

            <button
              onClick={onOpenNewPatient}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-600 inline mr-1" />
              <span className="hidden sm:inline">Paciente</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
