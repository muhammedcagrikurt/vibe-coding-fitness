import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import { Workout, AIAnalysis } from "../types";

interface AIInsightCardProps {
  workout: Workout;
  onClose: () => void;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ workout, onClose }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // load existing analysis if present
    const fetch = async () => {
      try {
        const res = await api.get(`/ai/analysis/${workout.id}`);
        setAnalysis(res.data);
      } catch (e: unknown) {
        console.error(e);
        const err = e as any;
        setError(err?.response?.data?.detail || "Failed to load analysis");
      }
    };
    fetch();
  }, [workout]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/ai/analyze/${workout.id}`);
      setAnalysis(res.data);
      toast.success("AI analysis complete");
    } catch (e: unknown) {
      console.error(e);
      const err = e as any;
      setError(err?.response?.data?.detail || "Analysis failed");
      toast.error(error || "AI analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    // still returning hex for svg stroke; these correspond to semantic colors
    if (score >= 8) return "#22c55e"; // semantic.success
    if (score >= 5) return "#f59e0b"; // semantic.warning
    return "#ef4444"; // semantic.danger
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-neutral-dark p-6 w-full max-w-md rounded relative">
        <button className="absolute top-2 right-2" onClick={onClose}>
          &times;
        </button>
        {error && (
          <div className="text-red-500 mb-2">
            {error}{" "}
            <button onClick={runAnalysis} className="underline">
              retry
            </button>
          </div>
        )}
        {analysis ? (
          <div>
            <div className="flex flex-col items-center mb-4">
              <svg width="120" height="60" viewBox="0 0 120 60">
                <path
                  d="M10,50 A50,50 0 0,1 110,50"
                  fill="none"
                  stroke={scoreColor(analysis.overall_score)}
                  strokeWidth="10"
                />
                <text x="60" y="40" textAnchor="middle" fontFamily="Barlow Condensed" fontSize="24" fill="white">
                  {analysis.overall_score}
                </text>
              </svg>
            </div>
            <div className="mb-2">
              <h4 className="text-semantic-success">Strengths</h4>
              <ul className="list-disc ml-4">
                {analysis.strengths.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <h4 className="text-accent-bright">Improvements</h4>
              <ul className="list-disc ml-4">
                {analysis.improvements.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <h4 className="text-secondary-bright">Next Session Tip</h4>
              <p>{analysis.next_session_tips}</p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>No analysis yet.</p>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="mt-4 px-4 py-2 border border-secondary-bright text-secondary-bright rounded"
            >
              {loading ? "Analyzing..." : "Analyze with AI"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightCard;
