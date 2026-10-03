import React from 'react';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, UserCheck, Sparkles, Heart } from 'lucide-react';

export default function HojeXProposta() {
  const metricas = [
    {
      indicador: 'Remarcados por perder horário limite',
      hoje: '2 pacientes',
      proposta: '0 pacientes',
      variacao: '100% de adesão (Zero perda)',
      destaque: true,
      tipo: 'positivo'
    },
    {
      indicador: 'Horas de quimioterapia no turno',
      hoje: '132.8 h',
      proposta: '140.8 h',
      variacao: '+8.0 h (+6% de capacidade)',
      destaque: false,
      tipo: 'positivo'
    },
    {
      indicador: 'Horas de poltrona sem tratamento (ociosa)',
      hoje: '54.8 h',
      proposta: '22.5 h',
      variacao: '-59% de ociosidade',
      destaque: true,
      tipo: 'positivo'
    },
    {
      indicador: 'Pacientes que esperam mais de 30 min',
      hoje: '24%',
      proposta: '0%',
      variacao: '-100% de espera prolongada',
      destaque: true,
      tipo: 'positivo'
    },
    {
      indicador: 'Pico de pacientes ao mesmo tempo na unidade',
      hoje: '44 pacientes (Superlotação)',
      proposta: '24 pacientes',
      variacao: '-45% no pico da recepção',
      destaque: false,
      tipo: 'positivo'
    },
    {
      indicador: 'Ocupação da capela (Manhã × Tarde)',
      hoje: '75% manhã / 9% tarde',
      proposta: '48% manhã / 45% tarde',
      variacao: 'Carga 100% balanceada',
      destaque: true,
      tipo: 'positivo'
    }
  ];

  const historicos = [
    {
      id: 'PAC-069',
      nome: 'Maria de Lourdes Santos',
      protocolo: 'FOLFIRINOX',
      tempoAntes: '5h42',
      tempoDepois: '1h06',
      droga: 'Citotóxico (360 min)',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      relato: 'A bolsa já estava preparada 15 min antes dela sentar na poltrona. Economia de 4h36 de espera inútil na recepção.'
    },
    {
      id: 'PAC-041',
      nome: 'Carlos Eduardo Meireles',
      protocolo: 'Paclitaxel + Carbo',
      tempoAntes: '4h50',
      tempoDepois: '1h45',
      droga: 'Taxano (180 min)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      relato: 'Agendado no bloco das 10h pelo Tetris Clínico. Poltrona 02 higienizada e liberada sem tempo fantasma.'
    },
    {
      id: 'PAC-018',
      nome: 'Ana Beatriz Nogueira',
      protocolo: 'Pembrolizumabe',
      tempoAntes: '3h30',
      tempoDepois: '0h55',
      droga: 'Imunoterapia (60 min)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      relato: 'Entrou no início da tarde. Tratamento rápido finalizado pontualmente sem sobrecarregar a capela pela manhã.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Informativo */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Hoje × Proposta Sinfonia</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Ganhos Auditados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparação direta entre o fluxo caótico por ordem de chegada vs. a orquestração inteligente do Sinfonia (Ideathon CBEB 2026).
          </p>
        </div>
        <div className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-900">
          ✓ Meta de espera na poltrona: <strong className="text-teal-950 font-bold">&lt; 15 min</strong>
        </div>
      </div>

      {/* Tabela de Indicadores Lado a Lado */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Tabela de Indicadores: Cenário Atual vs. Proposta</h4>
            <p className="text-xs text-slate-500">Métricas comparativas simuladas com 90 pacientes/dia e 40 poltronas</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Turno: 07h às 18h
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <th className="py-3 px-3">Indicador Clínico / Operacional</th>
                <th className="py-3 px-3 text-rose-800">Cenário Hoje (Atual)</th>
                <th className="py-3 px-3 text-teal-800">Proposta Sinfonia</th>
                <th className="py-3 px-3 text-emerald-700">Variação / Ganho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {metricas.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-sans font-bold text-slate-800 flex items-center gap-2">
                    {m.destaque && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                    {m.indicador}
                  </td>
                  <td className="py-3 px-3 text-rose-700 font-bold">{m.hoje}</td>
                  <td className="py-3 px-3 text-teal-800 font-bold">{m.proposta}</td>
                  <td className="py-3 px-3 text-emerald-700 font-bold font-sans">
                    {m.variacao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórias dos Pacientes (O Que Melhorou) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-teal-600" />
          <h4 className="font-bold text-sm text-slate-900">O Que Melhorou para o Paciente (Histórias Fictícias do Setor)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {historicos.map((h) => (
            <div key={h.id} className="p-4 rounded-xl bg-teal-50/40 border border-teal-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900">{h.id}: {h.nome}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${h.badgeColor}`}>
                    {h.protocolo}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-teal-800 font-mono tracking-tight my-2">
                  {h.tempoAntes} <span className="text-xs text-slate-400 font-sans font-medium">➔</span> {h.tempoDepois}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {h.relato}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-teal-200/60 text-[10px] text-teal-800 font-semibold">
                ✓ Ganho de dignidade e conforto no tratamento
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premissas e Aviso de Validação Hospitalar */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Premissas do Modelo Matemático:</strong> Acomodação na poltrona ocorre 10 minutos antes da chegada da bolsa; transporte hospitalar de 5 minutos; alta antecipada de 5 minutos; intervalo obrigatório de higienização de 15 minutos entre pacientes.
        </p>
      </div>

    </div>
  );
}
