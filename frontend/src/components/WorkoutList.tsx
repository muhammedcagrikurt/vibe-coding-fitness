import React from "react";
import { Workout } from "../types";

interface WorkoutListProps {
  workouts: Workout[];
  onAnalyze: (workout: Workout) => void;
}

const colorMap: Record<string, string> = {
  chest: "bg-red-500",
  back: "bg-indigo-500",
  legs: "bg-green-500",
  shoulders: "bg-amber-500",
  arms: "bg-pink-500",
  core: "bg-cyan-500",
  cardio: "bg-orange-500",
  full_body: "bg-purple-500",
};

const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, onAnalyze }) => {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl">No workouts yet</p>
        <p className="text-neutral-light">Start tracking to unlock AI insights and progress charts</p>
        <button className="mt-4 px-4 py-2 bg-primary-base text-black rounded">
          Log Your First Workout
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {workouts.map((w: Workout) => (
        <div key={w.id} className="bg-neutral-dark p-4 rounded border border-neutral-medium">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-neutral-lightest">{w.title}</h3>
              <p className="text-neutral-light">
                {w.date} • {w.duration_minutes || 0} min • {w.exercises?.length || 0} exercises
              </p>
              <div className="flex space-x-1 mt-1">
                {(w.exercises || []).map((ex, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-1 rounded ${colorMap[ex.muscle_group] || "bg-gray-500"}`}
                  >
                    {ex.muscle_group}
                  </span>
                ))}
              </div>
            </div>
            <button
              className="px-3 py-1 border border-secondary-bright text-secondary-bright rounded"
              onClick={() => onAnalyze(w)}
            >
              Analyze with AI
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutList;
