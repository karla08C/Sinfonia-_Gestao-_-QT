import React from 'react';
import { Calendar, Clock, Armchair, FlaskConical, Sparkles, Download } from 'lucide-react';

export default function GanttAgenda({ poltronas = [] }) {
  const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Poltrona,Paciente,Prontuario,Protocolo,HorarioInicio,HorarioFim,CapelaInicio,CapelaFim\n"
      + "Poltrona 01,Maria de Lourdes Santos,PAC-069,FOLFIRINOX,08:00,14:00,07:00,07:45\n"
      + "Poltrona 02,Carlos Eduardo Meireles,PAC-041,Paclitaxel + Carbo,10:00,13:00,09:10,09:45\n"
      + "Poltrona 03,Ana Beatriz Nogueira,PAC-018,Pembrolizumabe,13:00,14:00,12:25,12:45\n"
      + "Poltrona 04,João Pedro Alcantara,PAC-024,AC-T,10:30,13:00,09:45,10:15\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sinfonia_agenda_otimizada.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Diagrama de Gantt da Unidade</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
              07h00 às 18h00
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Linha do tempo sincronizada entre poltronas de infusão, capela de fluxo laminar e intervalos de higienização.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Exportar Grade CSV</span>
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-teal-800">
            <span className="w-3.5 h-3.5 bg-teal-600 rounded"></span> Infusão Quimioterápica
          </span>
          <span className="flex items-center gap-1.5 text-amber-800">
            <span className="w-3.5 h-3.5 bg-amber-500 rounded"></span> Manipulação Capela (JIT)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3.5 h-3.5 bg-slate-300 rounded"></span> Giro de Leito (15 min)
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Escala de 11 Horas Clínicas</span>
      </div>

      {/* Grid Gantt */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-x-auto">
        <div className="min-w-[760px] space-y-4">
          
          {/* Régua de Horas */}
          <div className="grid grid-cols-12 text-[10px] font-mono text-slate-400 font-bold border-b border-slate-200 pb-2">
            {horas.map((h, i) => (
              <span key={i} className="text-center">{h}</span>
            ))}
          </div>

          {/* Linha da Capela */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">Capela de Fluxo Laminar 01 (Farmácia)</span>
            </div>
            <div className="h-8 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex items-center">
              <div 
                className="absolute left-[7%] w-[12%] h-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                title="PAC-069 - FOLFIRINOX (45 min manipulação)"
              >
                PAC-069 (45m)
              </div>
              <div 
                className="absolute left-[23%] w-[10%] h-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                title="PAC-041 - Paclitaxel (35 min manipulação)"
              >
                PAC-041 (35m)
              </div>
              <div 
                className="absolute left-[38%] w-[8%] h-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                title="PAC-018 - Pembrolizumabe (20 min manipulação)"
              >
                PAC-018 (20m)
              </div>
              <div 
                className="absolute left-[50%] w-[9%] h-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                title="PAC-024 - AC-T (30 min manipulação)"
              >
                PAC-024 (30m)
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-slate-100 my-2" />

          {/* Poltronas */}
          <div className="space-y-3">
            {/* Poltrona 01 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Armchair className="w-3.5 h-3.5 text-teal-700" />
                <span className="text-xs font-bold text-slate-700">Poltrona 01</span>
              </div>
              <div className="h-8 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex items-center">
                <div 
                  className="absolute left-[9%] w-[52%] h-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                  title="PAC-069: Maria de Lourdes Santos - FOLFIRINOX (360 min)"
                >
                  PAC-069: Maria de Lourdes (360 min)
                </div>
                <div 
                  className="absolute left-[61%] w-[4.5%] h-6 bg-slate-300 text-slate-700 font-bold text-[9px] rounded-lg flex items-center justify-center"
                  title="Higienização obrigatória: 15 min"
                >
                  15m
                </div>
                <div 
                  className="absolute left-[66%] w-[25%] h-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                  title="PAC-033: Protocolo XELOX (120 min)"
                >
                  PAC-033 (120m)
                </div>
              </div>
            </div>

            {/* Poltrona 02 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Armchair className="w-3.5 h-3.5 text-teal-700" />
                <span className="text-xs font-bold text-slate-700">Poltrona 02</span>
              </div>
              <div className="h-8 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex items-center">
                <div 
                  className="absolute left-[18%] w-[33%] h-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                  title="PAC-041: Carlos Eduardo - Paclitaxel + Carbo (180 min)"
                >
                  PAC-041: Carlos Eduardo (180 min)
                </div>
                <div 
                  className="absolute left-[51%] w-[4.5%] h-6 bg-slate-300 text-slate-700 font-bold text-[9px] rounded-lg flex items-center justify-center"
                  title="Higienização obrigatória: 15 min"
                >
                  15m
                </div>
                <div 
                  className="absolute left-[56%] w-[25%] h-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                  title="PAC-052: Protocolo Rápido (60 min)"
                >
                  PAC-052 (60m)
                </div>
              </div>
            </div>

            {/* Poltrona 03 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Armchair className="w-3.5 h-3.5 text-teal-700" />
                <span className="text-xs font-bold text-slate-700">Poltrona 03</span>
              </div>
              <div className="h-8 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex items-center">
                <div 
                  className="absolute left-[25%] w-[18%] h-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                  title="PAC-018: Ana Beatriz Nogueira - Pembrolizumabe (60 min)"
                >
                  PAC-018 (60m)
                </div>
                <div 
                  className="absolute left-[43%] w-[4.5%] h-6 bg-slate-300 text-slate-700 font-bold text-[9px] rounded-lg flex items-center justify-center"
                  title="Higienização obrigatória: 15 min"
                >
                  15m
                </div>
                <div 
                  className="absolute left-[48%] w-[28%] h-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                  title="PAC-088: Protocolo Intermediário (120 min)"
                >
                  PAC-088 (120m)
                </div>
              </div>
            </div>

            {/* Poltrona 04 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Armchair className="w-3.5 h-3.5 text-teal-700" />
                <span className="text-xs font-bold text-slate-700">Poltrona 04</span>
              </div>
              <div className="h-8 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex items-center">
                <div 
                  className="absolute left-[31%] w-[27%] h-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                  title="PAC-024: João Pedro Alcântara - AC-T (150 min)"
                >
                  PAC-024: João Pedro (150m)
                </div>
                <div 
                  className="absolute left-[58%] w-[4.5%] h-6 bg-slate-300 text-slate-700 font-bold text-[9px] rounded-lg flex items-center justify-center"
                  title="Higienização obrigatória: 15 min"
                >
                  15m
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
