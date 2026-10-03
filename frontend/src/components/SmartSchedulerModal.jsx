import React, { useState } from 'react';
import { X, Sparkles, Check, Armchair, FlaskConical, Layers, Clock3 } from 'lucide-react';

const TURNO_INICIO = 7 * 60;
const TURNO_FIM = 18 * 60;
const TEMPO_HIGIENIZACAO = 15;

function paraMinutos(horario) {
  if (!horario || !/^\d{2}:\d{2}$/.test(horario)) return null;
  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
}

function formatarDuracao(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return horas ? `${horas}h ${String(resto).padStart(2, '0')}min` : `${resto}min`;
}

function calcularOciosidade(grade, poltronas) {
  const cadeiras = poltronas.map(poltrona => ({ ...poltrona, intervalos: [] }));

  grade.forEach(item => {
    const cadeira = cadeiras.find(poltrona =>
      (item.poltrona_id != null && poltrona.id === item.poltrona_id) ||
      (item.poltrona_numero && poltrona.numero === item.poltrona_numero)
    );
    const inicio = paraMinutos(item.horario_inicio_infusao);
    const fim = paraMinutos(item.horario_fim_infusao);
    if (cadeira && inicio != null && fim != null && fim > inicio) {
      cadeira.intervalos.push({ inicio: Math.max(TURNO_INICIO, inicio), fim: Math.min(TURNO_FIM, fim + TEMPO_HIGIENIZACAO) });
    }
  });

  return cadeiras.map(cadeira => {
    const intervalos = cadeira.intervalos
      .filter(intervalo => intervalo.fim > intervalo.inicio)
      .sort((a, b) => a.inicio - b.inicio)
      .reduce((unidos, atual) => {
        const anterior = unidos[unidos.length - 1];
        if (anterior && atual.inicio <= anterior.fim) anterior.fim = Math.max(anterior.fim, atual.fim);
        else unidos.push({ ...atual });
        return unidos;
      }, []);
    const ocupados = intervalos.reduce((total, intervalo) => total + intervalo.fim - intervalo.inicio, 0);
    const ociosos = TURNO_FIM - TURNO_INICIO - ocupados;
    const lacunas = [];
    let cursor = TURNO_INICIO;
    intervalos.forEach(intervalo => {
      if (intervalo.inicio > cursor) lacunas.push(intervalo.inicio - cursor);
      cursor = Math.max(cursor, intervalo.fim);
    });
    if (cursor < TURNO_FIM) lacunas.push(TURNO_FIM - cursor);

    return {
      ...cadeira,
      minutosOciosos: ociosos,
      percentualOcioso: Math.round((ociosos / (TURNO_FIM - TURNO_INICIO)) * 100),
      maiorLacuna: Math.max(0, ...lacunas)
    };
  });
}

export default function SmartSchedulerModal({ isOpen, onClose, onGerarGrade, onAplicarGrade, poltronas = [] }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  if (!isOpen) return null;

  const handleGerar = async () => {
    setLoading(true);
    try {
      const res = await onGerarGrade();
      setResultado(res);
    } catch (err) {
      console.error('Erro ao gerar grade:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Motor de Agendamento Inteligente: Tetris Clínico
              </h3>
              <p className="text-xs text-slate-500">
                Otimização combinatória com Sincronia Just-in-Time da Capela e Giro Seguro de Leito
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* As 3 Regras de Negócio em Destaque */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
              <div className="flex items-center gap-2 mb-1.5 text-teal-900 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4 text-teal-700" />
                <span>1. Regra Tetris Clínico</span>
              </div>
              <p className="text-xs text-teal-800 leading-relaxed">
                • <strong>&gt;240m:</strong> Manhã (07h30 - 08h30)<br />
                • <strong>120m a 240m:</strong> A partir das 10h00<br />
                • <strong>&lt;120m:</strong> Início da tarde (13h00)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <FlaskConical className="w-4 h-4 text-amber-700" />
                <span>2. Capela Just-in-Time</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Início = Infusão - Manipulação - <strong>15 min</strong> (transporte e checagem). Conflitos na capela são resolvidos sem ociosidade.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <div className="flex items-center gap-2 mb-1.5 text-sky-900 font-bold text-xs uppercase tracking-wider">
                <Armchair className="w-4 h-4 text-sky-700" />
                <span>3. Previsão Giro de Leito</span>
              </div>
              <p className="text-xs text-sky-800 leading-relaxed">
                Bloqueio obrigatório de <strong>15 minutos</strong> para higienização e assepsia antes da próxima infusão na mesma poltrona.
              </p>
            </div>

          </div>

          {/* Botão de Disparo do Motor */}
          {!resultado && (
            <div className="text-center py-10 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3 border border-teal-200">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Pronto para Otimizar a Grade de Quimioterapia
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                O motor irá analisar a duração dos protocolos, a disponibilidade da capela de fluxo laminar e o giro das 4 poltronas.
              </p>
              <button
                onClick={handleGerar}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/25 transition-all inline-flex items-center gap-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculando Grade Otimizada...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Executar Motor de Agendamento Tetris</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Resultado da Grade Otimizada */}
          {resultado && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Grade Gerada com Sucesso para {resultado.data}</span>
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
                    <span>Total: <strong className="text-slate-900">{resultado.total_pacientes_agendados} pacientes</strong></span>
                    <span>• Manhã: <strong className="text-teal-700">{resultado.distribuicao_tetris?.longos_manha || 0}</strong></span>
                    <span>• Meio-dia: <strong className="text-indigo-700">{resultado.distribuicao_tetris?.intermediarios_meio_dia || 0}</strong></span>
                    <span>• Tarde: <strong className="text-amber-700">{resultado.distribuicao_tetris?.rapidos_tarde || 0}</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Prioridade logística: interior antes da capital dentro de cada faixa de duração. Pacientes sem origem informada ficam depois.</p>
                </div>

                <button
                  onClick={handleGerar}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors"
                >
                  Recalcular Grade
                </button>
              </div>

              <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-sky-950">
                      <Clock3 className="w-4 h-4 text-sky-700" /> Previsão de ociosidade das poltronas
                    </h4>
                    <p className="text-xs text-sky-800 mt-1">Estimativa por poltrona no turno das 07h às 18h, considerando infusão e 15 min de higienização.</p>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-800 bg-white/80 border border-sky-200 rounded-lg px-2.5 py-1.5">
                    Lacunas entre pacientes e no início/fim do turno
                  </span>
                </div>
                {poltronas.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                    {calcularOciosidade(resultado.grade || [], poltronas).map(poltrona => (
                      <div key={poltrona.id} className="rounded-xl border border-sky-100 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800">{poltrona.numero}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${poltrona.percentualOcioso > 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {poltrona.percentualOcioso}% livre
                          </span>
                        </div>
                        <p className="text-lg font-extrabold text-sky-900 font-mono mt-1">{formatarDuracao(poltrona.minutosOciosos)}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Maior janela livre: {formatarDuracao(poltrona.maiorLacuna)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-sky-800">Não há poltronas cadastradas para calcular a ociosidade.</p>
                )}
              </section>

              {/* Tabela Detalhada com Sincronia de Tempos */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Paciente</th>
                      <th className="py-2.5 px-3">Origem</th>
                      <th className="py-2.5 px-3">Protocolo</th>
                      <th className="py-2.5 px-3">Poltrona</th>
                      <th className="py-2.5 px-3">Chegada</th>
                      <th className="py-2.5 px-3 text-amber-900">Capela (JIT)</th>
                      <th className="py-2.5 px-3 text-teal-900">Infusão QT</th>
                      <th className="py-2.5 px-3 text-slate-600">Higienização até</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono">
                    {resultado.grade.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                          {item.paciente_nome}
                          <span className="block text-[10px] text-slate-500 font-mono font-semibold">{item.paciente_prontuario}</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.paciente_origem === 'Interior' ? 'bg-amber-100 text-amber-800' : item.paciente_origem === 'Capital' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>
                            {item.paciente_origem || 'Não informado'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="text-teal-800 font-bold">{item.protocolo_nome}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">{item.duracao_infusao_min}m QT</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-700">
                          {item.poltrona_numero}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {item.horario_chegada}
                        </td>
                        <td className="py-2.5 px-3 text-amber-800 font-bold">
                          {item.horario_inicio_capela} - {item.horario_fim_capela}
                        </td>
                        <td className="py-2.5 px-3 text-teal-800 font-bold">
                          {item.horario_inicio_infusao} - {item.horario_fim_infusao}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {item.intervalo_higienizacao_ate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-xs font-bold transition-colors"
          >
            Fechar
          </button>
          {resultado && (
            <button
              onClick={() => {
                onAplicarGrade && onAplicarGrade(resultado);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar e Aplicar Grade Otimizada</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
