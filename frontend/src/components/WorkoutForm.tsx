import React, { useState } from "react";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import { Exercise, Workout } from "../types";

interface ExerciseRow {
  id: string;
  name: string;
  muscle_group: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  [key: string]: string | number | undefined;
}

interface WorkoutFormProps {
  onClose: () => void;
}

const muscleGroups = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "cardio",
  "full_body",
];

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [duration, setDuration] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const addRow = () => {
    setExercises([
      ...exercises,
      { id: crypto.randomUUID(), name: "", muscle_group: "" },
    ]);
  };
  const removeRow = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };
  const updateRow = (idx: number, field: keyof ExerciseRow, value: string | number | undefined) => {
    const copy = [...exercises];
    copy[idx][field] = value;
    setExercises(copy);
  };

  const handleSubmit = async () => {
    // simple client-side validation
    const newErrors: Record<string, string> = {};
    if (!title) newErrors.title = "Title is required";
    if (title && title.length > 100) newErrors.title = "Title max 100 chars";
    if (!date) newErrors.date = "Date is required";
    if (duration && typeof duration === "number" && duration < 0) newErrors.duration = "Must be positive";
    if (exercises.length === 0) newErrors.exercises = "Add at least one exercise";
    exercises.forEach((ex, idx) => {
      if (!ex.name) newErrors[`ex-${ex.id}-name`] = "Name required";
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSubmitting(true);
    try {
      await api.post("/workouts", {
        title,
        date,
        duration_minutes: duration || null,
        notes,
        exercises,
      });
      toast.success("Workout logged");
      onClose();
    } catch (e: unknown) {
      console.error(e);
      const err = e as any;
      toast.error(err?.response?.data?.detail || "Failed to log workout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-neutral-dark p-6 w-full max-w-lg rounded">
        <h2 className="text-xl mb-4">Log Workout</h2>
        <div className="space-y-4">
          <div>
            <input
              className="w-full p-2 bg-neutral-medium"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          <div>
            <input
              type="date"
              className="w-full p-2 bg-neutral-medium"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>
          <div>
            <input
              type="number"
              className="w-full p-2 bg-neutral-medium"
              placeholder="Duration minutes"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
          </div>
          <textarea
            className="w-full p-2 bg-neutral-medium"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div>
            <h3 className="mb-2">Exercises</h3>
            {errors.exercises && <p className="text-red-500 text-sm">{errors.exercises}</p>}
            {exercises.map((ex, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <input
                  className="flex-1 p-2 bg-neutral-medium"
                  placeholder="Name"
                  value={ex.name}
                  onChange={(e) => updateRow(idx, "name", e.target.value)}
                />
                {errors[`ex-${ex.id}-name`] && (
                  <span className="text-red-500 text-sm">
                    {errors[`ex-${ex.id}-name`]}
                  </span>
                )}
                <select
                  className="p-2 bg-neutral-medium"
                  value={ex.muscle_group}
                  onChange={(e) => updateRow(idx, "muscle_group", e.target.value)}
                >
                  <option value="">Group</option>
                  {muscleGroups.map((mg) => (
                    <option key={mg} value={mg}>
                      {mg}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="w-20 p-2 bg-neutral-medium"
                  placeholder="Sets"
                  value={ex.sets || ""}
                  onChange={(e) => updateRow(idx, "sets", Number(e.target.value))}
                />
                <input
                  type="number"
                  className="w-20 p-2 bg-neutral-medium"
                  placeholder="Reps"
                  value={ex.reps || ""}
                  onChange={(e) => updateRow(idx, "reps", Number(e.target.value))}
                />
                <input
                  type="number"
                  className="w-20 p-2 bg-neutral-medium"
                  placeholder="Weight"
                  value={ex.weight_kg || ""}
                  onChange={(e) => updateRow(idx, "weight_kg", Number(e.target.value))}
                />
                <button
                  className="text-red-500"
                  onClick={() => removeRow(idx)}
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              className="mt-2 px-3 py-1 border border-secondary-bright text-secondary-bright rounded"
              onClick={addRow}
            >
              Add Exercise
            </button>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-neutral-medium"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary-base"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutForm;
