import React from "react";
import { Workout } from "../../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

interface Props {
  data: Workout[];
}

const WeeklyVolumeChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-neutral-light">No volume data</p>;
  }
  const formatted = data.map((w) => ({
    name: new Date(w.date).toLocaleDateString("en-US", { weekday: "short" }),
    volume:
      w.exercises?.reduce(
        (sum, ex) => sum + (ex.weight_kg || 0) * (ex.reps || 0) * (ex.sets || 0),
        0
      ) || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted}>
        <XAxis dataKey="name" stroke="#a1a1aa" />
        <Tooltip
          contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46" }}
          itemStyle={{ color: "#f4f4f5" }}
        />
        <Bar dataKey="volume" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyVolumeChart;
