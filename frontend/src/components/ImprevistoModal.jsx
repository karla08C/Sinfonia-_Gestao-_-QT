import React, { useState } from 'react';
import { AlertCircle, Clock, X, CheckCircle2, UserX, AlertTriangle } from 'lucide-react';

export default function ImprevistoModal({ isOpen, onClose, pacientes = [], onRegistrarImprevisto }) {
  const [pacienteId, setPacienteId] = useState('');
  const [tipo, setTipo] = useState('Atraso na chegada do paciente (+ minutos)');
  const [minutosDesvio, setMinutosDesvio] = useState(20);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const pac = pacientes.find(p => p.id === Number(pacienteId)) || pacientes[0];
    onRegistrarImprevisto({
      pacienteId: pac ? pac.id : null,
      pacienteNome: pac ? pac.nome : 'Paciente',
      tipo,
      minutosDesvio: Number(minutosDesvio)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold">
                ⚠️
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">Registrar Imprevisto Clínico</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Recálculo automático em cascata (Planejado × Realizado) com preservação da poltrona.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Selecione o Paciente</label>
            <select 
              value={pacienteId || (pacientes[0]?.id || '')}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.prontuario}) - {p.protocolo_nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Tipo de Imprevisto Operacional</label>
            <select 
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="Atraso na chegada do paciente (+ minutos)">Atraso na chegada do paciente (+ minutos)</option>
              <option value="Falta / Não comparecimento (Liberar vaga)">Falta / Não comparecimento (Liberar vaga)</option>
              <option value="Atraso na bolsa pela capela">Atraso na liberação da bolsa pela capela</option>
              <option value="Término real estendido (reação adversa / vazão lenta)">Término real estendido (reação adversa / vazão lenta)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Tempo Estimado de Desvio (minutos)</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="number" 
                value={minutosDesvio}
                onChange={(e) => setMinutosDesvio(e.target.value)}
                min="5"
                max="180"
                step="5"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500" 
              />
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Efeito Cascata Sinfonia:</strong> O paciente permanece na mesma poltrona já atribuída. Os pacientes subsequentes da mesma poltrona têm a capela empurrada automaticamente sem descarte de droga.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              Aplicar Recálculo
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
