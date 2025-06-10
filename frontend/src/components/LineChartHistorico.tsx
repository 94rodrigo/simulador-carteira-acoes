import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import React, { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import type { StockInformacoes } from "../types/StockInformacoes";
import axios from "axios";

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
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function dataFormatadaParaNumero(dataFormatada: string): number {
  const partes = dataFormatada.split("/");
  if (partes.length !== 3) return 0;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);
  return Math.floor(new Date(ano, mes, dia).getTime() / 1000);
}

async function calcularHistoricoCarteira(
  ativos: Ativo[],
  historicoStock: HistoricoItem[][],
  datasRange: [number, number] | null
): Promise<{ date: number; variacaoPercentual: number }[]> {
  return await axios
    .post("http://localhost:8080/api/calcular-historico", {
      ativos: ativos,
      historicoStock: historicoStock,
      datasRange: datasRange,
    })
    .then((response) => response.data)
    .then((respose) =>
      respose.map((item: { date: number; variacaoPercentual: number }) => ({
        date: item.date,
        variacaoPercentual: item.variacaoPercentual,
      }))
    );
}

const LineChartHistorico: React.FC<LineChartHistoricoProps> = ({
  lines,
  customTooltip,
  ativos,
  historicoStock,
}) => {
  const [historicoBase, setHistoricoBase] = useState<
    Array<{ date: number; variacaoPercentual: number }>
  >([]);
  const [historicoCompleto, setHistoricoCompleto] = useState<
    Array<{ date: number; variacaoPercentual: number }>
  >([]);
  const [range, setRange] = useState<[number, number]>([
    0,
    historicoBase.length > 0 ? historicoBase.length - 1 : 0,
  ]);
  const [rangeDatas, setRangeDatas] = useState<[number, number] | null>(null);

  // Atualiza o histórico base quando ativos ou histórico bruto mudam
  useEffect(() => {
    let isMounted = true; // Flag para evitar atualizações após desmontagem
    calcularHistoricoCarteira(ativos, historicoStock, null).then((base) => {
      if (isMounted) {
        setHistoricoBase(base);
        setRange([0, base.length > 0 ? base.length - 1 : 0]);
        setRangeDatas(null);
      }
    });
    return () => {
      isMounted = false;
    }; // Limpa a flag ao desmontar o componente
  }, [ativos, historicoStock]);

  // Atualiza o histórico filtrado quando rangeDatas muda
  useEffect(() => {
    let isMounted = true;
    if (rangeDatas) {
      calcularHistoricoCarteira(ativos, historicoStock, rangeDatas).then(
        (novoHistorico) => {
          if (isMounted) {
            setHistoricoCompleto(novoHistorico);
          }
        }
      );
    } else {
      setHistoricoCompleto(historicoBase);
    }
    return () => {
      isMounted = false;
    };
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
      dataFormatadaParaNumero(formattedDates[range[1]]) + 86400,
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historicoCompleto}>
          <XAxis
            dataKey="date"
            hide={false}
            tick={{ fill: "#fff" }}
            axisLine={{ stroke: "#374151" }}
            tickLine={{ stroke: "#374151" }}
            tickFormatter={formatarData}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#fff" }}
            axisLine={{ stroke: "#374151" }}
            tickLine={{ stroke: "#374151" }}
          />
          <Tooltip
            content={customTooltip ? customTooltip : undefined}
            contentStyle={{
              backgroundColor: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            }}
            wrapperStyle={{ borderRadius: 8 }}
          />
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
          <Legend wrapperStyle={{ color: "#fff" }} />
        </LineChart>
      </ResponsiveContainer>
      {/* Range Slider Duplo funcional com rc-slider */}
      <div className="w-full flex flex-col items-center gap-2 mt-2">
        <div className="w-full flex items-center gap-2 relative h-12">
          <span className="text-xs text-gray-300 min-w-[70px]">
            {formattedDates[range[0]]}
          </span>
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
                track: {
                  background: "linear-gradient(to right, #3b82f6, #22c55e)",
                  height: 8,
                },
                handle: {
                  borderColor: "#3b82f6",
                  backgroundColor: "#3b82f6",
                  width: 22,
                  height: 22,
                  marginTop: -7,
                  boxShadow: "0 0 0 4px #3b82f633",
                },
                rail: { backgroundColor: "#374151", height: 8 },
              }}
            />
          </div>
          <span className="text-xs text-gray-300 min-w-[70px] text-right">
            {formattedDates[range[1]]}
          </span>
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
