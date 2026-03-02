"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-500 text-sm mt-1">Join the task manager</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Username *</label>
            <input
              type="text"
              placeholder="Choose a username (min 3 chars)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-glass"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Password *</label>
            <input
              type="password"
              placeholder="Choose a password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Email (for reminders)</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Phone (for WhatsApp reminders)</label>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-glass"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                Creating account...
              </span>
            ) : (
              "Create Account →"
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>
          )}

          <p className="text-center text-sm text-slate-500 mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
