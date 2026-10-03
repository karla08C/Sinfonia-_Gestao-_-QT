import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function NewPatientModal({ isOpen, onClose, protocolos, poltronas, onCadastrar }) {
  const [nome, setNome] = useState('');
  const [prontuario, setProntuario] = useState(`ONC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [protocoloId, setProtocoloId] = useState(protocolos[0]?.id || 1);
  const [poltronaId, setPoltronaId] = useState('');
  const [origem, setOrigem] = useState('Não informado');
  const [horarioChegada, setHorarioChegada] = useState(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    onCadastrar({
      nome,
      prontuario,
      protocolo_id: Number(protocoloId),
      poltrona_id: poltronaId ? Number(poltronaId) : null,
      horario_chegada: horarioChegada,
      origem
    });

    onClose();
  };

  const selectedProt = protocolos.find(p => p.id === Number(protocoloId)) || protocolos[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-200">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Admissão de Paciente</h3>
              <p className="text-xs text-slate-500">Entrada na Recepção da Oncologia</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Origem do Paciente
            </label>
            <select
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            >
              <option value="Não informado">Não informado</option>
              <option value="Capital">Capital</option>
              <option value="Interior">Interior</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Nome Completo do Paciente
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Beatriz Miranda Albuquerque"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Prontuário
              </label>
              <input
                type="text"
                required
                value={prontuario}
                onChange={(e) => setProntuario(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 font-semibold focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Horário Chegada
              </label>
              <input
                type="time"
                value={horarioChegada}
                onChange={(e) => setHorarioChegada(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 font-semibold focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Protocolo Quimioterápico
            </label>
            <select
              value={protocoloId}
              onChange={(e) => setProtocoloId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
            >
              {protocolos.map(prot => (
                <option key={prot.id} value={prot.id}>
                  {prot.nome} ({prot.duracao_infusao_min}m infusão • {prot.duracao_manipulacao_min}m capela)
                </option>
              ))}
            </select>
          </div>

          {/* Destaque do Protocolo selecionado e enquadramento no Tetris */}
          {selectedProt && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between text-teal-800 font-bold">
                <span>Classificação Tetris:</span>
                <span>
                  {selectedProt.duracao_infusao_min > 240
                    ? 'Longo (>240m) - Manhã'
                    : selectedProt.duracao_infusao_min >= 120
                    ? 'Intermediário (120-240m) - Meio-dia'
                    : 'Rápido (<120m) - Tarde'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{selectedProt.tipo_droga}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Poltrona de Infusão (Opcional / Automático)
            </label>
            <select
              value={poltronaId}
              onChange={(e) => setPoltronaId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
            >
              <option value="">Atribuir Automaticamente via Motor Tetris</option>
              {poltronas.map(polt => (
                <option key={polt.id} value={polt.id}>
                  {polt.numero} ({polt.status})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              Cadastrar Paciente
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
