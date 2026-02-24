import React from "react";
import { Workout } from "../../types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface Props {
  data: Workout[];
}

const COLORS = ["#22c55e", "#6366f1", "#f59e0b", "#f43f5e", "#06b6d4"];

const MuscleGroupChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-neutral-light">No muscle group data</p>;
  }
  const counts: Record<string, number> = {};
  data.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      counts[ex.muscle_group || ""] = (counts[ex.muscle_group || ""] || 0) + 1;
    });
  });
  const chartData = Object.entries(counts).map(([key, value]) => ({ name: key, value }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46" }} itemStyle={{ color: "#f4f4f5" }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MuscleGroupChart;
