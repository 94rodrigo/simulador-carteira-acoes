import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

export type Ativo = {
  ticker: string;
  percentual: number;
};

interface PieChartCarteiraProps {
  ativos: Ativo[];
}

export default function PieChartCarteira({ ativos }: PieChartCarteiraProps) {
  return (
    <PieChart width={400} height={300}>
      <Pie
        data={ativos}
        dataKey="percentual"
        nameKey="ticker"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {ativos.map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>
      <Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const { ticker, percentual } = payload[0].payload;
            return (
              <div className="rounded-xl shadow-lg border border-gray-700 bg-gray-900/90 px-4 py-3 min-w-[160px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="block w-3 h-3 rounded-full" style={{ background: payload[0].color }} />
                  <span className="font-semibold text-white">{ticker}</span>
                </div>
                <div className="text-blue-400 text-lg font-bold">{percentual}%</div>
                <div className="text-xs text-gray-400 mt-1">Percentual da carteira</div>
              </div>
            );
          }
          return null;
        }}
        wrapperStyle={{ borderRadius: 12, boxShadow: "none" }}
      />
      <Legend wrapperStyle={{ color: '#fff' }} />
    </PieChart>
  );
}
