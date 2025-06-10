import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import React, { useEffect, useState } from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import type { StockInformacoes } from "../types/StockInformacoes";

interface Ativo {
  ticker: string;
  percentual: number;
}

interface HistoricoItem {
  stock: string;
  date: number;
  adjustedClose: number;
}

interface LineChartHistoricoProps {
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  customTooltip?: (props: any) => React.ReactNode;
  ativos: Ativo[];
  historicoStock: StockInformacoes[][];
}

// Função utilitária para formatar timestamp (segundos) para dd/MM/yyyy
function formatarData(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function dataFormatadaParaNumero(dataFormatada: string): number {
  const partes = dataFormatada.split('/');
  if (partes.length !== 3) return 0;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);
  return Math.floor(new Date(ano, mes, dia).getTime() / 1000);
}

function calcularHistoricoCarteira(ativos: Ativo[], historicoStock: HistoricoItem[][], datasRange: [number, number] | null): Array<{ date: number; variacaoPercentual: number }> {
  const ativosComHistorico = ativos.map(ativo => {
    var historico1 = historicoStock.find(h => h.length > 0 && h[0].stock === ativo.ticker);
    if (!historico1 || historico1.length === 0) return null;
    // Filtrar datas dentro do range
    historico1 = historico1.filter(item => {
      if (datasRange && item.date < datasRange[0]) return false;
      if (datasRange && item.date > datasRange[1]) return false;
      return true;
    });
    if (historico1.length === 0) return null;
    const inicial = historico1[0].adjustedClose;
    return historico1.map(item => ({
      date: item.date,
      variacao: ((item.adjustedClose / inicial) - 1) * 100 * (ativo.percentual / 100)
    }));
  }).filter(Boolean) as { date: number; variacao: number }[][];
  const variacoesPorData: { [date: number]: number } = {};
  ativosComHistorico.forEach(historico => {
    historico.forEach(({ date, variacao }) => {
      variacoesPorData[date] = (variacoesPorData[date] || 0) + variacao;
    });
  });
  
  return Object.entries(variacoesPorData)
    .map(([date, variacaoPercentual]) => ({
      date: Number(date),
      variacaoPercentual: variacaoPercentual
    }))
    .sort((a, b) => a.date - b.date);
}

const LineChartHistorico: React.FC<LineChartHistoricoProps> = ({ lines, customTooltip, ativos, historicoStock }) => {
  
  const [historicoBase, setHistoricoBase] = useState<Array<{ date: number; variacaoPercentual: number }>>(() => calcularHistoricoCarteira(ativos, historicoStock, null));
  const [historicoCompleto, setHistoricoCompleto] = useState<Array<{ date: number; variacaoPercentual: number }>>([]);
  const [range, setRange] = useState<[number, number]>([0, historicoBase.length > 0 ? historicoBase.length - 1 : 0]);
  const [rangeDatas, setRangeDatas] = useState<[number, number] | null>(null);

  // Atualiza o histórico base quando ativos ou histórico bruto mudam
  useEffect(() => {
    const base = calcularHistoricoCarteira(ativos, historicoStock, null);
    setHistoricoBase(base);
    setRange([0, base.length > 0 ? base.length - 1 : 0]);
    setRangeDatas(null);
  }, [ativos, historicoStock]);

  // Atualiza o histórico filtrado quando rangeDatas muda
  useEffect(() => {
    if (rangeDatas) {
      const novoHistorico = calcularHistoricoCarteira(ativos, historicoStock, rangeDatas);
      setHistoricoCompleto(novoHistorico);
    } else {
      setHistoricoCompleto(historicoBase);
    }
  }, [ativos, historicoStock, rangeDatas, historicoBase]);

  const xDates = historicoBase.map((d: { date: number }) => d.date);
  const formattedDates = xDates.map(formatarData);

  const handleSliderChange = (values: number | number[]) => {
    if (Array.isArray(values) && values.length === 2) {
      setRange([values[0], values[1]]);
    }
  };

  const handleSliderChangeComplete = () => {
    setRangeDatas([
      dataFormatadaParaNumero(formattedDates[range[0]]),
      dataFormatadaParaNumero(formattedDates[range[1]]) + 86400
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historicoCompleto}>
          <XAxis 
            dataKey="date" 
            hide={false} 
            tick={{ fill: '#fff' }} 
            axisLine={{ stroke: '#374151' }} 
            tickLine={{ stroke: '#374151' }} 
            tickFormatter={formatarData}
          />
          <YAxis domain={["auto", "auto"]} tick={{ fill: '#fff' }} axisLine={{ stroke: '#374151' }} tickLine={{ stroke: '#374151' }} />
          <Tooltip content={customTooltip ? customTooltip : undefined} contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151' }} wrapperStyle={{ borderRadius: 8 }} />
          {lines.map((line, _) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
            />
          ))}
          <Legend wrapperStyle={{ color: '#fff' }} />
        </LineChart>
      </ResponsiveContainer>
      {/* Range Slider Duplo funcional com rc-slider */}
      <div className="w-full flex flex-col items-center gap-2 mt-2">
        <div className="w-full flex items-center gap-2 relative h-12">
          <span className="text-xs text-gray-300 min-w-[70px]">{formattedDates[range[0]]}</span>
          <div className="flex-1 px-2">
            <Slider
              range
              min={0}
              max={xDates.length - 1}
              value={range}
              onChange={handleSliderChange}
              onChangeComplete={handleSliderChangeComplete}
              allowCross={false}
              styles={{
                track: { background: 'linear-gradient(to right, #3b82f6, #22c55e)', height: 8 },
                handle: { borderColor: '#3b82f6', backgroundColor: '#3b82f6', width: 22, height: 22, marginTop: -7, boxShadow: '0 0 0 4px #3b82f633' },
                rail: { backgroundColor: '#374151', height: 8 }
              }}
            />
          </div>
          <span className="text-xs text-gray-300 min-w-[70px] text-right">{formattedDates[range[1]]}</span>
        </div>
        <div className="w-full flex justify-between text-[10px] text-gray-400 px-1 select-none">
          <span>{formattedDates[0]}</span>
          <span>{formattedDates[formattedDates.length - 1]}</span>
        </div>
      </div>
    </div>
  );
};

export default LineChartHistorico;
