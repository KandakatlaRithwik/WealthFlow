import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Target, Flame, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Graphic hero panel */}
      <div className="hidden lg:flex relative flex-col justify-between w-1/2 p-12 overflow-hidden gradient-brand text-white">
        <div className="absolute -top-28 -right-16 h-[26rem] w-[26rem] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        {/* Oversized faint logo watermark bleeding off the corner */}
        <Logo size={340} id="wf-watermark" className="watermark absolute -bottom-20 -right-20 opacity-[0.08] rotate-[-8deg]" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center p-1.5">
            <Logo size={26} id="wf-logo-sidebar" />
          </div>
          <span className="font-display italic tracking-tight text-xl">WealthFlow</span>
        </div>

        <div className="relative">
          <p className="text-4xl font-display italic leading-snug max-w-md drop-shadow-sm">
            Don't just track money. Build the habits that grow it.
          </p>
          <p className="mt-4 text-white/80 max-w-sm text-sm">
            Income, expenses, habits, goals, and net worth — in one connected view of your financial life.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
            <FloatingCard icon={TrendingUp} label="Net Worth" value="+8.4%" accent="#16A34A" />
            <FloatingCard icon={Flame} label="Save Streak" value="24 days" accent="#B4830D" />
            <FloatingCard icon={Target} label="Emergency Fund" value="72%" accent="#0D9488" />
            <FloatingCard icon={Wallet} label="This Month" value="₹22,000 saved" accent="#1D4ED8" />
          </div>
        </div>

        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} WealthFlow</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative bg-dot-grid">
        <form onSubmit={submit} className="relative w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Logo size={36} id="wf-logo-mobile" />
            <span className="font-display italic tracking-tight text-xl text-ink-700">WealthFlow</span>
          </div>

          <h1 className="text-2xl font-display italic text-ink-700">Welcome back</h1>
          <p className="text-sm text-ink-300 mt-1 mb-6">Log in to continue building your financial habits.</p>

          {error && <div className="mb-4 text-sm bg-rust-100 text-rust px-3 py-2 rounded-lg">{error}</div>}

          <label className="block text-sm text-ink-500 mb-1.5">Email</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            placeholder="you@example.com"
          />

          <label className="block text-sm text-ink-500 mb-1.5">Password</label>
          <input
            type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field"
            placeholder="••••••••"
          />

          <button disabled={loading} className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl disabled:opacity-60 focus-ring">
            {loading ? 'Logging in…' : 'Log in'}
          </button>

          <p className="text-sm text-ink-300 mt-5 text-center">
            No account? <Link to="/register" className="text-brand font-medium hover:underline">Create one</Link>
          </p>
          <p className="text-xs text-ink-300/70 mt-3 text-center">Demo: arjun.rao@example.com / Password123!</p>
        </form>
      </div>
    </div>
  );
}

function FloatingCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl p-3.5 bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}1A` }}>
        <Icon size={15} strokeWidth={2.2} style={{ color: accent }} />
      </span>
      <p className="text-[11px] mt-2 text-slate-400 font-medium">{label}</p>
      <p className="text-sm font-display italic text-slate-800">{value}</p>
    </div>
  );
}
