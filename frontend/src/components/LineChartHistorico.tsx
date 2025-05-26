import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import React from "react";

interface LineChartHistoricoProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  customTooltip?: ((props: any) => React.ReactNode);
}

const LineChartHistorico: React.FC<LineChartHistoricoProps> = ({ data, lines, customTooltip }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="date" hide={false} tick={{ fill: '#fff' }} axisLine={{ stroke: '#374151' }} tickLine={{ stroke: '#374151' }} />
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
);

export default LineChartHistorico;
