import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../lib/supabaseClient";
import api from "../lib/api";
import WorkoutList from "../components/WorkoutList";
import AIInsightCard from "../components/AIInsightCard";
import WorkoutForm from "../components/WorkoutForm";
import WeeklyVolumeChart from "../components/charts/WeeklyVolumeChart";
import MuscleGroupChart from "../components/charts/MuscleGroupChart";
import ProgressLineChart from "../components/charts/ProgressLineChart";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Workout } from "../types";

const DashboardPage: React.FC = () => {
  const { user, signOut, isGuest } = useAuthStore();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [workoutsError, setWorkoutsError] = useState<string | null>(null);

  const [aiSummary, setAiSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [stats, setStats] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [aiModalData, setAiModalData] = useState<Workout | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user]);

  const fetchWorkouts = React.useCallback(async () => {
    setWorkoutsLoading(true);
    setWorkoutsError(null);
    try {
      const res = await api.get("/workouts");
      setWorkouts(res.data);
    } catch (e: unknown) {
      console.error(e);
      const err = e as any;
      setWorkoutsError(err?.response?.data?.detail || "Failed to load workouts");
      toast.error(workoutsError || "Error fetching workouts");
    } finally {
      setWorkoutsLoading(false);
    }
  }, [workoutsError]);

  const fetchWeeklySummary = React.useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await api.get("/ai/weekly-summary");
      setAiSummary(res.data.narrative);
    } catch (e: unknown) {
      console.error(e);
      const err = e as any;
      setSummaryError(err?.response?.data?.detail || "Failed to load summary");
      toast.error(summaryError || "Error fetching AI summary");
    } finally {
      setSummaryLoading(false);
    }
  }, [summaryError]);

  useEffect(() => {
    fetchWorkouts();
    fetchWeeklySummary();
  }, [fetchWorkouts, fetchWeeklySummary]);
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const handleCreateWorkout = () => {
    setShowForm(true);
  };

  const statsDerived = () => {
    // derive sample stats from workouts
    return {
      totalThisMonth: workouts.length,
      totalVolumeThisWeek: 0,
      streak: 0,
      avgDuration: 0,
    };
  };

  return (
    <div className="flex h-screen bg-neutral-darkest text-neutral-lightest">
      {/* sidebar */}
      <nav className="w-60 bg-neutral-darker border-r border-neutral-medium flex flex-col justify-between">
        <div className="p-6">
          <h2 className="text-primary-base text-2xl font-heading">FitTrack</h2>
          <ul className="mt-10 space-y-4">
            <li className="text-neutral-lightgray flex items-center space-x-2">
              <span>🏠</span> <span>Dashboard</span>
            </li>
          </ul>
        </div>
        <div className="p-6">
          {user && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-neutral-medium rounded-full"></div>
              <span className="text-sm">{user.email}</span>
            </div>
          )}
          <button onClick={signOut} className="mt-4 text-semantic-danger">
            Sign Out
          </button>
        </div>
      </nav>
      <div className="flex-1 overflow-auto p-6">
        {isGuest && (
          <div className="w-full bg-accent-base text-accent-highlight p-3 flex justify-between items-center">
            <span>
              Guest account — data may be reset periodically. Sign up to save your
              progress.
            </span>
            <button
              onClick={() => navigate("/")}
              className="bg-primary-base text-black px-3 py-1 rounded"
            >
              Sign Up Free
            </button>
          </div>
        )}
        {workoutsLoading && <p>Loading workouts…</p>}
        {workoutsError && (
          <div className="text-red-500">
            Error: {workoutsError}{" "}
            <button onClick={fetchWorkouts} className="underline">
              retry
            </button>
          </div>
        )}
        {summaryLoading && <p>Loading summary…</p>}
        {summaryError && (
          <div className="text-red-500">
            Error: {summaryError}{" "}
            <button onClick={fetchWeeklySummary} className="underline">
              retry
            </button>
          </div>
        )}
        <header className="flex justify-between items-center my-6">
          <div>
            <h1 className="text-2xl font-[Barlow_Condensed]">
              Good {greeting()}, {user?.email?.split("@")[0]}
            </h1>
            <p className="text-neutral-lightgray">{new Date().toLocaleDateString()}</p>
          </div>
          <button
            onClick={handleCreateWorkout}
            className="bg-primary-base px-4 py-2 rounded"
          >
            + Log Workout
          </button>
        </header>
        {/* stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-dark border border-neutral-medium p-4">
            <h3 className="text-semantic-success text-3xl font-heading">
              {statsDerived().totalThisMonth}
            </h3>
            <p>Total workouts this month</p>
          </div>
          <div className="bg-neutral-dark border border-neutral-medium p-4">
            <h3 className="text-secondary-bright text-3xl font-heading">0</h3>
            <p>Total volume kg this week</p>
          </div>
          <div className="bg-neutral-dark border border-neutral-medium p-4">
            <h3 className="text-accent-bright text-3xl font-heading">0</h3>
            <p>Active streak days</p>
          </div>
          <div className="bg-neutral-dark border border-neutral-medium p-4">
            <h3 className="text-neutral-lightest text-3xl font-heading">0</h3>
            <p>Avg session duration minutes</p>
          </div>
        </div>
        {/* charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-dark border border-neutral-medium p-4">
            <WeeklyVolumeChart data={workouts} />
          </div>
          <div className="bg-neutral-dark border border-neutral-medium p-4">
            <MuscleGroupChart data={workouts} />
          </div>
        </div>
        <div className="bg-neutral-dark border border-neutral-medium p-4 mb-6">
          <ProgressLineChart data={workouts} />
        </div>
        <div className="bg-neutral-dark border-l-4 border-secondary-bright p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-secondary-bright">🤖</span>
            <h2 className="font-[Barlow_Condensed] text-xl">
              This Week's AI Analysis
            </h2>
          </div>
          <p className="mt-2 text-neutral-light">{aiSummary || "Loading..."}</p>
          <button
            onClick={fetchWeeklySummary}
            className="mt-4 border border-secondary-bright text-secondary-bright px-3 py-1 rounded"
          >
            Refresh Analysis
          </button>
        </div>
        <WorkoutList
          workouts={workouts.slice(0, 5)}
          onAnalyze={(item) => setAiModalData(item)}
        />
      </div>
      {showForm && <WorkoutForm onClose={() => { setShowForm(false); fetchWorkouts(); }} />}
      {aiModalData && (
        <AIInsightCard
          workout={aiModalData}
          onClose={() => setAiModalData(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
