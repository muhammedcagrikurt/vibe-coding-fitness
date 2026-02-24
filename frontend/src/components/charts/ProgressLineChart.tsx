import React from "react";
import { Workout } from "../../types";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, ReferenceLine } from "recharts";

interface Props {
  data: Workout[];
}

const ProgressLineChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-neutral-light">No progress data</p>;
  }
  const chartData = data.map((w) => ({
    date: w.date,
    score: w.ai_analysis?.overall_score || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" stroke="#a1a1aa" />
        <Tooltip contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46" }} itemStyle={{ color: "#f4f4f5" }} />
        <ReferenceLine y={7} stroke="#f59e0b" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="score" stroke="#6366f1" fill="#6366f1" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressLineChart;
