import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  Sliders, 
  FlaskConical, 
  Armchair, 
  ShieldAlert,
  Save
} from 'lucide-react';

export default function SchedulingRulesModal({ 
  isOpen, 
  onClose, 
  protocolos = [], 
  onSalvarProtocolo, 
  regras, 
  onSalvarRegras 
}) {
  // Estado local das regras de intervalo
  const [tempoHigienizacao, setTempoHigienizacao] = useState(regras?.tempo_higienizacao_min || 15);
  const [tempoTransporte, setTempoTransporte] = useState(regras?.tempo_transporte_bolsa_min || 15);
  const [tempoAcomodacao, setTempoAcomodacao] = useState(regras?.tempo_acomodacao_min || 10);
  const [inicioManha, setInicioManha] = useState(regras?.inicio_turno_manha || '07:00');
  const [inicioTarde, setInicioTarde] = useState(regras?.inicio_turno_tarde || '12:30');

  // Estado para cadastro de novo protocolo / droga
  const [showNovoProtocolo, setShowNovoProtocolo] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoTipo, setNovoTipo] = useState('');
  const [novaManipulacao, setNovaManipulacao] = useState(30);
  const [novaInfusao, setNovaInfusao] = useState(120);
  const [novoLimite, setNovoLimite] = useState('13:00');
  const [novaCor, setNovaCor] = useState('Laranja (Intermediário)');

  if (!isOpen) return null;

  const handleSalvarRegras = (e) => {
    e.preventDefault();
    onSalvarRegras({
      tempo_higienizacao_min: Number(tempoHigienizacao),
      tempo_transporte_bolsa_min: Number(tempoTransporte),
      tempo_acomodacao_min: Number(tempoAcomodacao),
      inicio_turno_manha: inicioManha,
      inicio_turno_tarde: inicioTarde
    });
    onClose();
  };

  const handleCriarProtocolo = (e) => {
    e.preventDefault();
    if (!novoNome) return;
    onSalvarProtocolo({
      id: Date.now(),
      nome: novoNome,
      tipo_droga: novoTipo || 'Quimioterápico Antineoplásico',
      duracao_manipulacao_min: Number(novaManipulacao),
      duracao_infusao_min: Number(novaInfusao),
      horarioLimite: novoLimite,
      corFolha: novaCor
    });
    // Limpar form
    setNovoNome('');
    setNovoTipo('');
    setShowNovoProtocolo(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Regras de Agendamento & Gestão de Protocolos</h3>
              <p className="text-xs text-slate-500">Parâmetros de intervalos, turnos de chegada e inclusão de novas drogas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Seção 1: Tempos de Intervalo */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-slate-900 text-sm">Tempos de Intervalo & Sincronia JIT</h4>
            </div>
            <p className="text-slate-500 text-[11px]">
              Ajuste as margens de segurança utilizadas pelo motor de agendamento para calcular a entrada da capela e giro de poltrona.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-700 block mb-1">Giro de Leito / Higienização</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tempoHigienizacao}
                    onChange={(e) => setTempoHigienizacao(e.target.value)}
                    min="5"
                    max="60"
                    step="5"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-mono">min</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Bloqueio obrigatório entre pacientes</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-700 block mb-1">Transporte Capela ➔ Sala</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tempoTransporte}
                    onChange={(e) => setTempoTransporte(e.target.value)}
                    min="5"
                    max="45"
                    step="5"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-mono">min</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Dupla checagem e envio da bolsa</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-700 block mb-1">Acomodação Prévia</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tempoAcomodacao}
                    onChange={(e) => setTempoAcomodacao(e.target.value)}
                    min="5"
                    max="30"
                    step="5"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-mono">min</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Paciente senta antes da bolsa chegar</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-700 block">Início Turno Manhã</label>
                  <span className="text-[10px] text-slate-400">Entrada dos protocolos longos</span>
                </div>
                <input
                  type="time"
                  value={inicioManha}
                  onChange={(e) => setInicioManha(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold text-slate-900 text-xs"
                />
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-700 block">Início Turno Tarde</label>
                  <span className="text-[10px] text-slate-400">Entrada de imunoterapia e rápidos</span>
                </div>
                <input
                  type="time"
                  value={inicioTarde}
                  onChange={(e) => setInicioTarde(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Protocolos e Novas Drogas */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm">Protocolos Cadastrados & Horários-Limite</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowNovoProtocolo(!showNovoProtocolo)}
                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Cadastrar Nova Droga</span>
              </button>
            </div>

            {/* Formulário de Cadastro de Novo Protocolo */}
            {showNovoProtocolo && (
              <form onSubmit={handleCriarProtocolo} className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs space-y-3 animate-in fade-in">
                <span className="font-bold text-teal-900 block text-xs">Cadastrar Novo Protocolo Quimioterápico:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nome do Protocolo</label>
                    <input
                      type="text"
                      placeholder="Ex: R-CHOP, FOLFOX, Imunoterapia Anti-HER2"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tipo da Droga / Classe</label>
                    <input
                      type="text"
                      placeholder="Ex: Anticorpo Monoclonal + Citotóxico"
                      value={novoTipo}
                      onChange={(e) => setNovoTipo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Preparo Capela (min)</label>
                    <input
                      type="number"
                      value={novaManipulacao}
                      onChange={(e) => setNovaManipulacao(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Infusão Poltrona (min)</label>
                    <input
                      type="number"
                      value={novaInfusao}
                      onChange={(e) => setNovaInfusao(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Horário Limite</label>
                    <input
                      type="time"
                      value={novoLimite}
                      onChange={(e) => setNovoLimite(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Categoria / Folha</label>
                    <select
                      value={novaCor}
                      onChange={(e) => setNovaCor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900"
                    >
                      <option value="Vermelho (Longo)">Vermelho (Longo)</option>
                      <option value="Laranja (Intermediário)">Laranja (Intermediário)</option>
                      <option value="Marrom (Intermediário)">Marrom (Intermediário)</option>
                      <option value="Verde (Rápido)">Verde (Rápido)</option>
                      <option value="Azul (Injetável)">Azul (Injetável)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNovoProtocolo(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-500 font-medium hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                  >
                    Salvar Novo Protocolo
                  </button>
                </div>
              </form>
            )}

            {/* Tabela de Protocolos Cadastrados */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Protocolo</th>
                    <th className="py-2.5 px-3">Preparo Capela</th>
                    <th className="py-2.5 px-3">Infusão</th>
                    <th className="py-2.5 px-3">Limite Cut-off</th>
                    <th className="py-2.5 px-3">Classificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {protocolos.map(prot => (
                    <tr key={prot.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{prot.nome}</span>
                        <span className="text-[10px] text-slate-500">{prot.tipo_droga}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                        {prot.duracao_manipulacao_min} min
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                        {prot.duracao_infusao_min} min
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-800">
                        {prot.horarioLimite || '14:00'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-50 border-slate-200 text-slate-700">
                          {prot.corFolha || 'Padrão'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Rodapé com botão de salvar regras */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ✓ Parâmetros aplicados imediatamente ao motor de agendamento Just-in-Time.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSalvarRegras}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
