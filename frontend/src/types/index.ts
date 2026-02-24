export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  muscle_group?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  title: string;
  date: string; // ISO date
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  exercises: Exercise[];
  ai_analysis?: AIAnalysis;
}

export interface AIAnalysis {
  id: string;
  workout_id: string;
  user_id: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  next_session_tips?: string;
  overall_score: number;
  created_at: string;
}

export interface SessionResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user: { id: string; email?: string };
}
