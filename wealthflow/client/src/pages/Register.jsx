import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await register(form);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-paper bg-dot-grid relative overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/[0.06] blur-3xl watermark" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-2/[0.06] blur-3xl watermark" />
      <Logo size={300} id="wf-reg-watermark" className="watermark absolute -bottom-16 -left-16 opacity-[0.05] rotate-[8deg]" />

      <form onSubmit={submit} className="relative w-full max-w-sm card p-8 shadow-glow">
        <div className="flex items-center gap-2.5 mb-6">
          <Logo size={36} id="wf-logo-register" />
          <span className="font-display italic tracking-tight text-lg text-ink-700">WealthFlow</span>
        </div>

        <h1 className="text-2xl font-display italic text-ink-700">Create your account</h1>
        <p className="text-sm text-ink-300 mt-1 mb-6">Start building better financial habits today.</p>

        {error && <div className="mb-4 text-sm bg-rust-100 text-rust px-3 py-2 rounded-lg">{error}</div>}

        {[
          { key: 'name', label: 'Full name', type: 'text', placeholder: 'Arjun Rao' },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
          { key: 'password', label: 'Password', type: 'password', placeholder: 'At least 8 characters' },
          { key: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: 'Repeat password' },
        ].map((f) => (
          <div key={f.key} className="mb-4">
            <label className="block text-sm text-ink-500 mb-1.5">{f.label}</label>
            <input
              type={f.type} required value={form[f.key]} onChange={update(f.key)}
              className="input-field"
              placeholder={f.placeholder}
            />
          </div>
        ))}

        <button disabled={loading} className="btn-lift w-full py-2.5 mt-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl disabled:opacity-60 focus-ring">
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-sm text-ink-300 mt-5 text-center">
          Already have an account? <Link to="/login" className="text-brand font-medium hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
