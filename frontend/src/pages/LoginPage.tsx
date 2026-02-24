import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loginAsGuest, loading } = useAuthStore();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "sign-in") {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  const handleGuest = async () => {
    await loginAsGuest();
    if (!user) {
      // loginAsGuest handles toast
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-neutral-darkest relative">
        <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-light px-8">
          <h1 className="text-5xl font-heading font-bold text-primary-base">FitTrack Pro</h1>
          <p className="mt-4">Track. Analyze. Improve.</p>
          <div className="mt-8 space-y-2">
            <p>Log workouts effortlessly</p>
            <p>Get AI-powered analysis</p>
            <p>Visualize your progress</p>
          </div>
        </div>
      </div>
      <div className="w-1/2 bg-neutral-darker flex items-center justify-center">
        <div className="w-full max-w-md bg-neutral-darker border border-neutral-medium p-8 rounded">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 ${mode === "sign-in" ? "border-b-2 border-secondary-bright" : "opacity-60"}`}
              onClick={() => setMode("sign-in")}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 ${mode === "sign-up" ? "border-b-2 border-secondary-bright" : "opacity-60"}`}
              onClick={() => setMode("sign-up")}
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full bg-neutral-dark text-neutral-lightest px-3 py-2 rounded focus:outline-none"
                placeholder=" "
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-2 text-neutral-lightgray peer-focus:top-[-8px] peer-focus:text-neutral-light transition-all"
              >
                Email
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full bg-neutral-dark text-neutral-lightest px-3 py-2 rounded focus:outline-none"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-2 text-neutral-lightgray peer-focus:top-[-8px] peer-focus:text-neutral-light transition-all"
              >
                Password
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary-base text-neutral-darkest rounded"
            >
              {mode === "sign-in" ? "Sign In" : "Sign Up"}
            </button>
          </form>
          <div className="mt-6">
            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full py-2 bg-neutral-medium text-accent-bright rounded flex items-center justify-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 000 2h2v10H3a1 1 0 000 2h14a1 1 0 000-2h-2V6h2a1 1 0 000-2H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{loading ? "Please wait..." : "Continue as Guest"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
