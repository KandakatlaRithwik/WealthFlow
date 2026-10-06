import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', occupation: user?.occupation || '',
    currency: user?.currency || 'INR', monthlyIncomeTarget: user?.monthlyIncomeTarget || 0, monthlySavingsTarget: user?.monthlySavingsTarget || 0,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/profile', form);
    setUser(data.user);
    localStorage.setItem('wf_user', JSON.stringify(data.user));
    setMsg('Profile updated.');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    await api.put('/profile/password', pwForm);
    setPwForm({ currentPassword: '', newPassword: '' });
    setMsg('Password updated.');
  };

  return (
    <AppLayout title="Profile & Settings">
      {msg && <div className="mb-4 text-sm bg-growth-100 text-growth-600 px-3 py-2 rounded-lg inline-block">{msg}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <form onSubmit={saveProfile} className="card p-5 space-y-3">
          <h3 className="text-sm font-medium text-ink-700 mb-1">Personal information</h3>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="input-field" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input-field" />
          <input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Occupation" className="input-field" />
          <h3 className="text-sm font-medium text-ink-700 pt-2">Financial preferences</h3>
          <input type="number" value={form.monthlyIncomeTarget} onChange={(e) => setForm({ ...form, monthlyIncomeTarget: Number(e.target.value) })} placeholder="Monthly income target" className="input-field" />
          <input type="number" value={form.monthlySavingsTarget} onChange={(e) => setForm({ ...form, monthlySavingsTarget: Number(e.target.value) })} placeholder="Monthly savings target" className="input-field" />
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">Save changes</button>
        </form>

        <form onSubmit={changePassword} className="card p-5 space-y-3 h-fit">
          <h3 className="text-sm font-medium text-ink-700 mb-1">Security</h3>
          <input type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="Current password" className="input-field" />
          <input type="password" required minLength={8} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="New password" className="input-field" />
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">Change password</button>
        </form>
      </div>
    </AppLayout>
  );
}
